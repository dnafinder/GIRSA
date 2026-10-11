# GIRSA Companion

Scheda del personaggio e strumenti da tavolo per **GIRSA** (Gioco di Ruolo del Signore degli Anelli),
pensati per giocare i **librigame** da telefono o da computer. Nessun server, nessun account: tutto resta
nel browser e funziona anche senza rete.

## Usarla

**Come sito (GitHub Pages)**: con Pages attivo sul ramo `main`, cartella radice, l'app è su
`https://dnafinder.github.io/GIRSA/`. Dal telefono si può aggiungere alla schermata Home e funziona offline.

**Come file unico**: `dist/girsa.html` si apre con un doppio clic nel browser; da GitHub: apri il file, poi
«Download raw file». Se modifichi il codice, rigenera il file con `npm run build` e committalo.

## Che cosa fa

- **Scheda**: caratteristiche con bonus TB-1 e distribuzione dei 400 punti, popoli con modifiche TB-3,
  abilità con bonus ai gradi (TB-4), difese e tiri resistenza, PF con soglia di morte, inventario,
  incantesimi, note. I totali si aggiornano mentre scrivi e ogni voce ha il suo pulsante 🎲.
- **PF sempre in vista** in alto, con pulsanti −10 −5 −1 +1 +5 +10; l'ultimo tiro resta in basso.
- **Dadi**: d100 aperto e chiuso, d4–d20, espressioni come `2d6+1`, cronologia.
- **Combattimento**: attacco (tiro + BO − BD + modificatori) con lettura della tabella di attacco dell'arma,
  colpo maldestro o fallimento con la relativa tabella, colpo critico con il modificatore della lettera,
  elenco avversari con PF, registro.
- **Diario**: paragrafo attuale, registro delle scelte e segnalini per il librogame.
- **Dati**: impostazioni di calcolo, aiuto per la guarigione (TFC-2), tabelle aggiuntive tue,
  esportazione e importazione di una copia di sicurezza.

## Tabelle incluse

Dai PDF del compendio sono già incorporate le tabelle di attacco **TA-1…TA-8, TA-10, TA-11** (la TA-9 non è nel documento),
dei colpi critici **TC-1…TC-13** e dei fallimenti **TTM-1…TTM-7**. Nel combattimento scegli la tabella dell'arma e
l'armatura del bersaglio; per i critici scegli la tabella in base al tipo di danno dell'arma.

Il compendio fornito non contiene la tabella TSC-1 con le statistiche delle armi, quindi due dati li inserisci tu:
il **tiro massimo di colpo maldestro** e il **tipo di critico** di ciascuna arma: li inserisci una volta sola in Scheda → Armi, insieme alla tabella di attacco e all'abilità, e poi nel combattimento scegli l'arma e tutto si compila da solo.

## Copia di sicurezza

I dati stanno nel browser del dispositivo e svuotare i dati del sito li cancella. Ogni tanto usa
Dati → Esporta, e Dati → Importa per ripristinare.

## Che cosa il compendio non dice (scelte dell'app)

- **Tiro «aperto»**: non è definito nei PDF. Si usa la convenzione MERP (≥ 96 si somma un altro tiro; ≤ 5 si
  sottrae). Le soglie si cambiano in Dati.
- **Resistenza fisica**: la progressione è a dadi, quindi il bonus ai gradi si inserisce a mano.
- **Abilità secondarie**: si usa la progressione primaria; il testo non indica altro.
- **Esperienza (TE-5)**: non è chiaro se la soglia sia per raggiungere o per lasciare il livello; l'app la mostra solo come informazione.
- **Limiti nelle tabelle TA-5/TA-6 e TA-7**: nei PDF le etichette «Risultati Massimi con Attacchi …» e
  «… per i Dardi di …» chiudono il blocco di righe che le precede; l'app limita il risultato al massimo di quel blocco.
- **Fallimenti**: la tabella suggerita per ogni arma (TTM-1 mischia, TTM-2 tiro, TTM-6 lancio, TTM-3 incantesimi) è
  una mia associazione, che puoi cambiare; il d100 dei fallimenti è chiuso come per i critici, il testo non lo precisa.
- **Risultato oltre l'ultima riga** di una tabella: si usa l'ultima riga, il testo non prevede altro.
- **Tag AS** delle abilità: non spiegato nei documenti, riportato com'è.

## Per chi sviluppa

`npm test` esegue i test (Node 20 o successivo, nessuna dipendenza): calcoli, dadi, lettura delle tabelle e
controlli sui valori letti dai PDF.

```
index.html, css/, js/   l'app (JavaScript semplice, senza dipendenze)
js/data.js              parametri di regolamento (vedi NOTICE.md)
js/rules.js             calcoli
js/dice.js              dadi
js/tables.js            consultazione delle tabelle
js/tabledata.js         tabelle del compendio, generate da tools/extract-tables.py
js/store.js             salvataggio locale
tools/build.mjs         crea dist/girsa.html
tools/extract-tables.py rigenera js/tabledata.js dai PDF (serve poppler e pdfplumber)
tests/                  test
```

Vedi anche `NOTICE.md` (provenienza e licenza dei dati) e `data/README.md` (formato JSON per aggiungere tabelle).
