import { Injectable } from '@angular/core';
import { initializeApp } from 'firebase/app';
import {
  browserLocalPersistence,
  connectAuthEmulator,
  createUserWithEmailAndPassword,
  getAuth,
  GoogleAuthProvider,
  onIdTokenChanged,
  sendEmailVerification,
  setPersistence,
  signInWithEmailAndPassword,
  signInWithPopup,
  signInWithRedirect,
  updateProfile,
  User,
  UserCredential,
} from 'firebase/auth';
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
import {
  fetchSignInMethodsForEmail,
  sendPasswordResetEmail,
} from '@firebase/auth';
import { GetTokenOptions } from '@firebase/messaging';

@Injectable({
  providedIn: 'root',
})
export class FirebaseSdkService {
  private readonly persistenceReady: Promise<void>;

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
    this.persistenceReady = setPersistence(
      this.auth,
      browserLocalPersistence,
    ).catch((error) => {
      console.error('Failed to configure Firebase Auth persistence', error);
    });
    if (environment.useEmulators) {
      connectAuthEmulator(this.auth, 'http://127.0.0.1:9099');
      connectDatabaseEmulator(this.database, 'localhost', 9000);
    }

    isSupported().then((supported) => {
      if (supported) {
        this.analyticsInstance = getAnalytics(this.app);
      }
    });
  }

  private get analytics(): Analytics | undefined {
    return this.analyticsInstance;
  }

  logNewEvent(name: string, params?: Record<string, any>): void {
    const analytics = this.analytics;
    if (analytics) {
      logEvent(analytics, name, params);
    }
  }

  authStateReady(): Promise<void> {
    return this.auth.authStateReady();
  }

  appCheckToken(): Promise<string | null> {
    return getToken(this.appCheck);
  }

  getAuthToken(options?: GetTokenOptions): Promise<string> {
    return getToken(this.messaging, options);
  }

  getMessage(callback: (payload: any) => void): () => void {
    return onMessage(this.messaging, callback);
  }

  getIdTokenChanged(callback: (user: User | null) => void): () => void {
    return onIdTokenChanged(this.auth, callback);
  }

  updateToken(userId: string, token: string): Promise<void> {
    const collectionRef = ref(this.database, 'fcmTokens/');
    const data: Record<string, string> = { [userId]: token };
    return update(collectionRef, data);
  }

  async signInWithGoogle(scope?: string): Promise<void> {
    await this.persistenceReady;
    const provider = new GoogleAuthProvider();

    if (scope) {
      provider.addScope(scope);
    }

    const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

    if (isMobile) {
      await signInWithRedirect(this.auth, provider);
    } else {
      await signInWithPopup(this.auth, provider);
    }
  }

  async signInWithGooglePopup(scope?: string): Promise<UserCredential> {
    await this.persistenceReady;
    const provider = new GoogleAuthProvider();

    if (scope) {
      provider.addScope(scope);
    }

    return signInWithPopup(this.auth, provider);
  }

  async signUp(email: string, password: string): Promise<User> {
    const cred = await createUserWithEmailAndPassword(
      this.auth,
      email,
      password,
    );
    return cred.user;
  }

  signIn(email: string, password: string): Promise<UserCredential> {
    return signInWithEmailAndPassword(this.auth, email, password);
  }

  updateUserProfile(
    {
      displayName,
      photoURL,
    }: {
      displayName?: string | null;
      photoURL?: string | null;
    },
    user: User | null,
  ): Promise<void> {
    if (!user) {
      return Promise.reject(new Error('No current user'));
    }
    return updateProfile(user, { displayName, photoURL });
  }

  sendVerificationEmail(user: User | null): Promise<void> {
    if (!user) {
      return Promise.reject(new Error('No current user'));
    }
    return sendEmailVerification(user);
  }

  fetchSignInMethods(email: string): Promise<string[]> {
    return fetchSignInMethodsForEmail(this.auth, email);
  }

  sendPasswordReset(email: string): Promise<void> {
    return sendPasswordResetEmail(this.auth, email);
  }

  signOut(): Promise<void> {
    return this.auth.signOut();
  }
}
