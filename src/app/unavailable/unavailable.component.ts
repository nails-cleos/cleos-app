import { Component, OnDestroy, OnInit } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Store } from '@ngrx/store';
import { AppState, selectUnavailableState } from '../store/app.states';
import { IUnavailable, Unavailable, UnavailableRepeatType } from '../interfaces/unavailable';
import * as fromActionsUnavailable from '../store/unavailable.actions';
import { IUser, IUserAll } from '../interfaces/user';
import { requireMatch } from '../util/validators';
import { map, startWith } from 'rxjs/operators';
import {
  createDate,
  createNewDate,
  diffTime,
  formatTime,
  getAvailability,
  getMinMaxDate,
  getNow,
  getTime,
  newDate
} from '../util/dates';
import { IRoomAll } from '../interfaces/room';
import { getUserName } from '../util/helper';
import { Router } from '@angular/router';

@Component({
  selector: 'app-unavailable',
  templateUrl: './unavailable.component.html',
  styleUrls: ['./unavailable.component.scss']
})
export class UnavailableComponent implements OnInit, OnDestroy {
  getState: Observable<any>;
  subscription: Subscription | undefined;
  form!: FormGroup;
  errors: any = [];
  durationMax: any;
  minTime: any;
  maxTime: any;
  showDuration = false;

  professionals: IUserAll[] | undefined;
  room: IRoomAll | undefined;
  filteredOptions: Observable<IUser[] | undefined> | undefined;

  professional: FormControl = new FormControl('', [
    Validators.required, requireMatch
  ]);

  startDate: FormControl = new FormControl('', [
    Validators.required
  ]);

  startTime: FormControl = new FormControl('', [
    Validators.required
  ]);

  duration: FormControl = new FormControl('', [
    Validators.required
  ]);

  repeat: FormControl = new FormControl('', [
    Validators.required
  ]);

  repeats = UnavailableRepeatType;

  constructor(private store: Store<AppState>, private formBuilder: FormBuilder, private router: Router) {
    this.getState = this.store.select(selectUnavailableState);
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

  getProfessionalName(professional: IUser): string {
    return getUserName(professional);
  }

  create(): void {
    if (this.form.invalid) {
      return;
    }

    const time = this.startTime.value.split(':');
    const date = createNewDate(this.startDate.value, time[0], time[1]);

    const unavailable: IUnavailable = new Unavailable();
    unavailable.professionalId = this.professional.value.id;
    unavailable.description = this.form.value.description;
    unavailable.start = date.toLocaleString('en-GB');
    unavailable.repeat = this.repeat.value;
    unavailable.duration = this.duration.value;

    this.store.dispatch(
      new fromActionsUnavailable.UnavailableSave(unavailable)
    );
  }

  displayFn(user: IUser): string {
    return user ? getUserName(user) : '';
  }

  myFilter = (d: Date | null): boolean => {
    const now = createDate();
    const date = (d || now);
    let result = date >= now;
    if (this.room) {
      const day = date.getDay();
      const {week, saturday, sunday} = getAvailability(this.room);
      if (!week) {
        result = result && (day === 0 || day === 6);
      }
      if (!sunday) {
        result = result && day !== 0;
      }
      if (!saturday) {
        result = result && day !== 6;
      }
    }
    return result;
  };

  setDate($event: any): void {
    const date = newDate($event.value);

    let max;
    if (this.room) {
      const day = date.getDay();
      const {minDate, maxDate} = getMinMaxDate(day, $event.value, this.room);
      max = maxDate;
      this.minTime = getTime(minDate);
      this.maxTime = getTime(maxDate);
    }

    const maxHour = max?.getHours();
    const diffMin = max?.getMinutes();

    const {diffHour, diffMinute} = diffTime(date, maxHour, diffMin);

    this.startTime.setValue('');
    this.duration.setValue('');
    this.showDuration = false;
    this.durationMax = formatTime(diffHour, diffMinute);
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

    const {diffHour, diffMinute} = diffTime(date, Number(maxHour), Number(diffMin));

    this.duration.setValue('');
    this.showDuration = true;
    this.durationMax = formatTime(diffHour, diffMinute);
  }

  getRoom(user: IUser): void {
    this.store.dispatch(
      new fromActionsUnavailable.GetRoom(user.id)
    );
  }

  focusin(): void {
    if (this.room && this.startTime.value) {
      const time = this.startTime.value.split(':');
      const date = createNewDate(this.startDate.value ? newDate(this.startDate.value) : getNow(), time[0], time[1]);
      const day = date.getDay();
      const {minDate, maxDate} = getMinMaxDate(day, date, this.room);
      this.minTime = getTime(minDate);
      this.maxTime = getTime(maxDate);
    }
  }

  private createForm(): void {
    this.form = this.formBuilder.group({
      professional: this.professional,
      description: new FormControl(),
      startDate: this.startDate,
      startTime: this.startTime,
      duration: this.duration,
      repeat: this.repeat
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
        this.room = state.room;
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

    return this.professionals?.filter(option => getUserName(option)?.toLowerCase().indexOf(filterValue));
  }
}
