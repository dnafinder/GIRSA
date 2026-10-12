/* Pagina Combattimento: calcolo dell'attacco, colpo critico, avversari. */
(function (root) {
  'use strict';
  var G = root.GIRSA = root.GIRSA || {};
  var R = G.rules, D = G.data, U = G.ui, S = G.store, T = G.tables, esc = U.esc;
  var LETTERS = ['', 'T', 'A', 'B', 'C', 'D', 'E'];
  var ORDER = ['T', 'A', 'B', 'C', 'D', 'E'];
  var TYPE_TC = { IM: 'TC-1', TA: 'TC-2', PU: 'TC-3', PE: 'TC-4', PR: 'TC-5', CA: 'TC-6', FR: 'TC-7', EL: 'TC-8', IMM: 'TC-9' };
  var ARMOR_NAMES = ['corazza di piastre', 'corazza di maglie', 'cuoio rinforzato', 'cuoio grezzo', 'nessuna armatura'];

  /* Dati dell'arma scelta: dal catalogo (TSC-1) oppure personalizzati. */
  function weaponInfo(w) {
    if (!w) return null;
    var cw = null; ((G.weapondata) || []).forEach(function (x) { if (x.id === w.id) cw = x; });
    if (cw) {
      return { name: cw.n, atk: cw.atk, limit: cw.limit || '', cm: cw.cm, c1: cw.c1 && { ct: TYPE_TC[cw.c1.type] || '', max: cw.c1.max }, c2: cw.c2 && { ct: TYPE_TC[cw.c2.type] || '', max: cw.c2.max },
        mods: cw.mods, manual: cw.manual, note: cw.note, git: cw.git };
    }
    return { name: w.n, atk: w.atk, limit: '', cm: w.fumble === '' ? null : R.num(w.fumble), c1: { ct: w.ct, max: null }, c2: null, mods: [], manual: [], note: '', git: w.git };
  }
  /* Lettera del critico limitata al tipo massimo dell'arma (la lettera tra parentesi). */
  function capLetter(letter, max) {
    if (!letter || !max) return letter || '';
    return ORDER.indexOf(letter) > ORDER.indexOf(max) ? max : letter;
  }
  /* Secondario: se il primario è maggiore di A, un grado sotto il primario (regola scritta per gli animali, TSC-2; qui estesa alle armi). */
  function secondaryLetter(primary, c2) {
    if (!c2 || !primary) return '';
    var i = ORDER.indexOf(primary); if (i < 2) return '';
    return capLetter(ORDER[i - 1], c2.max);
  }
  /* Somma dei modificatori «sulla TA» dell'arma per l'armatura scelta */
  function taMod(wi, armor) {
    var t = 0;
    if (wi && armor !== '') wi.mods.forEach(function (m) { if (!m.arm || m.arm.indexOf(+armor) >= 0) t += m.v; });
    return t;
  }
  /* Tabella di fallimento suggerita in base alla tabella di attacco (scelta mia: il compendio non lo dice esplicitamente) */
  var FUMBLE_DEFAULT = { 'TA-1': 'TTM-1', 'TA-2': 'TTM-1', 'TA-3': 'TTM-1', 'TA-10': 'TTM-1', 'TA-4': 'TTM-2', 'TA-11': 'TTM-6', 'TA-7': 'TTM-3', 'TA-8': 'TTM-3' };

  function cb() {
    if (!U.tmp.cb) U.tmp.cb = { weapon: '', atk: '', armor: '', limit: '', fumble: '', skill: '', bo: '', bd: '', mods: {}, extra: '', roll: '', pf: '', letter: '', ct: '', ft: '', croll: '', letter2: '', ct2: '', croll2: '', cres2: null, wi: null, cres: null, fres: null, res: null, target: '' };
    return U.tmp.cb;
  }
  function tableById(list, id) { for (var i = 0; i < list.length; i++) if (list[i].id === id) return list[i]; return null; }
  function atkList(st) { return ((G.tabledata && G.tabledata.atk) || []).concat(st.atk); }
  function critList(st) { return ((G.tabledata && G.tabledata.crit) || []).concat(st.crit); }

  function modsSum(f, melee) {
    var t = 0, pos = 0;
    D.ATK_MODS.forEach(function (m) {
      if (!f.mods[m.id] || !(melee || !m.melee)) return;
      if (m.grp === 'pos') pos = Math.max(pos, m.v); else t += m.v;   // stordito, atterrato, prono: se ne applica uno solo
    });
    return t + pos;
  }

  /* Calcolo puro dell'attacco, separato dal DOM per poterlo provare. */
  function resolveAttack(f, c, st, rollFn) {
    var cx = R.ctx(st.settings), table = tableById(atkList(st), f.atk);
    var r = f.roll !== '' ? { first: R.num(f.roll), total: R.num(f.roll), rolls: [R.num(f.roll)], dir: '' } : rollFn(st.settings.dice);
    var bo = f.skill !== '' ? R.skillTotal(c, +f.skill, cx) : R.num(f.bo);
    var bd = R.num(f.bd), ms = modsSum(f, true), extra = R.num(f.extra);
    var total = r.total + bo - bd + ms + extra, tam = taMod(f.wi, f.armor);
    var res = { ta: tam, wi: f.wi, roll: r, bo: bo, bd: bd, mods: ms, extra: extra, total: total, table: table, cell: null, fumble: false, fail: false, beyond: false, capped: false, ti: false, fumbleMax: null };
    if (table) {
      var fm = f.fumble !== '' ? R.num(f.fumble) : table.fumble;
      res.fumbleMax = fm;
      if (fm != null && r.first <= fm) res.fumble = true;
      if (f.armor !== '') {
        var a = T.attackCell(table, +f.armor, total + tam, { first: r.first, limit: f.limit });
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
    var wl = [['', '(nessuna: scelgo a mano)']].concat(c.weapons.map(function (w, i) { return [String(i), w.n || 'Arma ' + (i + 1)]; }));
    var h = '<section class="card"><h2>Attacco</h2><div class="grid g2">' +
      (c.weapons.length ? U.field('Arma', U.sel('data-act-change', 'weapon', f.weapon, wl)) : '') +
      U.field('Tabella di attacco', U.sel('data-t', 'cb.atk', f.atk, tables, { re: 1 })) +
      (t ? U.field('Armatura del bersaglio', U.sel('data-t', 'cb.armor', f.armor, armors)) : '') +
      (t && t.limits && t.limits.length ? U.field(t.id === 'TA-7' ? 'Tipo di dardo' : 'Taglia dell\'attacco', U.sel('data-t', 'cb.limit', f.limit, [['', '(scegli)']].concat(t.limits.map(function (l) { return [l.label, l.label]; })))) : '') +
      (t && t.fumble == null ? U.field('Colpo maldestro: tiro massimo (si imposta in Scheda → Armi)', U.inp('data-t', 'cb.fumble', f.fumble, { type: 'number', ph: 'es. 4' })) : '') +
      U.field('BO dalla scheda', U.sel('data-t', 'cb.skill', f.skill, [['', '(a mano)']].concat(skills), { re: 1 })) +
      (f.skill === '' ? U.field('BO a mano', U.inp('data-t', 'cb.bo', f.bo, { type: 'number' })) : '') +
      U.field('BD del bersaglio', U.inp('data-t', 'cb.bd', f.bd, { type: 'number' })) +
      U.field('Altri modificatori', U.inp('data-t', 'cb.extra', f.extra, { type: 'number' })) +
      U.field('Tiro già fatto (vuoto = tira l\'app)', U.inp('data-t', 'cb.roll', f.roll, { type: 'number' })) + '</div><div class="mods">' +
      D.ATK_MODS.map(function (m) { return U.check('data-tc', 'cb.mods.' + m.id, f.mods[m.id], m.label + ' (' + R.fmt(m.v) + ')'); }).join('') + '</div>' +
      '<p class="hint">I bonus «fianco», «da dietro», «sorpresa», «stordito», «atterrato», «prono» non valgono con armi da tiro o da lancio. Tra stordito, atterrato e prono si applica uno solo (il più alto). Gli altri modificatori sono cumulativi.</p>' +
      '<div class="row"><button class="big" data-act="attack">Tira l\'attacco</button><button class="ghost" data-act="mybd">Usa il mio BD come BD</button></div>';
    if (f.res) h += resultHtml(f, f.res, st);
    return h + '</section>';
  }

  function fumbleBlock(f, res, st) {
    var ids = critList(st).filter(function (x) { return /^TTM-/.test(x.id) || x.type === 'crit' && !/^TCM?-/.test(x.id); });
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
    if (r.ta) s += '<div class="hint">Modificatore dell\'arma sulla tabella: <b>' + R.fmt(r.ta) + '</b> (' + ARMOR_NAMES[+f.armor] + '), applicato dopo gli altri bonus: si legge la riga ' + (r.total + r.ta) + '.</div>';
    if (r.fumble) s += fumbleBlock(f, r, st);
    if (r.cell && !r.fumble) {
      if (r.fail) s += '<div class="warn"><b>Fallimento dell\'incantesimo</b> (cella «F»): tira sulla tabella dei fallimenti degli incantesimi (TTM-3).</div>';
      else s += '<div class="hit">' + r.cell.pf + ' PF' + (r.cell.crit ? ' · critico <b>' + r.cell.crit + '</b>' : ' · nessun critico') + '</div>';
      if (r.ti) s += '<div class="hint">Riga «TI» (tiro non modificato).</div>';
      if (r.capped) s += '<div class="hint">Risultato limitato al massimo previsto per «' + esc(f.limit) + '».</div>';
      if (r.beyond) {
        var b = G.magic && !/^TA-[78]$/.test(r.table.id) ? G.magic.beyond150(r.total + r.ta) : null;
        s += '<div class="hint">Oltre l\'ultima riga della tabella: usata l\'ultima.' + (b ? ' Regola «Oltre il 150» (a discrezione del GM): margine ' + b.margin + ', ' +
          (b.letter ? 'ulteriore colpo critico di grado <b>' + b.letter + '</b> dello stesso tipo del primario dell\'arma.' : 'nessun critico supplementare (margine fino a 30).') + '</div>' : '</div>');
      }
    } else if (r.table && f.armor === '' && !r.fumble) {
      s += '<div class="hint">Scegli l\'armatura del bersaglio per leggere la tabella.</div>';
    } else if (!r.table) {
      s += '<div class="hint">Nessuna tabella scelta: cerca il risultato <b>' + r.total + '</b> sulla tabella cartacea e inserisci PF e lettera qui sotto.</div>';
    }
    if (r.wi && (r.wi.note || r.wi.manual.length)) {
      s += '<div class="hint"><b>' + esc(r.wi.name) + '</b>: ' + esc(r.wi.note) + (r.wi.manual.length ? ' <b>Da applicare a mano:</b> ' + esc(r.wi.manual.join('; ')) : '') + '</div>';
    }
    return s + '</div>';
  }

  function critBlock(f, st, k, title) {
    var aimed = f.mods && f.mods.mira;
    var cts = [['', '(nessuna: leggo io)']].concat(critList(st).filter(function (t) { return !/^TTM-/.test(t.id); }).map(function (t) { return [t.id, t.name]; }));
    var res = f['cres' + k];
    var h = '<h3>' + title + '</h3><div class="grid g3">' +
      U.field('Lettera', U.sel('data-t', 'cb.letter' + k, f['letter' + k], LETTERS.map(function (x) { return [x, x || '–']; }))) +
      U.field('Tabella critici', U.sel('data-t', 'cb.ct' + k, f['ct' + k], cts)) +
      U.field('Tiro già fatto (1–100)', U.inp('data-t', 'cb.croll' + k, f['croll' + k], { type: 'number' })) + '</div>' +
      (aimed ? '<p class="hint">Con la mira (−30) il critico si legge sulle tabelle TCM-1…4 (gambe, braccia, petto, testa): solo con armi da tiro o da lancio che fanno critici da punta.</p>' : '') +
      '<div class="row"><button data-act="crit" data-k="' + k + '" ' + (f['letter' + k] ? '' : 'disabled') + '>Tira il critico</button></div>';
    if (res) {
      h += '<div class="res">Tiro ' + res.raw + ' ' + R.fmt(res.mod) + ' (lettera ' + res.letter + ') = <b class="big">' + res.total + '</b>' +
        (res.row ? '<div class="hit">' + esc(res.row.text) + '</div>' : '<div class="hint">Cerca ' + res.total + ' sulla tabella dei critici.</div>') + '</div>';
    }
    return h;
  }

  function critHtml(f, st) {
    var h = '<section class="card"><h2>Danno e colpo critico</h2><div class="grid g3">' +
      U.field('PF inflitti', U.inp('data-t', 'cb.pf', f.pf, { type: 'number' })) + '</div>' +
      '<div class="row"><button data-act="dmgenemy">PF all\'avversario</button><button data-act="dmgme">PF a me</button></div>' +
      critBlock(f, st, '', 'Critico primario');
    if (f.letter2 || f.ct2 || f.cres2) h += critBlock(f, st, '2', 'Critico secondario');
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
    return attackHtml(f, st, c) + critHtml(f, st) + (G.magicpage ? G.magicpage.html() : '') + enemies(f, st) + logHtml(st);
  }

  G.pages.combat = { weaponInfo: weaponInfo, capLetter: capLetter, secondaryLetter: secondaryLetter, taMod: taMod, TYPE_TC: TYPE_TC, render: render, resolveAttack: resolveAttack, modsSum: modsSum, cb: cb, tableById: tableById, atkList: atkList, critList: critList };
  if (typeof module !== 'undefined') module.exports = G.pages.combat;
})(typeof window !== 'undefined' ? window : globalThis);
