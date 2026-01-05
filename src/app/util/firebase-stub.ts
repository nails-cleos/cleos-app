import { FirebaseApp } from '@firebase/app';
import { Analytics } from '@angular/fire/analytics';
import { Database } from '@angular/fire/database';
import { AppCheck } from '@angular/fire/app-check';

const fakeApp: FirebaseApp = {
  name: 'test-app',
  options: {
    apiKey: 'fake-api-key',
    authDomain: 'fake.firebaseapp.com',
    projectId: 'fake-project-id',
    storageBucket: 'fake.appspot.com',
    messagingSenderId: 'fake-sender-id',
    appId: 'fake-app-id',
    measurementId: 'G-FAKEID',
  },
  automaticDataCollectionEnabled: false,
};

export const FirebaseStub: Analytics | Database = {
  app: fakeApp,
};

export class AnalyticsStub implements Partial<Analytics> {
  app: FirebaseApp = fakeApp;

  logEvent(eventName: string, eventParams?: { [key: string]: any }): void {
    console.warn(`logEvent called: ${eventName}`, eventParams);
  }
}

export class AppCheckStub implements Partial<AppCheck> {
  app = fakeApp;

  getToken(): Promise<{ token: string; expireTimeMillis: number }> {
    return Promise.resolve({ token: 'fake-token', expireTimeMillis: Date.now() + 1000 });
  }
}

export const DatabaseStub = {
  ref: jasmine.createSpy('ref'),
  set: jasmine.createSpy('set'),
  get: jasmine.createSpy('get'),
};
