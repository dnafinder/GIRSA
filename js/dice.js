/*
 * Dadi. Il tiro "aperto" del d100: i PDF dicono solo "1d100 aperto" senza definirlo.
 * Si usa la convenzione MERP/Rolemaster, con soglie modificabili dalla pagina Dati:
 *  - primo tiro >= alta (96): si tira ancora e si somma, finché esce >= alta;
 *  - primo tiro <= bassa (5): si tira ancora e si sottrae, finché esce >= alta.
 */
(function (root) {
  'use strict';
  var G = root.GIRSA = root.GIRSA || {};

  function makeDice(rand) {
    rand = rand || Math.random;
    function d(n) { return Math.floor(rand() * n) + 1; }
    function d100() { return d(100); }

    function open(cfg) {
      cfg = cfg || {};
      var hi = cfg.high == null ? 96 : cfg.high, lo = cfg.low == null ? 5 : cfg.low;
      var first = d100(), rolls = [first], total = first, dir = '', r;
      if (first >= hi) {
        dir = 'alto';
        do { r = d100(); rolls.push(r); total += r; } while (r >= hi && rolls.length < 50);
      } else if (first <= lo) {
        dir = 'basso';
        do { r = d100(); rolls.push(r); total -= r; } while (r >= hi && rolls.length < 50);
      }
      return { first: first, rolls: rolls, total: total, dir: dir };
    }
    function closed() { var v = d100(); return { first: v, rolls: [v], total: v, dir: '' }; }

    /* NdM+K, ad esempio 2d6+1 */
    function expr(text) {
      var m = String(text).replace(/\s+/g, '').match(/^(\d*)d(\d+)([+-]\d+)?$/i);
      if (!m) return null;
      var n = m[1] === '' ? 1 : +m[1], sides = +m[2], mod = m[3] ? +m[3] : 0;
      if (n < 1 || n > 100 || sides < 2 || sides > 1000) return null;
      var rolls = [], total = mod;
      for (var i = 0; i < n; i++) { var v = d(sides); rolls.push(v); total += v; }
      return { rolls: rolls, total: total, n: n, sides: sides, mod: mod };
    }
    return { d: d, d100: d100, open: open, closed: closed, expr: expr };
  }

  var api = { makeDice: makeDice, dice: makeDice() };
  G.dice = api;
  if (typeof module !== 'undefined') module.exports = api;
})(typeof window !== 'undefined' ? window : globalThis);
