import { ChangeDetectionStrategy, Component, computed, effect, inject, signal } from '@angular/core';
import {
  MAT_DIALOG_DATA,
  MatDialogActions,
  MatDialogContent,
  MatDialogRef,
  MatDialogTitle,
} from '@angular/material/dialog';
import { FormControl, FormGroup, NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { filterDateRoom, getAvailability, getNowTimeZone, getStartEndDay, getTime } from '../../util/dates';
import { addMonths } from 'date-fns';
import { MAX_RESERVATION_MONTH } from '../../interfaces/reservation';
import { TranslatePipe } from '@ngx-translate/core';
import { IRoomAll } from '../../interfaces/room';
import { MatError, MatFormField, MatInput, MatLabel, MatPrefix } from '@angular/material/input';
import { MatDatepicker, MatDatepickerInput, MatDatepickerToggle } from '@angular/material/datepicker';
import { MatIcon } from '@angular/material/icon';
import { MatButton } from '@angular/material/button';
import { TimepickerComponent } from '../../shared/clock-timepicker/timepicker.component';
import { TimepickerDirective } from '../../shared/clock-timepicker/timepicker.directive';

type CloneForm = {
  date: FormControl<Date | undefined>,
  time: FormControl<string>,
}

type CloneDialogData = {
  room: IRoomAll,
  small: boolean;
}

@Component({
  selector: 'app-reservation-clone-dialog',
  templateUrl: './reservation-clone-dialog.component.html',
  styleUrl: './reservation-clone-dialog.component.scss',
  imports: [MatFormField, MatLabel, MatInput, MatDatepickerInput, MatDatepickerToggle, MatDatepicker, MatIcon,
    MatButton, TranslatePipe, MatError, MatPrefix, ReactiveFormsModule, TimepickerComponent, TimepickerDirective,
    MatDialogContent, MatDialogTitle, MatDialogActions],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReservationCloneDialogComponent {
  private readonly formBuilder: NonNullableFormBuilder = inject(NonNullableFormBuilder);
  private readonly dialogRef: MatDialogRef<ReservationCloneDialogComponent> = inject(
    MatDialogRef<ReservationCloneDialogComponent>);
  readonly data = inject<CloneDialogData>(MAT_DIALOG_DATA);

  form: FormGroup<CloneForm> = this.formBuilder.group<CloneForm>({
    date: this.formBuilder.control<Date | undefined>(undefined, {
      validators: [Validators.required],
    }),
    time: this.formBuilder.control<string>(''),
  });

  maxCalendarDate: Date = addMonths(getNowTimeZone(), MAX_RESERVATION_MONTH);

  minDate = signal('');
  maxDate = signal('');

  private room = computed(() => this.data.room);

  constructor() {
    effect(() => {
      const room = this.room();
      const { monday, tuesday, wednesday, thursday, friday, saturday, sunday } = getAvailability(room);
      const { min, max } = getStartEndDay(monday, tuesday, wednesday, thursday, friday, saturday, sunday,
        room.timeZone);
      if (min) {
        const time = getTime(min);
        this.minDate.set(time);
        this.getForm.time.setValue(time);
      }
      if (max) {
        this.maxDate.set(getTime(max));
      }
    });
  }

  get getForm(): CloneForm {
    return this.form.controls;
  }

  onNoClick() {
    this.dialogRef.close();
  }

  doAction() {
    this.dialogRef.close({ date: this.getForm.date.value, time: this.getForm.time.value });
  }

  myFilter = (d: Date | null): boolean => filterDateRoom(d, this.data.room);
}
