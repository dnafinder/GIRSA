#!/usr/bin/env python3
"""
Estrae dal compendio «Istaro Quettar» le tabelle di magia e di combattimento che non sono nelle tabelle di attacco:
TA-9 (attacco con incantesimi base), TRR (tiri resistenza), TSC-3 (incantesimi), TSC-4 (copertura), TSC-5 (gittata).
Scrive js/combatdata.js.

Uso:  python3 tools/extract-combat.py INCANTESIMI_BASE.pdf ATTACCO_CON_MODIFICATORI.pdf
Richiede poppler (pdftotext). I PDF non fanno parte del repository.
"""
import json, os, re, subprocess, sys


def text(path):
    return subprocess.run(['pdftotext', '-layout', path, '-'], capture_output=True, text=True, check=True).stdout


def num(t):
    return int(t.replace('−', '-').replace('–', '-'))


def ta9(src):
    rows = []
    pat = re.compile(r'^\s*(TI )?(\d+)(?:-(\d+))?\s+((?:F|[+\-]?\d+)(?:\s+(?:F|[+\-]?\d+)){6})(?:\s|$)')
    inside = False
    for line in src.split('\n'):
        if 'TA-9 Attacco Incantesimi Base' in line:
            inside = True
            continue
        if inside and 'TRR Tiri Resistenza' in line:
            break
        if not inside:
            continue
        m = pat.match(line)
        if not m:
            continue
        lo = int(m.group(2)); hi = int(m.group(3)) if m.group(3) else lo
        vals = [None if t == 'F' else num(t) for t in m.group(4).split()]
        rows.append({'min': lo, 'max': hi, 'ti': bool(m.group(1)), 'v': vals})
    assert len(rows) == 28, len(rows)
    prev = 0
    for r in rows:
        assert r['min'] == prev + 1, r
        prev = r['max']
    assert prev == 100
    assert [r['ti'] for r in rows].count(True) == 4
    return rows


def trr(src):
    start = src.index('TRR Tiri Resistenza')
    rows = {}
    for line in src[start:].split('\n'):
        m = re.match(r'^\s*(\d{1,2})\s+((?:\d+\s+){14}\d+)(?:\s+\d+)?\s*$', line)
        if m and 1 <= int(m.group(1)) <= 15:
            rows[int(m.group(1))] = [int(x) for x in m.group(2).split()]
    assert sorted(rows) == list(range(1, 16)), sorted(rows)
    t = [rows[i] for i in range(1, 16)]
    # controllo di coerenza: valore = 50 + f(attacco) - f(bersaglio), con f crescente di 5, 3 e 2 per livello
    f = [0]
    for lv in range(2, 16):
        f.append(f[-1] + (5 if lv <= 5 else 3 if lv <= 10 else 2))
    for ti in range(15):
        for ai in range(15):
            assert t[ti][ai] == 50 + f[ai] - f[ti], (ti + 1, ai + 1, t[ti][ai])
    return t


def tsc3(src):
    out = []
    start = src.index('TSC-3 Statistiche degli Incantesimi')
    for line in src[start:src.index('TA-7 Incantesimi Dardo')].split('\n'):
        parts = [p for p in re.split(r'\s{2,}', line.strip()) if p]
        if len(parts) >= 5 and re.match(r'^(Dardo|Fulmine|Sfera)', parts[0]):
            out.append({'n': parts[0], 'c1': parts[1], 'c2': None if parts[2] == '-' else parts[2], 'c3': None if parts[3] == '-' else parts[3],
                        'mod': None if parts[4] == '-' else parts[4]})
    assert len(out) == 8, [o['n'] for o in out]
    return out


def tsc4(src):
    out = []
    for line in src.split('\n'):
        m = re.match(r'^\s*((?:Morbida|Dura), (?:Piena|Mezza|Parziale))\s+(.*)$', line)
        if m:
            vals = re.split(r'\s{2,}|\s+(?=[+\-0]|-$)', m.group(2).strip())
            vals = m.group(2).split()
            assert len(vals) == 5, line
            out.append({'n': m.group(1), 'v': [None if v == '-' else num(v) for v in vals]})
    assert len(out) == 6
    return out


def tsc5(src):
    out = []
    start = src.index('TSC-5 Gittata delle Armi')
    for line in src[start:].split('\n'):
        toks = line.split()
        if len(toks) >= 5 and re.match(r'^\d+$', toks[0]) and re.match(r'^\d+-\d+$', toks[1]):
            groups = [toks[0:5]]
            if len(toks) >= 10 and re.match(r'^\d+$', toks[5]) and re.match(r'^\d+-\d+$', toks[6]):
                groups.append(toks[5:10])
            for g in groups:
                out.append({'base': int(g[0]), 'r': [list(map(int, x.split('-'))) for x in g[1:5]]})
    out.sort(key=lambda x: x['base'])
    assert [o['base'] for o in out] == [1, 3, 5, 7, 10, 13, 17, 20, 25, 30, 33], [o['base'] for o in out]
    for o in out:
        b = o['base']
        if b >= 3:
            exp = [[1, b], [b, 2 * b], [2 * b, 3 * b], [3 * b, 4 * b]]   # per la base 33 il PDF arrotonda 99 a 100
            assert all(abs(x - y) <= 1 for a, e in zip(o['r'], exp) for x, y in zip(a, e)), o
    return out


def main():
    if len(sys.argv) != 3:
        raise SystemExit(__doc__)
    base, mod = text(sys.argv[1]), text(sys.argv[2])
    data = {'ta9': ta9(base), 'trr': trr(base), 'tsc3': tsc3(mod), 'tsc4': tsc4(mod), 'tsc5': tsc5(mod)}
    root = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
    js = ("/* Generato da tools/extract-combat.py dal compendio «Istaro Quettar» (Filduin). Non modificare a mano. Vedi NOTICE.md. */\n"
          "(function (root) {\n  var G = root.GIRSA = root.GIRSA || {};\n  G.combatdata = %s;\n"
          "  if (typeof module !== 'undefined') module.exports = G.combatdata;\n"
          "})(typeof window !== 'undefined' ? window : globalThis);\n") % json.dumps(data, ensure_ascii=False, separators=(',', ':'))
    with open(os.path.join(root, 'js', 'combatdata.js'), 'w', encoding='utf-8') as f:
        f.write(js)
    print('TA-9: %d righe; TRR 15x15; TSC-3: %d; TSC-4: %d; TSC-5: %d' % (len(data['ta9']), len(data['tsc3']), len(data['tsc4']), len(data['tsc5'])))


main()
