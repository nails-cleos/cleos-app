import { Component, OnDestroy, OnInit } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Store } from '@ngrx/store';
import { AppState, selectUnavailableState } from '../store/app.states';
import { IUnavailable, Unavailable } from '../interfaces/unavailable';
import * as fromActionsUnavailable from '../store/unavailable.actions';
import { IUser } from '../interfaces/user';
import { requireMatch } from '../util/validators';
import { map, startWith } from 'rxjs/operators';
import { diffTime, getAvailability, getMinMaxDate } from '../util/dates';
import { IRoomAll } from '../interfaces/room';

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
  repeat = 'NONE';
  minDate: any;
  maxDate: Date | undefined;

  professionals: IUser[] | undefined;
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

  constructor(private snackBar: MatSnackBar, private store: Store<AppState>, private formBuilder: FormBuilder) {
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

  create(): void {
    if (this.form.invalid) {
      return;
    }

    const unavailable: IUnavailable = new Unavailable();
    unavailable.professionalId = this.professional.value.id;
    unavailable.description = this.form.value.description;
    unavailable.start = new Date(this.startTime.value).toLocaleString('en-GB');
    unavailable.repeat = this.repeat;

    const durationTime = this.duration.value;
    const durationHours = `0${durationTime.getHours()}`.slice(-2);
    const durationMinutes = `0${durationTime.getMinutes()}`.slice(-2);
    unavailable.duration = `${durationHours}:${durationMinutes}`;

    this.store.dispatch(
      new fromActionsUnavailable.UnavailableSave(unavailable)
    );
  }

  displayFn(user: IUser): string {
    return user ? `${user.firstName} ${user.lastName}` : '';
  }

  myFilter = (d: Date | null): boolean => {
    const now = new Date();
    const date = (d || now);
    let result = date > now;
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

  setDate($event: any, time: any): void {
    let date = new Date($event.value);
    if (this.startTime.value) {
      const startTime = new Date(this.startTime.value);
      date = new Date(date.setHours(startTime.getHours(), startTime.getMinutes()));
    }

    if (this.room) {
      const day = date.getDay();
      const {minDate, maxDate} = getMinMaxDate(day, $event.value, this.room);
      this.minDate = minDate;
      this.maxDate = maxDate;
    }
    const hours = this.minDate ? this.minDate.getHours() : 0;
    const min = this.minDate ? this.minDate.getMinutes() : 0;

    const maxHour = this.maxDate?.getHours();
    const diffMin = this.maxDate?.getMinutes();

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
      professional: this.professional,
      description: new FormControl(),
      startDate: this.startDate,
      startTime: this.startTime,
      duration: this.duration
    });
    this.filteredOptions = this.professional.valueChanges.pipe(
      startWith(''),
      map(value => typeof value === 'string' ? value : value.name),
      map(name => name ? this._filter(name) : this.professionals ? this.professionals.slice() : this.professionals)
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
      } else if (state.errorMessage) {
        this.snackBar.open(state.errorMessage, 'OK', {
          duration: 5000
        });
      }
    });
  }

  private _filter(name: string): IUser[] | undefined {
    const filterValue = name.toLowerCase();

    return this.professionals?.filter(option => option.firstName?.toLowerCase().indexOf(filterValue) === 0 ||
      option.lastName?.toLowerCase().indexOf(filterValue) === 0);
  }
}
