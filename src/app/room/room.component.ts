import { Component, OnDestroy, OnInit } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Store } from '@ngrx/store';
import { AppState, selectRoomState } from '../store/app.states';
import * as fromActionsRoom from '../store/room.actions';
import { IAddress, IAvailability, ILocation, IRoom, Room } from '../interfaces/room';
import { IUser, IUserAll } from '../interfaces/user';
import { map, startWith } from 'rxjs/operators';
import { TranslateService } from '@ngx-translate/core';
import { requireMatch } from '../util/validators';
import { getUserName } from '../util/helper';
import { Router } from '@angular/router';
import { Role } from '../interfaces/token';
import { RoomIconName } from '../util/icon';

export interface IIcon {
  week: RoomIconName;
  saturday: RoomIconName;
  sunday: RoomIconName;
}

@Component({
  selector: 'app-room',
  templateUrl: './room.component.html',
  styleUrls: ['./room.component.scss']
})
export class RoomComponent implements OnInit, OnDestroy {
  getState: Observable<any>;
  subscription: Subscription | undefined;
  form!: FormGroup;
  room: IRoom = new Room();
  errors: any = [];

  step = 0;
  icons: IIcon = {
    week: RoomIconName.calendarToday,
    saturday: RoomIconName.calendarToday,
    sunday: RoomIconName.calendarToday
  };

  professionals: IUserAll[] | undefined;
  filteredOptions: Observable<IUser[] | undefined> | undefined;

  name: FormControl = new FormControl('', [
    Validators.required
  ]);

  professional: FormControl = new FormControl('', [
    Validators.required, requireMatch
  ]);

  address: FormControl = new FormControl('', [
    Validators.required
  ]);

  addressDescription: FormControl = new FormControl();

  constructor(private readonly translate: TranslateService, private store: Store<AppState>,
              private formBuilder: FormBuilder, private router: Router) {
    this.getState = this.store.select(selectRoomState);
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

  getProfessional(professional: IUser): string {
    return getUserName(professional);
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
    const location = this.address.value.geometry.location;
    this.room.address = {
      name: this.address.value.formatted_address,
      description: this.addressDescription.value,
      location: {
        x: location.lng(),
        y: location.lat()
      } as ILocation
    } as IAddress;

    this.store.dispatch(
      new fromActionsRoom.RoomSave(this.room)
    );
  }

  displayFn(user: IUser): string {
    return user ? getUserName(user) : '';
  }

  addAvailability(availability: IAvailability, step: number): void {
    this.setIcon(availability.day, RoomIconName.eventAvailable);

    const index = this.room.availabilities.findIndex((e) => e.day === availability.day);

    if (index === -1) {
      this.room.availabilities = [...this.room.availabilities, availability];
    } else {
      this.room.availabilities[index] = availability;
    }

    this.step = step;
  }

  ignore(day: string, step: number): void {
    this.setIcon(day, RoomIconName.eventBusy);
    const index = this.room.availabilities.findIndex((e) => e.day === day);
    if (index > -1) {
      this.room.availabilities.splice(index, 1);
    }
    this.step = step;
  }

  addProfessional(): void {
    this.router.navigate(['users', 'add'], {state: {role: Role.professional}});
  }

  private createForm(): void {
    this.form = this.formBuilder.group({
      name: this.name,
      professional: this.professional,
      address: this.address,
      addressDescription: this.addressDescription
    });
    this.filteredOptions = this.professional.valueChanges.pipe(
      startWith(''),
      map(value => typeof value === 'string' ? value : value.name),
      map(name => name ? this.filter(name) : this.professionals ? this.professionals.slice() : this.professionals)
    );
  }

  private clean(): void {
    this.store.dispatch(
      new fromActionsRoom.Clean()
    );
  }

  private subscribe(): void {
    this.subscription = this.getState.subscribe(state => {
      if (state.professionals) {
        this.professionals = state.professionals;
      }
      if (state.subErrors) {
        state.subErrors.forEach((value: any) => {
          this.errors[value.field] = value.message;
          this.form.controls[value.field].setErrors({incorrect: true});
        });
      } else if (state.message) {
        this.router.navigate(['rooms']);
      }
    });
  }

  private getProfessionals(): void {
    this.store.dispatch(
      new fromActionsRoom.GetAllProfessional()
    );
  }

  private setIcon(day: string, icon: RoomIconName): void {
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
    switch (RoomIconName.calendarToday) {
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

  private filter(name: string): IUser[] | undefined {
    const filterValue = name.toLowerCase();

    return this.professionals?.filter(option => getUserName(option)?.toLowerCase().indexOf(filterValue) === 0);
  }
}
