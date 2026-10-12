"""Utilità comuni per leggere le tabelle dei PDF di Istaro Quettar con pdfplumber.
Le tabelle hanno bordi disegnati come rettangoli sottili: le righe si ricavano da lì, così le celle su più
righe di testo (o sfalsate in verticale) restano nella riga giusta."""
import re


def hborders(page, min_w=15, max_h=2.2):
    """Ordinate (centro) dei bordi orizzontali, raggruppate e ordinate."""
    ys = []
    for r in page.rects:
        if (r['bottom'] - r['top']) <= max_h and (r['x1'] - r['x0']) >= min_w:
            ys.append((r['top'] + r['bottom']) / 2)
    for l in page.lines:
        if abs(l['top'] - l['bottom']) < 1 and (l['x1'] - l['x0']) >= min_w:
            ys.append((l['top'] + l['bottom']) / 2)
    ys.sort()
    out = []
    for y in ys:
        if not out or y - out[-1] > 2.0:
            out.append(y)
    return out


def bands(page, y0=0, y1=None):
    ys = [y for y in hborders(page) if y >= y0 and (y1 is None or y <= y1)]
    return list(zip(ys[:-1], ys[1:]))


def words(page):
    return page.extract_words(keep_blank_chars=False, use_text_flow=False)


def in_band(ws, band, xmin=0, xmax=10000):
    top, bot = band
    return [w for w in ws if top <= (w['top'] + w['bottom']) / 2 < bot and xmin <= w['x0'] < xmax]


def cell_text(ws):
    """Parole di una cella in ordine di lettura (per riga di testo, poi x)."""
    ws = sorted(ws, key=lambda w: (round(w['top'] / 3), w['x0']))
    return re.sub(r'\s+', ' ', ' '.join(w['text'] for w in ws)).strip()


def split_cols(ws, bounds):
    """bounds: lista di x di inizio colonne (la prima è il limite sinistro). Ritorna lista di testi."""
    cols = [[] for _ in bounds]
    for w in ws:
        i = 0
        for k, b in enumerate(bounds):
            if w['x0'] >= b - 0.5:
                i = k
        cols[i].append(w)
    return [cell_text(c) for c in cols]
