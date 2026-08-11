import { Injectable } from '@angular/core';
import { initializeApp } from 'firebase/app';
import { connectAuthEmulator, getAuth, onIdTokenChanged } from 'firebase/auth';
import {
  connectDatabaseEmulator,
  getDatabase,
  ref,
  update,
} from 'firebase/database';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';
import { initializeAppCheck, ReCaptchaV3Provider } from 'firebase/app-check';
import {
  getAnalytics,
  isSupported,
  logEvent,
  type Analytics,
} from 'firebase/analytics';
import { environment } from '../../environments/environment';

const app = initializeApp(environment.firebase);
const auth = getAuth(app);
const database = getDatabase(app);
const messaging = getMessaging(app);

let analytics: Analytics | undefined;

const appCheck = initializeAppCheck(app, {
  provider: new ReCaptchaV3Provider(environment.recaptcha.siteKey),
  isTokenAutoRefreshEnabled: true,
});

if (environment.useEmulators) {
  connectAuthEmulator(auth, 'http://127.0.0.1:9099');
  connectDatabaseEmulator(database, 'localhost', 9000);
}

@Injectable({
  providedIn: 'root',
})
export class FirebaseSdkService {
  auth = auth;
  messaging = messaging;
  database = database;
  appCheck = appCheck;

  get analytics(): Analytics | undefined {
    return analytics;
  }

  getToken = getToken;
  onMessage = onMessage;
  logEvent = logEvent;
  ref = ref;
  update = update;
  onIdTokenChanged = onIdTokenChanged;

  constructor() {
    isSupported().then((supported) => {
      if (supported) {
        analytics = getAnalytics(app);
      }
    });
  }
}
