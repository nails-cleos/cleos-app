import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FormControl, FormGroup, NonNullableFormBuilder, ReactiveFormsModule } from '@angular/forms';
import { API_LOCALE, getTime, getTimeNumber, newDateTimestamp } from '../../../util/dates';
import { AppMaterialModule } from '../../../util/app-material.module';
import { TranslatePipe } from '@ngx-translate/core';

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
  imports: [AppMaterialModule, ReactiveFormsModule, TranslatePipe],
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
