import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class LoadingOverlayService {
  private readonly _loading = signal(false);
  private activeRequests = 0;

  readonly isLoading = this._loading.asReadonly();

  show(): void {
    this.activeRequests += 1;
    this._loading.set(true);
  }

  hide(): void {
    this.activeRequests = Math.max(0, this.activeRequests - 1);
    this._loading.set(this.activeRequests > 0);
  }
}
