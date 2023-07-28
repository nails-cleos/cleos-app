importScripts('https://www.gstatic.com/firebasejs/9.18.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.18.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyBHkZS6OP4IOLe6EI6jkGBYZTiHP2CIn7M",
  authDomain: "nails-cleos-dev.firebaseapp.com",
  databaseURL: "https://nails-cleos-dev-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "nails-cleos-dev",
  storageBucket: "nails-cleos-dev.appspot.com",
  messagingSenderId: "364998384255",
  appId: "1:364998384255:web:a39b48b0b30392aefcbd4a",
  measurementId: "G-Q2NR1R8MWQ",
  vapidKey: 'BJOQTLLmUxq8uJ3aE19sB7Hhda7MAx0K7aI5A9BXfA2TJyaMHU7rbLDyAGTSe-8dahCyj7zJVK8VqWHeE3PFTc8'
});

// Retrieve an instance of Firebase Messaging so that it can handle background
// messages.
const messaging = firebase.messaging();
