import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormControl, FormGroup, NonNullableFormBuilder, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { TranslateModule } from '@ngx-translate/core';
import { AppMaterialModule } from '../../../util/app-material.module';

type CalendarForm = {
  radio: FormControl<string>;
}

@Component({
  selector: 'app-calendar-dialog',
  templateUrl: './calendar-dialog.component.html',
  styleUrls: ['./calendar-dialog.component.scss'],
  imports: [AppMaterialModule, ReactiveFormsModule, TranslateModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CalendarDialogComponent {
  private readonly formBuilder: NonNullableFormBuilder = inject(NonNullableFormBuilder);
  private readonly dialogRef = inject(MatDialogRef<CalendarDialogComponent>);

  form: FormGroup<CalendarForm> = this.formBuilder.group<CalendarForm>({
    radio: this.formBuilder.control('reservation'),
  });

  get getForm(): CalendarForm {
    return this.form.controls;
  }

  onNoClick() {
    this.dialogRef.close();
  }
}
