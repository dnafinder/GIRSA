/* Pagina Diario: appunti per il librogame (paragrafo, registro, segnalini). */
(function (root) {
  'use strict';
  var G = root.GIRSA = root.GIRSA || {};
  var U = G.ui, S = G.store, esc = U.esc;

  function render() {
    var c = S.cur(), d = c.diary, h = '<section class="card"><h2>Librogame</h2><div class="grid g2">' +
      U.field('Titolo del libro', U.inp('data-p', 'diary.book', d.book)) +
      U.field('Paragrafo attuale', U.inp('data-p', 'diary.par', d.par, { type: 'number' })) + '</div></section>' +
      '<section class="card"><h2>Registro delle scelte</h2><div class="row"><label>Nota' + U.inp('data-t', 'dn', U.tmp.dn || '', { cls: 'wide', ph: 'Es. ho preso la chiave, ho dato il pane al vecchio' }) +
      '</label><button data-act="diaryadd">Aggiungi (con il paragrafo attuale)</button></div>';
    if (!d.log.length) h += '<p class="hint">Nessuna nota.</p>';
    else h += '<ul class="log">' + d.log.map(function (x, i) {
      return '<li><span class="t">' + U.timeStr(x.t) + '</span> ' + (x.par !== '' ? '<b>§' + esc(x.par) + '</b> ' : '') + esc(x.s) +
        ' <button class="mini" data-act="del" data-list="diary.log" data-i="' + i + '" aria-label="Elimina">✕</button></li>';
    }).join('') + '</ul>';
    h += '</section><section class="card"><h2>Segnalini e parole chiave</h2><div class="chips">' +
      d.flags.map(function (f, i) { return '<span class="chip">' + esc(f) + ' <button class="mini" data-act="del" data-list="diary.flags" data-i="' + i + '" aria-label="Elimina">✕</button></span>'; }).join('') +
      '</div><div class="row"><label>Nuovo segnalino' + U.inp('data-t', 'df', U.tmp.df || '', { ph: 'Es. Parola d\'ordine: Mellon' }) + '</label><button data-act="flagadd">+ Aggiungi</button></div></section>';
    return h;
  }
  G.pages.diary = { render: render };
})(typeof window !== 'undefined' ? window : globalThis);
