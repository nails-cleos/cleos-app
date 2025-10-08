import { Component, Inject } from '@angular/core';
import { MAT_BOTTOM_SHEET_DATA, MatBottomSheetRef } from '@angular/material/bottom-sheet';
import { NOT_INSTALL_PWA } from '../../services/pwa.service';
import { CookieService } from 'ngx-cookie-service';
import { AppMaterialModule } from '../../util/app-material.module';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-prompt-component',
  templateUrl: './prompt.component.html',
  styleUrls: ['./prompt.component.scss'],
  imports: [AppMaterialModule, TranslatePipe],
})
export class PromptComponent {

  constructor(@Inject(MAT_BOTTOM_SHEET_DATA) public data: { mobileType: 'ios' | 'android'; promptEvent?: any },
              private bottomSheetRef: MatBottomSheetRef<PromptComponent>, private cookieService: CookieService) {
  }

  installPwa = (): void => {
    this.data.promptEvent.prompt();
    this.close();
  };

  close = (): void => {
    this.cookieService.set(NOT_INSTALL_PWA, 'true');
    this.bottomSheetRef.dismiss();
  };
}
