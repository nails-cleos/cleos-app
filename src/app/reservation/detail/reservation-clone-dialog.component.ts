import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { SharedModule } from '../../shared/shared.module';
import { ChangeCustomerDialogComponent } from './change-customer-dialog.component';
import { filterDateRoom, getAvailability, getNowTimeZone, getStartEndDay, getTime } from '../../util/dates';
import { addMonths } from 'date-fns';
import { MAX_RESERVATION_MONTH } from '../../interfaces/reservation';

@Component({
    selector: 'app-reservation-clone-dialog',
    templateUrl: './reservation-clone-dialog.component.html',
    imports: [SharedModule]
})
export class ReservationCloneDialogComponent {
  form!: UntypedFormGroup;

  date: UntypedFormControl = new UntypedFormControl('', [
    Validators.required
  ]);

  time: UntypedFormControl = new UntypedFormControl('');

  maxCalendarDate: Date;
  minDate: string = '';
  maxDate: string = '';

  constructor(public dialogRef: MatDialogRef<ChangeCustomerDialogComponent>, @Inject(MAT_DIALOG_DATA) public data: any,
              private formBuilder: UntypedFormBuilder) {
    this.maxCalendarDate = addMonths(getNowTimeZone(), MAX_RESERVATION_MONTH);
    this.createForm();
    const { monday, tuesday, wednesday, thursday, friday, saturday, sunday } = getAvailability(this.data.room);
    const {
      min,
      max
    } = getStartEndDay(monday, tuesday, wednesday, thursday, friday, saturday, sunday, this.data.room.timeZone);
    if (min) {
      this.minDate = getTime(min);
    }
    if (max) {
      this.maxDate = getTime(max);
    }
    this.time.setValue(this.minDate)
  }

  get onNoClick(): void {
    return this.dialogRef.close();
  }

  get doAction(): void {
    return this.dialogRef.close({ date: this.date.value, time: this.time.value });
  }

  myFilter = (d: Date | null): boolean => filterDateRoom(d, this.data.room);

  private createForm = (): void => {
    this.form = this.formBuilder.group({
      date: this.date,
      start: this.time
    });
  }
}
