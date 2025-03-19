import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { Availability, IAvailability, IAvailabilityDate } from '../../interfaces/room';
import { createDate, getCurrentTimeZone, getTime } from '../../util/dates';
import { TranslateService } from '@ngx-translate/core';
import { SharedModule } from "../../shared/shared.module";

@Component({
  selector: 'app-availability',
  templateUrl: './availability.component.html',
  styleUrls: ['./availability.component.scss'],
  standalone: true,
  imports: [SharedModule]
})
export class AvailabilityComponent implements OnChanges {
  @Input() dates?: IAvailabilityDate;
  @Input() day!: string;
  @Output() availability = new EventEmitter<IAvailability>();
  @Output() ignore = new EventEmitter();

  availabilityForm!: UntypedFormGroup;
  start: UntypedFormControl;
  end: UntypedFormControl;
  startLunch: UntypedFormControl;
  endLunch: UntypedFormControl;
  checked!: boolean;

  constructor(private formBuilder: UntypedFormBuilder, private translate: TranslateService) {
    this.start = new UntypedFormControl('', [
      Validators.required
    ]);

    this.end = new UntypedFormControl('', [
      Validators.required
    ]);

    this.startLunch = new UntypedFormControl();
    this.endLunch = new UntypedFormControl();

    this.availabilityForm = this.formBuilder.group({
      start: this.start,
      end: this.end,
      startLunch: this.startLunch,
      endLunch: this.endLunch
    });
  }

  get create(): void {
    const availability: IAvailability = new Availability();
    availability.day = this.day;
    availability.start = this.start.value;
    availability.end = this.end.value;

    if (this.checked) {
      availability.startLunch = this.startLunch.value;
      availability.endLunch = this.endLunch.value;
    }

    return this.availability.emit(availability);
  }

  ngOnChanges(_: SimpleChanges): void {
    const timeZone = getCurrentTimeZone();
    const start = this.dates?.startDate || createDate(timeZone, 9, 0);
    const end = this.dates?.endDate || createDate(timeZone, 18, 0);
    const startLunch = this.dates?.startLunchDate || createDate(timeZone, 13, 0);
    const endLunch = this.dates?.endLunchDate || createDate(timeZone, 14, 0);

    this.start.setValue(getTime(start, 'es'));
    this.end.setValue(getTime(end, 'es'));

    if (this.dates?.startLunchDate && this.dates?.endLunchDate) {
      this.checked = true;
      this.startLunch.setValue(getTime(startLunch, 'es'));
      this.endLunch.setValue(getTime(endLunch, 'es'));
    }
  }
}
