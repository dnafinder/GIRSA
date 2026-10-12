/* Regole «del mondo»: manovre (TM-1, TM-2), esperienza (TE-0..7), incontri (TS-10), rischio degli incantesimi (TS-12),
   tesori (TS-6), monete, meteo (TS-8). Funzioni pure sui dati del compendio (js/worlddata.js); provate in tests/world.test.js.
   L'interfaccia è in worldpage.js. Dove il compendio non dice come usare un numero, l'app non sceglie per il GM. */
(function (root) {
  'use strict';
  var G = root.GIRSA = root.GIRSA || {};
  var W = G.worlddata || (typeof require !== 'undefined' ? require('./worlddata.js') : null);

  var INF = 1e9;
  /* '01/20' -> [1,20]; '≤ 05' -> [-INF,5]; '201+' -> [201,INF]; 'più di 200' -> [201,INF]; '-26 o meno'; '175 o più'; '00' -> [100,100]; '91/00' -> [91,100] */
  function range(label) {
    var s = String(label).trim(), m;
    if (s.charAt(0) === '≤') return [-INF, parseInt(s.slice(1), 10)];
    if ((m = /^(\d+)\+$/.exec(s))) return [+m[1], INF];
    if ((m = /^più di (\d+)$/.exec(s))) return [+m[1] + 1, INF];
    if ((m = /^(-?\d+) o meno$/.exec(s))) return [-INF, +m[1]];
    if ((m = /^(-?\d+) o più$/.exec(s))) return [+m[1], INF];
    if ((m = /^(\d+) o \+$/.exec(s))) return [+m[1], INF];
    if (s === 'Meno di 0') return [-INF, -1];
    if (s === '00') return [100, 100];
    if ((m = /^(-?\d+)\/(-?\d+)$/.exec(s))) { var a = parseInt(m[1], 10), b = parseInt(m[2], 10); return [a, (b === 0 && a > 0) ? 100 : b]; }
    return null;
  }
  /* Indice della prima riga il cui intervallo contiene v (il primo vince dove il compendio si sovrappone); la prima riga vale anche per i valori più bassi. */
  function rowIndex(rows, v, key) {
    v = Math.floor(+v);
    for (var i = 0; i < rows.length; i++) {
      var r = range(key ? rows[i][key] : rows[i][0]);
      if (r && v >= r[0] && v <= r[1]) return i;
    }
    var f = range(key ? rows[0][key] : rows[0][0]);
    return f && v < f[0] ? 0 : rows.length - 1;
  }

  /* ---- TM-1: manovre in movimento ---- */
  function movCell(s) {
    if (s === 'F') return { fail: true, text: 'F' };
    var m = /^(\d+)\/(-|[+-]\d+)$/.exec(s);
    return { fail: false, pct: +m[1], m: m[2] === '-' ? 0 : +m[2], text: s };
  }
  function movLookup(total, diff) {
    var i = rowIndex(W.mov.righe, total);
    return { row: i, label: W.mov.righe[i][0], cell: movCell(W.mov.righe[i][1][diff]) };
  }

  /* ---- TM-2: manovre statiche ---- */
  function statLookup(total) {
    var i = rowIndex(W.statiche.righe, total, 'r');
    return { row: i, r: W.statiche.righe[i] };
  }

  /* ---- TS-10: incontri. Tiro d'Incontro = Tiro Attività - Tiro Evasione ---- */
  function incLookup(total, dens) {
    var i = rowIndex(W.incontri.righe, total);
    return { row: i, label: W.incontri.righe[i][0], code: W.incontri.righe[i][1][dens] };
  }
  var INC_NAMES = { t: 'trappola, imboscata o attacco di sorpresa', o: 'gruppo ostile', v: 'avvistamento da parte di un altro gruppo', a: 'attacco di un gruppo', i: 'incontro normale', '-': 'nessun incontro' };
  function incText(code) {
    var p = code.split('/');
    return { senzienti: INC_NAMES[p[0]], animali: INC_NAMES[p[1]] };
  }
  /* Valore numerico dei modificatori delle liste («+30», «-25/-50», «vario»): null se non è un numero singolo. */
  function modNum(s) { return /^[+-]?\d+$/.test(String(s)) ? parseInt(s, 10) : null; }

  /* ---- TS-12: rischio per gli incantesimi ---- */
  function rischioLookup(total, area) {
    var i = rowIndex(W.rischio.righe, total);
    return { row: i, label: W.rischio.righe[i][0], res: W.rischio.righe[i][1][area] };
  }

  /* ---- TRR-2: freddo e caldo. kind = 'freddo' | 'caldo' ---- */
  function trr2Lookup(kind, total) {
    var i = rowIndex(W.trr2[kind].righe, total);
    return { row: i, range: W.trr2[kind].righe[i][0], text: W.trr2[kind].righe[i][1] };
  }
  /* Fattore di rischio TS-12 del tipo di incantesimo (E, ED, ES, U, ...) */
  function riskFactor(code) {
    var f = W.rischio.fatt;
    for (var i = 0; i < f.length; i++) if (f[i][0].split(' ')[0] === code) return f[i][1];
    return null;
  }

  /* ---- monete (TS-6): MS=1, MR=10, MB=100, MA=1.000, MO=10.000, MM=1.000.000 ---- */
  function coinVal(code) { for (var i = 0; i < W.monete.length; i++) if (W.monete[i][0] === code) return W.monete[i][2]; return null; }
  function toMS(amount, code) { return amount * coinVal(code); }
  function fromMS(ms) { return W.monete.map(function (c) { return { code: c[0], name: c[1], v: ms / c[2] }; }); }
  function fmtNum(x) {
    var s = (Math.round(x * 1e6) / 1e6).toString();
    var p = s.split('.'), ip = p[0].replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    return p[1] ? ip + ',' + p[1] : ip;
  }

  /* ---- TS-6: tesori ---- */
  function parseTreasure(cell) {
    var m = /^([\d.]+)(MS|MR|MB|MA|MO|MM)$/.exec(cell);
    if (m) { var n = +m[1].replace(/\./g, ''); return { kind: 'coin', n: n, code: m[2], ms: toMS(n, m[2]) }; }
    m = /^(Ge|Gio)\.\(([\d.]+)\)$/.exec(cell);
    if (m) { var mo = +m[2].replace(/\./g, ''); return { kind: m[1] === 'Ge' ? 'gem' : 'jewel', mo: mo, ms: mo * coinVal('MO') }; }
    return null;
  }
  function d100(dice) { return dice.d(100); }   /* 100 = «00» */
  function wealthIndex(name) { return W.tesori.ricchezze.indexOf(name); }
  /* Un tesoro: dice = {d(n)}, w = indice di ricchezza relativa 0..4. Ogni tiro è riportato per intero. */
  function treasure(dice, w) {
    var T = W.tesori, out = { w: w, money: null, magic: null };
    var e = d100(dice), ei = rowIndex(T.entD, e);
    out.money = { roll: e, n: T.entD[ei][1], items: [] };
    for (var k = 0; k < out.money.n; k++) {
      var r = d100(dice), ri = rowIndex(T.compD, r), cell = T.compD[ri][1][w];
      out.money.items.push({ roll: r, cell: cell, p: parseTreasure(cell) });
    }
    var e2 = d100(dice), e2i = rowIndex(T.entM, e2);
    out.magic = { roll: e2, n: T.entM[e2i][1][w], items: [] };
    for (var j = 0; j < out.magic.n; j++) {
      var r2 = d100(dice), r2i = rowIndex(T.compM, r2), c2 = T.compM[r2i][1][w], it = { roll: r2, cell: c2, ogg: null };
      if (c2 === 'J') {
        var o = d100(dice), oi = rowIndex(T.ogg, o);
        it.ogg = { roll: o, oggetto: T.ogg[oi][1], cariche: T.ogg[oi][2], livello: T.ogg[oi][3] };
      }
      out.magic.items.push(it);
    }
    out.totalMS = out.money.items.reduce(function (s, x) { return s + (x.p ? x.p.ms : 0); }, 0);
    return out;
  }

  /* ---- TE-1..: esperienza ---- */
  var SIZE_MULT = { N: 1, G: 1.5, E: 3 };
  /* PE per aver sconfitto un nemico di livello en con un personaggio di livello pc (TE-1); oltre il 10: 200+50*(en-pc), minimo 200. */
  function peKillBase(en, pc) {
    en = Math.max(0, Math.floor(+en)); pc = Math.max(1, Math.floor(+pc));
    if (en > 10) return Math.max(200, 200 + 50 * (en - pc));
    return W.xp.te1[en][Math.min(pc, 11) - 1];
  }
  function peKill(en, pc, size) { return peKillBase(en, pc) * (SIZE_MULT[size] || 1); }
  /* Colpi critici inflitti (TE-3): n[A..E] colpi; 5/10/15/20/25 x livello del difensore. */
  function peCritInflitti(counts, en) {
    var s = 0;
    ['A', 'B', 'C', 'D', 'E'].forEach(function (L, i) { s += (+counts[L] || 0) * 5 * (i + 1) * Math.max(0, +en || 0); });
    return s;
  }
  function peCritSubiti(counts) {
    var s = 0;
    ['A', 'B', 'C', 'D', 'E'].forEach(function (L, i) { s += (+counts[L] || 0) * 100 * (i + 1); });
    return s;
  }
  /* Incantesimi (TE-2): differenza = livello del PG - livello dell'incantesimo (0..10+). */
  function peSpell(diff) { var d = Math.max(0, Math.floor(+diff)); return d >= 10 ? 0 : 100 - 10 * d; }

  /* ---- TS-8: meteo ---- */
  function precParse(s) {
    var m = /^(\d+|-)\((\d\d)\)(\*)?$/.exec(s);
    return { mm: m[1] === '-' ? null : +m[1], pr: +m[2], star: !!m[3] };
  }
  function tempParse(s) { var p = s.split('/'); return { min: +p[0], max: +p[1] }; }

  /* ---- animali ---- */
  function allAnimals() {
    var out = [];
    ['animali', 'mostri'].forEach(function (k) {
      W.animali[k].forEach(function (g) { g.righe.forEach(function (r) { out.push({ sec: k, grp: g.n, r: r }); }); });
    });
    return out;
  }

  var api = {
    range: range, rowIndex: rowIndex, movCell: movCell, movLookup: movLookup, statLookup: statLookup, incLookup: incLookup, incText: incText, modNum: modNum,
    rischioLookup: rischioLookup, trr2Lookup: trr2Lookup, riskFactor: riskFactor, coinVal: coinVal, toMS: toMS, fromMS: fromMS, fmtNum: fmtNum, parseTreasure: parseTreasure, treasure: treasure, wealthIndex: wealthIndex,
    peKillBase: peKillBase, peKill: peKill, peCritInflitti: peCritInflitti, peCritSubiti: peCritSubiti, peSpell: peSpell, SIZE_MULT: SIZE_MULT,
    precParse: precParse, tempParse: tempParse, allAnimals: allAnimals
  };
  G.world = api;
  if (typeof module !== 'undefined') module.exports = api;
})(typeof window !== 'undefined' ? window : globalThis);
