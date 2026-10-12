/* Avvio, navigazione e gestione degli eventi. */
(function (root) {
  'use strict';
  var G = root.GIRSA, R = G.rules, D = G.data, U = G.ui, S = G.store, T = G.tables, dice = G.dice.dice;
  var P = G.pages, esc = U.esc;
  var ROUTES = [['sheet', 'Scheda'], ['create', 'Crea'], ['dice', 'Dadi'], ['combat', 'Combattimento'], ['gear', 'Oggetti'], ['diary', 'Diario'], ['ref', 'Guida'], ['data', 'Dati']];
  var STATE_LISTS = { enemies: 1, atk: 1, crit: 1 };

  function route() { var r = (location.hash || '').replace(/^#\/?/, ''); return P[r] ? r : 'sheet'; }
  function val(t) { return t.type === 'checkbox' ? t.checked : t.value; }

  function renderHeader() {
    var st = S.get(), c = S.cur();
    document.getElementById('charsel').innerHTML = st.chars.map(function (x) {
      return '<option value="' + esc(x.id) + '"' + (x.id === st.cur ? ' selected' : '') + '>' + esc(x.name || '(senza nome)') + '</option>';
    }).join('');
    document.getElementById('nav').innerHTML = ROUTES.map(function (r) {
      return '<a href="#/' + r[0] + '"' + (r[0] === route() ? ' aria-current="page"' : '') + '>' + r[1] + '</a>';
    }).join('');
    U.updateCalc();
  }
  function render() {
    var y = root.scrollY;
    document.getElementById('view').innerHTML = P[route()].render();
    renderHeader(); U.paintLast();
    root.scrollTo(0, y);
  }

  function pushLog(text) { U.logLine(S.get().clog, text); }
  function need(cond, msg) { if (!cond) U.toast(msg); return cond; }

  /* ---------- eventi di input ---------- */
  document.addEventListener('input', function (e) {
    var t = e.target, st = S.get();
    if (t.hasAttribute('data-p')) {
      S.setPath(S.cur(), t.getAttribute('data-p'), val(t));
      if (t.getAttribute('data-p') === 'name') renderHeader();
    } else if (t.hasAttribute('data-s')) {
      var v = val(t); if (t.type === 'number') v = v === '' ? '' : +v;
      S.setPath(st.settings, t.getAttribute('data-s'), v);
    } else if (t.hasAttribute('data-t') || t.hasAttribute('data-tc')) {
      S.setPath(U.tmp, t.getAttribute('data-t') || t.getAttribute('data-tc'), val(t));
      return;
    } else if (t.hasAttribute('data-p-en')) {
      S.setPath(st.enemies, t.getAttribute('data-p-en'), val(t));
    } else return;
    S.save(); U.updateCalc();
  });

  document.addEventListener('change', function (e) {
    var t = e.target;
    if (t.hasAttribute('data-act-change')) {
      var a = t.getAttribute('data-act-change');
      if (a === 'char') { S.get().cur = t.value; S.save(); render(); }
      if (a === 'weapon') {
        var f = P.combat.cb(), w = S.cur().weapons[+t.value], wi = P.combat.weaponInfo(w);
        f.weapon = t.value; f.limit = ''; f.res = null; f.cres = null; f.cres2 = null; f.fres = null; f.letter = ''; f.letter2 = ''; f.wi = wi;
        if (w && wi) { f.atk = wi.atk || ''; f.limit = wi.limit || ''; f.skill = w.skill; f.fumble = wi.cm == null ? '' : String(wi.cm); f.ct = wi.c1 ? wi.c1.ct : ''; f.ct2 = wi.c2 ? wi.c2.ct : ''; f.armor = ''; }
        render();
      }
      if (a.indexOf('wcat:') === 0) {
        var wi2 = +a.slice(5), ww = S.cur().weapons[wi2], cw = null;
        U.weaponCat().forEach(function (x) { if (x.id === t.value) cw = x; });
        ww.id = t.value; if (cw && !ww.n) ww.n = cw.n; S.save(); render();
      }
      var ap = a.split(':');
      if (G.changes && G.changes[ap[0]]) G.changes[ap[0]](t.value, ap[1]);
      if (a === 'popolo') { if (R.applyPopolo(S.cur(), t.value)) { S.save(); render(); U.toast('Applicate le modifiche del popolo (TB-3).'); } else { S.cur().popolo = ''; S.save(); } }
    } else if (t.hasAttribute('data-act-file')) {
      importFile(t.files && t.files[0]); t.value = '';
    } else if (t.getAttribute('data-re')) render();
  });

  /* ---------- azioni ---------- */
  function listOf(name) {
    var st = S.get();
    return STATE_LISTS[name] ? st[name] : S.getPath(S.cur(), name);
  }
  function openRoll(label, bonus) {
    var r = dice.open(S.get().settings.dice), tot = r.total + bonus;
    U.showRoll(label, 'tiro ' + (r.rolls.length > 1 ? r.rolls.join(', ') + ' = ' + r.total : r.total) + (bonus ? ' ' + R.fmt(bonus) : ''), tot);
    return tot;
  }

  var ACT = {
    pf: function (b) { var c = S.cur(); c.pf.dmg = Math.max(0, R.num(c.pf.dmg) + (+b.dataset.n)); S.save(); render(); },
    newchar: function () {
      var c = R.newChar('Personaggio ' + (S.get().chars.length + 1)); S.get().chars.push(c); S.get().cur = c.id; S.save(); location.hash = '#/sheet'; render();
    },
    dupchar: function () {
      var c = JSON.parse(JSON.stringify(S.cur())); c.id = R.uid(); c.name += ' (copia)'; S.get().chars.push(c); S.get().cur = c.id; S.save(); render();
    },
    delchar: function () {
      var st = S.get(); if (!need(st.chars.length > 1, 'Deve restare almeno un personaggio.')) return;
      if (!confirm('Eliminare «' + S.cur().name + '»? Non si può annullare.')) return;
      st.chars = st.chars.filter(function (x) { return x.id !== st.cur; }); st.cur = st.chars[0].id; S.save(); render();
    },
    rollskill: function (b) { var c = S.cur(), i = +b.dataset.i; openRoll(c.skills[i].name || 'Abilità', R.skillTotal(c, i, R.ctx(S.get().settings))); },
    rolldef: function (b) {
      var d = D.DEFENSES.filter(function (x) { return x[0] === b.dataset.k; })[0];
      openRoll(d[1], R.defenseTotal(S.cur(), d[0], d[2], R.ctx(S.get().settings)));
    },
    d100o: function () { openRoll('d100 aperto', 0); },
    d100c: function () { var r = dice.closed(); U.showRoll('d100 chiuso', '', r.total); render(); },
    die: function (b) { var n = +b.dataset.d.slice(1), v = dice.d(n); U.showRoll(b.dataset.d, '', v); render(); },
    rollexpr: function () {
      var r = dice.expr(U.tmp.expr || ''); if (!need(r, 'Espressione non valida. Esempio: 2d6+1')) return;
      U.showRoll(U.tmp.expr, '[' + r.rolls.join(', ') + ']' + (r.mod ? ' ' + R.fmt(r.mod) : ''), r.total); render();
    },
    clearroll: function () { S.get().dlog = []; S.save(); render(); },
    add: function (b) {
      var l = b.dataset.list, c = S.cur();
      c[l].push(l === 'inv' ? { n: '', q: '', note: '' } : l === 'erbario' ? { n: '', uso: '', cod: '', q: '', note: '' } : l === 'weapons' ? { id: '', n: '', atk: '', skill: '', ct: '', fumble: '', git: '' } : { n: '', lvl: '', note: '' }); S.save(); render();
    },
    del: function (b) {
      var arr = listOf(b.dataset.list); if (!arr) return;
      if ((b.dataset.list === 'atk' || b.dataset.list === 'crit') && !confirm('Eliminare questa tabella?')) return;
      arr.splice(+b.dataset.i, 1); S.save(); render();
    },
    attack: function () {
      var f = P.combat.cb(), st = S.get(), c = S.cur();
      if (f.atk && !need(f.armor !== '', 'Scegli l\'armatura del bersaglio.')) return;
      if (f.atk && (P.combat.tableById(P.combat.atkList(S.get()), f.atk).limits || []).length && !need(f.limit !== '', 'Scegli taglia o tipo di dardo.')) return;
      var res = P.combat.resolveAttack(f, c, st, dice.open);
      f.res = res;
      if (res.cell) {
        f.pf = String(res.cell.pf); f.cres = null; f.cres2 = null;
        f.letter = res.fail ? '' : P.combat.capLetter(res.cell.crit || '', f.wi && f.wi.c1 && f.wi.c1.max);
        f.letter2 = P.combat.secondaryLetter(f.letter, f.wi && f.wi.c2);
      }
      var desc = 'Attacco ' + res.total + (res.cell && !res.fail ? ' → ' + res.cell.pf + ' PF' + (res.cell.crit ? ' + critico ' + res.cell.crit : '') : '') + (res.fumble ? ' · FALLIMENTO' : '');
      pushLog(desc); U.showRoll('Attacco', 'tiro ' + res.roll.total + ' ' + R.fmt(res.bo) + ' − ' + res.bd, res.total);
      S.save(); render();
    },
    fumbleroll: function () {
      var f = P.combat.cb(), st = S.get(), id = f.ft || (f.res && f.res.table && ({ 'TA-1': 'TTM-1', 'TA-2': 'TTM-1', 'TA-3': 'TTM-1', 'TA-10': 'TTM-1', 'TA-4': 'TTM-2', 'TA-11': 'TTM-6', 'TA-7': 'TTM-3', 'TA-8': 'TTM-3' })[f.res.table.id]);
      var tb = P.combat.tableById(P.combat.critList(st), id); if (!need(tb, 'Scegli la tabella dei fallimenti.')) return;
      var raw = dice.closed().total, row = T.lookupCrit(tb, raw);
      f.fres = { raw: raw, row: row }; pushLog('Fallimento (' + tb.id + ') ' + raw + ': ' + row.text); U.showRoll('Fallimento', tb.id, raw); S.save(); render();
    },
    mybd: function () {
      var f = P.combat.cb(), c = S.cur();
      f.bd = String(R.defenseTotal(c, 'bd', 'AG', R.ctx(S.get().settings)) + R.num(c.prot.modbd)); render();
    },
    crit: function (b) {
      var k = b.getAttribute('data-k') || '', f = P.combat.cb(), st = S.get(), letter = f['letter' + k], croll = f['croll' + k];
      var raw = croll !== '' ? R.num(croll) : dice.closed().total;
      var mod = D.CRIT_MOD[letter] || 0, total = raw + mod, tb = P.combat.tableById(P.combat.critList(st), f['ct' + k]);
      f['cres' + k] = { raw: raw, mod: mod, letter: letter, total: total, row: tb ? T.lookupCrit(tb, total) : null };
      pushLog('Critico ' + (k ? 'secondario ' : '') + letter + ': ' + raw + ' ' + R.fmt(mod) + ' = ' + total + (f['cres' + k].row ? ' — ' + f['cres' + k].row.text : ''));
      U.showRoll('Critico ' + letter, raw + ' ' + R.fmt(mod), total); S.save(); render();
    },
    dmgenemy: function () {
      var f = P.combat.cb(), st = S.get(), e = st.enemies.filter(function (x) { return x.id === f.target; })[0];
      if (!need(e, 'Seleziona un avversario.') || !need(f.pf !== '', 'Indica i PF inflitti.')) return;
      e.dmg = R.num(e.dmg) + R.num(f.pf); pushLog(e.n + ' subisce ' + f.pf + ' PF'); S.save(); render();
    },
    dmgme: function () {
      var f = P.combat.cb(), c = S.cur(); if (!need(f.pf !== '', 'Indica i PF inflitti.')) return;
      c.pf.dmg = R.num(c.pf.dmg) + R.num(f.pf); pushLog(c.name + ' subisce ' + f.pf + ' PF'); S.save(); render();
    },
    enadd: function () {
      var e = U.tmp.en || {}; if (!need((e.n || '').trim(), 'Dai un nome all\'avversario.')) return;
      S.get().enemies.push({ id: R.uid(), n: e.n.trim(), max: e.max === undefined ? '' : e.max, dmg: 0 }); U.tmp.en = {}; S.save(); render();
    },
    enhit: function (b) { var e = S.get().enemies[+b.dataset.i]; e.dmg = Math.max(0, R.num(e.dmg) + (+b.dataset.n)); S.save(); render(); },
    target: function (b) { P.combat.cb().target = S.get().enemies[+b.dataset.i].id; },
    clearclog: function () { S.get().clog = []; S.save(); render(); },
    diaryadd: function () {
      var d = S.cur().diary, s = (U.tmp.dn || '').trim(); if (!need(s, 'Scrivi una nota.')) return;
      d.log.unshift({ t: Date.now(), par: d.par, s: s }); U.tmp.dn = ''; S.save(); render();
    },
    flagadd: function () {
      var s = (U.tmp.df || '').trim(); if (!need(s, 'Scrivi il segnalino.')) return;
      S.cur().diary.flags.push(s); U.tmp.df = ''; S.save(); render();
    },
    impatk: function () {
      var im = U.tmp.imp || {}, armors = (im.armors || '').split(',').map(function (x) { return x.trim(); }).filter(Boolean);
      if (!need((im.name || '').trim(), 'Dai un nome alla tabella.') || !need(armors.length, 'Indica i nomi delle colonne di armatura.')) return;
      try {
        var rows = T.parseAttackText(im.text || '', armors.length);
        S.get().atk.push({ id: R.uid(), name: im.name.trim(), armors: armors, fumble: im.fumble === undefined ? '' : im.fumble, rows: rows });
        U.tmp.imp = null; S.save(); render(); U.toast('Tabella importata: ' + rows.length + ' righe.');
      } catch (err) { U.toast(err.message); }
    },
    impcrit: function () {
      var im = U.tmp.imp || {};
      if (!need((im.cname || '').trim(), 'Dai un nome alla tabella.')) return;
      try {
        var rows = T.parseCritText(im.ctext || '');
        S.get().crit.push({ id: R.uid(), name: im.cname.trim(), rows: rows });
        U.tmp.imp = null; S.save(); render(); U.toast('Tabella importata: ' + rows.length + ' righe.');
      } catch (err) { U.toast(err.message); }
    },
    resetsettings: function () { S.get().settings = R.defaultSettings(); S.save(); render(); U.toast('Impostazioni ripristinate.'); },
    healroll: function () {
      var f = U.tmp.heal || (U.tmp.heal = { roll: '', col: '1', sev: 'lieve' }), r = dice.d100();
      f.roll = String(r + R.statBonus(S.cur(), 'CO', R.ctx(S.get().settings))); U.showRoll('Guarigione', 'd100 ' + r + ' + bonus CO', f.roll); render();
    },
    export: function () {
      var blob = new Blob([JSON.stringify(S.get(), null, 1)], { type: 'application/json' }), a = document.createElement('a');
      a.href = URL.createObjectURL(blob); a.download = 'girsa-backup-' + new Date().toISOString().slice(0, 10) + '.json';
      document.body.appendChild(a); a.click(); a.remove(); setTimeout(function () { URL.revokeObjectURL(a.href); }, 1000);
    },
    wipe: function () {
      if (!confirm('Cancellare TUTTI i personaggi, le tabelle e le impostazioni di questo dispositivo?')) return;
      S.replaceAll(S.blank()); render(); U.toast('Dati cancellati.');
    }
  };

  document.addEventListener('click', function (e) {
    var b = e.target.closest ? e.target.closest('[data-act]') : null;
    if (!b || b.tagName === 'INPUT' && b.type !== 'radio' || b.disabled) return;
    var nm = b.getAttribute('data-act'), f = ACT[nm] || (G.acts && G.acts[nm]); if (f) f(b);
  });

  /* ---------- importazione file ---------- */
  function validTable(o) {
    if (!o || typeof o !== 'object' || !Array.isArray(o.rows)) throw new Error('Tabella non valida: mancano le righe.');
    if (o.type === 'attack') {
      if (!Array.isArray(o.armors) || !o.armors.length) throw new Error('Tabella di attacco senza colonne di armatura.');
      T.validateAttackRows(o.rows);
      o.rows.forEach(function (r, i) { if (!Array.isArray(r.cells) || r.cells.length !== o.armors.length) throw new Error('Riga ' + (i + 1) + ': numero di celle diverso dalle colonne.'); });
      return { id: R.uid(), name: String(o.name || 'Senza nome'), armors: o.armors.map(String), fumble: o.fumble == null ? '' : o.fumble, rows: o.rows };
    }
    o.rows.forEach(function (r, i) { if (typeof r.text !== 'string' || typeof r.max !== 'number') throw new Error('Riga ' + (i + 1) + ' dei critici non valida.'); });
    return { id: R.uid(), name: String(o.name || 'Senza nome'), rows: o.rows };
  }
  function importFile(file) {
    if (!file) return;
    var fr = new FileReader();
    fr.onload = function () {
      try {
        var o = JSON.parse(fr.result), st = S.get();
        if (o && Array.isArray(o.chars)) {
          if (!confirm('Sostituire tutti i dati attuali con quelli del file?')) return;
          S.replaceAll(o); render(); U.toast('Backup importato.'); return;
        }
        var arr = Array.isArray(o) ? o : [o], n = 0;
        arr.forEach(function (t) {
          if (t.type === 'attack') { st.atk.push(validTable(t)); n++; } else if (t.type === 'crit') { st.crit.push(validTable(t)); n++; } else throw new Error('Formato non riconosciuto.');
        });
        S.save(); render(); U.toast('Importate ' + n + ' tabelle.');
      } catch (err) { U.toast('Importazione fallita: ' + err.message); }
    };
    fr.readAsText(file);
  }

  /* ---------- avvio ---------- */
  function init() {
    S.load();
    root.addEventListener('hashchange', render);
    render();
    if (!S.ok()) U.toast('Il browser impedisce il salvataggio: usa «Esporta» in Dati.');
    root.addEventListener('pagehide', function () { S.flush(); });
    document.addEventListener('visibilitychange', function () { if (document.hidden) S.flush(); });
    if ('serviceWorker' in navigator && /^https?:$/.test(location.protocol)) {
      navigator.serviceWorker.register('sw.js').catch(function () { });
    }
  }
  if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
  }
  G.app = { render: render, ACT: ACT, validTable: validTable };
})(typeof window !== 'undefined' ? window : globalThis);
