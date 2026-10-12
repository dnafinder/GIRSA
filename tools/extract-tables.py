#!/usr/bin/env python3
"""
Estrae le tabelle di attacco, dei colpi critici, dei fallimenti e delle armi dai PDF del compendio
«Istaro Quettar» (Tabelle_dattacco.pdf e Colpi_Critici.pdf) e scrive js/tabledata.js.

Uso:  python3 tools/extract-tables.py ATTACCO.pdf CRITICI.pdf [ARMI.pdf [MIRATI.pdf]]
Con ARMI.pdf (tabella TSC-1) scrive anche js/weapondata.js.
Con MIRATI.pdf (Colpi Critici Mirati da Punta) aggiunge a tabledata.js le tabelle TCM-1…TCM-4.
Richiede: poppler (pdftotext) e pdfplumber.
I PDF non fanno parte del repository.
"""
import json, re, subprocess, sys, os
import pdfplumber

ARMORS = ['Corazza di piastre', 'Corazza di maglie', 'Cuoio rinforzato', 'Cuoio grezzo', 'Nessuna armatura']
CELL = re.compile(r'^(\d+)([TABCDE])?$')
SPLIT = 75  # colonna di testo (pdftotext -layout) che separa la tabella di sinistra da quella di destra


def cell(tok):
    if tok == 'F':
        return {'pf': 0, 'crit': None, 'fail': True}
    m = CELL.match(tok)
    if not m:
        raise ValueError('cella non valida: ' + tok)
    return {'pf': int(m.group(1)), 'crit': m.group(2)}


def attack_tables(pdf_path):
    text = subprocess.run(['pdftotext', '-layout', pdf_path, '-'], capture_output=True, text=True, check=True).stdout
    tables = {}
    cur = {'L': None, 'R': None}
    pending = {'L': [], 'R': []}   # righe TI in attesa di un'etichetta di limite
    hdr = re.compile(r'(?<![(\w])TA-(\d+) ([A-Z][^\n]*?)(?=\s{3,}TA-\d+ [A-Z]|\s*$)')
    for line in text.split('\n'):
        hm = list(hdr.finditer(line))
        if hm:
            for m in hm:
                side = 'R' if m.start() >= SPLIT else 'L'
                tid = 'TA-' + m.group(1)
                if tid not in tables:
                    tables[tid] = {'type': 'attack', 'id': tid, 'name': tid + ' ' + m.group(2).strip(), 'armors': ARMORS,
                                   'fumble': None, 'rows': [], 'ti': [], 'limits': []}
                cur[side] = tid
                pending[side] = []
            continue
        # etichette di limite (taglia o tipo di dardo)
        for m in re.finditer(r'Risultati Massimi (?:con Attacchi|per i Dardi di|per i Dardi) ((?:\S+ ?)+?)(?=\s{2,}|\s*$)', line):
            side = 'R' if m.start() >= SPLIT else 'L'
            t = tables.get(cur[side])
            if not t or not t['rows']:
                continue
            label = m.group(1).strip()
            t['limits'].append({'label': label, 'max': t['rows'][-1]['max']})
            for ti in pending[side]:
                ti['limit'] = label
            pending[side] = []
        toks = [(m.start(), m.group()) for m in re.finditer(r'\S+', line)]
        i = 0
        while i < len(toks):
            pos, tok = toks[i]
            side = 'R' if pos >= SPLIT else 'L'
            t = tables.get(cur[side])
            if t is None:
                i += 1
                continue
            if tok == 'TI' and i + 1 < len(toks):
                rng = toks[i + 1][1].rstrip('*')
                m = re.match(r'^(\d+)(?:-(\d+|xx))?$', rng)
                rest = [x[1] for x in toks[i + 2:i + 7]]
                if m and len(rest) == 5 and all(CELL.match(x) or x == 'F' for x in rest):
                    entry = {'min': int(m.group(1)), 'max': int(m.group(2)) if m.group(2) and m.group(2) != 'xx' else int(m.group(1)),
                             'limit': None, 'cells': [cell(x) for x in rest]}
                    if entry['min'] == 1:      # riga di fallimento con celle F (incantesimi)
                        t['fumble'] = entry['max']
                    else:
                        t['ti'].append(entry)
                        pending[side].append(entry)
                    i += 7
                    continue
                if m and m.group(1) == '01':     # «TI 01-xx Possibilità di Colpo Maldestro» o «TI 01-02 Attacco Fallito»
                    if m.group(2) and m.group(2) != 'xx':
                        t['fumble'] = int(m.group(2))
                i += 2
                continue
            m = re.match(r'^(xx|\d+)-(\d+)$', tok)
            if m:
                rest = [x[1] for x in toks[i + 1:i + 6]]
                if len(rest) == 5 and all(CELL.match(x) or x == 'F' for x in rest):
                    t['rows'].append({'min': None if m.group(1) == 'xx' else int(m.group(1)), 'max': int(m.group(2)),
                                      'cells': [cell(x) for x in rest]})
                    i += 6
                    continue
            i += 1
    # controlli
    for tid, t in tables.items():
        prev = None
        for r in t['rows']:
            if prev is not None and r['min'] != prev + 1:
                raise SystemExit('%s: righe non contigue prima di %s-%s' % (tid, r['min'], r['max']))
            prev = r['max']
    return [tables[k] for k in sorted(tables, key=lambda x: int(x.split('-')[1])) if tables[k]['rows']]


def crit_range(s):
    s = s.strip()
    m = re.match(r'^-\((\d+)\)-(\d+)$', s)
    if m:
        return None, int(m.group(2))
    m = re.match(r'^(\d+)-(\d+)$', s)
    if m:
        return int(m.group(1)), int(m.group(2))
    m = re.match(r'^(\d+)$', s)
    if m:
        return int(m.group(1)), int(m.group(1))
    raise ValueError('intervallo non valido: ' + s)


def clean(t):
    t = re.sub(r'-\n(?=[a-zàèéìòù])', '', t or '')
    return re.sub(r'\s+', ' ', t.replace('\n', ' ')).strip()


def crit_tables(pdf_path):
    out = []
    with pdfplumber.open(pdf_path) as pdf:
        for p in pdf.pages[1:]:
            ts = p.extract_tables()
            if not ts:
                continue
            t = ts[0]
            heads = t[0]
            for c in range(1, len(heads)):
                name = clean(heads[c])
                m = re.match(r'^(TC-\d+|TTM-\d+) (.*)$', name)
                if not m:
                    continue
                rows = []
                for r in t[1:]:
                    if not r[0] or not clean(r[0]):
                        continue
                    mn, mx = crit_range(clean(r[0]))
                    rows.append({'min': mn, 'max': mx, 'text': clean(r[c])})
                prev = None
                for r in rows:
                    if prev is not None and r['min'] != prev + 1:
                        raise SystemExit('%s: righe non contigue prima di %s' % (m.group(1), r['max']))
                    prev = r['max']
                out.append({'type': 'crit', 'id': m.group(1), 'name': name, 'rows': rows})
    return out


def mirati_tables(pdf_path):
    out = []
    with pdfplumber.open(pdf_path) as pdf:
        t = pdf.pages[1].extract_tables()[0]
    heads = t[1]
    for c in range(1, len(heads)):
        m = re.match(r'^(\d)-(.*)$', clean(heads[c]))
        if not m:
            raise SystemExit('intestazione TCM non riconosciuta: ' + str(heads[c]))
        rows = []
        for r in t[2:]:
            if not r[0] or not clean(r[0]):
                continue
            mn, mx = crit_range(clean(r[0]))
            rows.append({'min': mn, 'max': mx, 'text': clean(r[c])})
        prev = None
        for r in rows:
            if prev is not None and r['min'] != prev + 1:
                raise SystemExit('TCM-%s: righe non contigue prima di %s' % (m.group(1), r['max']))
            prev = r['max']
        if len(rows) != 21 or rows[-1]['max'] != 120 or any(not r['text'] for r in rows):
            raise SystemExit('TCM-%s: attese 21 righe fino a 120, tutte con testo' % m.group(1))
        out.append({'type': 'crit', 'id': 'TCM-' + m.group(1), 'name': 'TCM-%s Colpi Critici Mirati da Punta: %s' % (m.group(1), m.group(2).strip()), 'rows': rows})
    return out


GROUPS = [  # (chiave, parola chiave nell'intestazione)
    ('taglio1', 'Armi da Taglio a Una Mano'), ('contund1', 'Armi Contundenti a Una Mano'), ('asta1', 'Armi ad Asta a Una Mano'),
    ('asta2', 'Armi ad Asta a Due Mani'), ('due_mani', 'Armi a Due Mani'), ('lancio', 'Armi da Lancio'), ('tiro', 'Armi da Tiro')]
ROW = re.compile(r'^(?P<n>\S.*?)\s{2,}(?P<cm>\d+)\s+(?P<c1>[A-Z]{2,3}(?:\([TABCDE]\))?)\s+(?P<c2>-|[A-Z]{2,3}(?:\([TABCDE]\))?)\s+(?P<g>-|\d+\*?)\s*(?P<m>.*)$')
# Nel PDF «Tabelle d'attacco con modificatori delle Armi» la Frusta ha «-15 ½PF» solo nelle colonne piastre e maglie:
# il -15 sulla TA vale quindi solo contro quelle due armature (la tabella TSC-1 non lo diceva in modo chiaro).
DALLA_TA = {'contund1-frusta': [{'v': -15, 'arm': [0, 1]}]}
# Azza (Bec de Corbin): la TSC-1 dà -10 sulla TA contro cuoio e nessuna armatura, la TA-10 con i modificatori dà -5.
# Scelta dell'utente (12/10/2026): vale il -5 della TA-10. Il testo stampato resta nella nota, con l'avvertenza.
AZZA_ID = 'asta2-azza-bec-de-corbin'
AZZA_MODS = [{'v': 5, 'arm': [0, 1]}, {'v': -5, 'arm': [2, 3, 4]}]
ARM_IDX = {'piastre': [0], 'maglia': [1], 'maglie': [1], 'cuoio rinf.': [2], 'cuoio': [2, 3], 'na': [4]}


def crit_code(t):
    if t == '-':
        return None
    m = re.match(r'^([A-Z]+)(?:\(([TABCDE])\))?$', t)
    return {'type': m.group(1), 'max': m.group(2)}


def arm_cond(cond, prev):
    """Elenco delle colonne di armatura (0 piastre, 1 maglie, 2 cuoio rinf., 3 cuoio grezzo, 4 nessuna) o None se non riconosciuto."""
    c = cond.strip().lower()
    c = re.sub(r'^(c\.|contro)\s*', '', c)
    if c == 'altre o na':
        return [i for i in range(5) if i not in (prev or [])] if prev else None
    out = []
    for tok in re.split(r'/|\so\s', c):
        tok = tok.strip()
        if tok not in ARM_IDX:
            return None
        out += ARM_IDX[tok]
    return sorted(set(out))


def weapons(pdf_path):
    text = subprocess.run(['pdftotext', '-layout', pdf_path, '-'], capture_output=True, text=True, check=True).stdout
    out, grp, atk, seen = [], None, None, {}
    for line in text.split('\n'):
        for key, head in GROUPS:
            if line.startswith(head) and '(' in line:
                grp = key
                atk = re.search(r'TA-(\d+)', line)
                atk = 'TA-' + atk.group(1)
        m = ROW.match(line.strip()) if grp and not line.startswith('Armi ') else None
        if not m:
            continue
        mods, manual, prev = [], [], None
        note = m.group('m').strip()
        for mm in re.finditer(r'([+\-\u2013])\s?(\d+) sulla TA(?!-\d)(?:\s*\(([^)]*)\))?', note):
            v = int(mm.group(2)) * (1 if mm.group(1) == '+' else -1)
            cond = mm.group(3)
            if cond is None:
                mods.append({'v': v, 'arm': None})
            else:
                arm = arm_cond(cond, prev) if re.match(r'^\s*(c\.|contro)', cond) else None
                if arm is None:
                    manual.append(mm.group(0))
                else:
                    mods.append({'v': v, 'arm': arm})
                    prev = arm
        w = {'id': grp + '-' + re.sub(r'[^a-z0-9]+', '-', m.group('n').lower()).strip('-'), 'n': m.group('n').strip(), 'group': grp, 'atk': atk,
             'cm': int(m.group('cm')), 'c1': crit_code(m.group('c1')), 'c2': crit_code(m.group('c2')),
             'git': None if m.group('g') == '-' else m.group('g'), 'mods': mods, 'manual': manual, 'note': note}
        if w['id'] in DALLA_TA:   # colonne lette nella riga «Modificatori delle Armi» della tabella di attacco (PDF «con modificatori»)
            w['mods'], w['manual'] = DALLA_TA[w['id']], []
        if w['id'] == AZZA_ID:
            w['mods'] = AZZA_MODS
            w['note'] = w['note'] + ' [App: contro cuoio o NA vale -5, come nella TA-10; la TSC-1 stampa -10]'
        t6 = re.search(r'tabella (TA-\d+), Attacco (Medio|Piccolo|Grande|Enorme|Minuscolo)', note)
        if t6:
            w['atk'] = t6.group(1)
            w['limit'] = {'Medio': 'Medi', 'Piccolo': 'Piccoli', 'Grande': 'Grandi', 'Enorme': 'Enormi', 'Minuscolo': 'Minuscoli'}[t6.group(2)]
        if w['id'] in seen:
            raise SystemExit('arma duplicata: ' + w['id'])
        seen[w['id']] = 1
        out.append(w)
    return out


def main():
    if len(sys.argv) not in (3, 4, 5):
        raise SystemExit(__doc__)
    atk = attack_tables(sys.argv[1])
    crit = crit_tables(sys.argv[2])
    if len(sys.argv) == 5:
        crit += mirati_tables(sys.argv[4])
    root = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
    js = ("/* Generato da tools/extract-tables.py dal compendio «Istaro Quettar» (Filduin). Non modificare a mano. Vedi NOTICE.md. */\n"
          "(function (root) {\n  var G = root.GIRSA = root.GIRSA || {};\n  G.tabledata = %s;\n"
          "  if (typeof module !== 'undefined') module.exports = G.tabledata;\n"
          "})(typeof window !== 'undefined' ? window : globalThis);\n") % json.dumps({'atk': atk, 'crit': crit}, ensure_ascii=False, separators=(',', ':'))
    with open(os.path.join(root, 'js', 'tabledata.js'), 'w', encoding='utf-8') as f:
        f.write(js)
    if len(sys.argv) >= 4:
        wp = weapons(sys.argv[3])
        wjs = ("/* Generato da tools/extract-tables.py (tabella TSC-1 del compendio «Istaro Quettar»). Non modificare a mano. Vedi NOTICE.md. */\n"
               "(function (root) {\n  var G = root.GIRSA = root.GIRSA || {};\n  G.weapondata = %s;\n"
               "  if (typeof module !== 'undefined') module.exports = G.weapondata;\n"
               "})(typeof window !== 'undefined' ? window : globalThis);\n") % json.dumps(wp, ensure_ascii=False, separators=(',', ':'))
        with open(os.path.join(root, 'js', 'weapondata.js'), 'w', encoding='utf-8') as f:
            f.write(wjs)
        print('armi:', len(wp), {g: len([x for x in wp if x['group'] == g]) for g, _ in GROUPS})
        for x in wp:
            if x['manual']:
                print('  da applicare a mano:', x['n'], x['manual'])
    print('attacco:', [(t['id'], len(t['rows']), t['fumble'], len(t['ti']), [l['label'] for l in t['limits']]) for t in atk])
    print('critici:', [(t['id'], len(t['rows'])) for t in crit])


main()
