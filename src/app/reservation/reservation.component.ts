import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  input,
  output,
  signal,
  untracked,
  viewChildren,
} from '@angular/core';
import {
  FormArray,
  FormControl,
  FormGroup,
  NonNullableFormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { map, startWith } from 'rxjs/operators';
import { IUser, IUserAll } from '../user/user';
import { combineLatestWith, Subject } from 'rxjs';
import { noDuplicateDatesValidator, requireMatch } from '../util/validators';
import {
  IGroupService,
  IPrice,
  ITreatment,
  ITreatmentGroup,
  Price,
} from '../treatment/treatment';
import { IRoom, IRoomAll, IService } from '../room/room';
import {
  Day,
  ICustomerLastReservation,
  IDay,
  IReservation,
  IReservationAll,
  IReservationPayment,
  IUpcomingAll,
  MAX_RESERVATION_MONTH,
  Reservation,
} from './reservation';
import {
  CalendarEvent,
  CalendarEventTimesChangedEvent,
  CalendarWeekViewComponent,
} from 'angular-calendar';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { MatDialog } from '@angular/material/dialog';
import { DialogComponent } from '../shared/dialog/generic/dialog.component';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import {
  createDate,
  createFullDate,
  createNewDate,
  dateToUTC,
  DEFAULT_LOCALE,
  Duration,
  filterDateRoom,
  formatTime,
  getCurrentTimeZone,
  getNowTimeZone,
  getTime,
  getTimeNumber,
  IDuration,
  isBetween,
  isSameTimeZone,
  localeTimeZoneDate,
  newDate,
  newDateTimestamp,
  reservationDuration,
  searchDates,
  totalDuration,
} from '../util/dates';
import { DataEvent, IDataEvent } from '../util/event';
import { Role } from '../interfaces/token';
import { IUnavailableAll } from '../unavailable/unavailable';
import { DiscountType, IDiscount, IUserDiscount } from '../discount/discount';
import {
  createRoomOffice,
  createTreatmentGroupService,
  currencySymbol,
  executeDialogNoWidth,
  getList,
  getPrice,
  newAdditional,
  newDiscount,
  newPrice,
  openDialog,
  removeDiscount,
  roomDetail,
} from '../util/helper';
import { addDays, addMonths, isEqual } from 'date-fns';
import { IAdditionalAll } from '../additional/additional';
import {
  MatDivider,
  MatListOption,
  MatSelectionList,
} from '@angular/material/list';
import { IOffice, IOfficeAll } from '../office/office';
import { SelectProfessionalDialogComponent } from './select-professional-dialog.component';
import { ToastService } from '../services/toast.service';
import { AuthUserService } from '../services/auth-user.service';
import {
  enableStep,
  getBackIndex,
  getIndex,
  getStepCall,
  getStepName,
  IStep,
  Step,
} from '../util/step';
import { RoomNamePipe } from '../pipes/room-name.pipe';
import { SortByPipe } from '../pipes/sort-by.pipe';
import { CurrencySymbolPipe } from '../pipes/currency-symbol.pipe';
import { DurationTimePipe } from '../pipes/durationTime.pipe';
import { BackButtonDirective } from '../directives/back-button.directive';
import { GoogleMapComponent } from '../shared/google-map/google-map.component';
import { PaymentOptionSelectComponent } from '../shared/payment-option-select/payment-option-select.component';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { IError } from '../interfaces/common';
import {
  ConfigurationForm,
  createReservationErrors,
  CustomerForm,
  DateTimeForm,
  EventForm,
  EventGroupForm,
  OfficeForm,
  ReservationErrors,
  ReservationForms,
  TreatmentForm,
} from './reservation-form.types';
import { ReservationFormErrorService } from './reservation-form-error.service';
import { ReservationCalendarService } from './reservation-calendar.service';
import { IPaymentOption } from '../interfaces/payment';
import {
  MatError,
  MatFormField,
  MatInput,
  MatLabel,
  MatPrefix,
} from '@angular/material/input';
import { MatSuffix } from '@angular/material/form-field';
import {
  MatDatepicker,
  MatDatepickerInput,
  MatDatepickerToggle,
} from '@angular/material/datepicker';
import { MatSelect } from '@angular/material/select';
import { MatOption } from '@angular/material/core';
import { MatIcon } from '@angular/material/icon';
import {
  MatButton,
  MatFabButton,
  MatIconButton,
} from '@angular/material/button';
import {
  DatePipe,
  DecimalPipe,
  KeyValuePipe,
  NgClass,
  NgTemplateOutlet,
} from '@angular/common';
import {
  MatAutocomplete,
  MatAutocompleteTrigger,
} from '@angular/material/autocomplete';
import { MatCard, MatCardContent } from '@angular/material/card';
import { TimepickerDirective } from '../shared/clock-timepicker/timepicker.directive';
import { TimepickerComponent } from '../shared/clock-timepicker/timepicker.component';
import { MatCheckbox } from '@angular/material/checkbox';
import { SkeletonComponent } from '../shared/skeleton/skeleton.component';
import { CardListSkeletonComponent } from '../shared/skeleton/card-list-skeleton.component';
import { NavigationService } from '../services/navigation.service';
import { UserStore } from '../store/user.store';
import { TreatmentStore } from '../store/treatment.store';
import { RoomStore } from '../store/room.store';
import { AdditionalStore } from '../store/additional.store';
import { PaymentStore } from '../store/payment.store';
import { ReservationStore } from '../store/reservation.store';
import PlaceResult = google.maps.places.PlaceResult;

const RESERVATION_ERROR_FIELDS = [
  'customer',
  'room',
  'professional',
  'office',
  'treatment',
  'discount',
  'group',
  'customerChange',
  'reference',
  'note',
  'type',
  'amount',
  'transfer',
] as const;

@Component({
  selector: 'app-reservation',
  templateUrl: './reservation.component.html',
  styleUrls: ['./reservation.component.scss'],
  imports: [
    MatFormField,
    MatLabel,
    MatInput,
    MatDatepickerInput,
    MatDatepickerToggle,
    MatDatepicker,
    MatSelect,
    MatOption,
    MatIcon,
    MatIconButton,
    MatButton,
    ReactiveFormsModule,
    TranslatePipe,
    KeyValuePipe,
    DecimalPipe,
    NgClass,
    NgTemplateOutlet,
    DatePipe,
    MatAutocomplete,
    MatError,
    MatAutocompleteTrigger,
    MatPrefix,
    MatFabButton,
    BackButtonDirective,
    CurrencySymbolPipe,
    MatCard,
    MatCardContent,
    RoomNamePipe,
    SortByPipe,
    CurrencySymbolPipe,
    DurationTimePipe,
    BackButtonDirective,
    GoogleMapComponent,
    PaymentOptionSelectComponent,
    CalendarWeekViewComponent,
    TimepickerDirective,
    TimepickerComponent,
    MatSelectionList,
    MatListOption,
    MatDivider,
    MatCheckbox,
    MatSuffix,
    SkeletonComponent,
    CardListSkeletonComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReservationComponent {
  reservation = input<IUpcomingAll>();
  isEditing = input<boolean>(false);
  isAdmin = input<boolean>(false);
  customers = input<IUserAll[]>();

  submitData = output<{ reservation: IReservation; role: Role }>();

  private readonly dialog = inject(MatDialog);
  private readonly toastService: ToastService = inject(ToastService);
  private readonly translateService: TranslateService =
    inject(TranslateService);
  private readonly navigationService: NavigationService =
    inject(NavigationService);
  private readonly reservationStore = inject(ReservationStore);
  private readonly userStore = inject(UserStore);
  private readonly roomStore = inject(RoomStore);
  private readonly treatmentStore = inject(TreatmentStore);
  private readonly additionalStore = inject(AdditionalStore);
  private readonly paymentStore = inject(PaymentStore);
  private readonly formBuilder: NonNullableFormBuilder = inject(
    NonNullableFormBuilder,
  );
  private readonly breakpointObserver: BreakpointObserver =
    inject(BreakpointObserver);
  private readonly authUserService: AuthUserService = inject(AuthUserService);
  private readonly formErrorService = inject(ReservationFormErrorService);
  private readonly reservationCalendarService = inject(
    ReservationCalendarService,
  );

  private breakpointObserver$ = this.breakpointObserver.observe([
    Breakpoints.XSmall,
    Breakpoints.Small,
  ]);

  private readonly params = computed(() => {
    const navigationState = history.state;
    if (navigationState) {
      return {
        customerId: navigationState['customerId'],
        isDashboard: navigationState['isDashboard'],
        treatmentId: navigationState['treatmentId'],
        groupId: navigationState['groupId'],
        roomId: navigationState['roomId'],
        professionalId: navigationState['professionalId'],
        skip: navigationState['skip'],
        date: navigationState['date'],
        additionalIds: navigationState['additionalIds'],
        discountId: navigationState['discountId'],
      };
    }
    return undefined;
  });
  private readonly treatmentDiscountSignal =
    this.treatmentStore.treatmentDiscount;
  private readonly customerInfoSignal = this.userStore.customerInfo;
  private readonly calendarSignal = this.reservationStore.calendar;
  private readonly subErrorsSignal = this.reservationStore.subErrors;
  private readonly authUserSignal = this.authUserService.authUser;
  private readonly paymentOptionsSignal = this.paymentStore.options;
  private readonly roomsSignal = computed(() => {
    const data = this.roomStore.data();
    return data?.kind === 'list' ? data.value : undefined;
  });
  readonly additionalListSignal = computed(() => {
    const data = this.additionalStore.data();
    return data?.kind === 'list' ? data.value : undefined;
  });
  private readonly breakpointsSignal = toSignal(this.breakpointObserver$, {
    initialValue: {
      matches: false,
      breakpoints: {
        [Breakpoints.XSmall]: false,
        [Breakpoints.Small]: false,
      },
    },
  });

  additionalSelected = signal<IAdditionalAll[]>([]);
  isLoading = this.reservationStore.isLoading;

  dataEvents: Map<string, IDataEvent> = new Map();
  private additionalLists = viewChildren<MatSelectionList>('additional');

  minDate: string = '';
  maxDate: string = '';

  customerForm: FormGroup<CustomerForm> = this.formBuilder.group<CustomerForm>({
    customer: this.formBuilder.control(undefined, {
      validators: [Validators.required, requireMatch],
    }),
  });

  officeForm: FormGroup<OfficeForm> = this.formBuilder.group<OfficeForm>({
    office: this.formBuilder.control(undefined, {
      validators: [Validators.required, requireMatch],
    }),
    room: this.formBuilder.control(undefined, {
      validators: [Validators.required, requireMatch],
    }),
    professional: this.formBuilder.control(undefined, {
      validators: [requireMatch],
    }),
  });

  treatmentForm: FormGroup<TreatmentForm> =
    this.formBuilder.group<TreatmentForm>({
      treatment: this.formBuilder.control(undefined, {
        validators: [Validators.required, requireMatch],
      }),
      discount: this.formBuilder.control(undefined),
      group: this.formBuilder.control(undefined, {
        validators: [Validators.required, requireMatch],
      }),
      dateTimeList: this.formBuilder.array(
        [
          this.formBuilder.group<DateTimeForm>({
            date: this.formBuilder.control(undefined, {
              validators: [Validators.required],
            }),
            start: this.formBuilder.control(this.minDate),
          }),
        ],
        { validators: noDuplicateDatesValidator() },
      ),
    });

  configurationForm: FormGroup<ConfigurationForm> =
    this.formBuilder.group<ConfigurationForm>({
      customerChange: this.formBuilder.control(false),
      reference: this.formBuilder.control(undefined),
      note: this.formBuilder.control(undefined),
      option: this.formBuilder.control(undefined),
      amount: this.formBuilder.control(undefined, [Validators.min(1)]),
      transfer: this.formBuilder.control(undefined),
    });

  eventGroup: FormGroup<EventGroupForm> =
    this.formBuilder.group<EventGroupForm>({
      events: this.formBuilder.array([
        this.formBuilder.group<EventForm>({
          event: this.formBuilder.control(undefined, {
            validators: [Validators.required],
          }),
        }),
      ]),
    });

  form: FormGroup<ReservationForms> = this.formBuilder.group<ReservationForms>({
    customerForm: this.customerForm,
    officeForm: this.officeForm,
    treatmentForm: this.treatmentForm,
    eventGroup: this.eventGroup,
    configurationForm: this.configurationForm,
  });

  errors = signal<ReservationErrors>(createReservationErrors());

  customersSignal = this.userStore.customers;
  filteredCustomerSignal = toSignal(
    this.getCustomerForm.customer.valueChanges.pipe(
      startWith(''),
      map((value) => (typeof value === 'string' ? value : value?.displayName)),
      combineLatestWith(toObservable(this.customersSignal)),
      map(([name, customers]) => {
        if (name) {
          return this.filterCustomer(name, customers);
        } else {
          return customers ? customers.slice() : customers;
        }
      }),
    ),
  );
  customerInfo = signal<ICustomerLastReservation | undefined>(
    this.customerInfoSignal(),
  );

  groups = signal<IGroupService[] | undefined>(undefined);
  filteredGroupSignal = toSignal(
    this.getTreatmentForm.group.valueChanges.pipe(
      startWith(''),
      map((value) => (typeof value === 'string' ? value : value?.name)),
      combineLatestWith(toObservable(this.groups)),
      map(([name, groups]) => {
        if (name) {
          return this.filterGroup(name, groups);
        } else {
          return groups ? groups.slice() : groups;
        }
      }),
    ),
  );

  treatmentList = signal<IService[] | undefined>(undefined);
  filteredTreatmentSignal = toSignal(
    this.getTreatmentForm.treatment.valueChanges.pipe(
      startWith(''),
      map((value) => (typeof value === 'string' ? value : value?.name)),
      combineLatestWith(toObservable(this.treatmentList)),
      map(([name, treatmentList]) => {
        if (name) {
          return this.filterTreatment(name, treatmentList);
        } else {
          return treatmentList ? treatmentList.slice() : treatmentList;
        }
      }),
    ),
  );

  discounts = computed(() =>
    this.treatmentDiscountSignal()?.discounts.map((ud: IUserDiscount) => {
      let title = ud.discountCustomer.name;
      switch (ud.discountCustomer.type) {
        case DiscountType.money:
          title = `${currencySymbol(ud.discountCustomer.discount?.currency)} ${ud.discountCustomer.amount} ${title}`;
          break;
        case DiscountType.percentage:
          title = `${ud.discountCustomer.amount} % ${title}`;
          break;
      }
      return Object.assign({}, ud, { title });
    }),
  );
  showDiscount = false;
  price = signal<IPrice>(new Price());

  roomList = signal<IRoomAll[] | undefined>(undefined);
  filteredRoomSignal = toSignal(
    this.getOfficeForm.room.valueChanges.pipe(
      startWith(''),
      map((value) =>
        typeof value === 'string' ? value : value?.address?.name,
      ),
      combineLatestWith(toObservable(this.roomList)),
      map(([name, rooms]) => {
        if (name) {
          return this.filterRoom(name, rooms);
        } else {
          return rooms ? rooms.slice() : rooms;
        }
      }),
    ),
  );

  offices = computed(() =>
    Array.from(createRoomOffice(this.roomsSignal())?.values() || []),
  );
  filteredOfficeSignal = toSignal(
    this.getOfficeForm.office.valueChanges.pipe(
      startWith(''),
      map((value) => (typeof value === 'string' ? value : value?.name)),
      combineLatestWith(toObservable(this.offices)),
      map(([name, offices]) => {
        if (name) {
          return this.filterOffice(name, offices);
        } else {
          return offices ? offices.slice() : offices;
        }
      }),
    ),
  );

  professionalList = signal<IUserAll[] | undefined>(undefined);
  filteredProfessionalSignal = toSignal(
    this.getOfficeForm.professional.valueChanges.pipe(
      startWith(''),
      map((value) => (typeof value === 'string' ? value : value?.displayName)),
      combineLatestWith(toObservable(this.professionalList)),
      map(([name, professionals]) => {
        if (name) {
          return this.filterProfessional(name, professionals);
        } else {
          return professionals ? professionals.slice() : professionals;
        }
      }),
    ),
  );
  address?: string;

  customerAdditionalIds?: string[];
  private customerAdditionalSelectionSeeded = false;

  private selectCustomerSignal = toSignal(
    this.getCustomerForm.customer.valueChanges,
  );
  private selectOfficeSignal = toSignal(this.getOfficeForm.office.valueChanges);
  private selectRoomSignal = toSignal(this.getOfficeForm.room.valueChanges);
  private selectProfessionalSignal = toSignal(
    this.getOfficeForm.professional.valueChanges,
  );
  private selectGroupSignal = toSignal(
    this.getTreatmentForm.group.valueChanges,
  );
  private selectTreatmentSignal = toSignal(
    this.getTreatmentForm.treatment.valueChanges,
  );
  private selectDiscountSignal = toSignal(
    this.getTreatmentForm.discount.valueChanges,
  );
  private selectCustomerChangeSignal = toSignal(
    this.getConfigurationForm.customerChange.valueChanges,
  );
  private selectAmountSignal = toSignal(
    this.getConfigurationForm.amount.valueChanges,
  );
  private selectDateTimeListSignal = toSignal(this.dateTimeList.valueChanges);

  private readonly paymentOptions = computed(() =>
    this.paymentOptionsSignal().filter(
      (option) => option.enabled && option.enabledProfessional,
    ),
  );
  options = signal<IPaymentOption[] | undefined>(undefined);

  weekendDays: number[] = [0, 6];
  day: IDay = new Day();
  refresh: Subject<any> = new Subject();

  readonly language: string = this.navigationService.language;
  isPreview = false;
  totalDurationFormatted?: string;

  currentStepIndex = signal(0);
  maxCalendarDate: Date = addMonths(getNowTimeZone(), MAX_RESERVATION_MONTH);

  screenConfig = computed(() => {
    const isSmall = !!this.breakpointsSignal()?.matches;

    return {
      isSmall,
      daysInWeek: isSmall ? 3 : 7,
      lessDays: isSmall ? 1 : 3,
    };
  });

  smallScreen = computed(() => this.screenConfig().isSmall);

  daysInWeek = computed(() => this.screenConfig().daysInWeek);
  private lessDays = computed(() => this.screenConfig().lessDays);
  private isDarkMode = computed(
    () => this.authUserSignal()?.isDarkMode ?? false,
  );
  private skip = signal(false);
  private roomId = signal<string | undefined>(undefined);
  private professionalId = signal(this.selectProfessionalSignal()?.id);
  private treatmentId = signal<string | undefined>(undefined);
  private reservationId?: string;
  private customerId?: string;
  private additionalIds?: string[];
  private steps: IStep[];
  private dismiss = false;
  private treatmentDiscount?: IDiscount;
  private totalDuration: IDuration = new Duration();
  private alreadyCreated = false;
  private groupId?: string;
  private isDashboard = false;
  private hydratingEdit = false;

  constructor() {
    this.reservationStore.clean();
    this.paymentStore.getOptions();
    const preview = new Step(6, 'preview', () => this.create());
    const book = new Step(
      5,
      'book_online',
      (goNext: boolean) => this.callStepSeven(goNext),
      preview,
    );
    const settings = new Step(
      4,
      'settings',
      (goNext: boolean) => this.callStepSix(goNext),
      book,
    );
    const additional = new Step(
      3,
      'post_add',
      (goNext: boolean) => this.callStepFive(goNext),
      settings,
      true,
    );
    const treatment = new Step(
      2,
      'spa',
      (goNext: boolean) => this.callStepFour(goNext),
      additional,
    );
    const room = new Step(
      1,
      'room',
      (goNext: boolean) => this.callStepThree(goNext),
      treatment,
    );
    const customer = new Step(
      0,
      'person_search',
      (goNext: boolean) => this.callStepTwo(goNext),
      room,
    );
    this.steps = [
      customer,
      room,
      treatment,
      additional,
      settings,
      book,
      preview,
    ];

    effect(() => {
      const params = this.params();
      this.skip.set(params?.skip ?? false);
      this.roomId.set(params?.roomId);
      this.customerId = params?.customerId;
      this.isDashboard = params?.isDashboard ?? false;
      this.treatmentId.set(params?.treatmentId);
      this.groupId = params?.groupId;
      this.professionalId.set(params?.professionalId);
      this.additionalIds = params?.additionalIds;
      if (params?.date) {
        let start = this.minDate;
        if (
          params.date.getMinutes() % 15 === 0 &&
          params.date.getSeconds() === 0
        ) {
          start = getTime(params.date, this.language);
        }
        this.removeDate(0);
        this.addDate(params.date, start);
      }
      if (params?.discountId) {
        this.showDiscount = true;
        this.getTreatmentForm.discount.setValue(params.discountId);
      }
    });

    effect(() => {
      const reservation = this.reservation();
      if (reservation) {
        this.reservationId = reservation.id;
        this.currentStepIndex.set(this.isAdmin() ? 1 : 2);
        this.steps = this.steps.map((value) => {
          switch (value.order) {
            case 0:
              value.enable = false;
              break;

            case 1:
              value.enable = this.isAdmin();
              break;
          }

          return value;
        });
      }
    });

    effect(() => {
      const offices = this.offices();
      const roomId = this.roomId();
      const professionalId = this.professionalId();
      let selectedOffice;
      let selectedRoom;
      let selectedProfessional;
      if (professionalId) {
        for (const office of offices) {
          for (const room of office.rooms ?? []) {
            const professional = room.professionals?.find(
              (p) => p.id === professionalId,
            );

            if (professional) {
              selectedOffice = office;
              selectedRoom = room;
              selectedProfessional = professional;
              this.roomId.set(room.id);
              break;
            }
          }
          if (selectedOffice) {
            break;
          }
        }
      } else if (roomId) {
        for (const office of offices) {
          const room = office.rooms?.find((r) => r.id === roomId);
          if (room) {
            selectedOffice = office;
            selectedRoom = room;
            break;
          }
        }
      } else if (offices.length === 1) {
        selectedOffice = offices[0];
      }

      if (selectedOffice) {
        this.getOfficeForm.office.setValue(selectedOffice);
      }
      if (selectedRoom) {
        this.getOfficeForm.room.setValue(selectedRoom);
      }
      if (selectedProfessional) {
        this.getOfficeForm.professional.setValue(selectedProfessional);
      }
    });

    effect(() => {
      const skip = this.skip();
      const roomId = this.roomId();
      const customerId = this.customerId;
      if (skip) {
        this.roomStore.loadAll(customerId);
        this.getAdditionalList(roomId, this.groupId);

        if (
          this.customerForm.valid &&
          this.officeForm.valid &&
          this.treatmentForm.valid &&
          this.configurationForm.valid
        ) {
          for (let i = 0; i < 5; i++) {
            setTimeout(() => getStepCall(this.steps, i, true), 300);
          }
          this.skip.set(false);
        }
      }
      this.getTreatmentList(roomId, customerId);
    });

    effect(() => {
      const customer = this.selectCustomerSignal();
      this.customerId = customer?.id;
      if (!customer) {
        return;
      }
      if (this.hydratingEdit) {
        return;
      }
      this.customerInfo.set(undefined);
      this.cleanTreatment();
      if (!this.isEditing()) {
        this.userStore.getCustomerInformation(customer.id);
      }
    });

    effect(() => {
      const office = this.selectOfficeSignal();
      if (!office) {
        return;
      }
      this.roomList.set(office.rooms);
      const room = getList(office.rooms, this.roomId());
      this.roomId.set(room?.id);
      this.getOfficeForm.room.setValue(room);
    });

    effect(() => {
      const room = this.selectRoomSignal();
      if (room) {
        if (!this.dismiss && !isSameTimeZone(room.timeZone)) {
          const now = getNowTimeZone();
          const localDate = localeTimeZoneDate(this.language, now);
          const timeZoneDate = localeTimeZoneDate(
            this.language,
            now,
            room.timeZone,
          );
          const warning = this.translateService.instant(
            'COMMON.TIME_ZONE.WARNING',
          );
          const localDateLabel = this.translateService.instant(
            'COMMON.TIME_ZONE.DATE.LOCAL',
            { date: localDate },
          );
          const roomDateLabel = this.translateService.instant(
            'COMMON.TIME_ZONE.DATE.ROOM',
            { date: timeZoneDate },
          );
          const message = `${warning} - ${localDateLabel} / ${roomDateLabel}`;
          const toastRef = this.toastService.show(message, 'warning', 0, {
            actionType: 'none',
          });
          toastRef.onAction().subscribe(() => {
            this.dismiss = true;
          });
        }
        this.professionalList.set(room.professionals);
        const professional = getList(room.professionals, this.professionalId());
        this.getOfficeForm.professional.setValue(professional);
        this.professionalId.set(professional?.id);
        const schedule = this.reservationCalendarService.getRoomSchedule(room);
        if (schedule.minTime) {
          this.minDate = schedule.minTime;
          this.dateTimeList.controls.forEach((control: any) => {
            const start = control.get('start');
            if (
              start &&
              (!start.value || start.value === '' || start.value === '00:00')
            ) {
              control.get('start')?.setValue(this.minDate);
            }
          });
        }
        if (schedule.maxTime) {
          this.maxDate = schedule.maxTime;
        }
        this.getTreatmentForm.group.setValue(undefined);
        // this.cleanTreatment();
        const options = this.paymentOptions();
        this.options.set(
          options.filter((option) => room.paymentTypes.includes(option.type)),
        );
      }
    });

    effect(() => {
      const groups = this.groups();
      const treatmentId = this.treatmentId();
      if (!groups || !treatmentId) {
        return;
      }
      this.getTreatmentForm.group.setValue(
        groups.find((group) =>
          group.treatments.find((treatment) => treatment.id === treatmentId),
        ),
      );
    });

    effect(() => {
      const group = this.selectGroupSignal();
      const treatmentId = this.treatmentId();
      this.groupId = group?.id;
      if (!group) {
        return;
      }
      this.treatmentList.set(group.treatments);
      const treatment = getList(group.treatments, treatmentId);
      this.getTreatmentForm.treatment.setValue(treatment);
    });

    effect(() => {
      const treatment = this.selectTreatmentSignal();
      if (treatment) {
        const currentPrice = untracked(() => this.price());
        this.setPrice(
          newPrice(currentPrice, treatment.price, this.treatmentDiscount),
        );
        this.cleanEvent();
      }
    });

    effect(() => {
      const treatmentDiscount = this.treatmentDiscountSignal();
      if (treatmentDiscount?.treatments) {
        const room = this.getOfficeForm.room.value;
        if (room) {
          this.groups.set(
            Array.from(
              createTreatmentGroupService(
                new Map<string, IGroupService>(),
                treatmentDiscount.treatments,
                room.currency.code,
              ).values(),
            ),
          );
        }
      }
    });

    effect(() => {
      const discountId = this.selectDiscountSignal();
      const discounts = this.discounts();
      if (discountId && discounts) {
        const userDiscount = discounts.find((d) => d.id === discountId);
        if (userDiscount) {
          this.treatmentDiscount = userDiscount.discountCustomer;
          const currentPrice = untracked(() => this.price());
          this.setPrice(newDiscount(currentPrice, this.treatmentDiscount));
          this.cleanEvent();
        }
      } else {
        this.treatmentDiscount = undefined;
        const currentPrice = untracked(() => this.price());
        this.setPrice(removeDiscount(currentPrice));
        this.cleanEvent();
      }
    });

    effect(() => {
      const customerChange = this.selectCustomerChangeSignal();
      if (customerChange) {
        this.getConfigurationForm.reference.setValidators([
          Validators.required,
        ]);
      } else {
        this.getConfigurationForm.reference.clearValidators();
      }
      this.getConfigurationForm.reference.updateValueAndValidity();
    });

    effect(() => {
      const amount = this.selectAmountSignal();
      if (amount) {
        this.getConfigurationForm.option.setValidators([Validators.required]);
      } else {
        this.getConfigurationForm.option.clearValidators();
      }
      this.getConfigurationForm.option.updateValueAndValidity();
    });

    effect(() => {
      this.selectDateTimeListSignal();
      this.dateTimeList.updateValueAndValidity({
        onlySelf: true,
        emitEvent: false,
      });
    });

    effect(() => {
      const additionalList = this.additionalListSignal();
      const reservation = this.reservation();
      if (additionalList?.length) {
        const additionalIndex = enableStep(this.steps, 'post_add');
        if (
          this.customerAdditionalIds?.length &&
          !this.additionalSelected().length &&
          this.currentStepIndex() === additionalIndex &&
          !this.customerAdditionalSelectionSeeded
        ) {
          const selected = additionalList
            .filter((ad) => this.customerAdditionalIds?.includes(ad.id))
            .map((ad) => Object.assign({}, ad, { id: ad.id }));
          this.additionalSelected.set(selected);
          this.customerAdditionalSelectionSeeded = true;
          const currentPrice = untracked(() => this.price());
          this.setPrice(
            newAdditional(
              currentPrice,
              selected,
              reservation?.treatment?.discountCustomer,
            ),
          );
        }
        const additionalSelected = this.additionalSelected();
        if (additionalSelected?.length) {
          const selectIds = additionalSelected?.map((value) => value.id);
          const newList = additionalList.filter((al) =>
            selectIds.includes(al.id),
          );
          if (this.shouldSyncAdditionalSelection(additionalSelected, newList)) {
            this.additionalSelected.set(newList);
            const currentPrice = untracked(() => this.price());
            this.setPrice(
              newAdditional(
                currentPrice,
                newList,
                reservation?.treatment?.discountCustomer,
              ),
            );
          }
        }
        if (this.additionalIds?.length) {
          const ids = this.additionalIds;
          const newList = additionalList.filter((al) => ids.includes(al.id));
          if (newList.length !== additionalSelected.length) {
            this.additionalSelected.set(newList);
            this.additionalIds = [];
            const currentPrice = untracked(() => this.price());
            this.setPrice(
              newAdditional(
                currentPrice,
                newList,
                reservation?.treatment?.discountCustomer,
              ),
            );
          }
        }
      }
    });

    effect(() => {
      const subErrors = this.subErrorsSignal();
      if (subErrors) {
        this.isPreview = false;
        this.applySubErrors(subErrors);
      }
    });

    effect(() => {
      this.additionalSelected();
      this.additionalLists();
      this.syncRenderedAdditionalSelections();
    });

    effect(() => {
      const customerInfo = this.customerInfoSignal();
      this.customerInfo.set(customerInfo);
      if (customerInfo) {
        this.customerAdditionalIds = customerInfo.additionalIds;
        this.customerAdditionalSelectionSeeded = false;
        this.treatmentId.update((prev) => prev || customerInfo.treatment.key);
        this.roomId.update((prev) => prev || customerInfo.roomId);
        this.professionalId.update(
          (prev) => prev || customerInfo.professionalId,
        );
      } else {
        this.customerAdditionalIds = undefined;
        this.customerAdditionalSelectionSeeded = false;
      }
    });

    effect(() => {
      const reservation = this.reservation();
      const stepper = untracked(() => this.currentStepIndex());
      if (reservation && stepper) {
        this.setData(reservation);
      }
    });

    effect(() => {
      const calendar = this.calendarSignal();
      const reservation = this.reservation();
      if (calendar) {
        calendar.forEach((data) => {
          const dataEvent = this.dataEvents.get(data.date);
          if (
            dataEvent &&
            dataEvent.calendarEvents.length === dataEvent.unavailableEventLength
          ) {
            this.addNotAvailable(dataEvent);
            dataEvent.addEvents(this.addReservations(data.reservations));
            this.addUnavailableList(dataEvent, data.unavailableList);
            dataEvent.recurringEvent?.execute();
            const bookOrder = getIndex(this.steps, 'book_online');
            const dateTime = this.dateTimeList.at(dataEvent.index);
            const start = dateTime.get('start')?.value;
            const dateValue = dateTime?.get('date')?.value;
            if (
              reservation &&
              dateValue &&
              this.currentStepIndex() === bookOrder
            ) {
              let date: Date;
              if (start) {
                const time = getTimeNumber(start);
                date = createNewDate(dateValue, time?.hour, time?.minute);
              } else {
                date = createNewDate(
                  dateValue,
                  dateValue.getHours(),
                  dateValue.getMinutes(),
                );
              }
              if (isEqual(newDateTimestamp(reservation.timestamp), date)) {
                const duration = reservationDuration(reservation);
                const end = createNewDate(
                  date,
                  date.getHours() + duration.hour,
                  date.getMinutes() + duration.minute,
                );
                const event = this.createNewEvent(
                  date,
                  end,
                  'EDITING',
                  reservation.room.timeZone,
                  reservation.id,
                );
                if (event) {
                  this.events
                    .at(dataEvent.index)
                    ?.get('event')
                    ?.setValue(event);
                  dataEvent.addEvent(event);
                  this.refresh.next(event);
                }
              } else {
                this.segmentClick(date, 'EDITING', data.date, reservation.id);
              }
            } else if (start && this.currentStepIndex() === bookOrder) {
              if (dateValue) {
                this.segmentClick(dateValue, 'CREATED', data.date);
              }
            }
          }
        });
      }
    });
  }

  private get getForm(): ReservationForms {
    return this.form.controls;
  }

  get getCustomerForm(): CustomerForm {
    return this.getForm.customerForm.controls;
  }

  get getOfficeForm(): OfficeForm {
    return this.getForm.officeForm.controls;
  }

  get getTreatmentForm(): TreatmentForm {
    return this.getForm.treatmentForm.controls;
  }

  get getEventGroupForm(): EventGroupForm {
    return this.getForm.eventGroup.controls;
  }

  get getConfigurationForm(): ConfigurationForm {
    return this.getForm.configurationForm.controls;
  }

  get events(): FormArray<FormGroup<EventForm>> {
    return this.getEventGroupForm.events;
  }

  get dateTimeList(): FormArray<FormGroup<DateTimeForm>> {
    return this.getTreatmentForm.dateTimeList;
  }

  get treatmentDetail(): string {
    const customerInfo = this.customerInfo();
    if (customerInfo) {
      return customerInfo.treatment.name;
    }
    return '';
  }

  get roomDetail(): string {
    const room = this.getOfficeForm.room.value;
    return room ? roomDetail(room) : '';
  }

  get addCustomer(): void {
    this.navigationService.navigate(['users', 'add'], {
      state: { role: Role.customer },
    });
    return;
  }

  get showTimeZone(): boolean {
    return !isSameTimeZone(this.getOfficeForm.room.value?.timeZone);
  }

  get summaryCustomer() {
    return this.getCustomerForm.customer.value || this.reservation()?.customer;
  }

  get summaryRoom() {
    return this.getOfficeForm.room.value || this.reservation()?.room;
  }

  get summaryProfessional() {
    return (
      this.getOfficeForm.professional.value || this.reservation()?.professional
    );
  }

  get summaryTreatment() {
    return (
      this.getTreatmentForm.treatment.value || this.reservation()?.treatment
    );
  }

  get summaryAdditionals(): IAdditionalAll[] {
    return this.additionalSelected().length
      ? this.additionalSelected()
      : this.reservation()?.additional || [];
  }

  get summaryDateTimes(): Array<{ date: Date; start?: string }> {
    const current = this.selectedDateTimes;
    if (current.length) {
      return current;
    }

    const reservation = this.reservation();
    if (!reservation) {
      return [];
    }

    const date = newDateTimestamp(
      reservation.timestamp,
      reservation.room.timeZone,
    );
    return [{ date, start: getTime(date, this.language) }];
  }

  private get summaryPriceSource(): IPrice {
    const reservation = this.reservation();
    return reservation
      ? getPrice(reservation, reservation.payments)
      : new Price();
  }

  get isAddButtonDisabled(): boolean {
    if (this.dateTimeList.invalid) {
      return true;
    }

    return this.dateTimeList.controls.some(
      (control) => control.invalid || !control.get('date')?.value,
    );
  }

  get selectedDateTimes(): Array<{ date: Date; start?: string }> {
    return this.dateTimeList.controls
      .map((control) => {
        const date = control.controls.date.value;
        const start = control.controls.start.value;

        return date && start ? { date, start } : undefined;
      })
      .filter((value): value is { date: Date; start: string } => !!value);
  }

  get hasDiscountApplied(): boolean {
    return (
      !!this.getTreatmentForm.discount.value ||
      this.price().total !== this.price().totalWithoutDiscount ||
      this.price().discount > 0
    );
  }

  get selectedTreatmentPrice(): number {
    return Number(
      this.summaryTreatment?.price ??
        this.price().amount ??
        this.summaryPriceSource.amount ??
        0,
    );
  }

  get selectedAdditionalTotal(): number {
    return this.summaryAdditionals.reduce(
      (total, additional) => total + Number(additional.price || 0),
      0,
    );
  }

  get effectiveTotalWithoutDiscount(): number {
    const fallbackTotal =
      this.selectedTreatmentPrice + this.selectedAdditionalTotal;

    return this.price().totalWithoutDiscount === 0 && fallbackTotal > 0
      ? fallbackTotal
      : this.price().totalWithoutDiscount ||
          this.summaryPriceSource.totalWithoutDiscount;
  }

  get effectiveDiscountAmount(): number {
    return this.price().discount || this.summaryPriceSource.discount || 0;
  }

  get effectiveTreatmentDisplayPrice(): number {
    if (this.hasDiscountApplied && this.effectiveDiscountAmount > 0) {
      const discountedPrice = this.price().priceWithDiscount;
      return (
        discountedPrice ||
        Math.max(this.selectedTreatmentPrice - this.effectiveDiscountAmount, 0)
      );
    }

    return this.selectedTreatmentPrice;
  }

  get effectiveTotalPrice(): number {
    if (this.price().total === 0 && this.effectiveTotalWithoutDiscount > 0) {
      return Math.max(
        this.effectiveTotalWithoutDiscount - this.effectiveDiscountAmount,
        0,
      );
    }

    return this.price().total || this.summaryPriceSource.total;
  }

  get effectivePaidTotal(): number {
    return this.price().totalPaid || this.summaryPriceSource.totalPaid || 0;
  }

  get effectiveBalanceUsed(): number {
    return this.price().balance || this.summaryPriceSource.balance || 0;
  }

  get showCoveredAmounts(): boolean {
    return this.effectivePaidTotal > 0 || this.effectiveBalanceUsed > 0;
  }

  get effectiveRemainingTotal(): number {
    return Math.max(
      this.effectiveTotalPrice -
        this.effectivePaidTotal -
        this.effectiveBalanceUsed,
      0,
    );
  }

  get configuredPaymentAmount(): number {
    return Math.max(Number(this.getConfigurationForm.amount.value || 0), 0);
  }

  get effectivePaidWithConfiguredAmount(): number {
    return (
      this.effectivePaidTotal +
      Math.min(this.configuredPaymentAmount, this.effectiveRemainingTotal)
    );
  }

  get configuredPaymentToPay(): number {
    return Math.max(
      this.effectiveTotalPrice -
        this.effectivePaidWithConfiguredAmount -
        this.effectiveBalanceUsed,
      0,
    );
  }

  get showConfigurationAmounts(): boolean {
    return this.showCoveredAmounts || this.configuredPaymentAmount > 0;
  }

  getFormEvent = (index: number): FormGroup<EventForm> => this.events.at(index);

  getFormEventControls = (index: number): EventForm =>
    this.getFormEvent(index).controls;

  getFormDateTime = (index: number): FormGroup<DateTimeForm> =>
    this.dateTimeList.at(index);

  getFormDateTimeControls = (index: number): DateTimeForm =>
    this.getFormDateTime(index).controls;

  create(): void {
    const dates: string[] = this.events.controls
      .map((control) => control.get('event')?.value?.start)
      .filter((start): start is Date => start instanceof Date)
      .map((start) => start.toLocaleString(DEFAULT_LOCALE));
    if (dates.length) {
      const amount = this.getConfigurationForm.amount.value;
      const type = this.getConfigurationForm.option.value?.type;
      const transfer = this.getConfigurationForm.transfer.value;
      let payment: IReservationPayment | undefined;
      if (amount && type) {
        payment = {
          type,
          amount,
          transfer,
          pointOfSale: true,
        } as IReservationPayment;
      }

      const role = this.isDashboard ? Role.roomAdmin : Role.professional;
      const reservationSignal = this.reservation();
      const reservation = Reservation.fromForm(
        this.getForm,
        dates,
        this.additionalSelected()?.map((value) => value.id),
        payment,
        this.isEditing() ? reservationSignal : undefined,
      );

      this.submitData.emit({ reservation, role });
    }
    return;
  }

  back(): void {
    if (this.isPreview) {
      this.isPreview = false;
      this.alreadyCreated = true;
    } else {
      this.cleanEvent();
    }

    const previousIndex = getBackIndex(this.steps, this.currentStepIndex());
    if (previousIndex >= 0) {
      this.setCurrentStep(previousIndex);
    }
    return;
  }

  callStepTwo = (goNext: boolean): void => {
    if (this.customerForm.invalid) {
      return;
    }
    this.isPreview = false;
    this.getRoomList(this.customerId);
    this.cleanEvent();
    if (goNext) {
      this.completeAndGoToNextStep(0);
    }
  };

  callStepThree = (goNext: boolean): void => {
    if (this.officeForm.invalid) {
      return;
    }
    this.isPreview = false;
    this.getTreatmentList(this.roomId(), this.customerId);
    this.cleanEvent();
    if (goNext) {
      this.completeAndGoToNextStep(1);
    }
  };

  callStepFour = (goNext: boolean): void => {
    if (this.treatmentForm.invalid) {
      return;
    }
    this.isPreview = false;
    this.getAdditionalList(this.roomId(), this.groupId);
    this.cleanEvent();
    if (goNext) {
      this.completeAndGoToNextStep(2);
    }
  };

  callStepFive = (goNext: boolean): void => {
    this.isPreview = false;
    this.cleanEvent();
    if (goNext) {
      this.completeAndGoToNextStep(3);
    }
  };

  callStepSix = (goNext: boolean): void => {
    if (this.configurationForm.invalid) {
      return;
    }
    const treatment = this.getTreatmentForm.treatment.value;
    const room = this.getOfficeForm.room.value;
    if (treatment && room) {
      this.isPreview = false;
      const duration = totalDuration(treatment, this.additionalSelected());
      this.totalDuration = duration.duration;
      this.totalDurationFormatted = formatTime(
        duration.duration,
        room.timeZone,
        this.language,
      );
      this.dataEvents = new Map();

      const timeZone = room.timeZone;
      const now = dateToUTC(createDate(timeZone), timeZone);

      const dates: Date[] = [];
      this.dateTimeList.value.forEach((value: any, i: number) => {
        const timeValue = getTimeNumber(value.start || this.minDate);
        if (timeValue) {
          value.date.setHours(timeValue.hour, timeValue.minute);
        }
        const dateValue = value.date.toISOString().split('T')[0];
        let date = dateToUTC(newDate(dateValue), timeZone);
        date = addDays(date, -this.lessDays());
        if (date < createFullDate(now)) {
          date = now;
        }
        const eventData = this.dataEvents.get(dateValue);
        if (!eventData) {
          this.dataEvents.set(dateValue, new DataEvent([], i, date, 0));
        }
        dates.push(value.date);
      });

      this.reservationStore.loadCalendar(
        room.id,
        this.daysInWeek(),
        dates,
        this.professionalId(),
      );
    }
    if (goNext) {
      this.completeAndGoToNextStep(4);
    }
  };

  callStepSeven = (goNext: boolean): void => {
    this.errors.update((prev) => ({
      ...prev,
      overlapping: false,
      schedule: [],
    }));
    if (!this.eventGroup.invalid) {
      for (const dataEvent of this.dataEvents.values()) {
        let eventFound = false;

        for (const eventData of this.events.value) {
          const eventToCheck = eventData.event;

          if (
            dataEvent.calendarEvents.some(
              (calendarEvent) => calendarEvent.id === eventToCheck?.id,
            )
          ) {
            eventFound = true;
            break;
          }
        }

        if (!eventFound) {
          this.errors.update((prev) => {
            const schedule = [...prev.schedule];
            schedule[dataEvent.index] = true;
            return { ...prev, schedule };
          });
        }
      }
    }
    const scheduleErrors = this.errors().schedule;
    if (scheduleErrors?.length) {
      return;
    }
    this.isPreview = true;
    if (goNext) {
      this.completeAndGoToNextStep(5);
    }
  };

  private setCurrentStep = (index: number): void => {
    this.currentStepIndex.set(index);
    if (getStepName(this.steps, index) === 'post_add') {
      queueMicrotask(() => this.syncRenderedAdditionalSelections());
    }
  };

  private completeAndGoToNextStep = (index: number): void => {
    const step = this.steps.find((value) => value.order === index);
    if (!step) {
      return;
    }
    step.completed = true;
    this.steps[step.order] = step;
    const nextIndex = this.getNextEnabledStepIndex(index);
    if (nextIndex !== undefined) {
      this.setCurrentStep(nextIndex);
    }
    if (step.next && !step.next.enable) {
      step.next.call(true);
    }
  };

  private getNextEnabledStepIndex = (
    currentIndex: number,
  ): number | undefined => {
    for (const step of this.steps.slice(currentIndex + 1)) {
      if (step.enable) {
        return step.order;
      }
    }
    return undefined;
  };

  myFilter = (d: Date | null): boolean =>
    filterDateRoom(d, this.getOfficeForm.room.value);

  displayFnUser = (user: IUser): string =>
    user?.displayName ? user.displayName : '';

  displayFnGroup = (group: ITreatmentGroup): string =>
    group ? `${group.name}` : '';

  displayFnTreatment = (treatment: ITreatment): string =>
    treatment ? `${treatment.name}` : '';

  displayFnOffice = (office: IOffice): string =>
    office ? `${office.name}` : '';

  displayFnRoom = (room: IRoom): string =>
    room.address ? room.address.name : '';

  displayFnProfessional = (professional: IUser): string =>
    professional?.displayName ? professional.displayName : '';

  openDialog = (reservationDate?: Date): void => {
    const room = this.getOfficeForm.room.value;
    if (!room) {
      return;
    }
    openDialog(
      room,
      this.language,
      this.translateService,
      this.dialog,
      reservationDate,
    );
  };

  segmentClick = (
    date: Date,
    state: string,
    eventKey: string,
    id: string = `${Math.random()}`,
  ): void => {
    const eventData = this.dataEvents.get(eventKey);
    if (eventData) {
      if (!this.dateIsValid(date)) {
        return;
      }
      this.dataEvents.delete(eventKey);
      this.dataEvents.set(date.toISOString().split('T')[0], eventData);
      this.errors.update((prev) => {
        const schedule = [...prev.schedule];
        schedule[eventData.index] = false;
        return { ...prev, schedule };
      });
      if (!this.professionalId()) {
        const data = {
          professionals: this.professionalList(),
          small: this.smallScreen(),
        };

        executeDialogNoWidth(
          this.dialog,
          SelectProfessionalDialogComponent,
          data,
          (result) => {
            if (result) {
              this.getOfficeForm.professional.setValue(result.professional);
              this.createEvent(eventData, date, state, id);
            }
          },
          true,
        );
      } else {
        this.createEvent(eventData, date, state, id);
      }
    }
  };

  getAddress = ($event: PlaceResult): void => {
    this.address = $event.formatted_address;
  };

  timeChange = ($event: string, index: number): void => {
    const dateGroup = this.getFormDateTimeControls(index);
    const date = dateGroup.date.value;
    if (date) {
      const time = getTimeNumber($event);
      const newDate = createNewDate(date, time?.hour, time?.minute);
      dateGroup.date.setValue(newDate);
    }
  };

  keyDownHandler = (event: KeyboardEvent, form: FormControl): void => {
    if (event.code === 'Backspace') {
      form.setValue(undefined);
    }
  };

  keyDownGroup = (event: KeyboardEvent): void => {
    this.treatmentList.set(undefined);
    this.keyDownHandler(event, this.getTreatmentForm.treatment);
    this.keyDownHandler(event, this.getTreatmentForm.group);
    this.errors.update((prev) => ({
      ...prev,
      treatment: undefined,
      group: undefined,
      start: undefined,
    }));
  };

  keyDownOffice = (event: KeyboardEvent): void => {
    this.keyDownRoom(event);
    this.keyDownHandler(event, this.getOfficeForm.office);
    this.errors.update((prev) => ({
      ...prev,
      office: undefined,
    }));
  };

  keyDownRoom = (event: KeyboardEvent): void => {
    if (event.code === 'Backspace') {
      this.keyDownHandler(event, this.getOfficeForm.professional);
      this.keyDownHandler(event, this.getOfficeForm.room);
      this.professionalList.set(undefined);
      this.roomId.set(undefined);
      this.professionalId.set(undefined);
      this.errors.update((prev) => ({
        ...prev,
        room: undefined,
        professional: undefined,
      }));
    }
  };

  beforeMonthViewRender = (
    { header, period }: any,
    dataEvent: IDataEvent,
  ): void => {
    dataEvent.calendarEnd = period.end;
    dataEvent.calendarStart = period.start;
    dataEvent.createRecurring();
    header.forEach((day: any) => {
      if (!this.dateIsValid(day.date)) {
        day.cssClass = 'cal-disabled';
      }
    });
  };

  eventTimesChanged = (
    { event, newStart, newEnd }: CalendarEventTimesChangedEvent,
    eventData: IDataEvent,
  ): void => {
    event.start = newStart;
    event.end = newEnd;
    this.refresh.next(event);
    const dateTimeForm = this.getFormDateTimeControls(eventData.index);
    dateTimeForm.date.setValue(newStart);
    dateTimeForm.start.setValue(getTime(newStart));
  };

  onChange = (list: MatSelectionList): void => {
    // Promise.resolve().then(() => {
    const additionalSelected = list.selectedOptions.selected.map(
      (option) => option.value as IAdditionalAll,
    );
    const currentIds = this.additionalSelected()
      .map((item) => item.id)
      .sort();
    const nextIds = additionalSelected.map((item) => item.id).sort();

    if (
      currentIds.length === nextIds.length &&
      currentIds.every((id, index) => id === nextIds[index])
    ) {
      return;
    }

    this.additionalSelected.set(additionalSelected);
    this.setPrice(
      newAdditional(this.price(), additionalSelected, this.treatmentDiscount),
    );
    this.cleanEvent();
    // });
  };

  isSelected = (it: IAdditionalAll): boolean =>
    this.additionalSelected().filter((el) => el.id === it.id).length > 0;

  compareAdditional = (
    first?: IAdditionalAll,
    second?: IAdditionalAll,
  ): boolean => first?.id === second?.id;

  addDate = (dateValue?: Date, startTime?: string): void => {
    this.dateTimeList.push(this.createDate(dateValue, startTime));
    this.events.push(this.createEventForm());
  };

  removeDate = (index: number): void => {
    this.dateTimeList.removeAt(index);
    this.events.removeAt(index);
  };

  private createEvent = (
    eventData: IDataEvent,
    date: Date,
    state: string,
    id: string,
  ): void => {
    this.errors.update((prev) => ({
      ...prev,
      overlapping: false,
    }));

    const dateGroup = this.getFormDateTimeControls(eventData.index);
    dateGroup.date.setValue(date);
    dateGroup.start.setValue(getTime(date, this.language));

    const nowTime = getTimeNumber(date);

    const start = createNewDate(date, nowTime?.hour, nowTime?.minute);
    const end = createNewDate(
      start,
      start.getHours() + this.totalDuration.hour,
      start.getMinutes() + this.totalDuration.minute,
    );
    const event = this.createNewEvent(
      start,
      end,
      state,
      this.getOfficeForm.room.value?.timeZone,
      id,
    );

    if (event) {
      let title;
      let content;
      const selectedEvent = this.events
        .at(eventData.index)
        ?.get('event')?.value;
      const eventsOverlapping = eventData.getOverlapEvent(
        start,
        end,
        this.professionalId(),
      );
      if (eventsOverlapping?.length && eventsOverlapping[0] !== selectedEvent) {
        title = this.translateService.instant(
          'RESERVATION.EVENT.OVERLAPPING.TITLE',
        );
        content = this.translateService.instant(
          'RESERVATION.EVENT.OVERLAPPING.CONTENT',
          {
            data: this.createOverlapMessage(eventsOverlapping),
          },
        );
      } else {
        if (!selectedEvent && !id) {
          title = this.translateService.instant('RESERVATION.EVENT.TITLE');
          content = this.translateService.instant('RESERVATION.EVENT.CONTENT', {
            date: start.toLocaleString(DEFAULT_LOCALE),
          });
        } else {
          title = this.translateService.instant(
            'RESERVATION.EVENT.CHANGE.TITLE',
          );
          content = this.translateService.instant(
            'RESERVATION.EVENT.CHANGE.CONTENT',
            { date: start.toLocaleString(DEFAULT_LOCALE) },
          );
        }
      }
      this.createSelectEvent(title, content, event, eventData);
    }
  };

  private createDate = (
    dateValue?: Date,
    startTime?: string,
  ): FormGroup<DateTimeForm> =>
    this.formBuilder.group<DateTimeForm>({
      date: this.formBuilder.control(dateValue, {
        validators: [Validators.required],
      }),
      start: this.formBuilder.control(startTime || this.minDate),
    });

  private createEventForm = (): FormGroup =>
    this.formBuilder.group({ event: ['', Validators.required] });

  private createNewEvent = (
    start: Date,
    end: Date,
    state: string,
    timeZone: string = getCurrentTimeZone(),
    id: string,
  ): CalendarEvent | undefined => {
    const treatment = this.getTreatmentForm.treatment.value;
    const customer = this.getCustomerForm.customer.value;
    if (!treatment || !customer) {
      return undefined;
    }
    return this.reservationCalendarService.createSelectionEvent({
      treatment,
      customer,
      additional: this.additionalSelected(),
      professional: this.getOfficeForm.professional.value,
      start,
      end,
      state,
      timeZone,
      id,
      isDarkMode: this.isDarkMode(),
    });
  };

  private dateIsValid = (date: Date): boolean =>
    isBetween(getNowTimeZone(), this.maxCalendarDate, date);

  private setPrice = (price: IPrice): void => {
    this.price.set(price);
  };

  private shouldSyncAdditionalSelection = (
    current: IAdditionalAll[],
    next: IAdditionalAll[],
  ): boolean => {
    if (current.length !== next.length) {
      return true;
    }

    return next.some(
      (item, index) =>
        current[index]?.id !== item.id || current[index] !== item,
    );
  };

  private syncRenderedAdditionalSelections = (): void => {
    queueMicrotask(() => {
      const selectedIds = new Set(
        this.additionalSelected().map((item) => item.id),
      );
      this.additionalLists().forEach((list) => {
        list.options.forEach((option: MatListOption) => {
          const additionalId = (option.value as IAdditionalAll | undefined)?.id;
          option.selected = additionalId
            ? selectedIds.has(additionalId)
            : false;
        });
      });
    });
  };

  private createOverlapMessage = (eventsOverlapping: CalendarEvent[]): string =>
    eventsOverlapping.map((event) => this.createOverlapSummary(event)).join('');

  private createOverlapSummary = (event: CalendarEvent): string => {
    const timeZone = this.getOfficeForm.room.value?.timeZone;
    const start = this.formatOverlapDate(
      event.start,
      {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      },
      timeZone,
    );
    const end = event.end
      ? this.formatOverlapDate(
          event.end,
          {
            hour: '2-digit',
            minute: '2-digit',
            hour12: false,
          },
          timeZone,
        )
      : undefined;
    const schedule = end ? `${start} - ${end}` : start;

    if (event.meta?.isReservation) {
      const none = this.translateService.instant(
        'RESERVATION.FLOW.SUMMARY.NONE',
      );
      const treatment = event.meta.treatmentName || this.stripHtml(event.title);
      const additionals = event.meta.additionalNames?.length
        ? event.meta.additionalNames.join(', ')
        : none;

      return `<div><strong>${schedule}</strong></div>
        <div>${treatment}</div>
        <div>${additionals}</div>`;
    }

    return `<div><strong>${schedule}</strong></div><div>${this.stripHtml(event.title)}</div>`;
  };

  private formatOverlapDate = (
    value: Date,
    options: Intl.DateTimeFormatOptions,
    timeZone?: string,
  ): string =>
    value.toLocaleString(DEFAULT_LOCALE, {
      ...options,
      ...(timeZone ? { timeZone } : {}),
    });

  private stripHtml = (value: string): string =>
    value
      .replace(/<[^>]*>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

  private cleanTreatment = (): void => {
    if (!this.skip() && !this.reservationId) {
      this.price.set(new Price());
      this.getTreatmentForm.discount.setValue(undefined);
      this.getTreatmentForm.treatment.setValue(undefined);
      this.showDiscount = false;
      this.treatmentId.set(undefined);
      this.treatmentList.set(undefined);
      this.groups.set(undefined);
      this.additionalSelected.set([]);
      this.cleanEvent();
    }
  };

  private addNotAvailable = (eventData: IDataEvent) => {
    const room = this.getOfficeForm.room.value;
    if (!room) {
      return;
    }
    const schedule = this.reservationCalendarService.addRoomAvailabilityEvents(
      eventData,
      room,
      this.isDarkMode(),
    );
    this.weekendDays = schedule.weekendDays;
    this.day = schedule.day;
  };

  private addReservations = (
    reservations: IReservationAll[],
  ): CalendarEvent[] =>
    this.reservationCalendarService.buildReservationEvents(
      reservations,
      this.reservationId,
      this.isDarkMode(),
    );

  private addUnavailableList = (
    dataEvent: IDataEvent,
    unavailableList: IUnavailableAll[],
  ) => {
    this.reservationCalendarService.addUnavailableEvents(
      dataEvent,
      unavailableList,
      this.getOfficeForm.room.value?.timeZone,
      this.isDarkMode(),
      this.validateUnavailable,
    );
  };

  private validateUnavailable = (
    start: Date,
    recurring: any,
    dataEvent: IDataEvent,
  ): void => {
    const [startSearch, endSearch] = searchDates(
      recurring.allDay,
      start,
      recurring.duration,
    );
    this.createUnavailableEvent(recurring, startSearch, endSearch, dataEvent);
  };

  private createUnavailableEvent = (
    recurring: any,
    start: Date,
    end: Date,
    dataEvent: IDataEvent,
  ): void => {
    const event = this.reservationCalendarService.createUnavailableEvent(
      recurring,
      start,
      end,
      this.getOfficeForm.room.value?.timeZone,
      this.isDarkMode(),
    );
    dataEvent.addEvent(event);
  };

  private applySubErrors = (subErrors: IError[]): void => {
    const state = this.formErrorService.createErrorState(subErrors, {
      allowedFields: RESERVATION_ERROR_FIELDS,
      createErrors: createReservationErrors,
      defaultStepIndex: this.isEditing() ? (this.isAdmin() ? 1 : 2) : 0,
      stepByField: { room: 1, professional: 3 },
    });
    if (state.stepIndex !== undefined) {
      this.setCurrentStep(state.stepIndex);
    }

    state.fields.forEach((field) => {
      if (field in this.customerForm.controls) {
        this.customerForm.controls[field as keyof CustomerForm]?.setErrors({
          incorrect: true,
        });
      }
      if (field in this.officeForm.controls) {
        this.officeForm.controls[field as keyof OfficeForm]?.setErrors({
          incorrect: true,
        });
      }
      if (field in this.treatmentForm.controls) {
        this.treatmentForm.controls[field as keyof TreatmentForm]?.setErrors({
          incorrect: true,
        });
      }
      if (field in this.configurationForm.controls) {
        this.configurationForm.controls[
          field as keyof ConfigurationForm
        ]?.setErrors({ incorrect: true });
      }
      if (field in this.eventGroup.controls) {
        this.eventGroup.controls[field as keyof EventGroupForm]?.setErrors({
          incorrect: true,
        });
      }

      const inputField = document.querySelector(
        `input[formControlName="${field}"]`,
      ) as HTMLInputElement | null;
      inputField?.focus();
      inputField?.blur();
    });

    this.errors.set(state.errors);
  };

  private createSelectEvent = (
    title: string,
    content: string,
    event: CalendarEvent,
    eventData: IDataEvent,
  ): void => {
    if (this.alreadyCreated) {
      this.createSelectedEvent(eventData, event);
      this.alreadyCreated = false;
    } else {
      const dialogRef = this.dialog.open(DialogComponent, {
        data: { title, content, value: event },
      });

      dialogRef.afterClosed().subscribe((result) => {
        if (result) {
          this.createSelectedEvent(eventData, event);
        }
      });
    }
  };

  private createSelectedEvent = (
    eventData: IDataEvent,
    event: CalendarEvent,
  ): void => {
    const selectedEvent = this.getFormEventControls(eventData.index).event;
    if (selectedEvent?.value) {
      eventData.removeEvent(selectedEvent.value);
    }
    selectedEvent?.setValue(event);
    eventData.addEvent(event);
    this.refresh.next(event);
  };

  private filterCustomer = (
    name: string,
    customers?: IUserAll[],
  ): IUserAll[] | undefined =>
    customers?.filter(
      (option) =>
        option.displayName?.toLowerCase().indexOf(name.toLowerCase()) === 0,
    );

  private filterGroup = (
    name: string,
    groups?: IGroupService[],
  ): IGroupService[] | undefined =>
    groups?.filter(
      (option) => option.name?.toLowerCase().indexOf(name.toLowerCase()) === 0,
    );

  private filterTreatment = (
    name: string,
    treatmentList?: IService[],
  ): IService[] | undefined =>
    treatmentList?.filter(
      (option) => option.name?.toLowerCase().indexOf(name.toLowerCase()) === 0,
    );

  private filterOffice = (
    name: string,
    offices?: IOfficeAll[],
  ): IOfficeAll[] | undefined =>
    offices?.filter(
      (option) => option.name?.toLowerCase().indexOf(name.toLowerCase()) === 0,
    );

  private filterRoom = (
    addressName: string,
    roomList?: IRoomAll[],
  ): IRoomAll[] | undefined =>
    roomList?.filter(
      (option) =>
        option.address?.name
          ?.toLowerCase()
          .indexOf(addressName.toLowerCase()) === 0,
    );

  private filterProfessional = (
    name: string,
    professionalList?: IUserAll[],
  ): IUserAll[] | undefined =>
    professionalList?.filter(
      (option) =>
        option.displayName?.toLowerCase().indexOf(name.toLowerCase()) === 0,
    );

  private cleanEvent = (): void => {
    this.alreadyCreated = false;
    for (const dataEvent of this.dataEvents.values()) {
      const event = this.getFormEventControls(dataEvent.index).event;
      if (event.value) {
        dataEvent.removeEvent(event.value);
        event.setValue(undefined);
      }
    }
  };

  private setData = (reservation: IUpcomingAll): void => {
    this.hydratingEdit = true;
    this.treatmentDiscount = reservation.treatment.discountCustomer;
    this.isPreview = false;
    const date = newDateTimestamp(
      reservation.timestamp,
      reservation.room.timeZone,
    );
    this.customerId = reservation.customer.id;
    this.groupId = reservation.treatment.groupId;
    this.professionalId.set(reservation.professional.id);
    this.roomId.set(reservation.room.id);
    this.getCustomerForm.customer.setValue(reservation.customer, {
      emitEvent: false,
    });
    this.getOfficeForm.office.setValue(reservation.room.office, {
      emitEvent: false,
    });
    this.getOfficeForm.room.setValue(reservation.room, { emitEvent: false });
    this.getOfficeForm.professional.setValue(reservation.professional, {
      emitEvent: false,
    });
    this.treatmentId.set(reservation.treatment.key);
    this.getTreatmentForm.treatment.setValue(reservation.treatment, {
      emitEvent: false,
    });
    const time = getTime(date, this.language);
    if (this.dateTimeList.controls?.length === 1) {
      const control = this.getFormDateTimeControls(0);
      const controlDate = control.date;
      if (!controlDate.value) {
        controlDate.setValue(date, { emitEvent: false });
        control.start.setValue(time, { emitEvent: false });
      } else {
        this.addDate(date, getTime(date, this.language));
      }
    } else {
      this.addDate(date, getTime(date, this.language));
    }
    this.setPrice(getPrice(reservation, reservation.payments));
    this.additionalSelected.set(
      reservation.additional
        ? reservation.additional.map((ad) =>
            Object.assign({}, ad, { id: ad.key }),
          )
        : [],
    );
    this.getConfigurationForm.note.setValue(reservation.note, {
      emitEvent: false,
    });
    const isConfigurationCanCustomerChange =
      reservation.configurationCanCustomerChange !== undefined;
    if (
      isConfigurationCanCustomerChange ||
      reservation.configurationReference
    ) {
      this.getConfigurationForm.reference.setValue(
        reservation.configurationReference,
        { emitEvent: false },
      );
      this.getConfigurationForm.customerChange.setValue(
        reservation.configurationCanCustomerChange ?? false,
        {
          emitEvent: false,
        },
      );
    }
    if (this.isEditing()) {
      const treatmentIndex = getIndex(this.steps, 'spa');
      if (treatmentIndex !== undefined) {
        this.setCurrentStep(treatmentIndex);
      }
    } else {
      this.completeAndGoToNextStep(0);
    }
    queueMicrotask(() => {
      this.hydratingEdit = false;
    });
  };

  private getRoomList = (customerId?: string): void =>
    this.roomStore.loadAll(customerId);

  private getTreatmentList = (roomId?: string, customerId?: string): void => {
    if (roomId) {
      this.treatmentStore.getAllTreatments(roomId, customerId);
    }
  };

  private getAdditionalList = (roomId?: string, groupId?: string): void => {
    if (roomId && groupId) {
      this.additionalStore.loadAllByGroupId(roomId, groupId);
    }
  };
}
