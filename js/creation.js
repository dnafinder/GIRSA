/* Creazione e sviluppo del personaggio: funzioni che leggono i dati trascritti dal compendio e modificano la scheda. */
(function (root) {
  'use strict';
  var G = root.GIRSA = root.GIRSA || {};
  var D = G.data || (typeof require !== 'undefined' ? require('./data.js') : null);
  var R = G.rules || (typeof require !== 'undefined' ? require('./rules.js') : null);
  var C = G.creation || (typeof require !== 'undefined' ? require('./creationdata.js') : null);
  
  function adolTable() { return (G.adolescence) || {}; }
  function personById(id) { var r = null; C.PEOPLE.forEach(function (p) { if (p.id === id) r = p; }); return r; }
  function profByName(n) { var r = null; C.PROFS.forEach(function (p) { if (p.n === n) r = p; }); return r; }
  function skillIdx(c, key) { for (var i = 0; i < c.skills.length; i++) if (c.skills[i].k === key) return i; return -1; }

  /* Stato della creazione dentro la scheda (creato al primo uso). */
  function ensure(c) {
    var cr = c.creation;
    if (!cr || typeof cr !== 'object') cr = c.creation = {};
    if (cr.people == null) cr.people = '';
    if (!Array.isArray(cr.bg)) cr.bg = [];
    if (!cr.ps || typeof cr.ps !== 'object') cr.ps = {};
    if (!cr.ps.spent) cr.ps.spent = {};
    if (!cr.ps.recv) cr.ps.recv = {};
    if (!cr.ps.out) cr.ps.out = {};
    if (!cr.ps.raised) cr.ps.raised = {};
    if (!Array.isArray(cr.log)) cr.log = [];
    return cr;
  }

  /* ---- professioni permesse ---- */
  function profsIn(text) {
    var names = C.PROFS.map(function (p) { return p.n; }).sort(function (a, b) { return b.length - a.length; });
    var t = ' ' + String(text).toLowerCase() + ' ', found = [];
    names.forEach(function (n) {
      var k = t.indexOf(n.toLowerCase());
      while (k >= 0) {
        found.push(n);
        t = t.slice(0, k) + new Array(n.length + 1).join('#') + t.slice(k + n.length);
        k = t.indexOf(n.toLowerCase());
      }
    });
    return found;
  }
  function allowedProfs(person) {
    var txt = person.prof, inList = profsIn(txt), all = C.PROFS.map(function (p) { return p.n; });
    if (/^\s*tutte tranne/i.test(txt)) return all.filter(function (n) { return inList.indexOf(n) < 0; });
    return all.filter(function (n) { return inList.indexOf(n) >= 0; });
  }

  /* ---- bonus di professione (TB-4.2) ---- */
  function profBonus(perLevel, level) {
    var p = R.num(perLevel), lv = Math.max(0, Math.floor(R.num(level)));
    if (lv <= 20) return p * lv;
    var extra = p >= 3 ? 1 : p === 2 ? 0.5 : 0.25;
    return p * 20 + extra * (lv - 20);
  }
  function applyProfession(c, name, level) {
    var f = profByName(name); if (!f) return false;
    var lv = Math.max(1, Math.floor(R.num(level) || 1));
    c.prof = name; c.regno = f.regno; c.livello = lv;
    var touched = [];
    Object.keys(C.BONUS_SKILLS).forEach(function (cat) {
      C.BONUS_SKILLS[cat].forEach(function (k) {
        var i = skillIdx(c, k); if (i < 0) return;
        var m = D.SKILL_BY_KEY[k] || {}; if (m.noProf) return;
        var v = f.b[cat] ? profBonus(f.b[cat], lv) : '';
        c.skills[i].prof = v === 0 ? '' : v;
        if (v) touched.push(k);
      });
    });
    ensure(c).prof = name;
    return touched;
  }
  /* Descrizione dei bonus di professione che l'app non sa scrivere in una riga della scheda. */
  function profManualBonuses(f, level) {
    var out = [];
    ['meta', 'sap', 'altre', 'occ', 'corr'].forEach(function (k) { if (f.b[k]) out.push(C.BONUS_LABEL[k] + ': ' + R.fmt(profBonus(f.b[k], level))); });
    return out;
  }

  /* ---- caratteristiche ---- */
  function statRolls(d100, n) {
    var out = [];
    while (out.length < (n || 6)) { var v = d100(); if (v >= 20) out.push(v); }
    return out;
  }
  function aspectValue(roll, prBonus) { return Math.min(100, R.num(roll) + R.num(prBonus)); }
  function statChecks(c, opt) {
    opt = opt || {};
    var cr = ensure(c), f = profByName(cr.prof || c.prof), msgs = [];
    function sc(k) { var v = c.stats[k] && c.stats[k].score; return v === '' || v == null ? null : R.num(v); }
    if (f && f.stat.length) {
      var pk = cr.statP && f.stat.indexOf(cr.statP) >= 0 ? cr.statP : f.stat[0];
      var v = sc(pk);
      if (v != null && v < C.STAT_RULES.primaryMin) msgs.push('La caratteristica principale (' + pk + ') deve essere almeno ' + C.STAT_RULES.primaryMin + '.');
    }
    var el = C.STAT_RULES.elfMin[cr.people];
    if (el) { var ev = sc(el[0]); if (ev != null && ev < el[1]) msgs.push('Questo popolo deve avere almeno ' + el[1] + ' in ' + el[0] + '.'); }
    return msgs;
  }

  /* Aumento di una caratteristica: [min, max, numero dadi, facce, fisso]. Restituisce {rolls, add} oppure null se il valore è fuori tabella (100 o più). */
  function statIncrease(value, d) {
    var v = Math.floor(R.num(value)), row = null;
    C.INC.forEach(function (r) { if (!row && v >= r[0] && v <= r[1]) row = r; });
    if (!row) return null;
    var rolls = [], add = row[4];
    for (var i = 0; i < row[2]; i++) { var x = d(row[3]); rolls.push(x); add += x; }
    return { rolls: rolls, add: add, dice: row[2] ? row[2] + 'd' + row[3] : '+' + row[4] };
  }

  /* ---- adolescenza ---- */
  var ADOL_KEYS = { mov_nessuna: 'nessuna', mov_cuoio_g: 'cuoio_g', mov_cuoio_r: 'cuoio_r', mov_maglie: 'maglie', taglio: 'taglio', contund: 'contund',
    due_mani: 'due_mani', lancio: 'lancio', tiro: 'tiro', asta: 'asta', arrampic: 'arrampic', cavalc: 'cavalc', nuotare: 'nuotare', spalle: 'spalle',
    silenz: 'silenz', serrat: 'serrat', trappole: 'trappole', rune: 'rune', ogg_mag: 'ogg_mag', att_nov: 'att_nov', pre_nov: 'pre_nov',
    res_fis: 'res_fis', percez: 'percez' };
  function adolescenceOf(id) { return adolTable()[id] || null; }
  function adolescencePlan(id) {
    var t = adolescenceOf(id), out = [];
    if (!t) return out;
    Object.keys(ADOL_KEYS).forEach(function (k) { if (t[k]) out.push({ key: ADOL_KEYS[k], ranks: t[k] }); });
    return out;
  }
  /* Progressione a dadi della Resistenza fisica (TB-4): gradi 1-10 d10, 11-20 d4, 21-30 +1, oltre +0,5. */
  function resRolls(fromRank, toRank, d) {
    var sum = 0, rolls = [];
    for (var k = fromRank + 1; k <= toRank; k++) {
      var v = k <= 10 ? d(10) : k <= 20 ? d(4) : k <= 30 ? 1 : 0.5;
      rolls.push(v); sum += v;
    }
    return { sum: sum, rolls: rolls };
  }
  function addRanks(c, key, n, d) {
    var i = skillIdx(c, key); if (i < 0) return null;
    var s = c.skills[i], m = D.SKILL_BY_KEY[key] || {}, before = Math.floor(R.num(s.ranks)), after = before + n;
    s.ranks = after;
    if (m.prog === 'manual') {
      var rr = resRolls(Math.floor(R.num(s.rbmN)), after, d);
      s.rbm = R.num(s.rbm) + rr.sum; s.rbmN = after;
    }
    return { before: before, after: after };
  }
  function applyAdolescence(c, id, d) {
    var plan = adolescencePlan(id), cr = ensure(c);
    plan.forEach(function (p) {
      var i = skillIdx(c, p.key); if (i < 0) return;
      var s = c.skills[i]; s.ranks = ''; s.rbm = ''; s.rbmN = 0;
      addRanks(c, p.key, p.ranks, d);
    });
    cr.adol = id;
    return plan.length;
  }

  /* ---- background ---- */
  function inRange(roll, a, b) { return roll >= a && roll <= b; }
  function rangeKey(a, b) { return (a < 10 ? '0' + a : a) + '/' + (b === 100 ? '00' : (b < 10 ? '0' + b : b)); }
  function rangeOf(table, roll) {
    for (var i = 0; i < table.length; i++) if (inRange(roll, table[i][0], table[i][1])) return table[i];
    return null;
  }
  /* Tiro sulla tabella delle abilità speciali tenendo conto delle regole del popolo (ritira, considera come, sostituisce). */
  function rollSpecial(personId, d100) {
    var x = C.BGX[personId] || {}, log = [], tries = 0;
    for (;;) {
      var raw = d100(), eff = raw, row = rangeOf(C.BG.spec, eff), key = rangeKey(row[0], row[1]);
      if (x.map && x.map[key]) {
        var to = x.map[key], tk = to.split('/'); eff = tk[0] === '96' ? 96 : (tk[0] === '56' ? 56 : +tk[0]);
        row = rangeOf(C.BG.spec, eff); log.push('«' + key + '» trattato come «' + to + '»');
      }
      var k2 = rangeKey(row[0], row[1]);
      if (x.reroll && x.reroll.indexOf(k2) >= 0 && tries < 50) { tries++; log.push('tiro ' + raw + ' (' + k2 + '): da ritirare per questo popolo'); continue; }
      var title = row[2], text = row[3];
      if (x.rep && x.rep[k2]) { title = x.rep[k2][0]; text = x.rep[k2][1]; log.push('«' + k2 + '» sostituito da «' + title + '»'); }
      return { kind: 'spec', roll: raw, range: k2, title: title, text: text, log: log };
    }
  }
  function rollObject(d100) {
    var raw = d100(), row = rangeOf(C.BG.ogg, raw);
    return { kind: 'ogg', roll: raw, range: rangeKey(row[0], row[1]), title: row[2], text: row[3], log: [] };
  }
  function rollMoney(d100) {
    var raw = d100(), row = rangeOf(C.BG.den, raw);
    return { kind: 'den', roll: raw, range: rangeKey(row[0], row[1]), title: row[2] + ' MO', text: '', mo: row[2], log: [] };
  }

  /* ---- punti sviluppo ---- */
  function psPool(c, cat) {
    var cr = ensure(c), f = profByName(cr.prof || c.prof), base = f && f.ps[cat] ? f.ps[cat] : 0;
    return base + R.num(cr.ps.recv[cat]) - R.num(cr.ps.out[cat]) - R.num(cr.ps.spent[cat]);
  }
  /* costo di trasferimento: quanti PS di altre categorie servono per ottenerne 1 nella categoria cat */
  function transferRate(c, cat) {
    var cr = ensure(c), f = profByName(cr.prof || c.prof);
    if (cat === 'perc') return 1;
    if (cat === 'ama') return 2;
    return f && f.ps[cat] >= 1 ? 2 : 4;
  }
  function transfer(c, from, to, amount) {
    var cr = ensure(c), rate = transferRate(c, to), cost = rate * amount;
    if (amount <= 0 || from === to) return { ok: false, msg: 'Scegli due categorie diverse e una quantità positiva.' };
    if (psPool(c, from) < cost) return { ok: false, msg: 'In «' + from + '» restano ' + psPool(c, from) + ' PS: ne servono ' + cost + '.' };
    cr.ps.out[from] = R.num(cr.ps.out[from]) + cost;
    cr.ps.recv[to] = R.num(cr.ps.recv[to]) + amount;
    return { ok: true, cost: cost };
  }
  /* Spende PS per aumentare di 1 o 2 gradi un'abilità (costo 1 o 3). Le manovre in movimento: 1 PS per grado, senza limite per livello. */
  function raiseSkill(c, cat, key, n, d) {
    var cr = ensure(c), i = skillIdx(c, key); if (i < 0) return { ok: false, msg: 'Abilità non trovata.' };
    var m = D.SKILL_BY_KEY[key] || {}, mov = cat === 'mov';
    var already = R.num(cr.ps.raised[key]);
    var cost = mov ? n : n === 1 ? 1 : 3;
    if (!mov && already + n > 2) return { ok: false, msg: 'Nessuna abilità può crescere di più di due gradi per livello.' };
    if (!mov && n !== 1 && n !== 2) return { ok: false, msg: 'Si può salire di 1 o 2 gradi.' };
    if (psPool(c, cat) < cost) return { ok: false, msg: 'Punti insufficienti: restano ' + psPool(c, cat) + ', ne servono ' + cost + '. Trasferiscine da un\'altra categoria.' };
    var cur = Math.floor(R.num(c.skills[i].ranks));
    if (m.maxRanks && cur + n > m.maxRanks) return { ok: false, msg: 'Limite TB-4: al massimo ' + m.maxRanks + ' gradi in questa manovra.' };
    var r = addRanks(c, key, n, d);
    cr.ps.spent[cat] = R.num(cr.ps.spent[cat]) + cost;
    cr.ps.raised[key] = already + n;
    return { ok: true, cost: cost, before: r.before, after: r.after };
  }
  function spendPlain(c, cat, n) {
    var cr = ensure(c);
    if (n <= 0) return { ok: false, msg: 'Quantità non valida.' };
    if (psPool(c, cat) < n) return { ok: false, msg: 'Punti insufficienti: restano ' + psPool(c, cat) + '.' };
    cr.ps.spent[cat] = R.num(cr.ps.spent[cat]) + n;
    return { ok: true };
  }
  function newLevel(c) {
    var cr = ensure(c);
    c.livello = (Math.floor(R.num(c.livello)) || 0) + 1;
    cr.ps = { spent: {}, recv: {}, out: {}, raised: {} };
    var f = profByName(cr.prof || c.prof);
    if (f) applyProfession(c, f.n, c.livello);
    return c.livello;
  }

  var X = {
    personById: personById, profByName: profByName, ensure: ensure, allowedProfs: allowedProfs, profsIn: profsIn,
    profBonus: profBonus, applyProfession: applyProfession, profManualBonuses: profManualBonuses,
    statRolls: statRolls, statIncrease: statIncrease, aspectValue: aspectValue, statChecks: statChecks,
    adolescenceOf: adolescenceOf, adolescencePlan: adolescencePlan, resRolls: resRolls, addRanks: addRanks, applyAdolescence: applyAdolescence,
    rangeKey: rangeKey, rollSpecial: rollSpecial, rollObject: rollObject, rollMoney: rollMoney,
    psPool: psPool, transferRate: transferRate, transfer: transfer, raiseSkill: raiseSkill, spendPlain: spendPlain, newLevel: newLevel, skillIdx: skillIdx
  };
  G.creationlogic = X;
  if (typeof module !== 'undefined') module.exports = X;
})(typeof window !== 'undefined' ? window : globalThis);
