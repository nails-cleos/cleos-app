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
  type Analytics,
  getAnalytics,
  isSupported,
  logEvent,
} from 'firebase/analytics';
import { environment } from '../../environments/environment';

const app = initializeApp(environment.firebase);
const auth = getAuth(app);
const database = getDatabase(app);

if (environment.useEmulators) {
  connectAuthEmulator(auth, 'http://127.0.0.1:9099');
  connectDatabaseEmulator(database, 'localhost', 9000);
}

@Injectable({
  providedIn: 'root',
})
export class FirebaseSdkService {
  private readonly app = initializeApp(environment.firebase);

  readonly auth = getAuth(this.app);
  readonly database = getDatabase(this.app);
  readonly messaging = getMessaging(this.app);

  readonly appCheck = initializeAppCheck(this.app, {
    provider: new ReCaptchaV3Provider(environment.recaptcha.siteKey),
    isTokenAutoRefreshEnabled: true,
  });

  private analyticsInstance?: Analytics;

  constructor() {
    isSupported().then((supported) => {
      if (supported) {
        this.analyticsInstance = getAnalytics(this.app);
      }
    });
  }

  get analytics(): Analytics | undefined {
    return this.analyticsInstance;
  }

  getToken = getToken;
  onMessage = onMessage;
  logEvent = logEvent;
  ref = ref;
  update = update;
  onIdTokenChanged = onIdTokenChanged;
}
