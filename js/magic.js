/* Magia e iniziativa in combattimento: incantesimi di Attacco Base (TA-9) con il tiro resistenza (TRR), classi di incantesimi,
   fallimento degli incantesimi inoffensivi (TFI), tiro iniziativa, regola «oltre il 150». Le funzioni di calcolo sono pure
   e provate in tests/magic.test.js; la parte di interfaccia (scheda nel Combattimento) è in fondo. */
(function (root) {
  'use strict';
  var G = root.GIRSA = root.GIRSA || {};
  var CD = G.combatdata || (typeof require !== 'undefined' ? require('./combatdata.js') : null);

  /* Colonne della TA-9: indice nel vettore dei valori. 0 = «Generale», poi per regno le protezioni che contano. */
  var REALMS = [
    { id: 'ess', n: 'Essenza', cols: [[0, 'Generale (nessuna delle protezioni sotto)'], [1, 'Armatura di metallo'], [2, 'Armatura di cuoio']] },
    { id: 'flu', n: 'Flusso', cols: [[0, 'Generale (nessuna delle protezioni sotto)'], [3, 'Armatura di metallo'], [4, 'Scudo di metallo']] },
    { id: 'men', n: 'Mentalismo', cols: [[0, 'Generale (nessuna delle protezioni sotto)'], [5, 'Elmo di metallo'], [6, 'Elmo di cuoio']] }
  ];
  var DIST = [[30, 'A contatto (+30)'], [10, 'Da 0 a 3 m (+10)'], [0, 'Da 3 a 16 m (0)'], [-10, 'Da 16 a 33 m (−10)'], [-20, 'Da 33 a 100 m (−20)'], [-30, 'Oltre 100 m (−30)']];
  var PREP = [[20, 'Preparato 4 round (+20)'], [10, '3 round (+10)'], [0, '2 round (0)'], [-15, '1 round (−15)'], [-30, '0 round (−30)']];

  function rowOf(first, total) {
    var rows = CD.ta9, i, r;
    // Tiro Invariabile: si legge la riga del tiro non modificato, senza modificatori.
    for (i = 0; i < rows.length; i++) { r = rows[i]; if (r.ti && first >= r.min && first <= r.max) return { row: r, ti: true }; }
    var eff = Math.min(95, Math.max(3, total));   // 03-95: i modificatori non portano fuori da questo intervallo
    for (i = 0; i < rows.length; i++) { r = rows[i]; if (!r.ti && eff >= r.min && eff <= r.max) return { row: r, ti: false, clamped: eff !== total }; }
    return null;
  }
  /* Risultato sulla TA-9: {fail, mod, row, ti, clamped}. col = indice di colonna (0–6). */
  function ta9(first, total, col) {
    var r = rowOf(first, total); if (!r) return null;
    var v = r.row.v[col];
    return { fail: v === null, mod: v, row: r.row, ti: r.ti, clamped: !!r.clamped };
  }
  /* Valore della TRR: il TR del bersaglio (tiro + bonus + modificatore) deve essere maggiore o uguale a questo numero.
     Oltre il 15° livello: +1 per ogni livello d'attacco in più, −1 per ogni livello del bersaglio in più (nota ** della tabella). */
  function trr(attackLevel, targetLevel) {
    var a = Math.max(1, Math.floor(+attackLevel || 1)), t = Math.max(1, Math.floor(+targetLevel || 1));
    return CD.trr[Math.min(t, 15) - 1][Math.min(a, 15) - 1] + Math.max(0, a - 15) - Math.max(0, t - 15);
  }
  /* Classe dell'incantesimo in base alla differenza di livello (TCI). */
  function spellClass(charLevel, spellLevel) {
    var d = (+charLevel) - (+spellLevel);
    if (isNaN(d)) return null;
    return d >= 6 ? 'I' : d >= 3 ? 'II' : 'III';
  }
  /* Percentuale di fallimento degli incantesimi inoffensivi (TFI): round di preparazione (0, 1, 2 o più). Gli istantanei: sempre 2. */
  function tfi(rounds, instant) {
    if (instant) return 2;
    var r = Math.max(0, Math.floor(+rounds || 0));
    return r === 0 ? 30 : r === 1 ? 15 : 2;
  }
  /* Tiro iniziativa: 1d100 + modificatori; il bonus alle Manovre in Movimento vale doppio. */
  function initiative(roll, o) {
    o = o || {};
    var t = roll + 2 * (+o.bmm || 0) + (o.surprised ? -20 : 0) + (o.hurt ? -20 : 0) + (o.poleFar ? 25 : 0) + (o.poleNear ? -10 : 0) + (o.twoHands ? -5 : 0) + (+o.misc || 0);
    return t;
  }
  /* Oltre il 150: margine tra il risultato e 150, e lettera del critico supplementare (a discrezione del GM). */
  function beyond150(total) {
    var m = Math.floor(+total) - 150;
    if (!(m > 0)) return null;
    var letter = m >= 151 ? 'E' : m >= 121 ? 'D' : m >= 91 ? 'C' : m >= 61 ? 'B' : m >= 31 ? 'A' : null;
    return { margin: m, letter: letter };
  }
  /* Penalità di gittata (TSC-5): distanza in metri e gittata base → fascia 0 corta, 1 media, 2 lunga, 3 massima, 4 fuori portata. */
  function range(base, meters) {
    var row = null; CD.tsc5.forEach(function (x) { if (x.base === +base) row = x; });
    if (!row) return null;
    var m = +meters;
    for (var i = 0; i < 4; i++) if (m <= row.r[i][1]) return { band: i, pen: [0, -25, -50, -75][i] };
    return { band: 4, pen: null };
  }

  var M = { REALMS: REALMS, DIST: DIST, PREP: PREP, ta9: ta9, trr: trr, spellClass: spellClass, tfi: tfi, initiative: initiative, beyond150: beyond150, range: range };
  G.magic = M;
  if (typeof module !== 'undefined') module.exports = M;
})(typeof window !== 'undefined' ? window : globalThis);
