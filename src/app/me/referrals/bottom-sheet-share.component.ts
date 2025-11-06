import { Component, inject, Inject } from '@angular/core';
import { ShareButtonsComponent } from './share-buttons/share-buttons.component';
import { environment } from '../../../environments/environment';
import { MAT_BOTTOM_SHEET_DATA } from '@angular/material/bottom-sheet';
import { TranslateService } from '@ngx-translate/core';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';

@Component({
  selector: 'app-bottom-sheet-share',
  templateUrl: 'bottom-sheet-share.component.html',
  imports: [ShareButtonsComponent],
})
export class BottomSheetShareComponent {
  message: any;
  code: any;
  url = environment.appServer;
  image = `${this.url}/assets/icons/icon-512x512.png`;
  show: number;

  private translate: TranslateService = inject(TranslateService);
  private breakpointObserver: BreakpointObserver = inject(BreakpointObserver);

  constructor(@Inject(MAT_BOTTOM_SHEET_DATA) public data: { code: string }) {
    this.show = 7;
    this.breakpointObserver.observe([
      Breakpoints.XSmall,
      Breakpoints.Small,
    ]).subscribe(result => {
      if (result.matches) {
        this.show = 5;
      }
    });
    this.code = `${this.url}/auth?code=${data.code}`;
    this.message = this.translate.instant('ME.REFERRAL.LINK', {
      code: data.code,
      url: this.code,
    });
  }
}
