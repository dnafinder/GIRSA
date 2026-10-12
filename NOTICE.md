# Provenienza dei dati e licenza

## Codice
Il codice è sotto licenza MIT (vedi `LICENSE`).

## Parametri di regolamento
`js/data.js` contiene i valori necessari ai calcoli (bonus alle caratteristiche, bonus ai gradi,
modifiche dei popoli, tabella dell'esperienza, tabella di guarigione, modificatori all'attacco,
modificatori ai colpi critici). Sono stati ricavati a mano dal compendio **«Istaro Quettar»** di
**Filduin** (sito: <https://www.istaroquettar.it>), basato su GIRSA 2ª/3ª edizione. Il compendio è distribuito per uso personale o
distribuzione gratuita, non per la vendita, e il suo contenuto non va modificato.

Di conseguenza:

- questo progetto è pensato per **uso personale**: non va venduto né usato commercialmente;
- si consiglia di tenere il repository **privato**;
- `js/tabledata.js` e `js/weapondata.js` contengono le **tabelle di attacco (TA), dei colpi critici (TC), dei fallimenti (TTM) e delle armi (TSC-1)**, estratte
  senza modifiche dai PDF con `tools/extract-tables.py`: per questo il repository **deve restare privato** e il file non va
  distribuito né pubblicato;
- le tabelle `TB-1`, `TB-3`, `TB-4`, `TE-5`, `TFC-2` sono state trascritte da immagini: vale la pena
  ricontrollarle sul PDF (i test in `tests/` verificano i calcoli, non la fedeltà della trascrizione).

- `js/creationdata.js` contiene popoli, professioni, background, punti sviluppo e relative tabelle, **trascritti a mano** dai PDF di creazione del personaggio (in gran parte immagini);
  `js/creationpdf.js` e `js/secdata.js` sono generati da `tools/extract-creation.py` (gradi di adolescenza e abilità secondarie). Valgono le stesse condizioni: uso personale, repository privato, niente vendita.
  La scelta di pubblicare con GitHub Pages rende il repository pubblico: è una decisione tua, non dell'app.

- `js/combatdata.js` e `js/combatrules.js` sono generati dai PDF del compendio con `tools/extract-combat.py` e `tools/extract-combatrules.py` (TA-9, TRR, TSC-3/4/5 e il testo del Prospetto sul Combattimento).
  Le tabelle dei tipi di incantesimi, delle classi, del TFI e il testo sulla Corruzione sono in immagini nel PDF e sono stati trascritti a mano in `js/refcombat.js`, così come le piccole tabelle del Prospetto sul Combattimento (modificatori al BO, parata, scudi, «Oltre il 150») e la TSC-2 degli animali.
  I critici mirati da punta (TCM-1…4) stanno in `js/tabledata.js`, generato da `tools/extract-tables.py`. Valgono le stesse condizioni: uso personale, repository privato, niente vendita.

- `js/geardata.js` è generato da `tools/extract-gear.py` (con `tools/pdfgrid.py`) dai PDF «Armature» (TSC-4), «Equipaggiamento e Prezzi» (TS-4), «Metalli e Gemme» ed «Erbe per Girsa» (TS-5): tabelle e testi come nei PDF, refusi compresi. La categoria delle erbe deriva dal colore del nome, secondo la legenda del PDF. Valgono le stesse condizioni: uso personale, repository privato, niente vendita.

- `js/worlddata.js` è generato da `tools/extract-world.py` dai PDF «Animali e mostri tolkeniani» (TS-2) e «Manovre Statiche» (TM-2), «Freddo e Caldo» (TRR-2), «Pirocinesi» e «Potenziamento corporeo» (liste), che hanno il testo, e da `tools/world_hand.py`, dove ho trascritto a mano dalle immagini dei PDF «Punti Esperienza» (TE-0…TE-7), «Manovre in Movimento» (TM-1), «Precipitazioni e Temperature» (TS-8, TS-8.2), «Incontri e Rischio Incantesimi» (TS-10, TS-12), «Tabelle dei tesori e oggetti magici» (TS-6, TS-7) e «Mutaforma»: tabelle e testi come nei PDF, refusi compresi. Valgono le stesse condizioni: uso personale, repository privato, niente vendita.

GIRSA e «Il Signore degli Anelli» appartengono ai rispettivi titolari. Il progetto non è affiliato a nessuno di loro.

- `js/namedata.js`: elenco di nomi di personaggi di J.R.R. Tolkien raccolti il 12/10/2026 dalle pagine di categoria di Tolkien Gateway (<https://tolkiengateway.net>); non fa parte del compendio «Istaro Quettar». Sono solo nomi propri, senza testi tratti dal sito.
