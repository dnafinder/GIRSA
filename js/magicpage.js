/* Schede del Combattimento per la magia e l'iniziativa (la logica è in magic.js). */
(function (root) {
  'use strict';
  var G = root.GIRSA = root.GIRSA || {};
  var R = G.rules, U = G.ui, S = G.store, M = G.magic, dice = G.dice.dice, esc = U.esc;
  G.acts = G.acts || {};

  function sp() {
    return U.tmp.sp || (U.tmp.sp = { realm: 'ess', col: '0', skill: '', bo: '', dist: '0', prep: '0', half: false, stat: false, cover: '', extra: '', roll: '',
      alvl: '', tlvl: '', trb: '', consent: false, same: false, troll: '', res: null, tr: null });
  }
  function ini() {
    return U.tmp.ini || (U.tmp.ini = { skill: '', bmm: '', surprised: false, hurt: false, poleFar: false, poleNear: false, twoHands: false, misc: '', roll: '', res: null });
  }
  function tf() { return U.tmp.tf || (U.tmp.tf = { clvl: '', slvl: '', rounds: '', instant: false, res: null }); }
  function rg() { return U.tmp.rg || (U.tmp.rg = { base: '', m: '', shown: false }); }
  function realm(id) { var r = null; M.REALMS.forEach(function (x) { if (x.id === id) r = x; }); return r || M.REALMS[0]; }
  function render() { G.app.render(); }
  function skillOpts(c, cats) {
    var cx = R.ctx(S.get().settings), out = [['', '(a mano)']];
    c.skills.forEach(function (s, i) { if (s.name && cats.indexOf(s.cat) >= 0) out.push([String(i), s.name + ' (' + R.fmt(R.skillTotal(c, i, cx)) + ')']); });
    return out;
  }

  function spellHtml() {
    var f = sp(), c = S.cur(), rl = realm(f.realm);
    var cols = rl.cols.map(function (x) { return [String(x[0]), x[1]]; });
    if (!rl.cols.some(function (x) { return String(x[0]) === f.col; })) f.col = '0';
    var alvl = f.alvl !== '' ? f.alvl : (c.livello || '');
    var h = '<section class="card"><h2>Incantesimo di Attacco Base (TA-9) e tiro resistenza</h2>' +
      '<p class="hint">Si tira 1d100 + Bonus Offensivo Base + modificatori e si legge la TA-9 nella colonna del regno e della protezione del bersaglio. Il numero ottenuto è il modificatore al tiro resistenza del bersaglio; «F» è un fallimento (tira sulla TTM-3). ' +
      'La colonna «Generale» è letta come quella da usare quando il bersaglio non ha nessuna delle protezioni elencate: il compendio non lo scrive in modo esplicito.</p>' +
      '<div class="grid g2">' + U.field('Regno', U.sel('data-t', 'sp.realm', f.realm, M.REALMS.map(function (x) { return [x.id, x.n]; }), { re: 1 })) +
      U.field('Protezione del bersaglio', U.sel('data-t', 'sp.col', f.col, cols)) +
      U.field('BO Incantesimi Base dalla scheda', U.sel('data-t', 'sp.skill', f.skill, skillOpts(c, ['mag', 'arm', 'ama']), { re: 1 })) +
      (f.skill === '' ? U.field('BO a mano', U.inp('data-t', 'sp.bo', f.bo, { type: 'number' })) : '') +
      U.field('Distanza', U.sel('data-t', 'sp.dist', f.dist, M.DIST.map(function (x) { return [String(x[0]), x[1]]; }))) +
      U.field('Preparazione', U.sel('data-t', 'sp.prep', f.prep, M.PREP.map(function (x) { return [String(x[0]), x[1]]; }))) +
      U.field('Bonus di copertura del bersaglio (si sottrae)', U.inp('data-t', 'sp.cover', f.cover, { type: 'number' })) +
      U.field('Altri modificatori', U.inp('data-t', 'sp.extra', f.extra, { type: 'number' })) +
      U.field('Tiro già fatto (vuoto = tira l\'app)', U.inp('data-t', 'sp.roll', f.roll, { type: 'number' })) + '</div><div class="mods">' +
      U.check('data-tc', 'sp.half', f.half, 'L\'attaccante ha perso più della metà dei PF (−10)') +
      U.check('data-tc', 'sp.stat', f.stat, 'Bersaglio statico: colto di sorpresa o prono, senza riparo (+10)') + '</div>' +
      '<div class="row"><button class="big" data-act="sp_cast">Tira l\'incantesimo</button></div>';
    var r = f.res;
    if (r) {
      h += '<div class="res"><div>Tiro ' + (r.roll.rolls.length > 1 ? r.roll.rolls.join(', ') + ' = ' : '') + '<b>' + r.roll.total + '</b> + BO ' + R.fmt(r.bo) + ' ' + R.fmt(r.mods) + ' = <b class="big">' + r.total + '</b>' +
        (r.out.ti ? ' · riga «TI» del tiro non modificato (' + r.roll.first + ')' : r.out.clamped ? ' · letto come ' + Math.min(95, Math.max(3, r.total)) + ' (limite 3–95)' : '') + '</div>' +
        (r.out.fail ? '<div class="warn"><b>Fallimento dell\'incantesimo</b>: tira sulla tabella dei fallimenti TTM-3 (nel blocco «Attacco», scegli l\'arma o la tabella e usa «Tira il fallimento»).</div>'
          : '<div class="hit">Modificatore al TR del bersaglio: <b>' + R.fmt(r.out.mod) + '</b></div>') + '</div>';
      if (!r.out.fail) {
        h += '<h3>Tiro resistenza del bersaglio</h3><div class="grid g3">' +
          U.field('Livello d\'attacco (livello di chi lancia)', U.inp('data-t', 'sp.alvl', f.alvl, { type: 'number', ph: String(alvl) })) +
          U.field('Livello del bersaglio', U.inp('data-t', 'sp.tlvl', f.tlvl, { type: 'number' })) +
          U.field('Bonus TR del bersaglio (regno dell\'incantesimo)', U.inp('data-t', 'sp.trb', f.trb, { type: 'number' })) + '</div><div class="mods">' +
          U.check('data-tc', 'sp.consent', f.consent, 'Bersaglio cosciente e consenziente (−50, livello 1)') +
          U.check('data-tc', 'sp.same', f.same, 'Bersaglio dello stesso regno dell\'incantesimo (+15)') + '</div>' +
          U.field('Tiro del bersaglio già fatto (vuoto = tira l\'app)', U.inp('data-t', 'sp.troll', f.troll, { type: 'number' })) +
          '<div class="row"><button data-act="sp_tr">Tira il TR del bersaglio</button></div>';
        if (f.tr) {
          var t = f.tr;
          h += '<div class="res">Livelli: attacco ' + t.a + ', bersaglio ' + t.t + ' → serve almeno <b>' + t.need + '</b> (TRR).<div>Tiro ' + t.roll + ' + bonus ' + R.fmt(t.bonus) + ' + modificatore ' + R.fmt(t.mod) + (t.misc ? ' ' + R.fmt(t.misc) : '') + ' = <b class="big">' + t.total + '</b></div>' +
            '<div class="' + (t.ok ? 'hit' : 'warn') + '">' + (t.ok ? 'Il bersaglio <b>resiste</b>.' : 'Il bersaglio <b>non resiste</b>: l\'incantesimo ha effetto.') + '</div></div>';
        }
      }
    }
    return h + '</section>';
  }

  function iniHtml() {
    var f = ini(), c = S.cur();
    var h = '<section class="card"><h2>Tiro iniziativa</h2><p class="hint">1d100 + 2 × bonus alle Manovre in Movimento + modificatori; a parità si agisce in contemporanea. Il tiro si ripete solo se cambiano le condizioni.</p>' +
      '<div class="grid g2">' + U.field('Manovre in movimento dalla scheda', U.sel('data-t', 'ini.skill', f.skill, skillOpts(c, ['mov']), { re: 1 })) +
      (f.skill === '' ? U.field('Bonus Manovre in Movimento a mano', U.inp('data-t', 'ini.bmm', f.bmm, { type: 'number' })) : '') +
      U.field('Varie', U.inp('data-t', 'ini.misc', f.misc, { type: 'number' })) +
      U.field('Tiro già fatto (vuoto = tira l\'app)', U.inp('data-t', 'ini.roll', f.roll, { type: 'number' })) + '</div><div class="mods">' +
      U.check('data-tc', 'ini.surprised', f.surprised, 'Sorpreso (−20)') + U.check('data-tc', 'ini.hurt', f.hurt, 'Ha perso più del 50% dei PF (−20)') +
      U.check('data-tc', 'ini.poleFar', f.poleFar, 'Arma ad asta, nemico a più di 3 m (+25, di solito solo il primo turno)') +
      U.check('data-tc', 'ini.poleNear', f.poleNear, 'Arma ad asta, nemico a meno di 3 m (−10)') + U.check('data-tc', 'ini.twoHands', f.twoHands, 'Arma a due mani (−5)') + '</div>' +
      '<p class="hint">Il bonus alle Manovre in Movimento raddoppia anche se negativo. Le armi hanno talvolta un modificatore all\'iniziativa nelle note (Scheda → Armi, catalogo): inseriscilo in «Varie».</p>' +
      '<div class="row"><button data-act="ini_roll">Tira l\'iniziativa</button></div>';
    if (f.res) h += '<div class="res">Tiro <b>' + f.res.roll + '</b> + 2 × ' + R.fmt(f.res.bmm) + ' + modificatori = <b class="big">' + f.res.total + '</b></div>';
    return h + '</section>';
  }

  function tfiHtml() {
    var f = tf(), cl = f.clvl !== '' ? f.clvl : S.cur().livello, cls = cl !== '' && cl != null && f.slvl !== '' ? M.spellClass(cl, f.slvl) : null;
    var h = '<section class="card"><h2>Incantesimo inoffensivo (TFI)</h2><p class="hint">Per gli incantesimi di tipo E, U e I senza TR: tiro aperto di 1d100, riesce se il risultato supera la percentuale di fallimento (minimo 02%). ' +
      'Classe III: tempo normale; classe II: considerato già preparato da 1 round; classe I: da 2 round. Indica tu i round di preparazione che contano: il compendio non dice se i round già «gratis» della classe si sommano a quelli che dedichi, e l\'app non lo decide per te.</p>' +
      '<div class="grid g3">' + U.field('Livello del personaggio', U.inp('data-t', 'tf.clvl', f.clvl, { type: 'number', ph: String(S.cur().livello || '') })) +
      U.field('Livello dell\'incantesimo', U.inp('data-t', 'tf.slvl', f.slvl, { type: 'number' })) +
      U.field('Round di preparazione (0, 1, 2 o più)', U.inp('data-t', 'tf.rounds', f.rounds, { type: 'number' })) + '</div>' +
      (cls ? '<p class="hint">Classe dell\'incantesimo: <b>' + cls + '</b>.</p>' : '') + U.check('data-tc', 'tf.instant', f.instant, 'Incantesimo istantaneo (sempre 02%)') +
      '<div class="row"><button data-act="tf_roll">Tira il lancio</button></div>';
    if (f.res) h += '<div class="res">Fallimento ' + f.res.pct + '% · tiro <b>' + f.res.roll + '</b> → <b>' + (f.res.roll > f.res.pct ? 'riuscito' : 'fallito') + '</b></div>';
    return h + '</section>';
  }
  function rangeHtml() {
    var f = rg(), res = f.base !== '' && f.m !== '' ? M.range(f.base, f.m) : null;
    var h = '<section class="card"><h2>Gittata (TSC-5)</h2><div class="grid g2">' +
      U.field('Gittata base dell\'arma', U.sel('data-t', 'rg.base', f.base, [['', '(scegli)']].concat(G.combatdata.tsc5.map(function (x) { return [String(x.base), String(x.base)]; })), { re: 1 })) +
      U.field('Distanza del bersaglio (m)', U.inp('data-t', 'rg.m', f.m, { type: 'number' })) + '</div>' +
      '<div class="row"><button class="ghost" data-act="rg_calc">Calcola la penalità</button></div>';
    if (f.shown && res) h += '<div class="res">' + (res.pen === null ? '<b>Oltre la gittata massima.</b>' : 'Fascia <b>' + ['corta', 'media', 'lunga', 'massima'][res.band] + '</b>: penalità al BO <b>' + R.fmt(res.pen) + '</b> (si inserisce in «Altri modificatori»).') + '</div>';
    return h + '<p class="hint">La gittata base delle armi da lancio sale di 1 ogni +5 del bonus in Forza: aggiungila tu alla base. Ai limiti tra due fasce la tabella indica lo stesso numero in entrambe: l\'app usa la fascia più vicina.</p></section>';
  }

  function num(v) { return v === '' || v == null ? 0 : (+v || 0); }

  G.acts.sp_cast = function () {
    var f = sp(), c = S.cur(), st = S.get(), cx = R.ctx(st.settings);
    var bo = f.skill !== '' ? R.skillTotal(c, +f.skill, cx) : num(f.bo);
    var r = f.roll !== '' ? { first: num(f.roll), total: num(f.roll), rolls: [num(f.roll)], dir: '' } : dice.open(st.settings.dice);
    var mods = num(f.dist) + num(f.prep) + (f.half ? -10 : 0) + (f.stat ? 10 : 0) - num(f.cover) + num(f.extra);
    var total = r.total + bo + mods, out = M.ta9(r.first, total, +f.col);
    f.res = { roll: r, bo: bo, mods: mods, total: total, out: out }; f.tr = null;
    U.logLine(st.clog, 'Incantesimo base ' + total + (out.fail ? ' → FALLIMENTO' : ' → modificatore al TR ' + R.fmt(out.mod)));
    U.showRoll('Incantesimo base', 'tiro ' + r.total + ' ' + R.fmt(bo) + ' ' + R.fmt(mods), total); S.save(); render();
  };
  G.acts.sp_tr = function () {
    var f = sp(), c = S.cur(), st = S.get(); if (!f.res || f.res.out.fail) return;
    var a = Math.floor(num(f.alvl !== '' ? f.alvl : c.livello)) || 1, t = f.consent ? 1 : (Math.floor(num(f.tlvl)) || 1);
    var need = M.trr(a, t), roll = f.troll !== '' ? num(f.troll) : dice.open(st.settings.dice).total;
    var misc = (f.consent ? -50 : 0) + (f.same ? 15 : 0), bonus = num(f.trb), mod = f.res.out.mod, total = roll + bonus + mod + misc;
    f.tr = { a: a, t: t, need: need, roll: roll, bonus: bonus, mod: mod, misc: misc, total: total, ok: total >= need };
    U.logLine(st.clog, 'TR del bersaglio ' + total + ' contro ' + need + (f.tr.ok ? ': resiste' : ': non resiste'));
    U.showRoll('TR bersaglio', 'tiro ' + roll + ' ' + R.fmt(bonus) + ' ' + R.fmt(mod), total); S.save(); render();
  };
  G.acts.tf_roll = function () {
    var f = tf(), st = S.get(), c = S.cur(); f.res = null;
    var pct = M.tfi(num(f.rounds), f.instant), roll = dice.open(st.settings.dice).total;
    f.res = { pct: pct, roll: roll };
    U.logLine(st.clog, 'Incantesimo inoffensivo: ' + roll + ' contro ' + pct + '% → ' + (roll > pct ? 'riuscito' : 'fallito')); U.showRoll('Incantesimo inoffensivo', pct + '%', roll); S.save(); render();
  };
  G.acts.rg_calc = function () { rg().shown = true; render(); };
  G.acts.ini_roll = function () {
    var f = ini(), c = S.cur(), st = S.get(), cx = R.ctx(st.settings);
    var bmm = f.skill !== '' ? R.skillTotal(c, +f.skill, cx) : num(f.bmm), roll = f.roll !== '' ? num(f.roll) : dice.closed().total;
    var total = M.initiative(roll, { bmm: bmm, surprised: f.surprised, hurt: f.hurt, poleFar: f.poleFar, poleNear: f.poleNear, twoHands: f.twoHands, misc: num(f.misc) });
    f.res = { roll: roll, bmm: bmm, total: total };
    U.logLine(st.clog, 'Iniziativa ' + total); U.showRoll('Iniziativa', 'tiro ' + roll, total); S.save(); render();
  };

  G.magicpage = { html: function () { return iniHtml() + spellHtml() + tfiHtml() + rangeHtml(); } };
})(typeof window !== 'undefined' ? window : globalThis);
