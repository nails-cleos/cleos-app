import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Availability, IAvailability, IAvailabilityDate } from '../interfaces/room';
import { timeTheme } from '../util/theme';
import { getTime } from '../util/dates';

@Component({
  selector: 'app-availability',
  templateUrl: './availability.component.html',
  styleUrls: ['./availability.component.scss']
})
export class AvailabilityComponent implements OnChanges {
  @Input() dates?: IAvailabilityDate;
  @Input() day!: string;
  @Output() availability = new EventEmitter<IAvailability>();
  @Output() ignore = new EventEmitter();

  availabilityForm!: FormGroup;
  start: FormControl;
  end: FormControl;
  startLunch: FormControl;
  endLunch: FormControl;
  checked!: boolean;
  theme = timeTheme();

  constructor(private formBuilder: FormBuilder) {
    this.start = new FormControl('', [
      Validators.required
    ]);

    this.end = new FormControl('', [
      Validators.required
    ]);

    this.startLunch = new FormControl();
    this.endLunch = new FormControl();

    this.availabilityForm = this.formBuilder.group({
      start: this.start,
      end: this.end,
      startLunch: this.startLunch,
      endLunch: this.endLunch
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    const start = this.dates?.startDate || new Date(new Date().setHours(9, 0));
    const end = this.dates?.endDate || new Date(new Date().setHours(18, 0));
    const startLunch = this.dates?.startLunchDate || new Date(new Date().setHours(13, 0));
    const endLunch = this.dates?.endLunchDate || new Date(new Date().setHours(14, 0));

    this.start.setValue(getTime(start));
    this.end.setValue(getTime(end));

    if (this.dates?.startLunchDate && this.dates?.endLunchDate) {
      this.checked = true;
      this.startLunch.setValue(getTime(startLunch));
      this.endLunch.setValue(getTime(endLunch));
    }
  }

  create(): void {
    const availability: IAvailability = new Availability();
    availability.day = this.day;
    availability.start = this.start.value;
    availability.end = this.end.value;

    if (this.checked) {
      availability.startLunch = this.startLunch.value;
      availability.endLunch = this.endLunch.value;
    }

    this.availability.emit(availability);
  }
}
