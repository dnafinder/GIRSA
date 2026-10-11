/* Utilità di interfaccia: escape, campi, valori calcolati, barra dell'ultimo tiro. */
(function (root) {
  'use strict';
  var G = root.GIRSA = root.GIRSA || {};
  var R = G.rules, S = G.store;

  var MAP = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return MAP[c]; }); }

  /* Stato volatile (non salvato): moduli del combattimento, import, ecc. */
  var tmp = {};

  /* attr: data-p (scheda), data-s (impostazioni), data-t (volatile) */
  function inp(attr, path, val, o) {
    o = o || {};
    return '<input ' + attr + '="' + esc(path) + '" value="' + esc(val) + '" type="' + (o.type || 'text') + '"' +
      (o.type === 'number' ? ' step="' + (o.step || 'any') + '" inputmode="decimal"' : '') +
      (o.cls ? ' class="' + o.cls + '"' : '') + (o.ph != null ? ' placeholder="' + esc(o.ph) + '"' : '') +
      (o.dis ? ' disabled' : '') + (o.title ? ' title="' + esc(o.title) + '"' : '') +
      (o.label ? ' aria-label="' + esc(o.label) + '"' : '') + '>';
  }
  function sel(attr, path, val, opts, o) {
    o = o || {};
    return '<select ' + attr + '="' + esc(path) + '"' + (o.re ? ' data-re="1"' : '') + (o.cls ? ' class="' + o.cls + '"' : '') +
      (o.label ? ' aria-label="' + esc(o.label) + '"' : '') + '>' +
      opts.map(function (x) {
        var v = Array.isArray(x) ? x[0] : x, l = Array.isArray(x) ? x[1] : x;
        return '<option value="' + esc(v) + '"' + (String(v) === String(val) ? ' selected' : '') + '>' + esc(l) + '</option>';
      }).join('') + '</select>';
  }
  function check(attr, path, val, label) {
    return '<label class="chk"><input type="checkbox" ' + attr + '="' + esc(path) + '"' + (val ? ' checked' : '') + '> ' + esc(label) + '</label>';
  }
  function field(label, html) { return '<label class="fld"><span>' + esc(label) + '</span>' + html + '</label>'; }

  /* ---- valori calcolati: aggiornati senza ridisegnare la pagina ---- */
  function calcText(kind, arg) {
    var c = S.cur(), st = S.get(), cx = R.ctx(st.settings), D = G.data;
    switch (kind) {
      case 'sb': return R.fmt(R.statBonus(c, arg, cx));
      case 'st': return R.fmt(R.statTotal(c, arg, cx));
      case 'sk': return R.fmt(R.skillTotal(c, +arg, cx));
      case 'rk': return R.fmt(R.rankPart(c, +arg, cx));
      case 'df': var d = D.DEFENSES.filter(function (x) { return x[0] === arg; })[0]; return R.fmt(R.defenseTotal(c, arg, d[2], cx));
      case 'pts': return R.pointsSpent(c) + ' / ' + R.num(c.pool);
      case 'pf': var p = R.pfInfo(c); return pfText(p);
      case 'lvl': return c.livello === '' ? '' : String(R.xpForLevel(+c.livello));
    }
    return '';
  }
  function pfText(p) {
    if (p.state === 'nd') return 'PF massimi non impostati';
    var s = p.cur + ' / ' + p.max + ' PF';
    if (p.state === 'zero') s += ' · a zero';
    if (p.state === 'sotto') s += ' · sotto zero (morte a ' + p.deathAt + ' di danno)';
    if (p.state === 'morte') s += ' · MORTO';
    return s;
  }
  function updateCalc() {
    var nodes = document.querySelectorAll('[data-calc]');
    for (var i = 0; i < nodes.length; i++) {
      var n = nodes[i], a = n.getAttribute('data-calc').split(':');
      n.textContent = calcText(a[0], a[1]);
      if (a[0] === 'pf') n.setAttribute('data-state', R.pfInfo(S.cur()).state);
    }
    var ph = document.getElementById('pfstrip');
    if (ph) { var p = R.pfInfo(S.cur()); ph.textContent = pfText(p); ph.setAttribute('data-state', p.state); }
    var bonusPh = document.querySelectorAll('[data-bph]');
    for (var j = 0; j < bonusPh.length; j++) {
      var k = bonusPh[j].getAttribute('data-bph'), b = R.tableBonus(S.cur().stats[k].score, R.ctx(S.get().settings).tb1);
      bonusPh[j].setAttribute('placeholder', b == null ? '' : R.fmt(b));
    }
  }
  function calc(kind, arg, cls) {
    return '<b class="tot ' + (cls || '') + '" data-calc="' + kind + (arg != null ? ':' + arg : '') + '">' + esc(calcText(kind, arg)) + '</b>';
  }

  /* ---- ultimo tiro, sempre visibile ---- */
  function showRoll(label, detail, value) {
    var st = S.get();
    st.dlog.unshift({ t: Date.now(), label: label, detail: detail, value: value });
    if (st.dlog.length > 60) st.dlog.length = 60;
    S.save();
    paintLast();
  }
  function paintLast() {
    var el = document.getElementById('lastroll'), l = S.get().dlog[0];
    if (!el) return;
    el.innerHTML = l ? '<span class="lr-l">' + esc(l.label) + '</span> <span class="lr-d">' + esc(l.detail) + '</span> <b class="lr-v">' + esc(l.value) + '</b>' : 'Nessun tiro';
  }

  function toast(msg) {
    var t = document.getElementById('toast'); if (!t) return;
    t.textContent = msg; t.className = 'show';
    clearTimeout(toast._t); toast._t = setTimeout(function () { t.className = ''; }, 3200);
  }

  function logLine(arr, text) {
    arr.unshift({ t: Date.now(), s: text });
    if (arr.length > 80) arr.length = 80;
  }
  function timeStr(t) {
    var d = new Date(t), p = function (n) { return (n < 10 ? '0' : '') + n; };
    return p(d.getDate()) + '/' + p(d.getMonth() + 1) + ' ' + p(d.getHours()) + ':' + p(d.getMinutes());
  }

  function bundled() { return G.tabledata || { atk: [], crit: [] }; }
  function weaponCat() { return G.weapondata || []; }
  function allAtk() { return bundled().atk.concat(S.get().atk); }
  function allCrit() { return bundled().crit.concat(S.get().crit); }

  var U = {
    weaponCat: weaponCat, allAtk: allAtk, allCrit: allCrit, bundled: bundled,
    esc: esc, tmp: tmp, inp: inp, sel: sel, check: check, field: field, calc: calc, calcText: calcText, updateCalc: updateCalc,
    showRoll: showRoll, paintLast: paintLast, toast: toast, logLine: logLine, timeStr: timeStr, pfText: pfText
  };
  G.ui = U;
  G.pages = G.pages || {};
  if (typeof module !== 'undefined') module.exports = U;
})(typeof window !== 'undefined' ? window : globalThis);
