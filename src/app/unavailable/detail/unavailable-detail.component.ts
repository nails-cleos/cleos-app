import { AfterViewInit, Component, Input, OnDestroy, OnInit } from '@angular/core';
import { IUnavailable, Unavailable } from '../../interfaces/unavailable';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Observable, Subscription } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Store } from '@ngrx/store';
import { AppState, selectUnavailableState } from '../../store/app.states';
import { valueChange } from '../../util/validators';
import * as fromActionsUnavailable from '../../store/unavailable.actions';
import { convertDuration, diffTime, getAvailability, getMinMaxDate } from '../../util/dates';
import { IAvailability, IRoom, IRoomAll } from '../../interfaces/room';
import { IUser } from '../../interfaces/user';

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
  durationMax: any;
  repeat = 'NONE';
  minDate: any;
  maxDate: any;

  professionalName: string | undefined;
  room: IRoomAll | undefined;

  startDate: FormControl = new FormControl('', [
    Validators.required
  ]);

  startTime: FormControl = new FormControl('', [
    Validators.required
  ]);

  durationDate: FormControl = new FormControl('', [
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
    let result = date > now;
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
  }

  setDate($event: any, time: any): void {
    let date = new Date($event.value);
    if (this.startTime.value) {
      const startTime = new Date(this.startTime.value);
      date = new Date(date.setHours(startTime.getHours(), startTime.getMinutes()));
    }

    if (this.room) {
      const day = date.getDay();
      const {minDate, maxDate} = getMinMaxDate(day, this.startTime.value, this.room);
      this.minDate = minDate;
      this.maxDate = maxDate;
    }
    const min = this.minDate ? this.minDate.getMinutes() : 0;
    const hours = this.minDate ? this.minDate.getHours() : 0;

    const diffMin = this.maxDate?.getMinutes();
    const maxHour = this.maxDate?.getHours();

    const {diffHour, diffMinute} = diffTime(date, maxHour, diffMin);

    this.durationMax = new Date(new Date(date).setHours(diffHour, diffMinute));

    this.startTime.setValue(new Date(new Date(date).setHours(hours, min)));

    time.showDialog();
  }

  setTime($event: any): void {
    const time = new Date($event);

    const maxHour = this.maxDate?.getHours();
    const diffMin = this.maxDate?.getMinutes();

    const {diffHour, diffMinute} = diffTime(time, maxHour, diffMin);

    this.durationMax = new Date(new Date($event).setHours(diffHour, diffMinute));
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

    const durationTime = this.durationDate.value;
    const durationHours = `0${durationTime.getHours()}`.slice(-2);
    const durationMinutes = `0${durationTime.getMinutes()}`.slice(-2);
    unavailable.duration = `${durationHours}:${durationMinutes}`;
    unavailable.repeat = this.repeat;

    this.store.dispatch(new fromActionsUnavailable.UnavailableUpdate(unavailable));
  }

  focusin(): void {
    if (this.startTime.value) {
      const date = new Date(this.startTime.value);
      if (this.room) {
        const day = date.getDay();
        const {minDate, maxDate} = getMinMaxDate(day, this.startTime.value, this.room);
        this.minDate = minDate;
        this.maxDate = maxDate;
      }
    }
  }

  private createForm(): void {
    this.form = this.formBuilder.group({
      description: new FormControl(),
      startDate: this.startDate,
      startTime: this.startTime,
      durationDate: this.durationDate
    });
  }

  private subscribe(): void {
    this.subscription = this.getState.subscribe(state => {
      if (state.room) {
        this.room = state.room;
      }
      if (state.selected) {
        if (!this.room) {
          this.getRoom(state.selected.professional);
        }
        const date = new Date(state.selected.start);
        const duration = convertDuration(state.selected.duration);

        const {diffHour, diffMinute} = diffTime(date);
        this.durationMax = new Date(new Date(state.selected.start).setHours(diffHour, diffMinute));
        this.repeat = state.selected.repeat;
        this.unavailable = {
          id: state.selected.id,
          description: state.selected.description,
          startDate: date,
          startTime: date,
          durationDate: new Date(new Date(state.selected.start).setHours(duration.hour, duration.minute)),
          repeat: this.repeat
        } as IUnavailable;
        this.form.patchValue(this.unavailable);

        this.professionalName = `${state.selected.professional.firstName} ${state.selected.professional.lastName}`;
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
