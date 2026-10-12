const test = require('node:test');
const assert = require('node:assert');
require('../js/data.js');
const CD = require('../js/combatdata.js');
const TD = require('../js/tabledata.js');
const CR = require('../js/combatrules.js');
const M = require('../js/magic.js');

test('TA-9: 28 righe contigue, 4 righe «TI», valori di controllo dal PDF', () => {
  assert.strictEqual(CD.ta9.length, 28);
  CD.ta9.forEach((r, i) => { if (i) assert.strictEqual(r.min, CD.ta9[i - 1].max + 1); assert.strictEqual(r.v.length, 7); });
  assert.strictEqual(CD.ta9.filter(r => r.ti).length, 4);
  const row = (n) => CD.ta9.find(r => n >= r.min && n <= r.max && !r.ti);
  assert.deepStrictEqual(row(14).v, [60, null, 45, null, null, null, 45]);
  assert.deepStrictEqual(row(26).v, [35, 35, 30, 45, 35, 45, 30]);
  assert.deepStrictEqual(row(94).v, [-55, -50, -45, -35, -40, -35, -45]);
  assert.deepStrictEqual(CD.ta9[CD.ta9.length - 1].v, [-125, -110, -115, -105, -110, -105, -115]);
});

test('TA-9: lettura con tiro invariabile e limiti 3–95', () => {
  // tiro 99 non modificato: riga TI 98-99 anche se il totale è 20
  assert.strictEqual(M.ta9(99, 20, 0).mod, -100);
  assert.strictEqual(M.ta9(1, 150, 0).fail, true);
  // tiro 50 con totale 200: i modificatori non portano oltre 95
  assert.strictEqual(M.ta9(50, 200, 0).mod, -55);
  assert.strictEqual(M.ta9(50, 200, 0).clamped, true);
  // tiro 50 con totale −40: letto come 3 (fallimento)
  assert.strictEqual(M.ta9(50, -40, 0).fail, true);
  assert.strictEqual(M.ta9(70, 70, 3).mod, -5);   // riga 69-72, Flusso, armatura di metallo
});

test('TRR: tabella 15×15 coerente e livelli oltre il 15°', () => {
  assert.strictEqual(CD.trr.length, 15);
  assert.strictEqual(M.trr(1, 1), 50); assert.strictEqual(M.trr(15, 1), 95); assert.strictEqual(M.trr(1, 15), 5); assert.strictEqual(M.trr(8, 5), 59);
  assert.strictEqual(M.trr(16, 15), 51); assert.strictEqual(M.trr(15, 16), 49); assert.strictEqual(M.trr(20, 18), 52);
});

test('classi di incantesimi, TFI, iniziativa, oltre il 150, gittata', () => {
  assert.strictEqual(M.spellClass(10, 4), 'I'); assert.strictEqual(M.spellClass(10, 5), 'II'); assert.strictEqual(M.spellClass(10, 7), 'II');
  assert.strictEqual(M.spellClass(10, 8), 'III'); assert.strictEqual(M.spellClass(10, 10), 'III');
  assert.strictEqual(M.tfi(0), 30); assert.strictEqual(M.tfi(1), 15); assert.strictEqual(M.tfi(2), 2); assert.strictEqual(M.tfi(5), 2); assert.strictEqual(M.tfi(0, true), 2);
  assert.strictEqual(M.initiative(50, { bmm: 10 }), 70); assert.strictEqual(M.initiative(50, { bmm: -10, surprised: true }), 10);
  assert.strictEqual(M.initiative(50, { poleFar: true, twoHands: true, misc: 3 }), 73);
  assert.strictEqual(M.beyond150(150), null); assert.strictEqual(M.beyond150(180).letter, null); assert.strictEqual(M.beyond150(181).letter, 'A');
  assert.strictEqual(M.beyond150(210).letter, 'A'); assert.strictEqual(M.beyond150(211).letter, 'B'); assert.strictEqual(M.beyond150(301).letter, 'E');
  assert.strictEqual(M.range(10, 10).band, 0); assert.strictEqual(M.range(10, 25).pen, -50); assert.strictEqual(M.range(10, 41).pen, null);
});

test('TSC-3, TSC-4, TSC-5', () => {
  assert.strictEqual(CD.tsc3.length, 8); assert.deepStrictEqual(CD.tsc3.find(x => x.n === 'Fulmine'), { n: 'Fulmine', c1: 'EL', c2: 'IMM', c3: 'CA', mod: '+10 BO (piastra/maglia)' });
  assert.deepStrictEqual(CD.tsc4.find(x => x.n === 'Dura, Mezza').v, [30, 60, 10, 30, 30]);
  assert.deepStrictEqual(CD.tsc4.find(x => x.n === 'Morbida, Piena').v, [null, null, 20, null, 40]);
  assert.strictEqual(CD.tsc5.length, 11);
});

test('colpi critici mirati (TCM): quattro tabelle da 21 righe', () => {
  const t = TD.crit.filter(x => /^TCM-/.test(x.id));
  assert.deepStrictEqual(t.map(x => x.id), ['TCM-1', 'TCM-2', 'TCM-3', 'TCM-4']);
  t.forEach(x => assert.strictEqual(x.rows.length, 21));
  assert.match(t[0].rows[20].text, /muore dopo 3 r/); assert.match(t[3].rows[20].text, /morte istantanea/);
  assert.match(t[2].rows[20].text, /cuore/);
});

test('regole di combattimento: sezioni e tabelle segnaposto', () => {
  assert.strictEqual(CR.length, 20);
  const tables = [].concat(...CR.map(s => s.items.filter(i => i.table).map(i => i.table)));
  assert.deepStrictEqual(tables.sort(), ['bo', 'oltre150', 'parata', 'scudi']);
  const ini = CR.find(s => s.t === 'Tiro Iniziativa');
  assert.strictEqual(ini.items.filter(i => i.li).length, 7);
});

test('modificatori al BO: tra stordito, atterrato e prono si applica uno solo', () => {
  const D = require('../js/data.js');
  assert.ok(D.ATK_MODS.some(m => m.id === 'prono' && m.v === 50 && m.grp === 'pos'));
  globalThis.GIRSA.tabledata = TD; require('../js/rules.js'); require('../js/tables.js'); require('../js/store.js'); require('../js/ui.js');
  const C = require('../js/combat.js');
  assert.strictEqual(C.modsSum({ mods: { stordito: true, prono: true, fianco: true } }, true), 65);
  assert.strictEqual(C.modsSum({ mods: { atterrato: true, cieco: true } }, true), -70);
  assert.strictEqual(C.modsSum({ mods: { fianco: true, mira: true } }, false), -30);
});
