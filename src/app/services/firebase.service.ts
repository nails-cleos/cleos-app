import { computed, inject, Injectable, Signal, signal } from '@angular/core';
import { IdTokenResult, User, UserCredential } from 'firebase/auth';
import { Observable } from 'rxjs';
import { GetTokenOptions } from 'firebase/messaging';
import { FirebaseSdkService } from './firebase.config';

@Injectable({
  providedIn: 'root',
})
export class FirebaseService {
  private readonly sdk: FirebaseSdkService = inject(FirebaseSdkService);

  private _user = signal<User | null>(null);

  readonly user: Signal<User | null> = this._user;

  constructor() {
    this.sdk.getIdTokenChanged((user) => {
      this._user.set(user);
    });

    this.sdk
      .onRedirectResult()
      .then((result) => {
        if (result) {
          this._user.set(result.user);
        }
      })
      .catch((error) => {
        console.error('Redirect sign-in failed:', error);
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
    return this.sdk.appCheckToken();
  }

  getIdToken(forceRefresh?: boolean): Promise<string | null> {
    const user = this.currentUser;
    return user ? user.getIdToken(forceRefresh) : Promise.resolve(null);
  }

  authStateReady(): Promise<void> {
    return this.sdk.authStateReady();
  }

  async signUp(email: string, password: string): Promise<User> {
    return this.sdk.signUp(email, password);
  }

  signIn(email: string, password: string): Promise<UserCredential> {
    return this.sdk.signIn(email, password);
  }

  async signInWithGoogle(scope?: string): Promise<void> {
    await this.sdk.signInWithGoogle(scope);
  }

  async signInWithGooglePopup(scope?: string): Promise<UserCredential> {
    return this.sdk.signInWithGooglePopup(scope);
  }

  updateProfile({
    displayName,
    photoURL,
  }: {
    displayName?: string | null;
    photoURL?: string | null;
  }) {
    this.sdk
      .updateUserProfile({ displayName, photoURL }, this.currentUser)
      .catch(console.error);
  }

  sendVerificationEmail(): Promise<void> {
    return this.sdk.sendVerificationEmail(this.currentUser);
  }

  fetchSignInMethods(email: string): Promise<string[]> {
    return this.sdk.fetchSignInMethods(email);
  }

  sendPasswordResetEmail(email: string): Promise<void> {
    return this.sdk.sendPasswordReset(email);
  }

  signOut(): Promise<void> {
    return this.sdk.signOut();
  }

  updateToken(userId: string, token: string) {
    this.sdk
      .updateToken(userId, token)
      .then(() => console.warn('DB updated'))
      .catch(console.error);
  }

  getMessagingToken(options: GetTokenOptions): Promise<string | null> {
    return this.sdk.getAuthToken(options);
  }

  onMessageReceived(): Observable<any> {
    return new Observable((subscriber) => {
      let unsubscribe: (() => void) | undefined;

      this.sdk
        .getMessage((payload) => subscriber.next(payload))
        .then((unsubscribeFn) => {
          unsubscribe = unsubscribeFn;
        })
        .catch((error) => {
          subscriber.error(error);
        });

      return () => {
        unsubscribe?.();
      };
    });
  }

  logEvent(name: string, params?: Record<string, any>): void {
    this.sdk.logNewEvent(name, params);
  }
}
