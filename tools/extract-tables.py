#!/usr/bin/env python3
"""
Estrae le tabelle di attacco, dei colpi critici e dei fallimenti dai PDF del compendio
«Istaro Quettar» (Tabelle_dattacco.pdf e Colpi_Critici.pdf) e scrive js/tabledata.js.

Uso:  python3 tools/extract-tables.py ATTACCO.pdf CRITICI.pdf
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


def main():
    if len(sys.argv) != 3:
        raise SystemExit(__doc__)
    atk = attack_tables(sys.argv[1])
    crit = crit_tables(sys.argv[2])
    root = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
    js = ("/* Generato da tools/extract-tables.py dal compendio «Istaro Quettar» (Filduin). Non modificare a mano. Vedi NOTICE.md. */\n"
          "(function (root) {\n  var G = root.GIRSA = root.GIRSA || {};\n  G.tabledata = %s;\n"
          "  if (typeof module !== 'undefined') module.exports = G.tabledata;\n"
          "})(typeof window !== 'undefined' ? window : globalThis);\n") % json.dumps({'atk': atk, 'crit': crit}, ensure_ascii=False, separators=(',', ':'))
    with open(os.path.join(root, 'js', 'tabledata.js'), 'w', encoding='utf-8') as f:
        f.write(js)
    print('attacco:', [(t['id'], len(t['rows']), t['fumble'], len(t['ti']), [l['label'] for l in t['limits']]) for t in atk])
    print('critici:', [(t['id'], len(t['rows'])) for t in crit])


main()
