/* Service worker: tiene l'app disponibile senza rete. Cambia VERSION a ogni rilascio. */
var VERSION = 'girsa-v1';
var FILES = ['./', 'index.html', 'manifest.webmanifest', 'icons/icon.svg', 'css/app.css',
  'js/data.js', 'js/rules.js', 'js/dice.js', 'js/tables.js', 'js/tabledata.js', 'js/weapondata.js', 'js/store.js', 'js/ui.js',
  'js/sheet.js', 'js/dicepage.js', 'js/combat.js', 'js/diary.js', 'js/datapage.js', 'js/app.js'];
self.addEventListener('install', function (e) { e.waitUntil(caches.open(VERSION).then(function (c) { return c.addAll(FILES); }).then(function () { return self.skipWaiting(); })); });
self.addEventListener('activate', function (e) {
  e.waitUntil(caches.keys().then(function (ks) { return Promise.all(ks.filter(function (k) { return k !== VERSION; }).map(function (k) { return caches.delete(k); })); }).then(function () { return self.clients.claim(); }));
});
self.addEventListener('fetch', function (e) {
  if (e.request.method !== 'GET') return;
  e.respondWith(caches.match(e.request).then(function (r) { return r || fetch(e.request); }));
});
