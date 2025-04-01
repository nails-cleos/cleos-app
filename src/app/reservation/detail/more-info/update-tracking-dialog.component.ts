import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FormControl, ReactiveFormsModule, UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { API_LOCALE, getTime, getTimeNumber, newDateTimestamp } from '../../../util/dates';
import { AppMaterialModule } from '../../../util/app-material.module';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
    selector: 'app-update-tracking-dialog',
    templateUrl: './update-tracking-dialog.component.html',
    styleUrl: './update-tracking-dialog.component.scss',
  imports: [AppMaterialModule, ReactiveFormsModule, TranslatePipe]
})
export class UpdateTrackingDialogComponent implements OnInit {
  trackingForm!: UntypedFormGroup;
  startedDate: FormControl<Date | null> = new FormControl(null);
  startedTime: FormControl<any | null> = new FormControl('');
  completedDate: FormControl<Date | null> = new FormControl(null);
  completedTime: FormControl<any | null> = new FormControl('');

  private readonly startedDateTime?: Date
  private readonly completedDateTime?: Date

  constructor(public dialogRef: MatDialogRef<UpdateTrackingDialogComponent>, @Inject(MAT_DIALOG_DATA) public data: any,
              private formBuilder: UntypedFormBuilder) {
    const startedDateTime = newDateTimestamp(data.startedTimestamp);
    this.startedDateTime = newDateTimestamp(data.startedTimestamp);
    this.startedDate.setValue(startedDateTime);
    this.startedTime.setValue(getTime(startedDateTime));
    const completedDateTime = newDateTimestamp(data.completedTimestamp);
    this.completedDateTime = newDateTimestamp(data.completedTimestamp);
    this.completedDate.setValue(completedDateTime);
    this.completedTime.setValue(getTime(completedDateTime));
  }

  get onNoClick(): void {
    return this.dialogRef.close();
  }

  get doAction(): void {
    let started;
    let completed;
    if (this.startedDateTime?.getTime() !== this.startedDate.value?.getTime()) {
      started = this.startedDate.value?.toLocaleString(API_LOCALE);
    }
    if (this.completedDateTime?.getTime() !== this.completedDate.value?.getTime()) {
      completed = this.completedDate.value?.toLocaleString(API_LOCALE)
    }
    if (started || completed) {
      return this.dialogRef.close({ started, completed });
    }

    return this.dialogRef.close();
  }

  ngOnInit(): void {
    this.createForm();
  }

  timeChange = ($event: string, dateForm: FormControl): void => {
    const time = getTimeNumber($event);
    dateForm.value.setHours(time?.hour || 0, time?.minute || 0);
  }

  private createForm = (): void => {
    this.trackingForm = this.formBuilder.group({
      startedDate: this.startedDate,
      startedTime: this.startedTime,
      completedDate: this.completedDate,
      completedTime: this.completedTime
    });
  }
}
