import { AfterViewInit, Component, Input, OnDestroy, OnInit } from '@angular/core';
import { IUnavailable, Unavailable, UnavailableRepeatType } from '../../interfaces/unavailable';
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { Observable, Subscription } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { AppState, selectUnavailableState } from '../../store/app.states';
import { fieldChange, valueChange } from '../../util/validators';
import * as fromActionsUnavailable from '../../store/unavailable.actions';
import {
  API_LOCALE,
  createEndDate,
  createNewDate,
  diffTime,
  filterDate,
  formatDuration,
  formatFullDate,
  formatTime,
  getCurrentTimeZone,
  getMinMaxDate,
  getNow,
  getTime,
  getTimeNumber,
  newDate,
  newDateTimestamp
} from '../../util/dates';
import { IRoomAll } from '../../interfaces/room';
import { IUser } from '../../interfaces/user';
import { getUserName } from '../../util/helper';
import { DialogComponent } from '../../shared/dialog/dialog.component';
import { TranslateService } from '@ngx-translate/core';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-unavailable-detail',
  templateUrl: './unavailable-detail.component.html',
  styleUrls: ['./unavailable-detail.component.scss']
})
export class UnavailableDetailComponent implements OnInit, AfterViewInit, OnDestroy {
  @Input() unavailable: IUnavailable | undefined;

  form!: UntypedFormGroup;

  professionalName?: string;
  rooms: IRoomAll[] = [];
  roomAvailability?: IRoomAll;

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
  showEnd = false;

  private subscription?: Subscription;
  private getState: Observable<any>;

  constructor(private route: ActivatedRoute, private store: Store<AppState>, private formBuilder: UntypedFormBuilder,
              private router: Router, private readonly translate: TranslateService, public dialog: MatDialog) {
    this.getState = this.store.select(selectUnavailableState);
  }

  get delete(): void {
    const title = this.translate.instant('UNAVAILABLE.DELETED.TITLE');
    const date = this.unavailable?.startDate ? formatFullDate(this.unavailable.startDate, this.translate.currentLang)
      : this.unavailable?.start;
    const content = this.translate.instant('UNAVAILABLE.DELETED.CONTENT', { date });
    const dialogRef = this.dialog.open(DialogComponent, {
      data: { title, content, value: this.unavailable }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.store.dispatch(
          new fromActionsUnavailable.DeleteUnavailable(result.id)
        );
      }
    });
    return;
  }

  get update(): void {
    if (this.form.invalid) {
      return;
    }
    const unavailable: IUnavailable = new Unavailable();
    unavailable.id = this.unavailable?.id;

    let date: Date;
    if (!this.allDay.value) {
      const time = getTimeNumber(this.startTime.value);
      date = createNewDate(this.startDate.value, time!.hour, time!.minute);
    } else {
      date = createNewDate(this.startDate.value);
    }

    unavailable.timeZone = getCurrentTimeZone();
    unavailable.start = date.toLocaleString(API_LOCALE);
    unavailable.description = valueChange(this.form.value?.description, this.unavailable?.description);
    unavailable.duration = fieldChange(this.duration, this.unavailable?.duration);
    unavailable.repeat = fieldChange(this.repeat, this.unavailable?.repeat);
    unavailable.allDay = this.allDay.value;
    if (this.endDate.value) {
      unavailable.end = createNewDate(this.endDate.value).toLocaleString(API_LOCALE);
    }

    return this.store.dispatch(new fromActionsUnavailable.UnavailableUpdate(unavailable));
  }

  get focusin(): void {
    if (this.rooms.length && this.startTime.value) {
      const time = getTimeNumber(this.startTime.value);
      const date = createNewDate(this.startDate.value ? newDate(this.startDate.value) : getNow(), time!.hour, time!.minute);
      const day = date.getDay();
      const { minDate, maxDate, roomAvailability } = getMinMaxDate(day, date, this.rooms);

      this.setValues(this.startDate.value, this.startTime.value, getTime(minDate), getTime(maxDate),
        this.duration.value, roomAvailability);
    }
    return;
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

  myFilter = (d: Date | null): boolean => filterDate(true, d, this.roomAvailability);

  setDate($event: any): void {
    const date = newDate($event.value);

    let max;
    let maxTime;
    let minTime;
    let availability;
    if (this.rooms) {
      const day = date.getDay();
      const { minDate, maxDate, roomAvailability } = getMinMaxDate(day, $event.value, this.rooms);
      max = maxDate;
      minTime = getTime(minDate);
      maxTime = getTime(maxDate);
      availability = roomAvailability;
    }

    const maxHour = max?.getHours();
    const diffMin = max?.getMinutes();

    const duration = diffTime(date, maxHour, diffMin);
    this.setValues($event.value, undefined, minTime, maxTime, formatTime(duration), availability);
  }

  setTime($event: any): void {
    const time = getTimeNumber($event);
    const date = createNewDate(this.startDate.value ? newDate(this.startDate.value) : getNow(), time!.hour, time!.minute);

    let maxHour;
    let diffMin;
    const max = getTimeNumber(this.maxTime);
    if (max) {
      maxHour = max.hour;
      diffMin = max.minute;
    }

    const duration = diffTime(date, Number(maxHour), Number(diffMin));

    this.setValues(this.startDate.value, $event, this.minTime, this.maxTime, formatTime(duration),
      this.roomAvailability);
  }

  getRoom(user: IUser): void {
    this.store.dispatch(
      new fromActionsUnavailable.GetRoom(user.id)
    );
  }

  private setValues(startDate?: any, startTime?: any, minTime?: string, maxTime?: string, durationMax?: any,
                    roomAvailability?: IRoomAll): void {
    this.startDate.setValue(startDate);
    this.startTime.setValue(startTime);
    this.minTime = minTime;
    this.maxTime = maxTime;
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
  }

  private subscribe(): void {
    this.subscription = this.getState.subscribe(state => {
      if (state.room) {
        this.rooms = state.room;
      }
      if (state.selected) {
        const date = newDateTimestamp(state.selected.timestamp);
        if (!this.rooms.length) {
          this.getRoom(state.selected.professional);
        }
        console.log("RESERVATION START", state.selected.start)
        this.unavailable = {
          id: state.selected.id,
          description: state.selected.description,
          start: state.selected.start,
          end: state.selected.end,
          startDate: date,
          endDate: createEndDate(state.selected.end),
          startTime: getTime(date),
          duration: state.selected.duration ? formatDuration(state.selected.duration) : '',
          repeat: state.selected.repeat,
          allDay: state.selected.allDay
        } as IUnavailable;
        this.form.patchValue(this.unavailable);
        this.showEnd = this.unavailable.repeat === UnavailableRepeatType.everyDay ||
          this.unavailable.repeat === UnavailableRepeatType.onceAWeek;

        this.professionalName = getUserName(state.selected.professional);
      }
      if (this.rooms.length && this.unavailable && this.unavailable.startDate) {
        const date = newDate(this.unavailable.startDate);
        const day = date.getDay();
        const { maxDate } = getMinMaxDate(day, date, this.rooms);

        const maxHour = maxDate?.getHours();
        const diffMin = maxDate?.getMinutes();

        const d = diffTime(date, maxHour, diffMin);
        this.durationMax = formatTime(d);
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

  private getUnavailable(): void {
    if (!this.unavailable) {
      const id = this.route.snapshot.paramMap.get('id');
      this.store.dispatch(
        new fromActionsUnavailable.UnavailableFind(id)
      );
    }
  }
}
