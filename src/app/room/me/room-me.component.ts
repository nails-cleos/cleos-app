import { AfterViewInit, Component, Input, OnDestroy, OnInit } from '@angular/core';
import { AvailabilityDate, IAddress, IAvailability, IAvailabilityDate, ILocation, IRoom, IRoomAll } from '../../interfaces/room';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Observable, Subscription } from 'rxjs';
import { IIcon } from '../room.component';
import { ActivatedRoute } from '@angular/router';
import { Store } from '@ngrx/store';
import { AppState, selectRoomState } from '../../store/app.states';
import * as fromActionsRoom from '../../store/room.actions';
import { createDate, getTimeZone } from '../../util/dates';
import { getUserName } from '../../util/helper';
import { RoomIconName } from '../../util/icon';
import { IPaymentType, paymentOptions } from '../../interfaces/payment';
import { MatListOption } from '@angular/material/list';

@Component({
  selector: 'app-room-me',
  templateUrl: './room-me.component.html',
  styleUrls: ['./room-me.component.scss']
})
export class RoomMeComponent implements OnInit, AfterViewInit, OnDestroy {
  @Input() room?: IRoomAll;
  errors: any = [];
  professionalName?: string;

  step = 0;
  icons: IIcon = {
    week: RoomIconName.eventBusy,
    saturday: RoomIconName.eventBusy,
    sunday: RoomIconName.eventBusy
  };
  weekDate?: IAvailabilityDate;
  satDate?: IAvailabilityDate;
  sunDate?: IAvailabilityDate;

  form!: FormGroup;
  address: FormControl = new FormControl('', [
    Validators.required
  ]);
  addressDescription: FormControl = new FormControl();

  paymentOptions: IPaymentType[] = paymentOptions();

  private getState: Observable<any>;
  private subscription?: Subscription;
  private availabilities: IAvailability[] = [];
  private paymentTypes: string[] = [];

  constructor(private route: ActivatedRoute, private store: Store<AppState>, private formBuilder: FormBuilder) {
    this.getState = this.store.select(selectRoomState);
  }

  get update(): void {
    if (this.validate()) {
      return;
    }
    if (this.room) {
      const room: IRoom = {
        id: this.room.id,
        availabilities: this.availabilities,
        paymentTypes: this.paymentTypes,
        address: {
          name: this.room.address.name,
          location: this.room.address.location,
          description: this.addressDescription.value
        } as IAddress,
        professional: this.room.professional,
        currency: this.room.currency,
        office: this.room.office,
        timeZone: this.room.timeZone
      };

      if (this.address.value && this.address.value.geometry && room.address) {
        const location = this.address.value.geometry.location;
        room.address.name = this.address.value.formatted_address;
        room.address.location = {
          x: location.lng(),
          y: location.lat()
        } as ILocation;
      }

      this.store.dispatch(new fromActionsRoom.RoomUpdate(room));
      this.availabilities = [];
    }
    return;
  }

  private static createAv(date?: string): Date | undefined {
    if (date) {
      const startTime = date.split(':');
      return createDate(Number(startTime[0]), Number(startTime[1]));
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

  ignore(day: string, step: number): void {
    this.setIcon(day, RoomIconName.eventBusy);
    const index = this.availabilities.findIndex((e) => e.day === day);
    if (index > -1) {
      this.availabilities.splice(index, 1);
    }
    this.step = step;
  }

  addAvailability(availability: IAvailability, step: number): void {
    this.setIcon(availability.day, RoomIconName.eventAvailable);
    const index = this.availabilities.findIndex((e) => e.day === availability.day);

    if (index !== -1) {
      this.availabilities.splice(index, 1);
    }
    this.availabilities = [...this.availabilities, availability];

    this.step = step;
  }

  onChange(options: MatListOption[]): void {
    this.paymentTypes = options.map(o => o.value);
  }

  isSelected(it: IPaymentType): boolean {
    return it.checked || this.paymentTypes.includes(it.name);
  }

  validate(): boolean {
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

    if (this.availabilities.length === 0) {
      this.errors.availability = true;
      this.setStep(0);
      return true;
    }

    return false;
  }

  private createForm(): void {
    this.form = this.formBuilder.group({
      address: this.address,
      addressDescription: this.addressDescription
    });
  }

  private getRoom(): void {
    this.route.params.subscribe((routeParams) => {
      const id = routeParams.id;
      if (!this.room || this.room.id !== id) {
        this.store.dispatch(
          new fromActionsRoom.RoomFind({id})
        );
      }
    });
  }

  private subscribe(): void {
    this.subscription = this.getState.subscribe(state => {
      if (state.selected) {
        const roomTimeZone = getTimeZone(state.selected.timeZone);
        this.room = {
          id: state.selected.id,
          address: state.selected.address,
          currency: state.selected.currency,
          office: state.selected.office,
          timeZone: roomTimeZone.label
        } as IRoomAll;
        this.paymentTypes = state.selected.paymentTypes;
        this.addressDescription.setValue(this.room.address?.description);
        this.professionalName = getUserName(state.selected.professional);
        this.getAvailabilities(state.selected.availabilities);
      }
      if (state.subErrors) {
        state.subErrors.forEach((value: any) => {
          this.errors[value.field] = value.message;
        });
      } else if (state.message) {
        this.getRoom();
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
}
