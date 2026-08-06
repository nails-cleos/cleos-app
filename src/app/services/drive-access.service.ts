import { inject, Injectable } from '@angular/core';
import { AuthStore } from '../store/auth.store';

@Injectable({
  providedIn: 'root',
})
export class DriveAccessService {
  private readonly authStore = inject(AuthStore);

  private driveTokenSignal = this.authStore.driveToken;

  private tokenRequested: boolean = false;

  requestAccessIfNeeded(shouldRequest: boolean = true): void {
    const driveToken = this.driveTokenSignal();
    if (!driveToken && !this.tokenRequested && shouldRequest) {
      this.tokenRequested = true;
      this.requestDriveAccess();
    }
  }

  private requestDriveAccess(): void {
    this.authStore.getDriveToken();
  }
}
