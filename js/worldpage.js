/* Pagina Mondo: esperienza, manovre in movimento e statiche, meteo, incontri, rischio degli incantesimi, tesori, prezzi magici,
   animali e mostri, Mutaforma. Dati dal compendio (js/worlddata.js); logica in js/world.js. */
(function (root) {
  'use strict';
  var G = root.GIRSA = root.GIRSA || {};
  var R = G.rules, U = G.ui, S = G.store, Wd = G.worlddata, Wr = G.world, dice = G.dice.dice, esc = U.esc;
  G.acts = G.acts || {};

  var SECS = [['xp', 'Punti Esperienza (TE)'], ['mov', 'Manovre in movimento (TM-1)'], ['stat', 'Manovre statiche (TM-2)'], ['meteo', 'Meteo (TS-8)'], ['inc', 'Incontri (TS-10)'],
    ['ris', 'Rischio incantesimi (TS-12)'], ['tes', 'Tesori (TS-6)'], ['mag', 'Prezzi oggetti magici (TS-7)'], ['anim', 'Animali e mostri (TS-2)'], ['muta', 'Mutaforma']];

  function T() {
    var t = U.tmp.world;
    if (!t) {
      t = U.tmp.world = { sec: 'xp', q: '', grp: '',
        xp: { kind: 'kill', en: '', pc: '', size: 'N', done: '', mult: '1', cm: '1', A: '', B: '', C: '', D: '', E: '', lvdiff: '0', sit: '1', pf: '', diff: '0', km: '', zone: '1', risen: '' },
        mov: { diff: '2', bonus: '', roll: '', stord: false, terra: false, arto: false, res: null },
        stat: { col: '0', diff: '0', bonus: '', extra: '', roll: '', res: null },
        meteo: { mese: '0', pc: '2', tc: '2', res: null },
        inc: { dens: '1', ter: '', abit: '', xa: '', dim: '', modo: '', gen: '', xe: '', ra: '', re: '', res: null },
        ris: { tipo: '6', per: '2', area: '1', r1: '', r2: '', x2: '', res: null },
        tes: { w: '2', res: null } };
    }
    return t;
  }
  function num(v) { return v === '' || v == null || isNaN(+v) ? 0 : +v; }
  function sg(n) { return (n > 0 ? '+' : n < 0 ? '−' : '') + Math.abs(n); }
  function meseName(x) { return (x.match(/\(/g) || []).length > (x.match(/\)/g) || []).length ? x + ')' : x; }
  function opts(arr, fn) { return arr.map(function (x, i) { return [String(i), fn ? fn(x, i) : x]; }); }

  function table(head, rows) {
    return '<div class="scroll"><table class="sk"><thead><tr>' + head.map(function (h) { return '<th' + (h[1] ? ' class="l"' : '') + '>' + esc(h[0]) + '</th>'; }).join('') + '</tr></thead><tbody>' + rows.join('') + '</tbody></table></div>';
  }
  function td(v, l) { return '<td' + (l ? ' class="l"' : '') + '>' + esc(v) + '</td>'; }
  function notes(arr) { return arr.map(function (n) { return '<p class="hint">' + esc(n) + '</p>'; }).join(''); }
  function paras(arr) { return arr.map(function (n) { return '<p class="pl">' + esc(n) + '</p>'; }).join(''); }
  /* Campo numerico; con re='xp' il risultato del calcolatore si aggiorna mentre scrivi, senza ridisegnare la pagina (così il campo non perde il fuoco). */
  function fld(label, path, val, o, re) {
    o = o || { type: 'number' };
    var html = U.inp('data-t', path, val, o);
    if (re) html = html.replace('<input ', '<input data-w="' + re + '" ');
    return U.field(label, html);
  }
  function selF(label, path, val, list) { return U.field(label, U.sel('data-t', path, val, list, { re: 1, label: label })); }
  function det(title, body, open) { return '<details' + (open ? ' open' : '') + '><summary>' + esc(title) + '</summary>' + body + '</details>'; }
  function openRoll() { return dice.open(S.get().settings.dice); }
  function out(html) { return '<div class="pl res">' + html + '</div>'; }

  /* ================= Esperienza ================= */
  function xpCompute() {
    var t = T(), x = t.xp, c = S.cur(), X = Wd.xp, pc = x.pc !== '' ? num(x.pc) : (c.livello !== '' ? num(c.livello) : 1);
    var mult = [['1', 'Normale (x1)'], ['5', 'Prima volta (x5)'], ['2', 'Seconda volta (x2)'], ['0.5', 'Routine (x0,5)']];
    var kinds = [['kill', 'Nemico sconfitto (TE-1)'], ['critinf', 'Colpi critici inflitti (TE-3)'], ['critsub', 'Colpi critici subiti (TE-3)'], ['pf', 'Punti Ferita subiti'], ['morte', 'Ferita mortale (Punti Morte)'],
      ['spell', 'Incantesimo lanciato (TE-2)'], ['man', 'Manovra riuscita (TE-4)'], ['via', 'Viaggio (TE-6)']];
    var f = '', base = 0, expl = '';
    var crits = function () { return fld('Critici A', 'world.xp.A', x.A, null, 'xp') + fld('Critici B', 'world.xp.B', x.B, null, 'xp') + fld('Critici C', 'world.xp.C', x.C, null, 'xp') + fld('Critici D', 'world.xp.D', x.D, null, 'xp') + fld('Critici E', 'world.xp.E', x.E, null, 'xp'); };
    var cnt = { A: x.A, B: x.B, C: x.C, D: x.D, E: x.E };
    var size = selF('Dimensioni del nemico', 'world.xp.size', x.size, [['N', 'Normale'], ['G', 'Grande (x1,5)'], ['E', 'Enorme (x3)']]);
    var cm = selF('Moltiplicatore dei critici', 'world.xp.cm', x.cm, [['1', 'x1'], ['0', 'Nemico morente (x0)'], ['0.5', 'Stordito (x0,5)'], ['0.1', 'Svenuto o incapacitato (x0,1)'], ['2', 'Da solo contro più nemici (x2)']]);
    if (x.kind === 'kill') {
      base = Wr.peKill(num(x.en), pc, x.size); var done = Math.min(base, num(x.done)); base -= done;
      f = fld('Livello del nemico', 'world.xp.en', x.en, null, 'xp') + fld('Livello del personaggio (colpo decisivo)', 'world.xp.pc', x.pc, { type: 'number', ph: String(pc) }, 'xp') + size + fld('PE già dati per i suoi critici', 'world.xp.done', x.done, null, 'xp');
      expl = 'PU di TE-1 ' + Wr.peKill(num(x.en), pc, x.size) + (done ? ' − ' + done + ' già assegnati' : '');
    } else if (x.kind === 'critinf') {
      var cap = Wr.peKill(num(x.en), pc, x.size), raw = Wr.peCritInflitti(cnt, num(x.en)) * num(x.cm);
      base = Math.min(raw, cap);
      f = fld('Livello del nemico', 'world.xp.en', x.en, null, 'xp') + fld('Livello del personaggio', 'world.xp.pc', x.pc, { type: 'number', ph: String(pc) }, 'xp') + size + cm + crits();
      expl = 'Critici ' + raw + ' (tetto: PU del nemico ' + cap + ')';
    } else if (x.kind === 'critsub') {
      base = Wr.peCritSubiti(cnt) * num(x.cm); f = cm + crits(); expl = '100/200/300/400/500 per A/B/C/D/E';
    } else if (x.kind === 'pf') {
      base = Math.max(0, num(x.pf)); f = fld('PF subiti nel combattimento', 'world.xp.pf', x.pf, null, 'xp'); expl = '1 PE per PF subito';
    } else if (x.kind === 'morte') {
      base = Wr.peKillBase(pc, 1) * (x.risen ? 2 : 1);
      f = fld('Livello del personaggio', 'world.xp.pc', x.pc, { type: 'number', ph: String(pc) }, 'xp') + '<label class="chk"><input type="checkbox" data-t="world.xp.risen" data-re="1"' + (x.risen ? ' checked' : '') + '> Poi riportato in vita (x2)</label>';
      expl = 'Come un personaggio di livello 1 che uccide un nemico del livello ' + pc + (x.risen ? ', raddoppiato' : '');
    } else if (x.kind === 'spell') {
      base = Wr.peSpell(num(x.lvdiff));
      f = fld('Livello del personaggio − livello dell\'incantesimo', 'world.xp.lvdiff', x.lvdiff, { type: 'number', ph: '0 = stesso livello' }, 'xp') +
        selF('Situazione', 'world.xp.sit', x.sit, [['0.5', 'In assenza di pericolo (x0,5)'], ['1', 'In combattimento (x1)'], ['2', 'In estremo pericolo (x2)'], ['3', 'In estremo pericolo (x3)'], ['5', 'Nemico sconfitto con l\'incantesimo (x5)']]);
      base = base * num(x.sit); expl = 'TE-2: ' + Wr.peSpell(num(x.lvdiff)) + ' x ' + x.sit + ' (il compendio dà «x2/x3» per l\'estremo pericolo: scegli tu)';
    } else if (x.kind === 'man') {
      base = Wd.xp.te4[num(x.diff)][1]; f = selF('Difficoltà della manovra', 'world.xp.diff', x.diff, opts(Wd.xp.te4, function (r) { return r[0] + ' (' + r[1] + ')'; })); expl = 'TE-4';
    } else {
      base = num(x.km) / 2 * num(x.zone); f = fld('Chilometri percorsi (a piedi o a cavallo)', 'world.xp.km', x.km, null, 'xp') +
        selF('Zona', 'world.xp.zone', x.zone, [['0.5', 'Civilizzata (x0,5)'], ['1', 'Normale (x1)'], ['2', 'Pericolosa (x2)'], ['3', 'Molto pericolosa (x3)']]);
      expl = '1 PE ogni 2 km (per volo o mare: 1 PE ogni 20 km, dividi i km per 10)';
    }
    return { f: f, tot: Math.round(base * num(x.mult)), expl: expl, mult: x.mult, kinds: kinds, multList: mult, c: c };
  }
  function xpResult(r) {
    return '<b>' + r.tot + ' PE</b> <span class="hint">' + esc(r.expl) + ' · moltiplicatore TE-0 x' + esc(String(r.mult)) + ' · arrotondato</span>';
  }
  function xpCalc() {
    var x = T().xp, r = xpCompute();
    return '<h3>Calcolatore</h3><div class="grid g2">' + selF('Che cosa dà PE', 'world.xp.kind', x.kind, r.kinds) + selF('Familiarità (TE-0)', 'world.xp.mult', x.mult, r.multList) + '</div>' +
      '<div class="grid g3">' + r.f + '</div><div class="pl res" id="xpres">' + xpResult(r) + '</div>' +
      '<p><button data-act="world_xp" id="xpadd">Aggiungi ' + r.tot + ' PE a ' + esc(r.c.name || 'questo personaggio') + '</button></p>' +
      '<p class="hint">Il calcolatore applica le tabelle una voce alla volta; sommare i PE di un combattimento e decidere i casi dubbi spetta al GM. Livello e PE correnti sono nella Scheda.</p>';
  }
  function xpSec() {
    var X = Wd.xp, h = xpCalc();
    h += det('TE-0 · Moltiplicatore', paras(X.te0t) + table([['Frequenza', 1], ['Moltiplicatore', 0]], X.te0.map(function (r) { return '<tr>' + td(r[0], 1) + td(r[1]) + '</tr>'; })));
    var hd = [['Liv. nemico', 1]]; for (var i = 1; i <= 10; i++) hd.push([String(i), 0]); hd.push(['11+', 0]);
    h += det('TE-1 · Punti Uccisione', paras(X.te1t) + '<p class="hint">Colonne: livello del personaggio che infligge il colpo decisivo.</p>' +
      table(hd, X.te1.map(function (r, i) { return '<tr>' + td(i, 1) + r.map(function (v) { return td(v); }).join('') + '</tr>'; })) + notes(X.te1n) +
      '<p class="hint">Nella colonna 11+ i livelli 8, 9 e 10 riportano 130, 150 e 200 come nel PDF (lo schema degli altri valori darebbe 110, 130, 150): la riga 11+ del compendio vale comunque con la formula della nota *.</p>');
    h += det('TE-2 · Punti Incantesimo', paras(X.te2t) + table([['Livello Incantesimo', 1], ['PE', 0]], X.te2.map(function (r) { return '<tr>' + td(r[0], 1) + td(r[1]) + '</tr>'; })) +
      '<h3>Moltiplicatori</h3>' + table([['Situazione', 1], ['', 0]], X.te2m.map(function (r) { return '<tr>' + td(r[0], 1) + td(r[1]) + '</tr>'; })));
    h += det('TE-3 · Punti Colpi Critici, Punti Ferita, Punti Morte', paras(X.te3t) + table([['Critico', 1], ['Inflitti', 1], ['Subiti', 0]], X.te3.map(function (r) { return '<tr>' + td(r[0], 1) + td(r[1], 1) + td(r[2]) + '</tr>'; })) + notes(X.te3n) +
      '<h3>Moltiplicatori</h3>' + table([['Situazione', 1], ['', 0]], X.te3m.map(function (r) { return '<tr>' + td(r[0], 1) + td(r[1]) + '</tr>'; })) +
      '<h3>Punti Ferita</h3><p class="pl">' + esc(X.pf) + '</p><h3>Punti Morte</h3>' + paras(X.morte));
    h += det('TE-4 · Manovre', '<p class="pl">' + esc(X.te4t) + '</p>' + table([['Difficoltà', 1], ['PE', 0]], X.te4.map(function (r) { return '<tr>' + td(r[0], 1) + td(r[1]) + '</tr>'; })));
    h += det('TE-6 · Punti Viaggio', table([['Viaggio', 1], ['PE', 0]], X.te6.map(function (r) { return '<tr>' + td(r[0], 1) + td(r[1]) + '</tr>'; })) +
      '<h3>Moltiplicatori</h3>' + table([['Zona', 1], ['', 0]], X.te6m.map(function (r) { return '<tr>' + td(r[0], 1) + td(r[1]) + '</tr>'; })));
    h += det('TE-7 · Punti Vari', '<p class="pl">' + esc(X.te7t) + '</p>' + table([['Voce', 1], ['PE', 0]], X.te7.map(function (r) { return '<tr><td class="l"><b>' + esc(r[0]) + '</b><br>' + esc(r[1]) + '</td>' + td(r[2]) + '</tr>'; })));
    h += det('Punti Esperienza Semplificati', '<p class="pl">' + esc(X.semplt) + '</p>' + table([['Voce', 1], ['PE', 0]], X.sempl.map(function (r) { return '<tr>' + td(r[0], 1) + td(r[1]) + '</tr>'; })));
    h += '<p class="hint">La tabella TE-5 (PE necessari per livello) è già nell\'app: la usa il campo Livello della Scheda.</p>';
    return h;
  }

  /* ================= Manovre in movimento ================= */
  function movSec() {
    var t = T(), m = t.mov, M = Wd.mov, h = paras(M.intro);
    h += '<h3>Tira una manovra</h3><div class="grid g3">' + selF('Difficoltà', 'world.mov.diff', m.diff, opts(M.diff)) + fld('Bonus di Movimento e Manovra (o dell\'abilità)', 'world.mov.bonus', m.bonus) +
      fld('Tiro (vuoto = tira l\'app)', 'world.mov.roll', m.roll) + '</div>' +
      '<p><label class="chk"><input type="checkbox" data-t="world.mov.stord" data-re="1"' + (m.stord ? ' checked' : '') + '> Stordito (−50)</label> ' +
      '<label class="chk"><input type="checkbox" data-t="world.mov.terra" data-re="1"' + (m.terra ? ' checked' : '') + '> A terra (−70)</label> ' +
      '<label class="chk"><input type="checkbox" data-t="world.mov.arto" data-re="1"' + (m.arto ? ' checked' : '') + '> Arto fuori uso (−30)</label></p>' +
      '<p><button data-act="world_mov">Tira (d100 aperto)</button></p>';
    if (m.res) {
      var r = m.res, c = r.cell;
      h += out('Tiro ' + r.roll + ' ' + sg(r.bonus) + ' = <b>' + r.total + '</b> · riga ' + esc(r.label) + ' · difficoltà ' + esc(M.diff[r.diff]) + ': <b>' + esc(c.text) + '</b><br>' +
        (c.fail ? 'F = Fallimento: la tabella «Fallimento Manovre in Movimento» non è tra i PDF forniti.' : esc(c.pct + '% della manovra' + (c.pct > 100 ? ' (riuscita, resta il ' + (c.pct - 100) + '% di attività nel round)' : c.pct < 100 ? ' (riduzione del ' + (100 - c.pct) + '% nel prossimo round, a discrezione del GM)' : ' (riuscita)') + (c.m ? ' · variazione dello spostamento ' + sg(c.m) + ' m' : ''))));
    }
    h += '<h3>Tabella</h3>' + table([['Tiro aperto', 1]].concat(M.diff.map(function (d) { return [d, 0]; })), M.righe.map(function (r, i) {
      return '<tr' + (m.res && m.res.row === i ? ' class="hit"' : '') + '>' + td(r[0], 1) + r[1].map(function (c) { return td(c); }).join('') + '</tr>';
    }));
    h += '<h3>Risultati e modifiche</h3>' + paras(M.ris) + '<p class="pl"><b>Modifiche:</b> ' + esc(M.mod.join(' ')) + '</p>';
    h += '<h3>Passo</h3>' + table([['Passo', 1], ['Distanza percorsa', 0], ['Difficoltà manovra*', 0], ['Durata**', 0]], M.passo.map(function (r) { return '<tr>' + td(r[0], 1) + td(r[1]) + td(r[2]) + td(r[3]) + '</tr>'; })) + notes(M.passoNote);
    return h;
  }
  G.acts.world_mov = function () {
    var m = T().mov, M = Wd.mov, roll = m.roll !== '' ? num(m.roll) : openRoll().total, bonus = num(m.bonus) + (m.stord ? -50 : 0) + (m.terra ? -70 : 0) + (m.arto ? -30 : 0);
    var total = roll + bonus, d = +m.diff, L = Wr.movLookup(total, d);
    m.res = { roll: roll, bonus: bonus, total: total, diff: d, row: L.row, label: L.label, cell: L.cell };
    U.showRoll('Manovra in movimento (' + M.diff[d] + ')', roll + ' ' + sg(bonus) + ' = ' + total, L.cell.text); G.app.render();
  };

  /* ================= Manovre statiche ================= */
  function statSec() {
    var t = T(), s = t.stat, St = Wd.statiche, h = '';
    h += '<h3>Tira una manovra</h3><div class="grid g3">' + selF('Colonna', 'world.stat.col', s.col, opts(St.cols, function (c) { return c.join(' / '); })) +
      selF('Difficoltà', 'world.stat.diff', s.diff, St.difficolta.map(function (d) { return [d[0], d[1] + ' (' + d[0] + ')']; })) +
      fld('Bonus dell\'abilità', 'world.stat.bonus', s.bonus) + fld('Altre modifiche', 'world.stat.extra', s.extra) + fld('Tiro (vuoto = tira l\'app)', 'world.stat.roll', s.roll) + '</div>' +
      '<p><button data-act="world_stat">Tira (d100 aperto)</button></p>';
    if (s.res) {
      var r = s.res, row = St.righe[r.row];
      h += out('Tiro ' + r.roll + ' ' + sg(r.mod) + ' = <b>' + r.total + '</b> → <b>' + esc(row.n) + '</b> (' + esc(row.r) + ')<br>' + esc(row.c[+s.col]));
    }
    h += '<p class="hint">Le modifiche di difficoltà e di colonna sono elencate in fondo. Il bonus dell\'abilità e il tiro li metti tu o li dà l\'app; il compendio non definisce l\'ordine di somma oltre a «tiro + bonus + difficoltà».</p>';
    h += '<h3>Risultati</h3>';
    St.righe.forEach(function (row, i) {
      h += '<details' + (s.res && s.res.row === i ? ' open' : '') + '><summary>' + esc(row.n) + ' · ' + esc(row.r) + '</summary>' +
        row.c.map(function (txt, k) { return '<p class="pl"><b>' + esc(St.cols[k][0]) + ':</b> ' + esc(txt) + '</p>'; }).join('') + '</details>';
    });
    h += '<h3>Difficoltà (*)</h3>' + table([['Modifica', 0], ['Difficoltà', 1]], St.difficolta.map(function (d) { return '<tr>' + td(d[0]) + td(d[1], 1) + '</tr>'; }));
    h += '<h3>Modifiche per colonna</h3>' + St.modifiche.map(function (arr, k) { return '<p class="pl"><b>' + esc(St.cols[k + 1].join(' / ')) + '</b></p>' + notes(arr); }).join('');
    h += '<p class="hint">Colonna «Generale»: vale per tutte le manovre statiche non comprese nelle altre colonne.</p>';
    return h;
  }
  G.acts.world_stat = function () {
    var s = T().stat, roll = s.roll !== '' ? num(s.roll) : openRoll().total, mod = num(s.bonus) + num(s.diff) + num(s.extra), total = roll + mod, L = Wr.statLookup(total);
    s.res = { roll: roll, mod: mod, total: total, row: L.row };
    U.showRoll('Manovra statica', roll + ' ' + sg(mod) + ' = ' + total, L.r.n); G.app.render();
  };

  /* ================= Meteo ================= */
  function meteoSec() {
    var t = T(), m = t.meteo, Me = Wd.meteo, h = '';
    h += '<div class="grid g3">' + selF('Mese', 'world.meteo.mese', m.mese, opts(Me.mesi, meseName)) +
      selF('Clima (precipitazioni)', 'world.meteo.pc', m.pc, opts(Me.pclimi)) + selF('Clima (temperature)', 'world.meteo.tc', m.tc, opts(Me.tclimi)) + '</div>';
    var p = Wr.precParse(Me.prec[+m.mese][+m.pc]), tp = Wr.tempParse(Me.temp[+m.mese][+m.tc]);
    h += out('Precipitazioni: <b>' + (p.mm == null ? 'nessuna quantità' : p.mm + ' mm') + '</b>, probabilità <b>' + p.pr + '%</b>' + (p.star ? ' (*: 50% di rugiada o nebbia, nessuna ulteriore precipitazione)' : '') +
      '<br>Temperature: minima <b>' + tp.min + ' °C</b>, massima <b>' + tp.max + ' °C</b>' + (Me.temp[+m.mese][+m.tc] === '42/-12' ? ' (stampato «42/-12» nel PDF: probabile «-42»)' : ''));
    h += '<p><button data-act="world_meteo">Tira la precipitazione</button></p>';
    if (m.res) h += out(esc(m.res));
    h += '<p class="hint">Il compendio dà la probabilità ma non dice come tirarla: l\'app tira 1d100 e dichiara precipitazione se il tiro è ≤ della probabilità (interpretazione dell\'app).</p>';
    h += det('TS-8 · Precipitazioni standard', table([['Mese', 1]].concat(Me.pclimi.map(function (c) { return [c, 0]; })), meseRows(Me, Me.prec)) + notes(Me.precNote));
    h += det('TS-8.2 · Temperature standard (minima/massima, °C)', table([['Mese', 1]].concat(Me.tclimi.map(function (c) { return [c, 0]; })), meseRows(Me, Me.temp)));
    return h;
  }
  function meseRows(Me, data) {
    var rows = [], G_ = Me.giorni;
    rows.push('<tr><td class="l" colspan="' + (data[0].length + 1) + '"><i>' + esc(G_.prima) + '</i></td></tr>');
    data.forEach(function (r, i) {
      rows.push('<tr>' + td(Me.mesi[i], 1) + r.map(function (c) { return td(c); }).join('') + '</tr>');
      if (i === 5) rows.push('<tr><td class="l" colspan="' + (r.length + 1) + '"><i>' + esc(G_.meta) + '</i></td></tr>');
    });
    rows.push('<tr><td class="l" colspan="' + (data[0].length + 1) + '"><i>' + esc(G_.fine) + '</i></td></tr>');
    return rows;
  }
  G.acts.world_meteo = function () {
    var m = T().meteo, Me = Wd.meteo, p = Wr.precParse(Me.prec[+m.mese][+m.pc]), r = dice.d(100);
    m.res = 'Tiro ' + r + ' contro ' + p.pr + '%: ' + (r <= p.pr ? 'precipitazione' + (p.mm != null ? ' (' + p.mm + ' mm)' : (p.star ? ' (rugiada o nebbia, 50%: tira ancora)' : '')) : 'asciutto') + '.';
    U.showRoll('Precipitazione', r + ' ≤ ' + p.pr + '%?', r <= p.pr ? 'sì' : 'no'); G.app.render();
  };

  /* ================= Incontri ================= */
  function incList(groups, path, cur) {
    var list = [['', '(nessuna)']];
    groups.forEach(function (g) { g[1].forEach(function (r) { if (Wr.modNum(r[0]) != null) list.push([g[0].split(' (')[0] + '|' + r[0] + '|' + r[1], r[0] + ' ' + r[1]]); }); });
    return list;
  }
  function incVal(v) { var p = String(v || '').split('|'); return p.length === 3 ? Wr.modNum(p[1]) : 0; }
  function incSec() {
    var t = T(), s = t.inc, I = Wd.incontri, h = '';
    h += '<h3>Tira un incontro</h3><div class="grid g2">' + selF('Densità della popolazione', 'world.inc.dens', s.dens, opts(I.dens)) + '</div>' +
      '<h4>Tiro Attività (GM)</h4><div class="grid g2">' + selF('Terreno', 'world.inc.ter', s.ter, incList([I.att[0]])) + selF('Attività degli abitanti', 'world.inc.abit', s.abit, incList([I.att[1]])) +
      fld('Altre modifiche (notte, individuazione…)', 'world.inc.xa', s.xa) + fld('Tiro Attività (vuoto = tira l\'app)', 'world.inc.ra', s.ra) + '</div>' +
      '<h4>Tiro Evasione (gruppo)</h4><div class="grid g2">' + selF('Dimensioni del gruppo', 'world.inc.dim', s.dim, incList([I.eva[0]])) + selF('Modo di viaggio', 'world.inc.modo', s.modo, incList([I.eva[1]])) +
      selF('In generale', 'world.inc.gen', s.gen, incList([I.eva[2]])) + fld('Altre modifiche (incantesimi, volo, barca…)', 'world.inc.xe', s.xe) + fld('Tiro Evasione (vuoto = tira l\'app)', 'world.inc.re', s.re) + '</div>' +
      '<p><button data-act="world_inc">Tira l\'incontro</button></p>';
    if (s.res) {
      var r = s.res, tx = Wr.incText(r.code);
      h += out('Attività ' + r.ra + ' ' + sg(r.ma) + ' = ' + (r.ra + r.ma) + ' · Evasione ' + r.re + ' ' + sg(r.me) + ' = ' + (r.re + r.me) + '<br>Tiro d\'Incontro = <b>' + r.total + '</b> (riga ' + esc(r.label) + ', densità ' + esc(I.dens[r.dens]) + '): <b>' + esc(r.code) + '</b><br>' +
        'Esseri senzienti: ' + esc(tx.senzienti) + '<br>Animali selvaggi: ' + esc(tx.animali));
    }
    h += '<p class="hint">Il compendio non dice come si tira l\'Attività e l\'Evasione: l\'app usa d100 aperto per entrambi; le modifiche con intervallo («vario», «−25/−50») vanno nelle «altre modifiche».</p>';
    h += det('TS-10 · Tabella', table([['Tiro d\'Incontro', 1]].concat(I.dens.map(function (d) { return [d, 0]; })), I.righe.map(function (r, i) {
      return '<tr' + (s.res && s.res.row === i ? ' class="hit"' : '') + '>' + td(r[0], 1) + r[1].map(function (c) { return td(c); }).join('') + '</tr>';
    })) + notes(I.note) + '<p class="hint">Codici: ' + esc(I.cod.map(function (c) { return c[0] + ' = ' + c[1]; }).join('; ')) + '</p>');
    var mods = function (title, groups) { return '<h3>' + esc(title) + '</h3>' + groups.map(function (g) { return '<h4>' + esc(g[0]) + '</h4>' + table([['', 0], ['', 1]], g[1].map(function (r) { return '<tr>' + td(r[0]) + td(r[1], 1) + '</tr>'; })); }).join(''); };
    h += det('Modificatori al Tiro Attività', mods('Tiro Attività', I.att) + notes([I.attNota]));
    h += det('Modificatori al Tiro Evasione', mods('Tiro Evasione', I.eva));
    return h;
  }
  G.acts.world_inc = function () {
    var s = T().inc, I = Wd.incontri;
    var ma = incVal(s.ter) + incVal(s.abit) + num(s.xa), me = incVal(s.dim) + incVal(s.modo) + incVal(s.gen) + num(s.xe);
    var ra = s.ra !== '' ? num(s.ra) : openRoll().total, re = s.re !== '' ? num(s.re) : openRoll().total;
    var total = ra + ma - (re + me), L = Wr.incLookup(total, +s.dens);
    s.res = { ra: ra, ma: ma, re: re, me: me, total: total, row: L.row, label: L.label, code: L.code, dens: +s.dens };
    U.showRoll('Incontro (' + I.dens[+s.dens] + ')', 'Attività ' + (ra + ma) + ' − Evasione ' + (re + me) + ' = ' + total, L.code); G.app.render();
  };

  /* ================= Rischio incantesimi ================= */
  function risSec() {
    var t = T(), s = t.ris, Rk = Wd.rischio, h = paras([Rk.intro[0]]) + '<p class="pl"><b>' + esc(Rk.intro[1]) + '</b></p>' + paras([Rk.intro[2]]);
    h += '<h3>Tira il rischio</h3><div class="grid g3">' + selF('Tipo di incantesimo', 'world.ris.tipo', s.tipo, opts(Rk.fatt, function (f) { return f[0] + ' (' + sg(f[1]) + ')'; })) +
      selF('Periodo', 'world.ris.per', s.per, opts(Rk.per, function (f) { return f[0] + ' (' + sg(f[1]) + ')'; })) + selF('Tipo di area', 'world.ris.area', s.area, opts(Rk.aree, function (a) { return a.replace('/ ', '/'); })) +
      fld('Primo tiro (vuoto = tira l\'app)', 'world.ris.r1', s.r1) + fld('Secondo tiro (vuoto = tira l\'app)', 'world.ris.r2', s.r2) + fld('Modifica al secondo tiro (a discrezione del GM)', 'world.ris.x2', s.x2) + '</div>' +
      '<p><button data-act="world_ris">Tira</button></p>';
    if (s.res) {
      var r = s.res;
      h += out('Rischio = ' + r.r1 + ' ' + sg(r.fa) + ' ' + sg(r.pe) + ' = <b>' + r.risk + '</b>' + (r.risk < 100 ? ' → minore di 100: non accade nulla.' :
        '<br>Secondo tiro ' + r.r2 + ' ' + sg(r.x2) + ' = ' + (r.r2 + r.x2) + ' (riga ' + esc(r.label) + ', ' + esc(Rk.aree[r.area].replace('/ ', '/')) + '): <b>' + esc(r.res) + '</b><br>' + esc((Rk.ris.filter(function (x) { return x[0] === r.res; })[0] || ['', 'Non accade nulla.'])[1])));
    }
    h += det('TS-12 · Tabella', table([['Tiro', 1]].concat(Rk.aree.map(function (a) { return [a.replace('/ ', '/'), 0]; })), Rk.righe.map(function (r, i) {
      return '<tr' + (s.res && s.res.row === i ? ' class="hit"' : '') + '>' + td(r[0], 1) + r[1].map(function (c) { return td(c); }).join('') + '</tr>';
    })));
    h += det('Fattore di rischio e modificatore del periodo', table([['Tipo di incantesimo', 1], ['Fattore', 0]], Rk.fatt.map(function (r) { return '<tr>' + td(r[0], 1) + td(sg(r[1])) + '</tr>'; })) +
      table([['Attività delle Forze Oscure', 1], ['Modificatore', 0]], Rk.per.map(function (r) { return '<tr>' + td(r[0], 1) + td(sg(r[1])) + '</tr>'; })));
    h += det('Tipi di area (Terza Era)', Rk.tipi.map(function (r) { return '<p class="pl"><b>' + esc(r[0]) + ':</b> ' + esc(r[1]) + '</p>'; }).join(''));
    h += det('Risultati', Rk.ris.map(function (r) { return '<p class="pl"><b>' + esc(r[0]) + ':</b> ' + esc(r[1]) + '</p>'; }).join(''));
    return h;
  }
  G.acts.world_ris = function () {
    var s = T().ris, Rk = Wd.rischio, r1 = s.r1 !== '' ? num(s.r1) : openRoll().total, fa = Rk.fatt[+s.tipo][1], pe = Rk.per[+s.per][1], risk = r1 + fa + pe;
    var res = { r1: r1, fa: fa, pe: pe, risk: risk, area: +s.area, r2: 0, x2: num(s.x2), label: '', res: '', row: -1 };
    if (risk >= 100) {
      res.r2 = s.r2 !== '' ? num(s.r2) : openRoll().total;
      var L = Wr.rischioLookup(res.r2 + res.x2, +s.area); res.label = L.label; res.res = L.res; res.row = L.row;
    }
    s.res = res; U.showRoll('Rischio incantesimo', 'rischio ' + risk, risk >= 100 ? res.res : 'niente'); G.app.render();
  };

  /* ================= Tesori ================= */
  function itemText(it) {
    var p = it.p;
    if (p && p.kind === 'coin') return Wr.fmtNum(p.n) + ' ' + p.code + ' (≈ ' + Wr.fmtNum(p.ms / 10000) + ' MO)';
    if (p) return (p.kind === 'gem' ? 'Gemme' : 'Gioielli') + ', valore ≈ ' + Wr.fmtNum(p.mo) + ' MO';
    return it.cell;
  }
  function magText(it) {
    var c = it.cell, T_ = Wd.tesori;
    var name = c === 'N' ? 'Oggetto normale, non magico' : /^L/.test(c) ? 'Oggetto leggero: pesa ' + c.replace(/^L \(|\)$/g, '') + ' del normale' : /^B/.test(c) ? 'Oggetto con bonus ' + c.replace(/^B \(|\)$/g, '') :
      c === 'J' ? 'Oggetto con incantesimo' : /^A/.test(c) ? 'Addizionatore d\'incantesimi ' + c.slice(2) : /^M/.test(c) ? 'Moltiplicatore d\'incantesimi ' + c.slice(2) : c === 'Speciale' ? 'Speciale: lo sceglie il GM' : 'Artefatto: può esserci un artefatto';
    if (it.ogg) name += ' → ' + it.ogg.oggetto + ', cariche ' + it.ogg.cariche + ', livello dell\'incantesimo ' + it.ogg.livello + ' (tiri sui livelli e sulle cariche: vedi note)';
    return name;
  }
  function tesSec() {
    var t = T(), s = t.tes, Te = Wd.tesori, h = '<p class="pl">' + esc(Te.intro.join(' ')) + '</p>';
    h += '<div class="grid g2">' + selF('Ricchezza relativa', 'world.tes.w', s.w, opts(Te.ricchezze)) + '</div><p><button data-act="world_tes">Genera il tesoro</button></p>';
    if (s.res) {
      var r = s.res;
      h += '<h3>Denaro, gemme, gioielli</h3>' + out('Entità: tiro ' + r.money.roll + ' → <b>' + r.money.n + '</b> tiri di composizione' + r.money.items.map(function (it) { return '<br>' + it.roll + ': <b>' + esc(it.cell) + '</b> · ' + esc(itemText(it)); }).join('') +
        '<br><b>Totale ≈ ' + Wr.fmtNum(r.totalMS / 10000) + ' MO</b> <span class="hint">(' + Wr.fmtNum(r.totalMS) + ' MS)</span>');
      h += '<h3>Oggetti magici</h3>' + out('Entità: tiro ' + r.magic.roll + ' → <b>' + r.magic.n + '</b> tiri di composizione' + (r.magic.n ? r.magic.items.map(function (it) { return '<br>' + it.roll + ': <b>' + esc(it.cell) + '</b> · ' + esc(magText(it)); }).join('') : '<br>Nessun oggetto magico.'));
      h += '<p><button data-act="world_tes_inv">Metti tutto nell\'inventario</button></p>';
    }
    h += '<p class="hint">Tiri con d100 (00 = 100). Dove nel compendio «11/22» e «21/30» si sovrappongono (oggetti magici) vale la prima riga. Livello degli incantesimi e cariche rimanenti restano da tirare come dice la nota del compendio.</p>';
    var rich = Te.ricchezze.map(function (x) { return [x, 0]; });
    h += det('TS-6 · Entità del tesoro', table([['Tiro', 1], ['N° di tiri per la composizione', 0]], Te.entD.map(function (r) { return '<tr>' + td(r[0], 1) + td(r[1]) + '</tr>'; })) +
      '<h4>Oggetti magici</h4>' + table([['Tiro', 1]].concat(rich), Te.entM.map(function (r) { return '<tr>' + td(r[0], 1) + r[1].map(function (c) { return td(c); }).join('') + '</tr>'; })));
    h += det('TS-6 · Composizione: denaro, gemme, gioielli', table([['Tiro', 1]].concat(rich), Te.compD.map(function (r) { return '<tr>' + td(r[0], 1) + r[1].map(function (c) { return td(c); }).join('') + '</tr>'; })) + notes(Te.noteD));
    h += det('TS-6 · Composizione: oggetti magici', table([['Tiro', 1]].concat(rich), Te.compM.map(function (r) { return '<tr>' + td(r[0], 1) + r[1].map(function (c) { return td(c); }).join('') + '</tr>'; })) + notes(Te.noteM));
    h += det('TS-6 · Determinazione dell\'oggetto contenente incantesimi', table([['Tiro', 1], ['Oggetto', 1], ['Cariche', 0], ['Livello dell\'incantesimo**', 0]], Te.ogg.map(function (r) { return '<tr>' + td(r[0], 1) + td(r[1], 1) + td(r[2]) + td(r[3]) + '</tr>'; })) + notes(Te.oggNote));
    return h;
  }
  G.acts.world_tes = function () { var s = T().tes; s.res = Wr.treasure(dice, +s.w); G.app.render(); };
  G.acts.world_tes_inv = function () {
    var r = T().tes.res, c = S.cur(); if (!r) return;
    var add = function (n, note) { c.inv.push({ n: n, q: '1', note: note || '' }); };
    r.money.items.forEach(function (it) { add(itemText(it).replace(/ \(≈.*$/, ''), it.cell); });
    r.magic.items.forEach(function (it) { add(magText(it), it.cell); });
    S.save(); U.toast('Tesoro nell\'inventario della Scheda.');
  };

  /* ================= Prezzi magici ================= */
  function magSec() {
    var M = Wd.magici, h = '<p class="pl"><b>' + esc(M.costo) + '</b></p>';
    h += '<p class="hint">TS-7: prezzo degli oggetti magici che un personaggio potrebbe acquistare, sempre che esista un luogo che venda tali oggetti (a discrezione dei GM). Prezzi in MO.</p>';
    h += '<h3>Prezzi base</h3>' + table([['Oggetto', 1], ['Prezzo', 0]], M.base.map(function (r) { return '<tr>' + td(r[0], 1) + td(r[1]) + '</tr>'; })) + notes([M.baseNota]);
    h += '<h3>Moltiplicatori</h3><h4>Secondo il bonus</h4>' + table([['Bonus', 1], ['', 0]], M.moltBonus.map(function (r) { return '<tr>' + td(r[0], 1) + td(r[1]) + '</tr>'; })) +
      '<h4>Secondo il peso dell\'oggetto</h4>' + table([['Peso', 1], ['', 0]], M.moltPeso.map(function (r) { return '<tr>' + td(r[0], 1) + td(r[1]) + '</tr>'; }));
    var hd = [['Tipo di oggetto o di bonus', 1]]; for (var i = 1; i <= 10; i++) hd.push([String(i), 0]);
    h += '<h3>Costo addizionale (in MO) secondo l\'incantesimo contenuto</h3><p class="hint">Colonne: livello dell\'incantesimo dell\'oggetto**.</p>' +
      table(hd, M.add.map(function (r) { return '<tr>' + td(r[0], 1) + r[1].map(function (c) { return td(c); }).join('') + '</tr>'; })) + notes(M.addNote);
    h += '<h3>Oggetti magici con cariche</h3>' + table([['Tipo', 1], ['Lunghezza minima', 0], ['N. massimo di cariche', 0], ['Livello massimo dell\'inc.', 0]], M.cariche.map(function (r) { return '<tr>' + td(r[0], 1) + td(r[1]) + td(r[2]) + td(r[3]) + '</tr>'; }));
    h += '<p class="hint">L\'app mostra le tabelle e non calcola il prezzo: il compendio lascia al GM alcune scelte (per esempio la somma dei moltiplicatori).</p>';
    return h;
  }

  /* ================= Animali e mostri ================= */
  function animRows(rows, o) {
    return rows.map(function (x) {
      var r = x.r;
      return '<tr><td class="l"><b>' + esc(r.n) + '</b></td>' + td(r.lv) + td(r.qt) + td(r.vel) + td(r.pf) + td(r.ta) + td(r.bd) + td(r.att) + td(r.dim) + td(r.note, 1) +
        '<td><button class="mini" data-act="world_enemy" data-k="' + x.k + '" data-g="' + x.g + '" data-i="' + x.i + '" aria-label="Aggiungi ' + esc(r.n) + ' agli avversari">+ Avv.</button></td></tr>';
    }).join('');
  }
  function animSec() {
    var t = T(), A = Wd.animali, q = (t.q || '').toLowerCase().trim(), h = '';
    var groups = [];
    A.animali.forEach(function (g, i) { groups.push({ k: 'animali', g: i, n: g.n, grp: g }); });
    A.mostri.forEach(function (g, i) { groups.push({ k: 'mostri', g: i, n: g.n, grp: g }); });
    var gs = [['', '(tutti i gruppi)']].concat(groups.map(function (x, i) { return [String(i), (x.k === 'mostri' ? 'Mostri: ' : 'Animali: ') + x.n]; })).concat([['cav', 'Cavalcature e animali da soma']]);
    h += '<div class="grid g2">' + U.field('Gruppo', U.sel('data-t', 'world.grp', t.grp, gs, { re: 1, label: 'Gruppo' })) +
      U.field('Cerca', '<input type="search" data-t="world.q" data-re="1" value="' + esc(t.q) + '" placeholder="es. lupo, drago, veleno">') + '</div><p class="hint">Scrivi e premi Invio per cercare. «+ Avv.» porta la creatura tra gli avversari del Combattimento (con i suoi PF). I codici dell\'attacco sono nella Guida (TSC-2).</p>';
    var any = false, head = [['Tipo', 1], ['Liv.', 0], ['Qt.', 0], ['Vel.', 0], ['PF', 0], ['TA', 0], ['BD', 0], ['Attacco', 0], ['Dim.', 0], ['Note', 1], ['', 0]];
    if (t.grp !== 'cav') {
      groups.forEach(function (x, gi) {
        if (t.grp !== '' && t.grp !== String(gi)) return;
        var rows = [];
        x.grp.righe.forEach(function (r, i) {
          if (q && (x.n + ' ' + Object.keys(r).map(function (k) { return r[k]; }).join(' ')).toLowerCase().indexOf(q) < 0) return;
          rows.push({ r: r, k: x.k, g: x.g, i: i });
        });
        if (!rows.length) return;
        any = true;
        h += '<h3>' + esc(x.n) + '</h3>' + (x.grp.nota ? '<p class="hint">' + esc(x.grp.nota) + '</p>' : '') + '<div class="scroll"><table class="sk"><thead><tr>' + head.map(function (c) { return '<th' + (c[1] ? ' class="l"' : '') + '>' + esc(c[0]) + '</th>'; }).join('') + '</tr></thead><tbody>' + animRows(rows) + '</tbody></table></div>';
      });
    }
    if (t.grp === '' || t.grp === 'cav') {
      var chead = [['Tipo', 1], ['Liv.', 0], ['Velocità(1)', 0], ['m/r', 0], ['PF', 0], ['TA', 0], ['BD', 0], ['Attacco', 0], ['Dim.', 0], ['Portata', 0], ['B.a.C.(2)', 0]];
      A.cavalcature.forEach(function (g) {
        var rows = g.righe.filter(function (r) { return !q || (g.n + ' ' + Object.keys(r).map(function (k) { return r[k]; }).join(' ')).toLowerCase().indexOf(q) >= 0; });
        if (!rows.length) return;
        any = true;
        h += '<h3>Cavalcature: ' + esc(g.n) + '</h3>' + table(chead, rows.map(function (r) { return '<tr>' + td(r.n, 1) + td(r.lv) + td(r.vel) + td(r.mr) + td(r.pf) + td(r.ta) + td(r.bd) + td(r.att) + td(r.dim) + td(r.port) + td(r.bac) + '</tr>'; }));
      });
      if (any) h += notes(A.cavNote);
    }
    if (!any) h += '<p class="hint">Nessuna creatura trovata.</p>';
    h += det('Velocità', table([['Codice', 1], ['Velocità', 1], ['VM base', 0], ['VM bonus MM', 0], ['VM scappando/fuggendo', 0], ['VM carica/balzo', 0], ['VA iniziativa base', 0]], A.velocita.map(function (r) { return '<tr>' + td(r[0], 1) + td(r[1], 1) + td(r[2]) + td(r[3]) + td(r[4]) + td(r[5]) + td(r[6]) + '</tr>'; })));
    h += det('Legenda', paras(A.legenda));
    return h;
  }
  G.acts.world_enemy = function (b) {
    var A = Wd.animali, r = A[b.dataset.k][+b.dataset.g].righe[+b.dataset.i]; if (!r) return;
    S.get().enemies.push({ id: R.uid(), n: r.n, max: String(r.pf), dmg: 0 }); S.save();
    U.toast('«' + r.n + '» tra gli avversari (' + r.pf + ' PF).');
  };

  /* ================= Mutaforma ================= */
  function mutaSec() {
    var h = '';
    Wd.muta.forEach(function (b) {
      if (b[0] === 'h') return;
      if (b[0] === 'p') h += '<p class="pl">' + esc(b[1]) + '</p>';
      else if (b[0] === 'li') h += '<p class="pl">• ' + esc(b[1]) + '</p>';
      else h += '<p class="pl"><b>' + esc(b[1]) + '</b> ' + esc(b[2]) + '</p>';
    });
    return h + '<p class="hint">Professione introdotta in Girsa 3ed: regole come nel «Prospetto sul Mutaforma» del compendio.</p>';
  }

  function render() {
    var t = T(), sig = t.sec;
    var body = t.sec === 'xp' ? xpSec() : t.sec === 'mov' ? movSec() : t.sec === 'stat' ? statSec() : t.sec === 'meteo' ? meteoSec() : t.sec === 'inc' ? incSec() :
      t.sec === 'ris' ? risSec() : t.sec === 'tes' ? tesSec() : t.sec === 'mag' ? magSec() : t.sec === 'anim' ? animSec() : mutaSec();
    return '<section class="card"><h2>Mondo</h2><p class="hint">Esperienza, manovre, meteo, incontri, rischio degli incantesimi, tesori, prezzi magici, animali e mostri del compendio Istaro Quettar. Le tabelle sono quelle dei PDF; i tiri sono scorciatoie e dicono sempre da dove viene il risultato.</p>' +
      '<div class="grid g2">' + U.field('Sezione', U.sel('data-t', 'world.sec', t.sec, SECS, { re: 1, label: 'Sezione' })) + '</div>' + body + '</section>';
  }

  G.acts.world_xp = function () {
    var n = xpCompute().tot, c = S.cur(); if (!n) { U.toast('Niente da aggiungere.'); return; }
    c.px = String(num(c.px) + n); S.save(); U.toast(n + ' PE aggiunti: ora ' + c.px + ' (Scheda).'); G.app.render();
  };

  /* Aggiornamento in tempo reale del calcolatore PE */
  if (typeof document !== 'undefined') {
    document.addEventListener('input', function (e) {
      var t = e.target;
      if (!t || !t.getAttribute || t.getAttribute('data-w') !== 'xp') return;
      setTimeout(function () {
        var r = xpCompute(), a = document.getElementById('xpres'), b = document.getElementById('xpadd');
        if (a) a.innerHTML = xpResult(r);
        if (b) b.textContent = 'Aggiungi ' + r.tot + ' PE a ' + (r.c.name || 'questo personaggio');
      }, 0);
    });
  }

  G.pages.world = { render: render };
})(typeof window !== 'undefined' ? window : globalThis);
