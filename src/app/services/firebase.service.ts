import { computed, inject, Injectable, Signal, signal } from '@angular/core';
import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  IdTokenResult,
  sendEmailVerification,
  signInWithEmailAndPassword,
  signInWithPopup,
  updateProfile,
  User,
  UserCredential,
} from 'firebase/auth';
import {
  fetchSignInMethodsForEmail,
  sendPasswordResetEmail,
} from '@firebase/auth';
import { Observable } from 'rxjs';
import { GetTokenOptions } from '@firebase/messaging';
import { FirebaseSdkService } from './firebase.config';

@Injectable({
  providedIn: 'root',
})
export class FirebaseService {
  private readonly sdk: FirebaseSdkService = inject(FirebaseSdkService);

  private _user = signal<User | null>(null);

  readonly user: Signal<User | null> = this._user;

  constructor() {
    this.sdk.onIdTokenChanged(this.sdk.auth, (user) => {
      this._user.set(user);
    });
  }

  private get currentUser(): User | null {
    return this._user();
  }

  readonly isAuthenticated: Signal<boolean> = computed(() => !!this._user());

  get idTokenResult(): Promise<IdTokenResult | null> {
    const user = this.currentUser;
    return user ? user.getIdTokenResult() : Promise.resolve(null);
  }

  get appCheckToken(): Promise<string | null> {
    return this.sdk.getToken(this.sdk.appCheck);
  }

  getIdToken(forceRefresh?: boolean): Promise<string | null> {
    const user = this.currentUser;
    return user ? user.getIdToken(forceRefresh) : Promise.resolve(null);
  }

  authStateReady(): Promise<void> {
    return this.sdk.auth.authStateReady();
  }

  signUp(email: string, password: string): Promise<User> {
    return createUserWithEmailAndPassword(this.sdk.auth, email, password).then(
      (cred) => cred.user,
    );
  }

  signIn(email: string, password: string): Promise<UserCredential> {
    return signInWithEmailAndPassword(this.sdk.auth, email, password);
  }

  signInWithGoogle(scope?: string): Promise<UserCredential> {
    const provider = new GoogleAuthProvider();
    if (scope) {
      provider.addScope(scope);
    }
    return signInWithPopup(this.sdk.auth, provider);
  }

  updateProfile({
    displayName,
    photoURL,
  }: {
    displayName?: string | null;
    photoURL?: string | null;
  }): Promise<void> {
    const user = this.currentUser;
    if (!user) {
      return Promise.reject(new Error('No current user'));
    }
    return updateProfile(user, { displayName, photoURL });
  }

  sendVerificationEmail(): Promise<void> {
    const user = this.currentUser;
    if (!user) {
      return Promise.reject(new Error('No current user'));
    }
    return sendEmailVerification(user);
  }

  fetchSignInMethods(email: string): Promise<string[]> {
    return fetchSignInMethodsForEmail(this.sdk.auth, email);
  }

  sendPasswordResetEmail(email: string): Promise<void> {
    return sendPasswordResetEmail(this.sdk.auth, email);
  }

  signOut(): Promise<void> {
    return this.sdk.auth.signOut();
  }

  updateToken(userId: string, token: string): Promise<void> {
    const collectionRef = this.sdk.ref(this.sdk.database, 'fcmTokens/');
    const data: Record<string, string> = { [userId]: token };
    return this.sdk.update(collectionRef, data);
  }

  getMessagingToken(options: GetTokenOptions): Promise<string> {
    return this.sdk.getToken(this.sdk.messaging, options);
  }

  onMessageReceived(): Observable<any> {
    return new Observable((subscriber) =>
      this.sdk.onMessage(this.sdk.messaging, (payload) =>
        subscriber.next(payload),
      ),
    );
  }

  logEvent(name: string, params?: Record<string, any>): void {
    const analytics = this.sdk.analytics;
    if (analytics) {
      this.sdk.logEvent(analytics, name, params);
    }
  }
}
