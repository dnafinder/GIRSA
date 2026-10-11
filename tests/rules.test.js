const test = require('node:test');
const assert = require('node:assert');
const R = require('../js/rules.js');
const D = require('../js/data.js');

const prim = R.primaryProg(null);
const spalle = D.PROG.spalle;

test('bonus gradi, progressione primaria (TB-4)', () => {
  assert.strictEqual(R.rankBonus(0, prim), -25);
  assert.strictEqual(R.rankBonus(1, prim), 5);
  assert.strictEqual(R.rankBonus(10, prim), 50);
  assert.strictEqual(R.rankBonus(11, prim), 52);
  assert.strictEqual(R.rankBonus(20, prim), 70);
  assert.strictEqual(R.rankBonus(21, prim), 71);
  assert.strictEqual(R.rankBonus(30, prim), 80);
  assert.strictEqual(R.rankBonus(31, prim), 80.5);
});

test('bonus gradi, Cogliere alle spalle (tetto 25)', () => {
  assert.strictEqual(R.rankBonus(0, spalle), 0);
  assert.strictEqual(R.rankBonus(10, spalle), 10);
  assert.strictEqual(R.rankBonus(20, spalle), 20);
  assert.strictEqual(R.rankBonus(21, spalle), 20.5);
  assert.strictEqual(R.rankBonus(30, spalle), 25);
  assert.strictEqual(R.rankBonus(60, spalle), 25);
});

test('bonus caratteristiche (TB-1)', () => {
  const cx = R.ctx();
  const tb = (s) => R.tableBonus(s, cx.tb1);
  assert.strictEqual(tb(102), 35);
  assert.strictEqual(tb(100), 25);
  assert.strictEqual(tb(90), 10);
  assert.strictEqual(tb(75), 5);
  assert.strictEqual(tb(74), 0);
  assert.strictEqual(tb(25), 0);
  assert.strictEqual(tb(24), -5);
  assert.strictEqual(tb(1), -25);
  assert.strictEqual(tb(''), null);
  assert.strictEqual(tb(500), null);
});

test('costo punti: 20-90 lineare, oltre 90 quadratico', () => {
  assert.strictEqual(R.pointCost(50), 50);
  assert.strictEqual(R.pointCost(90), 90);
  assert.strictEqual(R.pointCost(91), 91);
  assert.strictEqual(R.pointCost(95), 115);
  assert.strictEqual(R.pointCost(100), 190);
  assert.strictEqual(R.pointCost(19), undefined);
  assert.strictEqual(R.pointCost(''), null);
});

test('scheda nuova: Aspetto escluso dai punti, popolo applicato', () => {
  const c = R.newChar('Prova');
  c.stats.FR.score = 60; c.stats.AS.score = 99; c.stats.CO.score = 80;
  assert.strictEqual(R.pointsSpent(c), 140);
  assert.ok(R.applyPopolo(c, 'Hobbit'));
  assert.strictEqual(c.stats.FR.razza, -20);
  assert.strictEqual(c.defs.ess.mod, 50);
  assert.strictEqual(R.applyPopolo(c, 'Inesistente'), false);
});

test('totale abilità: grado + caratteristica + prof + oggetto + speciale', () => {
  const c = R.newChar('Prova'); const cx = R.ctx();
  c.stats.FR.score = 90; // +10
  const i = c.skills.findIndex(s => s.k === 'taglio');
  c.skills[i].ranks = 5; c.skills[i].prof = 3; c.skills[i].obj = 5;
  assert.strictEqual(R.skillTotal(c, i, cx), 25 + 10 + 3 + 5);
  const z = c.skills.findIndex(s => s.k === 'tiro');
  assert.strictEqual(R.skillTotal(c, z, cx), -25); // 0 gradi, AG vuoto
});

test('Nascondersi usa i gradi di Muoversi silenziosamente', () => {
  const c = R.newChar('Prova'); const cx = R.ctx();
  const s = c.skills.findIndex(x => x.k === 'silenz'), n = c.skills.findIndex(x => x.k === 'nascond');
  c.skills[s].ranks = 4;
  assert.strictEqual(R.ranksOf(c, n), 4);
});

test('manovre in armatura: speciale negativo precompilato', () => {
  const c = R.newChar('Prova');
  const i = c.skills.findIndex(x => x.k === 'piastre');
  assert.strictEqual(c.skills[i].spec, -60);
});

test('PF e morte: soglia = massimo + punteggio CO', () => {
  const c = R.newChar('Prova');
  c.stats.CO.score = 70; c.pf.max = 40; c.pf.dmg = 0;
  assert.strictEqual(R.pfInfo(c).state, 'ok');
  c.pf.dmg = 40; assert.strictEqual(R.pfInfo(c).state, 'zero');
  c.pf.dmg = 41; assert.strictEqual(R.pfInfo(c).state, 'sotto');
  c.pf.dmg = 109; assert.strictEqual(R.pfInfo(c).state, 'sotto');
  c.pf.dmg = 110; assert.strictEqual(R.pfInfo(c).state, 'morte');
  c.pf.max = ''; assert.strictEqual(R.pfInfo(c).state, 'nd');
});

test('guarigione (TFC-2) con moltiplicatori', () => {
  assert.strictEqual(R.healDays(-30, 1, 'lieve'), 7);
  assert.strictEqual(R.healDays(50, 3, 'lieve'), 5);
  assert.strictEqual(R.healDays(50, 3, 'media'), 25);
  assert.strictEqual(R.healDays(120, 3, 'grave'), 20);
});

test('esperienza (TE-5)', () => {
  assert.strictEqual(R.xpForLevel(1), 10000);
  assert.strictEqual(R.xpForLevel(20), 500000);
  assert.strictEqual(R.xpForLevel(22), 600000);
});
