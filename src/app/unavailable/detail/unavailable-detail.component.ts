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
  API_LOCALE, createEndDate,
  createNewDate,
  diffTime,
  filterDate,
  formatDuration,
  formatFullDate,
  formatTime,
  getMinMaxDate,
  getNow,
  getTime,
  newDate
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

  form!: FormGroup;

  professionalName: string | undefined;
  room: IRoomAll | undefined;
  startDate: FormControl = new FormControl('', [
    Validators.required
  ]);
  endDate: FormControl = new FormControl('', [
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
  allDay: FormControl = new FormControl();
  repeats = UnavailableRepeatType;

  errors: any = [];

  durationMax: any;
  minTime: any;
  maxTime: any;
  showEnd = false;

  private subscription: Subscription | undefined;
  private getState: Observable<any>;

  constructor(private route: ActivatedRoute, private store: Store<AppState>, private formBuilder: FormBuilder,
              private router: Router, private readonly translate: TranslateService, public dialog: MatDialog) {
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

  myFilter = (d: Date | null): boolean => filterDate(true, d, this.room);

  setDate($event: any): void {
    const date = newDate($event.value);

    let max;
    if (this.room) {
      const day = date.getDay();
      const {minDate, maxDate} = getMinMaxDate(day, $event.value, this.room);
      max = maxDate;
      this.minTime = getTime(minDate, API_LOCALE);
      this.maxTime = getTime(maxDate, API_LOCALE);
    }

    const maxHour = max?.getHours();
    const diffMin = max?.getMinutes();

    const duration = diffTime(date, maxHour, diffMin);

    this.startTime.setValue('');
    this.duration.setValue('');
    this.durationMax = formatTime(duration, API_LOCALE);
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

    const duration = diffTime(date, Number(maxHour), Number(diffMin));

    this.duration.setValue('');
    this.durationMax = formatTime(duration, API_LOCALE);
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

    let date: Date;
    if (!this.allDay.value) {
      const time = this.startTime.value.split(':');
      date = createNewDate(this.startDate.value, time[0], time[1]);
    } else {
      date = createNewDate(this.startDate.value);
    }

    unavailable.start = date.toLocaleString(API_LOCALE);
    unavailable.description = valueChange(this.form.value?.description, this.unavailable?.description);
    unavailable.duration = fieldChange(this.duration, this.unavailable?.duration);
    unavailable.repeat = fieldChange(this.repeat, this.unavailable?.repeat);
    unavailable.allDay = this.allDay.value;
    if (this.endDate.value) {
      unavailable.end = createNewDate(this.endDate.value).toLocaleString(API_LOCALE);
    }

    this.store.dispatch(new fromActionsUnavailable.UnavailableUpdate(unavailable));
  }

  focusin(): void {
    if (this.room && this.startTime.value) {
      const time = this.startTime.value.split(':');
      const date = createNewDate(this.startDate.value ? newDate(this.startDate.value) : getNow(), time[0], time[1]);
      const day = date.getDay();
      const {minDate, maxDate} = getMinMaxDate(day, date, this.room);
      this.minTime = getTime(minDate, API_LOCALE);
      this.maxTime = getTime(maxDate, API_LOCALE);
    }
  }

  delete(): void {
    const title = this.translate.instant('UNAVAILABLE.DELETED.TITLE');
    const date = this.unavailable?.startDate ? formatFullDate(this.unavailable.startDate, this.translate.currentLang)
      : this.unavailable?.start;
    const content = this.translate.instant('UNAVAILABLE.DELETED.CONTENT', {date});
    const dialogRef = this.dialog.open(DialogComponent, {
      data: {title, content, value: this.unavailable}
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.store.dispatch(
          new fromActionsUnavailable.DeleteUnavailable(result.id)
        );
      }
    });
  }

  private createForm(): void {
    this.form = this.formBuilder.group({
      description: new FormControl(),
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
        this.room = state.room;
      }
      if (state.selected) {
        const date = newDate(state.selected.start);
        if (!this.room) {
          this.getRoom(state.selected.professional);
        }
        this.unavailable = {
          id: state.selected.id,
          description: state.selected.description,
          start: state.selected.start,
          end: state.selected.end,
          startDate: date,
          endDate: createEndDate(state.selected.end),
          startTime: getTime(date, API_LOCALE),
          duration: state.selected.duration ? formatDuration(state.selected.duration, API_LOCALE) : '',
          repeat: state.selected.repeat,
          allDay: state.selected.allDay
        } as IUnavailable;
        this.form.patchValue(this.unavailable);
        this.showEnd = this.unavailable.repeat === UnavailableRepeatType.everyDay ||
          this.unavailable.repeat === UnavailableRepeatType.onceAWeek;

        this.professionalName = getUserName(state.selected.professional);
      }
      if (this.room && this.unavailable && this.unavailable.startDate) {
        const date = newDate(this.unavailable.startDate);
        const day = date.getDay();
        const {maxDate} = getMinMaxDate(day, date, this.room);

        const maxHour = maxDate?.getHours();
        const diffMin = maxDate?.getMinutes();

        const d = diffTime(date, maxHour, diffMin);
        this.durationMax = formatTime(d, API_LOCALE);
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
