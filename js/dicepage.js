/* Pagina Dadi. */
(function (root) {
  'use strict';
  var G = root.GIRSA = root.GIRSA || {};
  var U = G.ui, S = G.store, esc = U.esc;

  function history() {
    var l = S.get().dlog;
    if (!l.length) return '<p class="hint">Ancora nessun tiro.</p>';
    return '<ul class="log">' + l.map(function (x) {
      return '<li><span class="t">' + U.timeStr(x.t) + '</span> <b>' + esc(x.label) + '</b> ' + esc(x.detail) + ' → <b>' + esc(x.value) + '</b></li>';
    }).join('') + '</ul>';
  }

  function render() {
    var st = S.get();
    return '<section class="card"><h2>Dadi</h2><div class="dicebtns">' +
      '<button class="big" data-act="d100o">d100 aperto</button><button class="big" data-act="d100c">d100 chiuso</button>' +
      ['d4', 'd6', 'd8', 'd10', 'd12', 'd20'].map(function (d) { return '<button data-act="die" data-d="' + d + '">' + d + '</button>'; }).join('') +
      '</div><div class="row"><label>Espressione (es. 2d6+1)' + U.inp('data-t', 'expr', U.tmp.expr || '', { ph: '2d6+1' }) + '</label>' +
      '<button data-act="rollexpr">Tira</button></div>' +
      '<p class="hint">Aperto: il compendio non definisce la regola. Si usa la convenzione MERP: primo tiro ≥ ' + st.settings.dice.high +
      ' si tira ancora e si somma; ≤ ' + st.settings.dice.low + ' si tira ancora e si sottrae. Le soglie si cambiano in Dati.</p></section>' +
      '<section class="card"><h2>Cronologia</h2><div class="row"><button class="ghost" data-act="clearroll">Svuota</button></div>' + history() + '</section>';
  }
  G.pages.dice = { render: render };
})(typeof window !== 'undefined' ? window : globalThis);
