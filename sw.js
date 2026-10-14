/* Service worker: tiene l'app disponibile senza rete. Rete per prima, copia salvata come ripiego; cambia VERSION a ogni rilascio. */
var VERSION = 'girsa-v11';
var FILES = ['./', 'index.html', 'manifest.webmanifest', 'icons/icon.svg', 'css/app.css',
  'js/data.js', 'js/rules.js', 'js/dice.js', 'js/tables.js', 'js/tabledata.js', 'js/weapondata.js', 'js/geardata.js', 'js/gear.js', 'js/worlddata.js', 'js/world.js', 'js/combatdata.js', 'js/combatrules.js', 'js/creationdata.js', 'js/creationpdf.js', 'js/secdata.js', 'js/creation.js', 'js/store.js', 'js/ui.js',
  'js/sheet.js', 'js/refcombat.js', 'js/namedata.js', 'js/createpage.js', 'js/refpage.js', 'js/dicepage.js', 'js/magic.js', 'js/magicpage.js', 'js/gearpage.js', 'js/worldpage.js', 'js/combat.js', 'js/diary.js', 'js/datapage.js', 'js/app.js'];
self.addEventListener('install', function (e) { e.waitUntil(caches.open(VERSION).then(function (c) { return c.addAll(FILES); }).then(function () { return self.skipWaiting(); })); });
self.addEventListener('activate', function (e) {
  e.waitUntil(caches.keys().then(function (ks) { return Promise.all(ks.filter(function (k) { return k !== VERSION; }).map(function (k) { return caches.delete(k); })); }).then(function () { return self.clients.claim(); }));
});
self.addEventListener('fetch', function (e) {
  if (e.request.method !== 'GET') return;
  /* Prima la rete (così gli aggiornamenti arrivano subito), poi la copia salvata se manca la connessione. */
  e.respondWith(fetch(e.request).then(function (res) {
    if (res && res.ok && new URL(e.request.url).origin === self.location.origin) { var copy = res.clone(); caches.open(VERSION).then(function (c) { c.put(e.request, copy); }); }
    return res;
  }).catch(function () { return caches.match(e.request); }));
});
