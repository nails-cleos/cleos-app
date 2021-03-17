import { AfterViewInit, Component, Input, OnDestroy, OnInit } from '@angular/core';
import { AvailabilityDate, IAvailability, IAvailabilityDate, IRoom, Room } from '../../interfaces/room';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Observable, Subscription } from 'rxjs';
import { IconName, IIcon } from '../room.component';
import { ActivatedRoute } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Store } from '@ngrx/store';
import { AppState, selectRoomState } from '../../store/app.states';
import * as fromActionsRoom from '../../store/room.actions';

@Component({
  selector: 'app-room-me',
  templateUrl: './room-me.component.html',
  styleUrls: ['./room-me.component.scss']
})
export class RoomMeComponent implements OnInit, AfterViewInit, OnDestroy {
  @Input() room: IRoom | undefined;
  getState: Observable<any>;
  subscription: Subscription | undefined;
  errors: any = [];
  professionalName: string | undefined;
  error: any;

  step = 0;
  icons: IIcon = {
    week: IconName.event_busy,
    saturday: IconName.event_busy,
    sunday: IconName.event_busy
  };
  weekDate?: IAvailabilityDate;
  satDate?: IAvailabilityDate;
  sunDate?: IAvailabilityDate;

  availabilities: IAvailability[] = [];

  form!: FormGroup;
  address: FormControl = new FormControl('', [
    Validators.required
  ]);

  constructor(private route: ActivatedRoute, private snackBar: MatSnackBar, private store: Store<AppState>,
              private formBuilder: FormBuilder) {
    this.getState = this.store.select(selectRoomState);
  }

  private static createAv(date: string | undefined): Date | undefined {
    if (date) {
      const startTime = date.split(':');
      return new Date(new Date().setHours(Number(startTime[0]), Number(startTime[1])));
    }
    return undefined;
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }

  ngOnInit(): void {
    this.createForm();
    this.subscribe();
  }

  ngAfterViewInit(): void {
    this.getRoom();
  }

  setStep(index: number): void {
    this.step = index;
  }

  update(): void {
    if (this.validate()) {
      return;
    }
    const room: IRoom = new Room();
    room.id = this.room?.id;
    room.availabilities = this.availabilities;
    const location = this.address.value.geometry.location;
    room.location = {
      x: location.lat(),
      y: location.lng()
    };

    this.store.dispatch(new fromActionsRoom.RoomUpdateMe(room));
    this.room = undefined;
    this.availabilities = [];
  }

  ignore(day: string, step: number): void {
    this.setIcon(day, IconName.event_busy);
    const index = this.availabilities.findIndex((e) => e.day === day);
    if (index > -1) {
      this.availabilities.splice(index, 1);
    }
    this.step = step;
  }

  addAvailability(availability: IAvailability, step: number): void {
    this.setIcon(availability.day, IconName.event_available);
    const index = this.availabilities.findIndex((e) => e.day === availability.day);

    if (index !== -1) {
      this.availabilities.splice(index, 1);
    }
    this.availabilities = [...this.availabilities, availability];

    this.step = step;
  }

  validate(): boolean {
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

    if (this.availabilities.length === 0) {
      this.errors.availability = true;
      this.setStep(0);
      return true;
    }

    return false;
  }

  private createForm(): void {
    this.form = this.formBuilder.group({
      address: this.address
    });
  }

  private getRoom(): void {
    if (!this.room) {
      this.store.dispatch(
        new fromActionsRoom.GetMyRoom()
      );
    }
  }

  private subscribe(): void {
    this.subscription = this.getState.subscribe(state => {
      if (state.selected) {
        this.room = {
          id: state.selected.id,
          name: state.selected.name,
          location: state.selected.location
        } as IRoom;
        this.professionalName = `${state.selected.professional.firstName} ${state.selected.professional.lastName}`;
        this.getAvailabilities(state.selected.availabilities);
      }
      if (state.subErrors) {
        state.subErrors.forEach((value: any) => {
          this.errors[value.field] = value.message;
        });
      } else if (state.errorMessage || state.message) {
        const snackBarRef = this.snackBar.open(state.errorMessage || state.message, 'OK', {
          duration: 5000
        });
        if (state.message) {
          snackBarRef.afterDismissed().subscribe(() => {
            this.getRoom();
          });
        } else {
          this.error = state.error;
        }
      }
    });
  }

  private getAvailabilities(availabilities: IAvailability[]): void {
    availabilities.forEach((av: IAvailability) => {
      this.addAvailability(av, 0);

      const availability: IAvailabilityDate = new AvailabilityDate();
      availability.startDate = RoomMeComponent.createAv(av.start);
      availability.endDate = RoomMeComponent.createAv(av.end);
      availability.startLunchDate = RoomMeComponent.createAv(av.startLunch);
      availability.endLunchDate = RoomMeComponent.createAv(av.endLunch);

      switch (av.day) {
        case 'WEEK':
          this.weekDate = availability;
          break;
        case 'SATURDAY':
          this.satDate = availability;
          break;
        case 'SUNDAY':
          this.sunDate = availability;
      }
    });
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
}
