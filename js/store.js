/* Archivio locale: stato dell'app in localStorage, con copia in memoria se il browser lo impedisce. */
(function (root) {
  'use strict';
  var G = root.GIRSA = root.GIRSA || {};
  var R = G.rules || (typeof require !== 'undefined' ? require('./rules.js') : null);
  var KEY = 'girsa:v1';
  var state = null, saveOk = true, timer = null;

  function blank() {
    var c = R.newChar('Personaggio 1');
    return { v: 1, cur: c.id, chars: [c], settings: R.defaultSettings(), atk: [], crit: [], enemies: [], clog: [], dlog: [] };
  }

  /* Completa uno stato letto da disco o importato, senza toccare i dati presenti. */
  function migrate(o) {
    var b = blank();
    if (!o || typeof o !== 'object' || !Array.isArray(o.chars) || !o.chars.length) return b;
    ['atk', 'crit', 'enemies', 'clog', 'dlog'].forEach(function (k) { if (!Array.isArray(o[k])) o[k] = []; });
    o.settings = o.settings || b.settings;
    o.settings.dice = o.settings.dice || b.settings.dice;
    o.settings.tb1 = o.settings.tb1 || b.settings.tb1;
    o.settings.prog = o.settings.prog || b.settings.prog;
    o.chars.forEach(function (c) {
      var n = R.newChar(c.name);
      Object.keys(n).forEach(function (k) { if (c[k] === undefined) c[k] = n[k]; });
      Object.keys(n.stats).forEach(function (k) { if (!c.stats[k]) c.stats[k] = n.stats[k]; });
      Object.keys(n.defs).forEach(function (k) { if (!c.defs[k]) c.defs[k] = n.defs[k]; });
      Object.keys(n.diary).forEach(function (k) { if (c.diary[k] === undefined) c.diary[k] = n.diary[k]; });
    });
    if (!o.chars.some(function (c) { return c.id === o.cur; })) o.cur = o.chars[0].id;
    o.v = 1;
    return o;
  }

  function load() {
    try {
      var s = localStorage.getItem(KEY);
      if (s) { state = migrate(JSON.parse(s)); return state; }
    } catch (e) { saveOk = false; }
    state = blank();
    return state;
  }
  function flush() {
    timer = null;
    try { localStorage.setItem(KEY, JSON.stringify(state)); saveOk = true; } catch (e) { saveOk = false; }
  }
  function save() { if (timer) clearTimeout(timer); timer = setTimeout(flush, 250); }

  function cur() {
    for (var i = 0; i < state.chars.length; i++) if (state.chars[i].id === state.cur) return state.chars[i];
    return state.chars[0];
  }
  function setPath(o, p, v) {
    var k = p.split('.');
    for (var i = 0; i < k.length - 1; i++) { if (o[k[i]] == null) o[k[i]] = {}; o = o[k[i]]; }
    o[k[k.length - 1]] = v;
  }
  function getPath(o, p) {
    var k = p.split('.');
    for (var i = 0; i < k.length; i++) { if (o == null) return undefined; o = o[k[i]]; }
    return o;
  }
  function replaceAll(o) { state = migrate(o); flush(); return state; }

  var S = {
    load: load, save: save, flush: flush, cur: cur, setPath: setPath, getPath: getPath, migrate: migrate, blank: blank,
    replaceAll: replaceAll, get: function () { return state; }, ok: function () { return saveOk; }
  };
  G.store = S;
  if (typeof module !== 'undefined') module.exports = S;
})(typeof window !== 'undefined' ? window : globalThis);
