import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Availability, IAvailability, IAvailabilityDate } from '../interfaces/room';

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

  constructor(private formBuilder: FormBuilder) {
    const start = new Date(new Date().setHours(9, 0));
    const end = new Date(new Date().setHours(18, 0));
    const startLunch = new Date(new Date().setHours(13, 0));
    const endLunch = new Date(new Date().setHours(14, 0));

    this.start = new FormControl(start, [
      Validators.required
    ]);

    this.end = new FormControl(end, [
      Validators.required
    ]);

    this.startLunch = new FormControl(startLunch);
    this.endLunch = new FormControl(endLunch);

    this.availabilityForm = this.formBuilder.group({
      start: this.start,
      end: this.end,
      startLunch: this.startLunch,
      endLunch: this.endLunch
    });
  }

  private static getTime(time: any): string {
    const hours = `0${time.getHours()}`.slice(-2);
    const minutes = `0${time.getMinutes()}`.slice(-2);

    return `${hours}:${minutes}`;
  }

  ngOnChanges(changes: SimpleChanges): void {
    const start = this.dates?.startDate || new Date(new Date().setHours(9, 0));
    const end = this.dates?.endDate || new Date(new Date().setHours(18, 0));
    const startLunch = this.dates?.startLunchDate || new Date(new Date().setHours(13, 0));
    const endLunch = this.dates?.endLunchDate || new Date(new Date().setHours(14, 0));

    this.start.setValue(start);
    this.end.setValue(end);

    if (this.dates?.startLunchDate && this.dates?.endLunchDate) {
      this.checked = true;
      this.startLunch.setValue(startLunch);
      this.endLunch.setValue(endLunch);
    }
  }

  create(): void {
    const availability: IAvailability = new Availability();
    availability.day = this.day;
    availability.start = AvailabilityComponent.getTime(this.start.value);
    availability.end = AvailabilityComponent.getTime(this.end.value);

    if (this.checked) {
      availability.startLunch = AvailabilityComponent.getTime(this.startLunch.value);
      availability.endLunch = AvailabilityComponent.getTime(this.endLunch.value);
    }

    this.availability.emit(availability);
  }
}
