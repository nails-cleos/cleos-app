import { Directive, HostListener, Input } from '@angular/core';
import { NavigationService } from '../services/navigation.service';
import { UntypedFormGroup } from '@angular/forms';
import { DialogComponent } from '../shared/dialog/dialog.component';
import { TranslateService } from '@ngx-translate/core';
import { MatDialog } from '@angular/material/dialog';

@Directive({
  selector: '[appBackButton]'
})
export class BackButtonDirective {
  @Input() form?: UntypedFormGroup;

  constructor(private navigation: NavigationService, private translate: TranslateService, public dialog: MatDialog) {
  }

  @HostListener('click')
  onClick(): void {
    if (this.form && !this.form.pristine) {
      const title = this.translate.instant('COMMON.BACK.TITLE');
      const content = this.translate.instant('COMMON.BACK.CONTENT');
      const dialogRef = this.dialog.open(DialogComponent, {
        data: {title, content, value: this.form}
      });

      dialogRef.afterClosed().subscribe(result => {
        if (result) {
          this.navigation.back();
        }
      });
    } else {
      this.navigation.back();
    }
  }
}
