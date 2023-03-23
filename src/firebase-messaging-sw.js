importScripts("https://www.gstatic.com/firebasejs/9.1.3/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/9.1.3/firebase-messaging-compat.js");

firebase.initializeApp({
  projectId: 'nails-cleos-dev',
  appId: '1:364998384255:web:a39b48b0b30392aefcbd4a',
  storageBucket: 'nails-cleos-dev.appspot.com',
  apiKey: 'AIzaSyBHkZS6OP4IOLe6EI6jkGBYZTiHP2CIn7M',
  authDomain: 'nails-cleos-dev.firebaseapp.com',
  messagingSenderId: '364998384255'
});
const messaging = firebase.messaging();
