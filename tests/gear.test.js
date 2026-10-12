const test = require('node:test');
const assert = require('node:assert');
global.window = global;
['rules', 'geardata', 'gear'].forEach((f) => require('../js/' + f + '.js'));
const GD = global.GIRSA.geardata, Ge = global.GIRSA.gear, R = global.GIRSA.rules;

test('conteggi delle tabelle come nei PDF', () => {
  assert.deepStrictEqual(GD.armature.body.map((s) => s.rows.length), [4, 4, 4, 4, 4]);
  assert.strictEqual(GD.armature.elmi.length, 9);
  assert.strictEqual(GD.armature.scudi.length, 4);
  const e = GD.equip;
  assert.deepStrictEqual([e.armi, e.prot, e.accessori, e.borse, e.vestiti, e.vitto, e.trasporti].map((x) => x.length), [55, 43, 68, 8, 12, 28, 35]);
  assert.strictEqual(GD.metalli.metalli.length, 23);
  assert.strictEqual(GD.metalli.gemme.length, 18);
  assert.strictEqual(GD.metalli.descr.length, 26);
  assert.strictEqual(GD.erbe.length, 347);
  assert.strictEqual(GD.malattie.length, 18);
});

test('codici delle erbe consecutivi e categorie note', () => {
  GD.erbe.forEach((h, i) => { assert.strictEqual(h.cod, i + 1); assert.ok(['cur', 'var', 'vel', 'mal'].includes(h.cat), h.n); assert.ok(h.cl >= 0 && h.cl < GD.erbeClimi.length); assert.ok(h.te >= 0 && h.te < GD.erbeTerreni.length); });
  GD.malattie.forEach((d, i) => assert.strictEqual(d.cod, 600 + i));
});

test('valori di controllo letti dai PDF (TSC-4)', () => {
  const cm = GD.armature.body.find((s) => s.id === 'CM').rows;
  assert.deepStrictEqual(cm[2], { n: 'Cotta di maglia lunga', mm: '-10', bom: '-5', bot: '-20', d: 'Come cotta normale ma a maniche lunghe e pantaloni (Br/Sc)', res: '11', bd: '+10' });
  const cp = GD.armature.body.find((s) => s.id === 'CP').rows;
  assert.strictEqual(cp[3].n, 'Armatura da cavaliere'); assert.strictEqual(cp[3].res, '14'); assert.strictEqual(cp[3].bd, '+15');
  assert.strictEqual(GD.armature.scudi[1].res, '5/8');
  assert.strictEqual(GD.armature.scudi[3].bdt, '+40');
  assert.strictEqual(GD.armature.elmi.find((x) => x.n === 'Celata').bdi, '+5');
});

test('valori di controllo letti dai PDF (TS-4, metalli, gemme)', () => {
  const sp = GD.equip.armi.find((x) => x.n === 'Spada lunga');
  assert.deepStrictEqual([sp.costo, sp.peso, sp.tp], ['18MA', '2,2kg', '4']);
  assert.strictEqual(GD.equip.armi.find((x) => x.n === 'Usriev').costo, '18MA');
  assert.strictEqual(GD.equip.trasporti.find((x) => x.n === 'Mearh (pl. Mearas)').cav, '+40');
  assert.strictEqual(GD.equip.trasporti.find((x) => x.n === 'Diligenza').costo, '1MB + 1MR/km');
  assert.strictEqual(GD.equip.vitto.find((x) => x.n === 'Lembas, Pan di via').costo, '15MO*');
  const mi = GD.metalli.metalli.find((x) => x.n === 'Mithril');
  assert.deepStrictEqual([mi.bonus, mi.valore, mi.lav, mi.tempo], ['+20', '200 MO', '5 MO', '10']);
  assert.strictEqual(GD.metalli.metalli.find((x) => x.n === 'Tasarang').note, 'Metallo incantato. Bonus per la lavorazione di corde d’archi: +15');
  assert.strictEqual(GD.metalli.gemme.find((x) => x.n === 'Diamante').rarita, 'Molto Preziosa (251+ MO)');
  assert.strictEqual(GD.metalli.descr[0].n, 'Adamante');
});

test('erbe: righe su più linee e celle sfalsate assegnate alla riga giusta', () => {
  const h = (c) => GD.erbe[c - 1];
  assert.strictEqual(h(14).n, 'Girasole'); assert.match(h(14).eff, /^1 sacchetto con 24 semi.*Non ha effetto di notte$/);
  assert.strictEqual(h(25).n, 'Larice'); assert.match(h(25).eff, /^Spalmata sul legno.*contro elettricità\.$/);
  assert.strictEqual(h(119).n, 'Incenso'); assert.match(h(119).eff, /contatto con il proprio vala per 1d10 di round\.$/);
  assert.strictEqual(h(120).eff, 'Guarisce l’udito.');
  assert.strictEqual(h(282).n, 'Athelas'); assert.match(h(282).eff, /Può essere usata solo da Re “consacrati”\.$/);
  assert.strictEqual(h(283).eff, 'Decongestionante.');
  assert.strictEqual(h(245).n, 'Breldiar'); assert.match(h(245).eff, /Euforia x1 ora\.$/);
  assert.strictEqual(h(246).eff, 'Permette di condividere i sogni con membri familiari fino a 160Km/Liv.');
  assert.strictEqual(h(48).n, 'Worlclivur'); assert.match(h(48).eff, /61\+= -100 1D100 settimane\.$/);
  // colonne mancanti nel PDF restano vuote (non inventate)
  assert.deepStrictEqual([h(56).n, h(56).af, h(56).lv], ['Faghiu', '', '']);
  assert.deepStrictEqual([h(240).n, h(240).af, h(240).lv], ['Arnuminas', '--', '']);
  assert.strictEqual(h(5).n, 'Gariig'); assert.strictEqual(h(5).eff, 'Cura 30 PF'); assert.strictEqual(h(5).cat, 'cur');
  assert.strictEqual(h(2).cat, 'vel'); assert.strictEqual(GD.erbeClimi[h(2).cl], 'Clima Arido'); assert.strictEqual(GD.erbeTerreni[h(2).te], 'Deserto');
  // clima e terreno: 14 erbe «Coste di oceani…» sotto Clima Caldo e Umido
  const n = GD.erbe.filter((x) => GD.erbeClimi[x.cl] === 'Clima Caldo e Umido' && GD.erbeTerreni[x.te].startsWith('Coste di oceani')).length;
  assert.strictEqual(n, 14);
});

test('ricerca: testo, tipo e clima', () => {
  assert.strictEqual(Ge.herbs('athelas', '', '').length, 1);
  assert.ok(Ge.herbs('', 'vel', '').length > 50);
  assert.ok(Ge.herbs('', '', '0').every((x) => x.r.cl === 0));
  assert.strictEqual(Ge.filter(GD.equip.armi, 'SPADA').filter((x) => /spada/i.test(x.r.n)).length, Ge.filter(GD.equip.armi, 'spada').length);
  assert.strictEqual(Ge.filter(GD.equip.armi, '').length, 55);
  assert.strictEqual(Ge.filter(GD.equip.armi, 'xyzxyz').length, 0);
  assert.strictEqual(Ge.filter(GD.equip.armi, 'usriev')[0].i, 54);   // l'indice originale resta quello della tabella
});

test('armature: ricerca per nome e riga delle statistiche', () => {
  const f = Ge.armorFind('Cotta di maglia lunga (CM)');
  assert.strictEqual(Ge.armorLine(f), 'MM -10 · BO-M -5 · BO-T -20 · Res 11 · BD +10');
  assert.strictEqual(Ge.armorFind('Corazza rigida'), null, 'nome ambiguo (CR e CP)');
  assert.strictEqual(Ge.armorFind('Corazza rigida (CP)').sec.id, 'CP');
  assert.strictEqual(Ge.armorFind('Corazza rigida (CR)').row.res, '8');
  assert.strictEqual(Ge.armorLine(Ge.armorFind('Elmo di metallo')), 'PRC -5 · Res 3');
  assert.strictEqual(Ge.armorLine(Ge.armorFind('Palvese (a Torre)')), 'BD-M +30 · BD-T +40 · BD-I +30 · Res 9');
  assert.strictEqual(Ge.armorFind(''), null);
  assert.strictEqual(Ge.armorFind('Armatura inesistente'), null);
  // il nome scritto da «Indossa» si ritrova sempre
  GD.armature.body.forEach((s) => s.rows.forEach((r) => assert.ok(Ge.armorFind(Ge.wornName('body', s, r)), r.n)));
  GD.armature.elmi.forEach((r) => assert.ok(Ge.armorFind(Ge.wornName('elmo', null, r)), r.n));
  GD.armature.scudi.forEach((r) => assert.ok(Ge.armorFind(Ge.wornName('scudo', null, r)), r.n));
});

test('la scheda nuova ha l\'erbario', () => {
  assert.deepStrictEqual(R.newChar('x').erbario, []);
});

test('un salvataggio senza erbario viene completato', () => {
  const S = require('../js/store.js');
  const c = R.newChar('Vecchio'); delete c.erbario;
  const st = S.migrate({ v: 1, cur: c.id, chars: [c] });
  assert.deepStrictEqual(st.chars[0].erbario, []);
});
