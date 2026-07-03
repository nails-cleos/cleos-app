import { Directive, HostListener, inject, input } from '@angular/core';
import { NavigationService } from '../services/navigation.service';
import { FormGroup } from '@angular/forms';
import { DialogComponent } from '../shared/dialog/generic/dialog.component';
import { TranslateService } from '@ngx-translate/core';
import { MatDialog } from '@angular/material/dialog';
import { executeDialogNoWidth } from '../util/helper';

@Directive({
  selector: '[appBackButton]',
})
export class BackButtonDirective {
  form = input<FormGroup>();
  date = input<Date>();
  step = input<number>();

  private navigationService: NavigationService = inject(NavigationService);
  private translateService: TranslateService = inject(TranslateService);
  public dialog: MatDialog = inject(MatDialog);

  @HostListener('click') @HostListener('window:popstate') onClick = (): void => {
    const form = this.form();
    const date = this.date();
    const step = this.step();
    if (form && !form.pristine) {
      const title = this.translateService.instant('COMMON.BACK.TITLE');
      const content = this.translateService.instant('COMMON.BACK.CONTENT');
      executeDialogNoWidth(this.dialog, DialogComponent, { title, content, value: form }, result => {
        if (result) {
          this.navigationService.back(date, step);
        }
      });
    } else {
      this.navigationService.back(date, step);
    }
  };
}
