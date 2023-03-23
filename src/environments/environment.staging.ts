export const environment = {
  production: true,
  appServer: 'https://cleos-staging.herokuapp.com',
  title: 'CLEOS STAGING',
  version: require('../../package.json').version + '-staging',
  baseUrl: 'https://cleos-api-staging.herokuapp.com/api',
  mlUrl: 'https://sandbox.mercadopago.com.ar/checkout/v1/redirect',
  paypalUrl: 'https://sandbox.paypal.com/checkoutnow',
  paypalClientId: 'AYQf9jG1MjUXAvV0JmBzth6lYuZdl37de84J8U92PmNyH_dbefKq6EEvGkNgh1VdA6mU2U81AY6xbfn0',
  googleClientId: '57757755712-1gcjdgbd0lkj4msirrmra9aglcb0vbmk.apps.googleusercontent.com',
  facebookClientId: '453309609006101',
  firebase: {
    apiKey: 'AIzaSyDJC3gPZDvzcrMBExPPDV3rimiU05M064g',
    authDomain: 'nails-dev-app.firebaseapp.com',
    projectId: 'nails-dev-app',
    storageBucket: 'nails-dev-app.appspot.com',
    messagingSenderId: '1070844237569',
    appId: '1:1070844237569:web:45b694e3fc0255af982d00',
    measurementId: 'G-54BCEHX29Q'
  },
  googleMapKey: 'AIzaSyBVYE6eWD4Ekmb4xdWz_N4QKk5p4Q8oIcc'
};
