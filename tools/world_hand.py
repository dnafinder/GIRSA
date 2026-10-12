# -*- coding: utf-8 -*-
"""Tabelle di Istaro Quettar che nei PDF sono IMMAGINI (nessun testo): trascritte a mano dalle pagine,
ingrandite a 250-300 dpi, e controllate da asserzioni in extract-world.py.
Il compendio non va modificato: refusi e anomalie sono lasciati come stampati e segnalati nei commenti.
Fonti: Punti_Esperienza (TE-0..TE-7), Manovre_in_Movimento (TM-1), Precipitazioni_Temperature (TS-8, TS-8.2),
Incontri_Rischio_Incantesimi (TS-10, TS-12), Tabelle_tesori_oggetti_magici (TS-6, TS-7), Mutaforma."""

# ---------------------------------------------------------------- Esperienza
TE0 = [['Prima Volta', 'x 5'], ['Seconda Volta', 'x 2'], ['Normale', 'x 1'], ['Routine', 'x 0.5']]
TE0_TXT = ['Tutti i Punti Esperienza assegnati devono essere moltiplicati per i seguenti fattori, in base alla frequenza con cui viene compiuta un’azione e alla familiarità che il personaggio ha con essa.',
           'Un’azione di “Routine” è un azione con cui il personaggio ha acquisito familiarità e che reputa comune (percorrere strade conosciute, uccidere lo stesso tipo di creatura, lanciare lo stesso incantesimo, ecc.).']

TE1_TXT = ['Punti Esperienza per aver sconfitto (ucciso o messo fuori combattimento) un avversario attivo durante un combattimento. Spettano per intero a colui che infligge il colpo decisivo ma ridotti del numero di PE già assegnati per i Colpi Critici inflitti allo stesso avversario.']
# righe: livello del nemico 0..10; colonne: livello del personaggio che infligge il colpo decisivo 1..10, 11+
TE1 = [
    [50, 45, 40, 35, 30, 25, 20, 15, 10, 5, 0],
    [200, 150, 130, 110, 100, 90, 80, 70, 60, 50, 40],
    [250, 200, 150, 130, 110, 100, 90, 80, 70, 60, 50],
    [300, 250, 200, 150, 130, 110, 100, 90, 80, 70, 60],
    [350, 300, 250, 200, 150, 130, 110, 100, 90, 80, 70],
    [400, 350, 300, 250, 200, 150, 130, 110, 100, 90, 80],
    [450, 400, 350, 300, 250, 200, 150, 130, 110, 100, 90],
    [500, 450, 400, 350, 300, 250, 200, 150, 130, 110, 100],
    [550, 500, 450, 400, 350, 300, 250, 200, 150, 130, 130],   # ultima colonna come stampata (il disegno degli altri righi darebbe 110)
    [600, 550, 500, 450, 400, 350, 300, 250, 200, 150, 150],   # idem (disegno: 130)
    [650, 600, 550, 500, 450, 400, 350, 300, 250, 200, 200],   # idem (disegno: 150)
]
TE1_NOTE = ['* Per livelli oltre il 10 i PE sono: 200 + (50 x (Livello Nemico – Livello Personaggio), con un minimo di 200.',
            'Moltiplicatori – Creature Grandi: x1,5 /Creature Enormi: x3.']

TE3_TXT = ['Assegnati per i Colpi Critici inflitti e subiti durante un combattimento']
TE3 = [['A', '5 x Livello del Difensore', '100'], ['B', '10 x  Livello del Difensore', '200'], ['C', '15 x  Livello del Difensore', '300'],
       ['D', '20 x  Livello del Difensore', '400'], ['E', '25 x  Livello del Difensore', '500']]
TE3_NOTE = ['I PE per i Colpi Critici Inflitti non possono superare il totale dei Punti Uccisione per quel nemico.']
TE3_MOLT = [['Nemico morente', 'x0'], ['Stordito', 'x0,5'], ['Svenuto o incapacitato', 'x0,1'], ['Attaccante da solo contro più nemici', 'x2']]

PF_TXT = '1 PE per ogni PF subito durante il combattimento.'
MORTE_TXT = ['Un personaggio che riceve una ferita mortale riceve tanti PE quanti un personaggio di livello 1 che uccide un nemico del suo livello, anche se la ferita mortale viene curata prima che il personaggio muoia.',
             'Se il personaggio muore e poi viene riportato in vita (per esempio dall’incantesimo Resurrezione) i PE ricevuti per la morte vengono moltiplicati per 2.']

TE2_TXT = ['Spettano per ogni incantesimo lanciato durante un combattimento o in situazioni appropriate fuori dal combattimento (l’incantesimo deve rivelarsi utile).']
TE2 = [['Stesso del Personaggio', 100], ['-1', 90], ['-2', 80], ['-3', 70], ['-4', 60], ['-5', 50], ['-6', 40], ['-7', 30], ['-8', 20], ['-9', 10], ['-10 o più basso', 0]]
TE2_MOLT = [['In assenza di pericolo', 'x0,5'], ['In combattimento', 'x1'], ['In estremo pericolo', 'x2/x3'], ['Il nemico viene sconfitto grazie all’incantesimo', 'x5']]

TE4_TXT = 'Assegnati per tutte le Manovre (di Movimento o Statiche) riuscite.'
TE4 = [['Banale', 0], ['Facile', 5], ['Normale', 10], ['Media', 50], ['Difficile', 100], ['Molto Difficile', 150], ['Difficilissima', 200], ['Folle', 300], ['Assurda', 500]]

TE6 = [['Normale', '1 PE ogni 2Km'], ['In Volo o in Mare', '1 PE ogni 20Km']]
TE6_MOLT = [['In zone civilizzate', 'x0,5'], ['In zone pericolose', 'x2'], ['In zone molto pericolose', 'x3']]

TE7_TXT = 'Questa tabella indica un quantitativo di punti ideale per ulteriori categorie varie, sono valori indicativi che il GM deve adattare alle sessioni e scegliere di volta in volta. Possono essere maggiori o minori dei valori indicati.'
TE7 = [['Conoscenze acquisite', 'Nuove conoscenze utili al personaggio ottenute da manoscritti, insegnamenti, ecc.', '50/1000 PE'],
       ['Idee o progetti', 'Idee, piani ed i suggerimenti dei personaggi che risultino utili e abbiano avuto successo.', '100/600 PE'],
       ['Missioni Completate', 'Missioni intermedie dell’avventura, obbiettivi preposti dai PG e dal GM o l’avventura stessa.', '200 o più PE'],
       ['Azioni straordinarie o eroiche', 'Azioni impensabili effettuate in caso di estremo pericolo per il gruppo che comportano un altissimo rischio per il PG ma che infine salvano la situazione con un completo successo.', '500/1000 PE'],
       ['Interpretazione e gioco', 'Interpretazione verbale, caratteriale e realistica del personaggio che rende migliore il gioco o che sprona il gruppo al proseguo dell’avventura in momenti di stallo o difficoltà.', '100/500 PE']]

SEMPL_TXT = 'Possono essere usati al posto delle altre tabelle ed assegnati ad ogni componente del gruppo. I PE assegnati possono essere anche maggiori. Si consiglia di usare questa tabella per personaggi oltre il lv 5/10.'
SEMPL = [['Ogni sessione di gioco', '500/1000 PE'], ['Vittoria contro un nemico forte', '500/2000 PE'],
         ['Avventure o missioni completate', '1000/5000 PE'], ['Nuove scoperte, conoscenze, ecc.', '500/1000 PE']]

# ---------------------------------------------------------------- TM-1
TM1_INTRO = ['Lo spostamento massimo di ciascun personaggio senza dover ricorrere a Tiri Manovra è di 15 metri (10 per le razze piccole, come nani e hobbit) più 1,5 metri ogni 5 punti del Bonus di Manovra in Movimento. Se un personaggio corre o scatta il valore aumenta ma occorrono Tiri Manovra (vedi tabella). Per ogni oggetto spostato questo valore diminuisce di 3 metri.',
             'Se un personaggio si muove a cavallo si utilizzerà l’abilità di Cavalcare e come riferimento la velocità massima del Cavallo.']
TM1_DIFF = ['Banale', 'Facile', 'Normale', 'Media', 'Difficile', 'Molto Difficile', 'Diff.ma', 'Folle', 'Assurda']
_F = 'F'
TM1 = [
    ['-151 o meno', [_F] * 9],
    ['-150/-101', ['10/-27'] + [_F] * 8],
    ['-100/-51', ['30/-21', '10/-27'] + [_F] * 7],
    ['-50/-26', ['50/-15', '30/-21', '10/-27'] + [_F] * 6],
    ['-25/0', ['70/-9', '50/-15', '30/-21', '5/-28'] + [_F] * 5],
    ['01/20', ['80/-6', '60/-12', '50/-15', '10/-27', '5/-28'] + [_F] * 4],
    ['21/40', ['90/-3', '70/-9', '60/-12', '20/-24', '10/-27', '5/-28'] + [_F] * 3],
    ['41/55', ['100/-', '80/-6', '70/-9', '30/-21', '20/-24', '10/-27', '5/-28', _F, _F]],
    ['56/65', ['100/-', '90/-3', '80/-6', '40/-18', '30/-21', '20/-24', '10/-27', _F, _F]],
    ['66/75', ['100/-', '100/-', '90/-3', '50/-15', '40/-18', '30/-21', '20/-24', '5/-28', _F]],
    ['76/85', ['100/-', '100/-', '100/-', '60/-12', '50/-15', '40/-18', '30/-21', '10/-27', _F]],
    ['86/95', ['100/-', '100/-', '100/-', '70/-9', '60/-12', '50/-15', '40/-18', '20/-24', '5/-28']],
    ['96/105', ['110/+3', '100/-', '100/-', '80/-6', '70/-9', '60/-12', '50/-15', '25/-22', '10/-27']],
    ['106/115', ['110/+3', '110/+3', '100/-', '90/-3', '80/-6', '70/-9', '60/-12', '30/-21', '20/-24']],
    ['116/125', ['120/+6', '110/+3', '110/+3', '100/-', '90/-3', '80/-6', '70/-9', '40/-18', '30/-21']],
    ['126/135', ['120/+6', '120/+6', '110/+3', '100/-', '100/-', '90/-3', '80/-6', '50/-15', '40/-18']],
    ['136/145', ['130/+9', '120/+6', '120/+6', '110/+3', '100/-', '100/-', '90/-3', '60/-12', '50/-15']],
    ['146/155', ['130/+9', '130/+9', '120/+6', '110/+3', '110/+3', '100/-', '100/-', '70/-9', '60/-12']],
    ['156/165', ['140/+12', '130/+9', '130/+9', '120/+6', '110/+3', '110/+3', '100/-', '80/-6', '70/-9']],
    ['166/185', ['140/+12', '140/+12', '130/+9', '120/+6', '120/+6', '110/+3', '110/+3', '90/-3', '80/-6']],
    ['186/225', ['150/+15', '140/+12', '140/+12', '130/+9', '120/+6', '120/+6', '110/+3', '100/-', '90/-3']],
    ['226/275', ['150/+15', '150/+15', '140/+12', '130/+9', '130/+9', '120/+6', '120/+6', '100/-', '100/-']],
    ['276 o più', ['160/+18', '150/+15', '150/+15', '140/+12', '130/+9', '130/+9', '120/+6', '110/+3', '100/-']],
]
TM1_RIS = ['F: Fallimento, tirare sulla tabella Fallimento Manovre in Movimento.',
           'Il risultato numerico può essere a seconda della situazione (a discrezione del GM):',
           '1) la percentuale di manovra effettuata (un 70 può essere quindi: manovra compiuta al 70%). Un risultato superiore a 100 indica che la manovra è riuscita e il personaggio ha ancora il (#-100)% di normale attività disponibile in quel round.',
           '2) la possibilità di successo completo.',
           '3) una riduzione dell’attività pari a 100-# nel prossimo round (un 70 significa che la manovra è compiuta ma il Personaggio ha una penalità di –30 nel prossimo round).',
           'Il risultato numerico a destra indica la variazione in metri del risultato di una manovra che implichi lo spostamento in corsa di un personaggio.']
TM1_MOD = ['+il bonus Movimento e Manovra o + il bonus delle abilità corrispondenti,', '–50 se stordito,', '–70 se a terra,', '–30 se ha un arto fuori uso.']
TM1_PASSO = [['Camminata', '1x', '–', '–'], ['Corsa', '2x', 'Facile', 'Bonus CO+5 round'], ['Scatto', '3x', 'Normale', 'Bonus CO/5 round (minimo 1)']]
TM1_PASSO_NOTE = ['*Difficoltà su normale terreno. Può essere incrementate a seconda del luogo o di altre condizioni avverse.',
                  '**Dopo l’esaurimento della Manovra occorre un tempo di Recupero variabile in cui il personaggio può muoversi solo al passo di camminata a metà del suo movimento base o compiere azioni con metà del bonus (minimo 1 minuto).']

# ---------------------------------------------------------------- TS-8 / TS-8.2
MESI = ['1 Narwain (inverno)', '2 Ninui (inverno)', '3 Gwaeron (inverno)', '4 Gwirith (primavera)', '5 Lothron (primavera', '6 Norui (primavera)',
        '7 Cerveth (estate)', '8 Urui (estate)', '9 Ivanneth (estate)', '10 Narbeleth (autun.)', '11 Hithui (autunno)', '12 Girithron (autunno)']
MESI[4] = '5 Lothron (primavera'   # come stampato: parentesi di chiusura mancante
GIORNI = {'prima': 'Yestare (giorno indipendente: Capodanno)', 'meta': 'Loénde (giorno indipendente: Giorno di Mezzo Anno)', 'fine': 'Mettaré (giorno indipendente: l’Ultimo Giorno)'}
PCLIMI = ['Piovoso', 'Umido', 'Temperato', 'Tropicale**', 'Secco', 'Arido']
# millimetri(probabilità %); '-' = nessuna quantità. Tre celle sono stampate senza la parentesi di chiusura (202(80, 126(50, 278(95): qui chiuse.
PREC = [
    ['265(90)', '50(20)', '50(20)', '25(10)', '6(02)', '-(01)*'],
    ['227(85)', '63(25)', '37(15)', '6(02)', '6(02)', '-(01)*'],
    ['265(90)', '88(20)', '50(20)', '6(02)', '6(02)', '-(01)*'],
    ['265(90)', '101(75)', '37(15)', '18(08)', '6(03)', '-(01)*'],
    ['202(80)', '113(80)', '50(20)', '63(20)', '6(03)', '6(02)'],
    ['101(40)', '139(85)', '50(20)', '50(20)', '18(07)', '6(02)'],
    ['63(25)', '113(80)', '75(30)', '75(30)', '37(15)', '-(01)*'],
    ['37(15)', '101(75)', '75(30)', '113(45)', '37(15)', '-(01)*'],
    ['50(20)', '164(95)', '63(25)', '126(50)', '37(15)', '-(01)*'],
    ['126(50)', '164(90)', '88(35)', '278(95)', '25(10)', '-(01)*'],
    ['151(60)', '75(45)', '63(25)', '303(99)', '6(03)', '-(01)*'],
    ['202(80)', '63(25)', '63(25)', '177(70)', '6(03)', '-(01)*'],
]
PREC_NOTE = ['Il primo numero indica le precipitazioni in mm ed il secondo le probabilità di avere una precipitazione.',
             'Il tipo di precipitazione dipende dalla temperatura della zona.',
             'Neve: sotto 0°; nevischio: a 0°; pioggia: sopra 0°.',
             'Quando nevica c’è l’1% di probabilità che grandini ed il 4%che si verifichi una tempesta di ghiaccio.',
             '* = 50% di probabilità di rugiada o di nebbia, ma nessuna ulteriore precipitazione.',
             '** clima secco con forti precipitazioni focalizzate in brevi periodi dell’anno']
TCLIMI = ['Afoso', 'Caldo', 'Temperato', 'Freddo', 'Gelido']
TEMP = [   # minima/massima in gradi Celsius, come stampato
    ['15/24', '7/18', '-12/10', '-17/2', '-40/-17'],
    ['12/21', '4/15', '-17/7', '-28/-1', '-45/-17'],
    ['12/23', '7/15', '-12/12', '-23/4', '42/-12'],     # Gelido, Gwaeron: "42/-12" come stampato (probabile "-42")
    ['18/29', '10/21', '-1/18', '-9/12', '-31/-1'],
    ['23/35', '15/32', '10/23', '-6/15', '-17/4'],
    ['26/40', '21/35', '15/32', '4/26', '-6/10'],
    ['32/46', '29/40', '18/35', '7/29', '2/15'],
    ['32/46', '26/40', '21/37', '4/26', '2/18'],
    ['23/37', '18/35', '12/29', '-1/15', '-6/10'],
    ['21/32', '15/29', '7/21', '-6/12', '-17/4'],
    ['18/29', '12/23', '-1/18', '-12/7', '-28/-1'],
    ['15/29', '10/21', '-6/12', '-17/4', '-34/-9'],
]

# ---------------------------------------------------------------- TS-10
INC_DENS = ['Densa', 'Moderata', 'Leggera', 'Occasionale', 'Nulla']
INC = [   # (intervallo, [5 celle])
    ['1/30', ['v/-', '-/-', '-/-', '-/-', '-/-']],
    ['31/40', ['i/-', 'v/-', '-/v', '-/v', '-/-']],
    ['41/50', ['i/-', 'v/-', '-/v', '-/v', '-/-']],
    ['51/60', ['i/-', 'v/-', 'v/v', '-/v', '-/-']],
    ['61/70', ['i/-', 'i/-', 'v/v', '-/v', '-/v']],
    ['71/80', ['i/-', 'i/v', 'v/v', '-/v', '-/v']],
    ['81/90', ['i/-', 'i/v', 'i/v', '-/v', '-/o']],
    ['91/100', ['o/v', 'i/v', 'i/v', '-/o', '-/o']],
    ['101/120', ['a/o', 'i/v', 'i/o', 'v/o', '-/o']],
    ['121/140', ['a/o', 'a/o', 'o/o', 'i/o', 'v/a']],
    ['141/160', ['a/a', 'a/o', 'o/o', 'i/o', 'i/a']],
    ['161/180', ['a/a', 'a/a', 'a/o', 'o/a', 'o/a']],
    ['181/200', ['t/a', 'a/a', 'a/a', 'a/a', 'a/t']],
    ['più di 200', ['t/t', 't/t', 't/t', 't/t', 't/t']],
]
INC_NOTE = ['Nota: il Tiro d’Incontro rappresenta la differenza tra il Tiro Attività lanciato dal GM e il Tiro Evasione lanciato dal gruppo di avventurieri. Viene effettuato ogni 4 ore oppure ogni ora se il gruppo è braccato (in questo caso gli inseguitori devono effettuare anche un tiro su “Seguire Tracce”)',
            'Risultati: le lettere prima della barra indicano che i PG hanno incontrato essere senzienti, generalmente abitanti locali; la lettera posta dopo la barra indica invece incontri con animali selvaggi.']
INC_COD = [['t', 'trappola, imboscata o attacco di sorpresa'], ['o', 'gruppo ostile'], ['v', 'avvistamento da parte di un altro gruppo'], ['a', 'attacco di un gruppo'], ['i', 'incontro normale']]
INC_ATT = [   # modificatori al Tiro Attività: (gruppo, [(valore, descrizione)])
    ['Terreno in cui il gruppo si sta muovendo', [['+30', 'strada'], ['+20', 'terreno aperto'], ['+10', 'deserto, sabbia'], ['+0', 'neve'], ['-10', 'foresta'], ['-15', 'aspro, accidentato'], ['-30', 'foresta e aspro, accidentato'], ['-35', 'palude'], ['-40', 'montagnoso']]],
    ['Attività degli abitanti', [['+25', 'ostile'], ['+50', 'area pattugliata'], ['+100', 'allarme, gruppo braccato*'], ['+30', 'con abitudini notturne di notte (orchi)'], ['-30', 'con abitudini notturne di giorno']]],
    ['In generale', [['-25/-50', 'viaggiare di notte (in base alla luce)'], ['vario', 'incantesimi di individuazione']]],
]
INC_ATT_NOTE = '* Effettuare il tiro ogni ora. Il gruppo inseguitore dovrà effettuare una prova su Seguire Tracce. Il gruppo braccato potrà usare la stessa abilità per coprire le proprie tracce.'
INC_EVA = [
    ['Dimensioni del gruppo (Ranger, Elfi e Hobbit contano ½)', [['+50', '1'], ['+20', '2'], ['+0', '3-4'], ['-10', '5-7'], ['-20', '8-10'], ['-50', '11-20'], ['-75', '21-50'], ['-100', '51 o più']]],
    ['Modo di viaggio', [['+50', 'estremamente cauto'], ['+20', 'cauto'], ['+0', 'cammino normale'], ['-10', 'cammino veloce'], ['-20', 'cavalcata lenta'], ['-40', 'cavalcata veloce'], ['vario', 'volo, viaggio in barca, nave, ecc.']]],
    ['In generale', [['+30', 'se in ricerca attiva'], ['Vario', 'incantesimi usati dal gruppo'], ['-20', 'se accampati dopo 12 ore di viaggio'], ['-40', 'se accampati dopo 16 ore di viaggio']]],
]

# ---------------------------------------------------------------- TS-12
RISCHIO_INTRO = ['Ogni volta che un personaggio lancia un incantesimo, il GM deve effettuare un Tiro Aperto e aggiungere il Fattore di Rischio dell’Incantesimo e il Modificatore del Periodo:',
                 'Rischio = Tiro Aperto + Fattore di Rischio + Modificatore del Periodo',
                 'Se il risultato ottenuto è uguale o maggiore di 100, una qualche “Forza Oscura” ha percepito il lancio dell’incantesimo. Un secondo Tiro Aperto dovrà essere effettuato sulla tabella, controllando il risultato a seconda del Tipo di Area. Se il risultato è minore di 100 non accadrà nulla. E’ possibile modificare il risultato per riflettere la natura della zona e il periodo in cui è stato lanciato o altri fattori a discrezione del GM.']
RISCHIO_FATT = [['ES (elementale sfera)', 50], ['ED (elemen. diretto)', 40], ['E (elementale)', 25], ['F (forza)', 20], ['P (passivo)', 10], ['U (utilità)', 5], ['I (informazione)', 0]]
RISCHIO_PER = [['Attività Bassa (Quarta Era)', -25], ['Attività Media (Inizio della Terza Era)', -15], ['Attività Alta (Metà della Terza Era)', 0], ['Attività Molto Alta (Tarda Terza Era)', 25]]
RISCHIO_AREE = ['Rifugio', 'Urbana/ Civilizzata', 'Rurale/ Civilizzata', 'Confine/ Urbana', 'Confine/ Rurale', 'Terre Selvagge', 'Terre d’Ombra', 'Cittadelle d’Ombra']
_N, _P, _I, _C, _A, _R, _S, _G, _T, _X = 'Niente', 'Percepito', 'Individuato', 'Creatura', 'Agguato', 'Rapimento', 'Speciale', 'Assassino', 'Pattuglia', 'Contingente'
RISCHIO = [
    ['≤ 05', [_N, _N, _N, _N, _N, _N, _N, _N]],
    ['6/20', [_N, _N, _N, _P, _N, _N, _P, _P]],
    ['21/30', [_N, _P, _N, _P, _P, _N, _I, _C]],
    ['31/40', [_N, _P, _P, _I, _P, _P, _I, _C]],
    ['41/50', [_N, _P, _P, _I, _I, _I, _C, _T]],
    ['51/60', [_N, _I, _I, _I, _I, _C, _C, _T]],
    ['61/70', [_N, _I, _I, _A, _C, _C, _T, _A]],
    ['71/80', [_P, _A, _C, _R, _C, _C, _T, _X]],
    ['81/90', [_P, _R, _A, _R, _A, _C, _A, _X]],
    ['91/100', [_I, _G, _G, _G, _T, _A, _X, _S]],
    ['101/150', [_I, _R, _R, _R, _G, _T, _S, _S]],
    ['151/200', [_R, _G, _G, _G, _S, _S, _S, _S]],
    ['201+', [_G, _S, _S, _S, _S, _S, _S, _S]],
]
RISCHIO_TIPI = [
    ['Rifugio', 'un’area completamente priva di forza di Sauron (es: Rivendell, Lorien, Mithlond, Edhellond). Agenti nascosti o traditori potrebbero comunque essere presenti.'],
    ['Urbana/Civilizzata', 'una città o un villaggio in una regione relativamente priva di agenti (es: Minas Tirith, Dol Amroth, Pelargir).'],
    ['Rurale/civilizzata', 'le campagne di una regione relativamente priva di agenti (es: la Contea, Gondo del Sud).'],
    ['Confine/Urbana', 'una città in una regione meno civilizzata sul confine con i regni d’Ombra /es: Tharbad, Esgaroth, Brea).'],
    ['Confine/Rurale', 'le campagne di una regione poco civilizzata sul confine dei territori controllati da Sauron (es: Rohan, Colli Ferrosi, Bosco Atro a nord).'],
    ['Terre Selvagge', 'una zona selvaggia e scarsamente popolata (es: Antica terra Pukel).'],
    ['Terre d’Ombra', 'una regione con forze di Sauron attive (es: Moria, Mordor del Sud, Bosco Atro meridionale, Harad).'],
    ['Cittadella d’Ombra', 'una regione con una forte concentrazione di fortificazioni (es: Angmar, Dol Guldur, Gorgoroth).'],
]
RISCHIO_RIS = [
    ['Percepito', 'Una qualunque forza dell’Ombra è consapevole che è stato utilizzato un incantesimo e intuisce la direzione generica in cui si trova chi lo ha lanciato. Questo potrebbe generare una situazione di “Area Pattugliata” (o “Allarme/Braccati in zone con una forte presenza degli agenti di Sauron).'],
    ['Individuato', 'Include gli effetti di “Percepito” ma in aggiunta gli agenti dell’Ombra conoscono l’esatta direzione e la distanza del lanciatore dell’incantesimo.'],
    ['Creatura', 'Una qualunque creatura dell’Ombra nelle vicinanze percepisce l’incantesimo e, guidata dal volere di Sauron, comincia a inseguire il lanciatore con intenzioni ostili.'],
    ['Pattuglia', 'Include gli effetti di “Individuato” ma un gruppo di agenti di Sauron insegue il lanciatore con intenzioni ostili.'],
    ['Agguato', 'Include gli effetti di “Individuato” ma un gruppo di agenti si posiziona in agguato in un luogo di transito che il lanciatore attraverserà.'],
    ['Contingente', 'Include gli effetti di “Individuato” ma un grosso contingente di truppe di Sauron si prepara ad attaccare il lanciatore.'],
    ['Rapimento', 'Include gli effetti di “Individuato” ma in aggiunta gli agenti di Sauron tenteranno di rapire il lanciatore.'],
    ['Assassino', 'Include gli effetti di “Individuato” ma chi ha percepito l’incantesimo è un assassino con il compito di uccidere gli utilizzatori di magia.'],
    ['Speciale', 'Include gli effetti di “Individuato” ma almeno una delle forze dell’Ombra comprende un agente molto potente di Sauron, forse addirittura un Nazgûl'],
]

# ---------------------------------------------------------------- TS-6 / TS-7
TES_INTRO = ['Effettuare un primo tiro per determinare l’entità del Tesoro.', 'Il risultato determina il numero di Tiri da effettuare sulle tabelle di Composizione.']
RICCHEZZE = ['Molto povero', 'Povero', 'Normale', 'Ricco', 'Molto ricco']
TES_ENT_D = [['01/30', 1], ['31/55', 2], ['56/75', 3], ['76/90', 4], ['91/00', 5]]
TES_ENT_M = [['01/20', [0, 0, 0, 0, 2]], ['21/40', [0, 0, 0, 1, 2]], ['41/55', [0, 0, 1, 2, 2]], ['56/70', [0, 1, 1, 2, 3]], ['71/80', [0, 1, 2, 2, 3]],
             ['81/90', [1, 1, 2, 3, 4]], ['91/95', [1, 2, 3, 3, 4]], ['96/98', [2, 3, 4, 4, 5]], ['99/00', [3, 3, 4, 5, 6]]]
TES_COMP_D = [
    ['01/10', ['50MS', '500MS', '1.000MS', '5.000MS', '10.000MS']],
    ['11/20', ['100MS', '1.500MS', '3.000MS', '7.500MS', '5.000MR']],
    ['21/30', ['500MS', '2.500MS', '5.000MS', '1.000MR', '10.000MR']],
    ['31/35', ['1.000MS', '500MR', '1.000MR', '1.750MR', '1.500MB']],
    ['36/40', ['2.000MS', '750MR', '1.500MR', '2.500MR', '2.000MB']],
    ['41/45', ['300MR', '1.000MR', '2.000MR', '400MB', '250MA']],
    ['46/50', ['400MR', '1.250MR', '250MB', '500MB', '300MA']],
    ['51/55', ['500MR', '150MB', '300MB', '600MB', '400MA']],
    ['56/60', ['600MR', '200MB', '350MB', '70MA', '60MO']],
    ['61/65', ['70MB', '250MB', '40MA', '90MA', '80MO']],
    ['66/70', ['80MB', '30MA', '50MA', '110MA', '100MO']],
    ['71/75', ['90MB', '35MA', '60MA', '15MO', '125MO']],
    ['76/80', ['100MB', '40MA', '70MA', '25MO', '150MO']],
    ['81/85', ['12MA', '50MA', '8MO', '35MO', '2MM']],
    ['86/90', ['15MA', '60MA', '10MO', '45MO', 'Ge.(250)']],
    ['91/94', ['20MA', '7MO', '15MO', 'Ge.(60)', 'Ge.(300)']],
    ['95/97', ['3MO', '8MO', 'Ge.(20)', 'Ge.(80)', 'Gio.(400)']],
    ['98/99', ['5MO', 'Ge.(10)', 'Ge.(50)', '1MM', 'Gio.(600)']],
    ['00', ['Ge.(10)', 'Gio.(25)', 'Gio.(100)', 'Gio.(500)', 'Gio.(1.000)']],
]
TES_COMP_M = [   # nota: "11/22" e "21/30" si sovrappongono come stampato
    ['01/10', ['N', 'N', 'N', 'L (80%)', 'L (60%)']],
    ['11/22', ['N', 'N', 'L (80%)', 'L (60%)', 'L (40%)']],
    ['21/30', ['N', 'L (80%)', 'L (60%)', 'L (40%)', 'J']],
    ['31/40', ['L (80%)', 'L (60%)', 'L (40%)', 'B (+5)', 'J']],
    ['41/50', ['L (80%)', 'L (60%)', 'B (+5)', 'B (+10)', 'J']],
    ['51/55', ['L (60%)', 'B (+5)', 'B (+5)', 'B (+10)', 'B (+5)']],
    ['56/60', ['L (60%)', 'B (+5)', 'B (+10)', 'B (+15)', 'B (+10)']],
    ['61/65', ['B (+5)', 'B (+5)', 'B (+10)', 'B (+15)', 'B (+10)']],
    ['66/70', ['B (+5)', 'B (+5)', 'B (+10)', 'J', 'B (+15)']],
    ['71/75', ['B (+5)', 'B (+10)', 'B (+15)', 'J', 'B (+20)']],
    ['76/80', ['B (+5)', 'B (+10)', 'J', 'J', 'A +1']],
    ['81/85', ['B (+10)', 'B (+15)', 'J', 'J', 'A +2']],
    ['86/90', ['B (+10)', 'J', 'J', 'A +1', 'M x2']],
    ['91/94', ['J', 'J', 'A +1', 'A +2', 'A +3']],
    ['95/97', ['J', 'A +1', 'A +2', 'M x2', 'M x3']],
    ['98/99', ['A +1', 'A +2', 'M x2', 'A +3', 'Speciale']],
    ['00', ['Speciale', 'Speciale', 'Speciale', 'Speciale', 'Artefatto']],
]
TES_NOTE_D = ['MS: Moneta di Stagno (1)', 'MR: Moneta di Rame (10)', 'MB: Moneta di Bronzo (100)', 'MA: Moneta d’Argento (1.000)', 'MO: Moneta d’Oro (10.000)', 'MM: Moneta di Mithril (1.000.000)',
              'Gio.: gioielli;  Ge.: gemme', 'Sono più facili da trasportare. Tra parentesi viene indicato il valore approssimativo totale in MO.']
TES_NOTE_M = ['N: Normale, oggetto non magico', 'L: Leggero, (n°%), oggetto che pesa il n°% del normale', 'B: Bonus (+n°), oggetto con bonus di +n°.',
              'J: Incantesimo, oggetto che contiene un incantesimo (effettuare un tiro sulla tabella di Determinazione dell’oggetto)',
              'A+n°: Addizionatore d’incantesimi +n°', 'Mxn°: Moltiplicatore d’incantesimi +n°', 'Speciale: il GM sceglie uno speciale oggetto magico', 'Artefatto: può esserci un artefatto']
TES_OGG = [['01/40', 'Pergamena', '1', '1-10'], ['41/65', 'Pozione', '1', '1-10'], ['66/70', 'Giornaliero', '1 al giorno', '1-10'], ['71/75', 'Giornaliero', '2 al giorno', '1-7'],
           ['76/80', 'Giornaliero', '3 al giorno', '1-5'], ['81/85', 'Giornaliero', '4 al giorno', '1-3'], ['86/94', 'Bacchetta', '1-10*', '1-2'],
           ['95/98', 'Verga', '1-30*', '1-5'], ['99/00', 'Bastone', '1-100*', '1-10']]
TES_OGG_NOTE = ['* Effettuare un tiro per determinare le cariche rimanenti nell’oggetto.', '**Effettuare un tiro per determinare il Livello dell’Incantesimo contenuto nell’oggetto.']

TS7_COSTO = 'Costo totale = (Prezzo base + Costo addizionale) x Moltiplicatori'
TS7_BASE = [['Un foglio di carta Runica (contiene un incantesimo)', '1MO'], ['Una fiala di Pozione (contiene un Incantesimo)', '10MO'], ['Un oggetto con Carica: Bacchetta', '10MO*'],
            ['Un oggetto con Carica: Verga', '30MO*'], ['Un oggetto con Carica: Bastone', '100MO*'], ['Un oggetto con Incant.Quotidiano', '20MO*'],
            ['Addizionatore d’Incantesimi +1', '50MO'], ['Addizionatore d’Incantesimi +2', '100MO'], ['Addizionatore d’Incantesimi +3', '200MO'], ['Addizionatore d’Incantesimi +4', '400MO'],
            ['Moltiplicatore d’Incantesimi x2', '200MO'], ['Moltiplicatore d’Incantesimi x3', '400MO']]
TS7_BASE_NOTE = '*: + costo normale dell’oggetto'
TS7_MOLT_BONUS = [['Bonus +5', 'x10'], ['Bonus +10', 'x50'], ['Bonus +15', 'x250'], ['Bonus +20', 'x1.000'], ['Bonus +25', 'x5.000']]
TS7_MOLT_PESO = [['100% del peso indicato', 'x1'], ['80%/90% del peso indicato', 'x10'], ['60%/79% del peso indicato', 'x50'], ['40%/59% del peso indicato', 'x100']]
TS7_ADD = [
    ['Carta Runica', ['3', '10', '20', '30', '40', '60', '80', '100', '125', '150']],
    ['Pozione', ['5', '15', '30', '45', '60', '90', '120', '150', '200', '225']],
    ['Oggetto con Incant. Quot.***', ['15', '50', '100', '150', '200', '300', '400', '500', '600', '750']],
    ['Bacchetta', ['10', '30', '-', '-', '-', '-', '-', '-', '-', '-']],
    ['Verga', ['40', '80', '120', '150', '200', '-', '-', '-', '-', '-']],
    ['Bastone', ['100', '150', '200', '250', '300', '400', '500', '600', '700', '800']],
]
TS7_ADD_NOTE = ['Nota: ricaricare una bacchetta, una verga o un bastone costa la metà di quello dell’Incantesimo che contengono, anche se potrebbe essere difficoltoso trovare qualcuno in possesso sia dell’abilità che della volontà per compiere questa operazione.',
                '** Gli Incantesimi di Flusso costano il doppio.',
                '*** Un incantesimo al giorno; per ogni Incantesimo in più al giorno aggiungere il 50% del prezzo. Il prezzo, poi, viene raddoppiato se l’oggetto è più piccolo di un pugnale, per esempio un anello.']
TS7_CARICHE = [['Bacchetta', '33 cm', '10', '2°'], ['Verga', '82 cm', '30', '5°'], ['Bastone', '164 cm', '100', '10°']]

# ---------------------------------------------------------------- Mutaforma
MUTA = [
    ['h', 'Mutaforma'],
    ['p', 'Alcuni Beorniani di sangue nobile hanno la capacità di trasformarsi in orsi. Questa capacità viene regolata dall’abilità di Metamorfosi anche se il loro controllo rimane limitato.'],
    ['p', 'Metamorfosi viene considerata un abilità secondaria con caratteristica Prontezza. Il costo di avanzamento è il medesimo delle altre abilità (1pt per il primo grado e altri 2pt per il secondo grado) ma non vi è costo di trasferimento dei punti dagli altri gruppi di abilità. Si usa questa abilità per trasformarsi in orso, per resistere alla trasformazione quando questa si verificherebbe in maniera incontrollata (ad es. quando viene colpito in combattimento, quando si infuria, ecc.) e per mantenere il controllo dopo la trasformazione.'],
    ['p', 'Per trasformarsi il personaggio deve effettuare un tiro aperto (1d100) e sommare il bonus di Metamorfosi con i seguenti modificatori:'],
    ['li', '+5 per ogni round di concentrazione consecutivo;'],
    ['li', '+20 se riesce una manovra statica di Meditazione.'],
    ['p', 'Se il risultato è:'],
    ['kv', '100 o più:', 'la manovra è riuscita.'],
    ['kv', '76 – 99:', 'la manovra non riesce ma il PG può tentare nuovamente il turno successivo mantenendo gli stessi bonus, compresi i round di concentrazione.'],
    ['kv', '75 o meno:', 'la manovra non riesce e tutti i bonus vengono annullati.'],
    ['p', 'La trasformazione richiede un round. Per resistere alla trasformazione e per controllarsi si effettua una normale prova di Manovra Statica la cui difficoltà è data dalla situazione (a discrezione del GM).'],
    ['p', 'Quando il mutaforma è in forma orso:'],
    ['kv', 'i seguenti bonus raddoppiano:', 'PF, Percezione, Arrampicarsi, Seguire tracce, MM senza armatura, Procurarsi cibo (Foraggiamento).'],
    ['kv', 'i seguenti bonus si dimezzano:', 'Cogliere alle spalle, Acrobazia, Addestrare animali, Speleologia, Contorsionismo, Segnalazione'],
    ['kv', 'i seguenti bonus rimangono invariati:', 'Sapienza, Lingue, Arti marziali, Metamorfosi, Nuotare, Nascondersi, Muoversi silenziosamente, Difesa adrenalinica, Meditazione, TR e statistiche'],
    ['p', 'le altre abilità non possono essere usate.'],
    ['p', 'La pelle d’orso protegge come Cuoio Grezzo e i colpi critici ricevuti sono risolti sulla tabella degli esseri grandi. Il BD è uguale a: BD + Difesa Adrenalinica +10. Il BO è uguale a: Arti Marziali + 25. Il danno è di un livello superiore a quello della tecnica marziale usata. I colpi in forma di orso sono del tipo Artiglio. Il Master può concedere attacchi di tipo Morso o Urto con una penalità.'],
    ['p', 'Durante la trasformazione in orso, il Beorniano non può parlare il linguaggio umano, ma può capirlo. Può conversare tranquillamente con gli altri orsi (grado lingua 5) e comunicare con gli altri animali della famiglia degli orsi (come i tassi) con un grado di lingua pari a 1.'],
]
