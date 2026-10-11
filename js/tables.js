/*
 * Tabelle di attacco e dei colpi critici: importazione e consultazione.
 * Le tabelle non sono incluse nel progetto. Si incollano dalla pagina Dati,
 * copiandole dal PDF, oppure si importa un file JSON (vedi data/README.md).
 */
(function (root) {
  'use strict';
  var G = root.GIRSA = root.GIRSA || {};
  var D = G.data || (typeof require !== 'undefined' ? require('./data.js') : null);

  function norm(line) { return line.replace(/[–−—]/g, '-').trim(); }

  function parseCell(s) {
    if (/^F$/i.test(s)) return { pf: 0, crit: null, fail: true };
    var m = s.match(/^(\d+)([A-Ea-eTt])?$/);
    if (!m) throw new Error('Cella non valida: "' + s + '"');
    return { pf: +m[1], crit: m[2] ? m[2].toUpperCase() : null };
  }

  /* Riga attesa: "36-40 0 0 0 0 0", "xx-35 0 0 0 0 0", "96-100 6 9 10B 13B 13C" */
  function parseAttackText(text, nCols) {
    var rows = [];
    String(text).split(/\r?\n/).forEach(function (raw) {
      var line = norm(raw); if (!line) return;
      var m = line.match(/^(xx|\d+)\s*-\s*(\d+)\s+(.+)$/i);
      if (!m) return;
      var cells = m[3].trim().split(/\s+/);
      if (cells.length !== nCols) throw new Error('Riga "' + line + '": attese ' + nCols + ' colonne, trovate ' + cells.length);
      rows.push({ min: /^xx$/i.test(m[1]) ? null : +m[1], max: +m[2], cells: cells.map(parseCell) });
    });
    validateAttackRows(rows);
    return rows;
  }

  function validateAttackRows(rows) {
    if (!rows.length) throw new Error('Nessuna riga riconosciuta');
    for (var i = 0; i < rows.length; i++) {
      var r = rows[i];
      if (r.max < (r.min == null ? -Infinity : r.min)) throw new Error('Intervallo non valido alla riga ' + (i + 1));
      if (i > 0) {
        var prev = rows[i - 1];
        if (r.min == null || r.min !== prev.max + 1) throw new Error('Gli intervalli non sono contigui tra le righe ' + i + ' e ' + (i + 1));
      }
    }
  }

  /* Riga della tabella per un risultato; sotto la prima riga si usa la prima, sopra l'ultima si usa l'ultima. */
  function lookupAttack(table, result) {
    var rows = table.rows, last = rows.length - 1;
    for (var i = 0; i <= last; i++) {
      var r = rows[i];
      if ((r.min == null || result >= r.min) && result <= r.max) return { row: r, beyond: false };
    }
    return result < rows[0].min ? { row: rows[0], beyond: false } : { row: rows[last], beyond: true };
  }
  /*
   * Cella della tabella.
   * opts.first: tiro non modificato (per le righe «TI», tiro invariato);
   * opts.limit: etichetta del limite scelto (taglia della creatura o tipo di dardo): il risultato non supera il massimo di quel limite.
   */
  function attackCell(table, armorIndex, result, opts) {
    opts = opts || {};
    var ti = table.ti || [], i, lim = null;
    if (opts.limit) { (table.limits || []).forEach(function (l) { if (l.label === opts.limit) lim = l; }); }
    if (opts.first != null) {
      for (i = 0; i < ti.length; i++) {
        var e = ti[i];
        if (opts.first >= e.min && opts.first <= e.max && (e.limit == null || e.limit === opts.limit)) {
          return { cell: e.cells[armorIndex], beyond: false, row: e, ti: true, capped: false };
        }
      }
    }
    var capped = false;
    if (lim && result > lim.max) { result = lim.max; capped = true; }
    var f = lookupAttack(table, result);
    return { cell: f.row.cells[armorIndex], beyond: f.beyond, row: f.row, ti: false, capped: capped };
  }

  /* Tabella critici: righe come "06-16 testo...", "80 testo", "-(49)-05 testo"; le righe senza intervallo continuano la precedente. */
  function parseCritText(text) {
    var rows = [], cur = null;
    String(text).split(/\r?\n/).forEach(function (raw) {
      var line = norm(raw); if (!line) return;
      var m = line.match(/^(-\(\d+\)-\d+|\d+-\d+|\d+)\s+(.*)$/);
      if (m) {
        var t = m[1], min, max;
        if (t.charAt(0) === '-') { min = null; max = +t.split('-').pop(); }
        else if (t.indexOf('-') > 0) { var p = t.split('-'); min = +p[0]; max = +p[1]; }
        else { min = max = +t; }
        cur = { min: min, max: max, text: m[2].trim() }; rows.push(cur);
      } else if (cur) { cur.text += ' ' + line; }
    });
    if (!rows.length) throw new Error('Nessuna riga riconosciuta');
    return rows;
  }
  function lookupCrit(table, roll) {
    var rows = table.rows;
    for (var i = 0; i < rows.length; i++) {
      var r = rows[i];
      if ((r.min == null || roll >= r.min) && roll <= r.max) return r;
    }
    return roll > rows[rows.length - 1].max ? rows[rows.length - 1] : rows[0];
  }
  /* Tiro del critico: d100 chiuso più il modificatore della lettera */
  function critRoll(raw, letter) { return raw + (D.CRIT_MOD[letter] || 0); }

  /* Armatura dell'avversario: indice colonna a partire dal nome */
  function armorIndex(table, name) { return table.armors.indexOf(name); }

  var T = {
    parseAttackText: parseAttackText, validateAttackRows: validateAttackRows, lookupAttack: lookupAttack, attackCell: attackCell,
    parseCritText: parseCritText, lookupCrit: lookupCrit, critRoll: critRoll, armorIndex: armorIndex
  };
  G.tables = T;
  if (typeof module !== 'undefined') module.exports = T;
})(typeof window !== 'undefined' ? window : globalThis);
