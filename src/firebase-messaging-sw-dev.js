import {initializeApp} from 'https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js';
import {
  getMessaging,
  onBackgroundMessage,
  isSupported
} from 'https://www.gstatic.com/firebasejs/9.23.0/firebase-messaging-sw.js';

const app = initializeApp({
  apiKey: 'AIzaSyCIx8KV4QW1hJuOQWT3bKO4UkiQpCqU0dg',
  authDomain: 'nails-cleos-dev.firebaseapp.com',
  projectId: 'nails-cleos-dev',
  storageBucket: 'nails-cleos-dev.appspot.com',
  messagingSenderId: '364998384255',
  appId: '1:364998384255:web:a39b48b0b30392aefcbd4a',
  measurementId: 'G-Q2NR1R8MWQ',
  databaseURL: 'https://nails-cleos-dev-default-rtdb.europe-west1.firebasedatabase.app'
});

isSupported().then(isSupported => {

  if (isSupported) {

    const messaging = getMessaging(app);

    self.addEventListener('notificationclick', event => {
      event.notification.close();

      event.waitUntil(
        clients.matchAll({
          type: "window",
        }).then((clientList) => {
          const redirect = event.notification.actions[0].action;
          for (const client of clientList) {
            if (client.url === redirect && "focus" in client) return client.focus();
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
            icon: payload.notification.icon
          }
        ],
        vibrate: [200, 100, 200, 100, 200, 100, 200]
      }

      self.registration.showNotification(notificationTitle, notificationOptions);
    });
  }
});
