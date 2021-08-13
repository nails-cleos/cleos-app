import { AfterViewInit, Component, Input, OnDestroy, OnInit } from '@angular/core';
import { IUnavailable, Unavailable, UnavailableRepeatType } from '../../interfaces/unavailable';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Observable, Subscription } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { AppState, selectUnavailableState } from '../../store/app.states';
import { fieldChange, valueChange } from '../../util/validators';
import * as fromActionsUnavailable from '../../store/unavailable.actions';
import {
  convertDuration,
  createNewDate,
  diffTime,
  formatTime,
  getAvailability,
  getMinMaxDate,
  getNow,
  getTime,
  newDate
} from '../../util/dates';
import { IRoomAll } from '../../interfaces/room';
import { IUser } from '../../interfaces/user';
import { getUserName } from '../../util/helper';

@Component({
  selector: 'app-unavailable-detail',
  templateUrl: './unavailable-detail.component.html',
  styleUrls: ['./unavailable-detail.component.scss']
})
export class UnavailableDetailComponent implements OnInit, AfterViewInit, OnDestroy {

  @Input() unavailable: IUnavailable | undefined;
  form!: FormGroup;
  subscription: Subscription | undefined;
  getState: Observable<any>;
  errors: any = [];
  durationTime: any;
  durationMax: any;
  minTime: any;
  maxTime: any;

  professionalName: string | undefined;
  room: IRoomAll | undefined;

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

  constructor(private route: ActivatedRoute, private store: Store<AppState>, private formBuilder: FormBuilder,
              private router: Router) {
    this.getState = this.store.select(selectUnavailableState);
  }

  ngOnInit(): void {
    this.createForm();
    this.subscribe();
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }

  ngAfterViewInit(): void {
    this.getUnavailable();
  }

  myFilter = (d: Date | null): boolean => {
    const now = getNow();
    const date = (d || now);
    let result = true;
    if (this.room) {
      const {week, saturday, sunday} = getAvailability(this.room);
      const day = date.getDay();
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
    this.durationMax = formatTime(diffHour, diffMinute);
  }

  getRoom(user: IUser): void {
    this.store.dispatch(
      new fromActionsUnavailable.GetRoom(user.id)
    );
  }

  update(): void {
    if (this.form.invalid) {
      return;
    }
    const unavailable: IUnavailable = new Unavailable();
    unavailable.id = this.unavailable?.id;
    const time = this.startTime.value.split(':');
    const date = createNewDate(this.startDate.value, time[0], time[1]);

    unavailable.start = date.toLocaleString('en-GB');
    unavailable.description = valueChange(this.form.value?.description, this.unavailable?.description);
    unavailable.duration = fieldChange(this.duration, this.unavailable?.duration);
    unavailable.repeat = fieldChange(this.repeat, this.unavailable?.repeat);

    this.store.dispatch(new fromActionsUnavailable.UnavailableUpdate(unavailable));
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
      description: new FormControl(),
      startDate: this.startDate,
      startTime: this.startTime,
      duration: this.duration,
      repeat: this.repeat
    });
  }

  private subscribe(): void {
    this.subscription = this.getState.subscribe(state => {
      if (state.room) {
        this.room = state.room;
      }
      if (state.selected) {
        const date = newDate(state.selected.start);
        if (!this.room) {
          this.getRoom(state.selected.professional);
        }
        this.durationTime = convertDuration(state.selected.duration);
        this.unavailable = {
          id: state.selected.id,
          description: state.selected.description,
          startDate: date,
          startTime: getTime(date),
          duration: formatTime(this.durationTime.hour, this.durationTime.minute),
          repeat: state.selected.repeat
        } as IUnavailable;
        this.form.patchValue(this.unavailable);

        this.professionalName = getUserName(state.selected.professional);
      }
      if (this.room && this.unavailable && this.unavailable.startDate) {
        const date = newDate(this.unavailable.startDate);
        const day = date.getDay();
        const {maxDate} = getMinMaxDate(day, date, this.room);

        const maxHour = maxDate?.getHours();
        const diffMin = maxDate?.getMinutes();

        const {diffHour, diffMinute} = diffTime(date, maxHour, diffMin);
        this.durationMax = formatTime(diffHour, diffMinute);
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

  private getUnavailable(): void {
    if (!this.unavailable) {
      const id = this.route.snapshot.paramMap.get('id');
      this.store.dispatch(
        new fromActionsUnavailable.UnavailableFind(id)
      );
    }
  }
}
