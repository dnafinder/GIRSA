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
- **Crea** (creazione guidata in sei passi): popolo (applica le modifiche TB-3, lingue e scheda completa), professione consentita
  al popolo e livello (bonus per livello TB-4.2 scritti nella colonna «Prof»), caratteristiche (tiro classico o 400 punti, controlli
  su principale/secondaria e sulle regole degli Elfi, Aspetto), background (punti del popolo, tabelle TGP-2 con le regole di
  ogni popolo), gradi di adolescenza (TGP-5), punti sviluppo con trasferimenti e passaggio di livello.
- **Guida**: consultazione di popoli, professioni, tabelle di creazione e delle 170 abilità secondarie (ricercabili, con pulsante per aggiungerle alla scheda), del Prospetto sul Combattimento, delle tabelle di copertura, gittata e animali, della magia (tipi, classi, TA-9, TRR, TSC-3) e della Corruzione.
- **Dadi**: d100 aperto e chiuso, d4–d20, espressioni come `2d6+1`, cronologia.
- **Combattimento**: iniziativa, attacco (tiro + BO − BD + modificatori) con lettura della tabella di attacco dell'arma scelta dal catalogo,
  colpo maldestro o fallimento con la relativa tabella, colpo critico con il modificatore della lettera,
  elenco avversari con PF, registro. In più: **incantesimi di attacco base** (TA-9 e tiro resistenza sulla TRR), **incantesimi inoffensivi** (TFI) e **gittata** (TSC-5).
- **Diario**: paragrafo attuale, registro delle scelte e segnalini per il librogame.
- **Dati**: impostazioni di calcolo, aiuto per la guarigione (TFC-2), tabelle aggiuntive tue,
  esportazione e importazione di una copia di sicurezza.

## Tabelle incluse

Dai PDF del compendio sono già incorporate le tabelle di attacco **TA-1…TA-8, TA-10, TA-11**, quella degli incantesimi base **TA-9** con i tiri resistenza **TRR**,
i colpi critici **TC-1…TC-13**, i critici mirati da punta **TCM-1…TCM-4**, i fallimenti **TTM-1…TTM-7**, la **tabella delle armi (TSC-1)** con 56 armi
e le tabelle **TSC-2** (animali), **TSC-3** (incantesimi), **TSC-4** (copertura) e **TSC-5** (gittata).

In **Scheda → Armi** aggiungi un'arma scegliendola dal catalogo e indichi l'abilità da cui prendere il BO. Nel **Combattimento**
scegli l'arma: tabella di attacco, colpo maldestro, tabella e tipo massimo dei critici, critico secondario e modificatori
«sulla TA» si compilano da soli. Resta da indicare l'armatura del bersaglio e il BD.

## Combattimento e magia: scelte dell'app

- **TA-9, colonna «Generale»**: il compendio non spiega a che cosa serva. L'app la usa quando il bersaglio non ha nessuna delle protezioni elencate per il regno (armatura di metallo o di cuoio per l'Essenza, armatura o scudo di metallo per il Flusso, elmo di metallo o di cuoio per il Mentalismo).
- **TRR oltre il 15° livello**: si applica la nota della tabella (+1 per ogni livello d'attacco oltre il 15°, −1 per ogni livello del bersaglio oltre il 15°). Le cifre «1, 5, 10, 15» a margine della tabella non sono spiegate e non sono usate.
- **Iniziativa**: il tiro è un d100 chiuso (il testo dice solo «1d100»). Il bonus alle Manovre in Movimento si legge dalla scheda o si scrive a mano.
- **Incantesimi inoffensivi (TFI)**: il compendio dice che le classi II e I valgono come già preparate da 1 e 2 round, ma non se si sommano ai round dedicati: li indichi tu. Il tiro è aperto, come scritto.
- **Gittata**: ai limiti tra due fasce (per esempio 10 m con base 10) la tabella dà lo stesso numero a entrambe; l'app usa la fascia più vicina.
- **«Oltre il 150»**: è una concessione facoltativa del GM, quindi l'app mostra solo il margine e la lettera suggerita; non tira il critico supplementare.
- **Modificatori al BO**: stordito (+20), atterrato (+30) e prono (+50) non si sommano tra loro: si applica il più alto. Le tabelle degli attacchi in mischia e a distanza dicono «stordito o a terra +20»: l'app segue il Prospetto sul Combattimento, che è più preciso.
- **Frusta**: nel PDF con i modificatori delle armi il −15 sulla TA compare solo nelle colonne piastre e maglia (con ½ PF); l'app lo applica solo lì. L'app non dimezza i PF: è un'indicazione nelle note dell'arma.
- **Azza (Bec de Corbin)**: due pagine del compendio non concordano. La tabella delle armi (TSC-1) dà −10 sulla TA contro cuoio e nessuna armatura; la tabella TA-10 con i modificatori dà −5. L'app segue la TSC-1: se vuoi il −5, cambia il modificatore a mano.
- **Rete da gladiatore e armi che dimezzano i PF**: i PF dimezzati non sono calcolati, solo segnalati.

## Creazione del personaggio: scelte dell'app

- **Abbinamento dei tiri alle caratteristiche**: il compendio lo lascia libero; «Assegna in automatico» mette i due valori più alti a principale e secondaria (con le regole degli Elfi su Prontezza), gli altri in ordine FR, AG, CO, IN, IT, PR. Puoi assegnare a mano.
- **Númenóreani Neri**: il TB-3 non ha una riga per loro; l'app usa «Uomini» (cambiabile in Scheda → Popolo).
- **Incrementi di caratteristica**: le righe «1/2» e «2/4» della tabella si sovrappongono nel PDF (probabile refuso); si usa la prima.
- **Applicare una professione** sostituisce i valori già scritti nella colonna «Prof» delle abilità.
- **PF per livello ed esperienza** non sono nei documenti caricati: non sono calcolati.
- Le tabelle dei popoli, delle professioni, del background e della TB-6/TGP-4 sono in immagini nei PDF e sono state trascritte a mano e controllate con somme e confronti incrociati, non cella per cella da una macchina: se trovi un valore dubbio, controlla il PDF.

## Crediti

Regole, tabelle e dati vengono dal compendio **«Istaro Quettar»** di Filduin: <https://www.istaroquettar.it>. Vedi `NOTICE.md`.

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
- **Modificatori «sulla TA» delle armi**: il compendio dice che si applicano alla consultazione della tabella dopo tutti gli altri
  bonus; l'app somma il valore al risultato prima di leggere la riga, in base all'armatura del bersaglio. Quelli che non si possono
  attribuire a un'armatura con certezza (la Frusta: «−15 sulla TA (e ½ PF c. piastre/maglia)») non si applicano e sono
  elencati sotto il risultato come «da applicare a mano»; i modificatori «al BO» e le altre note dell'arma sono mostrati ma non applicati.
- **Critico secondario**: la regola («se il primario è maggiore di A, un grado sotto il primario, con il massimo tra parentesi») è scritta per gli
  animali (TSC-2); l'app la estende alle armi che hanno un critico secondario.
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
js/weapondata.js        catalogo armi (TSC-1), generato dallo stesso script
js/creationdata.js      creazione: popoli, professioni, background, punti sviluppo (trascritti a mano)
js/creationpdf.js       gradi di adolescenza (TGP-5), generato da tools/extract-creation.py
js/secdata.js           abilità secondarie, generato dallo stesso script
js/creation.js          logica della creazione
js/createpage.js, js/refpage.js   pagine «Crea» e «Guida»
js/combatdata.js        TA-9, TRR, TSC-3/4/5, generato da tools/extract-combat.py
js/combatrules.js       testo del Prospetto sul Combattimento, generato da tools/extract-combatrules.py
js/magic.js, js/magicpage.js   incantesimi base, iniziativa, TFI, gittata
js/refcombat.js         parti di combattimento e magia della Guida
js/store.js             salvataggio locale
tools/build.mjs         crea dist/girsa.html
tools/extract-combat.py  rigenera combatdata.js (TA-9, TRR, TSC-3/4/5)
tools/extract-combatrules.py rigenera combatrules.js (testo del Prospetto sul Combattimento)
tools/extract-creation.py rigenera creationpdf.js e secdata.js dai PDF di adolescenza e abilità secondarie
tools/extract-tables.py rigenera tabledata.js (con i critici mirati) e weapondata.js dai PDF (serve poppler e pdfplumber)
tests/                  test
```

Vedi anche `NOTICE.md` (provenienza e licenza dei dati) e `data/README.md` (formato JSON per aggiungere tabelle).
