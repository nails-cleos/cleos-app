import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormControl, FormGroup, NonNullableFormBuilder, ReactiveFormsModule } from '@angular/forms';
import {
  MatDialogActions,
  MatDialogClose,
  MatDialogContent,
  MatDialogRef,
  MatDialogTitle,
} from '@angular/material/dialog';
import { TranslatePipe } from '@ngx-translate/core';
import { MatIcon } from '@angular/material/icon';
import { MatButton } from '@angular/material/button';
import { MatRadioButton, MatRadioGroup } from '@angular/material/radio';

type CalendarForm = {
  radio: FormControl<string>;
}

@Component({
  selector: 'app-calendar-dialog',
  templateUrl: './calendar-dialog.component.html',
  styleUrls: ['./calendar-dialog.component.scss'],
  imports: [MatIcon, MatButton, TranslatePipe, ReactiveFormsModule, MatDialogTitle, MatDialogContent, MatRadioGroup,
    MatRadioButton, MatDialogActions, MatDialogClose],
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
