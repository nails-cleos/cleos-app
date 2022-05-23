import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Availability, IAvailability, IAvailabilityDate } from '../../interfaces/room';
import { createDate, getTime } from '../../util/dates';
import { TranslateService } from '@ngx-translate/core';

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

  constructor(private formBuilder: FormBuilder, private translate: TranslateService) {
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

  ngOnChanges(changes: SimpleChanges): void {
    const start = this.dates?.startDate || createDate(9, 0);
    const end = this.dates?.endDate || createDate(18, 0);
    const startLunch = this.dates?.startLunchDate || createDate(13, 0);
    const endLunch = this.dates?.endLunchDate || createDate(14, 0);

    this.start.setValue(getTime(start, 'es'));
    this.end.setValue(getTime(end, 'es'));

    if (this.dates?.startLunchDate && this.dates?.endLunchDate) {
      this.checked = true;
      this.startLunch.setValue(getTime(startLunch, 'es'));
      this.endLunch.setValue(getTime(endLunch, 'es'));
    }
  }
}
