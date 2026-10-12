/* Guida: combattimento e magia (regole del Prospetto sul Combattimento, tabelle degli incantesimi, copertura, gittata, animali). */
(function (root) {
  'use strict';
  var G = root.GIRSA = root.GIRSA || {};
  var U = G.ui, esc = U.esc, CD = G.combatdata, CR = G.combatrules;

  function tbl(head, rows, o) {
    o = o || {};
    return '<div class="scroll"><table class="sk"><thead><tr>' + head.map(function (h, i) { return '<th' + (i === 0 || o.left ? ' class="l"' : '') + '>' + esc(h) + '</th>'; }).join('') + '</tr></thead><tbody>' +
      rows.map(function (r) { return '<tr>' + r.map(function (c, i) { return '<td' + (i === 0 || o.left ? ' class="l"' : '') + '>' + esc(c) + '</td>'; }).join('') + '</tr>'; }).join('') + '</tbody></table></div>';
  }
  function sgn(v) { return v === null || v === undefined ? '—' : (v > 0 ? '+' + v : String(v).replace('-', '−')); }
  function p(t) { return '<p class="pl">' + esc(t) + '</p>'; }

  /* ---------- tabelle inserite nei testi del Prospetto sul Combattimento ---------- */
  var TABLES = {
    bo: function () {
      return tbl(['Modificatore al BO', 'Valore'], [['Attacco sul fianco', '+15'], ['Attacco da dietro (oltre il bonus dell\'attacco sul fianco)', '+20'], ['Attacco di sorpresa', '+20'],
        ['Avversario stordito*', '+20'], ['Avversario atterrato*', '+30'], ['Avversario prono*', '+50']]) +
        '<p class="hint">*Può essere applicato solo uno di questi bonus. I bonus soprascritti non sono applicabili alle armi da Tiro o da Lancio.</p>' +
        tbl(['Modificatore al BO', 'Valore'], [['Arma impugnata con la mano non dominante', '−20'], ['Sfoderare l\'arma', '−20'], ['Cambiare un\'arma o impugnare uno scudo', '−50'],
          ['Lasciare un\'arma o scudo, cambiare mano', '−10'], ['Se un\'arma viene lanciata come azione veloce', '−20'], ['L\'attaccante ha perso più del 50% dei suoi PF', '−20'],
          ['Cambiare obiettivo all\'ultimo', '−30'], ['Mirare, con armi da Tiro o da Lancio', '−30'], ['Accecato, al buio completo', '−100']]) +
        '<p class="hint">Nota: se non specificato diversamente, i modificatori sono cumulativi. Nel Combattimento li spunti uno per uno.</p>';
    },
    parata: function () {
      return tbl(['Armi', 'Limitazione alla Parata', 'Bonus alla parata'], [['Armi a una mano', '-', '+5'], ['Armi a due mani', 'Contro armi a una mano può essere convertito al massimo metà del BO', '+5'],
        ['Armi ad Asta', 'Contro armi non ad asta può essere convertito al massimo metà del BO', '+5']], { left: true });
    },
    scudi: function () {
      return '<h4>Statistiche offensive degli scudi</h4>' + tbl(['Tipo', 'Limite attacco con «Colpo di scudo»', 'BO «Colpo di Scudo»', 'CM'], [['Brocchiero', 'Piccoli*', '0', '3'], ['Rotondo', 'Medi*', '0', '4'],
        ['Scapezzato', 'Medi*', '−20', '6'], ['Palvese', 'Medi*', '−40', '8']]);
    },
    oltre150: function () {
      return tbl(['Margine (risultato − 150)', 'Critico supplementare'], [['0/30', 'Nessun critico'], ['31/60', 'A'], ['61/90', 'B'], ['91/120', 'C'], ['121/150', 'D'], ['151 o più', 'E']]) +
        '<p class="hint">Nel Combattimento, se il risultato supera l\'ultima riga di una tabella di attacco, l\'app ti mostra questo margine.</p>';
    }
  };

  function rulesHtml() {
    var h = '<section class="card"><h2>Combattimento</h2><p class="hint">Il «Prospetto sul Combattimento in Girsa» del compendio. Per attacco, critico, iniziativa e incantesimi base usa la pagina «Combattimento».</p>';
    (CR || []).forEach(function (s) {
      h += '<details><summary>' + esc(s.t) + '</summary>';
      var inList = false;
      s.items.forEach(function (it) {
        if (it.li) { if (!inList) { h += '<ul>'; inList = true; } h += '<li>' + esc(it.li) + '</li>'; return; }
        if (inList) { h += '</ul>'; inList = false; }
        if (it.p) h += p(it.p); else if (it.table) h += TABLES[it.table]();
      });
      if (inList) h += '</ul>';
      h += '</details>';
    });
    return h + '</section>';
  }

  /* ---------- tabelle di supporto ---------- */
  var ANIMALS = [
    ['Chele/Becco', '(Ch)', 'Zanne e Artigli (TA-5)', 'TA', 'IM*'], ['Morso ▲', '(Mo)', 'Zanne e Artigli (TA-5)', 'PU', 'TA(C)'], ['Artigli/Unghie', '(Ar) o (Za)', 'Zanne e Artigli (TA-5)', 'TA', 'PU(B)'],
    ['Corna/Zanne', '(Co)', 'Zanne e Artigli (TA-5)', 'PU', 'IM(C)*'], ['Pungiglioni ▼', '(Pu)', 'Zanne e Artigli (TA-5)', 'PU', 'IM(C)*'],
    ['Immobilizzare/Afferrare/Avviluppare/Inghiottire', '(Pr)', 'Immobilizz. e Sbilanciamento (TA-6)', 'PR', 'PE(C)'], ['Testa/Cornata/Urto/Botta', '(Te) o (Ur)', 'Immobilizz. e Sbilanciamento (TA-6)', 'PE', 'IM(C)*'],
    ['Piccoli Animali ▼', '(Mi)', 'Zanne e Artigli (TA-5)', 'TA(T)', '-'], ['Calpestare/Travolgere ▲', '(Sc)', 'Zanne e Artigli (TA-5)', 'IM', 'IM*'], ['Caduta/Stritolamento** ▲', '(Ca) o (Im)', 'Zanne e Artigli (TA-5)', 'IM', 'IM*'],
    ['Pugno/Calcio***', '(Pg)', 'Zanne e Artigli (TA-5)', 'PE(A)', '-'], ['Lotta/Placcaggio***', '(Lo)', 'Immobilizz. e Sbilanciamento (TA-6)', 'PR(A)', '-']];

  function supportHtml() {
    var h = '<section class="card"><h2>Copertura, gittata, animali</h2>';
    h += '<details><summary>TSC-4 · Bonus Difensivo di Copertura</summary>' +
      tbl(['Copertura', 'Mischia', 'Tiro/Lancio', 'Incantesimi Base', 'Inc. Diretti', 'Inc. ad Area'], CD.tsc4.map(function (r) { return [r.n].concat(r.v.map(function (v) { return v === null ? '-' : sgn(v); })); })) +
      '<p class="hint">Modificatori al Bonus Difensivo. Copertura Morbida: legno, rami di alberi, staccionate, porte ecc. Copertura Dura: muri di pietra, rocce ecc. Se non compare un numero (-) normalmente non si può effettuare l\'attacco. A discrezione del GM, attacchi speciali possono essere effettuati con una penalità di −100. ' +
      'Un bersaglio riparato da una copertura parziale o a metà può parare colpi in mischia o a distanza. Un bersaglio coperto da una copertura totale è stato notato, ma non è in linea di tiro: non può usare il suo Bonus Difensivo dovuto all\'Agilità e normalmente non può essere colpito in mischia, con armi da tiro/lancio o da incantesimi diretti. ' +
      'Un bersaglio coperto da qualsiasi copertura, per essere attaccato, deve essere prima notato tramite un tiro Percezione.</p></details>';
    h += '<details><summary>TSC-5 · Gittata delle armi</summary>' +
      tbl(['Base', 'Corta (+0)*', 'Media (−25)*', 'Lunga (−50)*', 'Massima (−75)*'], CD.tsc5.map(function (r) { return [String(r.base)].concat(r.r.map(function (x) { return x[0] + '-' + x[1]; })); })) +
      '<p class="hint">Valori espressi in metri; *penalità al Bonus Offensivo. La gittata base delle armi da lancio aumenta di 1 per ogni +5 del bonus in Forza.</p></details>';
    h += '<details><summary>TSC-2 · Statistiche degli animali</summary>' + tbl(['Tipo di attacco', 'Abbr.', 'Tabella d\'attacco', 'Critico primario', 'Critico secondario'], ANIMALS) +
      '<p class="hint">Colpi critici: IM = da impatto; PU = da punta; PR = da presa; TA = da taglio; PE = da perdita d\'equilibrio. Colpo critico primario: è di solito conseguente all\'attacco; tra parentesi è indicato il tipo massimo. ' +
      'Colpo critico secondario: se il primario è maggiore di A, ad esso consegue anche un secondario, sempre di un grado minore del primario, come indicato dalle tabelle d\'attacco. ' +
      '*: per questi attacchi il secondario si produce solo se si tratta di attacchi Grandi o Enormi. **: se il personaggio cade, questo attacco viene calcolato aggiungendo ai dadi un valore pari a 10 ogni 3 m di caduta (arrotondare per eccesso) e sottraendo l\'agilità del personaggio; ' +
      'l\'entità dell\'attacco dipende dalla caduta: 0-3 m (Piccolo); 3-15 m (Medio); 15-33 m (Grande); più di 33 m (Enorme). ***: i limiti al critico servono solo per il corpo a corpo senza addestramento; il limite massimo è quello degli attacchi Piccoli. ' +
      '▲: questi attacchi provocano il doppio dei PF. ▼: questi attacchi provocano la metà dei PF.</p></details>';
    var T = (G.tabledata && G.tabledata.crit || []).filter(function (t) { return /^TCM-/.test(t.id); });
    if (T.length) {
      h += '<details><summary>TCM · Colpi critici mirati da punta</summary><p class="hint">Regola opzionale della Mira: con un attacco da tiro o da lancio appuntito, penalità di −30 al BO; in caso di critico si usa la tabella della zona mirata. Modifiche: tipo T −50; A −20; B −10; C +0; D +10; E +20. r = round; PF = punti ferita. Nel Combattimento le trovi tra le tabelle dei critici.</p>' +
        T.map(function (t) {
          return '<details><summary>' + esc(t.name) + '</summary>' + tbl(['Tiro', 'Effetto'], t.rows.map(function (r) { return [(r.min == null ? '…' : r.min) + (r.max !== r.min ? '–' + r.max : ''), r.text]; }), { left: true }) + '</details>';
        }).join('') + '</details>';
    }
    return h + '</section>';
  }

  /* ---------- magia ---------- */
  function magicHtml() {
    var cols = ['Generale', 'Armatura di metallo', 'Armatura di cuoio', 'Armatura di metallo', 'Scudo di metallo', 'Elmo di metallo', 'Elmo di cuoio'];
    var h = '<section class="card"><h2>Magia</h2><p class="hint">Tabelle degli incantesimi, di attacco base, dei tiri resistenza e la Corruzione. Per lanciare un incantesimo di attacco base e fare il tiro resistenza usa la pagina «Combattimento».</p>';
    h += '<details><summary>Tipi di incantesimi</summary>' + tbl(['Abbr.', 'Classe', 'TR', 'Bonus', 'Tabella'], [
      ['ES', 'Elementale Sfera', 'No', 'Livello del personaggio**', 'TA8 Incantesimi Sfera'], ['ED', 'Elementale Diretto', 'No', 'BO Incantesimi Diretti', 'TA7 Incantesimi Dardo'],
      ['E', 'Elementale', 'No', 'Nessuno', 'TFI Fallimento Incantesimi'], ['F', 'Forza', 'Sì', 'BO Incantesimi Base', 'TA9 Incantesimi Base'], ['P', 'Passivo', 'Sì***', 'BO Incantesimi Base', 'TA9 Incantesimi Base'],
      ['U', 'Utilità', 'No', 'Nessuno', 'TFI Fallimento Incantesimi'], ['U', 'Utilità (se richiesto TR)*', 'Sì', 'BO Incantesimi Base', 'TA9 Incantesimi Base'], ['I', 'Informazione', 'No', 'Nessuno', 'TFI Fallimento Incantesimi']], { left: true }) +
      p('* Solo se il GM richiede un TR (es: il bersaglio non è cosciente dell\'incantesimo, istintiva resistenza, ecc.). Se il bersaglio è consenziente il TR ha una penalità di −50.') + p('** Solo se Usufruitore Puro o Ibrido.') +
      p('*** Un TR riuscito permette alla vittima solamente di accorgersi di essere stata bersaglio dell\'incantesimo.') +
      p('Il sottotipo M (Mentale) appartiene alla categoria F (Forza). Gli incantesimi di questo tipo non hanno effetto su creature che non possiedono una mente. I sottotipi G (Cura), A (Accessorio), D (Difensivo) appartengono alla categoria U (Utilità). ' +
        'Gli incantesimi del sottotipo S (Subconscio) possono essere lanciati automaticamente (se si possiedono sufficienti PM) quando l\'usufruitore non è cosciente o stordito, se si verificano le condizioni richieste. Possono essere programmati per reagire ad alcune condizioni particolari.') +
      '<p class="hint">La lettera che determina la categoria è segnata a fianco al nome dell\'incantesimo, sul manuale di Girsa/Merp e sugli Spell Law.</p></details>';
    h += '<details><summary>Classi di incantesimi e fallimento degli inoffensivi (TFI)</summary>' +
      tbl(['Classe', 'Livello incantesimo', 'Round di preparazione'], [['III', 'Dal livello del personaggio a −2 livelli', 'normali'], ['II', 'Da −3 a −5 livelli', 'considerato già preparato da 1 round'], ['I', 'Da −6 livelli in giù', 'considerato già preparato da 2 round']], { left: true }) +
      p('Tutti gli incantesimi appresi da un personaggio sono suddivisi in 3 Classi, ai fini del Tempo di Lancio necessario. Qualsiasi incantesimo di Classe III viene lanciato e preparato nel normale tempo richiesto (con bonus o penalità). Qualsiasi incantesimo di Classe II si considera sempre come fosse già stato preparato da 1 round. Qualsiasi incantesimo di Classe I si considera sempre come fosse già stato preparato da 2 round.') +
      tbl(['Round di preparazione', '0', '1', '2+'], [['% F incantesimi inoffensivi', '30', '15', '02'], ['% F incantesimi istantanei (*)', 'Sempre 02', 'Sempre 02', 'Sempre 02']]) +
      p('Gli incantesimi di tipo E, U e I generalmente non richiedono un TR. Per lanciare questi incantesimi si effettua un normale tiro percentuale contro il valore della percentuale di fallimento data dal numero di round di preparazione. La percentuale minima di fallimento è sempre 02%.') +
      p('Gli incantesimi lanciati tramite oggetti, che hanno un livello superiore all\'utilizzatore sono sempre considerati di Classe III. Il GM può imporre round di preparazione aggiuntivi per lanciare incantesimi di livello più alto di quello del personaggio.') +
      p('Il compendio dice: tutti gli incantesimi inoffensivi, che non richiedono TR da parte dell\'avversario o che non sono attacchi di tipo Dardo o Sfera, possono essere lanciati se si ottiene con un tiro aperto di 1d100 un risultato superiore alla percentuale di fallimento secondo la tabella TFI.') +
      p('Efficacia e raggio d\'azione: sono sempre indicati gli effetti massimi; l\'usufruitore può limitarli o diminuirli. Durata: è quantificata nel massimo possibile; l\'usufruitore può annullare l\'incantesimo prima dello scadere del termine rimanendo concentrato per un altro round.') +
      p('*Istantanei: gli incantesimi istantanei richiedono solo un minimo tempo per il lancio. Vengono sempre considerati come incantesimi di Classe I ai fini della preparazione ma non acquisiscono vantaggi da round di preparazione aggiuntivi. La loro percentuale di fallimento è sempre 02%. In nessun caso possono essere lanciati due incantesimi nello stesso round, nemmeno sotto effetto di Velocità.') + '</details>';
    h += '<details><summary>TA-9 · Attacco incantesimi base</summary><div class="scroll"><table class="sk"><thead><tr><th class="l" rowspan="2">Risultato</th><th rowspan="2">Generale</th><th colspan="2">Essenza</th><th colspan="2">Flusso</th><th colspan="2">Mentalismo</th></tr><tr>' +
      cols.slice(1).map(function (c) { return '<th>' + esc(c) + '</th>'; }).join('') + '</tr></thead><tbody>' +
      CD.ta9.map(function (r) { return '<tr><td class="l">' + (r.ti ? 'TI ' : '') + (r.min === r.max ? r.min : (r.min < 10 ? '0' + r.min : r.min) + '-' + (r.max === 100 ? 100 : r.max < 10 ? '0' + r.max : r.max)) + '</td>' + r.v.map(function (v) { return '<td>' + (v === null ? 'F' : sgn(v)) + '</td>'; }).join('') + '</tr>'; }).join('') + '</tbody></table></div>' +
      p('Il numero ottenuto su questa tabella è il modificatore per il Tiro Resistenza che il bersaglio deve eseguire (vedi TRR). F indica il fallimento dell\'incantesimo e richiede un tiro sulla tabella Fallimento Incantesimi TTM-3. TI = tiro invariabile: si legge la riga del tiro non modificato, senza modificatori; con tiri da 03 a 95 i modificatori non portano il risultato sotto 3 né sopra 95.') +
      '<h4>Modificatori</h4>' + tbl(['Distanza', 'Mod.'], [['A contatto', '+30'], ['Da 0 a 3 m', '+10'], ['Da 3 a 16 m', '0'], ['Da 16 a 33 m', '−10'], ['Da 33 a 100 m', '−20'], ['Più di 100 m', '−30']]) +
      tbl(['Attaccante', 'Mod.'], [['BO Incantesimi Base dell\'attaccante', '+'], ['Ha perso più della metà dei suoi PF', '−10'], ['Incantesimo preparato per 4 r', '+20'], ['… per 3 r', '+10'], ['… per 2 r', '+0'], ['… per 1 r', '−15'], ['… per 0 r', '−30']]) +
      tbl(['Bersaglio', 'Mod.'], [['Bonus di copertura (tiro Manovra e decisione del GM)', '−'], ['Bersaglio statico (colto di sorpresa o prono ed è senza riparo)', '+10']]) +
      p('Il Livello di Attacco dell\'incantesimo è quello di chi lo lancia. Regola opzionale: corrisponde al numero di punti magia spesi per lanciare l\'incantesimo; i punti magia non possono essere inferiori al livello dell\'incantesimo o maggiori del livello del personaggio.') + '</details>';
    h += '<details><summary>TRR · Tiri resistenza</summary><div class="scroll"><table class="sk"><thead><tr><th class="l">Livello del bersaglio ↓ / dell\'attacco →</th>' + CD.trr[0].map(function (_, i) { return '<th>' + (i + 1) + '</th>'; }).join('') + '</tr></thead><tbody>' +
      CD.trr.map(function (r, i) { return '<tr><td class="l"><b>' + (i + 1) + '</b></td>' + r.map(function (v) { return '<td>' + v + '</td>'; }).join('') + '</tr>'; }).join('') + '</tbody></table></div>' +
      p('Per gli incantesimi, il livello dell\'attacco è quello di chi lo lancia (regola opzionale: il livello d\'attacco corrisponde al totale dei PM usati per il lancio; non può superare il livello del personaggio). Per ogni livello oltre il 15°, il livello dell\'attacco aumenta il valore di 1, mentre il livello del bersaglio lo diminuisce di 1. Il TR del bersaglio, per essere efficace, deve essere superiore o uguale al valore dato sulla tabella.') +
      '<h4>Modificatori al tiro resistenza</h4><ul><li>+: bonus al TR appropriati.</li><li>Da −125 a +70: modificatore risultante dal tiro d\'attacco base (TA-9).</li><li>−50: se il bersaglio è cosciente e consenziente (si consideri di livello 1).</li><li>+15: se il bersaglio appartiene allo stesso regno dell\'incantesimo.</li><li>Varie: decisioni del GM, oppure oggetti, incantesimi o abilità speciali.</li></ul></details>';
    h += '<details><summary>TSC-3 · Statistiche degli incantesimi di attacco</summary>' +
      tbl(['Tipo di incantesimo', 'C.C. primario', 'C.C. secondario', 'C.C. terziario', 'Modifiche speciali'], CD.tsc3.map(function (r) { return [r.n, r.c1, r.c2 || '-', r.c3 || '-', r.mod || '-']; })) +
      p('C.C. primario: è il colpo critico normalmente conseguente all\'attacco. C.C. secondario: −20 rispetto al primario (minimo C). C.C. terziario: −40 rispetto al primario (minimo E). Colpi critici: CA = da calore; FR = da freddo; EL = da elettricità; IMM = da impatto magico (urto).') +
      p('Il compendio segnala che nel manuale di Girsa il colpo critico di alcuni incantesimi è indicato come IM (impatto): è un errore di traduzione. Nelle tabelle «Crush» è tradotto con Impatto (IM) e «Impact» con Impatto Magico (IMM).') + '</details>';
    h += '<details><summary>Dardi e Sfere (TA-7 e TA-8): modificatori</summary>' +
      tbl(['Distanza (entrambe le tabelle)', 'Mod.'], [['0 m – 3 m', '+35'], ['3 m – 16 m', '0'], ['16 m – 33 m', '−25'], ['33 m – 66 m', '−40'], ['66 m – 100 m', '−55'], ['100 m in su', '−75']]) +
      tbl(['Tempo di lancio (entrambe le tabelle)', 'Mod.'], [['Incantesimo preparato per 4 round', '+20'], ['… per 3 round', '+10'], ['… per 2 round', '+0'], ['… per 1 round', '−15'], ['… per 0 round', '−30']]) +
      p('Gli incantesimi di Classe II (da −3 a −5 livelli dal personaggio) si considerano già preparati da 1 round; quelli di Classe I (−6 o più livelli dal personaggio) già preparati da 2 round.') +
      '<h4>TA-7 (Dardi)</h4><ul><li>Attaccante: + Bonus Offensivo Incantesimi Diretti; +30 se il bersaglio è statico (colto di sorpresa o prono).</li><li>Bersaglio: bonus di Agilità; bonus per la copertura (occorre un tiro Manovra); bonus dello scudo se è in direzione dell\'attacco.</li></ul>' +
      '<h4>TA-8 (Sfere)</h4><ul><li>Attaccante: + livello dell\'attaccante (solo se è un Usufruitore Puro o Ibrido); +20 se il bersaglio è nel punto centrale scelto dall\'attaccante per gli effetti dell\'incantesimo; +10 se il bersaglio è statico (colto di sorpresa o prono).</li>' +
      '<li>Bersaglio: bonus di Agilità oppure bonus per la copertura se trova riparo (occorre un tiro Manovra), non entrambi.</li></ul>' +
      '<h4>Entrambe</h4><ul><li>Bonus al BD contro elementi del bersaglio: +5 se non indossa un elmo; −5 se indossa un elmo completo che copre il viso.</li><li>Varie: decisioni del GM, oggetti speciali, incantesimi o abilità.</li></ul>' +
      p('Nota: gli incantesimi elementali d\'attacco possono essere potenziati spendendo PM aggiuntivi. Non si possono spendere più PM del livello del personaggio. I PF inflitti aumentano in base al moltiplicatore di PM (×2 PM = ×2 PF, ecc.). Al tiro dell\'eventuale fallimento però si applica un bonus pari ai PM aggiuntivi.') +
      p('Il compendio precisa che il bonus da applicare agli incantesimi di tipo Sfera corrisponde al livello del personaggio e non al Bonus Offensivo Base, solo se l\'usufruitore è Puro o Ibrido, altrimenti non si applicano bonus. In caso di fallimento si tira sulla tabella Fallimento degli Incantesimi (TTM-3).') + '</details>';
    h += '<details><summary>Corruzione</summary>' +
      p('Un fallimento durante il lancio di un incantesimo può portare ad acquisire Punti Corruzione (PC). Quando accade il personaggio effettua un TR contro Essenza; il livello dell\'attacco è il livello dell\'incantesimo lanciato. Se il TR ha successo il personaggio riceve solo la metà dei PC indicati. Il GM può limitare o annullare i PC ricevuti se un incantesimo è stato lanciato per fini nobili ed è giustamente misurato per l\'azione voluta.') +
      p('Un personaggio può acquisire PC ogni volta che utilizza un oggetto in grado di lanciare incantesimi che sia legato o fabbricato dalle forze Oscure. Ogni volta che utilizza l\'oggetto deve effettuare un TR contro Essenza (contro livello 10); se fallisce riceve 1 o più PC in base alla forza dell\'oggetto.') +
      p('Un personaggio inizia il gioco con 0 PC. Questi indicano la propensione di un personaggio ad avvicinarsi all\'oscurità e al male. Generalmente un punteggio di 100 indica il totale asservimento all\'Oscurità.') +
      '<ul><li>Se un personaggio subisce una tentazione malvagia il GM può effettuare un tiro sommando i PC e sottraendo il bonus in Prontezza. Se il risultato è maggiore di 100 il personaggio cede alla tentazione malvagia.</li>' +
      '<li>I Punti Corruzione sono usati come modificatore negativo per ogni TR per resistere a comandi o controlli di un essere malvagio. Se un servo del male impone un comando o un volere al personaggio, questi deve effettuare un TR contro Essenza con una penalità pari ai PC e se fallisce è costretto ad obbedire.</li></ul></details>';
    return h + '</section>';
  }

  G.refcombat = { html: function () { return rulesHtml() + supportHtml() + magicHtml(); } };
})(typeof window !== 'undefined' ? window : globalThis);
