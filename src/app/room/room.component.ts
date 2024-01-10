import { Component, ElementRef, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { AbstractControl, UntypedFormBuilder, UntypedFormGroup, Validators, ɵTypedOrUntyped } from '@angular/forms';
import { Store } from '@ngrx/store';
import { AppState, selectRoomState } from '../store/app.states';
import * as fromActionsRoom from '../store/room.actions';
import { AvailabilityDate, IAvailability, IAvailabilityDate, IRoom, IRoomAll, Room } from '../interfaces/room';
import { IUser, IUserAll } from '../interfaces/user';
import { map, startWith } from 'rxjs/operators';
import { TranslateService } from '@ngx-translate/core';
import { requireMatch, valueChange } from '../util/validators';
import { ActivatedRoute, Router } from '@angular/router';
import { Role } from '../interfaces/token';
import { RoomIconName } from '../util/icon';
import { ICurrency, ICurrencyAll } from '../interfaces/currency';
import { IOffice, IOfficeAll } from '../interfaces/office';
import { MatListOption } from '@angular/material/list';
import { IPaymentType, paymentOptions } from '../interfaces/payment';
import timezones from 'timezones-list';
import { API_LOCALE, createDate, createDateFromString, createNewDate, getCurrentTimeZone, getTimeNumber, getTimeZone } from '../util/dates';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { goTo } from '../util/animation';
import { areEquals, createAddress } from '../util/helper';
import PlaceResult = google.maps.places.PlaceResult;
import PlaceGeometry = google.maps.places.PlaceGeometry;

export interface IIcon {
  monday: RoomIconName;
  tuesday: RoomIconName;
  wednesday: RoomIconName;
  thursday: RoomIconName;
  friday: RoomIconName;
  saturday: RoomIconName;
  sunday: RoomIconName;
}

@Component({
  selector: 'app-room',
  templateUrl: './room.component.html',
  styleUrls: ['./room.component.scss']
})
export class RoomComponent implements OnInit, OnDestroy {
  @ViewChild('professionalInput') professionalInput!: ElementRef<HTMLInputElement>;
  @Input() room?: IRoom;

  form!: UntypedFormGroup;
  id?: string;
  isAddMode: boolean;

  errors: any = [];

  step = 0;
  icons: IIcon = {
    monday: RoomIconName.calendarToday,
    tuesday: RoomIconName.calendarToday,
    wednesday: RoomIconName.calendarToday,
    thursday: RoomIconName.calendarToday,
    friday: RoomIconName.calendarToday,
    saturday: RoomIconName.calendarToday,
    sunday: RoomIconName.calendarToday
  };

  monDate?: IAvailabilityDate;
  tueDate?: IAvailabilityDate;
  wedDate?: IAvailabilityDate;
  thuDate?: IAvailabilityDate;
  friDate?: IAvailabilityDate;
  satDate?: IAvailabilityDate;
  sunDate?: IAvailabilityDate;

  primary: boolean;
  today: Date;

  filteredProfessionals?: Observable<IUser[] | undefined>;
  professionals: IUserAll[] = [];
  allProfessional?: IUserAll[];

  currencies?: ICurrencyAll[];
  filteredCurrencyOptions?: Observable<ICurrency[] | undefined>;

  offices?: IOfficeAll[];
  filteredOfficeOptions?: Observable<IOffice[] | undefined>;

  timeZoneList = timezones;
  filteredTimeZoneOptions?: Observable<any[] | undefined>;

  paymentOptions: IPaymentType[] = paymentOptions();

  private getState: Observable<any>;
  private subscription?: Subscription;
  private availabilities: IAvailability[] = [];
  private paymentTypes: string[] = [];
  private geometry?: PlaceGeometry;
  private formattedAddress?: string;
  private currentAvailabilities: IAvailability[] = [];
  private currentPaymentTypes: string[] = [];
  private currentProfessionalIds: string[] = [];

  constructor(private readonly translate: TranslateService, private store: Store<AppState>, private route: ActivatedRoute,
              private formBuilder: UntypedFormBuilder, private router: Router) {
    this.isAddMode = true;
    this.primary = false;
    this.today = createDate();
    this.getState = this.store.select(selectRoomState);
  }

  get getForm(): ɵTypedOrUntyped<any, any, { [p: string]: AbstractControl<any> }> {
    return this.form.controls;
  }

  get submit(): void {
    if (!this.validate()) {
      return;
    }

    const room: IRoom = new Room();
    room.officeId = valueChange(this.getForm.office.value, this.room?.office)?.id;
    room.currencyId = valueChange(this.getForm.currency.value, this.room?.currency)?.id;
    room.timeZone = this.getForm.timeZone.value.tzCode;
    room.primary = this.primary;

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

    room.address = createAddress(this.formattedAddress, this.geometry?.location, this.room?.address, this.getForm.addressDescription.value);

    if (this.getForm.closeDate.value) {
      room.closeDate = createNewDate(this.getForm.closeDate.value).toLocaleString(API_LOCALE);
    }

    if (this.isAddMode) {
      return this.store.dispatch(
        new fromActionsRoom.RoomSave(room)
      );
    } else {
      room.id = this.id;
      this.store.dispatch(new fromActionsRoom.RoomUpdate(room));
    }
  }

  get addProfessional(): void {
    this.router.navigate(['users', 'add'], { state: { role: Role.professional } });
    return;
  }

  get addCurrency(): void {
    this.router.navigate(['currency', 'add']);
    return;
  }

  get addOffice(): void {
    this.router.navigate(['offices', 'add']);
    return;
  }

  private static createAv(date?: string): Date | undefined {
    if (date) {
      const startTime = getTimeNumber(date);
      return createDate(startTime?.hour, startTime?.minute);
    }
    return undefined;
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.id = id;
    }
    this.createForm();
    this.clean();
    this.subscribe();
    this.isAddMode = !this.id;
    if (!this.isAddMode) {
      this.getRoom();
    }
    this.getRoomInfo(); // TODO needs manager role
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }

  setStep(index: number): void {
    this.step = index;
  }

  displayCurrencyFn(currency: ICurrencyAll): string {
    return currency ? currency.code : '';
  }

  displayOfficeFn(office: IOfficeAll): string {
    return office ? office.name : '';
  }

  displayTimeZoneFn(timeZone: any): string {
    return timeZone ? timeZone.label : '';
  }

  keyDownHandler(event: any, form: AbstractControl<any>): void {
    if (event.code === 'Backspace') {
      form.setValue('');
    }
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
      this.getForm.professional.setValue(null);
    }
  }

  selected(event: MatAutocompleteSelectedEvent): void {
    const professional = event.option.value;
    this.professionals.push(professional);
    this.allProfessional = this.allProfessional?.filter(c => c.id !== professional.id);
    this.professionalInput.nativeElement.value = '';
    this.getForm.professional.setValue(null);
  }

  sortProfessionals(data: any): IUser[] {
    return data.sort((a: any, b: any) => {
      const aName = a.displayName.toUpperCase();
      const bName = b.displayName.toUpperCase();
      return (aName > bName) ? 1 : ((bName > aName) ? -1 : 0);
    });
  }

  getAddress(placeResult: PlaceResult): void {
    this.geometry = placeResult.geometry;
    this.formattedAddress = placeResult.formatted_address;
  }

  private createForm(): void {
    this.form = this.formBuilder.group({
      professional: [''],
      currency: ['', [Validators.required, requireMatch]],
      office: ['', [Validators.required, requireMatch]],
      timeZone: ['', [Validators.required, requireMatch]],
      address: ['', Validators.required],
      addressDescription: [''],
      closeDate: ['']
    });
    const currentTimeZone = getCurrentTimeZone().toLowerCase();
    this.getForm.timeZone.setValue(this.timeZoneList.find(timeZone => timeZone.label.toLowerCase().indexOf(currentTimeZone) === 0));
    this.filteredProfessionals = this.getForm.professional.valueChanges.pipe(
      startWith(''),
      map(value => typeof value === 'string' ? value : value ? value.name : ''),
      map(name => name ? this.filter(name) : (this.allProfessional ? this.allProfessional.slice() : this.allProfessional))
    );
    this.filteredCurrencyOptions = this.getForm.currency.valueChanges.pipe(
      startWith(''),
      map(value => typeof value === 'string' ? value : value.code),
      map(name => name ? this.filterCurrency(name) : this.currencies ? this.currencies.slice() : this.currencies)
    );
    this.filteredOfficeOptions = this.getForm.office.valueChanges.pipe(
      startWith(''),
      map(value => typeof value === 'string' ? value : value.namme),
      map(name => name ? this.filterOffice(name) : this.offices ? this.offices.slice() : this.offices)
    );
    this.filteredTimeZoneOptions = this.getForm.timeZone.valueChanges.pipe(
      startWith(''),
      map(value => typeof value === 'string' ? value : value.label),
      map(name => name ? this.filterTimeZone(name) : this.timeZoneList ? this.timeZoneList.slice() : this.timeZoneList)
    );
  }

  private clean(): void {
    this.store.dispatch(
      new fromActionsRoom.Clean()
    );
  }

  private getRoomInfo(): void {
    this.store.dispatch(
      new fromActionsRoom.GetRoomInfo()
    );
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

  private getAvailabilities(availabilities: IAvailability[]): void {
    availabilities.forEach((av: IAvailability) => {
      this.currentAvailabilities = [...this.currentAvailabilities, av];
      this.addAvailability(av, 0);

      const availability: IAvailabilityDate = new AvailabilityDate();
      availability.startDate = RoomComponent.createAv(av.start);
      availability.endDate = RoomComponent.createAv(av.end);
      availability.startLunchDate = RoomComponent.createAv(av.startLunch);
      availability.endLunchDate = RoomComponent.createAv(av.endLunch);

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

  private validate(): boolean {
    if (this.form.invalid) {
      goTo('fields');
      return false;
    }
    this.errors = [];
    if (this.professionals.length === 0) {
      this.errors.professionals = true;
      goTo('professionals');
      return false;
    }

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
      this.errors[`day${ step }`] = true;
      this.setStep(step);
      goTo('availabilities');
      return false;
    }

    if (this.availabilities.length === 0) {
      this.errors.availability = true;
      goTo('availabilities');
      this.setStep(0);
      return false;
    }

    return true;
  }

  private filter(name: string): IUserAll[] | undefined {
    const filterValue = name.toLowerCase();

    return this.allProfessional?.filter(option => option.displayName?.toLowerCase().indexOf(filterValue) === 0);
  }

  private filterCurrency(name: string): ICurrency[] | undefined {
    const filterValue = name.toLowerCase();

    return this.currencies?.filter(option => option.code?.toLowerCase().indexOf(filterValue) === 0);
  }

  private filterOffice(name: string): IOffice[] | undefined {
    const filterValue = name.toLowerCase();

    return this.offices?.filter(option => option.name?.toLowerCase().indexOf(filterValue) === 0);
  }

  private filterTimeZone(name: string): any[] | undefined {
    const filterValue = name.toLowerCase();

    return this.timeZoneList?.filter(option => option.label?.toLowerCase().indexOf(filterValue) >= 0);
  }

  private getRoom(): void {
    const id = this.route.snapshot.paramMap.get('id');
    this.store.dispatch(
      new fromActionsRoom.RoomFind({ id, redirect: true })
    );
  }

  private subscribe(): void {
    this.subscription = this.getState.subscribe(state => {
      this.allProfessional = state.professionals;
      this.currencies = state.currencies;
      this.offices = state.offices;
      if (state.selected && !this.room) {
        const roomTimeZone = getTimeZone(state.selected.timeZone);
        this.room = {
          id: state.selected.room.id,
          address: state.selected.room.address,
          currency: state.selected.room.currency,
          office: state.selected.room.office,
          timeZone: roomTimeZone.label
        } as IRoomAll;
        if (state.selected.room.closeDate) {
          this.room.closeDate = createDateFromString(state.selected.room.closeDate);
        }
        this.primary = state.selected.room.primary;
        this.currentPaymentTypes = state.selected.room.paymentTypes;
        this.paymentTypes = state.selected.room.paymentTypes;
        this.allProfessional = state.selected.professionals;
        state.selected.room.professionals.forEach((professional: IUserAll) => {
          this.professionals.push(professional);
          this.allProfessional = this.allProfessional?.filter(c => c.id !== professional.id);
        });
        this.currentProfessionalIds = this.professionals.map(({ id }) => id);
        this.form.patchValue(this.room);
        this.getForm.addressDescription.setValue(this.room.address?.description);
        this.getForm.address.setValue(this.room.address?.name);
        this.getForm.timeZone.setValue(roomTimeZone);
        this.getAvailabilities(state.selected.room.availabilities);
      }
      if (state.subErrors) {
        state.subErrors.forEach((value: any) => {
          this.errors[value.field] = value.message;
          this.form.controls[value.field].setErrors({ incorrect: true });
        });
      } else if (state.message) {
        this.router.navigate(['rooms']);
      }
    });
  }
}
