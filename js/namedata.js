/* Nomi per popolo, per la pagina Crea. Raccolta fatta il 12/10/2026 da Tolkien Gateway (tolkiengateway.net, pagine di categoria dei personaggi
   e pagine dei singoli popoli); per gli Uruk i nomi sono quelli della pagina «Uruk-hai», per gli Orchi la categoria «Orcs».
   Sono nomi di personaggi del legendarium: la lista dei Variag, dei Lossoth, degli Haradrim ecc. è vuota perché le fonti consultate non ne danno.
   Nomi che compaiono solo in giochi o film (per esempio Lurtz, Suladân, Yrjänä) sono stati lasciati fuori.
   m = maschili, f = femminili, x = nomi di cui la fonte non dice il genere (si propongono in entrambi i casi). Non è una lista del compendio GIRSA. */
(function (root) {
  'use strict';
  var G = root.GIRSA = root.GIRSA || {};
  function L(s) { return s.split(',').map(function (x) { return x.trim(); }).filter(Boolean); }
  var NOMI = {
    nani: { m: L('Thorin, Balin, Dwalin, Fíli, Kíli, Dori, Nori, Ori, Óin, Glóin, Bifur, Bofur, Bombur, Dáin, Náin, Thráin, Thrór, Fundin, Farin, Borin, Gimli, Narvi, Frerin, Flói, Frár, Frór, Lóni, Náli, Gróin, Grór, Azaghâl, Durin'), f: L('Dís'), x: [] },
    umli: { m: L('Mîm, Khîm, Ibun'), f: [], x: [] },
    noldor: { m: L('Fëanor, Maedhros, Maglor, Celegorm, Caranthir, Curufin, Amrod, Amras, Fingolfin, Fingon, Finarfin, Finrod, Angrod, Aegnor, Orodreth, Argon, Finwë, Gil-galad, Celebrimbor, Ecthelion, Glorfindel, Gildor, Pengolodh, Voronwë, Gwindor, Guilin, Mahtan, Finbor, Edrahil, Egalmoth'), f: L('Galadriel, Idril, Aredhel, Anairë, Findis, Finduilas, Míriel, Nerdanel, Írimë'), x: [] },
    sindar: { m: L('Thingol, Beleg, Círdan, Celeborn, Daeron, Dior, Elmo, Amdír, Amroth, Annael, Galathil, Galdor, Legolas, Mablung, Oropher, Thranduil, Eöl'), f: L('Celebrían, Elwing, Meril, Nellas, Nimloth'), x: [] },
    silvani: { m: L('Haldir, Rúmil, Orophin, Galion'), f: L('Nimrodel, Mithrellas'), x: [] },
    mezzelfi: { m: L('Elrond, Elros, Elladan, Elrohir, Eärendil, Eluréd, Elurín, Dior'), f: L('Arwen, Elwing'), x: [] },
    hobbit: { m: L('Bilbo, Frodo, Samwise, Peregrin, Meriadoc, Fredegar, Fastred, Folco, Fosco, Drogo, Dudo, Mungo, Largo, Longo, Lotho, Balbo, Bandobras, Basso, Berilac, Bodo, Bosco, Bungo, Dinodas, Doderic, Everard, Ferdibrand, Gorbadoc, Gormadoc, Hamfast, Hildibrand, Hob, Isembold, Isengrim, Madoc, Marcho, Adalgrim, Adelard, Anson'),
      f: L('Belladonna, Esmeralda, Lobelia, Amaranth, Asphodel, Berylla, Camellia, Celandine, Daisy, Diamond, Donnamira, Dora, Eglantine, Elanor, Gilly, Goldilocks, Jessamine, Lily, Linda, Malva, Marigold, Melilot, Mentha, Mimosa, Mirabella, Myrtle, Hilda, Laura, Lavender'), x: [],
      cognomi: L('Baggins, Took, Brandybuck, Bolger, Boffin, Proudfoot, Burrows, Bracegirdle, Chubb, Cotton, Gamgee, Hornblower, Grubb, Goodbody, Goodchild, Greenhand, Sackville, Underhill, Gardner, Bunce, Maggot, Roper, Banks, Diggle, Headstrong, Hayward, Oldbuck') },
    beorniani: { m: L('Beorn, Grimbeorn'), f: [], x: [] },
    corsari: { m: L('Angamaitë, Sangahyando'), f: [], x: [] },
    dunedain: { m: L('Elendil, Imrazôr, Imrahil, Amrothos, Elphir, Erchirion, Angbor, Anborn, Damrod, Hirluin, Húrin, Ingold, Ohtar, Estelmo, Aglahad, Angelimir, Borondir, Dervorin, Minohtar, Baranor, Adrahil'), f: L('Lothíriel, Finduilas, Ivorwen, Ivriniel, Morwen'), x: [] },
    dunlandiani: { m: L('Freca, Wulf'), f: [], x: [] },
    esterling: { m: L('Khamûl, Bór, Ulfang, Brodda, Lorgan, Uldor, Ulfast, Ulwarth, Borlach, Borlad, Borthand'), f: [], x: [] },
    gondoriani: { m: L('Boromir, Faramir, Denethor, Beregond, Bergil, Cirion, Eärnil, Eärnur, Ecthelion, Elboron, Eldacar, Forlong, Mardil, Minardil, Ondoher, Pelendur, Vorondil, Hallas, Hirgon, Duilin, Duinhir, Golasgil, Belecthor, Borlas, Calmacil, Ciryandil, Meneldil, Valacar, Damrod, Mablung, Targon'), f: L('Ioreth, Finduilas, Lothíriel, Rían, Gilmith, Fíriel, Ivriniel, Morwen, Berúthiel'), x: [] },
    numneri: { m: L('Herumor, Fuinur'), f: L('Berúthiel'), x: [] },
    rohirrim: { m: L('Eorl, Brego, Aldor, Baldor, Brytta, Déor, Dúnhere, Elfhelm, Elfwine, Éomer, Éomund, Éothain, Erkenbrand, Fengel, Folca, Folcwine, Fréa, Fréaláf, Fréawine, Gamling, Gárulf, Gléowine, Goldwine, Gram, Grimbold, Guthláf, Háma, Helm, Herefara, Herubrand, Horn, Marhath, Théoden, Théodred, Thengel, Walda, Wídfara, Ceorl, Eofor'), f: L('Éowyn, Elfhild, Hild, Théodwyn, Idis'), x: [] },
    wose: { m: L('Ghân, Ghân-buri-Ghân'), f: [], x: [] },
    orchetti: { m: [], f: [], x: L('Azog, Bolg, Golfimbul, Grishnákh, Lagduf, Muzgash, Ufthak, Gorgol, Lug, Boldog, Radbug, Shagram, Othrod, Balcmeg, Naglur-Danlo, Orcobal') },
    uruk: { m: [], f: [], x: L('Uglúk, Mauhúr, Shagrat') },
    troll: { m: L('Bert, Tom, William'), f: [], x: [] }
  };
  var api = { NOMI: NOMI, nomi: function (id, sesso) { var n = NOMI[id]; if (!n) return []; return (sesso === 'm' ? n.m : sesso === 'f' ? n.f : n.m.concat(n.f)).concat(n.x); },
    cognomi: function (id) { return (NOMI[id] && NOMI[id].cognomi) || []; } };
  G.namedata = api;
  if (typeof module !== 'undefined') module.exports = api;
})(typeof window !== 'undefined' ? window : globalThis);
