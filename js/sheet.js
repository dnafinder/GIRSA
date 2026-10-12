/* Pagina Scheda. */
(function (root) {
  'use strict';
  var G = root.GIRSA = root.GIRSA || {};
  var R = G.rules, D = G.data, U = G.ui, S = G.store, esc = U.esc;

  function identity(c) {
    var f = function (label, path, o) { return U.field(label, U.inp('data-p', path, S.getPath(c, path), o)); };
    return '<section class="card"><h2>Personaggio</h2><div class="grid g2">' +
      f('Nome', 'name') + f('Professione', 'prof') +
      U.field('Popolo', U.sel('data-act-change', 'popolo', c.popolo, [['', '(scegli)']].concat(D.POPOLI.map(function (p) { return p.n; })), { label: 'Popolo' })) +
      U.field('Sesso', U.sel('data-p', 'sesso', c.sesso || '', [['', '—'], ['m', 'Maschile'], ['f', 'Femminile']], { label: 'Sesso' })) + f('Regno / origine', 'regno') + f('Livello', 'livello', { type: 'number' }) + f('Punti esperienza', 'px', { type: 'number' }) +
      f('Altezza e corporatura', 'altezza') + f('Capelli', 'capelli') + f('Occhi', 'occhi') + f('Lingue', 'lingue') +
      f('Temperamento', 'temperamento') + f('Segni particolari', 'segni') + f('Reputazione', 'reputazione') + f('Denaro', 'denaro') +
      '</div><p class="hint">Soglia PE del livello indicato (tabella TE-5): <b data-calc="lvl">' + esc(U.calcText('lvl')) +
      '</b>. Il testo del compendio non chiarisce se sia la soglia per raggiungere il livello o per lasciarlo: ricontrolla sul manuale.</p>' +
      (c.popolo ? '<p class="hint">Popolo applicato: modifiche TB-3 a caratteristiche e tiri resistenza già inserite nelle colonne «Popolo» e «Mod. popolo».</p>' : '') +
      '</section>';
  }

  function stats(c) {
    var cx = R.ctx(S.get().settings);
    var h = '<section class="card"><h2>Caratteristiche</h2><p class="hint">Punti spesi: <b data-calc="pts">' + esc(U.calcText('pts')) +
      '</b> · riserva ' + U.inp('data-p', 'pool', c.pool, { type: 'number', cls: 'tiny', label: 'Riserva punti' }) +
      '. Aspetto non si paga: il suo bonus è quello di Prontezza.</p><div class="stats">';
    D.STATS.forEach(function (s) {
      var k = s[0], st = c.stats[k], tb = R.tableBonus(st.score, cx.tb1);
      var cost = R.pointCost(st.score);
      h += '<div class="stat"><div class="stat-h"><b>' + k + '</b> <span>' + esc(s[1]) + '</span></div>' +
        '<div class="row"><label>Valore' + U.inp('data-p', 'stats.' + k + '.score', st.score, { type: 'number', label: s[1] + ' valore' }) + '</label>' +
        '<label>Bonus' + '<input data-p="stats.' + k + '.bonus" data-bph="' + k + '" type="number" step="any" inputmode="decimal" value="' + esc(st.bonus) +
        '" placeholder="' + (tb == null ? '' : esc(R.fmt(tb))) + '" aria-label="' + esc(s[1]) + ' bonus a mano"></label>' +
        '<label>Popolo' + U.inp('data-p', 'stats.' + k + '.razza', st.razza, { type: 'number', label: s[1] + ' bonus popolo' }) + '</label>' +
        '<div class="tt">Tot.' + U.calc('st', k) + '</div></div>' +
        (cost === undefined ? '<div class="warn">Fuori dall\'intervallo 20–100 della distribuzione punti.</div>' : '') + '</div>';
    });
    return h + '</div><p class="hint">Il bonus a mano, se compilato, sostituisce quello della tabella TB-1.</p></section>';
  }

  function pf(c) {
    return '<section class="card"><h2>Punti ferita</h2><div class="grid g3">' +
      U.field('PF massimi', U.inp('data-p', 'pf.max', c.pf.max, { type: 'number' })) +
      U.field('Danno subito', U.inp('data-p', 'pf.dmg', c.pf.dmg, { type: 'number' })) +
      '<div class="fld"><span>Stato</span><b class="pfbig" data-calc="pf" data-state="' + R.pfInfo(c).state + '">' + esc(U.calcText('pf')) + '</b></div></div>' +
      '<p class="hint">Morte quando il danno raggiunge i PF massimi più il punteggio di Costituzione. I pulsanti PF in alto modificano il danno subito.</p></section>';
  }

  function skillRow(c, i) {
    var s = c.skills[i], m = R.meta(s), free = s.cat === 'sec' || s.k === 'arm_x';
    var label = free ? U.inp('data-p', 'skills.' + i + '.name', s.name, { ph: 'Abilità', label: 'Nome abilità' }) : '<span class="nm">' + esc(s.name) + (m.tag ? ' <i class="tag">' + m.tag + '</i>' : '') + '</span>';
    var stat = m.noStat ? '<span class="dim">–</span>' : U.sel('data-p', 'skills.' + i + '.stat', s.stat, [['', '–']].concat(D.STATS.map(function (x) { return x[0]; })), { cls: 'sm', label: 'Caratteristica' });
    var ranks = m.noRanks ? '<span class="dim">–</span>' : U.inp('data-p', 'skills.' + i + '.ranks', s.ranks, { type: 'number', cls: 'sm', label: 'Gradi', title: m.maxRanks ? 'Massimo ' + m.maxRanks + ' gradi (TB-4)' : '' });
    if (m.prog === 'manual') ranks += U.inp('data-p', 'skills.' + i + '.rbm', s.rbm, { type: 'number', cls: 'sm', ph: 'bonus', label: 'Bonus gradi a mano', title: 'Progressione a dadi: inserisci il bonus a mano' });
    var cell = function (field, off, label) { return off ? '<span class="dim">–</span>' : U.inp('data-p', 'skills.' + i + '.' + field, s[field], { type: 'number', cls: 'sm', label: label }); };
    return '<tr><td class="l">' + label + '</td><td>' + stat + '</td><td>' + ranks + '</td><td>' + U.calc('rk', i, 'dim') + '</td><td>' + cell('prof', m.noProf, 'Bonus professione') +
      '</td><td>' + cell('obj', m.noObj, 'Bonus oggetto') + '</td><td>' + U.inp('data-p', 'skills.' + i + '.spec', s.spec, { type: 'number', cls: 'sm', label: 'Bonus speciale' }) +
      '</td><td>' + U.calc('sk', i) + '</td><td><button class="mini" data-act="rollskill" data-i="' + i + '" aria-label="Tira ' + esc(s.name) + '">🎲</button></td></tr>';
  }
  function skills(c) {
    var h = '<section class="card"><h2>Abilità</h2><p class="hint">Totale = bonus gradi + caratteristica + professione + oggetto + speciale. Il pulsante 🎲 tira il d100 aperto e somma il totale. Le abilità secondarie seguono la progressione primaria: il testo non dice altro, verifica sul manuale.</p>';
    D.CATS.forEach(function (cat) {
      var idx = []; c.skills.forEach(function (s, i) { if (s.cat === cat[0]) idx.push(i); });
      if (!idx.length) return;
      h += '<details' + (cat[0] === 'arm' || cat[0] === 'mov' ? ' open' : '') + '><summary>' + esc(cat[1]) + '</summary><div class="scroll"><table class="sk"><thead><tr><th class="l">Abilità</th><th>Car.</th><th>Gradi</th><th>B.gr.</th><th>Prof</th><th>Ogg</th><th>Spec</th><th>Tot</th><th></th></tr></thead><tbody>' +
        idx.map(function (i) { return skillRow(c, i); }).join('') + '</tbody></table></div></details>';
    });
    return h + '</section>';
  }

  function defenses(c) {
    var h = '<section class="card"><h2>Difese e tiri resistenza</h2><div class="scroll"><table class="sk"><thead><tr><th class="l">Voce</th><th>Car.</th><th>Mod. popolo</th><th>Extra</th><th>Tot</th><th></th></tr></thead><tbody>';
    D.DEFENSES.forEach(function (d) {
      h += '<tr><td class="l">' + esc(d[1]) + '</td><td>' + d[2] + '</td><td>' + U.inp('data-p', 'defs.' + d[0] + '.mod', c.defs[d[0]].mod, { type: 'number', cls: 'sm', label: d[1] + ' modifica popolo' }) +
        '</td><td>' + U.inp('data-p', 'defs.' + d[0] + '.extra', c.defs[d[0]].extra, { type: 'number', cls: 'sm', label: d[1] + ' extra' }) +
        '</td><td>' + U.calc('df', d[0]) + '</td><td><button class="mini" data-act="rolldef" data-k="' + d[0] + '" aria-label="Tira ' + esc(d[1]) + '">🎲</button></td></tr>';
    });
    return h + '</tbody></table></div></section>';
  }

  function protection(c) {
    var f = function (l, p) { return U.field(l, U.inp('data-p', 'prot.' + p, c.prot[p])); };
    return '<section class="card"><h2>Protezioni</h2><div class="grid g3">' + f('Armatura', 'armatura') + f('Tipo / colonna armatura', 'res') + f('Scudo', 'scudo') + f('Elmo', 'elmo') +
      f('Bracciali', 'bracciali') + f('Schinieri', 'schinieri') + f('Mod. al BD', 'modbd') + f('Ingombro', 'ingombro') + f('Movimento', 'mov') + '</div>' + protStats(c) + '</section>';
  }
  /* Statistiche dal compendio (TSC-4) per i pezzi scelti da «Oggetti» → «Indossa» (nome identico a quello del catalogo). */
  function protStats(c) {
    var out = '';
    [['Armatura', c.prot.armatura], ['Elmo', c.prot.elmo], ['Scudo', c.prot.scudo]].forEach(function (x) {
      var f = G.gear && G.gear.armorFind(x[1]);
      if (f) out += '<p class="hint"><b>' + x[0] + '</b>, ' + esc(x[1]) + ': ' + esc(G.gear.armorLine(f)) + '</p>';
    });
    return out ? out + '<p class="hint">MM: penalità alle Manovre in movimento · BO-M / BO-T: penalità al BO in mischia / da lancio e tiro · BD: bonus difensivo (BD-M, BD-T, BD-I: contro mischia, tiro/lancio, incantesimi diretti) · PRC: penalità al Tiro Percezione · Res: resistenza ai colpi. Un pezzo perde un punto di Res ogni volta che protegge da un colpo critico; a zero è inutilizzabile. Il calcolo non è automatico: applica tu le penalità.</p>' : '';
  }

  /* Erbario: le erbe trovate e conosciute (come il modulo «Erbario» del compendio); «Oggetti» → Erbe le aggiunge. */
  function erbario(c) {
    var h = '<section class="card"><h2>Erbario</h2><p class="hint">Erbe trovate e conosciute. Cod = codice nella tabella «Erbe, veleni e malattie» (pagina Oggetti).</p>';
    c.erbario.forEach(function (it, i) {
      var p = 'erbario.' + i + '.';
      h += '<div class="wp"><div class="li">' + U.inp('data-p', p + 'n', it.n, { ph: 'Erba', label: 'Erba' }) + U.inp('data-p', p + 'cod', it.cod, { ph: 'Cod', cls: 'sm', label: 'Codice' }) +
        U.inp('data-p', p + 'q', it.q, { ph: 'Q.tà', cls: 'sm', label: 'Quantità' }) + '<button class="mini" data-act="del" data-list="erbario" data-i="' + i + '" aria-label="Elimina">✕</button></div>' +
        '<div class="li">' + U.inp('data-p', p + 'uso', it.uso, { ph: 'Modalità d\'uso', label: 'Modalità d\'uso' }) + U.inp('data-p', p + 'note', it.note, { ph: 'Effetti / note', label: 'Effetti' }) + '</div></div>';
    });
    return h + '<button data-act="add" data-list="erbario">+ Erba</button></section>';
  }

  function list(c, key, title, cols, addLabel) {
    var h = '<section class="card"><h2>' + title + '</h2>';
    c[key].forEach(function (it, i) {
      h += '<div class="li">' + cols.map(function (col) {
        return U.inp('data-p', key + '.' + i + '.' + col[0], it[col[0]], { ph: col[1], cls: col[2] || '', label: col[1] });
      }).join('') + '<button class="mini" data-act="del" data-list="' + key + '" data-i="' + i + '" aria-label="Elimina">✕</button></div>';
    });
    return h + '<button data-act="add" data-list="' + key + '">' + addLabel + '</button></section>';
  }

  var WGROUP = { taglio1: 'Taglio, 1 mano', contund1: 'Contundenti, 1 mano', asta1: 'Asta, 1 mano', asta2: 'Asta, 2 mani', due_mani: 'A 2 mani', lancio: 'Da lancio', tiro: 'Da tiro' };

  /* Armi: si sceglie dal catalogo (tabella TSC-1) oppure si inserisce un'arma personalizzata. */
  function weapons(c) {
    var cat = U.weaponCat();
    var catOpts = [['', '(arma personalizzata)']].concat(cat.map(function (w) { return [w.id, WGROUP[w.group] + ' · ' + w.n]; }));
    var atk = [['', '(tabella di attacco)']].concat(U.allAtk().map(function (t) { return [t.id, t.name]; }));
    var ct = [['', '(tabella critici)']].concat(U.allCrit().filter(function (t) { return !/^TTM-/.test(t.id); }).map(function (t) { return [t.id, t.name]; }));
    var sk = [['', '(abilità per il BO)']];
    c.skills.forEach(function (s, i) { if ((s.cat === 'arm' || s.cat === 'ama' || s.cat === 'mag') && s.name) sk.push([String(i), s.name]); });
    var h = '<section class="card"><h2>Armi</h2><p class="hint">Scegli l\'arma dal catalogo: tabella di attacco, colpo maldestro, critici e modificatori arrivano da soli (tabella delle armi del compendio). Per ciascuna scegli solo l\'abilità da cui prendere il BO.</p>';
    c.weapons.forEach(function (w, i) {
      var cw = null; cat.forEach(function (x) { if (x.id === w.id) cw = x; });
      h += '<div class="wp"><div class="li">' + U.sel('data-act-change', 'wcat:' + i, w.id || '', catOpts, { label: 'Arma dal catalogo' }) +
        '<button class="mini" data-act="del" data-list="weapons" data-i="' + i + '" aria-label="Elimina arma">✕</button></div><div class="grid g3">' +
        U.inp('data-p', 'weapons.' + i + '.n', w.n, { ph: 'Nome', label: 'Nome arma' }) +
        U.sel('data-p', 'weapons.' + i + '.skill', w.skill, sk, { label: 'Abilità' });
      if (cw) {
        h += '</div><p class="hint">' + esc(cw.atk) + ' · colpo maldestro 01–' + String(cw.cm).padStart(2, '0') + ' · critico ' + esc(cw.c1.type) + (cw.c1.max ? '(' + cw.c1.max + ')' : '') +
          (cw.c2 ? ' + secondario ' + esc(cw.c2.type) + (cw.c2.max ? '(' + cw.c2.max + ')' : '') : '') + (cw.git ? ' · gittata base ' + esc(cw.git) : '') +
          (cw.note ? '<br>' + esc(cw.note) : '') + '</p></div>';
      } else {
        h += U.sel('data-p', 'weapons.' + i + '.atk', w.atk, atk, { label: 'Tabella di attacco' }) +
          U.sel('data-p', 'weapons.' + i + '.ct', w.ct, ct, { label: 'Tabella critici' }) +
          U.inp('data-p', 'weapons.' + i + '.fumble', w.fumble, { type: 'number', ph: 'CM: tiro max', label: 'Colpo maldestro, tiro massimo' }) +
          U.inp('data-p', 'weapons.' + i + '.git', w.git, { ph: 'Gittata', label: 'Gittata' }) + '</div></div>';
      }
    });
    return h + '<button data-act="add" data-list="weapons">+ Arma</button></section>';
  }

  function render() {
    var c = S.cur();
    return identity(c) + stats(c) + pf(c) + skills(c) + defenses(c) + protection(c) + weapons(c) +
      list(c, 'inv', 'Inventario', [['n', 'Oggetto'], ['q', 'Quantità', 'sm'], ['note', 'Note']], '+ Oggetto') + erbario(c) +
      list(c, 'spells', 'Incantesimi', [['n', 'Incantesimo'], ['lvl', 'Livello', 'sm'], ['note', 'Note']], '+ Incantesimo') +
      '<section class="card"><h2>Note</h2><textarea data-p="note" rows="5" aria-label="Note">' + esc(c.note) + '</textarea></section>';
  }

  G.pages.sheet = { render: render };
})(typeof window !== 'undefined' ? window : globalThis);
