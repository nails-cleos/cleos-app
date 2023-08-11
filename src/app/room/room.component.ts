import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { Store } from '@ngrx/store';
import { AppState, selectRoomState } from '../store/app.states';
import * as fromActionsRoom from '../store/room.actions';
import { IAddress, IAvailability, ILocation, IRoom, Room } from '../interfaces/room';
import { IUser, IUserAll } from '../interfaces/user';
import { map, startWith } from 'rxjs/operators';
import { TranslateService } from '@ngx-translate/core';
import { requireMatch } from '../util/validators';
import { getFullUserName } from '../util/helper';
import { Router } from '@angular/router';
import { Role } from '../interfaces/token';
import { RoomIconName } from '../util/icon';
import { ICurrency, ICurrencyAll } from '../interfaces/currency';
import { IOffice, IOfficeAll } from '../interfaces/office';
import { MatListOption } from '@angular/material/list';
import { IPaymentType, paymentOptions } from '../interfaces/payment';
import timezones from 'timezones-list';
import { getCurrentTimeZone } from '../util/dates';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { goTo } from '../util/animation';
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

  form!: UntypedFormGroup;
  room: IRoom = new Room();
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

  professional = new UntypedFormControl();
  filteredProfessionals?: Observable<IUser[] | undefined>;
  professionals: IUserAll[] = [];
  allProfessional?: IUserAll[];

  address: UntypedFormControl = new UntypedFormControl('', [
    Validators.required
  ]);

  addressDescription: UntypedFormControl = new UntypedFormControl();

  currencies?: ICurrencyAll[];
  filteredCurrencyOptions?: Observable<ICurrency[] | undefined>;

  currency: UntypedFormControl = new UntypedFormControl('', [
    Validators.required, requireMatch
  ]);

  offices?: IOfficeAll[];
  filteredOfficeOptions?: Observable<IOffice[] | undefined>;

  office: UntypedFormControl = new UntypedFormControl('', [
    Validators.required, requireMatch
  ]);

  timeZoneList = timezones;
  filteredTimeZoneOptions?: Observable<any[] | undefined>;

  timeZone: UntypedFormControl = new UntypedFormControl('', [
    Validators.required, requireMatch
  ]);


  paymentOptions: IPaymentType[] = paymentOptions();

  private getState: Observable<any>;
  private subscription?: Subscription;
  private paymentTypes: string[] = [];
  private geometry?: PlaceGeometry;
  private formattedAddress?: string;

  constructor(private readonly translate: TranslateService, private store: Store<AppState>,
              private formBuilder: UntypedFormBuilder, private router: Router) {
    this.getState = this.store.select(selectRoomState);
  }

  get create(): void {
    if (this.validate()) {
      return;
    }

    this.room.professionalIds = this.professionals.map(({ id }) => id);
    this.room.officeId = this.office.value.id;
    this.room.currencyId = this.currency.value.id;
    this.room.timeZone = this.timeZone.value.tzCode;
    this.room.paymentTypes = this.paymentTypes;
    const location = this.geometry?.location;
    this.room.address = {
      name: this.formattedAddress,
      description: this.addressDescription.value,
      location: {
        x: location?.lng(),
        y: location?.lat()
      } as ILocation
    } as IAddress;

    return this.store.dispatch(
      new fromActionsRoom.RoomSave(this.room)
    );
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

  ngOnInit(): void {
    this.createForm();
    this.clean();
    this.subscribe();
    this.getRoomInfo();
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

  keyDownHandler(event: any, form: UntypedFormControl): void {
    if (event.code === 'Backspace') {
      form.setValue('');
    }
  }

  addAvailability(availability: IAvailability, step: number): void {
    this.setIcon(availability.day, RoomIconName.eventAvailable);

    if (this.room.availabilities) {
      const index = this.room.availabilities.findIndex((e) => e.day === availability.day);

      if (index === -1) {
        this.room.availabilities = [...this.room.availabilities, availability];
      } else {
        this.room.availabilities[index] = availability;
      }
    }

    this.step = step;
  }

  ignore(day: string, step: number): void {
    this.setIcon(day, RoomIconName.eventBusy);
    if (this.room.availabilities) {
      const index = this.room.availabilities.findIndex((e) => e.day === day);
      if (index > -1) {
        this.room.availabilities.splice(index, 1);
      }
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

  getAddress(placeResult: PlaceResult): void {
    this.geometry = placeResult.geometry;
    this.formattedAddress = placeResult.formatted_address;
  }

  private createForm(): void {
    this.form = this.formBuilder.group({
      professional: this.professional,
      currency: this.currency,
      office: this.office,
      timeZone: this.timeZone,
      address: this.address,
      addressDescription: this.addressDescription
    });
    const currentTimeZone = getCurrentTimeZone().toLowerCase();
    this.timeZone.setValue(this.timeZoneList.find(timeZone => timeZone.label.toLowerCase().indexOf(currentTimeZone) === 0));
    this.filteredProfessionals = this.professional.valueChanges.pipe(
      startWith(''),
      map(value => typeof value === 'string' ? value : value ? value.name : ''),
      map(name => name ? this.filter(name) : (this.allProfessional ? this.allProfessional.slice() : this.allProfessional))
    );
    this.filteredCurrencyOptions = this.currency.valueChanges.pipe(
      startWith(''),
      map(value => typeof value === 'string' ? value : value.code),
      map(name => name ? this.filterCurrency(name) : this.currencies ? this.currencies.slice() : this.currencies)
    );
    this.filteredOfficeOptions = this.office.valueChanges.pipe(
      startWith(''),
      map(value => typeof value === 'string' ? value : value.namme),
      map(name => name ? this.filterOffice(name) : this.offices ? this.offices.slice() : this.offices)
    );
    this.filteredTimeZoneOptions = this.timeZone.valueChanges.pipe(
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

  private subscribe(): void {
    this.subscription = this.getState.subscribe(state => {
      this.allProfessional = state.professionals;
      this.currencies = state.currencies;
      this.offices = state.offices;
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

  private validate(): boolean {
    if (this.form.invalid) {
      return goTo('fields');
    }
    this.errors = [];
    if (this.professionals.length === 0) {
      this.errors.professionals = true;
      return goTo('professionals');
    }

    let step = -1;
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
      return true;
    }

    if (!this.room.availabilities || this.room.availabilities.length === 0) {
      this.errors.availability = true;
      this.setStep(0);
      return true;
    }

    return false;
  }

  private filter(name: string): IUserAll[] | undefined {
    const filterValue = name.toLowerCase();

    return this.allProfessional?.filter(option => getFullUserName(option)?.toLowerCase().indexOf(filterValue) === 0);
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
}
