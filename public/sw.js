self.addEventListener("push", (event) => {
  let data = {
    title: "tamagotchi-web",
    body: "Seu tamagotchi está precisando de você!",
  };
  try {
    if (event.data) data = { ...data, ...event.data.json() };
  } catch {
    /* plain text */
  }
  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: "/icons/icon-192.png",
      badge: "/icons/icon-192.png",
      tag: "tamagotchi-web",
    }),
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((c) => {
      const url = new URL("/play", self.location.origin).href;
      for (const client of c) {
        if (client.url.startsWith(self.location.origin) && "focus" in client)
          return client.navigate(url).then((c2) => c2?.focus?.());
      }
      if (clients.openWindow) return clients.openWindow(url);
    }),
  );
});

self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (e) => e.waitUntil(self.clients.claim()));
