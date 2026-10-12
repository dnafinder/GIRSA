/* Pagina Crea: creazione guidata del personaggio e sviluppo (punti sviluppo, livelli). */
(function (root) {
  'use strict';
  var G = root.GIRSA = root.GIRSA || {};
  var R = G.rules, D = G.data, U = G.ui, S = G.store, C = G.creation, X = G.creationlogic, esc = U.esc;
  var dice = G.dice.dice;
  G.acts = G.acts || {}; G.changes = G.changes || {};

  function T() { return U.tmp.cr || (U.tmp.cr = { rolls: [], assign: {}, from: '', to: '', amt: '1', sk: {}, bgsk: '', bgstat: '', bgstat3: '', bglang: '', bgdef: 'ess', bgpick: '' }); }
  function cr(c) { return X.ensure(c); }
  function person(c) { return X.personById(cr(c).people); }
  function prof(c) { return X.profByName(cr(c).prof || c.prof); }
  function render() { G.app.render(); }
  function say(m) { U.toast(m); }
  function note(c, text) { c.note = (c.note ? c.note + '\n' : '') + text; }
  var STAT_NAME = {}; D.STATS.forEach(function (s) { STAT_NAME[s[0]] = s[1]; });
  var SKILL_NAME = {}; D.SKILLS.forEach(function (s) { SKILL_NAME[s.k] = s.name; });

  /* ---------- scheda di un popolo (usata anche dalla Guida) ---------- */
  function line(label, v) { return v ? '<p class="pl"><b>' + esc(label) + ':</b> ' + esc(v) + '</p>' : ''; }
  function peopleHtml(p) {
    var i = C.PEOPLE.indexOf(p), era = C.ERA[i] || [];
    var h = '<div class="pcard"><h3>' + esc(p.n) + '</h3><p class="hint">' + esc(p.g) + (p.nota ? ' · ' + esc(p.nota) : '') + ' · pagina ' + p.pag + ' del Prospetto sui Popoli</p>' +
      line('Altezza media', p.alt) + line('Peso medio', p.peso) + line('Durata della vita', p.vita) + line('Maturità', p.mat);
    h += '<p class="pl"><b>Abilità e caratteristiche speciali:</b> ' + (p.spec.length ? '' : 'nessuna.') + '</p>' + (p.spec.length ? '<ul>' + p.spec.map(function (s) { return '<li>' + esc(s) + '</li>'; }).join('') + '</ul>' : '');
    h += line('Paure e incapacità', p.paure) + line('Lingue conosciute', p.lingue) + line('Lingue apprendibili in adolescenza', p.lingueAd) +
      line('Professioni consentite', p.prof) + line('Armi comuni', p.armi) + line('Armature comuni', p.arm) + line('Denaro', p.denaro) +
      line('Opzioni di background (' + p.bg + ' punti) · abilità speciali', p.bgAbil) + line('Oggetti', p.bgOgg) +
      line('Abilità primarie tipiche', p.primarie) + line('Abilità secondarie tipiche', p.secondarie) + line('Incrementi alle caratteristiche', p.incr) +
      line('Altre lingue apprendibili', p.altreLingue);
    if (era.length) h += line('Disponibilità temporale', 'Prima Era: ' + era[1] + ' · Seconda Era: ' + era[2] + ' · Terza Era: ' + era[3] + ' · Quarta Era: ' + era[4]);
    return h + '</div>';
  }
  G.peopleHtml = peopleHtml;

  /* ---------- 1. popolo ---------- */
  function stepPeople(c) {
    var k = cr(c), p = person(c), t = T();
    var opts = [['', '(scegli il popolo)']].concat(C.PEOPLE.map(function (x) { return [x.id, x.g + ' — ' + x.n]; }));
    var h = '<section class="card"><h2>1 · Popolo</h2><p class="hint">Scegliendo il popolo l\'app inserisce le modifiche del compendio (TB-3) a caratteristiche e tiri resistenza, il nome del popolo e le lingue conosciute.</p>' +
      U.field('Popolo', U.sel('data-act-change', 'cr_people', k.people, opts, { label: 'Popolo' }));
    if (p) {
      var tb = C.TB3[p.id];
      h += '<p class="hint">Riga TB-3 usata: <b>' + esc(tb) + '</b>' + (p.id === 'numneri' ? ' (il compendio non ha una riga per questo popolo: scelta dell\'app, puoi cambiarla in Scheda → Popolo)' : '') + '.</p>' +
        '<details' + (t.pOpen ? ' open' : '') + '><summary>Scheda completa del popolo</summary>' + peopleHtml(p) + '</details>';
    }
    return h + '</section>';
  }
  G.changes.cr_people = function (v) {
    var c = S.cur(), k = cr(c), p = X.personById(v);
    k.people = v;
    if (!p) { S.save(); render(); return; }
    R.applyPopolo(c, C.TB3[p.id]);
    c.razza = p.n;
    var fs = p.lingue.match(/^[^]*?\)\./);
    c.lingue = p.id === 'silvani' ? 'Silvano/Bethteur (5), Ovestron (4), Quenya (2).' : (fs ? fs[0] : p.lingue);
    if (!c.altezza) c.altezza = p.alt;
    S.save(); render(); say('Popolo applicato: ' + p.n + '.');
  };


  /* ---------- 2. nome (dopo il popolo) ---------- */
  var ND = G.namedata;
  function stepName(c) {
    var k = cr(c), t = T(), pid = k.people, h = '<section class="card"><h2>2 · Nome</h2>';
    if (!pid) return h + '<p class="hint">Scegli prima il popolo: il nome si propone in base a quello.</p></section>';
    var sx = t.nsex || '', nm = ND.nomi(pid, sx), cg = ND.cognomi(pid), tot = ND.nomi(pid, '').length;
    h += U.field('Nome del personaggio', U.inp('data-p', 'name', c.name, { label: 'Nome del personaggio' }));
    if (!tot) {
      return h + '<p class="hint">Per questo popolo le fonti consultate (Tolkien Gateway) non danno nomi: scrivilo tu.</p></section>';
    }
    h += '<div class="grid g2">' + U.field('Proponi nomi', U.sel('data-t', 'cr.nsex', sx, [['', 'maschili e femminili'], ['m', 'maschili'], ['f', 'femminili']], { re: 1, label: 'Genere dei nomi' })) +
      '<div class="fld"><span>&nbsp;</span><button data-act="cr_namerand">Suggeriscine uno</button></div></div>';
    h += '<p class="hint">Sono nomi di personaggi di Tolkien (raccolta da Tolkien Gateway, non dal compendio GIRSA). ' + tot + ' per questo popolo' + (cg.length ? ', più ' + cg.length + ' cognomi' : '') + '. Toccane uno per usarlo.</p>';
    h += '<details><summary>Elenco dei nomi</summary><p class="names">' + nm.map(function (n) { return '<button class="mini" data-act="cr_setname" data-n="' + esc(n) + '">' + esc(n) + '</button>'; }).join(' ') + '</p>' +
      (cg.length ? '<p class="hint">Cognomi:</p><p class="names">' + cg.map(function (n) { return '<button class="mini" data-act="cr_setsur" data-n="' + esc(n) + '">' + esc(n) + '</button>'; }).join(' ') + '</p>' : '') + '</details>';
    return h + '</section>';
  }
  /* Cambia il nome senza ridisegnare la pagina: l'elenco dei nomi resta aperto e si può provare più di un nome. */
  function putName(c, v) {
    c.name = v; S.save();
    var el = document.querySelector('input[data-p="name"]'); if (el) el.value = v;
    G.app.header();
  }
  G.acts.cr_namerand = function () {
    var c = S.cur(), k = cr(c), t = T(), nm = ND.nomi(k.people, t.nsex || ''), cg = ND.cognomi(k.people);
    if (!nm.length) { say('Nessun nome per questo popolo.'); return; }
    var n = nm[Math.floor(Math.random() * nm.length)];
    putName(c, cg.length ? n + ' ' + cg[Math.floor(Math.random() * cg.length)] : n);
  };
  G.acts.cr_setname = function (b) {
    var c = S.cur(), parts = String(c.name || '').trim().split(/\s+/), cg = ND.cognomi(cr(c).people);
    var last = parts.length > 1 && cg.indexOf(parts[parts.length - 1]) >= 0 ? ' ' + parts[parts.length - 1] : '';
    putName(c, b.dataset.n + last);
  };
  G.acts.cr_setsur = function (b) {
    var c = S.cur(), parts = String(c.name || '').trim().split(/\s+/).filter(Boolean), cg = ND.cognomi(cr(c).people);
    if (parts.length > 1 && cg.indexOf(parts[parts.length - 1]) >= 0) parts.pop();
    putName(c, (parts.length ? parts.join(' ') + ' ' : '') + b.dataset.n);
  };
  /* ---------- 2. professione ---------- */
  function profInfo(f, lv) {
    var h = '<p class="hint">Caratteristica fondamentale: <b>' + esc(f.stat.length ? f.stat.join(' / ') : 'legata all\'occupazione') + '</b>' + (f.sec.length ? ' · secondaria: ' + esc(f.sec.join(' / ')) : '') +
      ' · regno: <b>' + esc(f.regno) + '</b> · tipo: ' + ({ P: 'usufruitore puro', I: 'usufruitore ibrido', R: 'usufruitore parziale', N: 'non usufruitore', A: 'altro (non apprende incantesimi)' })[f.tipo] + '</p>';
    h += '<p class="pl"><b>Bonus alla professione per livello:</b> ' + Object.keys(f.b).map(function (k) { return esc(C.BONUS_LABEL[k]) + ' +' + f.b[k]; }).join('; ') + '.</p>';
    h += '<p class="pl"><b>Punti sviluppo per livello:</b> ' + C.PS_CATS.filter(function (x) { return f.ps[x[0]]; }).map(function (x) { return esc(x[1]) + ' ' + f.ps[x[0]]; }).join('; ') + '.</p>';
    return h;
  }
  function stepProf(c) {
    var k = cr(c), p = person(c), t = T();
    var list = p ? X.allowedProfs(p) : C.PROFS.map(function (x) { return x.n; });
    var sel = t.selProf || k.prof || c.prof || '';
    if (list.indexOf(sel) < 0) sel = '';
    var f = X.profByName(sel);
    var h = '<section class="card"><h2>3 · Professione e livello</h2><p class="hint">' + (p ? 'Professioni consentite al popolo «' + esc(p.n) + '»: ' + list.length + '. ' : 'Scegli prima il popolo per vedere solo le professioni consentite. ') + '</p>' +
      '<div class="grid g2">' + U.field('Professione', U.sel('data-t', 'cr.selProf', sel, [['', '(scegli)']].concat(list.map(function (n) { return n; })), { re: 1, label: 'Professione' })) +
      U.field('Livello', U.inp('data-p', 'livello', c.livello, { type: 'number', ph: '1' })) + '</div>';
    if (f) {
      var lv = Math.max(1, Math.floor(R.num(c.livello)) || 1);
      h += profInfo(f, lv);
      if (f.stat.length > 1) h += U.field('Caratteristica principale scelta', U.sel('data-p', 'creation.statP', k.statP || f.stat[0], f.stat.map(function (s) { return [s, STAT_NAME[s]]; })));
      var man = X.profManualBonuses(f, lv);
      if (man.length) h += '<p class="hint">Da applicare a mano (non hanno una riga nella scheda): ' + esc(man.join('; ')) + '.</p>';
      h += '<button data-act="cr_prof">Applica professione e bonus al livello ' + lv + '</button>' +
        '<p class="hint">Scrive nome e regno e inserisce nella colonna «Prof» delle abilità il bonus del livello (TB-4.2). I valori già scritti in quelle colonne vengono sostituiti.</p>';
    }
    if (k.prof) h += '<p class="hint">Professione applicata: <b>' + esc(k.prof) + '</b>.</p>';
    return h + '</section>';
  }
  G.acts.cr_prof = function () {
    var c = S.cur(), t = T(), k = cr(c), name = t.selProf || k.prof || c.prof;
    if (!name) { say('Scegli una professione.'); return; }
    var lv = Math.max(1, Math.floor(R.num(c.livello)) || 1);
    var f = X.profByName(name), n = X.applyProfession(c, name, lv);
    if (f.stat.length > 1 && !k.statP) k.statP = f.stat[0];
    S.save(); render(); say('Professione applicata: ' + name + ', livello ' + lv + '.');
  };

  /* ---------- 3. caratteristiche ---------- */
  function statsTable(c) {
    var cx = R.ctx(S.get().settings), t = T(), h = '<div class="stats">';
    var opts = [['', '—']].concat(t.rolls.map(function (v, i) { return [String(i), String(v)]; }));
    D.STATS.forEach(function (s) {
      var kk = s[0], st = c.stats[kk], cost = kk === 'AS' ? null : R.pointCost(st.score);
      h += '<div class="stat"><div class="stat-h"><b>' + kk + '</b> <span>' + esc(s[1]) + '</span></div><div class="row">' +
        '<label>Valore' + U.inp('data-p', 'stats.' + kk + '.score', st.score, { type: 'number', label: s[1] + ' valore' }) + '</label>' +
        (t.rolls.length && kk !== 'AS' ? '<label>Dai tiri' + U.sel('data-act-change', 'cr_assign:' + kk, t.assign[kk] == null ? '' : String(t.assign[kk]), opts, { label: s[1] + ' da un tiro' }) + '</label>' : '') +
        '<div class="tt">Tot.' + U.calc('st', kk) + '</div></div>' +
        (cost === undefined ? '<div class="warn">Fuori dall\'intervallo 20–100.</div>' : (cost > 90 ? '<div class="tt">costo ' + cost + ' punti</div>' : '')) + '</div>';
    });
    return h + '</div>';
  }
  function stepStats(c) {
    var t = T(), k = cr(c), p = person(c), f = prof(c);
    var h = '<section class="card"><h2>4 · Caratteristiche</h2>' +
      '<p class="hint"><b>Metodo classico</b>: 6 tiri di d100 (si ritira se esce meno di 20) da assegnare alle caratteristiche; se nella caratteristica principale il risultato è meno di 90, diventa 90 (opzione: nella secondaria, meno di 75 diventa 75). ' +
      'Noldor: il valore più alto va a Prontezza; Sindar: a Prontezza uno dei due più alti; Silvani: uno dei tre più alti. <b>Distribuzione di punti</b>: 400 punti, valori da 20 a 100 (oltre 90 il costo è 90 + (valore − 90)²), principale almeno 90, secondaria almeno 75 (opzione), Noldor almeno 90 in Prontezza, Sindar e Silvani almeno 75. ' +
      'Punti spesi: <b data-calc="pts">' + esc(U.calcText('pts')) + '</b>.</p>' +
      '<div class="row"><button data-act="cr_rollstats">Tira 6 valori</button>' +
      (t.rolls.length ? '<button class="ghost" data-act="cr_autoassign">Assegna in automatico</button>' : '') +
      '<button class="ghost" data-act="cr_minimums">Porta i minimi (principale 90)</button><button class="ghost" data-act="cr_aspect">Tira Aspetto</button></div>';
    if (t.rolls.length) h += '<p class="hint">Valori tirati: <b>' + esc(t.rolls.join(', ')) + '</b>. Assegnazione automatica: i due valori più alti a caratteristica principale e secondaria' +
      (p && C.STAT_RULES.elfMin[p.id] ? ' (con la regola del popolo su Prontezza)' : '') + ', gli altri in ordine FR, AG, CO, IN, IT, PR. È una scelta dell\'app: il compendio lascia libero l\'abbinamento.</p>';
    h += statsTable(c);
    var msgs = X.statChecks(c);
    msgs.forEach(function (m) { h += '<div class="warn">' + esc(m) + '</div>'; });
    h += '<p class="hint">Aspetto: si tira 1d100 e si somma il bonus di Prontezza, fino a un massimo di 100. ' + (f && !f.stat.length ? 'Il Cittadino sceglie le caratteristiche in base alla specializzazione. ' : '') +
      'Gli aumenti di caratteristica successivi sono nella Guida.</p>';
    return h + '</section>';
  }
  G.acts.cr_rollstats = function () { var t = T(); t.rolls = X.statRolls(dice.d100, 6).sort(function (a, b) { return b - a; }); t.assign = {}; render(); };
  G.changes['cr_assign'] = function (v, key) {
    var t = T(), c = S.cur();
    if (v === '') { delete t.assign[key]; render(); return; }
    var idx = +v, used = Object.keys(t.assign).filter(function (x) { return x !== key && t.assign[x] === idx; });
    if (used.length) { say('Quel valore è già assegnato a ' + used[0] + '.'); render(); return; }
    t.assign[key] = idx; c.stats[key].score = t.rolls[idx]; S.save(); render();
  };
  G.acts.cr_autoassign = function () {
    var t = T(), c = S.cur(), k = cr(c), p = person(c), f = prof(c);
    if (!t.rolls.length) return;
    var pk = f && f.stat.length ? (k.statP && f.stat.indexOf(k.statP) >= 0 ? k.statP : f.stat[0]) : '';
    var sk = f && f.sec.length ? (f.sec.indexOf(pk) === 0 && f.sec.length > 1 ? f.sec[1] : f.sec[0]) : '';
    if (f && f.stat.length > 1) { var cand = f.sec.filter(function (x) { return x !== pk; }); sk = cand[0] || ''; }
    var order = [], prNeed = p && p.id === 'noldor' ? 0 : p && (p.id === 'sindar' || p.id === 'silvani') ? 1 : -1;
    var slots = {}, avail = t.rolls.map(function (v, i) { return i; });
    function give(stat, pos) { if (slots[stat] != null) return; var i = avail.splice(pos, 1)[0]; slots[stat] = i; }
    if (prNeed === 0) give('PR', 0);
    if (pk && slots[pk] == null) give(pk, 0);
    if (prNeed === 1 && slots.PR == null) give('PR', 0);
    if (sk && slots[sk] == null) give(sk, 0);
    ['FR', 'AG', 'CO', 'IN', 'IT', 'PR'].forEach(function (s) { if (slots[s] == null) give(s, 0); });
    t.assign = slots;
    Object.keys(slots).forEach(function (s) { c.stats[s].score = t.rolls[slots[s]]; });
    S.save(); render(); say('Valori assegnati.');
  };
  G.acts.cr_minimums = function () {
    var c = S.cur(), k = cr(c), f = prof(c), p = person(c), ch = [];
    if (f && f.stat.length) {
      var pk = k.statP && f.stat.indexOf(k.statP) >= 0 ? k.statP : f.stat[0];
      if (R.num(c.stats[pk].score) < 90) { c.stats[pk].score = 90; ch.push(pk + ' → 90'); }
    }
    if (p && C.STAT_RULES.elfMin[p.id]) {
      var e = C.STAT_RULES.elfMin[p.id];
      if (R.num(c.stats[e[0]].score) < e[1]) { c.stats[e[0]].score = e[1]; ch.push(e[0] + ' → ' + e[1]); }
    }
    S.save(); render(); say(ch.length ? 'Portati ai minimi: ' + ch.join(', ') + '.' : 'Nessun valore sotto i minimi.');
  };
  G.acts.cr_aspect = function () {
    var c = S.cur(), r = dice.d100(), pr = R.statBonus(c, 'PR', R.ctx(S.get().settings)), v = X.aspectValue(r, pr);
    c.stats.AS.score = v; S.save(); U.showRoll('Aspetto', 'd100 ' + r + ' ' + R.fmt(pr) + ' (Prontezza, max 100)', v); render();
  };

  /* ---------- 4. background ---------- */
  var SPEC_FX = {
    'Bonus speciale +5': 'skill5', 'Bonus speciale +15 (secondaria)': 'sec15', 'Abile nelle Manovre in Movimento': 'mov10', 'Acuto Osservatore': 'oss10',
    'Riflessi fulminei': 'bd5', 'Carismatico': 'lead10', 'Resistenza': 'tr10'
  };
  function primarySkillOpts(c) {
    var o = [['', '(scegli l\'abilità)']];
    c.skills.forEach(function (s, i) { if (s.cat !== 'sec' && s.name && s.k !== 'adren') o.push([String(i), s.name]); });
    return o;
  }
  function secSkillOpts(c) {
    var o = [['', '(scegli la secondaria)']];
    c.skills.forEach(function (s, i) { if (s.cat === 'sec' && s.name) o.push([String(i), s.name]); });
    return o;
  }
  function bgEntry(c, e, i) {
    var t = T(), fx = e.kind === 'spec' ? SPEC_FX[e.title] : '', h = '<div class="bge"><b>' + esc(e.title) + '</b>' + (e.roll ? ' <span class="dim">· tiro ' + e.roll + ' (' + esc(e.range) + ')</span>' : '') +
      (e.text ? '<br><span class="hint">' + esc(e.text) + '</span>' : '');
    (e.log || []).forEach(function (l) { h += '<br><span class="hint">' + esc(l) + '</span>'; });
    if (e.applied) h += '<br><span class="ok">✔ applicato: ' + esc(e.applied) + '</span>';
    else if (fx) {
      h += '<div class="row">';
      if (fx === 'skill5') h += U.sel('data-t', 'cr.bgsk', t.bgsk, primarySkillOpts(c), { label: 'Abilità' });
      if (fx === 'sec15') h += U.sel('data-t', 'cr.bgsk', t.bgsk, secSkillOpts(c), { label: 'Abilità secondaria' });
      if (fx === 'tr10') h += U.sel('data-t', 'cr.bgdef', t.bgdef, [['ess', 'TR Essenza'], ['fls', 'TR Flusso'], ['men', 'TR Mentalismo'], ['vel', 'TR Veleni'], ['mal', 'TR Malattie']], { label: 'Tiro resistenza' });
      h += '<button class="mini" data-act="cr_bgapply" data-i="' + i + '">Applica alla scheda</button></div>';
    } else if (e.kind === 'den' && !e.applied) {
      h += '<div class="row"><button class="mini" data-act="cr_bgapply" data-i="' + i + '">Aggiungi al denaro</button></div>';
    } else if (e.kind === 'ogg' && !e.applied) {
      h += '<div class="row"><button class="mini" data-act="cr_bgapply" data-i="' + i + '">Aggiungi all\'inventario</button></div>';
    }
    return h + '<button class="mini ghost" data-act="cr_bgdel" data-i="' + i + '" aria-label="Elimina">✕</button></div>';
  }
  function stepBg(c) {
    var k = cr(c), p = person(c), t = T(), pts = p ? p.bg : 0, used = k.bg.length;
    var h = '<section class="card"><h2>5 · Opzioni di background</h2>';
    if (!p) return h + '<p class="hint">Scegli prima il popolo: i punti di background dipendono da lui.</p></section>';
    h += '<p class="hint">Il popolo «' + esc(p.n) + '» ha <b>' + pts + '</b> punt' + (pts === 1 ? 'o' : 'i') + ' di background (usati: ' + used + '). Il GM può far scegliere l\'opzione, farla tirare o sceglierla lui. ' +
      (p.bgAbil ? 'Per questo popolo, abilità speciali: ' + esc(p.bgAbil) : '') + '</p>';
    var bx = C.BGX[p.id] || {};
    if (bx.note) h += '<p class="hint">' + esc(bx.note) + '</p>';
    if (bx.noAdd) h += '<p class="hint">Oggetti: ' + esc(p.bgOgg) + '</p>';
    if (C.BGX[p.id] && !bx.noAdd && p.bgOgg) h += '<p class="hint">Oggetti: ' + esc(p.bgOgg) + '</p>';
    h += '<div class="bgs">' + k.bg.map(function (e, i) { return bgEntry(c, e, i); }).join('') + '</div>';
    if (used < pts) {
      h += '<h3>Usa un punto</h3><div class="row"><button data-act="cr_bgroll" data-kind="spec">Tira: abilità speciale</button><button data-act="cr_bgroll" data-kind="ogg">Tira: oggetto speciale</button><button data-act="cr_bgroll" data-kind="den">Tira: denaro</button></div>';
      h += '<div class="grid g2">' + U.field('Oppure scegli un\'abilità speciale', U.sel('data-t', 'cr.bgpick', t.bgpick, [['', '(scegli)']].concat(C.BG.spec.map(function (r) { return [X.rangeKey(r[0], r[1]), X.rangeKey(r[0], r[1]) + ' · ' + r[2]]; })))) +
        '<div class="fld"><span>&nbsp;</span><button class="ghost" data-act="cr_bgpick">Scegli questa</button></div></div>';
      h += '<div class="grid g2">' +
        U.field('Gradi: +2 a un\'abilità primaria', U.sel('data-t', 'cr.bgsk', t.bgsk, primarySkillOpts(c))) + '<div class="fld"><span>&nbsp;</span><button class="ghost" data-act="cr_bggradi" data-n="2">+2 gradi</button></div>' +
        U.field('Gradi: +5 a un\'abilità secondaria', U.sel('data-t', 'cr.bgsk2', t.bgsk2 || '', secSkillOpts(c))) + '<div class="fld"><span>&nbsp;</span><button class="ghost" data-act="cr_bggradi" data-n="5">+5 gradi</button></div>' +
        U.field('Caratteristiche: +2 a una', U.sel('data-t', 'cr.bgstat', t.bgstat, [['', '(scegli)']].concat(D.STATS.map(function (s) { return [s[0], s[1]]; })))) + '<div class="fld"><span>&nbsp;</span><button class="ghost" data-act="cr_bgstat" data-n="2">+2</button></div>' +
        U.field('Oppure +1 a tre (separate da virgola)', U.inp('data-t', 'cr.bgstat3', t.bgstat3, { ph: 'es. FR, AG, CO' })) + '<div class="fld"><span>&nbsp;</span><button class="ghost" data-act="cr_bgstat" data-n="3">+1 a tre</button></div>' +
        U.field('Lingua a grado 5', U.inp('data-t', 'cr.bglang', t.bglang, { ph: 'es. Sindarin' })) + '<div class="fld"><span>&nbsp;</span><button class="ghost" data-act="cr_bglang">Aggiungi lingua</button></div></div>';
    } else if (pts) h += '<p class="hint">Punti di background esauriti.</p>';
    return h + '</section>';
  }
  function bgFull(c, p) { if (cr(c).bg.length >= p.bg) { say('Punti di background esauriti.'); return true; } return false; }
  function addBg(c, e) { cr(c).bg.push(e); S.save(); render(); }
  G.acts.cr_bgroll = function (b) {
    var c = S.cur(), p = person(c); if (!p || bgFull(c, p)) return;
    var kind = b.dataset.kind, e = kind === 'spec' ? X.rollSpecial(p.id, dice.d100) : kind === 'ogg' ? X.rollObject(dice.d100) : X.rollMoney(dice.d100);
    U.showRoll('Background', e.title, e.roll); addBg(c, e);
  };
  G.acts.cr_bgpick = function () {
    var c = S.cur(), p = person(c), t = T(); if (!p || bgFull(c, p)) return;
    if (!t.bgpick) { say('Scegli un\'abilità speciale.'); return; }
    var x = C.BGX[p.id] || {}, row = null;
    C.BG.spec.forEach(function (r) { if (X.rangeKey(r[0], r[1]) === t.bgpick) row = r; });
    var title = row[2], text = row[3], log = [];
    if (x.rep && x.rep[t.bgpick]) { title = x.rep[t.bgpick][0]; text = x.rep[t.bgpick][1]; log.push('Sostituita per questo popolo.'); }
    if (x.reroll && x.reroll.indexOf(t.bgpick) >= 0) { say('Questo popolo non può avere l\'opzione ' + t.bgpick + ' (da ritirare).'); return; }
    addBg(c, { kind: 'spec', roll: 0, range: t.bgpick, title: title, text: text, log: log });
  };
  G.acts.cr_bggradi = function (b) {
    var c = S.cur(), p = person(c), t = T(), n = +b.dataset.n; if (!p || bgFull(c, p)) return;
    var idx = n === 2 ? t.bgsk : t.bgsk2;
    if (idx === '' || idx == null) { say('Scegli l\'abilità.'); return; }
    var s = c.skills[+idx], r = X.addRanks(c, s.k, n, dice.d);
    addBg(c, { kind: 'gradi', title: '+' + n + ' gradi in ' + s.name, text: 'Gradi ' + r.before + ' → ' + r.after + '.', applied: s.name });
  };
  G.acts.cr_bgstat = function (b) {
    var c = S.cur(), p = person(c), t = T(), n = +b.dataset.n; if (!p || bgFull(c, p)) return;
    var list = n === 2 ? [t.bgstat] : String(t.bgstat3 || '').toUpperCase().split(/[\s,]+/).filter(Boolean);
    var okList = list.filter(function (s) { return c.stats[s] && s !== 'AS'; });
    if ((n === 2 && okList.length !== 1) || (n === 3 && (okList.length !== 3 || new Set(okList).size !== 3))) { say(n === 2 ? 'Scegli la caratteristica.' : 'Scrivi tre sigle diverse (FR, AG, CO, IN, IT, PR).'); return; }
    var add = n === 2 ? 2 : 1;
    okList.forEach(function (s) { c.stats[s].score = Math.min(101, R.num(c.stats[s].score) + add); });
    addBg(c, { kind: 'car', title: n === 2 ? '+2 a ' + okList[0] : '+1 a ' + okList.join(', '), text: '', applied: 'caratteristiche aumentate' });
  };
  G.acts.cr_bglang = function () {
    var c = S.cur(), p = person(c), t = T(); if (!p || bgFull(c, p)) return;
    var l = String(t.bglang || '').trim(); if (!l) { say('Scrivi il nome della lingua.'); return; }
    c.lingue = (c.lingue ? c.lingue + ' ' : '') + l + ' (5).'; t.bglang = '';
    addBg(c, { kind: 'ling', title: 'Lingua: ' + l + ' (5)', text: '', applied: 'aggiunta alle lingue' });
  };
  G.acts.cr_bgdel = function (b) {
    var c = S.cur(), k = cr(c); if (!confirm('Togliere questa voce dal background? Gli effetti già applicati alla scheda non vengono annullati.')) return;
    k.bg.splice(+b.dataset.i, 1); S.save(); render();
  };
  G.acts.cr_bgapply = function (b) {
    var c = S.cur(), k = cr(c), e = k.bg[+b.dataset.i], t = T(); if (!e || e.applied) return;
    function bump(i, v) { var s = c.skills[i]; s.spec = R.num(s.spec) + v; }
    if (e.kind === 'den') { c.denaro = (c.denaro ? c.denaro + ' + ' : '') + e.mo + ' MO'; e.applied = e.mo + ' MO nel denaro'; }
    else if (e.kind === 'ogg') { c.inv.push({ n: e.title, q: '1', note: e.text.slice(0, 160) }); e.applied = 'nell\'inventario'; }
    else {
      var fx = SPEC_FX[e.title];
      if (fx === 'skill5' || fx === 'sec15') {
        if (!t.bgsk) { say('Scegli l\'abilità.'); return; }
        var i = +t.bgsk; bump(i, fx === 'skill5' ? 5 : 15); e.applied = '+' + (fx === 'skill5' ? 5 : 15) + ' a ' + c.skills[i].name;
      } else if (fx === 'mov10') { c.skills.forEach(function (s, i) { if (s.cat === 'mov') bump(i, 10); }); e.applied = '+10 a tutte le manovre in movimento'; }
      else if (fx === 'oss10') { ['percez', 'tracce'].forEach(function (key) { bump(X.skillIdx(c, key), 10); }); e.applied = '+10 a Percezione e Seguire tracce'; }
      else if (fx === 'bd5') { c.defs.bd.extra = R.num(c.defs.bd.extra) + 5; e.applied = '+5 al BD (il +5 al BO va aggiunto all\'arma, a mano)'; }
      else if (fx === 'lead10') { c.defs.lead.extra = R.num(c.defs.lead.extra) + 10; e.applied = '+10 alla leadership'; }
      else if (fx === 'tr10') { c.defs[t.bgdef].extra = R.num(c.defs[t.bgdef].extra) + 10; e.applied = '+10 al TR scelto'; }
    }
    S.save(); render();
  };

  /* ---------- 5. adolescenza ---------- */
  function stepAdol(c) {
    var k = cr(c), p = person(c), h = '<section class="card"><h2>6 · Adolescenza</h2>';
    if (!p) return h + '<p class="hint">Scegli prima il popolo.</p></section>';
    var t = X.adolescenceOf(p.id), plan = X.adolescencePlan(p.id);
    h += '<p class="hint">Gradi appresi prima della professione (TGP-5) per il popolo «' + esc(p.n) + '».</p><div class="chips">' +
      plan.map(function (x) { return '<span class="chip2">' + esc(SKILL_NAME[x.key] || x.key) + ' <b>' + x.ranks + '</b></span>'; }).join('') + '</div>';
    h += '<p class="hint">Lingue addizionali: <b>' + t.lingue + '</b> gradi da distribuire (massimo 5 per lingua; si possono portare a 5 le lingue del popolo o impararne di nuove) · punti background: <b>' + t.bgpunti + '</b> · probabilità di aver imparato una porzione di lista di incantesimi: <b>' + t.lista + '%</b>.</p>';
    h += '<div class="row"><button data-act="cr_adol">Applica i gradi di adolescenza</button><button class="ghost" data-act="cr_adolspell">Tira la lista di incantesimi (' + t.lista + '%)</button></div>';
    h += '<p class="hint">Applicare imposta i gradi delle abilità elencate (quelli già scritti in quelle righe vengono sostituiti). Per la Resistenza fisica l\'app tira i dadi della progressione (d10 per i gradi 1–10, d4 per i gradi 11–20, TB-4) e salva il bonus nella riga.</p>';
    if (k.adol === p.id) h += '<p class="hint ok">✔ Gradi di adolescenza applicati.</p>';
    if (k.spellRoll) h += '<p class="hint">Lista di incantesimi: ' + esc(k.spellRoll) + '</p>';
    return h + '</section>';
  }
  G.acts.cr_adol = function () {
    var c = S.cur(), p = person(c); if (!p) return;
    if (cr(c).adol === p.id && !confirm('I gradi di adolescenza sono già stati applicati: riapplicarli sostituisce di nuovo i gradi di quelle abilità. Procedere?')) return;
    var n = X.applyAdolescence(c, p.id, dice.d); S.save(); render(); say('Gradi di adolescenza applicati a ' + n + ' abilità.');
  };
  G.acts.cr_adolspell = function () {
    var c = S.cur(), p = person(c), k = cr(c); if (!p) return;
    var t = X.adolescenceOf(p.id), r = dice.d100(), ok = r <= t.lista;
    k.spellRoll = 'tiro ' + r + ' contro ' + t.lista + ': ' + (ok ? 'hai imparato una porzione di lista. Puoi sceglierla dopo aver deciso la professione, entro le restrizioni di popolo e professione.' : 'nessuna lista appresa.');
    U.showRoll('Lista di incantesimi', 'd100 contro ' + t.lista, r); S.save(); render();
  };

  /* ---------- 6. punti sviluppo ---------- */
  function stepPs(c) {
    var k = cr(c), f = prof(c), t = T();
    var h = '<section class="card"><h2>Punti sviluppo e livelli</h2>';
    if (!f) return h + '<p class="hint">Scegli e applica la professione.</p></section>';
    h += '<p class="hint">Ogni livello (e alla creazione) hai i punti della tabella TGP-4 per la professione. Un grado in un\'abilità costa 1 PS, due gradi 3 PS; nessuna abilità sale più di due gradi per livello. ' +
      'Manovre in movimento: 1 PS per grado, senza limite. Si possono trasferire PS tra categorie: ogni PS ottenuto costa 2 PS se la professione ha già almeno 1 PS in quella categoria, altrimenti 4; Arti marziali sempre 2 a 1; ' +
      'Percezione si paga con PS di altre categorie a 1 a 1.</p>';
    var cats = C.PS_CATS.filter(function (x) { return f.ps[x[0]] || X.psPool(c, x[0]) !== 0; }).concat([['perc', 'Percezione (da altre categorie)']]);
    h += '<div class="scroll"><table class="sk"><thead><tr><th class="l">Categoria</th><th>Base</th><th>Disponibili</th><th>Spendi</th></tr></thead><tbody>';
    cats.forEach(function (x) {
      var ck = x[0], pool = X.psPool(c, ck), skills = (C.PS_SKILLS[ck] || []).map(function (key) { return X.skillIdx(c, key); }).filter(function (i) { return i >= 0 && (c.skills[i].cat !== 'sec' || c.skills[i].name); });
      if (ck === 'perc') skills = [X.skillIdx(c, 'percez')];
      if (ck === 'sec') skills = c.skills.map(function (s, i) { return s.cat === 'sec' && s.name ? i : -1; }).filter(function (i) { return i >= 0; });
      var opts = skills.map(function (i) { return [String(i), c.skills[i].name]; });
      var selv = t.sk[ck] != null && opts.some(function (o) { return o[0] === String(t.sk[ck]); }) ? String(t.sk[ck]) : (opts[0] ? opts[0][0] : '');
      h += '<tr><td class="l">' + esc(x[1]) + '</td><td>' + (f.ps[ck] || 0) + '</td><td><b>' + pool + '</b></td><td>';
      if (skills.length) {
        h += '<div class="row nm0">' + (skills.length > 1 ? U.sel('data-tc', 'cr.sk.' + ck, selv, opts, { cls: 'ps', label: 'Abilità ' + x[1] }) : '<span class="dim">' + esc(opts[0][1]) + '</span>') +
          '<button class="mini" data-act="cr_raise" data-cat="' + ck + '" data-n="1" data-sk="' + selv + '">+1 grado</button>' +
          (ck === 'mov' ? '<button class="mini" data-act="cr_raise" data-cat="' + ck + '" data-n="2" data-sk="' + selv + '">+2 gradi</button>' : '<button class="mini" data-act="cr_raise" data-cat="' + ck + '" data-n="2" data-sk="' + selv + '">+2 gradi (3 PS)</button>') + '</div>';
      } else {
        h += '<div class="row nm0"><button class="mini" data-act="cr_spend" data-cat="' + ck + '" data-n="1">−1 PS</button><button class="mini" data-act="cr_spend" data-cat="' + ck + '" data-n="3">−3 PS</button><span class="hint">' + (ck === 'ling' ? 'Lingue: aggiornale nel campo Lingue' : ck === 'liste' ? 'Liste: annotale tra gli incantesimi' : 'segna la spesa') + '</span></div>';
      }
      h += '</td></tr>';
    });
    h += '</tbody></table></div>';
    h += '<h3>Trasferire punti</h3><div class="grid g3">' +
      U.field('Da', U.sel('data-t', 'cr.from', t.from, [['', '(categoria)']].concat(C.PS_CATS.map(function (x) { return [x[0], x[1]]; })))) +
      U.field('A', U.sel('data-t', 'cr.to', t.to, [['', '(categoria)'], ['perc', 'Percezione']].concat(C.PS_CATS.map(function (x) { return [x[0], x[1]]; })))) +
      U.field('PS da ottenere', U.inp('data-t', 'cr.amt', t.amt, { type: 'number' })) + '</div>' +
      '<div class="row"><button class="ghost" data-act="cr_transfer">Trasferisci</button></div>';
    var man = X.profManualBonuses(f, Math.max(1, Math.floor(R.num(c.livello)) || 1));
    h += '<div class="row"><button data-act="cr_newlevel">Passa al livello ' + ((Math.floor(R.num(c.livello)) || 0) + 1) + '</button></div>' +
      '<p class="hint">Il passaggio di livello azzera la spesa dei punti sviluppo e ricalcola i bonus di professione (TB-4.2). I PF del nuovo livello e l\'esperienza non sono nei documenti: aggiornali a mano.' +
      (man.length ? ' Da aggiornare a mano: ' + esc(man.join('; ')) + '.' : '') + '</p>';
    return h + '</section>';
  }
  G.acts.cr_raise = function (b) {
    var c = S.cur(), t = T(), cat = b.dataset.cat, n = +b.dataset.n, sk = t.sk[cat] != null ? t.sk[cat] : b.dataset.sk;
    var f = X.profByName(cr(c).prof || c.prof); if (!f) { say('Scegli la professione.'); return; }
    var i = +sk; if (isNaN(i) || !c.skills[i]) { say('Scegli l\'abilità.'); return; }
    var r = X.raiseSkill(c, cat, c.skills[i].k, n, dice.d);
    if (!r.ok) { say(r.msg); return; }
    S.save(); render(); say(c.skills[i].name + ': ' + r.before + ' → ' + r.after + ' gradi (−' + r.cost + ' PS).');
  };
  G.acts.cr_spend = function (b) {
    var c = S.cur(), r = X.spendPlain(c, b.dataset.cat, +b.dataset.n); if (!r.ok) { say(r.msg); return; } S.save(); render();
  };
  G.acts.cr_transfer = function () {
    var c = S.cur(), t = T(), r = X.transfer(c, t.from, t.to, Math.floor(R.num(t.amt)));
    if (!r.ok) { say(r.msg); return; } S.save(); render(); say('Trasferiti: costo ' + r.cost + ' PS.');
  };
  G.acts.cr_newlevel = function () {
    var c = S.cur(); if (!confirm('Passare al livello ' + ((Math.floor(R.num(c.livello)) || 0) + 1) + '? La spesa dei punti sviluppo si azzera e i bonus di professione si ricalcolano.')) return;
    var lv = X.newLevel(c); S.save(); render(); say('Ora sei al livello ' + lv + '.');
  };

  function render_() {
    var c = S.cur();
    return '<section class="card"><p class="hint">Percorso di creazione del personaggio «' + esc(c.name) + '», nell\'ordine del compendio. Ogni passo scrive nella scheda; puoi tornare indietro e rifare. ' +
      'Il compendio non dà tabelle per i PF iniziali: scrivili in Scheda.</p></section>' +
      stepPeople(c) + stepName(c) + stepProf(c) + stepStats(c) + stepBg(c) + stepAdol(c) +
      '<section class="card"><p class="hint">Crescita del personaggio (punti sviluppo, nuovi livelli): <a href="#/develop">pagina Sviluppa</a>.</p></section>';
  }
  function develop_() {
    var c = S.cur();
    return '<section class="card"><p class="hint">Sviluppo di «' + esc(c.name) + '»: punti sviluppo, gradi alle abilità, trasferimenti tra categorie e passaggio di livello. La creazione (popolo, nome, professione, caratteristiche, background, adolescenza) è in <a href="#/create">Crea</a>.</p></section>' + stepPs(c);
  }
  G.pages.create = { render: render_ };
  G.pages.develop = { render: develop_ };
})(typeof window !== 'undefined' ? window : globalThis);
