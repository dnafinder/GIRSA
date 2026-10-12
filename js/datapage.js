/* Pagina Dati: tabelle importate, impostazioni, copie di sicurezza, aiuti. */
(function (root) {
  'use strict';
  var G = root.GIRSA = root.GIRSA || {};
  var R = G.rules, D = G.data, U = G.ui, S = G.store, esc = U.esc;

  function tablesCard(st) {
    var im = U.tmp.imp || (U.tmp.imp = { name: '', armors: '', fumble: '', text: '', cname: '', ctext: '' });
    var bd = U.bundled();
    var h = '<section class="card"><h2>Tabelle</h2><p class="hint"><b>Incluse nell\'app</b> (dal compendio): ' + bd.atk.length + ' tabelle di attacco (TA-1…TA-8, TA-10, TA-11; la TA-9 degli incantesimi base è nella pagina Combattimento), ' +
      bd.crit.filter(function (t) { return /^TC-/.test(t.id); }).length + ' tabelle dei colpi critici (TC-1…TC-13), ' + bd.crit.filter(function (t) { return /^TCM-/.test(t.id); }).length + ' dei colpi critici mirati (TCM-1…TCM-4) e ' + bd.crit.filter(function (t) { return /^TTM-/.test(t.id); }).length +
      ' dei fallimenti (TTM-1…TTM-7). Qui sotto puoi aggiungerne altre tue, incollando il testo o importando un file JSON (formato in <code>data/README.md</code>).</p>';
    h += '<h3>Tue tabelle di attacco</h3>' + (st.atk.length ? st.atk.map(function (t, i) {
      return '<div class="li"><span><b>' + esc(t.name) + '</b> · ' + t.rows.length + ' righe · ' + t.armors.length + ' colonne</span><button class="mini" data-act="del" data-list="atk" data-i="' + i + '">✕</button></div>';
    }).join('') : '<p class="hint">Nessuna.</p>');
    h += '<h3>Tue tabelle di critici</h3>' + (st.crit.length ? st.crit.map(function (t, i) {
      return '<div class="li"><span><b>' + esc(t.name) + '</b> · ' + t.rows.length + ' righe</span><button class="mini" data-act="del" data-list="crit" data-i="' + i + '">✕</button></div>';
    }).join('') : '<p class="hint">Nessuna.</p>');
    h += '<details><summary>Importa tabella di attacco</summary><div class="grid g2">' +
      U.field('Nome (es. Spada corta)', U.inp('data-t', 'imp.name', im.name)) +
      U.field('Intervallo di fallimento: massimo tiro', U.inp('data-t', 'imp.fumble', im.fumble, { type: 'number', ph: 'es. 4' })) + '</div>' +
      U.field('Nomi delle colonne di armatura, separati da virgola', U.inp('data-t', 'imp.armors', im.armors, { ph: 'es. 1,2,3,…' })) +
      U.field('Righe, una per riga: «36-40 0 0 1B 2C…»; la prima inizia con «xx-»', '<textarea data-t="imp.text" rows="8">' + esc(im.text) + '</textarea>') +
      '<button data-act="impatk">Importa attacco</button></details>';
    h += '<details><summary>Importa tabella dei critici</summary>' + U.field('Nome (es. Taglio)', U.inp('data-t', 'imp.cname', im.cname)) +
      U.field('Righe: «06-16 testo…», «80 testo…», «-(49)-05 testo…»; le righe senza intervallo continuano la precedente', '<textarea data-t="imp.ctext" rows="8">' + esc(im.ctext) + '</textarea>') +
      '<button data-act="impcrit">Importa critici</button></details>';
    return h + '</section>';
  }

  function settingsCard(st) {
    var s = st.settings, h = '<section class="card"><h2>Impostazioni di calcolo</h2>' +
      '<h3>Tiro aperto (convenzione, non scritta nel compendio)</h3><div class="grid g2">' +
      U.field('Si tira ancora se il primo tiro è almeno', U.inp('data-s', 'dice.high', s.dice.high, { type: 'number' })) +
      U.field('Si tira ancora, sottraendo, se è al più', U.inp('data-s', 'dice.low', s.dice.low, { type: 'number' })) + '</div>' +
      '<h3>Bonus gradi, progressione primaria (TB-4)</h3><div class="grid g3">' +
      U.field('0 gradi', U.inp('data-s', 'prog.zero', s.prog.zero, { type: 'number' })) +
      U.field('Gradi 1–10, per grado', U.inp('data-s', 'prog.r1', s.prog.r1, { type: 'number' })) +
      U.field('Gradi 11–20', U.inp('data-s', 'prog.r2', s.prog.r2, { type: 'number' })) +
      U.field('Gradi 21–30', U.inp('data-s', 'prog.r3', s.prog.r3, { type: 'number' })) +
      U.field('Gradi 31 e oltre', U.inp('data-s', 'prog.r4', s.prog.r4, { type: 'number' })) + '</div>' +
      '<details><summary>Tabella TB-1 (bonus alle caratteristiche)</summary><div class="scroll"><table class="sk"><thead><tr><th>Da</th><th>A</th><th>Bonus</th></tr></thead><tbody>' +
      s.tb1.map(function (r, i) {
        return '<tr><td>' + U.inp('data-s', 'tb1.' + i + '.from', r.from, { type: 'number', cls: 'sm' }) + '</td><td>' + U.inp('data-s', 'tb1.' + i + '.to', r.to, { type: 'number', cls: 'sm' }) +
          '</td><td>' + U.inp('data-s', 'tb1.' + i + '.bonus', r.bonus, { type: 'number', cls: 'sm' }) + '</td></tr>';
      }).join('') + '</tbody></table></div></details>' +
      '<div class="row"><button class="ghost" data-act="resetsettings">Ripristina i valori del compendio</button></div></section>';
    return h;
  }

  function healCard() {
    var f = U.tmp.heal || (U.tmp.heal = { roll: '', col: '1', sev: 'lieve' }), out = '';
    if (f.roll !== '') {
      var days = R.healDays(R.num(f.roll), +f.col, f.sev);
      out = '<div class="res">Guarigione: <b class="big">' + days + ' giorni</b></div>';
    }
    return '<section class="card"><h2>Guarigione (TFC-2)</h2><div class="grid g3">' +
      U.field('Tiro + bonus Costituzione', U.inp('data-t', 'heal.roll', f.roll, { type: 'number' })) +
      U.field('Tipo di ferita', U.sel('data-t', 'heal.col', f.col, D.HEAL_COLS.map(function (n, i) { return [String(i), n]; }))) +
      U.field('Gravità', U.sel('data-t', 'heal.sev', f.sev, [['lieve', 'Lieve'], ['media', 'Media (×5)'], ['grave', 'Grave (×10)']])) +
      '</div><button data-act="healroll">Tira il d100 per me</button>' + out + '</section>';
  }

  function backupCard() {
    return '<section class="card"><h2>Copia di sicurezza</h2><p class="hint">I dati stanno nel browser di questo dispositivo. Esporta ogni tanto un file: è l\'unica protezione contro la cancellazione dei dati del sito.</p>' +
      '<div class="row"><button data-act="export">Esporta tutto (JSON)</button><label class="btn ghost">Importa file<input type="file" accept=".json,application/json" data-act-file="1" hidden></label></div>' +
      '<p class="hint">Importando un backup completo, i dati attuali vengono sostituiti. Un file di tabella singola viene invece aggiunto all\'elenco.</p>' +
      '<div class="row"><button class="danger" data-act="wipe">Cancella tutti i dati</button></div></section>';
  }

  function creditsCard() {
    return '<section class="card"><h2>Crediti</h2><p class="hint">Regole, tabelle e dati dal compendio <b>«Istaro Quettar»</b> di Filduin, basato su GIRSA (Gioco di Ruolo del Signore degli Anelli): ' +
      '<a href="https://www.istaroquettar.it" target="_blank" rel="noopener">www.istaroquettar.it</a>. Il compendio è per uso personale o distribuzione gratuita: questa app non è in vendita. ' +
      'GIRSA e «Il Signore degli Anelli» appartengono ai rispettivi titolari; il progetto non è affiliato a nessuno di loro.</p></section>';
  }

  function render() {
    var st = S.get();
    return tablesCard(st) + settingsCard(st) + healCard() + backupCard() + creditsCard();
  }
  G.pages.data = { render: render };
})(typeof window !== 'undefined' ? window : globalThis);
