/* Pagina Combattimento: calcolo dell'attacco, colpo critico, avversari. */
(function (root) {
  'use strict';
  var G = root.GIRSA = root.GIRSA || {};
  var R = G.rules, D = G.data, U = G.ui, S = G.store, T = G.tables, esc = U.esc;
  var LETTERS = ['', 'T', 'A', 'B', 'C', 'D', 'E'];

  function cb() {
    if (!U.tmp.cb) U.tmp.cb = { atk: '', armor: '0', skill: '', bo: '', bd: '', mods: {}, extra: '', roll: '', pf: '', letter: '', ct: '', croll: '', cres: null, res: null, target: '' };
    return U.tmp.cb;
  }
  function tableById(list, id) { for (var i = 0; i < list.length; i++) if (list[i].id === id) return list[i]; return null; }

  function modsSum(f, melee) {
    var t = 0; D.ATK_MODS.forEach(function (m) { if (f.mods[m.id] && (melee || !m.melee)) t += m.v; });
    return t;
  }

  /* Calcolo puro dell'attacco, separato dal DOM per poterlo provare. */
  function resolveAttack(f, c, st, rollFn) {
    var cx = R.ctx(st.settings), table = tableById(st.atk, f.atk);
    var r = f.roll !== '' ? { first: R.num(f.roll), total: R.num(f.roll), rolls: [R.num(f.roll)], dir: '' } : rollFn(st.settings.dice);
    var bo = f.skill !== '' ? R.skillTotal(c, +f.skill, cx) : R.num(f.bo);
    var bd = R.num(f.bd), ms = modsSum(f, true), extra = R.num(f.extra);
    var total = r.total + bo - bd + ms + extra, res = { roll: r, bo: bo, bd: bd, mods: ms, extra: extra, total: total, table: table, cell: null, fumble: false, beyond: false };
    if (table) {
      var a = T.attackCell(table, +f.armor, total);
      res.cell = a.cell; res.beyond = a.beyond;
      if (table.fumble !== '' && table.fumble != null && r.first <= R.num(table.fumble)) res.fumble = true;
    }
    return res;
  }

  function attackHtml(f, st, c) {
    var skills = c.skills.map(function (s, i) { return [String(i), s.name + ' (' + R.fmt(R.skillTotal(c, i, R.ctx(st.settings))) + ')']; })
      .filter(function (x, i) { var s = c.skills[i]; return (s.cat === 'arm' || s.cat === 'ama' || s.cat === 'mag') && s.name; });
    var tables = [['', '(nessuna: inserisco a mano)']].concat(st.atk.map(function (t) { return [t.id, t.name]; }));
    var t = tableById(st.atk, f.atk);
    var armors = t ? t.armors.map(function (a, i) { return [String(i), a]; }) : [];
    var h = '<section class="card"><h2>Attacco</h2><div class="grid g2">' +
      U.field('Tabella di attacco', U.sel('data-t', 'cb.atk', f.atk, tables, { re: 1 })) +
      (t ? U.field('Armatura del bersaglio', U.sel('data-t', 'cb.armor', f.armor, armors)) : '') +
      U.field('BO dalla scheda', U.sel('data-t', 'cb.skill', f.skill, [['', '(a mano)']].concat(skills), { re: 1 })) +
      (f.skill === '' ? U.field('BO a mano', U.inp('data-t', 'cb.bo', f.bo, { type: 'number' })) : '') +
      U.field('BD del bersaglio', U.inp('data-t', 'cb.bd', f.bd, { type: 'number' })) +
      U.field('Altri modificatori', U.inp('data-t', 'cb.extra', f.extra, { type: 'number' })) +
      U.field('Tiro già fatto (vuoto = tira l\'app)', U.inp('data-t', 'cb.roll', f.roll, { type: 'number' })) + '</div><div class="mods">' +
      D.ATK_MODS.map(function (m) { return U.check('data-tc', 'cb.mods.' + m.id, f.mods[m.id], m.label + ' (' + R.fmt(m.v) + ')'); }).join('') + '</div>' +
      '<p class="hint">Modificatori «sul fianco», «da dietro», «sorpreso», «stordito» valgono solo in mischia: con armi da tiro o da lancio non applicarli (l\'app li somma comunque se spuntati).</p>' +
      '<div class="row"><button class="big" data-act="attack">Tira l\'attacco</button><button class="ghost" data-act="mybd">Usa il mio BD come BD</button></div>';
    if (f.res) h += resultHtml(f.res, st);
    return h + '</section>';
  }

  function resultHtml(r, st) {
    var s = '<div class="res"><div>Tiro ' + (r.roll.rolls.length > 1 ? r.roll.rolls.join(', ') + ' = ' : '') + '<b>' + r.roll.total + '</b> + BO ' + R.fmt(r.bo) + ' − BD ' + r.bd +
      (r.mods ? ' ' + R.fmt(r.mods) : '') + (r.extra ? ' ' + R.fmt(r.extra) : '') + ' = <b class="big">' + r.total + '</b></div>';
    if (r.fumble) s += '<div class="warn">Fallimento critico: il tiro non modificato (' + r.roll.first + ') rientra nell\'intervallo di fallimento della tabella (≤ ' + r.table.fumble + '). Consulta la tabella dei fallimenti.</div>';
    if (r.cell) {
      s += '<div class="hit">' + r.cell.pf + ' PF' + (r.cell.crit ? ' · critico <b>' + r.cell.crit + '</b>' : ' · nessun critico') + (r.beyond ? ' <i>(oltre l\'ultima riga: usata l\'ultima)</i>' : '') + '</div>';
    } else if (!r.table) {
      s += '<div class="hint">Nessuna tabella caricata: cerca il risultato <b>' + r.total + '</b> sulla tabella cartacea e inserisci PF e lettera qui sotto. Tabelle importabili in Dati.</div>';
    }
    return s + '</div>';
  }

  function critHtml(f, st) {
    var cts = [['', '(nessuna: leggo io)']].concat(st.crit.map(function (t) { return [t.id, t.name]; }));
    var h = '<section class="card"><h2>Danno e colpo critico</h2><div class="grid g3">' +
      U.field('PF inflitti', U.inp('data-t', 'cb.pf', f.pf, { type: 'number' })) +
      U.field('Lettera critico', U.sel('data-t', 'cb.letter', f.letter, LETTERS.map(function (x) { return [x, x || '–']; }))) +
      U.field('Tabella critici', U.sel('data-t', 'cb.ct', f.ct, cts)) +
      U.field('Tiro critico già fatto (1–100)', U.inp('data-t', 'cb.croll', f.croll, { type: 'number' })) + '</div>' +
      '<div class="row"><button data-act="crit" ' + (f.letter ? '' : 'disabled') + '>Tira il critico</button>' +
      '<button data-act="dmgenemy">PF all\'avversario</button><button data-act="dmgme">PF a me</button></div>';
    if (f.cres) {
      h += '<div class="res">Tiro ' + f.cres.raw + ' ' + R.fmt(f.cres.mod) + ' (lettera ' + f.cres.letter + ') = <b class="big">' + f.cres.total + '</b>' +
        (f.cres.row ? '<div class="hit">' + esc(f.cres.row.text) + '</div>' : '<div class="hint">Cerca ' + f.cres.total + ' sulla tabella dei critici.</div>') + '</div>';
    }
    return h + '</section>';
  }

  function enemies(f, st) {
    var h = '<section class="card"><h2>Avversari</h2>';
    if (!st.enemies.length) h += '<p class="hint">Nessun avversario.</p>';
    st.enemies.forEach(function (e, i) {
      var cur = R.num(e.max) - R.num(e.dmg);
      h += '<div class="li en' + (cur <= 0 && e.max !== '' ? ' dead' : '') + '"><label class="rad"><input type="radio" name="tg" data-act="target" data-i="' + i + '"' + (f.target === e.id ? ' checked' : '') + '> ' +
        U.inp('data-p-en', i + '.n', e.n, { cls: 'wide', label: 'Nome avversario' }) + '</label><span class="pfb">' + (e.max === '' ? 'PF ?' : cur + '/' + e.max) + '</span>' +
        '<button class="mini" data-act="enhit" data-i="' + i + '" data-n="1">−1</button><button class="mini" data-act="enhit" data-i="' + i + '" data-n="5">−5</button>' +
        '<button class="mini" data-act="enhit" data-i="' + i + '" data-n="-5">+5</button><button class="mini" data-act="del" data-list="enemies" data-i="' + i + '">✕</button></div>';
    });
    return h + '<div class="row"><label>Nome' + U.inp('data-t', 'en.n', U.tmp.en && U.tmp.en.n || '') + '</label><label>PF' + U.inp('data-t', 'en.max', U.tmp.en && U.tmp.en.max || '', { type: 'number', cls: 'sm' }) +
      '</label><button data-act="enadd">+ Aggiungi</button></div></section>';
  }

  function logHtml(st) {
    return '<section class="card"><h2>Registro</h2><div class="row"><button class="ghost" data-act="clearclog">Svuota</button></div>' +
      (st.clog.length ? '<ul class="log">' + st.clog.map(function (x) { return '<li><span class="t">' + U.timeStr(x.t) + '</span> ' + esc(x.s) + '</li>'; }).join('') + '</ul>' : '<p class="hint">Vuoto.</p>') + '</section>';
  }

  function render() {
    var st = S.get(), c = S.cur(), f = cb();
    return attackHtml(f, st, c) + critHtml(f, st) + enemies(f, st) + logHtml(st);
  }

  G.pages.combat = { render: render, resolveAttack: resolveAttack, modsSum: modsSum, cb: cb, tableById: tableById };
  if (typeof module !== 'undefined') module.exports = G.pages.combat;
})(typeof window !== 'undefined' ? window : globalThis);
