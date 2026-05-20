// Custom service worker additions — merged into the generated sw.js by next-pwa.
// Handles Web Push events for Otter Money.

// ── Push event: display notification ────────────────────────────────────────
self.addEventListener('push', function (event) {
  var data = {};
  try {
    data = event.data ? event.data.json() : {};
  } catch (_) {}

  var title = data.title || 'Otter Money';
  var options = {
    body: data.body || 'You have a new notification.',
    icon: '/icons/icon-192.png',
    badge: '/icons/icon-192.png',
    tag: data.tag || 'otter-money-push',
    data: { url: data.url || '/dashboard' },
    vibrate: [100, 50, 100],
    requireInteraction: false,
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

// ── Notification click: focus existing window or open URL ────────────────────
self.addEventListener('notificationclick', function (event) {
  event.notification.close();
  var targetUrl =
    (event.notification.data && event.notification.data.url) || '/dashboard';

  event.waitUntil(
    clients
      .matchAll({ type: 'window', includeUncontrolled: true })
      .then(function (clientList) {
        for (var i = 0; i < clientList.length; i++) {
          var client = clientList[i];
          if ('focus' in client) {
            return client.focus();
          }
        }
        if (clients.openWindow) {
          return clients.openWindow(targetUrl);
        }
      })
  );
});
