import { inject, Injectable } from '@angular/core';
import { GoogleAuthProvider } from 'firebase/auth';
import { Store } from '@ngrx/store';
import { setDriveToken } from '../store/auth.actions';
import { getDriveTokenPipe } from '../store/selectors/auth.selectors';
import { toSignal } from '@angular/core/rxjs-interop';
import { FirebaseService } from './firebase.service';

@Injectable({ providedIn: 'root' })
export class DriveAccessService {
  private readonly store: Store = inject(Store);
  private readonly firebaseService = inject(FirebaseService);

  private driveToken$ = this.store.pipe(getDriveTokenPipe);
  private driveTokenSignal = toSignal(this.driveToken$);

  private tokenRequested: boolean = false;

  requestAccessIfNeeded(shouldRequest: boolean = true): void {
    const driveToken = this.driveTokenSignal();
    if (!driveToken && !this.tokenRequested && shouldRequest) {
      this.tokenRequested = true;
      this.requestDriveAccess();
    }
  }

  private requestDriveAccess(): void {
    this.firebaseService.signInWithGoogle('https://www.googleapis.com/auth/drive')
      .then(result => {
        const credential = GoogleAuthProvider.credentialFromResult(result);
        if (credential?.accessToken) {
          this.store.dispatch(setDriveToken({ token: credential.accessToken }));
        }
      });
  }
}
