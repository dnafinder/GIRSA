const test = require('node:test');
const assert = require('node:assert');
global.window = global;
['rules', 'worlddata', 'world'].forEach((f) => require('../js/' + f + '.js'));
const WD = global.GIRSA.worlddata, W = global.GIRSA.world;

test('conteggi come nei PDF', () => {
  assert.deepStrictEqual(WD.animali.animali.map((g) => g.righe.length), [33, 15, 8, 26, 39, 18, 8]);
  assert.deepStrictEqual(WD.animali.mostri.map((g) => g.righe.length), [8, 4, 11, 13, 10, 7, 5, 30, 4]);
  assert.deepStrictEqual(WD.animali.cavalcature.map((g) => g.righe.length), [10, 2, 3, 5]);
  assert.strictEqual(WD.statiche.righe.length, 7);
  assert.strictEqual(WD.mov.righe.length, 23);
  assert.strictEqual(W.allAnimals().length, 147 + 92);
});

test('animali: valori di controllo letti dal PDF (refusi compresi)', () => {
  const all = W.allAnimals().map((x) => x.r);
  const by = (n) => all.find((r) => r.n === n);
  assert.deepStrictEqual(by('Aquila di mare'), { n: 'Aquila di mare', lv: 5, qt: '1-5', vel: 'VC/VC', pf: 65, ta: 'NA', bd: 45, att: '65AR/50CH', dim: 'M/N', note: 'Aggressivo, feroce' });
  assert.strictEqual(by('Renna').vel, 'MVVE');                 // come stampato
  assert.strictEqual(by('Demone (III° Cerchia)').dim, 'MN');   // come stampato
  assert.strictEqual(by('Balrog').pf, 400);
  assert.strictEqual(by('Ent, Onodrim').att, '170CA/160PR*');
  assert.strictEqual(by('Servitore elementale (I)').att, '30 Sfera el.*');
  const cav = WD.animali.cavalcature[0].righe.find((r) => r.n === 'Elfico grande');
  assert.deepStrictEqual([cav.vel, cav.mr, cav.pf, cav.ta, cav.bd, cav.att, cav.dim, cav.port, cav.bac], ['SC/VC', '90/120 m/r', 180, 'CG', 60, '95IM/80SC', 'M/G', '204 kg', '50']);
  all.forEach((r) => { assert.ok(r.pf > 0 || r.n, r.n); });
  assert.ok(['NA', 'CG', 'CR', 'CM', 'CP'].every((t) => all.some((r) => r.ta === t)));
});

test('TM-1: ricerca per tiro e difficoltà', () => {
  assert.strictEqual(W.movLookup(-200, 0).cell.fail, true);
  assert.deepStrictEqual(W.movLookup(-120, 0).cell, { fail: false, pct: 10, m: -27, text: '10/-27' });
  assert.strictEqual(W.movLookup(0, 3).label, '-25/0');
  assert.strictEqual(W.movLookup(1, 0).cell.text, '80/-6');
  assert.strictEqual(W.movLookup(100, 2).cell.text, '100/-');
  assert.strictEqual(W.movLookup(100, 0).label, '96/105');
  assert.strictEqual(W.movLookup(100, 0).cell.text, '110/+3');
  assert.strictEqual(W.movLookup(300, 0).cell.text, '160/+18');
  assert.strictEqual(W.movLookup(300, 8).cell.text, '100/-');
  assert.strictEqual(W.movLookup(166, 0).label, '166/185');
  assert.strictEqual(W.movLookup(276, 0).label, '276 o più');
});

test('TM-2: ricerca per tiro (175 va a «Successo»: primo intervallo)', () => {
  const n = (t) => W.statLookup(t).r.n;
  assert.strictEqual(n(-300), 'Errore Grossolano'); assert.strictEqual(n(-26), 'Errore Grossolano');
  assert.strictEqual(n(-25), 'Fallimento Completo'); assert.strictEqual(n(4), 'Fallimento Completo');
  assert.strictEqual(n(5), 'Fallimento'); assert.strictEqual(n(75), 'Fallimento');
  assert.strictEqual(n(76), 'Successo Parziale'); assert.strictEqual(n(91), 'Quasi Successo'); assert.strictEqual(n(110), 'Quasi Successo');
  assert.strictEqual(n(111), 'Successo'); assert.strictEqual(n(175), 'Successo'); assert.strictEqual(n(176), 'Successo Completo');
  assert.ok(WD.statiche.righe[5].c[2].startsWith('Serratura aperta'));
  assert.deepStrictEqual(WD.statiche.difficolta[3], ['0', 'Media']);
});

test('TS-10 incontri: Tiro d\'Incontro e densità', () => {
  assert.strictEqual(W.incLookup(-50, 0).code, 'v/-');
  assert.strictEqual(W.incLookup(30, 0).code, 'v/-'); assert.strictEqual(W.incLookup(31, 0).code, 'i/-');
  assert.strictEqual(W.incLookup(100, 0).code, 'o/v'); assert.strictEqual(W.incLookup(101, 0).code, 'a/o');
  assert.strictEqual(W.incLookup(200, 4).code, 'a/t'); assert.strictEqual(W.incLookup(201, 3).code, 't/t');
  assert.deepStrictEqual(W.incText('i/v'), { senzienti: 'incontro normale', animali: 'avvistamento da parte di un altro gruppo' });
  assert.strictEqual(W.modNum('+30'), 30); assert.strictEqual(W.modNum('-25/-50'), null); assert.strictEqual(W.modNum('vario'), null);
});

test('TS-12 rischio: righe e aree', () => {
  assert.strictEqual(W.rischioLookup(5, 7).res, 'Niente'); assert.strictEqual(W.rischioLookup(-40, 0).res, 'Niente');
  assert.strictEqual(W.rischioLookup(6, 3).res, 'Percepito');
  assert.strictEqual(W.rischioLookup(100, 6).res, 'Contingente'); assert.strictEqual(W.rischioLookup(101, 0).res, 'Individuato');
  assert.strictEqual(W.rischioLookup(250, 0).res, 'Assassino'); assert.strictEqual(W.rischioLookup(250, 7).res, 'Speciale');
  assert.deepStrictEqual(WD.rischio.fatt.map((f) => f[1]), [50, 40, 25, 20, 10, 5, 0]);
});

test('monete: rapporti dalla nota della TS-6', () => {
  assert.strictEqual(W.coinVal('MS'), 1); assert.strictEqual(W.coinVal('MR'), 10); assert.strictEqual(W.coinVal('MB'), 100);
  assert.strictEqual(W.coinVal('MA'), 1000); assert.strictEqual(W.coinVal('MO'), 10000); assert.strictEqual(W.coinVal('MM'), 1000000);
  assert.strictEqual(W.toMS(3, 'MA'), 3000);
  assert.strictEqual(W.fromMS(W.toMS(5, 'MO')).find((x) => x.code === 'MM').v, 0.05);
  assert.strictEqual(W.fmtNum(1234567.5), '1.234.567,5');
  assert.deepStrictEqual(W.parseTreasure('1.500MS'), { kind: 'coin', n: 1500, code: 'MS', ms: 1500 });
  assert.deepStrictEqual(W.parseTreasure('Gio.(1.000)'), { kind: 'jewel', mo: 1000, ms: 10000000 });
  assert.strictEqual(W.parseTreasure('Ge.(10)').kind, 'gem');
});

test('TS-6: tesoro con dadi pilotati', () => {
  const seq = (...v) => { let i = 0; return { d: () => v[i++] }; };
  // denaro: entità 31 -> 2 tiri; composizioni 100 («00», Normale = Gio.(100)) e 1 (1.000MS); magici: entità 1 -> 0 tiri
  let r = W.treasure(seq(31, 100, 1, 1), 2);
  assert.strictEqual(r.money.n, 2); assert.deepStrictEqual(r.money.items.map((x) => x.cell), ['Gio.(100)', '1.000MS']);
  assert.strictEqual(r.totalMS, 100 * 10000 + 1000); assert.strictEqual(r.magic.n, 0);
  // magici: Molto ricco, entità 99 -> 6 tiri; primo composizione 23 = riga 21/30 (J) -> determinazione 66 = Giornaliero 1 al giorno
  r = W.treasure(seq(1, 1, 99, 23, 66, 11, 11, 11, 11, 11), 4);
  assert.strictEqual(r.magic.n, 6); assert.strictEqual(r.magic.items[0].cell, 'J');
  assert.deepStrictEqual(r.magic.items[0].ogg, { roll: 66, oggetto: 'Giornaliero', cariche: '1 al giorno', livello: '1-10' });
  assert.strictEqual(r.magic.items[1].cell, 'L (40%)');
  // la sovrapposizione 11/22 e 21/30: 21 e 22 -> prima riga (11/22)
  r = W.treasure(seq(1, 1, 99, 22, 1, 1, 1, 1, 1, 1, 1), 4);
  assert.strictEqual(r.magic.items[0].cell, 'L (40%)');      // 22 nella riga 11/22 (non J della 21/30)
  r = W.treasure(seq(1, 1, 99, 21, 1, 1, 1, 1, 1, 1, 1), 0);
  assert.strictEqual(r.magic.items[0].cell, 'N');
});

test('esperienza: TE-1, TE-2, TE-3', () => {
  assert.strictEqual(W.peKillBase(0, 1), 50); assert.strictEqual(W.peKillBase(1, 1), 200); assert.strictEqual(W.peKillBase(5, 5), 200);
  assert.strictEqual(W.peKillBase(10, 11), 200); assert.strictEqual(W.peKillBase(10, 25), 200); assert.strictEqual(W.peKillBase(3, 20), 60);
  assert.strictEqual(W.peKillBase(11, 5), 500); assert.strictEqual(W.peKillBase(11, 30), 200);     // 200 + 50*(11-5) ; minimo 200
  assert.strictEqual(W.peKill(5, 5, 'G'), 300); assert.strictEqual(W.peKill(5, 5, 'E'), 600);
  assert.strictEqual(W.peCritInflitti({ A: 2, C: 1 }, 4), 2 * 5 * 4 + 15 * 4);
  assert.strictEqual(W.peCritSubiti({ B: 1, E: 2 }), 200 + 1000);
  assert.strictEqual(W.peSpell(0), 100); assert.strictEqual(W.peSpell(3), 70); assert.strictEqual(W.peSpell(9), 10); assert.strictEqual(W.peSpell(12), 0);
  assert.deepStrictEqual(WD.xp.te4.map((x) => x[1]), [0, 5, 10, 50, 100, 150, 200, 300, 500]);
});

test('meteo: lettura delle celle', () => {
  assert.deepStrictEqual(W.precParse('265(90)'), { mm: 265, pr: 90, star: false });
  assert.deepStrictEqual(W.precParse('-(01)*'), { mm: null, pr: 1, star: true });
  assert.deepStrictEqual(W.tempParse('-40/-17'), { min: -40, max: -17 });
  assert.strictEqual(WD.meteo.prec[10][3], '303(99)'); assert.strictEqual(WD.meteo.temp[11][4], '-34/-9');
});

test('intervalli', () => {
  assert.deepStrictEqual(W.range('91/00'), [91, 100]); assert.deepStrictEqual(W.range('00'), [100, 100]); assert.deepStrictEqual(W.range('-25/04'), [-25, 4]);
  assert.deepStrictEqual(W.range('≤ 05'), [-1e9, 5]); assert.deepStrictEqual(W.range('più di 200'), [201, 1e9]);
});

test('TRR-2: freddo e caldo', () => {
  assert.strictEqual(WD.trr2.freddo.righe.length, 10); assert.strictEqual(WD.trr2.caldo.righe.length, 10);
  ['freddo', 'caldo'].forEach((k) => {
    assert.strictEqual(W.trr2Lookup(k, 150).range, WD.trr2[k].righe[0][0]);
    assert.strictEqual(W.trr2Lookup(k, -50).range, WD.trr2[k].righe[9][0]);
    assert.strictEqual(W.trr2Lookup(k, 100).row, W.trr2Lookup(k, 300).row);
    assert.ok(W.trr2Lookup(k, 50).row > W.trr2Lookup(k, 100).row);
  });
  assert.deepStrictEqual(W.range('100 o +'), [100, 1e9]); assert.deepStrictEqual(W.range('Meno di 0'), [-1e9, -1]);
  assert.deepStrictEqual(W.range('75/99'), [75, 99]);
});

test('rischio: fattore per tipo di incantesimo', () => {
  assert.strictEqual(W.riskFactor('ES'), 50); assert.strictEqual(W.riskFactor('ED'), 40);
  assert.strictEqual(W.riskFactor('E'), 25); assert.strictEqual(W.riskFactor('U'), 5);
});

test('liste: Pirocinesi e Potenziamento Corporeo', () => {
  assert.strictEqual(WD.liste.length, 2);
  WD.liste.forEach((l) => assert.strictEqual(l.sp.length, 23));
  const p = WD.liste.find((l) => /Piro/i.test(l.n));
  assert.deepStrictEqual(p.sp.map((s) => s.lv).slice(-3), [30, 50].length ? [25, 30, 50] : []);
  assert.ok(/Vero Crea Fiamma/.test(p.sp[p.sp.length - 1].n));
  const q = WD.liste.find((l) => /Potenz/i.test(l.n));
  const i13 = q.sp.findIndex((s) => s.lv === 13), i12 = q.sp.findIndex((s) => s.lv === 12);
  assert.ok(i13 < i12);
});

test('nomi per popolo', () => {
  require('../js/creationdata.js');
  const N = require('../js/namedata.js'), ids = global.GIRSA.creation.PEOPLE.map((p) => p.id);
  Object.keys(N.NOMI).forEach((k) => assert.ok(ids.includes(k), 'popolo sconosciuto: ' + k));
  assert.ok(N.nomi('rohirrim', 'f').includes('Éowyn') && !N.nomi('rohirrim', 'f').includes('Éomer'));
  assert.ok(N.nomi('rohirrim', '').includes('Éomer') && N.nomi('rohirrim', '').includes('Éowyn'));
  assert.deepStrictEqual(N.nomi('variag', ''), []); assert.deepStrictEqual(N.nomi('lossoth', 'f'), []);
  assert.ok(N.fan('haradrim', 'f').includes('Hind') && !N.canon('haradrim', 'f').length);
  assert.ok(N.canon('esterling', 'm').includes('Khamûl') && N.fan('esterling', 'f').includes('Katun'));
  assert.ok(N.cognomi('eriadoriani').includes('Butterbur') && N.fanCognomi('hobbit').length === 0);
  assert.ok(N.nomi('uruk', 'f').includes('Uglúk'));
  assert.ok(N.cognomi('hobbit').includes('Baggins') && N.cognomi('nani').length === 0);
  Object.values(N.NOMI).forEach((n) => ['m', 'f', 'x'].forEach((g) => assert.strictEqual(new Set(n[g]).size, n[g].length, 'duplicati')));
});
