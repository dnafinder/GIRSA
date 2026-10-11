/* Calcoli del regolamento: funzioni pure, senza accesso al DOM. */
(function (root) {
  'use strict';
  var G = root.GIRSA = root.GIRSA || {};
  var D = G.data || (typeof require !== 'undefined' ? require('./data.js') : null);

  function num(v) { var n = parseFloat(v); return isFinite(n) ? n : 0; }
  function uid() { return 'c' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6); }
  function round1(n) { return Math.round(n * 10) / 10; }
  function fmt(n) { n = round1(n); return (n > 0 ? '+' : '') + n; }

  function defaultSettings() {
    return {
      dice: { high: 96, low: 5 },
      tb1: JSON.parse(JSON.stringify(D.TB1)),
      prog: { zero: -25, r1: 5, r2: 2, r3: 1, r4: 0.5 }
    };
  }

  function ctx(settings) { settings = settings || defaultSettings(); return { settings: settings, tb1: settings.tb1 || D.TB1 }; }

  /* ---- caratteristiche ---- */
  function tableBonus(score, table) {
    if (score === '' || score == null || isNaN(+score)) return null;
    var s = +score;
    for (var i = 0; i < table.length; i++) { if (s >= +table[i].from && s <= +table[i].to) return +table[i].bonus; }
    return null;
  }
  function statBonus(c, k, cx) {
    if (k === 'AS') k = 'PR';
    var st = c.stats[k]; if (!st) return 0;
    if (st.bonus !== '' && st.bonus != null) return num(st.bonus);
    var a = tableBonus(st.score, cx.tb1); return a == null ? 0 : a;
  }
  function statTotal(c, k, cx) { return statBonus(c, k, cx) + (c.stats[k] ? num(c.stats[k].razza) : 0); }

  /* Costo della distribuzione punti: 20-90 pari al valore, oltre 90 + (valore-90)^2. */
  function pointCost(v) {
    if (v === '' || v == null) return null;
    var n = Math.round(num(v));
    if (n >= 20 && n <= 90) return n;
    if (n > 90 && n <= 100) return 90 + (n - 90) * (n - 90);
    return undefined;
  }
  function pointsSpent(c) {
    var sum = 0;
    D.STATS.forEach(function (s) { if (s[0] === 'AS') return; var v = pointCost(c.stats[s[0]].score); if (v) sum += v; });
    return sum;
  }

  /* ---- abilità ---- */
  function primaryProg(settings) {
    var p = settings && settings.prog; if (!p) return D.PROG.primary;
    return { zero: num(p.zero), steps: [[10, num(p.r1)], [20, num(p.r2)], [30, num(p.r3)], [Infinity, num(p.r4)]] };
  }
  function rankBonus(n, prog) {
    n = Math.floor(num(n));
    if (n <= 0) return prog.zero;
    var t = 0;
    for (var k = 1; k <= Math.min(n, 300); k++) {
      for (var i = 0; i < prog.steps.length; i++) { if (k <= prog.steps[i][0]) { t += prog.steps[i][1]; break; } }
    }
    if (prog.cap != null) t = Math.min(t, prog.cap);
    return t;
  }
  function meta(s) { return D.SKILL_BY_KEY[s.k] || {}; }
  function ranksOf(c, i) {
    var s = c.skills[i], m = meta(s);
    if (m.link) { for (var j = 0; j < c.skills.length; j++) { if (c.skills[j].k === m.link) return num(c.skills[j].ranks); } }
    return num(s.ranks);
  }
  function rankPart(c, i, cx) {
    var s = c.skills[i], m = meta(s);
    if (m.noRanks) return 0;
    if (m.prog === 'manual') return num(s.rbm);
    var prog = m.prog === 'spalle' ? D.PROG.spalle : primaryProg(cx.settings);
    return rankBonus(ranksOf(c, i), prog);
  }
  function skillTotal(c, i, cx) {
    var s = c.skills[i], m = meta(s);
    return rankPart(c, i, cx) + (s.stat && !m.noStat ? statTotal(c, s.stat, cx) : 0) +
      (m.noProf ? 0 : num(s.prof)) + (m.noObj ? 0 : num(s.obj)) + num(s.spec);
  }
  function defenseTotal(c, key, stat, cx) {
    var d = c.defs[key] || {};
    return statTotal(c, stat, cx) + num(d.mod) + num(d.extra);
  }

  /* ---- ferite, guarigione, esperienza ---- */
  function pfInfo(c) {
    var max = num(c.pf && c.pf.max), dmg = num(c.pf && c.pf.dmg), co = num(c.stats.CO.score);
    var cur = max - dmg, deathAt = max + co;
    var state = !max ? 'nd' : dmg >= deathAt ? 'morte' : cur < 0 ? 'sotto' : cur === 0 ? 'zero' : 'ok';
    return { max: max, dmg: dmg, cur: cur, deathAt: deathAt, state: state };
  }
  /* giorni di guarigione: colonna 0..5, gravità 'lieve'|'media'|'grave', total = tiro d100 + bonus CO */
  function healDays(total, col, severity) {
    var row = D.HEAL_ROWS[D.HEAL_ROWS.length - 1];
    for (var i = 0; i < D.HEAL_ROWS.length; i++) { if (total <= D.HEAL_ROWS[i].max) { row = D.HEAL_ROWS[i]; break; } }
    return row.days[col] * (severity === 'grave' ? 10 : severity === 'media' ? 5 : 1);
  }
  /* PF recuperati: 1 ogni 3 ore se attivo; a riposo 1 ogni 5 punti di bonus CO per ora (minimo 1) */
  function pfPerHourResting(coBonus) { return Math.max(1, Math.floor(num(coBonus) / 5)); }
  function xpForLevel(level) {
    level = Math.max(1, Math.floor(num(level)));
    return level <= 20 ? D.XP[level - 1] : D.XP[19] + (level - 20) * 50000;
  }

  /* ---- popoli ---- */
  function applyPopolo(c, name) {
    var p = null; D.POPOLI.forEach(function (x) { if (x.n === name) p = x; });
    if (!p) return false;
    D.STATS.forEach(function (s) { if (p.st[s[0]] != null) c.stats[s[0]].razza = p.st[s[0]]; });
    ['ess', 'fls', 'men', 'vel', 'mal'].forEach(function (k) { c.defs[k].mod = p.tr[k]; });
    c.popolo = name; c.razza = name;
    return true;
  }

  /* ---- scheda nuova ---- */
  function newChar(name) {
    var c = {
      id: uid(), name: name || 'Nuovo personaggio', prof: '', regno: '', razza: '', popolo: '', livello: '', px: '', pm: '',
      altezza: '', capelli: '', occhi: '', lingue: '', temperamento: '', segni: '',
      pool: 400, stats: {}, skills: [], ps: {}, defs: {}, pf: { max: '', dmg: 0 },
      prot: { armatura: '', res: '', scudo: '', elmo: '', bracciali: '', schinieri: '', modbd: '', ingombro: '', mov: '' },
      bonusVari: '', note: '', corruzione: '', spells: [], inv: [], reputazione: '', denaro: '', classi: '',
      diary: { book: '', par: '', log: [], flags: [] }
    };
    D.STATS.forEach(function (s) { c.stats[s[0]] = { score: '', bonus: '', razza: '' }; });
    D.SKILLS.forEach(function (d) {
      c.skills.push({ cat: d.cat, k: d.k, name: d.name, stat: d.stat, ranks: '', prof: '', obj: '', spec: d.spec === 0 ? '' : d.spec, rbm: '' });
    });
    for (var i = 0; i < 6; i++) c.skills.push({ cat: 'sec', k: 'sec' + i, name: '', stat: '', ranks: '', prof: '', obj: '', spec: '', rbm: '' });
    D.DEFENSES.forEach(function (d) { c.defs[d[0]] = { mod: '', extra: '' }; });
    return c;
  }

  var R = {
    num: num, uid: uid, fmt: fmt, round1: round1, defaultSettings: defaultSettings, ctx: ctx, tableBonus: tableBonus,
    statBonus: statBonus, statTotal: statTotal, pointCost: pointCost, pointsSpent: pointsSpent, rankBonus: rankBonus,
    primaryProg: primaryProg, ranksOf: ranksOf, rankPart: rankPart, skillTotal: skillTotal, defenseTotal: defenseTotal,
    pfInfo: pfInfo, healDays: healDays, pfPerHourResting: pfPerHourResting, xpForLevel: xpForLevel,
    applyPopolo: applyPopolo, newChar: newChar, meta: meta
  };
  G.rules = R;
  if (typeof module !== 'undefined') module.exports = R;
})(typeof window !== 'undefined' ? window : globalThis);
