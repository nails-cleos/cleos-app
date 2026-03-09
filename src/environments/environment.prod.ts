import packageJson from '../../package.json';

export const environment = {
  production: true,
  useEmulators: false,
  firebaseMessaging: 'firebase-messaging-sw.js',
  recaptcha: {
    siteKey: '6LcJf10nAAAAAFDvt_OLXZQ5J9tOwwxjhtW3McoY',
  },
  appDomain: 'nailscleos.nl',
  appServer: 'https://www.nailscleos.nl',
  title: 'Nails Cleos',
  version: packageJson.version,
  baseUrl: 'https://api.nailscleos.nl/api',
  googleClientId: '174727853234-3pdb4doq776uuklfr7jsfp5ll33ork6c.apps.googleusercontent.com',
  facebookClientId: '523962545388946',
  firebase: {
    apiKey: 'AIzaSyCQw4--OYnNQTpsLe9yoaqVnT4z_csjnrk',
    authDomain: 'nails-cleos.firebaseapp.com',
    projectId: 'nails-cleos',
    storageBucket: 'nails-cleos.appspot.com',
    messagingSenderId: '174727853234',
    appId: '1:174727853234:web:6cf02667f8d913be34c5ab',
    measurementId: 'G-X9XEEDVFN4',
    vapidKey: 'BKiso9gE3_8fIrVVtY1pKS2vC6a93hAYOGMPlqVUBBUCVmuAtEtDw98El0Z-YQFIpEL_VsCbwYGiz05xzJnaWJY',
    databaseURL: 'https://nails-cleos-default-rtdb.europe-west1.firebasedatabase.app/',
  },
  awsIdentityPoolId: 'eu-central-1:4827bc2c-64a7-4942-8ec4-2052b86a3b8f',
  awsLoginsKey: 'securetoken.google.com/nails-cleos',
  awsExtractEnable: true,
  googleDriveUploadFile: true,
  googleMapKey: 'AIzaSyDI-kCD_XD9jNJ3tNcDVmkMuwCqljzudJg',
  showMap: true,
};
