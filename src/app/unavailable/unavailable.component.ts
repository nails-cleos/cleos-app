import { Component, OnDestroy, OnInit } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { Store } from '@ngrx/store';
import { AppState, selectUnavailableState } from '../store/app.states';
import { IUnavailable, Unavailable, UnavailableRepeatType } from '../interfaces/unavailable';
import * as fromActionsUnavailable from '../store/unavailable.actions';
import { IUser, IUserAll } from '../interfaces/user';
import { requireMatch } from '../util/validators';
import { map, startWith } from 'rxjs/operators';
import {
  API_LOCALE,
  createNewDate,
  diffTime,
  filterDateRoom,
  formatTime,
  getCurrentTimeZone,
  getMinMaxDate,
  getNow,
  getTime,
  newDate
} from '../util/dates';
import { IRoom, IRoomAll } from '../interfaces/room';
import { getUserName } from '../util/helper';
import { Router } from '@angular/router';

@Component({
  selector: 'app-unavailable',
  templateUrl: './unavailable.component.html',
  styleUrls: ['./unavailable.component.scss']
})
export class UnavailableComponent implements OnInit, OnDestroy {
  form!: UntypedFormGroup;

  professionals?: IUserAll[];
  rooms: IRoomAll[] = [];
  filteredOptions?: Observable<IUser[] | undefined>;
  roomAvailability?: IRoomAll;

  professional: UntypedFormControl = new UntypedFormControl('', [
    Validators.required, requireMatch
  ]);
  startDate: UntypedFormControl = new UntypedFormControl('', [
    Validators.required
  ]);
  endDate: UntypedFormControl = new UntypedFormControl('', [
    Validators.required
  ]);
  startTime: UntypedFormControl = new UntypedFormControl('', [
    Validators.required
  ]);
  duration: UntypedFormControl = new UntypedFormControl('', [
    Validators.required
  ]);
  repeat: UntypedFormControl = new UntypedFormControl('', [
    Validators.required
  ]);
  allDay: UntypedFormControl = new UntypedFormControl();

  repeats = UnavailableRepeatType;

  errors: any = [];

  durationMax: any;
  minTime: any;
  maxTime: any;

  showDuration = false;
  showEnd = false;

  private getState: Observable<any>;
  private subscription?: Subscription;
  private readonly extras: any;

  constructor(private store: Store<AppState>, private formBuilder: UntypedFormBuilder, private router: Router) {
    this.getState = this.store.select(selectUnavailableState);
    this.extras = this.router.getCurrentNavigation()?.extras.state;
    if (this.extras) {
      this.rooms = [this.extras.room];
      this.professional.setValue(this.extras.room.professional);
      this.setValues(this.extras.date, getTime(this.extras.date));
    }
  }

  get create(): void {
    if (this.form.invalid) {
      return;
    }

    let date: Date;
    if (!this.allDay.value) {
      const time = this.startTime.value.split(':');
      date = createNewDate(this.startDate.value, time[0], time[1]);
    } else {
      date = createNewDate(this.startDate.value);
    }

    const unavailable: IUnavailable = new Unavailable();
    unavailable.professionalId = this.professional.value.id;
    unavailable.description = this.form.value.description;
    unavailable.start = date.toLocaleString(API_LOCALE);
    unavailable.timeZone = getCurrentTimeZone();
    unavailable.repeat = this.repeat.value;
    unavailable.duration = this.duration.value;
    unavailable.allDay = this.allDay.value;
    if (this.endDate.value) {
      unavailable.end = createNewDate(this.endDate.value).toLocaleString(API_LOCALE);
    }

    return this.store.dispatch(
      new fromActionsUnavailable.UnavailableSave(unavailable)
    );
  }

  get focusin(): void {
    if (this.rooms.length && this.startTime.value) {
      const time = this.startTime.value.split(':');
      const date = createNewDate(this.startDate.value ? newDate(this.startDate.value) : getNow(), time[0], time[1]);
      const day = date.getDay();
      const {minDate, maxDate, roomAvailability} = getMinMaxDate(day, date, this.rooms);

      this.setValues(this.startDate.value, this.startTime.value, getTime(minDate), getTime(maxDate), this.showDuration,
        this.duration.value, roomAvailability);
    }
    return;
  }

  ngOnInit(): void {
    this.createForm();
    this.clean();
    this.subscribe();
    this.getProfessionals();
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }

  displayFn(user: IUser): string {
    return user ? getUserName(user) : '';
  }

  myFilter = (d: Date | null): boolean => filterDateRoom(d, this.roomAvailability);

  setDate($event: any): void {
    const date = newDate($event.value);

    let max;
    let maxTime;
    let minTime;
    let availability;
    if (this.rooms.length) {
      const day = date.getDay();
      const {minDate, maxDate, roomAvailability} = getMinMaxDate(day, $event.value, this.rooms);
      max = maxDate;
      minTime = getTime(minDate);
      maxTime = getTime(maxDate);
      availability = roomAvailability;
    }

    const maxHour = max?.getHours();
    const diffMin = max?.getMinutes();

    const d = diffTime(date, maxHour, diffMin);

    this.setValues($event.value, undefined, minTime, maxTime, false, formatTime(d), availability);
  }

  setTime($event: any): void {
    const time = $event.split(':');
    const date = createNewDate(this.startDate.value ? newDate(this.startDate.value) : getNow(), time[0], time[1]);

    let maxHour;
    let diffMin;
    const max = this.maxTime?.split(':');
    if (max) {
      maxHour = max[0];
      diffMin = max[1];
    }

    const d = diffTime(date, Number(maxHour), Number(diffMin));

    this.setValues(this.startDate.value, $event, this.minTime, this.maxTime, true, formatTime(d),
      this.roomAvailability);
  }

  getRoom(user: IUser): void {
    this.store.dispatch(
      new fromActionsUnavailable.GetRoom(user.id)
    );
  }

  keyDownHandler(event: any): void {
    if (event.code === 'Backspace') {
      this.professional.setValue('');
      this.setValues();
    }
  }

  private setValues(startDate?: any, startTime?: any, minTime?: string, maxTime?: string, showDuration: boolean = false,
                    durationMax?: any, roomAvailability?: IRoomAll): void {
    this.startDate.setValue(startDate);
    this.startTime.setValue(startTime);
    this.minTime = minTime;
    this.maxTime = maxTime;
    this.showDuration = showDuration;
    this.durationMax = durationMax;
    this.roomAvailability = roomAvailability;
    this.duration.setValue(undefined);
    this.endDate.setValue(undefined);
    this.repeat.setValue(undefined);
    this.allDay.setValue(startDate ? this.allDay.value : false);
    this.showEnd = false;
  }

  private createForm(): void {
    this.form = this.formBuilder.group({
      professional: this.professional,
      description: new UntypedFormControl(),
      startDate: this.startDate,
      startTime: this.startTime,
      duration: this.duration,
      repeat: this.repeat,
      allDay: this.allDay,
      endDate: this.endDate
    });
    this.allDay.valueChanges.subscribe(value => {
      if (value) {
        this.duration.clearValidators();
        this.duration.updateValueAndValidity();
        this.startTime.clearValidators();
        this.startTime.updateValueAndValidity();
      } else {
        this.duration.setValidators(Validators.required);
        this.duration.updateValueAndValidity();
        this.startTime.setValidators(Validators.required);
        this.startTime.updateValueAndValidity();
      }
    });
    this.repeat.valueChanges.subscribe(value => {
      if (value && (value === UnavailableRepeatType.onceAWeek || value === UnavailableRepeatType.everyDay)) {
        this.endDate.setValidators(Validators.required);
        this.endDate.updateValueAndValidity();
        this.showEnd = true;
      } else {
        this.endDate.clearValidators();
        this.endDate.updateValueAndValidity();
        this.showEnd = false;
      }
    });
    this.filteredOptions = this.professional.valueChanges.pipe(
      startWith(''),
      map(value => typeof value === 'string' ? value : value.name),
      map(name => name ? this.filter(name) : this.professionals ? this.professionals.slice() : this.professionals)
    );
  }

  private clean(): void {
    this.store.dispatch(
      new fromActionsUnavailable.Clean()
    );
  }

  private getProfessionals(): void {
    this.store.dispatch(
      new fromActionsUnavailable.GetAllProfessional()
    );
  }

  private subscribe(): void {
    this.subscription = this.getState.subscribe(state => {
      if (state.professionals) {
        this.professionals = state.professionals;
      }
      if (state.room) {
        this.rooms = state.room;
      }
      if (state.subErrors) {
        state.subErrors.forEach((value: any) => {
          this.errors[value.field] = value.message;
          this.form.controls[value.field].setErrors({incorrect: true});
        });
      } else if (state.message) {
        this.router.navigate(['unavailable']);
      }
    });
  }

  private filter(name: string): IUser[] | undefined {
    const filterValue = name.toLowerCase();

    return this.professionals?.filter(option => getUserName(option)?.toLowerCase().indexOf(filterValue) === 0);
  }
}
