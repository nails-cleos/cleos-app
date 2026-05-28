import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import {
  MAT_DIALOG_DATA,
  MatDialogActions,
  MatDialogContent,
  MatDialogRef,
  MatDialogTitle,
} from '@angular/material/dialog';
import { FormControl, FormGroup, NonNullableFormBuilder, ReactiveFormsModule } from '@angular/forms';
import { API_LOCALE, getTime, getTimeNumber, newDateTimestamp } from '../../../util/dates';
import { TranslatePipe } from '@ngx-translate/core';
import { MatFormField, MatInput, MatLabel, MatPrefix } from '@angular/material/input';
import { MatDatepicker, MatDatepickerInput, MatDatepickerToggle } from '@angular/material/datepicker';
import { MatIcon } from '@angular/material/icon';
import { MatButton } from '@angular/material/button';
import { TimepickerComponent } from '../../../shared/clock-timepicker/timepicker.component';
import { TimepickerDirective } from '../../../shared/clock-timepicker/timepicker.directive';

type TrackingForm = {
  startedDate: FormControl<Date | undefined>;
  startedTime: FormControl<string>;
  completedDate: FormControl<Date | undefined>;
  completedTime: FormControl<string>;
}

type TrackingDialogData = {
  startedTimestamp: string | Date | number,
  completedTimestamp: string | Date | number,
}

@Component({
  selector: 'app-update-tracking-dialog',
  templateUrl: './update-tracking-dialog.component.html',
  styleUrl: './update-tracking-dialog.component.scss',
  imports: [MatFormField, MatLabel, MatInput, MatDatepickerInput, MatDatepickerToggle, MatDatepicker, MatIcon,
    MatButton, TranslatePipe, MatPrefix, ReactiveFormsModule, MatDialogTitle, MatDialogContent, TimepickerComponent,
    TimepickerDirective, MatDialogActions],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UpdateTrackingDialogComponent {
  private readonly formBuilder: NonNullableFormBuilder = inject(NonNullableFormBuilder);
  private readonly dialogRef: MatDialogRef<UpdateTrackingDialogComponent> = inject(
    MatDialogRef<UpdateTrackingDialogComponent>);
  private readonly data = inject<TrackingDialogData>(MAT_DIALOG_DATA);

  private readonly startedDateTime = newDateTimestamp(this.data.startedTimestamp);
  private readonly completedDateTime = newDateTimestamp(this.data.completedTimestamp);

  form: FormGroup<TrackingForm> = this.formBuilder.group<TrackingForm>({
    startedDate: this.formBuilder.control(this.startedDateTime),
    startedTime: this.formBuilder.control(getTime(this.startedDateTime)),
    completedDate: this.formBuilder.control(this.completedDateTime),
    completedTime: this.formBuilder.control(getTime(this.completedDateTime)),
  });

  get getForm(): TrackingForm {
    return this.form.controls;
  }

  onNoClick(): void {
    return this.dialogRef.close();
  }

  doAction(): void {
    let started;
    let completed;
    if (this.startedDateTime.getTime() !== this.getForm.startedDate.value?.getTime()) {
      started = this.getForm.startedDate.value?.toLocaleString(API_LOCALE);
    }
    if (this.completedDateTime.getTime() !== this.getForm.completedDate.value?.getTime()) {
      completed = this.getForm.completedDate.value?.toLocaleString(API_LOCALE);
    }
    if (started || completed) {
      return this.dialogRef.close({ started, completed });
    }

    return this.dialogRef.close();
  }

  timeChange = ($event: string, dateForm: FormControl): void => {
    const time = getTimeNumber($event);
    dateForm.value.setHours(time?.hour || 0, time?.minute || 0);
  };
}
