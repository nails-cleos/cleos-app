import { ChangeDetectionStrategy, Component, effect, inject, input, output } from '@angular/core';
import { FormControl, FormGroup, NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Availability, IAvailability, IAvailabilityDate } from '../../interfaces/room';
import { createDate, getCurrentTimeZone, getTime } from '../../util/dates';
import { AppMaterialModule } from '../../util/app-material.module';
import { TranslatePipe } from '@ngx-translate/core';

type AvailabilityForm = {
  start: FormControl<string>;
  end: FormControl<string>;
  startLunch: FormControl<string | undefined>;
  endLunch: FormControl<string | undefined>;
}

@Component({
  selector: 'app-availability',
  templateUrl: './availability.component.html',
  styleUrls: ['./availability.component.scss'],
  imports: [AppMaterialModule, ReactiveFormsModule, TranslatePipe],
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
    const availability: IAvailability = new Availability();
    availability.day = this.day();
    availability.start = this.getForm.start.value;
    availability.end = this.getForm.end.value;

    if (this.checked) {
      availability.startLunch = this.getForm.startLunch.value;
      availability.endLunch = this.getForm.endLunch.value;
    }

    return this.availability.emit(availability);
  }
}
