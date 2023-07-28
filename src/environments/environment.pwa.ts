export const environment = {
  production: true,
  useEmulators: false,
  recaptcha: {
    siteKey: '6Lc7KGEnAAAAAERpXU8AdaBpHtqGz9cuD6C8DTmZ'
  },
  appServer: 'http://localhsot:4200',
  title: 'Cleos PWA',
  version: require('../../package.json').version + '-pwa',
  baseUrl: 'http://localhost:9999/api',
  googleClientId: '364998384255-kk09n0fq6p79s7oim94ljevf8bb0etip.apps.googleusercontent.com',
  facebookClientId: '453309609006101',
  firebase: {
    apiKey: 'AIzaSyBHkZS6OP4IOLe6EI6jkGBYZTiHP2CIn7M',
    authDomain: 'nails-cleos-dev.firebaseapp.com',
    projectId: 'nails-cleos-dev',
    storageBucket: 'nails-cleos-dev.appspot.com',
    messagingSenderId: '364998384255',
    appId: '1:364998384255:web:a39b48b0b30392aefcbd4a',
    measurementId: 'G-Q2NR1R8MWQ',
    vapidKey: 'BJOQTLLmUxq8uJ3aE19sB7Hhda7MAx0K7aI5A9BXfA2TJyaMHU7rbLDyAGTSe-8dahCyj7zJVK8VqWHeE3PFTc8',
    databaseURL: 'https://nails-cleos-dev-default-rtdb.europe-west1.firebasedatabase.app'
  },
  googleMapKey: 'AIzaSyAkKXZ_Qi3MLge6Jjhi1bw0OXawDAbJgXc'
};
