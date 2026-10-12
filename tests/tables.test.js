const test = require('node:test');
const assert = require('node:assert');
const T = require('../js/tables.js');

/* Dati sintetici: NON sono valori del regolamento. */
const ATT = `xx-35 0 0 0
36-40 1 0 0
41-60 2A 1 0
61-100 5B 3A 2`;

test('parsing tabella di attacco', () => {
  const rows = T.parseAttackText(ATT, 3);
  assert.strictEqual(rows.length, 4);
  assert.strictEqual(rows[0].min, null);
  assert.deepStrictEqual(rows[2].cells[0], { pf: 2, crit: 'A' });
  assert.deepStrictEqual(rows[1].cells[1], { pf: 0, crit: null });
});
test('errori di parsing', () => {
  assert.throws(() => T.parseAttackText('xx-35 0 0', 3), /colonne/);
  assert.throws(() => T.parseAttackText('xx-35 0 0 0\n40-50 1 1 1', 3), /contigui/);
  assert.throws(() => T.parseAttackText('niente', 3), /Nessuna riga/);
  assert.throws(() => T.parseAttackText('xx-35 0 0 Z', 3), /Cella/);
});
test('consultazione, anche oltre i limiti', () => {
  const table = { rows: T.parseAttackText(ATT, 3) };
  assert.strictEqual(T.attackCell(table, 0, 50).cell.pf, 2);
  assert.strictEqual(T.attackCell(table, 2, -80).cell.pf, 0);
  const hi = T.attackCell(table, 0, 140);
  assert.strictEqual(hi.cell.pf, 5); assert.strictEqual(hi.beyond, true);
  assert.strictEqual(T.attackCell(table, 1, 36).cell.pf, 0);
  assert.strictEqual(T.attackCell(table, 0, 36).cell.pf, 1);
});
test('tabella critici sintetica, con righe di continuazione', () => {
  const rows = T.parseCritText(`-(49)-05 Colpo di striscio.
06-16 Colpo al braccio, +2 PF
e stordito un round.
80 Morte immediata.`);
  assert.strictEqual(rows.length, 3);
  assert.strictEqual(rows[0].min, null); assert.strictEqual(rows[0].max, 5);
  assert.match(rows[1].text, /stordito/);
  const t = { rows };
  assert.strictEqual(T.lookupCrit(t, 10).min, 6);
  assert.strictEqual(T.lookupCrit(t, 80).text, 'Morte immediata.');
  assert.strictEqual(T.lookupCrit(t, 120).min, 80);
  assert.strictEqual(T.lookupCrit(t, -100).max, 5);
});
test('tiro critico con modificatore di lettera', () => {
  assert.strictEqual(T.critRoll(50, 'T'), 0);
  assert.strictEqual(T.critRoll(50, 'E'), 70);
  assert.strictEqual(T.critRoll(50, null), 50);
});

/* ---- tabelle incluse (estratte dai PDF) ---- */
const TD = require('../js/tabledata.js');
const byId = (l, id) => l.find(t => t.id === id);

test('tabelle incluse: struttura e contiguità', () => {
  assert.strictEqual(TD.atk.length, 10);
  assert.strictEqual(TD.crit.length, 24);   // TC-1…13, TTM-1…7, TCM-1…4
  TD.atk.forEach(t => {
    T.validateAttackRows(t.rows);
    t.rows.forEach(r => assert.strictEqual(r.cells.length, 5, t.id));
    assert.strictEqual(t.armors.length, 5);
  });
  TD.crit.forEach(t => {
    t.rows.forEach((r, i) => { if (i) assert.strictEqual(r.min, t.rows[i - 1].max + 1, t.id); assert.ok(r.text.length > 3, t.id); });
    assert.strictEqual(t.rows[0].min, null, t.id);
    assert.strictEqual(t.rows[t.rows.length - 1].max, 120, t.id);
  });
});

test('tabelle incluse: valori di controllo letti dal PDF', () => {
  const ta1 = byId(TD.atk, 'TA-1');
  const cell = (t, res, i) => T.attackCell(t, i, res).cell;
  assert.deepStrictEqual(cell(ta1, 78, 3), { pf: 7, crit: 'A' });
  assert.deepStrictEqual(cell(ta1, 78, 0), { pf: 4, crit: null });
  assert.deepStrictEqual(cell(ta1, 150, 4), { pf: 30, crit: 'E' });
  assert.strictEqual(cell(ta1, -20, 0).pf, 0);
  assert.strictEqual(T.attackCell(ta1, 0, 170).beyond, true);
  assert.deepStrictEqual(cell(byId(TD.atk, 'TA-2'), 78, 1), { pf: 8, crit: null });
  assert.deepStrictEqual(cell(byId(TD.atk, 'TA-11'), 106, 2), { pf: 11, crit: 'B' });
  assert.strictEqual(byId(TD.atk, 'TA-5').fumble, 2);
  assert.strictEqual(byId(TD.atk, 'TA-8').fumble, 4);
});

test('limiti di taglia (TA-5) e tipo di dardo (TA-7), righe TI', () => {
  const ta5 = byId(TD.atk, 'TA-5'), ta7 = byId(TD.atk, 'TA-7'), ta8 = byId(TD.atk, 'TA-8');
  assert.deepStrictEqual(ta5.limits.map(l => l.label), ['Minuscoli', 'Piccoli', 'Medi', 'Grandi', 'Enormi']);
  const free = T.attackCell(ta5, 4, 150, { limit: 'Enormi' });
  assert.deepStrictEqual(free.cell, { pf: 24, crit: 'E' });
  const small = T.attackCell(ta5, 4, 150, { limit: 'Minuscoli' });
  assert.strictEqual(small.capped, true);
  assert.deepStrictEqual(small.cell, { pf: 10, crit: 'T' });
  assert.deepStrictEqual(T.attackCell(ta7, 0, 120, { limit: 'Acqua' }).cell, { pf: 11, crit: 'B' });
  assert.deepStrictEqual(T.attackCell(ta7, 0, 90, { first: 100, limit: 'Energia' }).cell, { pf: 18, crit: 'D' });
  assert.deepStrictEqual(T.attackCell(ta7, 0, 5, {}).cell, { pf: 0, crit: null, fail: true });
  assert.deepStrictEqual(T.attackCell(ta8, 4, 120, { first: 97 }).cell, { pf: 26, crit: 'E' });
  assert.deepStrictEqual(T.attackCell(ta8, 4, 2, {}).cell, { pf: 1, crit: null });
});

test('critici inclusi: ricerca per tiro con modificatore', () => {
  const tc1 = byId(TD.crit, 'TC-1');
  assert.match(T.lookupCrit(tc1, T.critRoll(30, 'A')).text, /Costole incrinate/);
  assert.match(T.lookupCrit(tc1, T.critRoll(20, 'C')).text, /Colpo al fianco/);
  assert.strictEqual(T.lookupCrit(tc1, 5).min, null);
  assert.strictEqual(T.lookupCrit(tc1, 120).min, 120);
  assert.match(byId(TD.crit, 'TTM-3').name, /Fallimento degli Incantesimi/);
});

/* ---- calcolo dell'attacco della pagina ---- */
test('resolveAttack con tabella inclusa', () => {
  const R = require('../js/rules.js'), S = require('../js/store.js');
  globalThis.GIRSA.tabledata = TD; require('../js/ui.js');
  const C = require('../js/combat.js');
  const st = S.blank(), c = st.chars[0];
  const f = { atk: 'TA-1', armor: '3', limit: '', fumble: '', skill: '', bo: '20', bd: '5', mods: { fianco: true }, extra: '', roll: '50' };
  const r = C.resolveAttack(f, c, st, null);
  assert.strictEqual(r.total, 50 + 20 - 5 + 15);
  assert.deepStrictEqual(r.cell, { pf: 7, crit: 'A' });
  assert.strictEqual(r.fumble, false);
  f.fumble = '50'; f.roll = '3';
  assert.strictEqual(C.resolveAttack(f, c, st, null).fumble, true);
});

/* ---- catalogo armi (TSC-1) ---- */
test('armi: struttura e valori di controllo letti dal PDF', () => {
  const W = require('../js/weapondata.js');
  assert.strictEqual(W.length, 56);
  const ids = new Set(W.map(w => w.id)); assert.strictEqual(ids.size, 56);
  W.forEach(w => { assert.ok(byId(TD.atk, w.atk), w.n); assert.ok(w.cm >= 1 && w.cm <= 8, w.n); });
  const w = id => W.find(x => x.id === id);
  const sl = w('taglio1-spada-lunga');
  assert.strictEqual(sl.cm, 3); assert.deepStrictEqual(sl.mods, [{ v: 5, arm: [0, 1] }, { v: -5, arm: [2, 3, 4] }]);
  assert.deepStrictEqual(w('taglio1-stocco-spada-da-lato').mods, [{ v: -10, arm: [0, 2] }, { v: 5, arm: [1, 3, 4] }]);
  assert.deepStrictEqual(w('taglio1-pugnale').c1, { type: 'PU', max: 'D' });
  assert.deepStrictEqual(w('contund1-mazza-chiodata').c2, { type: 'PU', max: 'B' });
  assert.strictEqual(w('contund1-rete-da-gladiatore').atk, 'TA-6');
  assert.strictEqual(w('contund1-rete-da-gladiatore').limit, 'Medi');
  assert.strictEqual(w('asta2-lancia-da-cavaliere').atk, 'TA-10');
  assert.strictEqual(w('asta1-lancia').atk, 'TA-1');
  assert.strictEqual(w('tiro-arco-lungo').git, '33*');
  assert.strictEqual(w('due_mani-spada-bastarda').cm, 5); assert.strictEqual(w('taglio1-spada-bastarda').cm, 4);
  // Frusta: «-15 ½PF» solo nelle colonne piastre e maglie della tabella TA-2 con i modificatori delle armi
  assert.deepStrictEqual(w('contund1-frusta').mods, [{ v: -15, arm: [0, 1] }]); assert.strictEqual(w('contund1-frusta').manual.length, 0);
});

test('armi: modificatore sulla TA, limite e critico secondario', () => {
  const W = require('../js/weapondata.js'), R = require('../js/rules.js'), S = require('../js/store.js');
  globalThis.GIRSA.tabledata = TD; globalThis.GIRSA.weapondata = W; require('../js/ui.js');
  const C = require('../js/combat.js');
  const wi = C.weaponInfo({ id: 'taglio1-spada-lunga' });
  assert.strictEqual(C.taMod(wi, '0'), 5); assert.strictEqual(C.taMod(wi, '4'), -5); assert.strictEqual(C.taMod(wi, ''), 0);
  assert.strictEqual(C.capLetter('E', 'D'), 'D'); assert.strictEqual(C.capLetter('B', 'D'), 'B'); assert.strictEqual(C.capLetter('', 'D'), '');
  assert.strictEqual(C.secondaryLetter('A', { max: 'B' }), '');
  assert.strictEqual(C.secondaryLetter('D', { max: 'B' }), 'B');
  assert.strictEqual(C.secondaryLetter('C', { max: 'E' }), 'B');
  assert.strictEqual(C.TYPE_TC.PU, 'TC-3');
  const st = S.blank(), c = st.chars[0];
  const f = { atk: 'TA-1', armor: '4', limit: '', fumble: '3', skill: '', bo: '0', bd: '0', mods: {}, extra: '', roll: '60', wi };
  const r = C.resolveAttack(f, c, st, null);
  assert.strictEqual(r.ta, -5); assert.strictEqual(r.total, 60);
  assert.deepStrictEqual(r.cell, T.attackCell(byId(TD.atk, 'TA-1'), 4, 55).cell);
});
