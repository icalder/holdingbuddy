const version = '0.1.2';
const cacheName = 'holdingBuddy';
const staticAssets = [
    '/',
    'index.html',
    'manifest.json',
    'static/formelements.css',
    'static/style.css',
    'static/timer.svg',
    'static/icons/android-chrome-192x192.png',
    'static/icons/android-chrome-512x512.png'
];

// https://developers.google.com/web/fundamentals/primers/service-workers/lifecycle

self.addEventListener('install', async e => {
    console.log(`SW v${version} installing`);
    // Might want to use a unique cache name here - see activate handler also
    const cache = await caches.open(cacheName);    
    await cache.addAll(staticAssets);
});

self.addEventListener('message', e => {
    if (e.data.action === 'skipWaiting') {
        // If we don't skipWaiting, activate won't be fired until any current sw is no longer controlling clients
        // clients can be web pages, web workers etc.
        self.skipWaiting();
    }
  });

self.addEventListener('activate', e => {
    // activate fires when the old sw is gone and new sw is able to control clients
    console.log(`SW v${version} ready to handle fetches`);
    // If we use a unique cache name call caches.delete() for all (old) caches.keys() that don't match

    // Take control of uncontrolled clients - i.e. the page that registered us or detected a SW change
    // Fires controllerchange
    self.clients.claim();
});

self.addEventListener('fetch', async e => {
    const req = e.request;
    e.respondWith(cacheFirst(req));
});

async function cacheFirst(req) {
    const cache = await caches.open(cacheName);
    const cached = await cache.match(req);
    return cached || fetch(req);
}


