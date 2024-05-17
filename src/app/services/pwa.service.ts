import { Injectable } from '@angular/core';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { Platform } from '@angular/cdk/platform';
import { take, timer } from 'rxjs';
import { PromptComponent } from '../shared/prompt/prompt.component';
import { filter } from 'rxjs/operators';
import { SwUpdate, VersionReadyEvent } from '@angular/service-worker';
import { CookieService } from 'ngx-cookie-service';

export const NOT_INSTALL_PWA = 'not_install_pwa';

@Injectable({ providedIn: 'root' })
export class PwaService {
  private promptEvent: any;

  constructor(private bottomSheet: MatBottomSheet, private platform: Platform, swUpdate: SwUpdate, private cookieService: CookieService) {
    if (swUpdate.isEnabled) {
      swUpdate.versionUpdates
        .pipe(filter((evt): evt is VersionReadyEvent => evt.type === 'VERSION_READY'))
        .subscribe(() => document.location.reload());
    }
  }

  public initPwaPrompt(): void {
    if (!this.cookieService.get(NOT_INSTALL_PWA)) {
      if (this.platform.ANDROID) {
        window.addEventListener('beforeinstallprompt', (event: any) => {
          event.preventDefault();
          this.promptEvent = event;
          this.openPromptComponent('android');
        });
      }
      if (this.platform.IOS) {
        const isInStandaloneMode = ('standalone' in window.navigator) && (window.navigator.standalone);
        if (!isInStandaloneMode) {
          this.openPromptComponent('ios');
        }
      }
    }
  }

  private openPromptComponent(mobileType: 'ios' | 'android'): void {
    timer(3000)
      .pipe(take(1))
      .subscribe(() => this.bottomSheet.open(PromptComponent, { data: { mobileType, promptEvent: this.promptEvent } }));
  }
}
