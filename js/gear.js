/* Equipaggiamento, armature, metalli, gemme ed erbe: funzioni pure di ricerca e di formattazione sui dati del compendio
   (js/geardata.js, generato dai PDF). Provate in tests/gear.test.js; l'interfaccia è in gearpage.js. */
(function (root) {
  'use strict';
  var G = root.GIRSA = root.GIRSA || {};
  var GD = G.geardata || (typeof require !== 'undefined' ? require('./geardata.js') : null);

  var CAT = { cur: 'Curativa', var: 'Varia / d\'utilità', vel: 'Veleno', mal: 'Malattia / effetto ambientale' };

  /* Testo su cui si cerca: tutti i campi di testo della riga. */
  function hay(o) {
    return Object.keys(o).map(function (k) { return typeof o[k] === 'string' ? o[k] : ''; }).join(' ').toLowerCase();
  }
  /* Righe filtrate per testo; ogni risultato porta l'indice originale (serve ai pulsanti «Aggiungi»). */
  function filter(rows, q) {
    q = String(q == null ? '' : q).toLowerCase().trim();
    var out = [];
    rows.forEach(function (r, i) { if (!q || hay(r).indexOf(q) >= 0) out.push({ r: r, i: i }); });
    return out;
  }
  /* Erbe: testo, categoria ('' = tutte) e clima ('' = tutti, altrimenti indice in erbeClimi). */
  function herbs(q, cat, cl) {
    q = String(q == null ? '' : q).toLowerCase().trim();
    var out = [];
    GD.erbe.forEach(function (h, i) {
      if (cat && h.cat !== cat) return;
      if (cl !== '' && cl != null && h.cl !== +cl) return;
      if (q && (hay(h) + ' ' + GD.erbeTerreni[h.te].toLowerCase() + ' ' + GD.erbeClimi[h.cl].toLowerCase()).indexOf(q) < 0) return;
      out.push({ r: h, i: i });
    });
    return out;
  }

  /* ---- armature: ricerca per nome (come scritto da «Indossa»: «Nome (SIGLA)» per le armature) ---- */
  function armorFind(name) {
    var s = String(name == null ? '' : name).trim().toLowerCase();
    if (!s) return null;
    var A = GD.armature, m = s.match(/^(.*)\s\((na|cg|cr|cm|cp)\)$/), hits = [];
    A.body.forEach(function (sec) {
      sec.rows.forEach(function (r) {
        if (m ? (sec.id.toLowerCase() === m[2] && r.n.toLowerCase() === m[1].trim()) : r.n.toLowerCase() === s) hits.push({ kind: 'body', sec: sec, row: r });
      });
    });
    A.elmi.forEach(function (r) { if (r.n.toLowerCase() === s) hits.push({ kind: 'elmo', row: r }); });
    A.scudi.forEach(function (r) { if (r.n.toLowerCase() === s) hits.push({ kind: 'scudo', row: r }); });
    return hits.length === 1 ? hits[0] : null;
  }
  /* Nome da scrivere nella Scheda: le armature portano la sigla del gruppo, perché alcuni nomi si ripetono. */
  function wornName(kind, sec, row) { return kind === 'body' ? row.n + ' (' + sec.id + ')' : row.n; }
  function armorLine(f) {
    if (!f) return '';
    var r = f.row, p = [];
    if (f.kind === 'body') {
      if (r.mm) p.push('MM ' + r.mm);
      if (r.bom) p.push('BO-M ' + r.bom);
      if (r.bot) p.push('BO-T ' + r.bot);
      p.push('Res ' + r.res);
      if (r.bd) p.push('BD ' + r.bd);
    } else if (f.kind === 'elmo') {
      if (r.prc) p.push('PRC ' + r.prc);
      p.push('Res ' + r.res);
      if (r.bdi) p.push('BD-I ' + r.bdi);
    } else {
      p.push('BD-M ' + r.bdm, 'BD-T ' + r.bdt, 'BD-I ' + r.bdi, 'Res ' + r.res);
    }
    return p.join(' · ');
  }

  /* Voce d'inventario da una riga di catalogo: nome e nota (prezzo, peso, tempo di produzione). */
  function invNote(parts) { return parts.filter(function (x) { return x; }).join(' · '); }

  var Ge = { CAT: CAT, filter: filter, herbs: herbs, armorFind: armorFind, armorLine: armorLine, wornName: wornName, invNote: invNote, hay: hay };
  G.gear = Ge;
  if (typeof module !== 'undefined') module.exports = Ge;
})(typeof window !== 'undefined' ? window : globalThis);
