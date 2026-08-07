import { ChangeDetectionStrategy, Component, effect, inject, input, output } from '@angular/core';
import { FormGroup, NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Availability, IAvailability, IAvailabilityDate } from '../room';
import { createDate, getCurrentTimeZone, getTime } from '@app/util/dates';
import { TranslatePipe } from '@ngx-translate/core';
import { MatError, MatFormField, MatInput, MatLabel, MatPrefix } from '@angular/material/input';
import { MatIcon } from '@angular/material/icon';
import { MatButton } from '@angular/material/button';
import { TimepickerComponent } from '@app/shared/clock-timepicker/timepicker.component';
import { TimepickerDirective } from '@app/shared/clock-timepicker/timepicker.directive';
import { MatCheckbox } from '@angular/material/checkbox';
import { AvailabilityForm } from '../room-form.types';

@Component({
  selector: 'app-availability',
  templateUrl: './availability.component.html',
  styleUrls: ['./availability.component.scss'],
  imports: [MatFormField, MatLabel, MatInput, MatIcon, MatButton, TranslatePipe, MatError, MatPrefix,
    ReactiveFormsModule, TimepickerComponent, TimepickerDirective, MatCheckbox],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AvailabilityComponent {
  private formBuilder: NonNullableFormBuilder = inject(NonNullableFormBuilder);
  day = input.required<string>();
  dates = input<IAvailabilityDate>();
  availability = output<IAvailability>();
  ignore = output();

  form: FormGroup<AvailabilityForm> = this.formBuilder.group<AvailabilityForm>({
    start: this.formBuilder.control<string>('', {
      validators: [Validators.required],
    }),
    end: this.formBuilder.control<string>('', {
      validators: [Validators.required],
    }),
    startLunch: this.formBuilder.control<string | undefined>(undefined),
    endLunch: this.formBuilder.control<string | undefined>(undefined),
  });

  checked: boolean = false;

  constructor() {
    effect(() => {
      const dates = this.dates();
      const timeZone = getCurrentTimeZone();
      const start = dates?.startDate || createDate(timeZone, 9, 0);
      const end = dates?.endDate || createDate(timeZone, 18, 0);
      const startLunch = dates?.startLunchDate || createDate(timeZone, 13, 0);
      const endLunch = dates?.endLunchDate || createDate(timeZone, 14, 0);

      this.getForm.start.setValue(getTime(start, 'es'));
      this.getForm.end.setValue(getTime(end, 'es'));

      if (dates?.startLunchDate && dates?.endLunchDate) {
        this.checked = true;
        this.getForm.startLunch.setValue(getTime(startLunch, 'es'));
        this.getForm.endLunch.setValue(getTime(endLunch, 'es'));
      }
    });
  }

  get getForm(): AvailabilityForm {
    return this.form.controls;
  }

  create(): void {
    return this.availability.emit(Availability.fromForm(this.getForm, this.day(), this.checked));
  }
}
