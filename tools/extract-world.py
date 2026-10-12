#!/usr/bin/env python3
"""Genera js/worlddata.js: animali e mostri (TS-2) e manovre statiche (TM-2) letti dai PDF con testo;
esperienza (TE-0..7), manovre in movimento (TM-1), meteo (TS-8), incontri (TS-10), rischio incantesimi (TS-12),
tesori (TS-6), prezzi magici (TS-7) e Mutaforma trascritti a mano (tools/world_hand.py) e controllati qui.
Uso: extract-world.py ANIMALI.pdf STATICHE.pdf TRR2.pdf PIROCINESI.pdf POTENZIAMENTO.pdf > js/worlddata.js
Il testo del compendio resta com'è (refusi compresi); le anomalie note sono elencate in 'anomalie'."""
import json
import re
import sys
import os

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import pdfplumber  # noqa: E402
import pdfgrid as g  # noqa: E402
import world_hand as H  # noqa: E402

TA = ('NA', 'CG', 'CR', 'CM', 'CP')


# ------------------------------------------------------------------ Animali (TS-2)
def animali(path):
    pdf = pdfplumber.open(path)
    B = [0, 133, 168, 211, 246, 282, 317, 353, 412, 458]
    sections = {'animali': [], 'cav': [], 'mostri': []}
    notes_cav = []
    cur_sec, cur_grp = 'animali', None
    stats = {}
    for pi, pg in enumerate(pdf.pages):
        ws = sorted(g.words(pg), key=lambda w: (w['top'], w['x0']))
        rows = []
        for w in ws:
            if rows and abs(rows[-1][0] - w['top']) < 2.5:
                rows[-1][1].append(w)
            else:
                rows.append([w['top'], [w]])
        for top, rw in rows:
            rw.sort(key=lambda w: w['x0'])
            full = re.sub(r'\s+', ' ', ' '.join(w['text'] for w in rw)).strip()
            cols = g.split_cols(rw, B)
            if full.startswith('TS- 2') or full.startswith('TS-2') or full == 'TS- 2 Animali della Terra di Mezzo' or 'Animali della Terra di Mezzo' in full:
                continue
            if cols[0] == 'Tipo' or full.startswith('Tipo Livello'):
                continue
            if full == 'Cavalcature e animali da soma':
                cur_sec, cur_grp = 'cav', None
                continue
            if full == 'Creature speciali e mostri Tolkeniani':
                cur_sec, cur_grp = 'mostri', None
                continue
            if full == 'Legenda' or full.startswith('Legenda '):
                cur_sec = None
                break
            if cur_sec is None:
                continue
            if cur_sec == 'cav' and (full.startswith('(1)') or full.startswith('(2)')):
                notes_cav.append(full)
                continue
            only0 = all(c == '' for c in cols[1:])
            if only0 and cols[0] and not cols[0].startswith('('):
                cur_grp = {'n': cols[0], 'righe': []}
                sections[cur_sec].append(cur_grp)
                continue
            if cols[0].startswith('(') or (only0 and full.startswith('(')):
                assert cur_grp is not None
                cur_grp['nota'] = full
                continue
            assert cur_grp is not None, (pi, full)
            if cur_sec == 'cav':
                m = re.match(r'^(.+?) (\d+) ([A-Z-]{1,2}/[A-Z-]{1,2}) (\S+ m/r) (\d+) (NA|CG|CR|CM|CP) (\d+) (\S+) ([EGMP]{1,2}/[EGMPN]) (\d+) kg (\S+)$', full)
                assert m, ('cavalcatura non letta', full)
                cur_grp['righe'].append({'n': m.group(1), 'lv': int(m.group(2)), 'vel': m.group(3), 'mr': m.group(4), 'pf': int(m.group(5)), 'ta': m.group(6), 'bd': int(m.group(7)),
                                          'att': m.group(8), 'dim': m.group(9), 'port': m.group(10) + ' kg', 'bac': m.group(11)})
            else:
                n, lv, qt, vel, pf, ta, bd, att, dim, note = cols
                assert re.fullmatch(r'\d+', lv), ('livello', full)
                assert re.fullmatch(r'\d+(-\d+)?', qt), ('quantità', full)
                assert re.fullmatch(r'\d+', pf), ('PF', full)
                assert ta in TA, ('TA', full)
                assert re.fullmatch(r'\d+', bd), ('BD', full)
                cur_grp['righe'].append({'n': n, 'lv': int(lv), 'qt': qt, 'vel': vel, 'pf': int(pf), 'ta': ta, 'bd': int(bd), 'att': att, 'dim': dim, 'note': note})
    # bue..zurafy: nel PDF stanno dopo "Elefanti" senza titolo proprio
    cav = sections['cav']
    assert [x['n'] for x in cav] == ['Cavalli', 'Cammelli', 'Elefanti'], [x['n'] for x in cav]
    el = cav[2]['righe']
    assert [r['n'] for r in el][:3] == ['Andamunda', 'Losandamunda', 'Mùmakil']
    altri = el[3:]
    cav[2]['righe'] = el[:3]
    cav.append({'n': 'Altri (nel PDF senza titolo, dopo gli elefanti)', 'righe': altri})
    # conteggi come contati sulle pagine
    cnt = {k: [len(x['righe']) for x in v] for k, v in sections.items()}
    assert cnt['animali'] == [33, 15, 8, 26, 39, 18, 8], cnt['animali']
    assert cnt['cav'] == [10, 2, 3, 5], cnt['cav']   # 8 righe dopo «Cammelli»: 3 elefanti + 5 senza titolo
    assert cnt['mostri'] == [8, 4, 11, 13, 10, 7, 5, 30, 4], cnt['mostri']   # conteggio indipendente sulle pagine (le note dei gruppi non sono righe)
    sec_names = [x['n'] for x in sections['animali']]
    assert sec_names == ['Volatili', 'Creature acquatiche', 'Potili (Insetti, aracnidi e crostacei)', 'Rávatsar (Anfibi e Rettili)', 'Apsanakûni (Carnivori)', 'Lassanakûni (Erbivori)', 'Altri animali'], sec_names
    mn = [x['n'] for x in sections['mostri']]
    assert mn == ['Mostri acquatici', 'Alberi', 'Demoni', 'Draghi', 'Razze giganti', 'Pûkel (Creature animate)', 'Ragni e insetti giganti', 'Non Morti', 'Elementali'], mn
    return sections, notes_cav


VEL = [['ST', 'Strisciante', '1,5 m', '0', '0', '0', '-60'], ['ML', 'Molto lento', '4,5 m', '0', '0', '0', '-40'], ['LE', 'Lento', '7,5 m', '5', '5', '0', '-20'],
       ['ME', 'Medio', '15 m', '10', '10', '-5', '0'], ['MV', 'Med. veloce', '22,5 m', '20', '15', '-10', '+20'], ['VE', 'Veloce', '30 m', '30', '20', '-15', '+40'],
       ['VC', 'Molto veloce', '37,5 m', '40', '30', '-20', '+60'], ['SC', 'Saettante', '45 m', '50', '40', '-20', '+80']]
LEGENDA = [
    'Tipo: indica specie e dimensioni dell’animale o del mostro.',
    'Livello: indica il livello medio dell’animale o del mostro, per il calcolo dei Tiri Resistenza e l’attribuzione di punti esperienza. Quando il livello indicato è 0, lo si considera 0 per l’attribuzione dei punti esperienza ed 1 per il calcolo dei Tiri Resistenza.',
    'Quantità: indica il numero di mostri o di animali in cui un gruppo di 4 - 6 personaggi può imbattersi durante un singolo incontro.',
    'Velocità: è la velocità relativa indicata come Velocità di movimento (VM) / Velocità d’attacco (VA).',
    'Modifiche Difensive: queste modifiche si applicano al bonus difensivo del mostro o dell’animale in situazioni adatte. Carica/balzo si ha quando l’animale attacca caricando frontalmente senza cogliere di sorpresa la vittima. La modifica si applica solo durante l’attacco della vittima della carica qualora questa attacchi per prima. Scappando/fuggendo si applica quando l’animale, a non meno di 5 metri di distanza, si muove in direzione opposta a chi lancia un’arma o un incantesimo.',
    'PF: (Punti Ferita) è il numero di danni che un esemplare medio della specie indicata può subire prima di perdere i sensi. Per gli individui specifici può variare del 20% in più o in meno.',
    'TA: (Tipo di armatura) è l’equivalente in armatura dell’animale o del mostro. NA: nessuna armatura; CG: cuoio grezzo; CR: cuoio rinforzato; CM: corazza di maglia; CP: corazza di piastre.',
    'BD: (Bonus difensivo) è il punteggio da sottrarre ai tiri per colpire l’animale o il mostro. Il GM può variare il numero indicato in relazione alle circostanze, del 20% in più o in meno, anche per rendere più specifico ogni singolo esemplare.',
    'Attacco: indica il tipo di attacco dell’animale ed il suo Bonus Offensivo. Vedi, più in particolare, la tabella TSC-2. (Il simbolo > indica che il successivo attacco è conseguente e dipendente dal precedente.',
    '*: questo mostro dispone di attacchi o poteri speciali o multipli.',
    'Dimensioni: indica le dimensioni dell’animale ai fini del calcolo dei risultati massimi degli attacchi (primo valore) e del calcolo del colpo critico inflitto all’animale o al mostro (secondo valore). E: enorme; G: grande; M: medio; P: piccolo; PP: piccolissimo.',
    'Critico: indica quale colonna usare per i colpi critici inflitti all’animale o al mostro. Normali: quelle normali; Grandi: quella degli esseri grandi; Enormi: quella degli esseri enormi.',
]


# ------------------------------------------------------------------ Manovre statiche (TM-2)
def statiche(path):
    pg = pdfplumber.open(path).pages[1]
    ws = g.words(pg)
    bs = g.bands(pg)
    assert len(bs) == 9, len(bs)
    B = [0, 128, 226, 323, 427, 524]
    head = g.split_cols(g.in_band(ws, bs[0]), B)
    assert head == ['Generale (si applica a tutte le Manovre Statiche non comprese nelle altre colonne)', 'Interazione e Influenza', 'Disattivare Trappole Scassinare Serrature',
                    'Lettura Rune Uso di Oggetti Magici', 'Percezione Seguire Tracce', ''], head
    rows = []
    for b in bs[1:8]:
        cols = g.split_cols(g.in_band(ws, b), B)
        lab = cols[5]
        m = re.match(r'^(.*?) (-?\d+ o meno|-?\d+/-?\d+|\d+ o più)$', lab)
        assert m, lab
        rows.append({'n': m.group(1), 'r': m.group(2), 'c': cols[:5]})
    assert [(r['n'], r['r']) for r in rows] == [('Errore Grossolano', '-26 o meno'), ('Fallimento Completo', '-25/04'), ('Fallimento', '05/75'), ('Successo Parziale', '76/90'),
                                              ('Quasi Successo', '91/110'), ('Successo', '111/175'), ('Successo Completo', '175 o più')]
    mods = g.split_cols(g.in_band(ws, bs[8]), B)
    assert mods[0].startswith('(*) Difficoltà +30 Banale +20 Facile +10 Normale 0 Media -10 Difficile -20 Molto difficile -30 Difficilissima -50 Folle -70 Assurda'), mods[0]
    diff = [['+30', 'Banale'], ['+20', 'Facile'], ['+10', 'Normale'], ['0', 'Media'], ['-10', 'Difficile'], ['-20', 'Molto difficile'], ['-30', 'Difficilissima'], ['-50', 'Folle'], ['-70', 'Assurda']]
    split = lambda t: re.split(r'\s(?=(?:Difficoltà:|[+\-][+\-/x\d]*:))', t)
    mm = [split(x) for x in mods[1:5]]
    return {'cols': [['Generale', '(si applica a tutte le Manovre Statiche non comprese nelle altre colonne)'], ['Interazione e Influenza'], ['Disattivare Trappole', 'Scassinare Serrature'],
                     ['Lettura Rune', 'Uso di Oggetti Magici'], ['Percezione', 'Seguire Tracce']],
            'righe': rows, 'difficolta': diff, 'modifiche': mm}


# ------------------------------------------------------------------ TRR-2: freddo e caldo (PDF con testo)
def pdftext(path):
    import subprocess
    return subprocess.run(['pdftotext', '-layout', path, '-'], capture_output=True, text=True, check=True).stdout


def trr2(path):
    lines = pdftext(path).split('\n')
    start = [i for i, l in enumerate(lines) if 'TRR – 2 Tiri resistenza contro temperature estreme' in l]
    assert len(start) == 1
    L = lines[start[0] + 1:]
    iF = L.index('Freddo'); iC = L.index('Caldo')
    clean = lambda t: re.sub(r'\s+', ' ', t).strip()

    def section(a, b, ncols):
        seg = L[a + 1:b]
        # testo introduttivo: righe prima della prima riga di tabella
        rowre = re.compile(r'^(100 o \+|\d+/\d+|Meno di 0)\s{2,}(.*)$')
        intro, rows, i = [], [], 0
        while not rowre.match(seg[i]):
            intro.append(seg[i]); i += 1
        while i < len(seg):
            m = rowre.match(seg[i])
            if m:
                rows.append([m.group(1), m.group(2)]); i += 1
            elif seg[i].startswith(' ' * 15) and seg[i].strip() and rows and not seg[i].strip().startswith('Modificatori'):
                rows[-1][1] += ' ' + seg[i].strip(); i += 1
            else:
                break
        rest = seg[i:]
        notes = [clean(x) for x in rest if x.startswith('*')]
        # modificatori
        mi = [k for k, x in enumerate(rest) if x.startswith('Modificatori al tiro')][0]
        mods = {'temp': [], 'ind': [], 'altro': []}
        ent = re.compile(r'(\S.*?)\s+([+-]\d+(?:/[+-]\d+)?(?:/ora)?)(?=\s{2,}|$)')
        for x in rest[mi + 2:]:
            if x.startswith('*') or not x.strip():
                continue
            if x.strip().startswith('(Guanti/sciarpe)'):
                mods['ind'][-1][0] += ' (Guanti/sciarpe)'
                x = x.replace('(Guanti/sciarpe)', ' ' * len('(Guanti/sciarpe)'), 1)
            ms = list(ent.finditer(x))
            for m in ms:
                col = 'temp' if m.start() < 36 else ('ind' if (ncols == 3 and m.start() < 74) else ('altro' if ncols == 3 or m.start() < 100 else 'altro2'))
                mods[col].append([clean(m.group(1)), m.group(2)])
        mods['altro'] += mods.pop('altro2', [])
        return {'intro': clean(' '.join(intro)), 'righe': [[r[0], clean(r[1])] for r in rows], 'mods': mods, 'note': notes}
    fre = section(iF, iC, 3)
    cal = section(iC, len(L) - 1, 2)
    # il testo prima della tabella: ultime due righe = «Il risultato del … questa tabella:»; separiamo i due paragrafi
    for d in (fre, cal):
        m = re.search(r'^(.*?)\s*(Il risultato del “Tiro.*)$', d['intro'])
        assert m, d['intro']
        d['intro'], d['formula'] = m.group(1), m.group(2)
    fre['note'] = [n for n in fre['note'] if n.startswith('*Il TR contro malattie')]
    nota_fin = [clean(x) for x in L if x.startswith('*I TR contro Calore e Freddo')]
    assert len(fre['righe']) == 10 and len(cal['righe']) == 10, (len(fre['righe']), len(cal['righe']))
    for d in (fre, cal):
        assert [r[0] for r in d['righe']] == ['100 o +', '75/99', '60/74', '50/59', '40/49', '30/39', '20/29', '10/19', '0/09', 'Meno di 0']
    assert [len(fre['mods'][k]) for k in ('temp', 'ind', 'altro')] == [6, 6, 8], [len(fre['mods'][k]) for k in ('temp', 'ind', 'altro')]
    assert [len(cal['mods'][k]) for k in ('temp', 'altro')] == [6, 9], [len(cal['mods'][k]) for k in ('temp', 'altro')]
    return {'freddo': fre, 'caldo': cal, 'nota': nota_fin[0]}


# ------------------------------------------------------------------ Liste di incantesimi (PDF con testo)
def lista(path, titolo_riga):
    import subprocess
    t = subprocess.run(['pdftotext', path, '-'], capture_output=True, text=True, check=True).stdout
    t = t.replace('\x0c', '\n')
    i = t.index(titolo_riga)
    pre = [x.strip() for x in t[:i].split('\n') if x.strip()]
    nome = pre[-1]
    rest = t[i:].split('\n', 1)
    tipo = rest[0].strip()
    txt = rest[1]
    parts = re.split(r'(?m)^(\d+)\) ', txt)
    assert parts[0].strip() == '', parts[0]
    sp = []
    notes = []
    for k in range(1, len(parts), 2):
        n = int(parts[k]); blk = parts[k + 1]
        m = re.search(r'\n\s*Note: (.*)$', blk, re.S)
        if m:
            notes.append(re.sub(r'\s+', ' ', m.group(1)).strip()); blk = blk[:m.start()]
        flat = re.sub(r'\s+', ' ', blk).strip()
        mm = re.match(r'^(.+?) \((E|ED|ES|U)\) (.*?)R:(.*?) [–-] (.*)$', flat)
        assert mm, flat[:80]
        d = mm.group(3).strip()
        assert d == '' or d.startswith('D:'), (n, d)
        sp.append({'lv': n, 'n': mm.group(1), 't': mm.group(2), 'd': d[2:].strip(), 'r': mm.group(4).strip(), 'x': mm.group(5).strip()})
    return {'n': nome, 'tipo': tipo, 'sp': sp, 'note': notes}


# ------------------------------------------------------------------ controlli delle tabelle trascritte a mano
def rng(label):
    """'01/20' -> (1, 20); '≤ 05' -> (-9999, 5); '201+' -> (201, 9999); '00' -> (100, 100); 'più di 200' -> (201, 9999); '91/00' -> (91, 100)"""
    s = label.strip()
    if s.startswith('≤'):
        return (-9999, int(s[1:]))
    if s.endswith('+'):
        return (int(s[:-1]), 9999)
    if s.startswith('più di'):
        return (int(s[6:]) + 1, 9999)
    if s.endswith(' o meno'):
        return (-9999, int(s[:-7]))
    if s.endswith(' o più'):
        return (int(s[:-6]), 9999)
    if s == '00':
        return (100, 100)
    m = re.fullmatch(r'(-?\d+)/(-?\d+)', s)
    assert m, label
    a, b = int(m.group(1)), int(m.group(2))
    return (a, 100 if b == 0 and a > 0 and s.endswith('/00') else b)


def contiguous(labels, lo, hi, allow_overlap=()):
    prev = None
    for i, l in enumerate(labels):
        a, b = rng(l)
        if prev is None:
            assert a <= lo, (l, lo)
        else:
            if (labels[i - 1], l) in allow_overlap:
                assert a <= prev, (labels[i - 1], l)
            else:
                assert a == prev + 1, ('buco/sovrapposizione', labels[i - 1], l)
        prev = b
    assert prev >= hi, (labels[-1], hi)


def controlli():
    # TE-1
    assert len(H.TE1) == 11 and all(len(r) == 11 for r in H.TE1)
    for i in range(1, 11):                       # decrescente verso destra, crescente verso il basso
        for j in range(10):
            assert H.TE1[i][j] >= H.TE1[i][j + 1], (i, j)
    for i in range(10):
        for j in range(11):
            assert H.TE1[i][j] <= H.TE1[i + 1][j], (i, j)
    for i in range(1, 8):                         # lo schema diagonale: il valore scende di un passo spostandosi di una colonna
        for j in range(10):
            assert H.TE1[i + 1][j + 1] == H.TE1[i][j] or j >= 7 or i >= 6, (i, j)   # solo controllo grossolano sulla parte regolare
    # TE-2: 100 -> 0 a passi di 10
    assert [v for _, v in H.TE2] == [100, 90, 80, 70, 60, 50, 40, 30, 20, 10, 0]
    # TM-1
    assert len(H.TM1) == 23 and len(H.TM1_DIFF) == 9
    contiguous([r[0] for r in H.TM1], -9999, 9999)
    prevrow = None
    for lab, cells in H.TM1:
        assert len(cells) == 9, lab
        pct = []
        for c in cells:
            if c == 'F':
                pct.append(0)
                continue
            m = re.fullmatch(r'(\d+)/(-|[+-]\d+)', c)
            assert m, (lab, c)
            p = int(m.group(1))
            exp = int((p - 100) * 0.3)             # metri = (percentuale-100) * 0.3, troncato verso zero
            got = 0 if m.group(2) == '-' else int(m.group(2))
            assert got == exp, (lab, c, exp)
            pct.append(p)
        assert pct == sorted(pct, reverse=True), (lab, pct)           # più difficile = meno riuscita
        if prevrow:
            assert all(a <= b for a, b in zip(prevrow, pct)), (lab, prevrow, pct)   # tiro più alto = più riuscita
        prevrow = pct
    # TS-8 / TS-8.2
    assert len(H.PREC) == 12 and all(len(r) == 6 for r in H.PREC) and len(H.TEMP) == 12 and all(len(r) == 5 for r in H.TEMP)
    for r in H.PREC:
        for c in r:
            assert re.fullmatch(r'(\d+|-)\((\d\d)\)\*?', c), c
    for r in H.TEMP:
        for c in r:
            a, b = c.split('/')
            assert int(a) <= int(b) or c == '42/-12', c      # minima <= massima; unica eccezione: la cella con il segno meno mancante
    # TS-10 / TS-12
    contiguous([r[0] for r in H.INC], 1, 9999)
    assert len(H.INC) == 14 and all(len(r[1]) == 5 for r in H.INC)
    for r in H.INC:
        for c in r[1]:
            assert re.fullmatch(r'[-aiotv]/[-aiotv]', c), c
    contiguous([r[0] for r in H.RISCHIO], -9999, 9999)
    assert len(H.RISCHIO) == 13 and all(len(r[1]) == 8 for r in H.RISCHIO)
    # TS-6
    contiguous([r[0] for r in H.TES_ENT_D], 1, 100)
    contiguous([r[0] for r in H.TES_ENT_M], 1, 100)
    contiguous([r[0] for r in H.TES_COMP_D], 1, 100)
    contiguous([r[0] for r in H.TES_COMP_M], 1, 100, allow_overlap=(('11/22', '21/30'),))
    contiguous([r[0] for r in H.TES_OGG], 1, 100)
    for r in H.TES_ENT_M:
        assert r[1] == sorted(r[1]), r         # più ricco = più oggetti
    for r in H.TES_COMP_D:
        assert len(r[1]) == 5
        for c in r[1]:
            assert re.fullmatch(r'(\d+(\.\d{3})*(MS|MR|MB|MA|MO|MM)|(Ge|Gio)\.\(\d+(\.\d{3})*\))', c), c
    for r in H.TES_COMP_M:
        for c in r[1]:
            assert re.fullmatch(r'(N|L \(\d+%\)|B \(\+\d+\)|J|A \+\d|M x\d|Speciale|Artefatto)', c), c
    # TS-7: i costi addizionali non decrescono col livello
    for n, v in H.TS7_ADD:
        nums = [int(x) for x in v if x != '-']
        assert nums == sorted(nums), n
    assert [len([x for x in v if x != '-']) for _, v in H.TS7_ADD] == [10, 10, 10, 2, 5, 10]


def main():
    controlli()
    anim, cavnote = animali(sys.argv[1])
    st = statiche(sys.argv[2])
    tr2 = trr2(sys.argv[3])
    piro = lista(sys.argv[4], 'Liste Chiuse')
    pot = lista(sys.argv[5], 'Liste Aperte')
    assert [len(piro['sp']), len(pot['sp'])] == [23, 23] and piro['n'] == 'Pirocinesi' and pot['n'] == 'Potenziamento Corporeo'
    out = {
        'animali': {'animali': anim['animali'], 'cavalcature': anim['cav'], 'cavNote': cavnote, 'mostri': anim['mostri'], 'velocita': VEL, 'legenda': LEGENDA},
        'statiche': st,
        'trr2': tr2,
        'liste': [piro, pot],
        'xp': {'te0': H.TE0, 'te0t': H.TE0_TXT, 'te1t': H.TE1_TXT, 'te1': H.TE1, 'te1n': H.TE1_NOTE, 'te3t': H.TE3_TXT, 'te3': H.TE3, 'te3n': H.TE3_NOTE, 'te3m': H.TE3_MOLT,
               'pf': H.PF_TXT, 'morte': H.MORTE_TXT, 'te2t': H.TE2_TXT, 'te2': H.TE2, 'te2m': H.TE2_MOLT, 'te4t': H.TE4_TXT, 'te4': H.TE4, 'te6': H.TE6, 'te6m': H.TE6_MOLT,
               'te7t': H.TE7_TXT, 'te7': H.TE7, 'semplt': H.SEMPL_TXT, 'sempl': H.SEMPL},
        'mov': {'intro': H.TM1_INTRO, 'diff': H.TM1_DIFF, 'righe': H.TM1, 'ris': H.TM1_RIS, 'mod': H.TM1_MOD, 'passo': H.TM1_PASSO, 'passoNote': H.TM1_PASSO_NOTE},
        'meteo': {'mesi': H.MESI, 'giorni': H.GIORNI, 'pclimi': H.PCLIMI, 'prec': H.PREC, 'precNote': H.PREC_NOTE, 'tclimi': H.TCLIMI, 'temp': H.TEMP},
        'incontri': {'dens': H.INC_DENS, 'righe': H.INC, 'note': H.INC_NOTE, 'cod': H.INC_COD, 'att': H.INC_ATT, 'attNota': H.INC_ATT_NOTE, 'eva': H.INC_EVA},
        'rischio': {'intro': H.RISCHIO_INTRO, 'fatt': H.RISCHIO_FATT, 'per': H.RISCHIO_PER, 'aree': H.RISCHIO_AREE, 'righe': H.RISCHIO, 'tipi': H.RISCHIO_TIPI, 'ris': H.RISCHIO_RIS},
        'tesori': {'intro': H.TES_INTRO, 'ricchezze': H.RICCHEZZE, 'entD': H.TES_ENT_D, 'entM': H.TES_ENT_M, 'compD': H.TES_COMP_D, 'compM': H.TES_COMP_M,
                   'noteD': H.TES_NOTE_D, 'noteM': H.TES_NOTE_M, 'ogg': H.TES_OGG, 'oggNote': H.TES_OGG_NOTE},
        'magici': {'costo': H.TS7_COSTO, 'base': H.TS7_BASE, 'baseNota': H.TS7_BASE_NOTE, 'moltBonus': H.TS7_MOLT_BONUS, 'moltPeso': H.TS7_MOLT_PESO,
                   'add': H.TS7_ADD, 'addNote': H.TS7_ADD_NOTE, 'cariche': H.TS7_CARICHE},
        'muta': H.MUTA,
        'monete': [['MS', 'Moneta di Stagno', 1], ['MR', 'Moneta di Rame', 10], ['MB', 'Moneta di Bronzo', 100], ['MA', 'Moneta d’Argento', 1000], ['MO', 'Moneta d’Oro', 10000], ['MM', 'Moneta di Mithril', 1000000]],
        'anomalie': [
            'TE-1: nella colonna «11+» i livelli nemico 8, 9 e 10 riportano 130, 150, 200 (come stampato; lo schema degli altri valori darebbe 110, 130, 150).',
            'TM-2: l’estremo 175 compare sia in «111/175» sia in «175 o più».',
            'TS-6: negli oggetti magici «11/22» e «21/30» si sovrappongono (21 e 22).',
            'TS-8.2: Gelido, mese 3 (Gwaeron) è stampato «42/-12»: probabilmente «-42/-12».',
            'TS-8: tre celle sono stampate senza la parentesi di chiusura (202(80, 126(50, 278(95).',
            'Potenziamento Corporeo: il 13 (Concentrazione IV) precede il 12 (Vista nell’Oscurità); manca un «Potenziamento corporeo IV»; l’asterisco dei nomi (Slancio*, Potenziamento*, Concentrazione*, Ignora dolore*) non è spiegato nel PDF.',
            'TRR-2 Caldo (riga «Meno di 0»): il testo stampato dice «o sei il risultato del dado è 1 o 2» (per «se il risultato»).',
            'Pirocinesi: nel 2 compare «al concentrazione» (per «la»); nei punti 6, 8, 15 e 18 la citazione «“Crea Fiamma)» non ha le virgolette di chiusura; i livelli vanno da 1 a 20, poi 25, 30 e 50.',
        ],
    }
    sys.stdout.write('/* GENERATO da tools/extract-world.py (PDF con testo) e tools/world_hand.py (tabelle trascritte a mano): non modificare a mano. */\n'
                     '(function (root) {\n  var G = root.GIRSA = root.GIRSA || {};\n  G.worlddata = ' + json.dumps(out, ensure_ascii=False, separators=(',', ':')) +
                     ';\n  if (typeof module !== \'undefined\') module.exports = G.worlddata;\n})(typeof window !== \'undefined\' ? window : globalThis);\n')


main()
