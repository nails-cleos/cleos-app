import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ShareButtonsComponent } from './share-buttons/share-buttons.component';
import { environment } from '../../../environments/environment';
import { MAT_BOTTOM_SHEET_DATA } from '@angular/material/bottom-sheet';
import { TranslateService } from '@ngx-translate/core';

export type BottomSheetShareData = {
  code: string;
}

@Component({
  selector: 'app-bottom-sheet-share',
  templateUrl: 'bottom-sheet-share.component.html',
  imports: [ShareButtonsComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BottomSheetShareComponent {
  private readonly translate: TranslateService = inject(TranslateService);
  private readonly data = inject<BottomSheetShareData>(MAT_BOTTOM_SHEET_DATA);

  private url = environment.appServer;

  code: string = `${this.url}/auth?code=${this.data.code}`;
  image = `${this.url}/assets/icons/icon-512x512.png`;
  message: string;

  constructor() {
    this.message = this.translate.instant('ME.REFERRAL.LINK', {
      code: this.data.code,
      url: this.code,
    });
  }
}
