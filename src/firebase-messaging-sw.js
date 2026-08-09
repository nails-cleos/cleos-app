import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js';
import {
  getMessaging,
  isSupported,
  onBackgroundMessage,
} from 'https://www.gstatic.com/firebasejs/9.23.0/firebase-messaging-sw.js';

const app = initializeApp({
  apiKey: 'AIzaSyCQw4--OYnNQTpsLe9yoaqVnT4z_csjnrk',
  authDomain: 'nails-cleos.firebaseapp.com',
  projectId: 'nails-cleos',
  storageBucket: 'nails-cleos.appspot.com',
  messagingSenderId: '174727853234',
  appId: '1:174727853234:web:6cf02667f8d913be34c5ab',
  measurementId: 'G-X9XEEDVFN4',
  databaseURL:
    'https://nails-cleos-default-rtdb.europe-west1.firebasedatabase.app/',
});

isSupported().then((isSupported) => {
  if (isSupported) {
    const messaging = getMessaging(app);

    self.addEventListener('notificationclick', (event) => {
      event.notification.close();

      event.waitUntil(
        clients
          .matchAll({
            type: 'window',
          })
          .then((clientList) => {
            const redirect = event.notification.actions[0].action;
            for (const client of clientList) {
              if (client.url === redirect && 'focus' in client)
                return client.focus();
            }
            if (clients.openWindow) return clients.openWindow(redirect);
          }),
      );
    });

    onBackgroundMessage(messaging, (payload) => {
      const notificationTitle = payload.notification.title;
      const notificationOptions = {
        body: payload.notification.body,
        icon: payload.notification.icon,
        image: payload.notification.image,
        data: payload.data,
        badge: payload.data.badge,
        tag: payload.data.id,
        actions: [
          {
            title: payload.data.actionTitle,
            action: payload.data.action,
            icon: payload.notification.icon,
          },
        ],
        vibrate: [200, 100, 200, 100, 200, 100, 200],
      };

      self.registration.showNotification(
        notificationTitle,
        notificationOptions,
      );
    });
  }
});
