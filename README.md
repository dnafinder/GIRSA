# GIRSA Companion

Scheda del personaggio e strumenti da tavolo per **GIRSA** (Gioco di Ruolo del Signore degli Anelli),
pensati per giocare i **librigame** da telefono o da computer. Nessun server, nessun account: tutto resta
nel browser e funziona anche senza rete.

## Che cosa fa

- **Scheda**: caratteristiche con bonus TB-1 e distribuzione dei 400 punti, popoli con modifiche TB-3,
  abilità con bonus ai gradi (TB-4), difese e tiri resistenza, PF con soglia di morte, inventario,
  incantesimi, note. I totali si aggiornano mentre scrivi e ogni voce ha il suo pulsante 🎲.
- **PF sempre in vista** in alto, con pulsanti −10 −5 −1 +1 +5 +10; l'ultimo tiro resta in basso.
- **Dadi**: d100 aperto e chiuso, d4–d20, espressioni come `2d6+1`, cronologia.
- **Combattimento**: attacco (tiro + BO − BD + modificatori), lettura della tabella di attacco,
  fallimento critico, colpo critico con il modificatore della lettera, elenco avversari con PF, registro.
- **Diario**: paragrafo attuale, registro delle scelte e segnalini per il librogame.
- **Dati**: importazione delle tabelle, impostazioni, aiuto per la guarigione (TFC-2), esportazione e
  importazione di una copia di sicurezza.

## Usarla

**Il modo più semplice, senza installare niente**
```
npm run build
```
crea `dist/girsa.html`, un unico file che si apre con un doppio clic o si copia sul telefono.

**Come sito**: servi la cartella con un server statico qualsiasi (`npx serve .`). Da http(s) l'app si
installa come PWA e funziona offline.

**Sviluppo**: `npm test` esegue i test (Node 20 o successivo, nessuna dipendenza).

## Prima di giocare

1. Apri **Dati** e importa le tabelle di attacco (una per arma) e dei colpi critici copiandole dal tuo PDF.
   Senza tabelle l'app calcola il risultato e ti dice quale riga cercare sulla carta.
2. Fai una **copia di sicurezza** ogni tanto: i dati stanno nel browser, e svuotare i dati del sito li cancella.

## Che cosa il compendio non dice (scelte dell'app)

- **Tiro «aperto»**: non è definito nei PDF. Si usa la convenzione MERP (≥ 96 si somma un altro tiro; ≤ 5 si
  sottrae). Le soglie si cambiano in Dati.
- **Resistenza fisica**: la progressione è a dadi, quindi il bonus ai gradi si inserisce a mano.
- **Abilità secondarie**: si usa la progressione primaria; il testo non indica altro.
- **Esperienza (TE-5)**: non è chiaro se la soglia sia per raggiungere o per lasciare il livello; l'app la mostra solo come informazione.
- **Tag AS** delle abilità: non spiegato nei documenti, riportato com'è.

## Struttura

```
js/data.js      parametri di regolamento (vedi NOTICE.md)
js/rules.js     calcoli puri
js/dice.js      dadi
js/tables.js    lettura e consultazione delle tabelle importate
js/store.js     salvataggio locale
js/*.js         pagine e interfaccia
tools/build.mjs file unico dist/girsa.html
tests/          test con dati sintetici
```

Vedi anche `NOTICE.md` (provenienza e licenza dei dati) e `data/README.md` (formato JSON delle tabelle).
