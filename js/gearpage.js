/* Pagina Oggetti: equipaggiamento e prezzi (TS-4), statistiche delle armature (TSC-4), metalli e gemme, erbe, veleni e malattie (TS-5).
   Dati dal compendio (js/geardata.js); i pulsanti portano le voci nell'inventario, nelle protezioni o nell'erbario del personaggio. */
(function (root) {
  'use strict';
  var G = root.GIRSA = root.GIRSA || {};
  var U = G.ui, S = G.store, esc = U.esc, Ge = G.gear, GD = G.geardata;
  G.acts = G.acts || {};

  function T() { return U.tmp.gear || (U.tmp.gear = { sec: 'armi', q: '', cat: '', cl: '', lim: 60, sig: '' }); }

  var SECS = [
    ['armi', 'Armi: prezzi'], ['prot', 'Protezioni: prezzi'], ['arm', 'Armature, elmi e scudi: statistiche'], ['acc', 'Accessori e oggetti'], ['borse', 'Borse e zaini'],
    ['vest', 'Indossati e vestiti'], ['vitto', 'Vitto, alloggio e servizi'], ['trasp', 'Trasporti'], ['met', 'Metalli'], ['gem', 'Gemme'], ['erbe', 'Erbe e veleni'], ['mal', 'Malattie']
  ];

  /* Tabelle di prezzi: colonne [intestazione, campo, classe] */
  var PRICE = {
    armi: { rows: function () { return GD.equip.armi; }, cols: [['Arma', 'n', 'l'], ['Costo', 'costo'], ['Peso', 'peso'], ['T.P.', 'tp']] },
    prot: { rows: function () { return GD.equip.prot; }, cols: [['Equipaggiamento', 'n', 'l'], ['Costo', 'costo'], ['Peso', 'peso'], ['T.P.', 'tp']], notes: function () { return GD.equip.prot_note; } },
    acc: { rows: function () { return GD.equip.accessori; }, cols: [['Oggetto', 'n', 'l'], ['Costo', 'costo'], ['Peso', 'peso'], ['T.P.', 'tp'], ['Note', 'note', 'l']], notes: function () { return [GD.equip.oggetti_note]; } },
    borse: { rows: function () { return GD.equip.borse; }, cols: [['Oggetto', 'n', 'l'], ['Costo', 'costo'], ['Peso', 'peso'], ['T.P.', 'tp'], ['Note', 'note', 'l']], notes: function () { return [GD.equip.oggetti_note]; } },
    vest: { rows: function () { return GD.equip.vestiti; }, cols: [['Oggetto', 'n', 'l'], ['Costo', 'costo'], ['Peso*', 'peso'], ['T.P.', 'tp'], ['Note', 'note', 'l']], notes: function () { return [GD.equip.oggetti_note, '*Il peso viene considerato come carico solo quando l’oggetto è trasportato, non quando è indossato']; } },
    vitto: { rows: function () { return GD.equip.vitto; }, cols: [['Merce o servizio', 'n', 'l'], ['Costo', 'costo'], ['Note', 'note', 'l']], notes: function () { return GD.equip.vitto_note; } },
    trasp: { rows: function () { return GD.equip.trasporti; }, cols: [['Mezzo di trasporto', 'n', 'l'], ['Costo', 'costo'], ['Velocità di viaggio', 'vel'], ['Capacità', 'cap'], ['Bonus Cavalcare*', 'cav']], notes: function () { return GD.equip.trasporti_note; } }
  };

  function table(head, rows) {
    return '<div class="scroll"><table class="sk"><thead><tr>' + head.map(function (h) { return '<th' + (h[1] ? ' class="l"' : '') + '>' + esc(h[0]) + '</th>'; }).join('') + '</tr></thead><tbody>' + rows.join('') + '</tbody></table></div>';
  }
  function td(v, l) { return '<td' + (l ? ' class="l"' : '') + '>' + esc(v) + '</td>'; }
  function notes(arr) { return arr.map(function (n) { return '<p class="hint">' + esc(n) + '</p>'; }).join(''); }
  function more(t, total, shown) {
    return total > shown ? '<p class="hint">Mostrate ' + shown + ' voci su ' + total + '. <button class="mini" data-act="gear_more">Mostra altre</button></p>' : '';
  }

  function priceSec(k) {
    var t = T(), P = PRICE[k], res = Ge.filter(P.rows(), t.q), shown = res.slice(0, t.lim);
    var head = P.cols.map(function (c) { return [c[0], c[2]]; }).concat([['', '']]);
    var rows = shown.map(function (x) {
      return '<tr>' + P.cols.map(function (c) { return td(x.r[c[1]], c[2]); }).join('') + '<td><button class="mini" data-act="gear_inv" data-k="' + k + '" data-i="' + x.i + '" aria-label="Aggiungi ' + esc(x.r.n) + ' all\'inventario">+ Inv.</button></td></tr>';
    });
    return (res.length ? table(head, rows) : '<p class="hint">Nessuna voce trovata.</p>') + more(t, res.length, shown.length) + (P.notes ? notes(P.notes()) : '');
  }

  /* ---- armature ---- */
  function wearBtn(kind, sec, i, name) {
    return '<td><button class="mini" data-act="gear_wear" data-kind="' + kind + '" data-sec="' + sec + '" data-i="' + i + '" aria-label="Indossa ' + esc(name) + '">Indossa</button></td>';
  }
  function armSec() {
    var t = T(), q = (t.q || '').toLowerCase().trim(), A = GD.armature, h = '', any = false;
    var ok = function (r) { return !q || Ge.hay(r).indexOf(q) >= 0; };
    A.body.forEach(function (sec) {
      var rows = [];
      sec.rows.forEach(function (r, i) {
        if (ok(r)) rows.push('<tr>' + td(r.n, 1) + td(r.mm) + td(r.bom) + td(r.bot) + td(r.d, 1) + td(r.res) + td(r.bd) + wearBtn('body', sec.id, i, r.n) + '</tr>');
      });
      if (!rows.length) return;
      any = true;
      h += '<h3>' + esc(sec.n) + '</h3>' + table([['Armatura', 1], ['MM', 0], ['BO-M', 0], ['BO-T', 0], ['Descrizione', 1], ['Res', 0], ['BD', 0], ['', 0]], rows) + (sec.id === 'NA' ? notes([A.note.NA]) : '');
    });
    var er = [];
    A.elmi.forEach(function (r, i) { if (ok(r)) er.push('<tr>' + td(r.n, 1) + td(r.prc) + td(r.d, 1) + td(r.res) + td(r.bdi) + wearBtn('elmo', 'elmi', i, r.n) + '</tr>'); });
    if (er.length) { any = true; h += '<h3>Elmi e copricapi</h3>' + table([['Elmo', 1], ['PRC', 0], ['Descrizione', 1], ['Res', 0], ['BD-I', 0], ['', 0]], er) + notes([A.note.elmi]); }
    if (!q || /bracciali|schinieri|avambraccia|gambe|cuoio|metallo/.test(q)) { any = true; h += '<h3>' + esc(A.bracciali.titolo) + '</h3>' + notes(A.bracciali.righe); }
    var sr = [];
    A.scudi.forEach(function (r, i) { if (ok(r)) sr.push('<tr>' + td(r.n, 1) + td(r.bdm) + td(r.bdt) + td(r.bdi) + td(r.d, 1) + td(r.res) + wearBtn('scudo', 'scudi', i, r.n) + '</tr>'); });
    if (sr.length) { any = true; h += '<h3>Scudi</h3>' + table([['Scudo', 1], ['BD-M', 0], ['BD-T', 0], ['BD-I', 0], ['Descrizione', 1], ['Res', 0], ['', 0]], sr); }
    if (!any) return '<p class="hint">Nessuna voce trovata.</p>';
    return h + notes([A.legenda]);
  }

  /* ---- metalli e gemme ---- */
  function metSec() {
    var t = T(), M = GD.metalli, res = Ge.filter(M.metalli, t.q);
    var h = res.length ? table([['Metallo', 1], ['Bonus', 0], ['Valore', 0], ['Costo di lavorazione', 0], ['Tempo (ore)', 0], ['Note', 1]], res.map(function (x) {
      return '<tr>' + td(x.r.n, 1) + td(x.r.bonus) + td(x.r.valore) + td(x.r.lav) + td(x.r.tempo) + td(x.r.note, 1) + '</tr>';
    })) : '<p class="hint">Nessun metallo trovato.</p>';
    return h + notes(M.note_metalli) + descr();
  }
  function gemSec() {
    var t = T(), M = GD.metalli, res = Ge.filter(M.gemme, t.q);
    var h = res.length ? table([['Gemma', 1], ['Rarità - Valore', 1], ['Tipo - Colore', 1], ['Proprietà', 1]], res.map(function (x) {
      return '<tr>' + td(x.r.n, 1) + td(x.r.rarita, 1) + td(x.r.tipo, 1) + td(x.r.prop, 1) + '</tr>';
    })) : '<p class="hint">Nessuna gemma trovata.</p>';
    return h + notes(M.note_gemme) + descr();
  }
  function descr() {
    var t = T(), q = (t.q || '').toLowerCase().trim(), M = GD.metalli;
    var rows = M.descr.filter(function (d) { return !q || (d.n + ' ' + d.t).toLowerCase().indexOf(q) >= 0; });
    if (!rows.length) return '';
    return '<details' + (q ? ' open' : '') + '><summary>I metalli e le gemme usati dagli artigiani elfici (' + rows.length + ')</summary>' +
      rows.map(function (d) { return '<p class="pl"><b>' + esc(d.n) + ':</b> ' + esc(d.t) + '</p>'; }).join('') + '</details>';
  }

  /* ---- erbe, veleni, malattie ---- */
  var CATSHORT = { cur: 'Curativa', var: 'Varia', vel: 'Veleno', mal: 'Malattia' };
  function herbSec() {
    var t = T(), res = Ge.herbs(t.q, t.cat, t.cl), shown = res.slice(0, t.lim);
    var h = '<div class="grid g3">' +
      U.field('Tipo', U.sel('data-t', 'gear.cat', t.cat, [['', '(tutti)']].concat(Object.keys(Ge.CAT).map(function (k) { return [k, Ge.CAT[k]]; })), { re: 1, label: 'Tipo' })) +
      U.field('Clima', U.sel('data-t', 'gear.cl', t.cl, [['', '(tutti)']].concat(GD.erbeClimi.map(function (c, i) { return [String(i), c.replace(/^Clima /, '')]; })), { re: 1, label: 'Clima' })) + '</div>';
    h += '<p class="hint">' + res.length + ' erbe, veleni ed effetti trovati. Il tipo è quello dei colori della tabella del compendio: curativa, varia/d\'utilità, veleno, malattia/effetto ambientale. Mod. d\'uso, assuefazione e prezzo: vedi sotto.</p>';
    if (res.length) {
      h += table([['Cod', 0], ['Erba', 1], ['Dif.', 0], ['Parte / uso', 0], ['Costo', 0], ['Effetti', 1], ['AF', 0], ['Lv', 0], ['', 0]], shown.map(function (x) {
        var e = x.r;
        return '<tr><td>' + e.cod + '</td><td class="l"><b>' + esc(e.n) + '</b> <span class="tag" title="' + esc(Ge.CAT[e.cat]) + '">' + CATSHORT[e.cat] + '</span><br><span class="hint">' + esc(GD.erbeClimi[e.cl].replace(/^Clima /, '')) + ' · ' + esc(GD.erbeTerreni[e.te]) + '</span></td>' +
          td(e.dif) + td(e.uso) + td(e.costo) + td(e.eff, 1) + td(e.af) + td(e.lv) + '<td><button class="mini" data-act="gear_herb" data-i="' + x.i + '" aria-label="Aggiungi ' + esc(e.n) + ' all\'erbario">+ Erbario</button></td></tr>';
      })) + more(T(), res.length, shown.length);
    } else h += '<p class="hint">Nessuna erba trovata.</p>';
    h += '<details><summary>Modalità d\'uso, prezzo, effetti, assuefazione</summary>' + GD.erbeUso.map(function (u) { return '<p class="pl"><b>' + esc(u.n) + ':</b> ' + esc(u.t) + '</p>'; }).join('') + '</details>';
    return h;
  }
  function malSec() {
    var t = T(), res = Ge.filter(GD.malattie, t.q);
    if (!res.length) return '<p class="hint">Nessuna malattia trovata.</p>';
    return table([['Cod', 0], ['Malattia', 1], ['Dif.', 0], ['Provenienza', 0], ['Luogo', 0], ['Effetti', 1], ['Lv', 0], ['Clima', 0]], res.map(function (x) {
      var d = x.r;
      return '<tr><td>' + d.cod + '</td>' + td(d.n, 1) + td(d.dif) + td(d.prov) + td(d.luogo) + td(d.eff, 1) + td(d.lv) + td(GD.malattieClimi[d.cl].replace(/^Clima /, '')) + '</tr>';
    })) + '<p class="hint">Le malattie e gli effetti ambientali non si comprano: servono al GM. Codici da 600.</p>';
  }

  function render() {
    var t = T(), sig = [t.sec, t.q, t.cat, t.cl].join('|');
    if (sig !== t.sig) { t.sig = sig; t.lim = 60; }
    var body = PRICE[t.sec] ? priceSec(t.sec) : t.sec === 'arm' ? armSec() : t.sec === 'met' ? metSec() : t.sec === 'gem' ? gemSec() : t.sec === 'erbe' ? herbSec() : malSec();
    return '<section class="card"><h2>Oggetti</h2><p class="hint">Equipaggiamento e prezzi, armature, metalli e gemme, erbe, veleni e malattie del compendio Istaro Quettar. Con «+ Inv.» la voce va nell\'inventario della Scheda, con «Indossa» nelle Protezioni, con «+ Erbario» nell\'erbario. ' +
      'Le monete sono quelle del compendio (MO, MA, MB, MS, MR, MM): i testi non danno qui i rapporti di cambio, quindi l\'app non converte.</p>' +
      '<div class="grid g2">' + U.field('Sezione', U.sel('data-t', 'gear.sec', t.sec, SECS, { re: 1, label: 'Sezione' })) +
      U.field('Cerca', '<input type="search" data-t="gear.q" data-re="1" value="' + esc(t.q) + '" placeholder="es. spada, cotta, athelas, cura">') + '</div>' +
      '<p class="hint">Scrivi e premi Invio per cercare.</p>' + body + '</section>';
  }

  /* ---- azioni ---- */
  function addInv(c, name, note) {
    var hit = null;
    c.inv.forEach(function (x) { if (!hit && x.n === name && /^\d+$/.test(String(x.q))) hit = x; });
    if (hit) hit.q = String(+hit.q + 1); else c.inv.push({ n: name, q: '1', note: note });
  }
  G.acts.gear_inv = function (b) {
    var k = b.dataset.k, P = PRICE[k], r = P && P.rows()[+b.dataset.i], c = S.cur(); if (!r) return;
    var parts = k === 'vitto' ? [r.costo, r.note] : k === 'trasp' ? [r.costo, r.vel, r.cap] : ['Costo ' + r.costo, r.peso && 'Peso ' + r.peso, r.tp && r.tp !== '-' && 'T.P. ' + r.tp, r.note];
    addInv(c, r.n, Ge.invNote(parts)); S.save(); U.toast('«' + r.n + '» aggiunto all\'inventario.');
  };
  G.acts.gear_wear = function (b) {
    var A = GD.armature, kind = b.dataset.kind, i = +b.dataset.i, c = S.cur(), r, sec = null;
    if (kind === 'body') { A.body.forEach(function (s) { if (s.id === b.dataset.sec) sec = s; }); r = sec && sec.rows[i]; } else r = (kind === 'elmo' ? A.elmi : A.scudi)[i];
    if (!r) return;
    var name = Ge.wornName(kind, sec, r), slot = kind === 'body' ? 'armatura' : kind === 'elmo' ? 'elmo' : 'scudo';
    c.prot[slot] = name; S.save(); U.toast('«' + name + '» indossato: lo trovi in Protezioni, nella Scheda.');
  };
  G.acts.gear_herb = function (b) {
    var h = GD.erbe[+b.dataset.i], c = S.cur(); if (!h) return;
    var hit = null; c.erbario.forEach(function (x) { if (!hit && String(x.cod) === String(h.cod) && /^\d+$/.test(String(x.q))) hit = x; });
    if (hit) hit.q = String(+hit.q + 1); else c.erbario.push({ n: h.n, uso: h.uso, cod: String(h.cod), q: '1', note: h.eff });
    S.save(); U.toast('«' + h.n + '» nell\'erbario.');
  };
  G.acts.gear_more = function () { T().lim += 60; G.app.render(); };

  G.pages.gear = { render: render };
})(typeof window !== 'undefined' ? window : globalThis);
