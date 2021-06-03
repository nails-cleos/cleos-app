// Give the service worker access to Firebase Messaging.
// Note that you can only use Firebase Messaging here, other Firebase libraries
// are not available in the service worker.
importScripts('https://www.gstatic.com/firebasejs/8.6.3/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/8.6.3/firebase-messaging.js');

// Initialize the Firebase app in the service worker by passing in the
// messagingSenderId.
firebase.initializeApp({
  apiKey: 'AIzaSyBJM3Um4v2jH9xEfOBaW5bWmeBqIBjiq9U',
  authDomain: 'cleos-315314.firebaseapp.com',
  projectId: 'cleos-315314',
  storageBucket: 'cleos-315314.appspot.com',
  messagingSenderId: '1075596698405',
  appId: '1:1075596698405:web:8bd616bd1fe8af1a7530cc',
  measurementId: 'G-NJ0ET4WH83'
});

// Retrieve an instance of Firebase Messaging so that it can handle background
// messages.
const messaging = firebase.messaging();
