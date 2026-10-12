#!/usr/bin/env python3
"""
Estrae il testo del «Prospetto sul Combattimento in Girsa» (Combattimento.pdf, compendio «Istaro Quettar») e scrive js/combatrules.js:
l'elenco delle sezioni con i paragrafi, le voci di elenco e i punti in cui l'app inserisce una tabella (trascritta in js/refcombat.js).

Uso:  python3 tools/extract-combatrules.py COMBATTIMENTO.pdf
Richiede poppler (pdftotext). Il PDF non fa parte del repository.
I paragrafi si ricostruiscono dalle righe del PDF: una riga corta che finisce con un punto chiude il paragrafo.
"""
import json, os, re, subprocess, sys

HEADS = ["Modificatori al Bonus Offensivo", "Tiro Iniziativa", "Bonus Difensivo", "Parare", "Uso di due armi a una mano", "Arti Marziali", "Difesa adrenalinica",
         "Stordimento", "Accecato/Al Buio", "Ingaggiato", "Incantesimi in Combattimento", "Movimento e Attacco (Carica)", "Movimento in Combattimento e Disimpegno",
         "Attacco a Distanza, Gittata, Mira", "Combattimento a Cavallo", "Colpi Critici su esseri Grandi o Enormi", "Colpo Critico Alternativo",
         "Attacchi aggiuntivi e Velocita’ in Combattimento", "Abilita’ con le Armi aggiuntive", "Oltre il 150"]
TITLES = {"Accecato/Al Buio": "Accecato / al buio", "Attacchi aggiuntivi e Velocita’ in Combattimento": "Attacchi aggiuntivi e velocità in combattimento",
          "Abilita’ con le Armi aggiuntive": "Abilità con le armi aggiuntive"}
NEWP = re.compile(r'^(Colpo di Scudo|Spezza Scudo|Abilità con Pugnale|Lancio Veloce|Con un Arma da Tiro|Esempio|\(Esempio|Per togliersi)')
LI = re.compile(r'^([-+]\s?\S|\d- )')


def main():
    if len(sys.argv) != 2:
        raise SystemExit(__doc__)
    src = subprocess.run(['pdftotext', '-layout', '-f', '2', '-l', '5', sys.argv[1], '-'], capture_output=True, text=True, check=True).stdout
    secs, cur = [], None
    for l in src.split('\n'):
        t = l.strip()
        if t in HEADS:
            cur = {'t': TITLES.get(t, t), 'src': t, 'lines': []}
            secs.append(cur)
        elif cur is not None and t:
            cur['lines'].append(t)
    assert [s['src'] for s in secs] == HEADS, [s['src'] for s in secs]
    out = []
    for s in secs:
        L = s['lines']
        items = []
        if s['src'] == 'Modificatori al Bonus Offensivo':
            items.append({'table': 'bo'})
        elif s['src'] == 'Oltre il 150':
            items.append({'p': ' '.join(L[:2])})
            items.append({'table': 'oltre150'})
        else:
            buf = []

            def flush():
                if buf:
                    items.append({'p': ' '.join(buf)})
                    buf.clear()
            i = 0
            while i < len(L):
                t = L[i]
                if s['src'] == 'Parare' and t.startswith('Armi  '):
                    flush()
                    items.append({'table': 'parata'})
                    while i < len(L) and not t.startswith('Alcune armi particolari'):
                        i += 1
                        t = L[i]
                    continue
                if s['src'] == 'Abilita’ con le Armi aggiuntive' and t == 'Statistiche Offensive degli Scudi':
                    flush()
                    items.append({'table': 'scudi'})
                    while not L[i].startswith('*Un essere Grande'):
                        i += 1
                    items.append({'p': L[i]})
                    i += 1
                    continue
                prev_li = bool(items) and ('li' in items[-1]) and not buf
                intro = bool(items) and 'p' in items[-1] and items[-1]['p'].endswith(':') and not buf
                if LI.match(t) and (prev_li or intro):
                    flush()
                    items.append({'li': re.sub(r'\s{2,}', ': ', re.sub(r'^- ', '', t))})
                    i += 1
                    continue
                if NEWP.match(t):
                    flush()
                buf.append(t)
                if len(t) < 128 and re.search(r'[.):]$', t):
                    flush()
                i += 1
            flush()
            # il «Tiro Iniziativa» e «Ingaggiato» hanno una riga introduttiva prima dell'elenco
        out.append({'t': s['t'], 'items': items})
    root = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
    js = ("/* Generato da tools/extract-combatrules.py dal compendio «Istaro Quettar» (Filduin). Non modificare a mano. Vedi NOTICE.md. */\n"
          "(function (root) {\n  var G = root.GIRSA = root.GIRSA || {};\n  G.combatrules = %s;\n"
          "  if (typeof module !== 'undefined') module.exports = G.combatrules;\n"
          "})(typeof window !== 'undefined' ? window : globalThis);\n") % json.dumps(out, ensure_ascii=False, separators=(',', ':'))
    with open(os.path.join(root, 'js', 'combatrules.js'), 'w', encoding='utf-8') as f:
        f.write(js)
    print('sezioni:', len(out), [(s['t'], len(s['items'])) for s in out])


main()
