#!/usr/bin/env python3
"""Estrae dai PDF del compendio le tabelle leggibili come testo:
 - Sviluppo_adolescenza.pdf  -> js/creationpdf.js  (TGP-5, abilità durante l'adolescenza)
 - Abilita_Secondarie.pdf    -> js/secdata.js      (compendio delle abilità secondarie)
Uso: python3 tools/extract-creation.py ADOLESCENZA.pdf SECONDARIE.pdf
Le altre tabelle della creazione (popoli, professioni, punti sviluppo, background) sono bitmap nei PDF
e sono state trascritte a mano in js/creationdata.js."""
import json, re, subprocess, sys, os
import pdfplumber

NAMES = ['nani', 'umli', 'noldor', 'sindar', 'silvani', 'mezzelfi', 'hobbit', 'beorniani', 'numneri', 'corsari',
         'dorwinrim', 'dunedain', 'dunlandiani', 'esterling', 'haradrim', 'lossoth', 'rohirrim', 'eriadoriani',
         'gondoriani', 'variag', 'boschi', 'wose', 'orchetti', 'uruk', 'mezzorchi', 'troll', 'olog', 'mezzitroll']
ROWS = [('Nessuna Armatura', 'mov_nessuna'), ('Cuoio Grezzo', 'mov_cuoio_g'), ('Cuoio Rinforzato', 'mov_cuoio_r'),
        ('Cotta', 'mov_maglie'), ('Da Taglio', 'taglio'), ('Contundenti', 'contund'), ('A 2 mani', 'due_mani'),
        ('Da Lancio', 'lancio'), ('Da Tiro', 'tiro'), ('Armi con Asta', 'asta'), ('Arrampicarsi', 'arrampic'),
        ('Cavalcare', 'cavalc'), ('Nuotare', 'nuotare'), ('Colpire', 'spalle'), ('Muov.', 'silenz'),
        ('Scassinare', 'serrat'), ('Disattivare', 'trappole'), ('Lettura', 'rune'), ('Uso di Oggetti', 'ogg_mag'),
        ('Attacco Novizio', 'att_nov'), ('Presa Novizio', 'pre_nov'), ('Resistenza', 'res_fis'),
        ('Percezione', 'percez'), ('Lista', 'lista'), ('#Lingue', 'lingue'), ('#Punti', 'bgpunti')]


def adolescence(path):
    pdf = pdfplumber.open(path)
    page = pdf.pages[1]
    lines = {}
    for w in page.extract_words():
        lines.setdefault(round(w['top'] / 3), []).append(w)
    out = {n: {} for n in NAMES}
    for key_line in sorted(lines):
        ws = sorted(lines[key_line], key=lambda w: w['x0'])
        text = ' '.join(w['text'] for w in ws if w['x0'] < 125)
        nums = [w for w in ws if w['x0'] >= 125 and re.fullmatch(r'\d+', w['text'])]
        for label, key in ROWS:
            if text.startswith(label) and len(nums) == len(NAMES):
                for n, w in zip(NAMES, nums):
                    out[n][key] = int(w['text'])
    for n in NAMES:
        assert len(out[n]) == len(ROWS), (n, len(out[n]))
    return out


def secondary(path):
    txt = subprocess.run(['pdftotext', '-layout', path, '-'], capture_output=True, text=True, check=True).stdout.split('\n')
    heads = []
    for i, l in enumerate(txt):
        if l.strip().startswith('Gruppi di abilità:'):
            j = i - 1
            while not txt[j].strip():
                j -= 1
            heads.append((i, txt[j].strip(), l.split(':', 1)[1].strip().rstrip('.')))
    pat = re.compile(r'^([A-ZÀ-Ú][^:]{1,90}?)\s*\(([A-Z]{2}[^)]{0,30}|x)\):\s*(.*)$')
    skip = re.compile(r'^\s*\d+\s*$|^Questo documento|^Le regole originali|^Ruolo del|^Per domande|^Può essere usato|^Il contenuto non|^\s*$')
    types, cur, ty = [], None, None
    for i, l in enumerate(txt):
        if i < heads[0][0]:
            continue
        hit = [h for h in heads if h[0] == i]
        if hit:
            ty = {'name': hit[0][1], 'groups': hit[0][2], 'intro': '', 'skills': []}
            types.append(ty); cur = None
            continue
        s = l.strip()
        if s in [h[1] for h in heads] or skip.match(s) or s.startswith('Abilità Secondarie'):
            if s in [h[1] for h in heads]:
                cur = None
            continue
        m = pat.match(s)
        if m and len(m.group(1).split()) <= 9:
            cur = {'n': m.group(1).strip(), 'stat': m.group(2).strip(), 'text': m.group(3).strip()}
            ty['skills'].append(cur)
        elif cur:
            cur['text'] += ' ' + s
        else:
            ty['intro'] += (' ' if ty['intro'] else '') + s
    return types


def main():
    if len(sys.argv) < 3:
        sys.exit(__doc__)
    root = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
    head = '/* Generato da tools/extract-creation.py dai PDF del compendio Istaro Quettar (Filduin). Non modificare a mano. */\n'
    ad = adolescence(sys.argv[1])
    open(os.path.join(root, 'js/creationpdf.js'), 'w', encoding='utf8').write(
        head + '(function (root) {\n  var G = root.GIRSA = root.GIRSA || {};\n  G.adolescence = ' + json.dumps(ad, ensure_ascii=False) + ';\n})(typeof window !== \'undefined\' ? window : globalThis);\n')
    sec = secondary(sys.argv[2])
    open(os.path.join(root, 'js/secdata.js'), 'w', encoding='utf8').write(
        head + '(function (root) {\n  var G = root.GIRSA = root.GIRSA || {};\n  G.secdata = ' + json.dumps(sec, ensure_ascii=False, indent=0) + ';\n})(typeof window !== \'undefined\' ? window : globalThis);\n')
    print('adolescenza:', len(ad), 'popoli; secondarie:', sum(len(t['skills']) for t in sec), 'abilità in', len(sec), 'tipi')


main()
