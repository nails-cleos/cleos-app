import { Directive, HostListener, inject, Input } from '@angular/core';
import { NavigationService } from '../services/navigation.service';
import { UntypedFormGroup } from '@angular/forms';
import { DialogComponent } from '../shared/dialog/generic/dialog.component';
import { TranslateService } from '@ngx-translate/core';
import { MatDialog } from '@angular/material/dialog';
import { executeDialogNoWidth } from '../util/helper';

@Directive({
  selector: '[appBackButton]',
})
export class BackButtonDirective {
  @Input() form?: UntypedFormGroup;
  @Input() date?: Date;
  @Input() step?: number;

  private navigation: NavigationService = inject(NavigationService);
  private translate: TranslateService = inject(TranslateService);
  public dialog: MatDialog = inject(MatDialog);

  @HostListener('click')
  @HostListener('window:popstate')
  onClick = (): void => {
    if (this.form && !this.form.pristine) {
      const title = this.translate.instant('COMMON.BACK.TITLE');
      const content = this.translate.instant('COMMON.BACK.CONTENT');
      executeDialogNoWidth(this.dialog, DialogComponent, { title, content, value: this.form }, result => {
        if (result) {
          this.navigation.back(this.date, this.step);
        }
      });
    } else {
      this.navigation.back(this.date, this.step);
    }
  }
}
