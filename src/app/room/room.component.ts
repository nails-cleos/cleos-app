import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  ElementRef,
  inject,
  input,
  output,
  Signal,
  signal,
  viewChild,
} from '@angular/core';
import { combineLatestWith } from 'rxjs';
import {
  AbstractControl,
  FormGroup,
  NonNullableFormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import {
  AvailabilityDate,
  IAvailability,
  IAvailabilityDate,
  IRoom,
  IRoomAll,
  Room,
} from './room';
import { IUser, IUserAll } from '../user/user';
import { map, startWith } from 'rxjs/operators';
import { requireMatch } from '../util/validators';
import { Role } from '../interfaces/token';
import { RoomIconName } from '../util/icon';
import { ICurrencyAll } from '../currency/currency';
import { IOfficeAll } from '../office/office';
import { MatListOption, MatSelectionList } from '@angular/material/list';
import { IPaymentOption } from '../interfaces/payment';
import { TimeZone } from 'timezones-list';
import {
  createDate,
  createDateFromString,
  getCurrentTimeZone,
  getTimeZone,
  TIMEZONES,
} from '../util/dates';
import {
  MatAutocomplete,
  MatAutocompleteSelectedEvent,
  MatAutocompleteTrigger,
} from '@angular/material/autocomplete';
import { goTo } from '../util/animation';
import { isString, TranslatePipe } from '@ngx-translate/core';
import { AvailabilityComponent } from './availability/availability.component';
import {
  GoogleMapComponent,
  GoogleMapForm,
} from '../shared/google-map/google-map.component';
import { BackButtonDirective } from '../directives/back-button.directive';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { ICommon, IError } from '../interfaces/common';
import { RoomNamePipe } from '../pipes/room-name.pipe';
import {
  MatError,
  MatFormField,
  MatInput,
  MatLabel,
  MatPrefix,
} from '@angular/material/input';
import {
  MatDatepicker,
  MatDatepickerInput,
} from '@angular/material/datepicker';
import { MatOption } from '@angular/material/core';
import { MatIcon } from '@angular/material/icon';
import {
  MatAccordion,
  MatExpansionPanel,
  MatExpansionPanelDescription,
  MatExpansionPanelHeader,
  MatExpansionPanelTitle,
} from '@angular/material/expansion';
import { MatButton, MatIconButton } from '@angular/material/button';
import {
  MatChipGrid,
  MatChipInput,
  MatChipRemove,
  MatChipRow,
} from '@angular/material/chips';
import { MatCheckbox } from '@angular/material/checkbox';
import { RoomStore } from '../store/room.store';
import { RoomForm } from './room-form.types';
import { NavigationService } from '../services/navigation.service';
import { PaymentStore } from '../store/payment.store';
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
  styleUrls: ['./room.component.scss'],
  imports: [
    MatFormField,
    MatLabel,
    MatInput,
    MatDatepickerInput,
    MatDatepicker,
    MatOption,
    MatIcon,
    MatAccordion,
    MatExpansionPanel,
    MatExpansionPanelHeader,
    MatExpansionPanelTitle,
    MatExpansionPanelDescription,
    MatIconButton,
    MatButton,
    ReactiveFormsModule,
    TranslatePipe,
    MatAutocomplete,
    MatError,
    MatAutocompleteTrigger,
    MatPrefix,
    AvailabilityComponent,
    GoogleMapComponent,
    BackButtonDirective,
    RoomNamePipe,
    MatChipGrid,
    MatChipRow,
    MatChipInput,
    MatChipRemove,
    MatCheckbox,
    MatSelectionList,
    MatListOption,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RoomComponent {
  config = input.required<ICommon>();
  room = input<IRoomAll | undefined>();
  currencies = input<ICurrencyAll[] | undefined>();
  offices = input<IOfficeAll[] | undefined>();

  submitData = output<IRoom>();

  private readonly roomStore = inject(RoomStore);
  private readonly paymentStore = inject(PaymentStore);
  private readonly formBuilder: NonNullableFormBuilder = inject(
    NonNullableFormBuilder,
  );
  private readonly navigationService: NavigationService =
    inject(NavigationService);

  private professionalsSignal = this.roomStore.professionals;
  private subErrorsSignal = this.roomStore.subErrors;
  private paymentOptionsSignal = this.paymentStore.options;
  private readonly timezones = TIMEZONES;

  errors = signal<Record<string, unknown>>({});

  googleMapForm: FormGroup<GoogleMapForm> =
    this.formBuilder.group<GoogleMapForm>({
      address: this.formBuilder.control('', {
        validators: [Validators.required],
      }),
      addressDescription: this.formBuilder.control(undefined),
    });

  form: FormGroup<RoomForm> = this.formBuilder.group<RoomForm>({
    professional: this.formBuilder.control(undefined, {
      validators: [requireMatch],
    }),
    currency: this.formBuilder.control(undefined, {
      validators: [Validators.required, requireMatch],
    }),
    office: this.formBuilder.control(undefined, {
      validators: [Validators.required, requireMatch],
    }),
    timeZone: this.formBuilder.control(
      this.timezones.find(
        (timeZone) =>
          timeZone.label
            .toLowerCase()
            .indexOf(getCurrentTimeZone().toLowerCase()) === 0,
      ),
      {
        validators: [Validators.required, requireMatch],
      },
    ),
    closeDate: this.formBuilder.control(undefined),
    addressForm: this.googleMapForm,
  });

  step = 0;
  icons: IIcon = {
    monday: RoomIconName.calendarToday,
    tuesday: RoomIconName.calendarToday,
    wednesday: RoomIconName.calendarToday,
    thursday: RoomIconName.calendarToday,
    friday: RoomIconName.calendarToday,
    saturday: RoomIconName.calendarToday,
    sunday: RoomIconName.calendarToday,
  };

  monDate?: IAvailabilityDate;
  tueDate?: IAvailabilityDate;
  wedDate?: IAvailabilityDate;
  thuDate?: IAvailabilityDate;
  friDate?: IAvailabilityDate;
  satDate?: IAvailabilityDate;
  sunDate?: IAvailabilityDate;

  primary: boolean = false;
  today: Date = createDate(this.getForm.timeZone.value?.tzCode);

  selectedProfessionalsSignal = signal<IUserAll[]>([]);
  professionalsWritableSignal = signal<IUserAll[] | undefined>(undefined);

  filteredProfessionalSignal: Signal<IUserAll[] | undefined> = toSignal(
    this.getForm.professional.valueChanges.pipe(
      startWith(''),
      map((value) =>
        !value || typeof value === 'string' ? value : value.displayName,
      ),
      combineLatestWith(toObservable(this.professionalsWritableSignal)),
      map(([name, professionals]) => {
        if (!professionals) {
          return [];
        }

        return name ? this.filter(name, professionals) : professionals.slice();
      }),
    ),
  );

  professionalInput =
    viewChild<ElementRef<HTMLInputElement>>('professionalInput');

  filteredCurrencySignal: Signal<ICurrencyAll[] | undefined> = toSignal(
    this.getForm.currency.valueChanges.pipe(
      startWith(''),
      map((value) =>
        !value || typeof value === 'string' ? value : value.code,
      ),
      combineLatestWith(toObservable(this.currencies)),
      map(([name, currencies]) => {
        if (!currencies) {
          return [];
        }

        return name
          ? this.filterCurrency(name, currencies)
          : currencies.slice();
      }),
    ),
  );

  filteredOfficeSignal: Signal<IOfficeAll[] | undefined> = toSignal(
    this.getForm.office.valueChanges.pipe(
      startWith(''),
      map((value) =>
        !value || typeof value === 'string' ? value : value.name,
      ),
      combineLatestWith(toObservable(this.offices)),
      map(([name, offices]) => {
        if (!offices) {
          return [];
        }

        return name ? this.filterOffice(name, offices) : offices.slice();
      }),
    ),
  );

  filteredTimeZoneSignal: Signal<TimeZone[] | undefined> = toSignal(
    this.getForm.timeZone.valueChanges.pipe(
      startWith(''),
      map((value) => (typeof value === 'string' ? value : value?.label)),
      map((name) =>
        name
          ? this.filterTimeZone(name, this.timezones)
          : this.timezones.slice(),
      ),
    ),
  );

  paymentOptions = computed(() => {
    return this.paymentOptionsSignal().filter(
      (option) => option.enabled && option.show,
    );
  });

  private availabilities: IAvailability[] = [];
  private paymentTypes: string[] = [];
  private geometry?: PlaceGeometry;
  private formattedAddress?: string;
  private currentAvailabilities: IAvailability[] = [];
  private currentProfessionalIds: string[] = [];

  constructor() {
    this.roomStore.loadInfo();
    this.paymentStore.getOptions();
    effect(() => {
      const paymentOptions = this.paymentOptions();
      if (!paymentOptions.length || this.room() || this.paymentTypes.length) {
        return;
      }

      this.paymentTypes = paymentOptions
        .filter((option) => option.default)
        .map((option) => option.type);
    });

    effect(() => {
      const selected = this.room();
      if (selected) {
        const timeZone = this.timezones.find(
          (timeZone) =>
            timeZone.label
              .toLowerCase()
              .indexOf(getTimeZone(selected.timeZone).tzCode.toLowerCase()) ===
            0,
        );
        const room = {
          currency: selected.currency,
          office: selected.office,
          timeZone: timeZone,
          closeDate:
            typeof selected.closeDate === 'string'
              ? createDateFromString(selected.closeDate)
              : selected.closeDate,
        };
        this.primary = selected.primary;
        this.paymentTypes = selected.paymentTypes;
        this.form.patchValue(room);
        this.googleMapForm.patchValue({
          address: selected.address.name,
          addressDescription: selected.address.description,
        });
        this.getAvailabilities(selected.availabilities);
      }
    });

    effect(() => {
      const room = this.room();
      const professionals = this.professionalsSignal();

      if (room) {
        this.selectedProfessionalsSignal.set([]);
        const selectedProfessionals: IUserAll[] = [];
        room.professionals?.forEach((group: IUserAll) => {
          selectedProfessionals.push(group);
        });

        this.selectedProfessionalsSignal.set(selectedProfessionals);
        this.professionalsWritableSignal.set(
          this.excludeSelectedProfessionals(
            professionals,
            selectedProfessionals,
          ),
        );
        this.currentProfessionalIds = selectedProfessionals
          .map(({ id }) => id)
          .filter(isString);
        return;
      }

      this.professionalsWritableSignal.set(
        this.excludeSelectedProfessionals(
          professionals,
          this.selectedProfessionalsSignal(),
        ),
      );
    });

    effect(() => {
      const subErrors = this.subErrorsSignal();
      if (subErrors) {
        const errorMap: Record<string, unknown> = {};
        subErrors.forEach((error: IError) => {
          const field = error.field as keyof RoomForm | undefined;

          if (field && field in this.form.controls) {
            errorMap[field] = error.message;
            this.form.controls[field].setErrors({ incorrect: true });
          }
        });
        this.errors.set(errorMap);
      }
    });

    effect(() => {
      const professionals = this.professionalsSignal();
      if (!professionals || this.room()) {
        return;
      }

      this.professionalsWritableSignal.set(
        this.excludeSelectedProfessionals(
          professionals,
          this.selectedProfessionalsSignal(),
        ),
      );
    });
  }

  get getConfig(): ICommon {
    return this.config();
  }

  get getForm(): RoomForm {
    return this.form.controls;
  }

  get getGoogleMapForm(): GoogleMapForm {
    return this.googleMapForm.controls;
  }

  submit(): void {
    if (!this.validate()) {
      return;
    }

    this.submitData.emit(
      Room.fromForm(
        this.getForm,
        this.primary,
        this.selectedProfessionalsSignal(),
        this.paymentTypes,
        this.availabilities,
        this.currentProfessionalIds,
        this.currentAvailabilities,
        this.room(),
        this.formattedAddress,
        this.geometry?.location,
      ),
    );
  }

  addProfessional(): void {
    this.navigationService.navigate(['users', 'add'], {
      state: { role: Role.professional },
    });
    return;
  }

  addCurrency(): void {
    this.navigationService.navigate(['currency', 'add']);
    return;
  }

  addOffice(): void {
    this.navigationService.navigate(['offices', 'add']);
    return;
  }

  setStep = (index: number): void => {
    this.step = index;
  };

  displayCurrencyFn = (currency?: ICurrencyAll): string =>
    currency ? currency.code : '';

  displayOfficeFn = (office?: IOfficeAll): string =>
    office ? office.name : '';

  displayTimeZoneFn = (timeZone?: TimeZone): string =>
    timeZone ? timeZone.label : '';

  keyDownHandler = (event: KeyboardEvent, form: AbstractControl): void => {
    if (event.code === 'Backspace') {
      form.setValue('');
    }
  };

  addAvailability = (availability: IAvailability, step: number): void => {
    this.setIcon(availability.day, RoomIconName.eventAvailable);
    const index = this.availabilities.findIndex(
      (e) => e.day === availability.day,
    );

    if (index !== -1) {
      this.availabilities.splice(index, 1);
    }
    this.availabilities = [...this.availabilities, availability];

    this.step = step;
  };

  ignore = (day: string, step: number): void => {
    this.setIcon(day, RoomIconName.eventBusy);
    const index = this.availabilities.findIndex((e) => e.day === day);
    if (index > -1) {
      this.availabilities.splice(index, 1);
    }
    this.step = step;
  };

  onChange = (options: MatListOption[]): void => {
    this.paymentTypes = options.map((o) => o.value);
  };

  isSelected = (it: IPaymentOption): boolean =>
    this.paymentTypes.includes(it.type);

  remove = (professional: IUserAll): void => {
    this.selectedProfessionalsSignal.update((current) =>
      current.filter((c) => c.id !== professional.id),
    );

    this.professionalsWritableSignal.update((current) =>
      this.addAvailableProfessional(current, professional),
    );

    this.getForm.professional.setValue(undefined);
  };

  selected = (event: MatAutocompleteSelectedEvent): void => {
    const professional = event.option.value as IUserAll;

    this.selectedProfessionalsSignal.update((current) =>
      current.some(({ id }) => id === professional.id)
        ? current
        : [...current, professional],
    );

    this.professionalsWritableSignal.update((current) =>
      current?.filter((c) => c.id !== professional.id),
    );

    const input = this.professionalInput();
    if (input) {
      input.nativeElement.value = '';
    }
    this.getForm.professional.setValue(undefined);
  };

  sortProfessionals = (data: any): IUser[] =>
    data.sort((a: any, b: any) => {
      const aName = a.displayName.toUpperCase();
      const bName = b.displayName.toUpperCase();
      return aName > bName ? 1 : bName > aName ? -1 : 0;
    });

  getAddress = (placeResult: PlaceResult): void => {
    this.geometry = placeResult.geometry;
    this.formattedAddress = placeResult.formatted_address;
  };

  private setIcon = (day: string, icon: RoomIconName): void => {
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
  };

  private getAvailabilities = (availabilities: IAvailability[]): void => {
    [
      'MONDAY',
      'TUESDAY',
      'WEDNESDAY',
      'THURSDAY',
      'FRIDAY',
      'SATURDAY',
      'SUNDAY',
    ].forEach((day) => this.setIcon(day, RoomIconName.eventBusy));

    availabilities.forEach((av: IAvailability) => {
      this.currentAvailabilities = [...this.currentAvailabilities, av];
      this.addAvailability(av, 0);

      const timeZone = this.getForm.timeZone.value?.tzCode;
      const availability = AvailabilityDate.fromAvailability(av, timeZone);

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
  };

  private validate = (): boolean => {
    if (this.form.invalid) {
      goTo('fields');
      return false;
    }
    if (this.selectedProfessionalsSignal().length === 0) {
      this.errors.update((prev) => ({ ...prev, professionals: true }));
      goTo('professionals');
      return false;
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
      this.errors.update((prev) => {
        const newErrors = { ...prev };
        newErrors[`day${step}`] = true;
        return newErrors;
      });
      this.setStep(step);
      goTo('availabilities');
      return false;
    }

    if (this.availabilities.length === 0) {
      this.errors.update((prev) => ({ ...prev, availability: true }));
      goTo('availabilities');
      this.setStep(0);
      return false;
    }

    return true;
  };

  private filter = (
    name: string,
    allProfessional?: IUserAll[],
  ): IUserAll[] | undefined =>
    allProfessional?.filter(
      (option) =>
        option.displayName?.toLowerCase().indexOf(name.toString()) === 0,
    );

  private filterCurrency = (
    name: string,
    currencies?: ICurrencyAll[],
  ): ICurrencyAll[] | undefined =>
    currencies?.filter(
      (option) => option.code?.toLowerCase().indexOf(name.toString()) === 0,
    );

  private filterOffice = (
    name: string,
    offices?: IOfficeAll[],
  ): IOfficeAll[] | undefined =>
    offices?.filter(
      (option) => option.name?.toLowerCase().indexOf(name.toString()) === 0,
    );

  private filterTimeZone = (
    name: string,
    timeZoneList?: any[],
  ): any[] | undefined =>
    timeZoneList?.filter(
      (option) => option.label?.toLowerCase().indexOf(name.toString()) >= 0,
    );

  private excludeSelectedProfessionals(
    professionals: IUserAll[] | undefined,
    selectedProfessionals: IUserAll[],
  ): IUserAll[] | undefined {
    const selectedIds = new Set(
      selectedProfessionals.map(({ id }) => id).filter(isString),
    );
    return professionals?.filter(({ id }) => !id || !selectedIds.has(id));
  }

  private addAvailableProfessional(
    current: IUserAll[] | undefined,
    professional: IUserAll,
  ): IUserAll[] {
    const professionals = current ?? [];
    return professionals.some(({ id }) => id === professional.id)
      ? professionals
      : [...professionals, professional];
  }
}
