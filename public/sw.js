function receivePushNotification(event) {
  console.log("[Service Worker] Push Received.");

  const { image, tag, url, title, text } = event.data.json();

  const options = {
    data: url,
    body: text,
    icon: image,
    vibrate: [200, 100, 200],
    tag: tag,
    image: image,
    badge: "/media/logos/favicon.ico",
    requireInteraction: true,
    actions: [{ action: 'close', title: "Close" }, { action: 'open', title: "Open" }]
  };
  event.waitUntil(self.registration.showNotification(title, options));
}

function openPushNotification(event) {
  console.log("[Service Worker] Notification click Received.", event.notification.data);

  event.notification.close();

  switch (event.action) {
    case 'close': console.log('Closed notification'); break;
    case 'open':  event.waitUntil(clients.openWindow(event.notification.data)); break;
  }
}

self.addEventListener("push", receivePushNotification);
self.addEventListener("notificationclick", openPushNotification);

