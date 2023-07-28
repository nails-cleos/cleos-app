importScripts('https://www.gstatic.com/firebasejs/9.18.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.18.0/firebase-messaging-compat.js');

// Initialize the Firebase app in the service worker by passing in
// your app's Firebase config object.
// https://firebase.google.com/docs/web/setup#config-object
firebase.initializeApp({
  apiKey: 'AIzaSyCQw4--OYnNQTpsLe9yoaqVnT4z_csjnrk',
  authDomain: 'nails-cleos.firebaseapp.com',
  databaseURL: 'https://nails-cleos-default-rtdb.europe-west1.firebasedatabase.app/',
  projectId: 'nails-cleos',
  storageBucket: 'nails-cleos.appspot.com',
  messagingSenderId: '174727853234',
  appId: '1:174727853234:web:6cf02667f8d913be34c5ab',
  measurementId: 'G-X9XEEDVFN4',
  vapidKey: 'BKiso9gE3_8fIrVVtY1pKS2vC6a93hAYOGMPlqVUBBUCVmuAtEtDw98El0Z-YQFIpEL_VsCbwYGiz05xzJnaWJY'
});

// Retrieve an instance of Firebase Messaging so that it can handle background
// messages.
const messaging = firebase.messaging();
