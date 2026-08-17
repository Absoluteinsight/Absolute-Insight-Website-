const CACHE_VERSION = 'ai-v16';
const CACHE_NAME = `absolute-insight-${CACHE_VERSION}`;
const SHELL_URLS = ['./', './index.html', './manifest.json'];
self.addEventListener('install', e => { e.waitUntil(caches.open(CACHE_NAME).then(c => c.addAll(SHELL_URLS))); self.skipWaiting(); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k.startsWith('absolute-insight-') && k !== CACHE_NAME).map(k => caches.delete(k))))); self.clients.claim(); });
self.addEventListener('fetch', e => { const {request:r} = e; if(r.method!=='GET') return; const isHTML = r.headers.get('accept')?.includes('text/html'); if(isHTML){e.respondWith(fetch(r).then(res=>{const c=res.clone();caches.open(CACHE_NAME).then(ca=>ca.put(r,c));return res;}).catch(()=>caches.match(r).then(c=>c||caches.match('./index.html'))));return;} e.respondWith(caches.match(r).then(c=>{if(c)return c;return fetch(r).then(res=>{const cp=res.clone();caches.open(CACHE_NAME).then(ca=>ca.put(r,cp));return res;}).catch(()=>c);})); });
