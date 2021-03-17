import { AfterViewInit, Component, Input, OnDestroy, OnInit } from '@angular/core';
import { AvailabilityDate, IAvailability, IAvailabilityDate, IRoom, Room } from '../../interfaces/room';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Observable, Subscription } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Store } from '@ngrx/store';
import { AppState, selectRoomState } from '../../store/app.states';
import * as fromActionsRoom from '../../store/room.actions';
import { FieldChange } from '../../util/validators';
import { IconName, IIcon } from '../room.component';

@Component({
  selector: 'app-room-detail',
  templateUrl: './room-detail.component.html',
  styleUrls: ['./room-detail.component.scss']
})
export class RoomDetailComponent implements OnInit, AfterViewInit, OnDestroy {
  @Input() room: IRoom | undefined;
  form!: FormGroup;
  getState: Observable<any>;
  subscription: Subscription | undefined;
  errors: any = [];
  error: any;
  professionalName: string | undefined;

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

  name: FormControl = new FormControl('', [
    Validators.required
  ]);

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
    room.name = FieldChange(this.name, this.room?.name);
    room.availabilities = this.availabilities;
    const location = this.address.value.geometry.location;
    room.location = {
      x: location.lat(),
      y: location.lng()
    };

    this.store.dispatch(new fromActionsRoom.RoomUpdate(room));
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

  ignore(day: string, step: number): void {
    this.setIcon(day, IconName.event_busy);
    const index = this.availabilities.findIndex((e) => e.day === day);
    if (index > -1) {
      this.availabilities.splice(index, 1);
    }
    this.step = step;
  }

  private createForm(): void {
    this.form = this.formBuilder.group({
      name: this.name,
      address: this.address
    });
  }

  private getRoom(): void {
    if (!this.room) {
      const id = this.route.snapshot.paramMap.get('id');
      this.store.dispatch(
        new fromActionsRoom.RoomFind(id)
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
        this.form.patchValue(this.room);
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

  private getAvailabilities(availabilities: IAvailability[]): void {
    availabilities.forEach((av: IAvailability) => {
      this.addAvailability(av, 0);

      const availability: IAvailabilityDate = new AvailabilityDate();
      availability.startDate = RoomDetailComponent.createAv(av.start);
      availability.endDate = RoomDetailComponent.createAv(av.end);
      availability.startLunchDate = RoomDetailComponent.createAv(av.startLunch);
      availability.endLunchDate = RoomDetailComponent.createAv(av.endLunch);

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

    if (this.availabilities.length === 0) {
      this.errors.availability = true;
      this.setStep(0);
      return true;
    }

    return false;
  }
}
