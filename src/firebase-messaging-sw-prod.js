importScripts("https://www.gstatic.com/firebasejs/9.1.3/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/9.1.3/firebase-messaging-compat.js");

firebase.initializeApp({
  projectId: 'nails-cleos',
  appId: '1:174727853234:web:6cf02667f8d913be34c5ab',
  storageBucket: 'nails-cleos.appspot.com',
  apiKey: 'AIzaSyCQw4--OYnNQTpsLe9yoaqVnT4z_csjnrk',
  authDomain: 'nails-cleos.firebaseapp.com',
  messagingSenderId: '174727853234'
});
const messaging = firebase.messaging();
