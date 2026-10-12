/*
 * Parametri di calcolo del regolamento, ricavati dal compendio "Istaro Quettar"
 * (Filduin), basato su Girsa 2ed/3ed. Vedi NOTICE.md.
 * Contiene solo i valori necessari ai calcoli. Le tabelle di attacco e dei colpi
 * critici NON sono incluse: si importano dalla pagina "Dati".
 */
(function (root) {
  'use strict';
  var G = root.GIRSA = root.GIRSA || {};

  var STATS = [['FR', 'Forza'], ['AG', 'Agilità'], ['CO', 'Costituzione'], ['IN', 'Intelligenza'],
    ['IT', 'Intuizione'], ['PR', 'Prontezza'], ['AS', 'Aspetto']];

  var CATS = [['mov', 'Movimento e manovra'], ['arm', 'Abilità con le armi'], ['gen', 'Abilità generiche'],
    ['sot', 'Abilità di sotterfugio'], ['mag', 'Abilità magiche'], ['ama', 'Arti marziali'],
    ['amd', 'Arti marziali, difesa'], ['var', 'Bonus e abilità varie'], ['sec', 'Abilità secondarie']];

  function S(cat, k, name, stat, tag, spec, o) {
    var x = { cat: cat, k: k, name: name, stat: stat, tag: tag, spec: spec };
    if (o) for (var p in o) x[p] = o[p];
    return x;
  }

  /* Righe della scheda. Flag: noStat/noProf/noObj/noRanks = campi XX della scheda originale;
     prog = progressione dei gradi (primary di default); maxRanks = limite TB-4 per le manovre in armatura. */
  var SKILLS = [
    S('mov', 'nessuna', 'Nessuna armatura', 'AG', 'MM', 0, { noProf: 1, maxRanks: 2 }),
    S('mov', 'cuoio_g', 'Cuoio grezzo', 'AG', 'MM', -15, { noProf: 1, maxRanks: 3 }),
    S('mov', 'cuoio_r', 'Cuoio rinforzato', 'AG', 'MM', -30, { noProf: 1, maxRanks: 5 }),
    S('mov', 'maglie', 'Corazza di maglie', 'FR', 'MM', -45, { noProf: 1, maxRanks: 7 }),
    S('mov', 'piastre', 'Corazza di piastre', 'FR', 'MM', -60, { noProf: 1, maxRanks: 9 }),
    S('arm', 'taglio', 'Da taglio, 1 mano', 'FR', 'BO', 0),
    S('arm', 'contund', 'Contundenti, 1 mano', 'FR', 'BO', 0),
    S('arm', 'due_mani', 'A 2 mani', 'FR', 'BO', 0),
    S('arm', 'tiro', 'Da tiro', 'AG', 'BO', 0),
    S('arm', 'lancio', 'Da lancio', 'AG', 'BO', 0),
    S('arm', 'asta', 'Ad asta', 'FR', 'BO', 0),
    S('arm', 'arm_x', '', '', 'BO', 0),
    S('gen', 'arrampic', 'Arrampicarsi', 'AG', 'MM', 0),
    S('gen', 'cavalc', 'Cavalcare', 'IT', 'MM', 0),
    S('gen', 'nuotare', 'Nuotare', 'AG', 'MM', 0),
    S('gen', 'tracce', 'Seguire tracce', 'IN', 'MS', 0),
    S('sot', 'spalle', 'Cogliere alle spalle', '', 'AS', 0, { noStat: 1, noProf: 1, noObj: 1, prog: 'spalle' }),
    S('sot', 'silenz', 'Muoversi silenziosamente', 'AG', 'MM', 0),
    S('sot', 'nascond', 'Nascondersi', 'PR', 'MS', 0, { link: 'silenz' }),
    S('sot', 'serrat', 'Scassinare serrature', 'IN', 'MS', 0),
    S('sot', 'trappole', 'Disattivare trappole', 'IT', 'MS', 0),
    S('mag', 'rune', 'Lettura delle rune', 'IN', 'MS', 0),
    S('mag', 'ogg_mag', 'Usare oggetti magici', 'IT', 'MS', 0),
    S('mag', 'inc_dir', 'Incantesimi diretti', 'AG', 'BO', 0),
    S('mag', 'inc_base', 'Incantesimi base', '', 'BO', 0, { noStat: 1, noRanks: 1 }),
    S('ama', 'att_nov', 'Attacco novizio', 'FR', 'BO', 0),
    S('ama', 'att_std', 'Attacco standard', 'FR', 'BO', 0),
    S('ama', 'att_esp', 'Attacco esperto', 'FR', 'BO', 0),
    S('ama', 'pre_nov', 'Presa novizio', 'AG', 'BO', 0),
    S('ama', 'pre_std', 'Presa standard', 'AG', 'BO', 0),
    S('ama', 'pre_esp', 'Presa esperto', 'AG', 'BO', 0),
    S('amd', 'adren', 'Difesa adrenalinica', '', 'AS', 0, { noStat: 1, noProf: 1 }),
    S('var', 'percez', 'Percezione', 'IT', 'MS', 0),
    S('var', 'res_fis', 'Resistenza fisica', 'CO', 'AS', 5, { prog: 'manual' })
  ];
  var SKILL_BY_KEY = {};
  SKILLS.forEach(function (s) { SKILL_BY_KEY[s.k] = s; });

  /* Bonus difensivo, leadership e tiri resistenza: [chiave, nome, caratteristica, è un TR con modifica di popolo] */
  var DEFENSES = [
    ['lead', 'Leadership e influenza', 'PR', 0], ['bd', 'Bonus difensivo', 'AG', 0],
    ['ess', 'TR contro Essenza', 'IN', 1], ['fls', 'TR contro Flusso', 'IT', 1],
    ['men', 'TR contro Mentalismo', 'PR', 1], ['vel', 'TR contro Veleni', 'CO', 1],
    ['mal', 'TR contro Malattie', 'CO', 1], ['cal', 'TR contro Calore', 'CO', 0],
    ['fre', 'TR contro Freddo', 'CO', 0], ['pau', 'TR contro Paura', 'PR', 0]
  ];

  /* TB-1: bonus alle caratteristiche */
  var TB1 = [
    { from: 102, to: 102, bonus: 35 }, { from: 101, to: 101, bonus: 30 }, { from: 100, to: 100, bonus: 25 },
    { from: 98, to: 99, bonus: 20 }, { from: 95, to: 97, bonus: 15 }, { from: 90, to: 94, bonus: 10 },
    { from: 75, to: 89, bonus: 5 }, { from: 25, to: 74, bonus: 0 }, { from: 10, to: 24, bonus: -5 },
    { from: 5, to: 9, bonus: -10 }, { from: 3, to: 4, bonus: -15 }, { from: 2, to: 2, bonus: -20 },
    { from: 1, to: 1, bonus: -25 }
  ];

  /* TB-4: bonus ai gradi. steps = [grado massimo della fascia, bonus per grado] */
  var PROG = {
    primary: { zero: -25, steps: [[10, 5], [20, 2], [30, 1], [Infinity, 0.5]] },
    spalle: { zero: 0, steps: [[10, 1], [20, 1], [30, 0.5], [Infinity, 0]], cap: 25 }
  };

  /* TB-3: modifiche speciali per popolo */
  function P(n, st, tr) {
    return { n: n, st: { FR: st[0], AG: st[1], CO: st[2], IN: st[3], IT: st[4], PR: st[5] },
      tr: { ess: tr[0], fls: tr[1], men: tr[2], vel: tr[3], mal: tr[4] } };
  }
  var POPOLI = [
    P('Hobbit', [-20, 15, 15, 0, -5, -5], [50, 20, 40, 30, 15]),
    P('Umli', [5, 0, 10, 0, -5, -5], [20, 0, 20, 5, 5]),
    P('Nani', [5, -5, 15, 0, -5, -5], [40, 0, 40, 20, 10]),
    P('Wose', [0, 0, 5, 0, 5, -5], [20, 0, 0, 0, 0]),
    P('Uomini', [5, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0]),
    P('Dùnedain', [10, 0, 10, 0, 0, 5], [0, 0, 0, 5, 15]),
    P('Mezzelfi', [5, 5, 5, 0, 0, 5], [-5, -5, -5, 5, 50]),
    P('Elfi Silvani', [0, 10, 0, 0, 5, 5], [-5, -5, -5, 10, 100]),
    P('Elfi Sindar', [0, 10, 5, 0, 5, 10], [-5, -5, -5, 10, 100]),
    P('Elfi Noldor', [0, 15, 10, 5, 5, 15], [-5, -5, -5, 10, 100]),
    P('Mezzorchi', [5, 0, 5, 0, 0, -5], [0, 0, 0, 10, 0]),
    P('Orchetti', [5, -5, 15, -10, -10, -10], [0, 0, 0, 20, 5]),
    P('Uruk-hai', [10, 0, 20, 0, -5, -10], [0, 0, 0, 20, 5]),
    P('Mezzitroll', [10, -5, 10, -5, -5, -5], [0, 0, 0, 15, 5]),
    P('Troll', [15, -10, 15, -15, -15, -10], [0, 0, 0, 30, 10]),
    P('Olog-hai', [20, -5, 15, -5, -10, -10], [0, 0, 0, 20, 10])
  ];

  /* TE-5: punti esperienza per livello (dal 21° in poi, +50.000 per livello) */
  var XP = [10000, 20000, 30000, 40000, 50000, 70000, 90000, 110000, 130000, 150000,
    180000, 210000, 240000, 260000, 300000, 340000, 380000, 420000, 460000, 500000];

  /* TFC-2: giorni di guarigione per ferite lievi. Colonne: scottatura, ossa, tessuti, testa, organi, muscoli e tendini.
     Righe per "tiro + bonus CO": <=-26, -25/15, 16/35, 36/65, 66/90, >=91. Medie x5, gravi x10. */
  var HEAL_COLS = ['Scottatura', 'Ossa', 'Tessuti', 'Testa', 'Organi', 'Muscoli e tendini'];
  var HEAL_ROWS = [
    { max: -26, days: [4, 7, 5, 13, 13, 11] },
    { max: 15, days: [3, 5, 3, 10, 9, 7] },
    { max: 35, days: [2, 3, 2, 7, 6, 4] },
    { max: 65, days: [2, 2, 1, 5, 4, 3] },
    { max: 90, days: [1, 1, 1, 3, 3, 2] },
    { max: Infinity, days: [1, 1, 1, 2, 2, 1] }
  ];

  /* Modificatori al Bonus Offensivo (Combattimento, «Modificatori al Bonus Offensivo»). melee: non valgono con armi da tiro o da lancio;
     grp «pos»: si applica uno solo tra stordito, atterrato e prono (il più alto). */
  var ATK_MODS = [
    { id: 'fianco', label: 'Attacco sul fianco', v: 15, melee: true },
    { id: 'dietro', label: 'Attacco da dietro (oltre al fianco)', v: 20, melee: true },
    { id: 'sorpreso', label: 'Attacco di sorpresa', v: 20, melee: true },
    { id: 'stordito', label: 'Avversario stordito', v: 20, melee: true, grp: 'pos' },
    { id: 'atterrato', label: 'Avversario atterrato', v: 30, melee: true, grp: 'pos' },
    { id: 'prono', label: 'Avversario prono', v: 50, melee: true, grp: 'pos' },
    { id: 'nondom', label: 'Arma impugnata con la mano non dominante', v: -20 },
    { id: 'sfodera', label: "Sfoderare l'arma", v: -20 },
    { id: 'cambia_arma', label: "Cambiare un'arma o impugnare uno scudo", v: -50 },
    { id: 'cambia_mano', label: "Lasciare un'arma o lo scudo, cambiare mano", v: -10 },
    { id: 'lancio_veloce', label: 'Arma lanciata come azione veloce', v: -20 },
    { id: 'meta_pf', label: "L'attaccante ha perso più del 50% dei suoi PF", v: -20 },
    { id: 'cambia_obiettivo', label: "Cambiare obiettivo all'ultimo", v: -30 },
    { id: 'mira', label: 'Mirare, con armi da tiro o da lancio', v: -30 },
    { id: 'cieco', label: 'Accecato, al buio completo', v: -100 }
  ];


  /* Modificatore al tiro del colpo critico secondo la lettera */
  var CRIT_MOD = { T: -50, A: -20, B: -10, C: 0, D: 10, E: 20 };

  G.data = {
    STATS: STATS, CATS: CATS, SKILLS: SKILLS, SKILL_BY_KEY: SKILL_BY_KEY, DEFENSES: DEFENSES, TB1: TB1,
    PROG: PROG, POPOLI: POPOLI, XP: XP, HEAL_COLS: HEAL_COLS, HEAL_ROWS: HEAL_ROWS, ATK_MODS: ATK_MODS, CRIT_MOD: CRIT_MOD
  };
  if (typeof module !== 'undefined') module.exports = G.data;
})(typeof window !== 'undefined' ? window : globalThis);
