/* Nomi per popolo, per la pagina Crea. Raccolta fatta il 12/10/2026 da Tolkien Gateway (tolkiengateway.net, pagine di categoria dei personaggi
   e pagine dei singoli popoli); per gli Uruk i nomi sono quelli della pagina «Uruk-hai», per gli Orchi la categoria «Orcs».
   Sono nomi di personaggi del legendarium: la lista dei Variag, dei Lossoth, degli Haradrim ecc. è vuota perché le fonti consultate non ne danno.
   Nomi che compaiono solo in giochi o film (per esempio Lurtz, Suladân, Yrjänä) sono stati lasciati fuori.
   m = maschili, f = femminili, x = nomi di cui la fonte non dice il genere (si propongono in entrambi i casi). Non è una lista del compendio GIRSA.
   Seconda fonte, non canonica: «Names of Middle-earth» di Colin Chapman, elenco di un appassionato (v. 1.7.2, darkshire.net/jhkim/rpg/lordoftherings/names.pdf, senza dichiarazione di licenza),
   con nomi inventati sul modello delle lingue di Tolkien. Qui sta nei campi fm, ff, fcog (nomi maschili, femminili, cognomi); le varianti con la barra («Art/Artie») sono ridotte alla prima,
   i nomi troncati nel PDF («istlewool», «eo») sono stati lasciati fuori. */
(function (root) {
  'use strict';
  var G = root.GIRSA = root.GIRSA || {};
  function L(s) { return s.split(',').map(function (x) { return x.trim(); }).filter(Boolean); }
  var NOMI = {
    nani: { m: L("Thorin, Balin, Dwalin, Fíli, Kíli, Dori, Nori, Ori, Óin, Glóin, Bifur, Bofur, Bombur, Dáin, Náin, Thráin, Thrór, Fundin, Farin, Borin, Gimli, Narvi, Frerin, Flói, Frár, Frór, Lóni, Náli, Gróin, Grór, Azaghâl, Durin"), f: L("Dís"), x: [] },
    umli: { m: L("Mîm, Khîm, Ibun"), f: [], x: [] },
    noldor: { m: L("Fëanor, Maedhros, Maglor, Celegorm, Caranthir, Curufin, Amrod, Amras, Fingolfin, Fingon, Finarfin, Finrod, Angrod, Aegnor, Orodreth, Argon, Finwë, Gil-galad, Celebrimbor, Ecthelion, Glorfindel, Gildor, Pengolodh, Voronwë, Gwindor, Guilin, Mahtan, Finbor, Edrahil, Egalmoth"), f: L("Galadriel, Idril, Aredhel, Anairë, Findis, Finduilas, Míriel, Nerdanel, Írimë"), x: [] },
    sindar: { m: L("Thingol, Beleg, Círdan, Celeborn, Daeron, Dior, Elmo, Amdír, Amroth, Annael, Galathil, Galdor, Legolas, Mablung, Oropher, Thranduil, Eöl"), f: L("Celebrían, Elwing, Meril, Nellas, Nimloth"), x: [] },
    silvani: { m: L("Haldir, Rúmil, Orophin, Galion"), f: L("Nimrodel, Mithrellas"), x: [] },
    mezzelfi: { m: L("Elrond, Elros, Elladan, Elrohir, Eärendil, Eluréd, Elurín, Dior"), f: L("Arwen, Elwing"), x: [] },
    hobbit: { m: L("Bilbo, Frodo, Samwise, Peregrin, Meriadoc, Fredegar, Fastred, Folco, Fosco, Drogo, Dudo, Mungo, Largo, Longo, Lotho, Balbo, Bandobras, Basso, Berilac, Bodo, Bosco, Bungo, Dinodas, Doderic, Everard, Ferdibrand, Gorbadoc, Gormadoc, Hamfast, Hildibrand, Hob, Isembold, Isengrim, Madoc, Marcho, Adalgrim, Adelard, Anson"),
      f: L("Belladonna, Esmeralda, Lobelia, Amaranth, Asphodel, Berylla, Camellia, Celandine, Daisy, Diamond, Donnamira, Dora, Eglantine, Elanor, Gilly, Goldilocks, Jessamine, Lily, Linda, Malva, Marigold, Melilot, Mentha, Mimosa, Mirabella, Myrtle, Hilda, Laura, Lavender"), x: [],
      cognomi: L("Baggins, Took, Brandybuck, Bolger, Boffin, Proudfoot, Burrows, Bracegirdle, Chubb, Cotton, Gamgee, Hornblower, Grubb, Goodbody, Goodchild, Greenhand, Sackville, Underhill, Gardner, Bunce, Maggot, Roper, Banks, Diggle, Headstrong, Hayward, Oldbuck") },
    beorniani: { m: L("Beorn, Grimbeorn"), f: [], x: [] },
    corsari: { m: L("Angamaitë, Sangahyando"), f: [], x: [] },
    dunedain: { m: L("Elendil, Imrazôr, Imrahil, Amrothos, Elphir, Erchirion, Angbor, Anborn, Damrod, Hirluin, Húrin, Ingold, Ohtar, Estelmo, Aglahad, Angelimir, Borondir, Dervorin, Minohtar, Baranor, Adrahil"), f: L("Lothíriel, Finduilas, Ivorwen, Ivriniel, Morwen"), x: [] },
    dunlandiani: { m: L("Freca, Wulf"), f: [], x: [] },
    esterling: { m: L("Khamûl, Bór, Ulfang, Brodda, Lorgan, Uldor, Ulfast, Ulwarth, Borlach, Borlad, Borthand"), f: [], x: [] },
    gondoriani: { m: L("Boromir, Faramir, Denethor, Beregond, Bergil, Cirion, Eärnil, Eärnur, Ecthelion, Elboron, Eldacar, Forlong, Mardil, Minardil, Ondoher, Pelendur, Vorondil, Hallas, Hirgon, Duilin, Duinhir, Golasgil, Belecthor, Borlas, Calmacil, Ciryandil, Meneldil, Valacar, Damrod, Mablung, Targon"), f: L("Ioreth, Finduilas, Lothíriel, Rían, Gilmith, Fíriel, Ivriniel, Morwen, Berúthiel"), x: [] },
    numneri: { m: L("Herumor, Fuinur"), f: L("Berúthiel"), x: [] },
    rohirrim: { m: L("Eorl, Brego, Aldor, Baldor, Brytta, Déor, Dúnhere, Elfhelm, Elfwine, Éomer, Éomund, Éothain, Erkenbrand, Fengel, Folca, Folcwine, Fréa, Fréaláf, Fréawine, Gamling, Gárulf, Gléowine, Goldwine, Gram, Grimbold, Guthláf, Háma, Helm, Herefara, Herubrand, Horn, Marhath, Théoden, Théodred, Thengel, Walda, Wídfara, Ceorl, Eofor"), f: L("Éowyn, Elfhild, Hild, Théodwyn, Idis"), x: [] },
    wose: { m: L("Ghân, Ghân-buri-Ghân"), f: [], x: [] },
    orchetti: { m: [], f: [], x: L("Azog, Bolg, Golfimbul, Grishnákh, Lagduf, Muzgash, Ufthak, Gorgol, Lug, Boldog, Radbug, Shagram, Othrod, Balcmeg, Naglur-Danlo, Orcobal") },
    uruk: { m: [], f: [], x: L("Uglúk, Mauhúr, Shagrat") },
    troll: { m: L("Bert, Tom, William"), f: [], x: [] },
    eriadoriani: { m: [], f: [], x: [] },
    haradrim: { m: [], f: [], x: [] },
    boschi: { m: [], f: [], x: [] }
  };
  /* fonte non canonica (Chapman): [maschili, femminili, cognomi] */
  var FAN = {
    eriadoriani: [L("Barliman, Bill, Bob, Harry, Mat, Tom, Ted, Rob, Wil, Fred, Bert, Nick, Perry, Toby, Tod, Wally, Stan, Rod, Archie, Charlie, Herb, Win, Bran"), L("Daisy, Dora, Lily, Poppy, Rosa, Hazel, Holly, Ivy, Violet, Winnie, Tilly, Fern, Milly, Minnie, Hattie, Gertie"), L("Appledore, Birchdown, Blackthorn, Butterbur, Buttercup, Dogwood, Ferny, Goatleaf, Gooseberry, Harebell, Heathertoes, Honeystalk, Mawseed, Milkflower, Pickthorn, Rushlight, Whistletree, Whitebeam, Whortleberry")],
    dunlandiani: [L("Brac, Cadarn, Cadoc, Cant, Caradoc, Garnoc, Geth, Gormadoc, Gorsad, Madoc, Melmidoc, Marroc, Sadoc, Saradoc"), L("Berthoc, Cadi, Dera, Dicra, Heled, Modron, Sath, Sarf"), L("")],
    esterling: [L("Böri, Edgü, Gizik, Göktîg, Kargî, Kemik, Kiliç, Kustîg, Maltök, Margöz, Öldür, Sacal, Yaban, Yiltîg, Yumruk"), L("Ana, Katun, Kuzu, Mareke, Markiz, Oyna, Tîgeke, Tîgkiz, Yileke, Yilkiz"), L("")],
    haradrim: [L("Abaan, Adnan, Amr, Aqil, Bakr, Dirar, Ghasaan, Haarith, Haashim, Hannad, Hudhayfah, Ikrimah, Jibran, Jubayr, Khaldoon, Khuzaymah, Lubayd, Marwan, Maazin, Mus'ab, Muthanna, Na'man, Nawfal, Nizar, Qusay, Sufyan, Ubaadah, Ubayy, Udayl, Umar, Umaarah, Umayr, Utbah, Waqqas, Yaman, Yazan"), L("Da'd, Firyal, Hind, Khawlah, Mawiyah, May, Nusaybah, Ramlah, Rudaynah, Rumaylah, Rumaythah, Sawda, Suhayr, Sumayyaa, Tamadhur, Yusraa, Usaymah"), L("")],
    boschi: [L("Acbald, Acbeorn, Acgár, Acgrim, Actreo, Aldgrim, Aldraeg, Aldtreo, Baldac, Barac, Barald, Barfara, Bargár, Bargrim, Barhelm, Barhere, Barhyrde, Barmód, Barmund, Barwine, Bearugrim, Brermód, Grimbar, Heorot, Iwald, Iwgár, Iwtreo, Raegac, Raegwine, Sceotan, Treomód, Treowine"), L("Acwyn, Barhild, Barwyn, Bearuwyn, Brerwyn, Raegwyn, Treowyn"), L("")],
    wose: [L("Bhân-goru-Bhân, Bhôn-rema-Bhôn, Bhûn-daro-Bhûn, Dhân-moru-Dhân, Dhôn-bari-Dhôn, Dhûn-garo-Dhûn, Ghôn-rumi-ghôn, Ghûn-mera-ghûn, Rhân-duri-Rhân, Rhôn-damu-Rhôn, Rhûn-bamo-Rhûn"), L(""), L("")],
    beorniani: [L("Beran, Beranald, Beranbold, Berangár, Berangrim, Beranhame, Beranhelm, Beranhere, Beranmód, Beranmund, Beranor, Beranwine, Grim, Grimald, Grimbold, Grimfara, Grimfast, Grimgár, Grimhelm, Grimhere, Grimwine"), L("Beornhild, Beornwyn, Beranhild, Beranwyn, Grimhild, Grimwyn"), L("")]
  };
  Object.keys(FAN).forEach(function (k) { var n = NOMI[k]; n.fm = FAN[k][0]; n.ff = FAN[k][1]; n.fcog = FAN[k][2]; });
  Object.keys(NOMI).forEach(function (k) { var n = NOMI[k]; n.fm = n.fm || []; n.ff = n.ff || []; n.fcog = n.fcog || []; });
  function pick(id, sesso, a, b) { var n = NOMI[id]; if (!n) return []; return sesso === 'm' ? n[a] : sesso === 'f' ? n[b] : n[a].concat(n[b]); }
  /* Nomi canonici di Tolkien (m/f + x) e nomi dell'elenco non canonico (Chapman). sesso: 'm', 'f' oppure '' (entrambi). */
  var api = { NOMI: NOMI,
    canon: function (id, sesso) { var n = NOMI[id]; return n ? pick(id, sesso, 'm', 'f').concat(n.x) : []; },
    fan: function (id, sesso) { return pick(id, sesso, 'fm', 'ff'); },
    nomi: function (id, sesso) { return api.canon(id, sesso).concat(api.fan(id, sesso)); },
    cognomi: function (id) { var n = NOMI[id]; return n ? n.cognomi ? n.cognomi.concat(n.fcog) : n.fcog : []; },
    fanCognomi: function (id) { return NOMI[id] ? NOMI[id].fcog : []; } };
  G.namedata = api;
  if (typeof module !== 'undefined') module.exports = api;
})(typeof window !== 'undefined' ? window : globalThis);
