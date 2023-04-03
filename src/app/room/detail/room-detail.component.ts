import { AfterViewInit, Component, ElementRef, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import {
  AvailabilityDate, IAvailability, IAvailabilityDate, IRoom, IRoomAll
} from '../../interfaces/room';
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { Observable, Subscription } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { AppState, selectRoomState } from '../../store/app.states';
import * as fromActionsRoom from '../../store/room.actions';
import { IIcon } from '../room.component';
import { createDate, getTimeZone } from '../../util/dates';
import { areEquals, getFullUserName } from '../../util/helper';
import { RoomIconName } from '../../util/icon';
import { IPaymentType, paymentOptions } from '../../interfaces/payment';
import { MatListOption } from '@angular/material/list';
import { IUser, IUserAll } from '../../interfaces/user';
import { Role } from '../../interfaces/token';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { map, startWith } from 'rxjs/operators';

@Component({
  selector: 'app-room-detail',
  templateUrl: './room-detail.component.html',
  styleUrls: ['./room-detail.component.scss']
})
export class RoomDetailComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('professionalInput') professionalInput!: ElementRef<HTMLInputElement>;
  @Input() room?: IRoomAll;

  form!: UntypedFormGroup;

  errors: any = [];
  step = 0;

  professional = new UntypedFormControl('', [
    Validators.required
  ])
  filteredProfessionals?: Observable<IUser[] | undefined>;
  professionals: IUserAll[] = [];
  allProfessional?: IUserAll[];

  icons: IIcon = {
    monday: RoomIconName.eventBusy,
    tuesday: RoomIconName.eventBusy,
    wednesday: RoomIconName.eventBusy,
    thursday: RoomIconName.eventBusy,
    friday: RoomIconName.eventBusy,
    saturday: RoomIconName.eventBusy,
    sunday: RoomIconName.eventBusy
  };

  monDate?: IAvailabilityDate;
  tueDate?: IAvailabilityDate;
  wedDate?: IAvailabilityDate;
  thuDate?: IAvailabilityDate;
  friDate?: IAvailabilityDate;
  satDate?: IAvailabilityDate;
  sunDate?: IAvailabilityDate;

  address: UntypedFormControl = new UntypedFormControl('', [
    Validators.required
  ]);
  addressDescription: UntypedFormControl = new UntypedFormControl();

  paymentOptions: IPaymentType[] = paymentOptions();

  private getState: Observable<any>;
  private subscription?: Subscription;
  private availabilities: IAvailability[] = [];
  private paymentTypes: string[] = [];

  private currentAvailabilities: IAvailability[] = [];
  private currentPaymentTypes: string[] = [];
  private currentProfessionalIds: string[] = [];

  constructor(private route: ActivatedRoute, private store: Store<AppState>, private formBuilder: UntypedFormBuilder,
              private router: Router) {
    this.getState = this.store.select(selectRoomState);
  }

  get update(): void {
    if (!this.isValid()) {
      return;
    }
    if (this.room) {
      const room: IRoom = {
        id: this.room.id,
        currency: this.room.currency,
        office: this.room.office,
        timeZone: this.room.timeZone
      };

      const newProfessionalIds = this.professionals.map(({ id }) => id);
      if (!areEquals(newProfessionalIds, this.currentProfessionalIds)) {
        room.professionalIds = newProfessionalIds;
      }

      if (this.paymentTypes !== this.currentPaymentTypes) {
        room.paymentTypes = this.paymentTypes;
      }
      if (!areEquals(this.availabilities, this.currentAvailabilities)) {
        room.availabilities = this.availabilities;
      }

      if (this.address.value && this.address.value.geometry) {
        const location = this.address.value.geometry.location;
        room.address = {
          name: this.address.value.formatted_address,
          location: {
            x: location.lng(),
            y: location.lat()
          }
        }
      }

      this.store.dispatch(new fromActionsRoom.RoomUpdate(room));
    }
    return;
  }

  get addProfessional(): void {
    this.router.navigate(['users', 'add'], { state: { role: Role.professional } });
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
    this.clean();
    this.subscribe();
  }

  ngAfterViewInit(): void {
    this.getRoom();
  }

  setStep(index: number): void {
    this.step = index;
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

  ignore(day: string, step: number): void {
    this.setIcon(day, RoomIconName.eventBusy);
    const index = this.availabilities.findIndex((e) => e.day === day);
    if (index > -1) {
      this.availabilities.splice(index, 1);
    }
    this.step = step;
  }

  onChange(options: MatListOption[]): void {
    this.paymentTypes = options.map(o => o.value);
  }

  isSelected(it: IPaymentType): boolean {
    return it.checked || this.paymentTypes.includes(it.name);
  }

  remove(professional: IUserAll): void {
    const index = this.professionals.indexOf(professional);
    if (index >= 0) {
      this.professionals.splice(index, 1);
      this.allProfessional?.push(professional);
      this.professional.setValue(null);
    }
  }

  selected(event: MatAutocompleteSelectedEvent): void {
    const professional = event.option.value;
    this.professionals.push(professional);
    this.allProfessional = this.allProfessional?.filter(c => c.id !== professional.id);
    this.professionalInput.nativeElement.value = '';
    this.professional.setValue(null);
  }

  sortProfessionals(data: any): IUser[] {
    return data.sort((a: any, b: any) => {
      const aName = getFullUserName(a).toUpperCase();
      const bName = getFullUserName(b).toUpperCase();
      return (aName > bName) ? 1 : ((bName > aName) ? -1 : 0);
    });
  }

  private createForm(): void {
    this.form = this.formBuilder.group({
      professional: this.professional,
      address: this.address,
      addressDescription: this.addressDescription
    });
    this.filteredProfessionals = this.professional.valueChanges.pipe(
      startWith(''),
      map(value => typeof value === 'string' ? value : value ? value.name : ''),
      map(
        name => name ? this.filter(name) : (this.allProfessional ? this.allProfessional.slice() : this.allProfessional))
    );
  }

  private getRoom(): void {
    const id = this.route.snapshot.paramMap.get('id');
    this.store.dispatch(
      new fromActionsRoom.RoomFind({ id, redirect: true })
    );
  }

  private subscribe(): void {
    this.subscription = this.getState.subscribe(state => {
      if (state.selected) {
        const roomTimeZone = getTimeZone(state.selected.timeZone);
        this.room = {
          id: state.selected.room.id,
          address: state.selected.room.address,
          currency: state.selected.room.currency,
          office: state.selected.room.office,
          timeZone: roomTimeZone.label
        } as IRoomAll;
        this.currentPaymentTypes = state.selected.room.paymentTypes;
        this.paymentTypes = state.selected.room.paymentTypes;
        this.allProfessional = state.selected.professionals;
        state.selected.room.professionals.forEach((professional: IUserAll) => {
          this.professionals.push(professional);
          this.allProfessional = this.allProfessional?.filter(c => c.id !== professional.id);
        });
        this.currentProfessionalIds = this.professionals.map(({ id }) => id);
        this.addressDescription.setValue(this.room.address?.description);
        this.address.setValue(this.room.address?.name);
        this.getAvailabilities(state.selected.room.availabilities);
        this.form.patchValue(this.room);
      }
      if (state.subErrors) {
        state.subErrors.forEach((value: any) => {
          this.errors[value.field] = value.message;
          this.form.controls[value.field].setErrors({ incorrect: true });
        });
      }
      else if (state.message) {
        this.router.navigate(['rooms']);
      }
    });
  }

  private getAvailabilities(availabilities: IAvailability[]): void {
    availabilities.forEach((av: IAvailability) => {
      this.currentAvailabilities = [...this.currentAvailabilities, av];
      this.addAvailability(av, 0);

      const availability: IAvailabilityDate = new AvailabilityDate();
      availability.startDate = RoomDetailComponent.createAv(av.start);
      availability.endDate = RoomDetailComponent.createAv(av.end);
      availability.startLunchDate = RoomDetailComponent.createAv(av.startLunch);
      availability.endLunchDate = RoomDetailComponent.createAv(av.endLunch);

      switch (av.day) {
        case 'MONDAY':
          this.monDate = availability;
          break;
        case 'TUESDAY':
          this.tueDate = availability;
          break;
        case 'WEDNESDAY':
          this.wedDate = availability;
          break;
        case 'THURSDAY':
          this.thuDate = availability;
          break;
        case 'FRIDAY':
          this.friDate = availability;
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
      case 'MONDAY':
        this.icons.monday = icon;
        break;
      case 'TUESDAY':
        this.icons.tuesday = icon;
        break;
      case 'WEDNESDAY':
        this.icons.wednesday = icon;
        break;
      case 'THURSDAY':
        this.icons.thursday = icon;
        break;
      case 'FRIDAY':
        this.icons.friday = icon;
        break;
      case 'SATURDAY':
        this.icons.saturday = icon;
        break;
      case 'SUNDAY':
        this.icons.sunday = icon;
        break;
    }
  }

  private isValid(): boolean {
    let step = -1;
    this.errors = [];
    switch (RoomIconName.calendarToday) {
      case this.icons.monday:
        step = 0;
        break;
      case this.icons.tuesday:
        step = 1;
        break;
      case this.icons.wednesday:
        step = 2;
        break;
      case this.icons.thursday:
        step = 3;
        break;
      case this.icons.friday:
        step = 4;
        break;
      case this.icons.saturday:
        step = 5;
        break;
      case this.icons.sunday:
        step = 6;
        break;
    }
    if (step > -1) {
      this.errors[`day${step}`] = true;
      this.setStep(step);
      return false;
    }

    if (this.availabilities.length === 0) {
      this.errors.availability = true;
      this.setStep(0);
      return false;
    }

    if (this.professionals.length === 0) {
      this.errors.professionals = true;
      document.getElementById('professionals')?.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
        inline: 'nearest'
      });
      return false;
    }

    return true;
  }

  private filter(name: string): IUserAll[] | undefined {
    const filterValue = name.toLowerCase();

    return this.allProfessional?.filter(option => getFullUserName(option)?.toLowerCase().indexOf(filterValue) === 0);
  }

  private clean(): void {
    this.store.dispatch(
      new fromActionsRoom.Clean()
    );
  }
}
