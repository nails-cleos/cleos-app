import { Component, inject } from '@angular/core';
import { ReactiveFormsModule, UntypedFormControl } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { TranslateModule } from '@ngx-translate/core';
import { AppMaterialModule } from '../../../util/app-material.module';

@Component({
  selector: 'app-calendar-dialog',
  templateUrl: './calendar-dialog.component.html',
  styleUrls: ['./calendar-dialog.component.scss'],
  imports: [AppMaterialModule, ReactiveFormsModule, TranslateModule]
})
export class CalendarDialogComponent {
  readonly dialogRef = inject(MatDialogRef<CalendarDialogComponent>);

  radio: UntypedFormControl = new UntypedFormControl('reservation');

  get onNoClick(): void {
    return this.dialogRef.close();
  }
}
