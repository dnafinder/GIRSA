/* Pagina Guida: popoli, professioni, tabelle di creazione, disponibilità temporale, abilità secondarie. */
(function (root) {
  'use strict';
  var G = root.GIRSA = root.GIRSA || {};
  var R = G.rules, D = G.data, U = G.ui, S = G.store, C = G.creation, X = G.creationlogic, esc = U.esc;
  var dice = G.dice.dice;
  G.acts = G.acts || {};

  function T() { return U.tmp.ref || (U.tmp.ref = { people: '', q: '', istat: '' }); }
  var TIPO = { P: 'Usufruttore puro', I: 'Usufruttore ibrido', R: 'Usufruttore parziale', N: 'Non usufruttore', A: 'Altro' };

  function peopleSec() {
    var t = T(), p = X.personById(t.people);
    return '<section class="card"><h2>Popoli</h2>' + U.field('Popolo', U.sel('data-t', 'ref.people', t.people, [['', '(scegli)']].concat(C.PEOPLE.map(function (x) { return [x.id, x.g + ' — ' + x.n]; })), { re: 1, label: 'Popolo' })) +
      (p ? G.peopleHtml(p) : '<p class="hint">Le schede dei 28 popoli del Prospetto sui Popoli: caratteristiche speciali, lingue, professioni, equipaggiamento, background, abilità tipiche.</p>') + '</section>';
  }

  function profSec() {
    var h = '<section class="card"><h2>Professioni</h2><p class="hint">TB-6 (caratteristica fondamentale, regno, bonus per livello) e TGP-4 (punti sviluppo per livello). «Regno (n)»: livello massimo delle liste apribili.</p>' +
      '<div class="scroll"><table class="sk"><thead><tr><th class="l">Professione</th><th>Tipo</th><th>Car.</th><th>Regno</th><th class="l">Bonus per livello</th></tr></thead><tbody>';
    C.PROFS.forEach(function (f) {
      h += '<tr><td class="l"><b>' + esc(f.n) + '</b></td><td>' + TIPO[f.tipo] + '</td><td>' + esc(f.stat.length ? f.stat.join(' o ') : '*') + (f.sec.length ? ' / ' + esc(f.sec.join(' o ')) : '') + '</td><td>' + esc(f.regno) + '</td><td class="l">' +
        Object.keys(f.b).map(function (k) { return esc(C.BONUS_LABEL[k]) + ' +' + f.b[k]; }).join('; ') + '</td></tr>';
    });
    h += '</tbody></table></div><p class="hint">* Cittadino: una caratteristica correlata all\'occupazione. Car. = principale / secondaria. Evocatore, Stregone, Mistico e Astrologo scelgono una principale e una secondaria tra quelle indicate.</p>';
    h += '<h3>Punti sviluppo (TGP-4)</h3><div class="scroll"><table class="sk"><thead><tr><th class="l">Professione</th>' + C.PS_CATS.map(function (x) { return '<th title="' + esc(x[1]) + '">' + esc(x[1].replace('Abilità ', 'Ab. ').replace('Manovre in movimento', 'Manovre')) + '</th>'; }).join('') + '</tr></thead><tbody>';
    C.PROFS.forEach(function (f) { h += '<tr><td class="l">' + esc(f.n) + '</td>' + C.PS_CATS.map(function (x) { return '<td>' + (f.ps[x[0]] || 0) + '</td>'; }).join('') + '</tr>'; });
    h += '</tbody></table></div>' +
      '<details><summary>Accesso alle liste di incantesimi</summary>' +
      '<p class="pl"><b>Usufruttori puri</b> (ESS: Mago, Illusionista, Alchimista · FLS: Animista, Chierico, Curatore · MEN: Mentalista, Veggente, Guaritore laico): tutte le liste Aperte, Chiuse e di Professione del proprio reame.</p>' +
      '<p class="pl"><b>Ibridi</b> (Stregone, Mistico, Astrologo): tutte le liste Aperte e di Professione di entrambi i reami; con maggior difficoltà anche le Chiuse.</p>' +
      '<p class="pl"><b>Parziali</b> (Ranger, Bardo, Monaco, Evocatore, Paladino, Zingaro, Agente): tutte le liste Aperte limitate a un determinato livello e tutte le liste Base di Professione. L\'Evocatore lancia incantesimi di tutti i regni come un ibrido, ma non ha proprie liste Base.</p>' +
      '<p class="pl"><b>Non usufruttori</b> (Guerriero, Scout, Cittadino, Brigante, Esploratore, Mutaforma, Monaco guerriero, Scassinatore, Corsaro): in alcuni casi liste Aperte limitate a un livello. Il Cittadino solo incantesimi legati alla sua specializzazione; il Mutaforma solo del Flusso. <b>Altri</b> (Barbaro, Studioso): nessun incantesimo.</p>' +
      '<p class="pl">Porzioni: A dal 1° al 5° livello · B dal 1° al 10° · C dal 5° al 10° · D dal 10° al 20° · E un solo incantesimo di livello 25, 30 o 50.</p>' +
      '<div class="scroll"><table class="sk"><thead><tr><th class="l">Usufruttore</th><th>Liste Base</th><th>Liste Aperte</th><th>Liste Chiuse</th></tr></thead><tbody><tr><td class="l">Puri</td><td>B, D, E</td><td>B, D**</td><td>B, D**</td></tr><tr><td class="l">Ibridi</td><td>B, D, E</td><td>B</td><td>A, C</td></tr><tr><td class="l">Parziali</td><td>B, D, E</td><td>A*, C*</td><td>–</td></tr><tr><td class="l">Non usufruttori</td><td>–</td><td>A*</td><td>–</td></tr></tbody></table></div>' +
      '<p class="hint">* Il livello massimo è limitato dalla professione. ** Gli usufruttori puri possono, in creazione, scegliere 4 liste (Aperte o Chiuse) del loro reame e trattarle come liste Base ai fini dell\'apprendimento.</p>' +
      '<p class="pl"><b>Paladino</b>: il GM può concedergli di trascendere la presenza di metallo quando lancia gli incantesimi base, ma solo con un\'armatura (elmo, bracciali e schinieri compresi) e un\'arma personali e sacre assegnate all\'inizio della storia; qualsiasi altra armatura o arma impedirebbe il lancio. Se smarrisse la via potrebbe perdere il vantaggio.</p>' +
      '<p class="pl"><b>Cittadino</b>: sceglie una specializzazione che determina le abilità primarie di occupazione e le correlate. Le abilità secondarie costano meno: di occupazione 1 PS per 1 grado, 2 PS per 2 gradi, 4 PS per 3 gradi; correlate 1 PS per 1 grado, 2 PS per 2 gradi.</p></details>';
    return h + '</section>';
  }

  function tableSec() {
    var h = '<section class="card"><h2>Tabelle di creazione</h2>';
    var rk = function (r) { return X.rangeKey(r[0], r[1]); };
    h += '<details><summary>Punti per la distribuzione (caratteristiche) e aumenti</summary><p class="hint">Metodo a distribuzione: 400 punti, valori da 20 a 100; costo 20–90 = il valore, oltre 90: 90 + (valore − 90)². ' +
      [91, 92, 93, 94, 95, 96, 97, 98, 99, 100].map(function (v) { return v + ' → ' + R.pointCost(v); }).join(' · ') + '.</p>' +
      '<h3>Incremento delle caratteristiche</h3><p class="hint">Normalmente non aumentano. Il GM può concedere un aumento a certi passaggi di livello o alla fine di una cronaca; si tira in base al valore attuale (una, alcune o tutte le caratteristiche, a discrezione del GM e della professione). Oltre 100 solo a discrezione del GM e non più di +1. Nel compendio le righe «1/2» e «2/4» si sovrappongono sul 2 (probabile refuso): lo strumento usa la prima.</p>' +
      '<div class="scroll"><table class="sk"><thead><tr><th>Valore</th><th>Aumento</th></tr></thead><tbody>' + C.INC.map(function (r) { return '<tr><td>' + (r[0] === r[1] ? r[0] : r[0] + '/' + r[1]) + '</td><td>' + (r[2] ? '+' + r[2] + 'd' + r[3] : '+' + r[4]) + '</td></tr>'; }).join('') + '<tr><td>100</td><td>*</td></tr></tbody></table></div>' +
      '<div class="row">' + U.field('Caratteristica', U.sel('data-t', 'ref.istat', T().istat, [['', '(scegli)']].concat(D.STATS.filter(function (s) { return s[0] !== 'AS'; }).map(function (s) { return [s[0], s[1]]; })))) +
      '<button data-act="ref_inc">Tira l\'aumento</button></div></details>';
    h += '<details><summary>Opzioni di background (TGP-2)</summary>' + C.BG.scelte.map(function (s) { return '<p class="pl"><b>' + esc(s[1]) + ':</b> ' + esc(s[2]) + '</p>'; }).join('') +
      '<h3>Abilità speciali</h3>' + C.BG.spec.map(function (r) { return '<p class="pl"><b>' + rk(r) + ' · ' + esc(r[2]) + ':</b> ' + esc(r[3]) + '</p>'; }).join('') +
      '<h3>Oggetti speciali</h3>' + C.BG.ogg.map(function (r) { return '<p class="pl"><b>' + rk(r) + ' · ' + esc(r[2]) + ':</b> ' + esc(r[3]) + '</p>'; }).join('') +
      '<h3>Denaro</h3><p class="pl">' + C.BG.den.map(function (r) { return rk(r) + ': ' + r[2] + ' MO'; }).join(' · ') + '</p></details>';
    var A = G.adolescence || {}, keys = [['mov_nessuna', 'Nessuna'], ['mov_cuoio_g', 'C. grezzo'], ['mov_cuoio_r', 'C. rinf.'], ['mov_maglie', 'Maglia'], ['taglio', 'Taglio'], ['contund', 'Contund.'], ['due_mani', '2 mani'],
      ['lancio', 'Lancio'], ['tiro', 'Tiro'], ['asta', 'Asta'], ['arrampic', 'Arramp.'], ['cavalc', 'Cavalc.'], ['nuotare', 'Nuotare'], ['spalle', 'Spalle'], ['silenz', 'Silenz.'], ['serrat', 'Scass.'], ['trappole', 'Trapp.'],
      ['rune', 'Rune'], ['ogg_mag', 'Ogg.mag.'], ['att_nov', 'Att.nov.'], ['pre_nov', 'Pre.nov.'], ['res_fis', 'Res.fis.'], ['percez', 'Percez.'], ['lista', 'Lista %'], ['lingue', 'Lingue'], ['bgpunti', 'Backgr.']];
    h += '<details><summary>Abilità durante l\'adolescenza (TGP-5)</summary><div class="scroll"><table class="sk"><thead><tr><th class="l">Popolo</th>' + keys.map(function (k) { return '<th>' + k[1] + '</th>'; }).join('') + '</tr></thead><tbody>' +
      C.PEOPLE.map(function (p) { var a = A[p.id] || {}; return '<tr><td class="l">' + esc(p.n) + '</td>' + keys.map(function (k) { return '<td>' + (a[k[0]] == null ? '' : a[k[0]]) + '</td>'; }).join('') + '</tr>'; }).join('') + '</tbody></table></div></details>';
    h += '<details><summary>Sviluppo dei bonus di professione (TB-4.2)</summary><div class="scroll"><table class="sk"><thead><tr><th class="l">Progressione</th><th>Livelli 1–20</th><th>Livello 21 e oltre</th></tr></thead><tbody>' +
      '<tr><td class="l">Bonus +3/lv</td><td>+3 per livello</td><td>+1 per livello</td></tr><tr><td class="l">Bonus +2/lv</td><td>+2 per livello</td><td>+0,5 per livello (+1 ogni 2 livelli)</td></tr><tr><td class="l">Bonus +1/lv</td><td>+1 per livello</td><td>+0,25 per livello (+1 ogni 4 livelli)</td></tr></tbody></table></div></details>';
    h += '<details><summary>Disponibilità temporale dei popoli</summary><div class="scroll"><table class="sk"><thead><tr><th class="l">Popolo</th><th>Prima Era</th><th>Seconda Era</th><th>Terza Era</th><th>Quarta Era</th></tr></thead><tbody>' +
      C.ERA.map(function (r) { return '<tr><td class="l">' + esc(r[0]) + '</td>' + r.slice(1).map(function (x) { return '<td>' + esc(x) + '</td>'; }).join('') + '</tr>'; }).join('') + '</tbody></table></div></details>';
    return h + '</section>';
  }
  G.acts.ref_inc = function () {
    var t = T(), c = S.cur();
    if (!t.istat) { U.toast('Scegli la caratteristica.'); return; }
    var cur = R.num(c.stats[t.istat].score), r = X.statIncrease(cur, dice.d);
    if (!r) { U.toast('Valore ' + cur + ': oltre 100 solo a discrezione del GM, e non più di +1.'); return; }
    var nv = Math.min(100, cur + r.add);
    c.stats[t.istat].score = nv; S.save(); U.showRoll('Aumento ' + t.istat, cur + ' → ' + nv + ' (' + r.dice + ': ' + r.rolls.join('+') + ')', '+' + r.add); G.app.render();
  };

  function secSec() {
    var t = T(), q = (t.q || '').toLowerCase().trim(), types = G.secdata || [];
    var h = '<section class="card"><h2>Abilità secondarie</h2><p class="hint">Compendio delle abilità secondarie, per tipo. Si sviluppano con i punti dei gruppi indicati; da altri gruppi i PS si trasferiscono a 4 a 1 (se nei gruppi indicati la professione ha 0 PS) oppure 2 a 1 (se in almeno uno ne ha almeno 1). ' +
      'Con «Aggiungi» l\'abilità va in una riga libera delle secondarie, in Scheda. Scrivi e premi Invio per cercare.</p>' +
      U.field('Cerca (nome o testo)', '<input type="search" data-t="ref.q" data-re="1" value="' + esc(t.q) + '" placeholder="es. cavalcare, veleni, fabbro">');
    var shown = 0;
    types.forEach(function (ty, ti) {
      var rows = ty.skills.map(function (s, si) { return { s: s, si: si }; }).filter(function (r) { return !q || r.s.n.toLowerCase().indexOf(q) >= 0 || r.s.text.toLowerCase().indexOf(q) >= 0; });
      if (!rows.length) return;
      shown += rows.length;
      h += '<details' + (q ? ' open' : '') + '><summary>' + esc(ty.name) + ' (' + rows.length + ')</summary><p class="hint">Gruppi di abilità: ' + esc(ty.groups) + '. ' + esc(ty.intro) + '</p>' +
        rows.map(function (r) {
          return '<div class="sks"><b>' + esc(r.s.n) + '</b> <span class="tag">' + esc(r.s.stat) + '</span> <button class="mini" data-act="ref_addsec" data-t="' + ti + '" data-s="' + r.si + '">Aggiungi</button><br><span class="hint">' + esc(r.s.text) + '</span></div>';
        }).join('') + '</details>';
    });
    if (!shown) h += '<p class="hint">Nessuna abilità trovata.</p>';
    return h + '</section>';
  }
  G.acts.ref_addsec = function (b) {
    var c = S.cur(), s = (G.secdata[+b.dataset.t] || { skills: [] }).skills[+b.dataset.s]; if (!s) return;
    var st = String(s.stat).slice(0, 2), stat = c.stats[st] && st !== 'AS' ? st : '';
    var slot = -1; c.skills.forEach(function (x, i) { if (slot < 0 && x.cat === 'sec' && !x.name) slot = i; });
    if (slot < 0) { var n = c.skills.filter(function (x) { return x.cat === 'sec'; }).length; c.skills.push({ cat: 'sec', k: 'sec' + n, name: '', stat: '', ranks: '', prof: '', obj: '', spec: '', rbm: '' }); slot = c.skills.length - 1; }
    c.skills[slot].name = s.n; c.skills[slot].stat = stat; S.save(); U.toast('«' + s.n + '» aggiunta alle abilità secondarie.');
  };

  function render() {
    return '<section class="card"><p class="hint">Guida al regolamento: il materiale del compendio Istaro Quettar per creare e sviluppare un personaggio, per combattere e per la magia. Sono pagine consultabili; per costruire il personaggio usa «Crea».</p></section>' +
      peopleSec() + profSec() + tableSec() + secSec() + (G.refcombat ? G.refcombat.html() : '');
  }
  G.pages.ref = { render: render };
})(typeof window !== 'undefined' ? window : globalThis);
