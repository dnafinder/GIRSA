/* Pagina Combattimento: calcolo dell'attacco, colpo critico, avversari. */
(function (root) {
  'use strict';
  var G = root.GIRSA = root.GIRSA || {};
  var R = G.rules, D = G.data, U = G.ui, S = G.store, T = G.tables, esc = U.esc;
  var LETTERS = ['', 'T', 'A', 'B', 'C', 'D', 'E'];
  /* Tabella di fallimento suggerita in base alla tabella di attacco (scelta mia: il compendio non lo dice esplicitamente) */
  var FUMBLE_DEFAULT = { 'TA-1': 'TTM-1', 'TA-2': 'TTM-1', 'TA-3': 'TTM-1', 'TA-10': 'TTM-1', 'TA-4': 'TTM-2', 'TA-11': 'TTM-6', 'TA-7': 'TTM-3', 'TA-8': 'TTM-3' };

  function cb() {
    if (!U.tmp.cb) U.tmp.cb = { atk: '', armor: '', limit: '', fumble: '', skill: '', bo: '', bd: '', mods: {}, extra: '', roll: '', pf: '', letter: '', ct: '', ft: '', croll: '', cres: null, fres: null, res: null, target: '' };
    return U.tmp.cb;
  }
  function tableById(list, id) { for (var i = 0; i < list.length; i++) if (list[i].id === id) return list[i]; return null; }
  function atkList(st) { return ((G.tabledata && G.tabledata.atk) || []).concat(st.atk); }
  function critList(st) { return ((G.tabledata && G.tabledata.crit) || []).concat(st.crit); }

  function modsSum(f, melee) {
    var t = 0; D.ATK_MODS.forEach(function (m) { if (f.mods[m.id] && (melee || !m.melee)) t += m.v; });
    return t;
  }

  /* Calcolo puro dell'attacco, separato dal DOM per poterlo provare. */
  function resolveAttack(f, c, st, rollFn) {
    var cx = R.ctx(st.settings), table = tableById(atkList(st), f.atk);
    var r = f.roll !== '' ? { first: R.num(f.roll), total: R.num(f.roll), rolls: [R.num(f.roll)], dir: '' } : rollFn(st.settings.dice);
    var bo = f.skill !== '' ? R.skillTotal(c, +f.skill, cx) : R.num(f.bo);
    var bd = R.num(f.bd), ms = modsSum(f, true), extra = R.num(f.extra);
    var total = r.total + bo - bd + ms + extra;
    var res = { roll: r, bo: bo, bd: bd, mods: ms, extra: extra, total: total, table: table, cell: null, fumble: false, fail: false, beyond: false, capped: false, ti: false, fumbleMax: null };
    if (table) {
      var fm = f.fumble !== '' ? R.num(f.fumble) : table.fumble;
      res.fumbleMax = fm;
      if (fm != null && r.first <= fm) res.fumble = true;
      if (f.armor !== '') {
        var a = T.attackCell(table, +f.armor, total, { first: r.first, limit: f.limit });
        res.cell = a.cell; res.beyond = a.beyond; res.capped = a.capped; res.ti = a.ti;
        res.fail = !!(a.cell && a.cell.fail);
      }
    }
    return res;
  }

  function attackHtml(f, st, c) {
    var skills = c.skills.map(function (s, i) { return [String(i), s.name + ' (' + R.fmt(R.skillTotal(c, i, R.ctx(st.settings))) + ')']; })
      .filter(function (x, i) { var s = c.skills[i]; return (s.cat === 'arm' || s.cat === 'ama' || s.cat === 'mag') && s.name; });
    var tables = [['', '(nessuna: leggo io la tabella)']].concat(atkList(st).map(function (t) { return [t.id, t.name]; }));
    var t = tableById(atkList(st), f.atk);
    var armors = t ? [['', '(scegli)']].concat(t.armors.map(function (a, i) { return [String(i), a]; })) : [];
    var h = '<section class="card"><h2>Attacco</h2><div class="grid g2">' +
      U.field('Tabella di attacco', U.sel('data-t', 'cb.atk', f.atk, tables, { re: 1 })) +
      (t ? U.field('Armatura del bersaglio', U.sel('data-t', 'cb.armor', f.armor, armors)) : '') +
      (t && t.limits && t.limits.length ? U.field(t.id === 'TA-7' ? 'Tipo di dardo' : 'Taglia dell\'attacco', U.sel('data-t', 'cb.limit', f.limit, [['', '(scegli)']].concat(t.limits.map(function (l) { return [l.label, l.label]; })))) : '') +
      (t && t.fumble == null ? U.field('Colpo maldestro: tiro massimo dell\'arma', U.inp('data-t', 'cb.fumble', f.fumble, { type: 'number', ph: 'es. 4' })) : '') +
      U.field('BO dalla scheda', U.sel('data-t', 'cb.skill', f.skill, [['', '(a mano)']].concat(skills), { re: 1 })) +
      (f.skill === '' ? U.field('BO a mano', U.inp('data-t', 'cb.bo', f.bo, { type: 'number' })) : '') +
      U.field('BD del bersaglio', U.inp('data-t', 'cb.bd', f.bd, { type: 'number' })) +
      U.field('Altri modificatori', U.inp('data-t', 'cb.extra', f.extra, { type: 'number' })) +
      U.field('Tiro già fatto (vuoto = tira l\'app)', U.inp('data-t', 'cb.roll', f.roll, { type: 'number' })) + '</div><div class="mods">' +
      D.ATK_MODS.map(function (m) { return U.check('data-tc', 'cb.mods.' + m.id, f.mods[m.id], m.label + ' (' + R.fmt(m.v) + ')'); }).join('') + '</div>' +
      '<p class="hint">I modificatori «sul fianco», «da dietro», «sorpreso», «stordito» valgono solo in mischia: con armi da tiro o da lancio non spuntarli.</p>' +
      '<div class="row"><button class="big" data-act="attack">Tira l\'attacco</button><button class="ghost" data-act="mybd">Usa il mio BD come BD</button></div>';
    if (f.res) h += resultHtml(f, f.res, st);
    return h + '</section>';
  }

  function fumbleBlock(f, res, st) {
    var ids = critList(st).filter(function (x) { return /^TTM-/.test(x.id) || x.type === 'crit' && !/^TC-/.test(x.id); });
    var def = f.ft || (res.table && FUMBLE_DEFAULT[res.table.id]) || '';
    var h = '<div class="warn"><b>' + (res.table && /^TA-[78]$/.test(res.table.id) ? 'Fallimento dell\'incantesimo' : res.table && /^TA-[56]$/.test(res.table.id) ? 'Attacco fallito' : 'Colpo maldestro') +
      '</b>: il tiro non modificato (' + res.roll.first + ') è ≤ ' + res.fumbleMax + '.';
    if (ids.length && !(res.table && /^TA-[56]$/.test(res.table.id))) {
      h += '<div class="row">' + U.field('Tabella dei fallimenti', U.sel('data-t', 'cb.ft', def, ids.map(function (x) { return [x.id, x.name]; }))) +
        '<button data-act="fumbleroll">Tira il fallimento</button></div>';
    }
    h += '</div>';
    if (f.fres) h += '<div class="res">Fallimento: tiro <b>' + f.fres.raw + '</b>' + (f.fres.row ? '<div class="hit">' + esc(f.fres.row.text) + '</div>' : '') + '</div>';
    return h;
  }

  function resultHtml(f, r, st) {
    var s = '<div class="res"><div>Tiro ' + (r.roll.rolls.length > 1 ? r.roll.rolls.join(', ') + ' = ' : '') + '<b>' + r.roll.total + '</b> + BO ' + R.fmt(r.bo) + ' − BD ' + r.bd +
      (r.mods ? ' ' + R.fmt(r.mods) : '') + (r.extra ? ' ' + R.fmt(r.extra) : '') + ' = <b class="big">' + r.total + '</b></div>';
    if (r.fumble) s += fumbleBlock(f, r, st);
    if (r.cell && !r.fumble) {
      if (r.fail) s += '<div class="warn"><b>Fallimento dell\'incantesimo</b> (cella «F»): tira sulla tabella dei fallimenti degli incantesimi (TTM-3).</div>';
      else s += '<div class="hit">' + r.cell.pf + ' PF' + (r.cell.crit ? ' · critico <b>' + r.cell.crit + '</b>' : ' · nessun critico') + '</div>';
      if (r.ti) s += '<div class="hint">Riga «TI» (tiro non modificato).</div>';
      if (r.capped) s += '<div class="hint">Risultato limitato al massimo previsto per «' + esc(f.limit) + '».</div>';
      if (r.beyond) s += '<div class="hint">Oltre l\'ultima riga della tabella: usata l\'ultima (il testo non prevede altro).</div>';
    } else if (r.table && f.armor === '' && !r.fumble) {
      s += '<div class="hint">Scegli l\'armatura del bersaglio per leggere la tabella.</div>';
    } else if (!r.table) {
      s += '<div class="hint">Nessuna tabella scelta: cerca il risultato <b>' + r.total + '</b> sulla tabella cartacea e inserisci PF e lettera qui sotto.</div>';
    }
    return s + '</div>';
  }

  function critHtml(f, st) {
    var cts = [['', '(nessuna: leggo io)']].concat(critList(st).filter(function (t) { return !/^TTM-/.test(t.id); }).map(function (t) { return [t.id, t.name]; }));
    var h = '<section class="card"><h2>Danno e colpo critico</h2><div class="grid g3">' +
      U.field('PF inflitti', U.inp('data-t', 'cb.pf', f.pf, { type: 'number' })) +
      U.field('Lettera critico', U.sel('data-t', 'cb.letter', f.letter, LETTERS.map(function (x) { return [x, x || '–']; }))) +
      U.field('Tabella critici (dipende dall\'arma)', U.sel('data-t', 'cb.ct', f.ct, cts)) +
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

  G.pages.combat = { render: render, resolveAttack: resolveAttack, modsSum: modsSum, cb: cb, tableById: tableById, atkList: atkList, critList: critList };
  if (typeof module !== 'undefined') module.exports = G.pages.combat;
})(typeof window !== 'undefined' ? window : globalThis);
