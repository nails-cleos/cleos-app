import { Component, OnDestroy, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { IUser, IUserAll } from '../../interfaces/user';
import { IRoomAll } from '../../interfaces/room';
import { Observable, Subscription } from 'rxjs';
import { requireMatch } from '../../util/validators';
import { IUnavailable, Unavailable } from '../../interfaces/unavailable';
import { Store } from '@ngrx/store';
import { AppState, selectUnavailableState } from '../../store/app.states';
import { Router } from '@angular/router';
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
  getTimeNumber,
  newDate
} from '../../util/dates';
import * as fromActionsUnavailable from '../../store/unavailable.actions';
import { getUserName } from '../../util/helper';
import { map, startWith } from 'rxjs/operators';
import { closest } from '../../util/numbers';

@Component({
  selector: 'app-block-agenda',
  templateUrl: './block-agenda.component.html',
  styleUrls: ['./block-agenda.component.scss']
})
export class BlockAgendaComponent implements OnInit, OnDestroy {
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
  startTime: UntypedFormControl = new UntypedFormControl('', [
    Validators.required
  ]);
  duration: UntypedFormControl = new UntypedFormControl('', [
    Validators.required
  ]);

  errors: any = [];

  durationMax: any;
  minTime: any;
  maxTime: any;

  showDuration = false;

  private getState: Observable<any>;
  private subscription?: Subscription;
  private readonly extras: any;

  constructor(private store: Store<AppState>, private formBuilder: UntypedFormBuilder, private router: Router) {
    this.getState = this.store.select(selectUnavailableState);
    this.extras = this.router.getCurrentNavigation()?.extras.state;
  }

  get create(): void {
    if (this.form.invalid) {
      return;
    }

    const time = getTimeNumber(this.startTime.value)!;
    const date = createNewDate(this.startDate.value, time.hour, time.minute);

    const unavailable: IUnavailable = new Unavailable();
    unavailable.professionalId = this.professional.value.id;
    unavailable.start = date.toLocaleString(API_LOCALE);
    unavailable.timeZone = getCurrentTimeZone();
    unavailable.duration = this.duration.value;

    return this.store.dispatch(
      new fromActionsUnavailable.BlockAgenda(unavailable)
    );
  }

  get focusin(): void {
    if (this.rooms.length && this.startTime.value) {
      const time = getTimeNumber(this.startTime.value)!;
      const date = createNewDate(this.startDate.value ? newDate(this.startDate.value) : getNow(), time.hour, time.minute);
      const day = date.getDay();
      const { minDate, maxDate, roomAvailability } = getMinMaxDate(day, date, this.rooms);

      this.setValues(this.startDate.value, this.startTime.value, getTime(minDate), getTime(maxDate), this.showDuration,
        this.durationMax, roomAvailability);
    }
    return;
  }

  ngOnInit(): void {
    this.createForm();
    this.clean();
    this.subscribe();
    this.getProfessionals();
    if (this.extras) {
      let startTime;
      if (this.extras.room) {
        this.rooms = [this.extras.room];
        this.professional.setValue(this.extras.room.professional);
        this.showDuration = true;
        const time = getTimeNumber(this.extras.date);
        const hour = time ? `${ time.hour }`.padStart(2, '0') : '12';
        const minute = time ? `${ closest(time.minute) }`.padStart(2, '0') : '00';
        startTime = `${ hour }:${ minute }`;
      }
      this.setValues(this.extras.date, startTime);
    }
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }

  displayFn(user: IUser): string {
    return user ? getUserName(user) : '';
  }

  myFilter = (d: Date | null): boolean => filterDateRoom(d, this.roomAvailability);

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
  }

  private createForm(): void {
    this.form = this.formBuilder.group({
      professional: this.professional,
      description: new UntypedFormControl(),
      startDate: this.startDate,
      startTime: this.startTime,
      duration: this.duration,
    });
    this.filteredOptions = this.professional.valueChanges.pipe(
      startWith(''),
      map(value => typeof value === 'string' ? value : value.name),
      map(name => name ? this.filter(name) : this.professionals ? this.professionals.slice() : this.professionals)
    );
    this.valueChange();
  }

  private valueChange(): void {
    this.startDate.valueChanges.subscribe(value => {
      if (value) {
        if (this.rooms.length) {
          this.setMaxMin(value, this.rooms);
        }
        this.startTime.setValue(undefined);
        this.duration.setValue(undefined);
      }
    });

    this.startTime.valueChanges.subscribe(value => {
      if (value) {
        const time = getTimeNumber(value)!;
        const date = createNewDate(this.startDate.value ? newDate(this.startDate.value) : getNow(), time.hour, time.minute);

        let maxHour;
        let diffMin;
        const max = getTimeNumber(this.maxTime);
        if (max) {
          maxHour = max.hour;
          diffMin = max.minute;
        }

        const d = diffTime(date, Number(maxHour), Number(diffMin));

        this.showDuration = true;
        this.durationMax = formatTime(d);
        this.duration.setValue(undefined);
      }
    });

    this.professional.valueChanges.subscribe(value => {
      if (!this.rooms?.length && value) {
        this.getRoom(value);
      }
    });
  }

  private setMaxMin(startDate: Date, rooms: IRoomAll[]): void {
    const day = startDate.getDay();
    const { minDate, maxDate, roomAvailability } = getMinMaxDate(day, startDate, rooms);
    const max = maxDate;
    const minTime = getTime(minDate);
    const maxTime = getTime(maxDate);
    const availability = roomAvailability;

    const maxHour = max?.getHours();
    const diffMin = max?.getMinutes();

    const d = diffTime(startDate, maxHour, diffMin);

    this.minTime = minTime;
    this.maxTime = maxTime;
    this.showDuration = false;
    this.durationMax = formatTime(d);
    this.roomAvailability = availability;
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
        if (this.professionals?.length === 1 && !this.professional.value) {
          this.professional.setValue(this.professionals[0]);
        }
      }
      if (state.room) {
        if (!this.rooms?.length && this.startDate.value) {
          this.setMaxMin(this.startDate.value, state.room);
        }
        this.rooms = state.room;
      }
      if (state.subErrors) {
        state.subErrors.forEach((value: any) => {
          this.errors[value.field] = value.message;
          this.form.controls[value.field].setErrors({ incorrect: true });
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
