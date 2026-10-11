# Provenienza dei dati e licenza

## Codice
Il codice è sotto licenza MIT (vedi `LICENSE`).

## Parametri di regolamento
`js/data.js` contiene i valori necessari ai calcoli (bonus alle caratteristiche, bonus ai gradi,
modifiche dei popoli, tabella dell'esperienza, tabella di guarigione, modificatori all'attacco,
modificatori ai colpi critici). Sono stati ricavati a mano dal compendio **«Istaro Quettar»** di
**Filduin**, basato su GIRSA 2ª/3ª edizione. Il compendio è distribuito per uso personale o
distribuzione gratuita, non per la vendita, e il suo contenuto non va modificato.

Di conseguenza:

- questo progetto è pensato per **uso personale**: non va venduto né usato commercialmente;
- si consiglia di tenere il repository **privato**;
- `js/tabledata.js` contiene le **tabelle di attacco (TA), dei colpi critici (TC) e dei fallimenti (TTM)**, estratte
  senza modifiche dai PDF con `tools/extract-tables.py`: per questo il repository **deve restare privato** e il file non va
  distribuito né pubblicato;
- le tabelle `TB-1`, `TB-3`, `TB-4`, `TE-5`, `TFC-2` sono state trascritte da immagini: vale la pena
  ricontrollarle sul PDF (i test in `tests/` verificano i calcoli, non la fedeltà della trascrizione).

GIRSA e «Il Signore degli Anelli» appartengono ai rispettivi titolari. Il progetto non è affiliato a nessuno di loro.
