const test = require('node:test');
const assert = require('node:assert');
const { makeDice } = require('../js/dice.js');

/* rand che restituisce, nell'ordine, i valori di d100 indicati */
function seq(values) { let i = 0; return () => (values[i++] - 1) / 100 + 0.0001; }

test('d100 chiuso', () => {
  const d = makeDice(seq([42]));
  assert.deepStrictEqual(d.closed().total, 42);
});
test('aperto: tiro normale', () => {
  const r = makeDice(seq([50])).open({ high: 96, low: 5 });
  assert.strictEqual(r.total, 50); assert.strictEqual(r.dir, '');
});
test('aperto verso l\'alto, con catena', () => {
  const r = makeDice(seq([97, 98, 20])).open({ high: 96, low: 5 });
  assert.strictEqual(r.total, 97 + 98 + 20); assert.strictEqual(r.dir, 'alto');
});
test('aperto verso il basso', () => {
  const r = makeDice(seq([3, 40])).open({ high: 96, low: 5 });
  assert.strictEqual(r.total, 3 - 40); assert.strictEqual(r.dir, 'basso');
});
test('soglie configurabili', () => {
  const r = makeDice(seq([90, 10])).open({ high: 90, low: 0 });
  assert.strictEqual(r.total, 100);
});
test('espressioni NdM+K', () => {
  const d = makeDice(seq([1, 1]));
  const r = d.expr('2d6+3');
  assert.strictEqual(r.n, 2);
  assert.ok(r.total >= 5 && r.total <= 15);
  assert.strictEqual(d.expr('abc'), null);
  assert.strictEqual(d.expr('0d6'), null);
  assert.strictEqual(d.expr('d20').n, 1);
});
