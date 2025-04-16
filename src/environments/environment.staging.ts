import packageJson from '../../package.json';

export const environment = {
  production: true,
  useEmulators: true,
  firebaseMessaging: 'firebase-messaging-sw-dev.js',
  recaptcha: {
    siteKey: '6Ldp5DgoAAAAAO9KDBFMNoyuTaJpIoGx8a8D04so',
  },
  appDomain: 'cleos-staging.herokuapp.com',
  appServer: 'https://cleos-staging.herokuapp.com',
  title: 'CLEOS STAGING',
  version: packageJson.version + '-staging',
  baseUrl: 'http://localhost:8080/api',
  googleClientId: '364998384255-kk09n0fq6p79s7oim94ljevf8bb0etip.apps.googleusercontent.com',
  facebookClientId: '453309609006101',
  firebase: {
    apiKey: 'AIzaSyCIx8KV4QW1hJuOQWT3bKO4UkiQpCqU0dg',
    authDomain: 'nails-cleos-dev.firebaseapp.com',
    projectId: 'nails-cleos-dev',
    storageBucket: 'nails-cleos-dev.appspot.com',
    messagingSenderId: '364998384255',
    appId: '1:364998384255:web:a39b48b0b30392aefcbd4a',
    measurementId: 'G-Q2NR1R8MWQ',
    vapidKey: 'BJOQTLLmUxq8uJ3aE19sB7Hhda7MAx0K7aI5A9BXfA2TJyaMHU7rbLDyAGTSe-8dahCyj7zJVK8VqWHeE3PFTc8',
    databaseURL: 'https://nails-cleos-dev-default-rtdb.europe-west1.firebasedatabase.app',
  },
  googleMapKey: 'AIzaSyAkKXZ_Qi3MLge6Jjhi1bw0OXawDAbJgXc',
  showMap: false,
};
