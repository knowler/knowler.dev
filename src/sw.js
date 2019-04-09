const app = {
  name: 'knowler',
  version: 1,
  key: function(version) {
    return `${this.name}-v${version || this.version}`
  },
  paths: [
    '/',
    '/app-icon.png',
    '/app-splash.png',
    '/favicon.png',
    '/manifest.json',
  ]
}

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(app.key()).then(cache => cache.addAll(app.paths))
  )
})

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request.url) || fetch(event.request.url)
  )
})
