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
import { getAnalytics, logEvent } from 'firebase/analytics';
import { environment } from '../../environments/environment';
import { Injectable } from '@angular/core';

const app = initializeApp(environment.firebase);

const auth = getAuth(app);
const database = getDatabase(app);
const messaging = getMessaging(app);
const analytics = getAnalytics(app);
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
  analytics = analytics;
  appCheck = appCheck;

  getToken = getToken;
  onMessage = onMessage;
  logEvent = logEvent;
  ref = ref;
  update = update;
  onIdTokenChanged = onIdTokenChanged;
}
