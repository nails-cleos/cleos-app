// Give the service worker access to Firebase Messaging.
// Note that you can only use Firebase Messaging here, other Firebase libraries
// are not available in the service worker.
importScripts('https://www.gstatic.com/firebasejs/8.6.3/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/8.6.3/firebase-messaging.js');

// Initialize the Firebase app in the service worker by passing in the
// messagingSenderId.
firebase.initializeApp({
  apiKey: 'AIzaSyDJC3gPZDvzcrMBExPPDV3rimiU05M064g',
  authDomain: 'nails-dev-app.firebaseapp.com',
  projectId: 'nails-dev-app',
  storageBucket: 'nails-dev-app.appspot.com',
  messagingSenderId: '1070844237569',
  appId: '1:1070844237569:web:45b694e3fc0255af982d00',
  measurementId: 'G-54BCEHX29Q'
});

// Retrieve an instance of Firebase Messaging so that it can handle background
// messages.
var messaging = firebase.messaging();
