import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Store } from '@ngrx/store';
import { AppState, selectRoomState } from '../store/app.states';
import * as fromActionsRoom from '../store/room.actions';
import { IAvailability, IRoom, Room } from '../interfaces/room';
import { IUser } from '../interfaces/user';
import { map, startWith } from 'rxjs/operators';
import { TranslateService } from '@ngx-translate/core';
import { RequireMatch } from '../util/validators';

export enum IconName {
  calendar_today = 'calendar_today',
  event_available = 'event_available',
  event_busy = 'event_busy'
}

export interface IIcon {
  week: IconName;
  saturday: IconName;
  sunday: IconName;
}

@Component({
  selector: 'app-room',
  templateUrl: './room.component.html',
  styleUrls: ['./room.component.scss']
})
export class RoomComponent implements OnInit {
  getState: Observable<any>;
  form!: FormGroup;
  room: IRoom = new Room();
  errors: any = [];

  step = 0;
  icons: IIcon = {
    week: IconName.calendar_today,
    saturday: IconName.calendar_today,
    sunday: IconName.calendar_today
  };

  professionals: IUser[] | undefined;
  filteredOptions: Observable<IUser[] | undefined> | undefined;

  name: FormControl = new FormControl('', [
    Validators.required
  ]);

  professional: FormControl = new FormControl('', [
    Validators.required, RequireMatch
  ]);

  constructor(private readonly translate: TranslateService, private snackBar: MatSnackBar, private store: Store<AppState>,
              private formBuilder: FormBuilder) {
    this.getState = this.store.select(selectRoomState);
  }

  ngOnInit(): void {
    this.createForm();
    this.clean();
    this.subscribe();
    this.getProfessionals();
  }

  createForm(): void {
    this.form = this.formBuilder.group({
      name: this.name,
      professional: this.professional
    });
    this.filteredOptions = this.professional.valueChanges.pipe(
      startWith(''),
      map(value => typeof value === 'string' ? value : value.name),
      map(name => {
        return name ? this._filter(name) : this.professionals ? this.professionals.slice() : this.professionals;
      })
    );
  }

  clean(): void {
    this.store.dispatch(
      new fromActionsRoom.Clean()
    );
  }

  subscribe(): void {
    this.getState.subscribe(state => {
      if (state.professionals) {
        this.professionals = state.professionals;
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

  getProfessionals(): void {
    this.store.dispatch(
      new fromActionsRoom.GetAllProfessional()
    );
  }

  setStep(index: number): void {
    this.step = index;
  }

  create(): void {
    if (this.validate()) {
      return;
    }

    this.room.name = this.name.value;
    this.room.professionalId = this.professional.value.id;

    this.store.dispatch(
      new fromActionsRoom.RoomSave(this.room)
    );
  }

  displayFn(user: IUser): string {
    return user ? `${user.firstName} ${user.lastName}` : '';
  }

  addAvailability(availability: IAvailability, step: number): void {
    this.setIcon(availability.day, IconName.event_available);

    const index = this.room.availabilities.findIndex((e) => e.day === availability.day);

    if (index === -1) {
      this.room.availabilities = [...this.room.availabilities, availability];
    } else {
      this.room.availabilities[index] = availability;
    }

    this.step = step;
  }

  ignore(day: string, step: number): void {
    this.setIcon(day, IconName.event_busy);
    const index = this.room.availabilities.findIndex((e) => e.day === day);
    if (index > -1) {
      this.room.availabilities.splice(index, 1);
    }
    this.step = step;
  }

  private setIcon(day: string, icon: IconName): void {
    switch (day) {
      case 'WEEK':
        this.icons.week = icon;
        break;
      case 'SATURDAY':
        this.icons.saturday = icon;
        break;
      case 'SUNDAY':
        this.icons.sunday = icon;
        break;
    }
  }

  private validate(): boolean {
    if (this.form.invalid) {
      return true;
    }
    let step = -1;
    this.errors = [];
    switch (IconName.calendar_today) {
      case this.icons.week:
        step = 0;
        break;
      case this.icons.saturday:
        step = 1;
        break;
      case this.icons.sunday:
        step = 2;
        break;
    }
    if (step > -1) {
      this.errors[`day${step}`] = true;
      this.setStep(step);
      return true;
    }

    if (this.room.availabilities.length === 0) {
      this.errors.availability = true;
      this.setStep(0);
      return true;
    }

    return false;
  }

  private _filter(name: string): IUser[] | undefined {
    const filterValue = name.toLowerCase();

    return this.professionals?.filter(option => option.firstName?.toLowerCase().indexOf(filterValue) === 0 ||
      option.lastName?.toLowerCase().indexOf(filterValue) === 0);
  }
}
