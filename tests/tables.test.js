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
