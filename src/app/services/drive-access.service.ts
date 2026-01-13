import { inject, Injectable } from '@angular/core';
import { Auth, GoogleAuthProvider, signInWithPopup } from '@angular/fire/auth';
import { Store } from '@ngrx/store';
import { setDriveToken } from '../store/auth.actions';
import { getDriveTokenPipe } from '../store/selectors/auth.selectors';
import { toSignal } from '@angular/core/rxjs-interop';

@Injectable({ providedIn: 'root' })
export class DriveAccessService {
  private readonly auth: Auth = inject(Auth);
  private readonly store: Store = inject(Store);

  private driveToken$ = this.store.pipe(getDriveTokenPipe);
  driveTokenSignal = toSignal(this.driveToken$);

  private tokenRequested: boolean = false;

  private requestDriveAccess(): void {
    const provider = new GoogleAuthProvider();
    provider.addScope('https://www.googleapis.com/auth/drive');

    this.callSignInWithPopup(provider);
  }

  requestAccessIfNeeded(shouldRequest: boolean = true): void {
    const driveToken = this.driveTokenSignal();
    if (!driveToken && !this.tokenRequested && shouldRequest) {
      this.tokenRequested = true;
      this.requestDriveAccess();
    }
  }

  private callSignInWithPopup(provider: GoogleAuthProvider) {
    signInWithPopup(this.auth, provider)
      .then(result => {
        const credential = GoogleAuthProvider.credentialFromResult(result);
        if (credential?.accessToken) {
          this.store.dispatch(setDriveToken({ token: credential.accessToken }));
        }
      });
  }
}
