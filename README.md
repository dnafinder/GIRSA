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
- **Crea** (creazione guidata in sei passi): popolo (applica le modifiche TB-3, lingue e scheda completa), nome (con nomi di personaggi di Tolkien per popolo), professione consentita
  al popolo e livello (bonus per livello TB-4.2 scritti nella colonna «Prof»), caratteristiche (tiro classico o 400 punti, controlli
  su principale/secondaria e sulle regole degli Elfi, Aspetto), background (punti del popolo, tabelle TGP-2 con le regole di
  ogni popolo), gradi di adolescenza (TGP-5).
- **Sviluppa**: punti sviluppo (TGP-4) con gradi alle abilità, trasferimenti tra categorie e passaggio di livello. Il menu va in ordine di gioco: Crea, Sviluppa, Scheda.
- **Guida**: consultazione di popoli, professioni, tabelle di creazione e delle 170 abilità secondarie (ricercabili, con pulsante per aggiungerle alla scheda), del Prospetto sul Combattimento, delle tabelle di copertura, gittata e animali, della magia (tipi, classi, TA-9, TRR, TSC-3) e della Corruzione.
- **Dadi**: d100 aperto e chiuso, d4–d20, espressioni come `2d6+1`, cronologia.
- **Combattimento**: iniziativa, attacco (tiro + BO − BD + modificatori) con lettura della tabella di attacco dell'arma scelta dal catalogo,
  colpo maldestro o fallimento con la relativa tabella, colpo critico con il modificatore della lettera,
  elenco avversari con PF, registro. In più: **incantesimi di attacco base** (TA-9 e tiro resistenza sulla TRR), **incantesimi inoffensivi** (TFI) e **gittata** (TSC-5).
- **Oggetti**: equipaggiamento e prezzi (TS-4: armi, protezioni, accessori, borse, vestiti, vitto e servizi, trasporti), statistiche delle armature, degli elmi e degli scudi (TSC-4), metalli e gemme, 347 erbe, veleni ed effetti e 18 malattie (TS-5), con ricerca. «+ Inv.» porta una voce nell'inventario, «Indossa» nelle Protezioni (la Scheda mostra poi MM, BO, BD e resistenza del pezzo), «+ Erbario» nell'erbario della Scheda.
- **Mondo**: **Punti Esperienza** (TE-0…TE-7 e semplificati, con un calcolatore che somma i PE alla Scheda), **manovre in movimento** (TM-1) e **statiche** (TM-2) con tiro, **meteo** (TS-8, TS-8.2), **incontri** (TS-10), **rischio degli incantesimi** (TS-12), **freddo e caldo** (TRR-2, con tiro: la TR viene dalla Scheda), le liste **Pirocinesi** e **Potenziamento Corporeo** (con «+ Incantesimo» verso la Scheda), **tesori** (TS-6, con generatore) e **prezzi degli oggetti magici** (TS-7), **animali e mostri** (TS-2: 147 animali, 92 creature speciali, cavalcature; «+ Avv.» li porta tra gli avversari del Combattimento) e le regole del **Mutaforma**.
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
- **Azza (Bec de Corbin)**: due pagine del compendio non concordano. La tabella delle armi (TSC-1) dà −10 sulla TA contro cuoio e nessuna armatura; la tabella TA-10 con i modificatori dà −5. Per scelta tua l'app usa il −5 (la nota dell'arma lo dice); il −10 stampato resta nella nota.
- **Rete da gladiatore e armi che dimezzano i PF**: i PF dimezzati non sono calcolati, solo segnalati.

## Creazione del personaggio: scelte dell'app

- **Sesso e nome** (`js/namedata.js`): il sesso si sceglie prima del nome (campo «Sesso» anche in Scheda) e i nomi proposti lo seguono. I nomi non vengono dal compendio GIRSA. Due fonti, tenute separate nell'elenco: i nomi di personaggi di Tolkien raccolti il 12/10/2026 da Tolkien Gateway, e l'elenco non canonico «Names of Middle-earth» di Colin Chapman (nomi inventati sul modello delle lingue di Tolkien, senza dichiarazione di licenza; ne ho preso una parte, per Eriadoriani/Bree, Dunlandiani, Esterling, Haradrim, Uomini dei Boschi, Wose e Beorniani). Restano senza nomi Lossoth, Variag, Dorwinrim, Mezzorchi, Olog-Hai e Mezzitroll: nessuna fonte consultata ne dà e l'app non ne inventa. Alcune liste sono cortissime (Umli 3, Corsari 2). Esclusi i nomi che esistono solo in giochi o film (per esempio Lurtz, Suladân, Yrjänä). Il genere dei nomi di Tolkien l'ho assegnato io; per orchi e Uruk non c'è. I cognomi, in inglese, ci sono per Hobbit ed Eriadoriani.

- **Abbinamento dei tiri alle caratteristiche**: il compendio lo lascia libero; «Assegna in automatico» mette i due valori più alti a principale e secondaria (con le regole degli Elfi su Prontezza), gli altri in ordine FR, AG, CO, IN, IT, PR. Puoi assegnare a mano.
- **Númenóreani Neri**: il TB-3 non ha una riga per loro; l'app usa «Uomini» (cambiabile in Scheda → Popolo).
- **Incrementi di caratteristica**: le righe «1/2» e «2/4» della tabella si sovrappongono nel PDF (probabile refuso); si usa la prima.
- **Applicare una professione** sostituisce i valori già scritti nella colonna «Prof» delle abilità.
- **PF per livello** non sono nei documenti caricati: non sono calcolati. L'esperienza (TE-0…TE-7) è invece nella pagina Mondo; i PE necessari per livello (TE-5) sono nella Scheda.
- Le tabelle dei popoli, delle professioni, del background e della TB-6/TGP-4 sono in immagini nei PDF e sono state trascritte a mano e controllate con somme e confronti incrociati, non cella per cella da una macchina: se trovi un valore dubbio, controlla il PDF.

## Oggetti: scelte dell'app

- **Monete**: i rapporti di cambio stanno nella nota della TS-6 (MS=1, MR=10, MB=100, MA=1.000, MO=10.000, MM=1.000.000) e il convertitore in fondo alla pagina li usa. Una mia affermazione precedente, «nei documenti non ci sono i rapporti», era sbagliata. Prezzi, pesi e tempi sono riportati come nel compendio, refusi compresi.
- **Tipo delle erbe** (curativa, varia/d'utilità, veleno, malattia/effetto ambientale): nel PDF è dato solo dal colore del nome, secondo la legenda in fondo alla tabella; l'app lo legge da lì.
- **Armature**: le penalità (MM, BO-M, BO-T, PRC) e i bonus (BD) sono mostrati, non applicati ai tiri: la Scheda li ricorda, tu li somma dove serve. La resistenza non è tracciata punto per punto.
- **Nomi delle armature**: alcuni si ripetono in gruppi diversi (per esempio «Corazza rigida» tra cuoio rinforzato e piastre); «Indossa» scrive il nome con la sigla del gruppo, per ritrovare le statistiche.
- **Armi**: la tabella dei prezzi (TS-4) e il catalogo delle statistiche di combattimento (TSC-1) restano separati; le due fonti hanno nomi in parte diversi e l'app non li abbina a indovinare.

## Mondo: scelte dell'app

- **Dove i PDF hanno solo testo** (animali e mostri TS-2, manovre statiche TM-2, TRR-2 freddo/caldo, liste Pirocinesi e Potenziamento Corporeo) i dati sono letti dai PDF da `tools/extract-world.py` con asserzioni (conteggi per gruppo, intervalli). **Dove sono immagini** (esperienza, TM-1, meteo, TS-10, TS-12, tesori TS-6, prezzi TS-7, Mutaforma) le ho trascritte a mano da pagine ingrandite (`tools/world_hand.py`) e controllate da asserzioni: intervalli senza buchi, valori monotoni, nella TM-1 la distanza in metri è esattamente (percentuale−100)×0,3 troncato, nei tesori i valori monetari hanno il formato giusto. Non è una verifica cella per cella contro una seconda lettura: se un valore ti pare strano, guarda il PDF.
- **Anomalie del compendio lasciate com'erano** (elenco anche in `worlddata.js`, campo `anomalie`): TE-1 colonna «11+» (130, 150, 200 ai livelli 8–10, lo schema darebbe 110, 130, 150); TM-2 l'estremo 175 sta in due righe («111/175» e «175 o più»: vale la prima); TS-6 oggetti magici «11/22» e «21/30» si sovrappongono (vale la prima); TS-8.2 Gelido a Gwaeron è stampato «42/-12» (probabile «-42»); tre celle di TS-8 senza parentesi di chiusura (le ho chiuse per leggerle). TRR-2 Caldo: «o sei il risultato» (per «se»). Pirocinesi: «al concentrazione», citazioni «“Crea Fiamma)» senza virgolette di chiusura nei punti 6, 8, 15, 18. Potenziamento Corporeo: il 13 precede il 12, manca un «Potenziamento corporeo IV», l'asterisco dei nomi non è spiegato. Il refuso «MVVE» (Renna) e «MN» (Demone III° Cerchia) restano.
- **Freddo e caldo (TRR-2)**: totale = tiro d100 aperto + TR + modificatori; la TR si prende dalla Scheda (difesa Freddo/Calore) se il campo è vuoto. I modificatori con intervallo («vario») vanno scritti a mano in «altre modifiche». I limiti minimo/massimo («condizioni migliorate/peggiorate») sono campi facoltativi: il compendio non dice altro.
- **Tiri**: il compendio non definisce come si tirano l'Attività e l'Evasione (TS-10), né la probabilità di precipitazione (TS-8): l'app usa il d100 aperto del resto dell'app e «tiro ≤ probabilità»; sono scorciatoie, e puoi inserire a mano ogni tiro.
- **Manca nei PDF** la tabella «Fallimento Manovre in Movimento», che la TM-1 nomina: l'app non la inventa e, quando esce «F», lo dice. Le celle della TM-2 sono lunghe: i risultati sono mostrati riga per riga, con le cinque colonne in elenco.
- **Cavalcature**: «Bue», «Mulo/Somaro», i pony e lo «Zurafy» seguono gli elefanti senza un titolo proprio nel PDF; l'app li raggruppa come «Altri».

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
js/createpage.js, js/refpage.js   pagine «Crea», «Sviluppa» e «Guida»
js/namedata.js          nomi per popolo (da Tolkien Gateway)
js/combatdata.js        TA-9, TRR, TSC-3/4/5, generato da tools/extract-combat.py
js/combatrules.js       testo del Prospetto sul Combattimento, generato da tools/extract-combatrules.py
js/magic.js, js/magicpage.js   incantesimi base, iniziativa, TFI, gittata
js/refcombat.js         parti di combattimento e magia della Guida
js/geardata.js          armature, equipaggiamento e prezzi, metalli, gemme, erbe e malattie, generato da tools/extract-gear.py
js/gear.js, js/gearpage.js   ricerca e pagina «Oggetti»
js/worlddata.js         animali, manovre statiche, TRR-2, liste (dai PDF) ed esperienza, TM-1, meteo, incontri, rischio, tesori, Mutaforma (trascritti), generato da tools/extract-world.py
js/world.js, js/worldpage.js   regole (ricerche, PE, tesori, monete) e pagina «Mondo»
js/store.js             salvataggio locale
tools/build.mjs         crea dist/girsa.html
tools/extract-combat.py  rigenera combatdata.js (TA-9, TRR, TSC-3/4/5)
tools/extract-combatrules.py rigenera combatrules.js (testo del Prospetto sul Combattimento)
tools/extract-creation.py rigenera creationpdf.js e secdata.js dai PDF di adolescenza e abilità secondarie
tools/extract-gear.py   rigenera geardata.js dai PDF di armature, equipaggiamento, metalli e gemme, erbe (con tools/pdfgrid.py)
tools/extract-world.py  rigenera worlddata.js, con 5 PDF: animali, statiche, TRR-2, Pirocinesi, Potenziamento (usa tools/world_hand.py per le tabelle trascritte a mano)
tools/extract-tables.py rigenera tabledata.js (con i critici mirati) e weapondata.js dai PDF (serve poppler e pdfplumber)
tests/                  test
```

Vedi anche `NOTICE.md` (provenienza e licenza dei dati) e `data/README.md` (formato JSON per aggiungere tabelle).
