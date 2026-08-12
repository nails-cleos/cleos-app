import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import {
  MAT_BOTTOM_SHEET_DATA,
  MatBottomSheetRef,
} from '@angular/material/bottom-sheet';
import { NOT_INSTALL_PWA } from '@app/services/pwa.service';
import { CookieService } from 'ngx-cookie-service';
import { TranslatePipe } from '@ngx-translate/core';
import { MatIcon } from '@angular/material/icon';
import { MatButton, MatIconButton } from '@angular/material/button';
import { MatToolbar } from '@angular/material/toolbar';

type PromptData = {
  mobileType: 'ios' | 'android';
  promptEvent?: any;
};

@Component({
  selector: 'app-prompt-component',
  templateUrl: './prompt.component.html',
  styleUrls: ['./prompt.component.scss'],
  imports: [MatIcon, MatIconButton, MatButton, TranslatePipe, MatToolbar],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PromptComponent {
  private readonly bottomSheetRef: MatBottomSheetRef<PromptComponent> = inject(
    MatBottomSheetRef<PromptComponent>,
  );
  private readonly cookieService: CookieService = inject(CookieService);

  readonly data = inject<PromptData>(MAT_BOTTOM_SHEET_DATA);

  installPwa = (): void => {
    this.data.promptEvent.prompt();
    this.close();
  };

  close = (): void => {
    this.cookieService.set(NOT_INSTALL_PWA, 'true');
    this.bottomSheetRef.dismiss();
  };
}
