// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The calendar of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  recaptcha: {
    siteKey: '6LfEiF0nAAAAANfmwbXgOiMZg9TAzJjf4qNvr8uH'
  },
  appServer: 'http://localhost:4200',
  title: 'Cleos DEV',
  version: require('../../package.json').version + '-dev',
  baseUrl: 'http://localhost:9999/api',
  googleClientId: 'xxxx.apps.googleusercontent.com',
  facebookClientId: 'xxxx',
  firebase: {
    apiKey: 'xxx',
    authDomain: 'nails-cleos-dev.firebaseapp.com',
    projectId: 'nails-cleos-dev',
    storageBucket: 'nails-cleos-dev.appspot.com',
    messagingSenderId: 'xxxx',
    appId: 'xxxx',
    measurementId: 'G-xxx',
    vapidKey: 'xxxx',
    databaseURL: 'https://nails-cleos-dev-default-rtdb.europe-west1.firebasedatabase.app'
  },
  googleMapKey: 'AIzaSyAkKXZ_Qi3MLge6Jjhi1bw0OXawDAbJgXc'
};

