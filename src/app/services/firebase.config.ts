import { Injectable } from '@angular/core';
import { initializeApp } from 'firebase/app';
import {
  browserLocalPersistence,
  connectAuthEmulator,
  createUserWithEmailAndPassword,
  getAuth,
  getRedirectResult,
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
import {
  getMessaging,
  getToken as getMessagingToken,
  isSupported as isMessagingSupported,
  onMessage,
  type Messaging,
  GetTokenOptions,
} from 'firebase/messaging';
import {
  initializeAppCheck,
  ReCaptchaV3Provider,
  getToken as getAppCheckToken,
  type AppCheck,
} from 'firebase/app-check';
import {
  type Analytics,
  getAnalytics,
  isSupported as isAnalyticsSupported,
  logEvent,
} from 'firebase/analytics';
import { environment } from '../../environments/environment';
import {
  fetchSignInMethodsForEmail,
  sendPasswordResetEmail,
} from 'firebase/auth';

@Injectable({
  providedIn: 'root',
})
export class FirebaseSdkService {
  private readonly app = initializeApp(environment.firebase);

  private readonly auth = getAuth(this.app);
  private readonly database = getDatabase(this.app);

  private readonly appCheck: AppCheck = initializeAppCheck(this.app, {
    provider: new ReCaptchaV3Provider(environment.recaptcha.siteKey),
    isTokenAutoRefreshEnabled: true,
  });

  private readonly persistenceReady: Promise<void>;
  private readonly messagingReady: Promise<void>;

  private analytics?: Analytics;
  private messaging?: Messaging;

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

    this.messagingReady = isMessagingSupported()
      .then((supported) => {
        if (supported) {
          this.messaging = getMessaging(this.app);
        }
      })
      .catch((error) =>
        console.error('Failed to check Firebase Messaging support:', error),
      );

    isAnalyticsSupported()
      .then((supported) => {
        if (supported) {
          this.analytics = getAnalytics(this.app);
        }
      })
      .catch((error) =>
        console.error('Failed to check Firebase Analytics support:', error),
      );
  }

  logNewEvent(name: string, params?: Record<string, any>): void {
    const analytics = this.analytics;
    if (analytics) {
      logEvent(analytics, name, params);
    }
  }

  authStateReady = (): Promise<void> => this.auth.authStateReady();

  getIdTokenChanged = (callback: (user: User | null) => void): (() => void) =>
    onIdTokenChanged(this.auth, callback);

  onRedirectResult = (): Promise<UserCredential | null> =>
    getRedirectResult(this.auth);

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
    const userCredential = await createUserWithEmailAndPassword(
      this.auth,
      email,
      password,
    );
    return userCredential.user;
  }

  signIn = (email: string, password: string): Promise<UserCredential> =>
    signInWithEmailAndPassword(this.auth, email, password);

  updateUserProfile(
    {
      displayName,
      photoURL,
    }: { displayName?: string | null; photoURL?: string | null },
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

  fetchSignInMethods = (email: string): Promise<string[]> =>
    fetchSignInMethodsForEmail(this.auth, email);

  sendPasswordReset = (email: string): Promise<void> =>
    sendPasswordResetEmail(this.auth, email);

  signOut = (): Promise<void> => this.auth.signOut();

  async appCheckToken(): Promise<string | null> {
    try {
      const result = await getAppCheckToken(this.appCheck);
      return result.token;
    } catch (error) {
      console.error('Failed to get App Check token:', error);
      return null;
    }
  }

  async getAuthToken(options?: GetTokenOptions): Promise<string | null> {
    await this.messagingReady;

    const messaging = this.messaging;

    if (!messaging) {
      return null;
    }

    return getMessagingToken(messaging, options);
  }

  async getMessage(callback: (payload: any) => void): Promise<() => void> {
    await this.messagingReady;

    const messaging = this.messaging;

    if (!messaging) {
      return () => {};
    }

    return onMessage(messaging, callback);
  }

  updateToken(userId: string, token: string): Promise<void> {
    const collectionRef = ref(this.database, 'fcmTokens/');

    const data: Record<string, string> = {
      [userId]: token,
    };

    return update(collectionRef, data);
  }
}
