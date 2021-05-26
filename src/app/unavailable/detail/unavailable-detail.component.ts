import { AfterViewInit, Component, Input, OnDestroy, OnInit } from '@angular/core';
import { IUnavailable, Unavailable } from '../../interfaces/unavailable';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Observable, Subscription } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Store } from '@ngrx/store';
import { AppState, selectUnavailableState } from '../../store/app.states';
import { fieldChange, valueChange } from '../../util/validators';
import * as fromActionsUnavailable from '../../store/unavailable.actions';
import { convertDuration, diffTime, getAvailability, getMinMaxDate, getTime } from '../../util/dates';
import { IRoomAll } from '../../interfaces/room';
import { IUser } from '../../interfaces/user';
import { timeTheme } from '../../util/theme';

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
  error: any;
  durationTime: any;
  durationMax: any;
  repeat = 'NONE';
  minTime: any;
  maxTime: any;
  theme = timeTheme();

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

  constructor(private route: ActivatedRoute, private snackBar: MatSnackBar, private store: Store<AppState>,
              private formBuilder: FormBuilder) {
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
    const now = new Date();
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
    const date = new Date($event.value);

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
    this.durationMax = `${diffHour}:${diffMinute}`;
  }

  setTime($event: any): void {
    const date = this.startDate.value ? new Date(this.startDate.value) : new Date();
    const time = $event.split(':');
    date.setHours(time[0], time[1]);

    let maxHour;
    let diffMin;
    const max = this.maxTime?.split(':');
    if (max) {
      maxHour = max[0];
      diffMin = max[1];
    }

    const {diffHour, diffMinute} = diffTime(date, Number(maxHour), Number(diffMin));

    this.duration.setValue('');
    this.durationMax = `${diffHour}:${diffMinute}`;
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
    unavailable.start = this.startTime.value.toLocaleString('en-GB');
    unavailable.description = valueChange(this.form.value?.description, this.unavailable?.description);

    unavailable.repeat = fieldChange(this.duration, this.unavailable?.duration);

    this.store.dispatch(new fromActionsUnavailable.UnavailableUpdate(unavailable));
  }

  focusin(): void {
    if (this.room && this.startTime.value) {
      const date = this.startDate.value ? new Date(this.startDate.value) : new Date();
      const time = this.startTime.value.split(':');
      date.setHours(time[0], time[1]);
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
      duration: this.duration
    });
  }

  private subscribe(): void {
    this.subscription = this.getState.subscribe(state => {
      if (state.room) {
        this.room = state.room;
      }
      if (state.selected) {
        const date = new Date(state.selected.start);
        if (!this.room) {
          this.getRoom(state.selected.professional);
        }
        this.durationTime = convertDuration(state.selected.duration);
        this.repeat = state.selected.repeat;
        this.unavailable = {
          id: state.selected.id,
          description: state.selected.description,
          startDate: date,
          startTime: `${date.getHours()}:${date.getMinutes()}`,
          duration: `${this.durationTime.hour}:${this.durationTime.minute}`,
          repeat: this.repeat
        } as IUnavailable;
        this.form.patchValue(this.unavailable);

        this.professionalName = `${state.selected.professional.firstName} ${state.selected.professional.lastName}`;
      }
      if (this.room && this.unavailable && this.unavailable.startDate) {
        const date = new Date(this.unavailable.startDate);
        const day = date.getDay();
        const {maxDate} = getMinMaxDate(day, date, this.room);

        const maxHour = maxDate?.getHours();
        const diffMin = maxDate?.getMinutes();

        const {diffHour, diffMinute} = diffTime(date, maxHour, diffMin);
        this.durationMax = `${diffHour}:${diffMinute}`;
      }
      if (state.subErrors) {
        state.subErrors.forEach((value: any) => {
          this.errors[value.field] = value.message;
          this.form.controls[value.field].setErrors({incorrect: true});
        });
      } else if (state.errorMessage) {
        this.snackBar.open(state.errorMessage, 'OK', {
          duration: 5000
        });
        this.error = state.error;
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
