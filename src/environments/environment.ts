// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The calendar of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  appServer: 'http://localhost:4200',
  title: 'Cleos DEV',
  version: require('../../package.json').version + '-dev',
  baseUrl: 'http://localhost:8080/api',
  mlUrl: 'https://sandbox.mercadopago.com.ar/checkout/v1/redirect',
  paypalUrl: 'https://sandbox.paypal.com/checkoutnow',
  paypalClientId: 'AYQf9jG1MjUXAvV0JmBzth6lYuZdl37de84J8U92PmNyH_dbefKq6EEvGkNgh1VdA6mU2U81AY6xbfn0',
  googleClientId: '364998384255-kk09n0fq6p79s7oim94ljevf8bb0etip.apps.googleusercontent.com',
  facebookClientId: '453309609006101',
  firebase: {
    apiKey: "AIzaSyBHkZS6OP4IOLe6EI6jkGBYZTiHP2CIn7M",
    authDomain: "nails-cleos-dev.firebaseapp.com",
    projectId: "nails-cleos-dev",
    storageBucket: "nails-cleos-dev.appspot.com",
    messagingSenderId: "364998384255",
    appId: "1:364998384255:web:a39b48b0b30392aefcbd4a",
    measurementId: "G-Q2NR1R8MWQ",
    vapidKey: "BJOQTLLmUxq8uJ3aE19sB7Hhda7MAx0K7aI5A9BXfA2TJyaMHU7rbLDyAGTSe-8dahCyj7zJVK8VqWHeE3PFTc8",
    databaseURL: "https://nails-cleos-dev-default-rtdb.europe-west1.firebasedatabase.app"
  },
  googleMapKey: 'AIzaSyBVYE6eWD4Ekmb4xdWz_N4QKk5p4Q8oIcc'
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/plugins/zone-error';  // Included with Angular CLI.
