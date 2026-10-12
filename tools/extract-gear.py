#!/usr/bin/env python3
"""Genera js/geardata.js dai PDF di Istaro Quettar: Armature (TSC-4), Equipaggiamento e prezzi (TS-4),
Metalli e Gemme, Erbe/Veleni/Malattie (TS-5).
Uso: extract-gear.py ARMATURE.pdf EQUIP.pdf METALLI.pdf ERBE.pdf > js/geardata.js
I testi sono trascritti così come stanno nei PDF (il compendio non va modificato); la verifica è in asserzioni."""
import json
import re
import subprocess
import sys
import os

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import pdfplumber  # noqa: E402
import pdfgrid as g  # noqa: E402


def sv(a):
    return '' if a is None else a


# ------------------------------------------------------------------ Armature (TSC-4)
SECN = {'NA': 'Tessuti e pelle (NA)', 'CG': 'Cuoio grezzo (CG)', 'CR': 'Cuoio rinforz. (CR)', 'CM': 'Cotte di maglia (CM)', 'CP': 'Corazze a piastre (CP)'}
def armature(path):
    page = pdfplumber.open(path).pages[1]
    ws = g.words(page)
    out = {'body': [], 'elmi': [], 'scudi': [], 'note': {}}
    # (testata, id, colonne a partire dalla seconda)
    bodycols = [140, 163, 195, 221, 480, 515]      # MM, BO-M, BO-T, descr., Res, BD
    cur = None
    for b in g.bands(page):
        inb = g.in_band(ws, b)
        if not inb:
            continue
        txt = g.cell_text(inb)
        first = sorted(inb, key=lambda w: (round(w['top'] / 3), w['x0']))[0]['text']
        # testate delle sezioni
        m = re.match(r'^(TESSUTI E PELLE|CUOIO GREZZO|CUOIO RINFORZ\.|COTTE DI MAGLIA|CORAZZE A PIASTRE) \((NA|CG|CR|CM|CP)\) MM BO-M', txt)
        if m:
            cur = {'id': m.group(2), 'n': SECN[m.group(2)], 'rows': []}
            out['body'].append(cur)
            continue
        if txt.startswith('ELMI E COPRICAPI'):
            cur = 'elmi'
            continue
        if txt.startswith('SCUDI BD-M'):
            cur = 'scudi'
            continue
        if txt.startswith('*valgono come protezione'):
            out['note']['NA'] = txt
            continue
        if txt.startswith('*Può essere usata anche come copertura al collo'):
            out['note']['elmi'] = txt
            continue
        if txt.startswith('BRACCIALI E SCHINIERI'):
            out['bracciali'] = {'titolo': txt}
            cur = 'brac'
            continue
        if cur == 'brac':
            out['bracciali'].setdefault('righe', []).append(txt)
            continue
        if isinstance(cur, dict):
            c = g.split_cols(inb, [0] + bodycols)
            out['body'][-1]['rows'].append({'n': c[0], 'mm': c[1], 'bom': c[2], 'bot': c[3], 'd': c[4], 'res': c[5], 'bd': c[6]})
        elif cur == 'elmi':
            c = g.split_cols(inb, [0, 140, 221, 480, 515])
            out['elmi'].append({'n': c[0], 'prc': c[1], 'd': c[2], 'res': c[3], 'bdi': c[4]})
        elif cur == 'scudi':
            # la banda può contenere più righe: si divide sulle parole che iniziano al margine sinistro
            anchors = sorted({round(w['top']) for w in inb if w['x0'] < 35})
            if not anchors:
                continue
            groups = {}
            for w in inb:
                cy = (w['top'] + w['bottom']) / 2
                a = min(anchors, key=lambda t: abs(t + 4 - cy))
                groups.setdefault(a, []).append(w)
            for a in sorted(groups):
                c = g.split_cols(groups[a], [0, 130, 163, 192, 221, 480])
                out['scudi'].append({'n': c[0], 'bdm': c[1], 'bdt': c[2], 'bdi': c[3], 'd': c[4], 'res': c[5]})
    # note finali (legenda delle sigle) dal testo
    full = subprocess.run(['pdftotext', '-f', '2', '-l', '2', '-layout', path, '-'], capture_output=True, text=True).stdout
    i = full.index('Note: BO-M')
    out['legenda'] = re.sub(r'\s+', ' ', full[i:]).strip()
    return out


# ------------------------------------------------------------------ Equipaggiamento (TS-4)
UNIT = re.compile(r'^(\d+(?:[.,]\d+)?|\d+/\d+)?\s?(MO|MA|MB|MS|MR|MM)[*^]?$|^-$|^•$|^-\*$')


def rows_by_name(ws, bounds, name_max, y0=0, y1=10000):
    """Ogni riga ha una parola nella colonna del nome (ancora). Le parole fuori dalla colonna del nome (celle
    sfalsate in verticale, note che vanno a capo) vanno alla riga con l'ancora più vicina in verticale."""
    ws = [w for w in ws if y0 <= w['top'] < y1]
    cy = lambda w: (w['top'] + w['bottom']) / 2
    names = sorted([w for w in ws if w['x0'] < name_max], key=cy)
    anchors = []   # [centro y, [parole del nome]]
    for w in names:
        if anchors and abs(anchors[-1][0] - cy(w)) <= 2.5:
            anchors[-1][1].append(w)
        else:
            anchors.append([cy(w), [w]])
    rows = [list(a[1]) for a in anchors]
    for w in ws:
        if w['x0'] < name_max:
            continue
        i = min(range(len(anchors)), key=lambda k: abs(anchors[k][0] - cy(w)))
        rows[i].append(w)
    return [g.split_cols(r, bounds) for r in rows]


def equip(path):
    pdf = pdfplumber.open(path)
    out = {}
    # pagina 1: due tabelle affiancate
    p = pdf.pages[1]
    ws = g.words(p)
    left = [w for w in ws if w['x0'] < 285]
    right = [w for w in ws if w['x0'] >= 285]
    # armi
    ytop = min(w['top'] for w in left if w['text'] == 'Accetta') - 1
    armi = rows_by_name([w for w in left], [0, 140, 190, 240], 140, ytop)
    out['armi'] = [{'n': r[0], 'costo': r[1], 'peso': r[2], 'tp': r[3]} for r in armi if r[0]]
    # equipaggiamento protettivo
    ystart = min(w['top'] for w in right if w['text'] == 'Scudo') - 1
    yend = min(w['top'] for w in right if w['text'] == 'Tutte') - 1
    prot = rows_by_name(right, [285, 400, 445, 495], 400, ystart, yend)
    out['prot'] = [{'n': r[0], 'costo': r[1], 'peso': r[2], 'tp': r[3]} for r in prot if r[0]]
    nl = [w for w in right if w['top'] >= yend]
    note_lines = {}
    for w in nl:
        note_lines.setdefault(round(w['top'] / 2.5), []).append(w)
    out['prot_note'] = [g.cell_text(note_lines[k]) for k in sorted(note_lines)]
    # pagine 2-4: tabelle con colonne fisse
    def simple(page_idx, bounds, name_max, keys, ytop_word, yend_word=None):
        pg = pdf.pages[page_idx]
        w_ = g.words(pg)
        y0 = min(w['top'] for w in w_ if w['text'] == ytop_word) + 1 if ytop_word else 0
        y1 = min([w['top'] for w in w_ if w['text'] == yend_word and w['top'] > y0] or [10000]) - 1
        res = rows_by_name(w_, bounds, name_max, y0, y1)
        return [dict(zip(keys, r)) for r in res if r[0]]
    # pagina 2 (indice 2): Accessori
    pg = pdf.pages[2]
    w_ = g.words(pg)
    y0 = min(w['top'] for w in w_ if w['text'] == 'Oggetto') + 4
    y1 = min(w['top'] for w in w_ if w['text'] == 'Costo:') - 1
    out['accessori'] = [dict(zip(['n', 'costo', 'peso', 'tp', 'note'], r)) for r in rows_by_name(w_, [0, 165, 215, 275, 320], 165, y0, y1) if r[0]]
    # pagina 3 (indice 3): Borse/Zaini, Indossati/Vestiti, Vitto/Alloggio/Servizi
    pg = pdf.pages[3]
    w_ = g.words(pg)
    titles = {}
    for w in w_:
        if w['text'] in ('Borse/Zaini', 'Indossati/Vestiti', 'Vitto,'):
            titles[w['text']] = w['top']
    cost_lines = sorted(w['top'] for w in w_ if w['text'] == 'Costo:')
    out['borse'] = [dict(zip(['n', 'costo', 'peso', 'tp', 'note'], r)) for r in rows_by_name(w_, [0, 165, 215, 275, 320], 165, titles['Borse/Zaini'] + 22, cost_lines[0] - 1) if r[0]]
    out['vestiti'] = [dict(zip(['n', 'costo', 'peso', 'tp', 'note'], r)) for r in rows_by_name(w_, [0, 165, 215, 275, 320], 165, titles['Indossati/Vestiti'] + 22, cost_lines[1] - 1) if r[0]]
    # vitto: nome | costo | nota (la nota include "Peso x kg" nel testo)
    vit_end = min(w['top'] for w in w_ if w['text'] == 'Costo:' and w['top'] > titles['Vitto,'])
    out['vitto'] = [dict(zip(['n', 'costo', 'note'], r)) for r in rows_by_name(w_, [0, 160, 232], 160, titles['Vitto,'] + 22, vit_end - 1) if r[0]]
    # note a piè di tabella (vitto)
    foot = [w for w in w_ if w['top'] >= vit_end - 1]
    fl = {}
    for w in foot:
        fl.setdefault(round(w['top'] / 2.5), []).append(w)
    out['vitto_note'] = [g.cell_text(fl[k]) for k in sorted(fl)]
    # pagina 4 (indice 4): Trasporti
    pg = pdf.pages[4]
    w_ = g.words(pg)
    y0 = min(w['top'] for w in w_ if w['text'] == 'Mezzo') + 6
    y1 = min(w['top'] for w in w_ if w['text'] == 'Costo:') - 1
    rows = rows_by_name(w_, [0, 172, 260, 370, 455], 172, y0, y1)
    out['trasporti'] = [dict(zip(['n', 'costo', 'vel', 'cap', 'cav'], r)) for r in rows if r[0]]
    fl = {}
    for w in [w for w in w_ if w['top'] >= y1]:
        fl.setdefault(round(w['top'] / 2.5), []).append(w)
    out['trasporti_note'] = [g.cell_text(fl[k]) for k in sorted(fl)]
    # note a piè di tabella degli oggetti (pagine 2 e 3)
    out['oggetti_note'] = 'Costo: può variare in base alla disponibilità e alla zona. T.P.: Tempo di Produzione espresso in giorni (se non indicato diversamente). Il materiale viene considerato già presente.'
    return out


# ------------------------------------------------------------------ Metalli e gemme
def metalli(path):
    pdf = pdfplumber.open(path)
    out = {'metalli': [], 'gemme': [], 'note_metalli': [], 'note_gemme': [], 'descr': []}
    # descrizioni (pagina 2 del PDF)
    txt = subprocess.run(['pdftotext', '-f', '2', '-l', '2', '-layout', path, '-'], capture_output=True, text=True).stdout
    paras = [re.sub(r'\s+', ' ', p).strip() for p in re.split(r'\n\s*\n', txt) if p.strip()]
    for p_ in paras:
        if 'Adamante:' in p_:
            p_ = p_[p_.index('Adamante:'):]
        m = re.match(r'^([A-ZÀ-Ý][\wà-ÿ]+(?: [\wà-ÿ]+)?): (.*)$', p_)
        if m:
            out['descr'].append({'n': m.group(1), 't': m.group(2)})
    page = pdf.pages[2]
    ws = g.words(page)
    state = None
    for b in g.bands(page):
        inb = g.in_band(ws, b)
        if not inb:
            continue
        txt_ = g.cell_text(inb)
        if txt_.startswith('Costo di Tempo di Metallo') or ('Metallo' in txt_ and 'Bonus' in txt_ and 'Valore' in txt_ and 'Note' in txt_):
            state = 'm'
            continue
        if txt_.startswith('Gemma Rarità'):
            state = 'g'
            continue
        if state == 'm' and txt_.startswith('Bonus:'):
            state = 'notem'
        if state == 'm':
            c = g.split_cols(inb, [0, 100, 160, 225, 285, 345])
            out['metalli'].append({'n': c[0], 'bonus': c[1], 'valore': c[2], 'lav': c[3], 'tempo': c[4], 'note': c[5]})
        elif state == 'notem':
            ln = {}
            for w in inb:
                ln.setdefault(round(w['top'] / 2.5), []).append(w)
            for k in sorted(ln):
                out['note_metalli'].append(g.cell_text(ln[k]))
            state = 'gem0'
        elif state in ('g', 'gem0') and not out.get('_gstart'):
            pass
        if state == 'g' or state == 'gem0':
            pass
    # le gemme: dalla banda dopo la testata «Gemma»
    started = False
    for b in g.bands(page):
        inb = g.in_band(ws, b)
        txt_ = g.cell_text(inb)
        if txt_.startswith('Gemma Rarità'):
            started = True
            continue
        if not started or not inb:
            continue
        # la prima banda ha le parole «Ambra» sfalsate: si usa comunque la colonna x
        c = g.split_cols(inb, [0, 100, 225, 335])
        out['gemme'].append({'n': c[0], 'rarita': c[1], 'tipo': c[2], 'prop': c[3]})
    # note delle gemme: testo sotto la tabella (ultima pagina)
    full = subprocess.run(['pdftotext', '-f', '3', '-l', '3', '-layout', path, '-'], capture_output=True, text=True).stdout
    i = full.index('Rarità-Valore:')
    out['note_gemme'] = [re.sub(r'\s+', ' ', full[i:]).strip()]
    return out


# ------------------------------------------------------------------ Erbe (TS-5)
DIFF = {'Facile', 'Normale', 'Media', 'Banale', 'Difficile', 'Diff.ssim', 'Diff.ssima', 'Diff.ssim..', 'M.Diff.', 'M.', 'Folle', 'Assurdo', 'Assurda', 'Normale', 'M.Diffic.', 'M.Diff', 'M. Diff', 'Diff.', 'Diff'}
COLOR_CAT = {(1.0, 0.0, 0.0): 'cur', (0.0, 0.0, 1.0): 'var', (0.0, 0.502, 0.0): 'vel', (0.502, 0.0, 0.502): 'mal'}


def yc(w):
    return round((w['top'] + w['bottom']) / 2, 1)


def dp_blocks(ys, centers):
    """Divide le righe di effetti ys (ordinate) in blocchi contigui, uno per centro, che minimizza lo scarto."""
    n, r = len(ys), len(centers)
    INF = float('inf')
    best = [[INF] * (n + 1) for _ in range(r + 1)]
    back = [[0] * (n + 1) for _ in range(r + 1)]
    best[0][0] = 0
    for i in range(1, r + 1):
        for j in range(i, n + 1):
            for k in range(max(i - 1, j - 6), j):
                if best[i - 1][k] == INF:
                    continue
                m = sum(ys[k:j]) / (j - k)
                c = best[i - 1][k] + abs(m - centers[i - 1])
                if c < best[i][j]:
                    best[i][j] = c
                    back[i][j] = k
    assert best[r][n] < INF, 'partizione impossibile'
    cuts = []
    j = n
    for i in range(r, 0, -1):
        k = back[i][j]
        cuts.append((k, j))
        j = k
    return list(reversed(cuts))


def line_group(ws, tol=2.0):
    """Raggruppa le parole in righe di testo (stessa ordinata centrale)."""
    lines = []
    for w in sorted(ws, key=lambda w: (yc(w), w['x0'])):
        if lines and abs(lines[-1][0] - yc(w)) <= tol:
            lines[-1][1].append(w)
        else:
            lines.append([yc(w), [w]])
    return lines


def erbe(path):
    """Le erbe sono righe di una tabella con celle allineate in alto o al centro e testi su più righe: l'ordine
    del flusso del PDF (cella per cella, riga per riga) è l'unico dato che le assegna senza ambiguità."""
    pdf = pdfplumber.open(path)
    herbs, dis, climates = [], [], []
    climate = None
    for pi in range(1, 8):
        page = pdf.pages[pi]
        allw = page.extract_words(keep_blank_chars=False, use_text_flow=True, extra_attrs=['non_stroking_color'])
        hdr = [yc(w) for w in allw if w['text'] == 'Difficoltà']
        assert hdr, 'intestazione colonne non trovata a pagina %d' % pi
        yb = None
        for w in allw:
            if w['text'] == 'Malattie' and w['x0'] > 200 and yc(w) > hdr[0]:
                yb = yc(w)
        ws = [w for w in allw if yc(w) > hdr[0] + 3 and (yb is None or yc(w) < yb - 1)]
        # numeri di pagina in fondo (parola isolata al centro, sotto la tabella)
        ws = [w for w in ws if not (re.match(r'^\d$', w['text']) and yc(w) > 755 and 280 < w['x0'] < 310)]
        isK = lambda w: 516 <= w['x0'] < 548 and re.match(r'^\d+$', w['text'])
        isL = lambda w: w['x0'] >= 548 and re.match(r'^\d+(/\d+)?$', w['text'])
        segs, cur = [], []
        for i, w in enumerate(ws):
            cur.append(w)
            if isK(w):
                if i + 1 < len(ws) and isL(ws[i + 1]) and abs(yc(ws[i + 1]) - yc(w)) < 1.5:
                    continue
                segs.append(cur)
                cur = []
            elif cur and len(cur) > 1 and isL(w) and isK(cur[-2]):
                segs.append(cur)
                cur = []
        assert not cur, 'parole residue dopo l\'ultima riga a pagina %d: %r' % (pi, [w['text'] for w in cur])
        for seg in segs:
            kw = [w for w in seg if isK(w)]
            assert len(kw) == 1, [w['text'] for w in seg]
            # riga della cella del costo = riga dei dati (D, N, P, C)
            cw = [w for w in seg if 215 <= w['x0'] < 250 and re.match(r'^(\d|-)', w['text'])]
            assert cw, [w['text'] for w in seg]
            yD = yc(cw[0])
            first = next(i for i, w in enumerate(seg) if abs(yc(w) - yD) < 1.2)
            head, row = seg[:first], seg[first:]
            # testate (clima, terreno) davanti alla riga: sostituiscono quelle precedenti
            if head:
                tl = []
                for y, lw in line_group(head):
                    lw = sorted(lw, key=lambda w: w['x0'])
                    t = ' '.join(w['text'] for w in lw)
                    if lw[0]['text'] == 'Clima' and lw[0]['x0'] > 200:
                        climate = t
                        terrain_cur[0] = None
                        if t not in climates:
                            climates.append(t)
                    else:
                        tl.append(t)
                assert len(tl) <= 1, tl
                if tl:
                    terrain_cur[0] = tl[0]
            terrain = terrain_cur[0]
            ro = [w for w in row]
            def cell(lo, hi):
                return ' '.join(w['text'] for w in ro if lo <= w['x0'] < hi and abs(yc(w) - yD) < 1.2) if lo < 250 else ' '.join(w['text'] for w in ro if lo <= w['x0'] < hi)
            name_w = [w for w in ro if 75 <= w['x0'] < 145 and abs(yc(w) - yD) < 1.2]
            colr = COLOR_CAT.get(tuple(round(v, 3) for v in name_w[0]['non_stroking_color']), '?')
            yK = yc(kw[0])
            af = ' '.join(w['text'] for w in ro if 494 <= w['x0'] < 516 and abs(yc(w) - yK) < 1.5)
            lv = ' '.join(w['text'] for w in ro if w['x0'] >= 548 and abs(yc(w) - yK) < 1.5)
            used = [w for w in ro if (w['x0'] < 250 and abs(yc(w) - yD) < 1.2) or 250 <= w['x0'] < 494 or w is kw[0] or (494 <= w['x0'] < 516 and abs(yc(w) - yK) < 1.5) or (w['x0'] >= 548 and abs(yc(w) - yK) < 1.5)]
            assert len(used) == len(ro), (kw[0]['text'], [w['text'] for w in ro if w not in used])
            herbs.append({
                'cod': int(kw[0]['text']), 'dif': cell(0, 75), 'n': cell(75, 145), 'uso': cell(145, 215), 'costo': cell(215, 250),
                'eff': ' '.join(w['text'] for w in ro if 250 <= w['x0'] < 494), 'af': af, 'lv': lv, 'cat': colr, 'clima': climate, 'terreno': terrain,
            })
        # malattie (solo sulla pagina che le contiene)
        if yb is not None:
            dws = [w for w in allw if yc(w) > yb]
            started = False
            ctx_clima = None
            for y, lw in line_group(dws):
                lw = sorted(lw, key=lambda w: w['x0'])
                t = ' '.join(w['text'] for w in lw)
                if t.startswith('Difficoltà Nome Provenienza'):
                    started = True
                    continue
                if t.startswith('Legenda Colori'):
                    break
                if not started:
                    continue
                if lw[0]['text'] == 'Clima' and lw[0]['x0'] < 40:
                    ctx_clima = t
                    continue
                def col(lo, hi, src=lw):
                    return ' '.join(w['text'] for w in src if lo <= w['x0'] < hi)
                cod = col(512, 540)
                dis.append({'dif': col(0, 70), 'n': col(70, 135), 'prov': col(135, 210), 'luogo': col(210, 282), 'eff': col(282, 512),
                            'cod': int(cod), 'lv': col(540, 700), 'clima': ctx_clima, 'cat': COLOR_CAT.get(tuple(round(v, 3) for v in lw[1]['non_stroking_color']), '?')})
    return herbs, dis, climates


terrain_cur = [None]


def erbe_uso(path):
    txt = subprocess.run(['pdftotext', '-f', '8', '-l', '8', '-layout', path, '-'], capture_output=True, text=True).stdout
    i = txt.index('MODALITA’ D’USO')
    blk = txt[i:]
    lines = [l for l in blk.split('\n')[1:] if l.strip()]
    out, cur = [], None
    for l in lines:
        m = re.match(r'^ ?([A-ZÀ-Ý][A-Za-zÀ-ÿ’]+)\s{2,}(.*)$', l)
        if m and (m.group(1).isupper() or m.group(1) in ('Infuso', 'Ingestione', 'Applicazione', 'Pasta', 'Liquido', 'Polvere')):
            cur = {'n': m.group(1), 't': m.group(2).strip()}
            out.append(cur)
        elif cur and l.strip().isdigit():
            continue
        elif cur:
            cur['t'] += ' ' + l.strip()
    return out


def dumps(o, ind=0):
    """JSON compatto: una riga per voce nelle liste di oggetti."""
    pad = ' ' * (ind + 1)
    if isinstance(o, dict):
        return '{\n' + ',\n'.join(pad + json.dumps(k, ensure_ascii=False) + ': ' + dumps(v, ind + 1) for k, v in o.items()) + '\n' + ' ' * ind + '}'
    if isinstance(o, list) and o and isinstance(o[0], dict):
        return '[\n' + ',\n'.join(pad + json.dumps(x, ensure_ascii=False, separators=(',', ':')) for x in o) + '\n' + ' ' * ind + ']'
    return json.dumps(o, ensure_ascii=False, separators=(',', ':'))


def main():
    arm, eq, met, erb = sys.argv[1:5]
    data = {'armature': armature(arm), 'equip': equip(eq), 'metalli': metalli(met)}
    herbs, dis, climates = erbe(erb)
    terreni = []
    for h in herbs:
        if h['terreno'] not in terreni:
            terreni.append(h['terreno'])
        h['cl'] = climates.index(h['clima'])
        h['te'] = terreni.index(h['terreno'])
        del h['clima'], h['terreno']
    dclimi = []
    for d in dis:
        if d['clima'] not in dclimi:
            dclimi.append(d['clima'])
        d['cl'] = dclimi.index(d['clima'])
        del d['clima']
    assert [h['cod'] for h in herbs] == list(range(1, 348)), 'codici delle erbe non consecutivi'
    assert [d['cod'] for d in dis] == list(range(600, 618)), 'codici delle malattie non consecutivi'
    assert all(h['cat'] != '?' for h in herbs) and all(d['cat'] != '?' for d in dis)
    data['erbe'] = herbs
    data['erbeClimi'] = climates
    data['erbeTerreni'] = terreni
    data['malattie'] = dis
    data['malattieClimi'] = dclimi
    data['erbeUso'] = erbe_uso(erb)
    # controlli di conteggio sui PDF (vedi anche tests/gear.test.js)
    a = data['armature']
    assert [len(x['rows']) for x in a['body']] == [4, 4, 4, 4, 4] and len(a['elmi']) == 9 and len(a['scudi']) == 4
    e = data['equip']
    assert (len(e['armi']), len(e['prot']), len(e['accessori']), len(e['borse']), len(e['vestiti']), len(e['vitto']), len(e['trasporti'])) == (55, 43, 68, 8, 12, 28, 35)
    m = data['metalli']
    assert (len(m['metalli']), len(m['gemme']), len(m['descr'])) == (23, 18, 26)
    sys.stdout.write('/* GENERATO da tools/extract-gear.py a partire dai PDF di Istaro Quettar (Armature, Equipaggiamento e prezzi, Metalli e Gemme,\n   Erbe/Veleni/Malattie). Non modificare a mano. Testi e numeri come nei PDF (refusi compresi); il campo «cat» delle erbe deriva dal colore\n   del nome secondo la legenda del PDF (cur: erba curativa, var: erba varia/d\'utilità, vel: veleno, mal: malattia/effetto ambientale). */\n')
    sys.stdout.write('(function (root) {\n  var G = root.GIRSA = root.GIRSA || {};\n  G.geardata = ' + dumps(data, 2) + ';\n  if (typeof module !== \'undefined\') module.exports = G.geardata;\n})(typeof window !== \'undefined\' ? window : globalThis);\n')


if __name__ == '__main__':
    main()
