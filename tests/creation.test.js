const test = require('node:test');
const assert = require('node:assert');
require('../js/data.js'); const R = require('../js/rules.js');
require('../js/creationdata.js'); require('../js/creationpdf.js'); require('../js/secdata.js');
const X = require('../js/creation.js');
const G = globalThis.GIRSA, C = G.creation;

test('dati: 28 popoli, ordine coerente con la disponibilità per Era', () => {
  assert.strictEqual(C.PEOPLE.length, 28);
  assert.strictEqual(Object.keys(G.adolescence).length, 28);
  C.PEOPLE.forEach((p) => assert.ok(G.adolescence[p.id], p.id));
  assert.strictEqual(C.ERA.length >= 28, true);
});

test('dati: punti background dei popoli = riga «bgpunti» della tabella di adolescenza', () => {
  C.PEOPLE.forEach((p) => assert.strictEqual(Number(p.bg), Number(G.adolescence[p.id].bgpunti), p.id));
});

test('dati: 30 professioni, bonus per livello sommano 6 o 7', () => {
  assert.strictEqual(C.PROFS.length, 30);
  C.PROFS.forEach((f) => {
    const s = Object.values(f.b).reduce((a, b) => a + b, 0);
    assert.ok(s === 6 || s === 7, f.n + ' somma ' + s);
  });
});

test('dati: 170 abilità secondarie in 10 tipi', () => {
  assert.strictEqual(G.secdata.length, 10);
  assert.strictEqual(G.secdata.reduce((a, t) => a + t.skills.length, 0), 170);
});

test('bonus di professione per livello (TB-4.2)', () => {
  assert.strictEqual(X.profBonus(3, 1), 3);
  assert.strictEqual(X.profBonus(3, 20), 60);
  assert.strictEqual(X.profBonus(3, 21), 61);
  assert.strictEqual(X.profBonus(2, 22), 41);
  assert.strictEqual(X.profBonus(1, 24), 21);
});

test('costo in punti delle caratteristiche', () => {
  assert.strictEqual(R.pointCost(90), 90);
  assert.strictEqual(R.pointCost(91), 91);
  assert.strictEqual(R.pointCost(100), 190);
  assert.strictEqual(R.pointCost(50), 50);
});

test('aumenti di caratteristica e Aspetto', () => {
  const r = X.statIncrease(50, () => 3);
  assert.ok(r && typeof r.add === 'number' && r.add >= 0);
  assert.strictEqual(X.aspectValue(80, 30), 100);
  assert.strictEqual(X.aspectValue(40, 5), 45);
});

test('tiri caratteristiche: si ritira sotto 20', () => {
  const seq = [5, 10, 50, 60, 70, 80, 90, 15, 99];
  let i = 0;
  const out = X.statRolls(() => seq[i++], 6);
  assert.strictEqual(out.length, 6);
  out.forEach((v) => assert.ok(v >= 20));
});

test('professioni consentite: filtri per popolo', () => {
  const orc = X.allowedProfs(X.personById('orchetti'));
  const dun = X.allowedProfs(X.personById('dunedain'));
  assert.ok(dun.includes('Guerriero'));
  assert.ok(dun.length > 0 && orc.length > 0);
  [...dun, ...orc].forEach((n) => assert.ok(X.profByName(n), n));
});

test('background: tiri speciali producono sempre un esito', () => {
  C.PEOPLE.forEach((p) => {
    for (let r = 1; r <= 100; r++) {
      const o = X.rollSpecial(p.id, () => r);
      assert.ok(o, p.id + ' ' + r);
    }
  });
});

test('professione applicata e nuovo livello', () => {
  const c = R.newChar();
  X.applyProfession(c, 'Guerriero', 3);
  assert.strictEqual(c.prof, 'Guerriero');
  assert.strictEqual(c.livello, 3);
  const k = C.BONUS_SKILLS.arm.find((key) => X.skillIdx(c, key) >= 0);
  assert.ok(k);
  assert.strictEqual(c.skills[X.skillIdx(c, k)].prof, 9);
  assert.strictEqual(c.regno, X.profByName('Guerriero').regno);
  const lv = X.newLevel(c);
  assert.strictEqual(lv, 4);
});

test('punti sviluppo: trasferimento e spesa', () => {
  const c = R.newChar(); X.applyProfession(c, 'Guerriero', 1);
  const k = X.ensure(c);
  const before = X.psPool(c, 'gen');
  X.spendPlain(c, 'gen', 1);
  assert.strictEqual(X.psPool(c, 'gen'), before - 1);
  assert.ok([2, 4].includes(X.transferRate(c, 'sot')) );
  assert.strictEqual(X.transferRate(c, 'perc'), 1);
  assert.strictEqual(X.transferRate(c, 'ama'), 2);
});
