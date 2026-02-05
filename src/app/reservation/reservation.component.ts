import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  signal,
  untracked,
  viewChild,
} from '@angular/core';
import { STEPPER_GLOBAL_OPTIONS, StepperSelectionEvent } from '@angular/cdk/stepper';
import { FormArray, FormControl, FormGroup, NonNullableFormBuilder, Validators } from '@angular/forms';
import { map, startWith } from 'rxjs/operators';
import { IUser, IUserAll } from '../interfaces/user';
import { combineLatestWith, Subject } from 'rxjs';
import { Store } from '@ngrx/store';
import {
  createReservation,
  getAllAdditionalByGroupId,
  getAllRooms,
  getAllTreatments,
  getCustomerInformation,
  getReservation,
  searchAvailability,
  updateReservationById,
} from '../store/reservation.actions';
import { noDuplicateDatesValidator, requireMatch, valueChange } from '../util/validators';
import { IGroupService, IPrice, ITreatment, ITreatmentGroup, Price } from '../interfaces/treatment';
import { MatStepper } from '@angular/material/stepper';
import { IRoom, IRoomAll, IService } from '../interfaces/room';
import {
  Day,
  ICustomerLastReservation,
  IDay,
  IReservation,
  IReservationAll,
  IReservationPayment,
  MAX_RESERVATION_MONTH,
  Reservation,
} from '../interfaces/reservation';
import { CalendarEvent, CalendarEventTimesChangedEvent, CalendarWeekViewComponent } from 'angular-calendar';
import { TranslateService } from '@ngx-translate/core';
import { MatDialog } from '@angular/material/dialog';
import { DialogComponent } from '../shared/dialog/generic/dialog.component';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import {
  API_LOCALE,
  createDate,
  createFullDate,
  createNewDate,
  dateToTimestamp,
  dateToUTC,
  Duration,
  filterDateRoom,
  formatTime,
  getAvailability,
  getCurrentTimeZone,
  getDurationOrUndefined,
  getNowTimeZone,
  getStartEndDay,
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
import { createBullet, DataEvent, IDataEvent, Meta, newEvent } from '../util/event';
import { Router } from '@angular/router';
import { Role } from '../interfaces/token';
import { IUnavailableAll } from '../interfaces/unavailable';
import { DiscountType, IDiscount, IUserDiscount } from '../interfaces/discount';
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
import { transitionAnimation } from '../util/animation';
import { addDays, addMonths, isEqual } from 'date-fns';
import { findStateColor } from '../util/theme';
import { IAdditionalAll } from '../interfaces/additional';
import { MatListOption } from '@angular/material/list';
import { IOffice, IOfficeAll } from '../interfaces/office';
import { IStep, Step } from '../interfaces/step';
import { SelectProfessionalDialogComponent } from './select-professional-dialog.component';
import { ToastService } from '../services/toast.service';
import { AuthUserService } from '../services/auth-user.service';
import {
  completeAndNext,
  enableStep,
  getBackIndex,
  getIndex,
  getStepCall,
  getStepCompleted,
  getStepEnabled,
  getStepName,
  getStepOptional,
} from '../util/step';
import { PaymentType } from '../interfaces/payment';
import { SharedModule } from '../shared/shared.module';
import { RoomNamePipe } from '../pipes/room-name.pipe';
import { SortByPipe } from '../pipes/sort-by.pipe';
import { CurrencySymbolPipe } from '../pipes/currency-symbol.pipe';
import { DurationTimePipe } from '../pipes/durationTime.pipe';
import { PricePreviewComponent } from '../shared/price-preview/price-preview.component';
import { BackButtonDirective } from '../directives/back-button.directive';
import { GoogleMapComponent } from '../shared/google-map/google-map.component';
import { ReservationState } from '../store/reducers/reservation.reducers';
import {
  getAdditionalListPipe,
  getCalendarPipe,
  getCurrentReservationIdPipe,
  getCustomerInfoPipe,
  getCustomersPipe,
  getNavigationParamsPipe,
  getRoomsPipe,
  getSelectedReservationPipe,
  getSubErrorsPipe,
  getTreatmentDiscountPipe,
} from '../store/selectors/reservation.selectors';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { IError } from '../interfaces/common';
import PlaceResult = google.maps.places.PlaceResult;

type CustomerForm = {
  customer: FormControl<IUserAll | undefined>;
}

type OfficeForm = {
  room: FormControl<IRoomAll | undefined>;
  professional: FormControl<IUserAll | undefined>;
  office: FormControl<IOfficeAll | undefined>;
};

type DateTimeForm = {
  date: FormControl<Date | undefined>;
  start: FormControl<string | undefined>;
}

type TreatmentForm = {
  treatment: FormControl<IService | undefined>;
  discount: FormControl<string | undefined>;
  group: FormControl<IGroupService | undefined>;
  dateTimeList: FormArray<FormGroup<DateTimeForm>>;
};

type ConfigurationForm = {
  customerChange: FormControl<boolean>;
  reference: FormControl<string | undefined>;
  note: FormControl<string | undefined>;
  type: FormControl<PaymentType | undefined>;
  amount: FormControl<number | undefined>;
  transfer: FormControl<string | undefined>;
};

type EventForm = {
  event: FormControl<CalendarEvent | undefined>;
};

type EventGroupForm = {
  events: FormArray<FormGroup<EventForm>>;
};

type ReservationForms = {
  customerForm: FormGroup<CustomerForm>;
  officeForm: FormGroup<OfficeForm>;
  treatmentForm: FormGroup<TreatmentForm>;
  configurationForm: FormGroup<ConfigurationForm>;
  eventGroup: FormGroup<EventGroupForm>;
};

type ReservationErrors = {
  customer?: string;

  room?: string;
  professional?: string;
  office?: string;

  treatment?: string;
  discount?: string;
  group?: string;
  dateTimeList?: string[];

  customerChange?: string;
  reference?: string;
  note?: string;
  type?: string;
  amount?: string;
  transfer?: string;

  events?: string[];

  schedule: boolean[];
  overlapping: boolean;
};

@Component({
  selector: 'app-reservation',
  animations: [transitionAnimation],
  templateUrl: './reservation.component.html',
  styleUrls: ['./reservation.component.scss'],
  imports: [SharedModule, RoomNamePipe, SortByPipe, CurrencySymbolPipe, DurationTimePipe, PricePreviewComponent,
    BackButtonDirective, GoogleMapComponent, CalendarWeekViewComponent],
  providers: [{
    provide: STEPPER_GLOBAL_OPTIONS, useValue: { displayDefaultIndicatorType: false },
  }],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReservationComponent {
  private readonly dialog = inject(MatDialog);
  private readonly toastService: ToastService = inject(ToastService);
  private readonly translate: TranslateService = inject(TranslateService);
  private readonly store: Store<ReservationState> = inject(Store<ReservationState>);
  private readonly formBuilder: NonNullableFormBuilder = inject(NonNullableFormBuilder);
  private readonly breakpointObserver: BreakpointObserver = inject(BreakpointObserver);
  private readonly router: Router = inject(Router);
  private readonly authUserService: AuthUserService = inject(AuthUserService);

  private navigationParams$ = this.store.pipe(getNavigationParamsPipe);
  private reservationId$ = this.store.pipe(getCurrentReservationIdPipe);
  private customers$ = this.store.pipe(getCustomersPipe);
  private customerInfo$ = this.store.pipe(getCustomerInfoPipe);
  private rooms$ = this.store.pipe(getRoomsPipe);
  private treatmentDiscount$ = this.store.pipe(getTreatmentDiscountPipe);
  private additionalList$ = this.store.pipe(getAdditionalListPipe);
  private selectedReservation$ = this.store.pipe(getSelectedReservationPipe);
  private calendar$ = this.store.pipe(getCalendarPipe);
  private subErrors$ = this.store.pipe(getSubErrorsPipe);
  private breakpointObserver$ = this.breakpointObserver.observe([Breakpoints.XSmall, Breakpoints.Small]);

  private navigationParams = toSignal(this.navigationParams$);
  private reservationIdSignal = toSignal(this.reservationId$);
  private roomsSignal = toSignal(this.rooms$);
  private treatmentDiscountSignal = toSignal(this.treatmentDiscount$);
  private customerInfoSignal = toSignal(this.customerInfo$);
  private selectedReservationSignal = toSignal(this.selectedReservation$);
  private calendarSignal = toSignal(this.calendar$);
  private subErrorsSignal = toSignal(this.subErrors$);
  private authUserSignal = this.authUserService.authUser;
  private breakpointsSignal = toSignal(
    this.breakpointObserver$, {
      initialValue: {
        matches: false,
        breakpoints: {
          [Breakpoints.XSmall]: false,
          [Breakpoints.Small]: false,
        },
      },
    },
  );

  additionalListSignal = toSignal(this.additionalList$);
  additionalSelected = signal<IAdditionalAll[]>([]);

  dataEvents: Map<string, IDataEvent> = new Map();
  private stepper = viewChild<MatStepper>('stepper');

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

  treatmentForm: FormGroup<TreatmentForm> = this.formBuilder.group<TreatmentForm>({
    treatment: this.formBuilder.control(undefined, {
      validators: [Validators.required, requireMatch],
    }),
    discount: this.formBuilder.control(undefined),
    group: this.formBuilder.control(undefined, {
      validators: [Validators.required, requireMatch],
    }),
    dateTimeList: this.formBuilder.array([
      this.formBuilder.group<DateTimeForm>({
        date: this.formBuilder.control(undefined, {
          validators: [Validators.required],
        }),
        start: this.formBuilder.control(this.minDate),
      }),
    ], { validators: noDuplicateDatesValidator() }),
  });

  configurationForm: FormGroup<ConfigurationForm> = this.formBuilder.group<ConfigurationForm>({
    customerChange: this.formBuilder.control(false),
    reference: this.formBuilder.control(undefined),
    note: this.formBuilder.control(undefined),
    type: this.formBuilder.control(undefined),
    amount: this.formBuilder.control(undefined, [Validators.min(1)]),
    transfer: this.formBuilder.control(undefined),
  });

  eventGroup: FormGroup<EventGroupForm> = this.formBuilder.group<EventGroupForm>({
    events: this.formBuilder.array([this.formBuilder.group<EventForm>({
      event: this.formBuilder.control(undefined, {
        validators: [Validators.required],
      }),
    })]),
  });

  form: FormGroup<ReservationForms> = this.formBuilder.group<ReservationForms>({
    customerForm: this.customerForm,
    officeForm: this.officeForm,
    treatmentForm: this.treatmentForm,
    eventGroup: this.eventGroup,
    configurationForm: this.configurationForm,
  });

  errors = signal<ReservationErrors>({
    schedule: [],
    dateTimeList: [],
    events: [],
    overlapping: false,
  });

  customersSignal = toSignal(this.customers$);
  filteredCustomerSignal = toSignal(
    this.getCustomerForm.customer.valueChanges.pipe(
      startWith(''),
      map(value => typeof value === 'string' ? value : value?.displayName),
      combineLatestWith(this.customers$),
      map(([name, customers]) => {
        if (name) {
          return this.filterCustomer(name, customers);
        } else {
          return customers ? customers.slice() : customers;
        }
      }),
    ),
  );
  customerInfo = signal<ICustomerLastReservation | undefined>(this.customerInfoSignal());

  groups = signal<IGroupService[] | undefined>(undefined);
  filteredGroupSignal = toSignal(
    this.getTreatmentForm.group.valueChanges.pipe(
      startWith(''),
      map(value => typeof value === 'string' ? value : value?.name),
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
      map(value => typeof value === 'string' ? value : value?.name),
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
          title =
            `${currencySymbol(ud.discountCustomer.discount?.currency)} ${ud.discountCustomer.amount} ${title}`;
          break;
        case DiscountType.percentage:
          title = `${ud.discountCustomer.amount} % ${title}`;
          break;
      }
      return Object.assign({}, ud, { title });
    }));
  showDiscount = false;
  price: IPrice = new Price();

  roomList = signal<IRoomAll[] | undefined>(undefined);
  filteredRoomSignal = toSignal(
    this.getOfficeForm.room.valueChanges.pipe(
      startWith(''),
      map(value => typeof value === 'string' ? value : value?.address?.name),
      combineLatestWith(toObservable(this.roomList)),
      map(([name, rooms]) => {
        if (name) {
          return this.filterRoom(name, rooms);
        } else {
          return rooms ? rooms.slice() : rooms;
        }
      })),
  );

  offices = computed(() => Array.from(createRoomOffice(this.roomsSignal())?.values() || []));
  filteredOfficeSignal = toSignal(
    this.getOfficeForm.office.valueChanges.pipe(
      startWith(''),
      map(value => typeof value === 'string' ? value : value?.name),
      combineLatestWith(toObservable(this.offices)),
      map(([name, offices]) => {
        if (name) {
          return this.filterOffice(name, offices);
        } else {
          return offices ? offices.slice() : offices;
        }
      })),
  );

  professionalList = signal<IUserAll[] | undefined>(undefined);
  filteredProfessionalSignal = toSignal(
    this.getOfficeForm.professional.valueChanges.pipe(
      startWith(''),
      map(value => typeof value === 'string' ? value : value?.displayName),
      combineLatestWith(toObservable(this.professionalList)),
      map(([name, professionals]) => {
        if (name) {
          return this.filterProfessional(name, professionals);
        } else {
          return professionals ? professionals.slice() : professionals;
        }
      })),
  );
  address?: string;

  customerAdditionalIds?: string[];

  private selectCustomerSignal = toSignal(this.getCustomerForm.customer.valueChanges);
  private selectOfficeSignal = toSignal(this.getOfficeForm.office.valueChanges);
  private selectRoomSignal = toSignal(this.getOfficeForm.room.valueChanges);
  private selectProfessionalSignal = toSignal(this.getOfficeForm.professional.valueChanges);
  private selectGroupSignal = toSignal(this.getTreatmentForm.group.valueChanges);
  private selectTreatmentSignal = toSignal(this.getTreatmentForm.treatment.valueChanges);
  private selectDiscountSignal = toSignal(this.getTreatmentForm.discount.valueChanges);
  private selectCustomerChangeSignal = toSignal(this.getConfigurationForm.customerChange.valueChanges);
  private selectAmountSignal = toSignal(this.getConfigurationForm.amount.valueChanges);
  private selectDateTimeListSignal = toSignal(this.dateTimeList.valueChanges);

  weekendDays: number[] = [0, 6];
  day: IDay = new Day();
  refresh: Subject<any> = new Subject();

  dateFormat: string = this.translate.getCurrentLang();
  isPreview = false;
  totalDurationFormatted?: string;

  isEditing = signal(false);
  isAdmin = computed(() => this.authUserSignal().isAdmin);
  maxCalendarDate: Date = addMonths(getNowTimeZone(), MAX_RESERVATION_MONTH);

  types: string[] = [PaymentType.cash, PaymentType.transfer];
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
  private isDarkMode = computed(() => this.authUserSignal()?.isDarkMode ?? false);
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
  private readonly language: string = this.translate.getCurrentLang();

  constructor() {
    const preview = new Step(6, 'preview', () => this.create());
    const book = new Step(5, 'book_online', (goNext: boolean) => this.callStepSeven(goNext), preview);
    const settings = new Step(4, 'settings', (goNext: boolean) => this.callStepSix(goNext), book);
    const additional = new Step(3, 'post_add', (goNext: boolean) => this.callStepFive(goNext), settings, true);
    const treatment = new Step(2, 'spa', (goNext: boolean) => this.callStepFour(goNext), additional);
    const room = new Step(1, 'room', (goNext: boolean) => this.callStepThree(goNext), treatment);
    const customer = new Step(0, 'person_search', (goNext: boolean) => this.callStepTwo(goNext), room);
    this.steps = [customer, room, treatment, additional, settings, book, preview];

    effect(() => {
      const params = this.navigationParams();
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
        if (params.date.getMinutes() % 15 === 0 && params.date.getSeconds() === 0) {
          start = getTime(params.date, this.dateFormat);
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
      const id = this.reservationIdSignal();
      if (id) {
        this.isEditing.set(true);
        this.steps = this.steps.map(value => {
          switch (value.order) {
            case 0:
              value.enable = false;
              return value;
            case 1:
              const enable = this.isAdmin();
              value.enable = enable;
              return value;
            default:
              return value;
          }
        });
        this.store.dispatch(getReservation({ id }));
      }
    });

    effect(() => {
      if (this.isEditing()) {
        const customerId = this.customerId;
        if (this.isAdmin()) {
          this.getRoomList(customerId);
        } else {
          this.getTreatmentList(this.roomId(), customerId);
        }
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
            const professional = room.professionals?.find(p => p.id === professionalId);

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
          const room = office.rooms?.find(r => r.id === roomId);
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
        this.store.dispatch(getAllRooms({ customerId }));
        this.getAdditionalList(roomId, this.groupId);

        if (this.customerForm.valid && this.officeForm.valid && this.treatmentForm.valid &&
          this.configurationForm.valid) {
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
      this.customerInfo.set(undefined);
      if (!customer) {
        return;
      }
      this.cleanTreatment();
      if (!this.isEditing()) {
        this.store.dispatch(getCustomerInformation({ id: customer.id }));
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
          const localDate = localeTimeZoneDate(this.translate.getCurrentLang(), now);
          const timeZoneDate = localeTimeZoneDate(this.translate.getCurrentLang(), now, room.timeZone);
          const warning = this.translate.instant('COMMON.TIME_ZONE.WARNING');
          const localDateLabel = this.translate.instant('COMMON.TIME_ZONE.DATE.LOCAL', { date: localDate });
          const roomDateLabel = this.translate.instant('COMMON.TIME_ZONE.DATE.ROOM', { date: timeZoneDate });
          const message = `${warning} - ${localDateLabel} / ${roomDateLabel}`;
          const toastRef = this.toastService.show(message, 'warning', 0, { actionType: 'none' });
          toastRef.onAction().subscribe(() => {
            this.dismiss = true;
          });
        }
        this.professionalList.set(room.professionals);
        const professional = getList(room.professionals, this.professionalId());
        this.getOfficeForm.professional.setValue(professional);
        this.professionalId.set(professional?.id);
        const { monday, tuesday, wednesday, thursday, friday, saturday, sunday } = getAvailability(room);
        const {
          min,
          max,
        } = getStartEndDay(monday, tuesday, wednesday, thursday, friday, saturday, sunday, room.timeZone);
        if (min) {
          this.minDate = getTime(min);
          this.dateTimeList.controls.forEach((control: any) => {
            const start = control.get('start');
            if (start && (!start.value || start.value === '' || start.value === '00:00')) {
              control.get('start')?.setValue(this.minDate);
            }
          });
        }
        if (max) {
          this.maxDate = getTime(max);
        }
        this.getTreatmentForm.group.setValue(undefined);
        // this.cleanTreatment();
      }
    });

    effect(() => {
      const groups = this.groups();
      const treatmentId = this.treatmentId();
      if (!groups || !treatmentId) {
        return;
      }
      this.getTreatmentForm.group.setValue(
        groups.find(group => group.treatments.find(treatment => treatment.id === treatmentId)));

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
        this.price = newPrice(this.price, treatment.price, this.treatmentDiscount);
        this.cleanEvent();
      }
    });

    effect(() => {
      const treatmentDiscount = this.treatmentDiscountSignal();
      if (treatmentDiscount?.treatments) {
        const room = this.getOfficeForm.room.value;
        if (room) {
          this.groups.set(Array.from(
            createTreatmentGroupService(new Map<string, IGroupService>(), treatmentDiscount.treatments,
              room.currency.code).values()));
        }
      }
    });

    effect(() => {
      const discountId = this.selectDiscountSignal();
      const discounts = this.discounts();
      if (discountId && discounts) {
        const userDiscount = discounts.find(d => d.id === discountId);
        if (userDiscount) {
          this.treatmentDiscount = userDiscount.discountCustomer;
          this.price = newDiscount(this.price, this.treatmentDiscount);
          this.cleanEvent();
        }
      } else {
        this.treatmentDiscount = undefined;
        this.price = removeDiscount(this.price);
        this.cleanEvent();
      }
    });

    effect(() => {
      const customerChange = this.selectCustomerChangeSignal();
      if (customerChange) {
        this.getConfigurationForm.reference.setValidators([Validators.required]);
      } else {
        this.getConfigurationForm.reference.clearValidators();
      }
      this.getConfigurationForm.reference.updateValueAndValidity();
    });

    effect(() => {
      const amount = this.selectAmountSignal();
      if (amount) {
        this.getConfigurationForm.type.setValidators([Validators.required]);
      } else {
        this.getConfigurationForm.type.clearValidators();
      }
      this.getConfigurationForm.type.updateValueAndValidity();
    });

    effect(() => {
      this.selectDateTimeListSignal();
      this.dateTimeList.updateValueAndValidity({ onlySelf: true, emitEvent: false });
    });

    effect(() => {
      const additionalList = this.additionalListSignal();
      const reservation = this.selectedReservationSignal();
      if (additionalList?.length) {
        const additionalIndex = enableStep(this.steps, 'post_add');
        if (this.customerAdditionalIds?.length && !this.additionalSelected().length &&
          this.myStepper?.selectedIndex === additionalIndex) {
          const selected = additionalList.filter(ad => this.customerAdditionalIds?.includes(ad.id))
            .map(ad => Object.assign({}, ad, { id: ad.id }));
          this.additionalSelected.set(selected);
          this.price = newAdditional(this.price, selected, reservation?.treatment?.discountCustomer);
        }
        const additionalSelected = this.additionalSelected();
        if (additionalSelected?.length) {
          const selectIds = additionalSelected?.map(value => value.id);
          const newList = additionalList.filter(al => selectIds.includes(al.id));
          if (newList.length !== additionalSelected.length) {
            this.additionalSelected.set(newList);
            this.price = newAdditional(this.price, additionalSelected, reservation?.treatment?.discountCustomer);
          }
        }
        if (this.additionalIds?.length) {
          const ids = this.additionalIds;
          const newList = additionalList.filter(al => ids.includes(al.id));
          if (newList.length !== additionalSelected.length) {
            this.additionalSelected.set(newList);
            this.additionalIds = [];
            this.price = newAdditional(this.price, newList, reservation?.treatment?.discountCustomer);
          }
        }
      }
    });

    effect(() => {
      const subErrors = this.subErrorsSignal();
      if (subErrors) {
        this.isPreview = false;
        const errorMap: ReservationErrors = { schedule: [], dateTimeList: [], events: [], overlapping: false };
        subErrors.forEach((error: IError) => {
          let step = this.isEditing() ? this.isAdmin() ? 1 : 2 : 0;
          switch (error.field) {
            case 'room':
              step = 1;
              break;
            case 'professional':
              step = 3;
              break;
          }
          if (this.myStepper) {
            this.myStepper.selectedIndex = step;
          }

          const field = error.field as keyof Omit<ReservationErrors, 'schedule' | 'dateTimeList' | 'events' | 'overlapping'> | undefined;
          if (field) {
            errorMap[field] = error.message;

            // Set Angular form errors
            if (field in this.customerForm.controls) {
              this.customerForm.controls[field as keyof CustomerForm]?.setErrors({ incorrect: true });
            }
            if (field in this.officeForm.controls) {
              this.officeForm.controls[field as keyof OfficeForm]?.setErrors({ incorrect: true });
            }
            if (field in this.treatmentForm.controls) {
              this.treatmentForm.controls[field as keyof TreatmentForm]?.setErrors({ incorrect: true });
            }
            if (field in this.configurationForm.controls) {
              this.configurationForm.controls[field as keyof ConfigurationForm]?.setErrors({ incorrect: true });
            }
            if (field in this.eventGroup.controls) {
              this.eventGroup.controls[field as keyof EventGroupForm]?.setErrors({ incorrect: true });
            }
            const inputField = document.querySelector(`input[formControlName="${field}"]`) as HTMLInputElement;
            if (inputField) {
              inputField.focus();
              inputField.blur();
            }
          }
        });
        this.errors.set(errorMap);
      }
    });

    effect(() => {
      const customerInfo = this.customerInfoSignal();
      if (customerInfo) {
        this.customerAdditionalIds = customerInfo.additionalIds;
        this.treatmentId.update(prev => prev || customerInfo.treatment.key);
        this.roomId.update(prev => prev || customerInfo.roomId);
        this.professionalId.update(prev => prev || customerInfo.professionalId);
      }
    });

    effect(() => {
      const reservation = this.selectedReservationSignal();
      const stepper = untracked(() => this.stepper());
      if (reservation && stepper) {
        this.setData(reservation);
      }
    });

    effect(() => {
      const calendar = this.calendarSignal();
      const reservation = this.selectedReservationSignal();
      if (calendar) {
        calendar.forEach((data) => {
          const dataEvent = this.dataEvents.get(data.date);
          if (dataEvent && dataEvent.calendarEvents.length === dataEvent.unavailableEventLength) {
            this.addNotAvailable(dataEvent);
            dataEvent.addEvents(this.addReservations(data.reservations));
            this.addUnavailableList(dataEvent, data.unavailableList);
            dataEvent.recurringEvent?.execute();
            const bookOrder = getIndex(this.steps, 'book_online');
            const dateTime = this.dateTimeList.at(dataEvent.index);
            const start = dateTime.get('start')?.value;
            const dateValue = dateTime?.get('date')?.value;
            if (reservation && dateValue && this.myStepper?.selectedIndex === bookOrder) {
              let date: Date;
              if (start) {
                const time = getTimeNumber(start);
                date = createNewDate(dateValue, time?.hour, time?.minute);
              } else {
                date = createNewDate(dateValue, dateValue.getHours(), dateValue.getMinutes());
              }
              if (isEqual(newDateTimestamp(reservation.timestamp), date)) {
                const duration = reservationDuration(reservation);
                const end = createNewDate(date, date.getHours() + duration.hour,
                  date.getMinutes() + duration.minute);
                const event = this.createNewEvent(date, end, 'EDITING', reservation.room.timeZone, reservation.id);
                if (event) {
                  this.events.at(dataEvent.index)?.get('event')?.setValue(event);
                  dataEvent.addEvent(event);
                  this.refresh.next(event);
                }
              } else {
                this.segmentClick(date, 'EDITING', data.date, reservation.id);
              }
            } else if (start && this.myStepper?.selectedIndex === bookOrder) {
              if (dateValue) {
                this.segmentClick(dateValue, 'CREATED', data.date);
              }
            }
          }
        });
      }
    });
  }

  get myStepper(): MatStepper | undefined {
    return this.stepper();
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
    this.router.navigate([this.language, 'users', 'add'], { state: { role: Role.customer } });
    return;
  }

  get showTimeZone(): boolean {
    return !isSameTimeZone(this.getOfficeForm.room.value?.timeZone);
  }

  get isAddButtonDisabled(): boolean {
    if (this.dateTimeList.invalid) {
      return true;
    }

    return this.dateTimeList.controls.some(control => control.invalid || !control.get('date')?.value);
  }

  getFormEvent = (index: number): FormGroup<EventForm> => this.events.at(index);

  getFormEventControls = (index: number): EventForm => this.getFormEvent(index).controls;

  getFormDateTime = (index: number): FormGroup<DateTimeForm> => this.dateTimeList.at(index);

  getFormDateTimeControls = (index: number): DateTimeForm => this.getFormDateTime(index).controls;

  create(): void {
    const reservation: IReservation = new Reservation();
    reservation.customerId = this.getCustomerForm.customer.value?.id;
    const dates: string[] = this.events.value?.map(
      (calendarEvent: any) => calendarEvent.event.start.toLocaleString(API_LOCALE)) ?? [];
    if (dates.length) {
      reservation.start = dates.shift();
      reservation.moreStart = dates;
      reservation.timeZone = getCurrentTimeZone();
      reservation.additionalIds = this.additionalSelected()?.map(value => value.id);
      reservation.canCustomerChange = this.getConfigurationForm.customerChange.value;
      reservation.reference = this.getConfigurationForm.reference.value;
      reservation.note = this.getConfigurationForm.note.value;
      const amount = this.getConfigurationForm.amount.value;
      const type = this.getConfigurationForm.type.value;
      const transfer = this.getConfigurationForm.transfer.value;
      if (amount && type) {
        reservation.payment = { type, amount, transfer } as IReservationPayment;
      }

      const role = this.isDashboard ? Role.roomAdmin : Role.professional;
      const reservationSignal = this.selectedReservationSignal();
      if (this.isEditing() && reservationSignal) {
        reservation.id = reservationSignal.id;
        reservation.treatmentId =
          valueChange(this.getTreatmentForm.treatment.value?.id, reservationSignal.treatment.id);
        reservation.roomId = valueChange(this.getOfficeForm.room.value?.id, reservationSignal.room.id);
        reservation.professionalId =
          valueChange(this.getOfficeForm.professional.value?.id, reservationSignal.professional.id);
        this.store.dispatch(updateReservationById({ id: reservationSignal.id, reservation, role }));
      } else {
        reservation.treatmentId = this.getTreatmentForm.treatment.value?.id;
        reservation.roomId = this.getOfficeForm.room.value?.id;
        reservation.professionalId = this.getOfficeForm.professional.value?.id;
        reservation.discountId = this.getTreatmentForm.discount.value;
        this.store.dispatch(
          createReservation({ reservation, role }),
        );
      }
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

    if (this.myStepper) {
      this.myStepper.selectedIndex = getBackIndex(this.steps, this.myStepper.selectedIndex);
    }
    return;
  }

  triggerClick = (event: StepperSelectionEvent): void => getStepCall(this.steps, event.selectedIndex - 1);

  callStepTwo = (goNext: boolean): void => {
    if (this.customerForm.invalid) {
      return;
    }
    if (!goNext) {
      this.isPreview = false;
      this.getRoomList(this.customerId);
      this.cleanEvent();
    }
    if (this.myStepper) {
      completeAndNext(this.steps, this.myStepper, goNext);
    }
  };

  callStepThree = (goNext: boolean): void => {
    if (this.officeForm.invalid) {
      return;
    }
    if (!goNext) {
      this.isPreview = false;
      this.getTreatmentList(this.roomId(), this.customerId);
      this.cleanEvent();
    }
    if (this.myStepper) {
      completeAndNext(this.steps, this.myStepper, goNext);
    }
  };

  callStepFour = (goNext: boolean): void => {
    if (this.treatmentForm.invalid) {
      return;
    }
    if (!goNext) {
      this.isPreview = false;
      this.getAdditionalList(this.roomId(), this.groupId);
      this.cleanEvent();
    }
    if (this.myStepper) {
      completeAndNext(this.steps, this.myStepper, goNext);
    }
  };

  callStepFive = (goNext: boolean): void => {
    if (!goNext) {
      this.isPreview = false;
      this.cleanEvent();
    }
    if (this.myStepper) {
      completeAndNext(this.steps, this.myStepper, goNext);
    }
  };

  callStepSix = (goNext: boolean): void => {
    if (this.configurationForm.invalid) {
      return;
    }
    const treatment = this.getTreatmentForm.treatment.value;
    const room = this.getOfficeForm.room.value;
    if (!goNext && treatment && room) {
      this.isPreview = false;
      const duration = totalDuration(treatment, this.additionalSelected());
      this.totalDuration = duration.duration;
      this.totalDurationFormatted = formatTime(duration.duration, room.timeZone, this.dateFormat);
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

      this.store.dispatch(
        searchAvailability({
          days: this.daysInWeek(),
          dates,
          roomId: room.id,
          professionalId: this.professionalId(),
        }),
      );
    }
    if (this.myStepper) {
      completeAndNext(this.steps, this.myStepper, goNext);
    }
  };

  callStepSeven = (goNext: boolean): void => {
    this.errors.update(prev => ({ ...prev, overlapping: false, schedule: [] }));
    if (!this.eventGroup.invalid) {
      for (const dataEvent of this.dataEvents.values()) {
        let eventFound = false;

        for (const eventData of this.events.value) {
          const eventToCheck = eventData.event;

          if (dataEvent.calendarEvents.some(calendarEvent => calendarEvent.id === eventToCheck?.id)) {
            eventFound = true;
            break;
          }
        }

        if (!eventFound) {
          this.errors.update(prev => {
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
    if (!goNext) {
      this.isPreview = true;
    }
    if (this.myStepper) {
      completeAndNext(this.steps, this.myStepper, goNext);
    }
  };

  getStepName = (index: number): string => getStepName(this.steps, index);

  getStepEnabled = (index: number): boolean => getStepEnabled(this.steps, index);

  getStepOptional = (index: number): boolean => getStepOptional(this.steps, index);

  getStepCompleted = (index: number): boolean => getStepCompleted(this.steps, index);

  myFilter = (d: Date | null): boolean => filterDateRoom(d, this.getOfficeForm.room.value);

  displayFnUser = (user: IUser): string => user?.displayName ? user.displayName : '';

  displayFnGroup = (group: ITreatmentGroup): string => group ? `${group.name}` : '';

  displayFnTreatment = (treatment: ITreatment): string => treatment ? `${treatment.name}` : '';

  displayFnOffice = (office: IOffice): string => office ? `${office.name}` : '';

  displayFnRoom = (room: IRoom): string => room.address ? room.address.name : '';

  displayFnProfessional = (professional: IUser): string => professional?.displayName ? professional.displayName : '';

  openDialog = (reservationDate?: Date): void => {
    const room = this.getOfficeForm.room.value;
    if (!room) {
      return;
    }
    openDialog(room, this.dateFormat, this.translate, this.dialog, reservationDate);
  };

  segmentClick = (date: Date, state: string, eventKey: string, id: string = `${Math.random()}`): void => {
    const eventData = this.dataEvents.get(eventKey);
    if (eventData) {
      if (!this.dateIsValid(date)) {
        return;
      }
      this.dataEvents.delete(eventKey);
      this.dataEvents.set(date.toISOString().split('T')[0], eventData);
      this.errors.update(prev => {
        const schedule = [...prev.schedule];
        schedule[eventData.index] = false;
        return { ...prev, schedule };
      });
      if (!this.professionalId()) {
        const data = { professionals: this.professionalList(), small: this.smallScreen() };

        executeDialogNoWidth(this.dialog, SelectProfessionalDialogComponent, data, result => {
          if (result) {
            this.getOfficeForm.professional.setValue(result.professional);
            this.createEvent(eventData, date, state, id);
          }
        }, true);
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
    this.errors.update(prev => ({
      ...prev,
      treatment: undefined,
      group: undefined,
      start: undefined,
    }));
  };

  keyDownOffice = (event: KeyboardEvent): void => {
    this.keyDownRoom(event);
    this.keyDownHandler(event, this.getOfficeForm.office);
    this.errors.update(prev => ({
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
      this.errors.update(prev => ({
        ...prev,
        room: undefined,
        professional: undefined,
      }));
    }
  };

  beforeMonthViewRender = ({ header, period }: any, dataEvent: IDataEvent): void => {
    dataEvent.calendarEnd = period.end;
    dataEvent.calendarStart = period.start;
    dataEvent.createRecurring();
    header.forEach((day: any) => {
      if (!this.dateIsValid(day.date)) {
        day.cssClass = 'cal-disabled';
      }
    });
  };

  eventTimesChanged = ({ event, newStart, newEnd }: CalendarEventTimesChangedEvent, eventData: IDataEvent): void => {
    event.start = newStart;
    event.end = newEnd;
    this.refresh.next(event);
    const dateTimeForm = this.getFormDateTimeControls(eventData.index);
    dateTimeForm.date.setValue(newStart);
    dateTimeForm.start.setValue(getTime(newStart));
  };

  onChange = (options: MatListOption[]): void => {
    this.additionalSelected.set(options.map(o => o.value));
    this.price = newAdditional(this.price, this.additionalSelected(), this.treatmentDiscount);
    this.cleanEvent();
  };

  isSelected = (it: IAdditionalAll): boolean => this.additionalSelected().filter(el => el.id === it.id).length > 0;

  addDate = (dateValue?: Date, startTime?: string): void => {
    this.dateTimeList.push(this.createDate(dateValue, startTime));
    this.events.push(this.createEventForm());
  };

  removeDate = (index: number): void => {
    this.dateTimeList.removeAt(index);
    this.events.removeAt(index);
  };

  private createEvent = (eventData: IDataEvent, date: Date, state: string, id: string): void => {
    this.errors.update(prev => ({
      ...prev,
      overlapping: false,
    }));

    const dateGroup = this.getFormDateTimeControls(eventData.index);
    dateGroup.date.setValue(date);
    dateGroup.start.setValue(getTime(date, this.dateFormat));

    const nowTime = getTimeNumber(date);

    const start = createNewDate(date, nowTime?.hour, nowTime?.minute);
    const end = createNewDate(start, start.getHours() + this.totalDuration.hour,
      start.getMinutes() + this.totalDuration.minute);
    const event = this.createNewEvent(start, end, state, this.getOfficeForm.room.value?.timeZone, id);

    if (event) {
      let title;
      let content;
      const selectedEvent = this.events.at(eventData.index)?.get('event')?.value;
      const eventsOverlapping = eventData.getOverlapEvent(start, end, this.professionalId());
      if (eventsOverlapping?.length && eventsOverlapping[0] !== selectedEvent) {
        let message = '';
        eventsOverlapping.forEach(e => {
          message += `<div>${e.title}</div>`;
        });
        title = this.translate.instant('RESERVATION.EVENT.OVERLAPPING.TITLE');
        content = this.translate.instant('RESERVATION.EVENT.OVERLAPPING.CONTENT', { data: message });
      } else {
        if (!selectedEvent && !id) {
          title = this.translate.instant('RESERVATION.EVENT.TITLE');
          content = this.translate.instant('RESERVATION.EVENT.CONTENT', { date: start.toLocaleString(API_LOCALE) });
        } else {
          title = this.translate.instant('RESERVATION.EVENT.CHANGE.TITLE');
          content = this.translate.instant('RESERVATION.EVENT.CHANGE.CONTENT',
            { date: start.toLocaleString(API_LOCALE) });
        }
      }
      this.createSelectEvent(title, content, event, eventData);
    }
  };

  private createDate = (
    dateValue?: Date,
    startTime?: string,
  ): FormGroup<DateTimeForm> => this.formBuilder.group<DateTimeForm>({
    date: this.formBuilder.control(dateValue, {
      validators: [Validators.required],
    }),
    start: this.formBuilder.control(startTime || this.minDate),
  });

  private createEventForm = (): FormGroup => this.formBuilder.group({ event: ['', Validators.required] });

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
    let treatments = createBullet(treatment.name);
    treatments += this.additionalSelected().map(additional => createBullet(additional.name));

    const detail = this.translate.instant('RESERVATION.EVENT.DETAIL', {
      customerName: customer.displayName,
      professionalName: this.getOfficeForm.professional.value?.displayName,
      treatments,
    });

    const meta = new Meta(true, timeZone, undefined, undefined, this.getOfficeForm.professional.value?.id);
    meta.isReservation = true;
    const isDarkMode = this.isDarkMode();
    return newEvent(detail, findStateColor(state, isDarkMode), start, isDarkMode, end, id, meta, true);
  };

  private dateIsValid = (date: Date): boolean => isBetween(getNowTimeZone(), this.maxCalendarDate, date);

  private cleanTreatment = (): void => {
    if (!this.skip() && !this.reservationId) {
      this.price = new Price();
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
    const timeZone = room.timeZone;

    const { monday, tuesday, wednesday, thursday, friday, saturday, sunday, exclude } = getAvailability(room);
    this.weekendDays = exclude;
    const { min, max } = getStartEndDay(monday, tuesday, wednesday, thursday, friday, saturday, sunday, timeZone);
    this.day = new Day(min, max, getNowTimeZone(), exclude, 1);

    const unavailable = this.translate.instant('RESERVATION.EVENT.MESSAGE.UNAVAILABLE');
    const lunch = this.translate.instant('RESERVATION.EVENT.MESSAGE.LUNCH');
    const notWorking = this.translate.instant('RESERVATION.EVENT.MESSAGE.OUT_OF_WORK');

    eventData.recurringEvent?.addNotAvailableRecurring(eventData, unavailable, lunch, notWorking, sunday, saturday,
      friday, thursday, wednesday, tuesday, monday, this.isDarkMode(), timeZone);
  };

  private addReservations = (reservations: IReservationAll[]): CalendarEvent[] => reservations.map(it => {
    if (it.id !== this.reservationId) {
      if (it.treatment.duration) {
        if (it.timestamp >= dateToTimestamp()) {
          const timeZone = it.room.timeZone;
          const start = newDateTimestamp(it.timestamp);
          const duration = reservationDuration(it);
          const end = createNewDate(start, start.getHours() + duration.hour, start.getMinutes() + duration.minute);
          let treatments = createBullet(it.treatment.name);
          treatments += it.additional?.map(additional => createBullet(additional.name));

          const detail = this.translate.instant('RESERVATION.EVENT.DETAIL', {
            customerName: it.customer.displayName,
            professionalName: it.professional.displayName,
            treatments,
          });

          const isDarkMode = this.isDarkMode();
          const color = findStateColor(it.state, isDarkMode);
          const meta = new Meta(true, timeZone, undefined, undefined, it.professional.id);
          meta.isReservation = true;
          return newEvent(detail, color, start, isDarkMode, end, it.id, meta);
        }
      }
    }
    return undefined;
  }).filter((item): item is CalendarEvent => item !== undefined) ?? [];

  private addUnavailableList = (dataEvent: IDataEvent, unavailableList: IUnavailableAll[]) => {
    unavailableList.forEach(it => {
      if (it.duration || it.allDay) {
        const startDate = newDateTimestamp(it.timestamp, this.getOfficeForm.room.value?.timeZone);
        const start = it.allDay ? createNewDate(startDate) : startDate;
        const professionalId = it.professional.id;
        const title = this.translate.instant('RESERVATION.EVENT.UNAVAILABLE', {
          description: it.description ? it.description : '',
          professionalName: it.professional.displayName,
        });
        let path = 'unavailable/';
        if (it.type === 'BLOCK_AGENDA') {
          path += 'block-agenda/';
        }
        dataEvent.recurringEvent?.addFrequency(it.repeat, start, it.id, title, 'UNAVAILABLE', path,
          (date, recurring) => this.validateUnavailable(date, recurring, dataEvent),
          getDurationOrUndefined(it.duration), professionalId, it.allDay);
      }
    });
  };

  private validateUnavailable = (start: Date, recurring: any, dataEvent: IDataEvent): void => {
    const [startSearch, endSearch] = searchDates(recurring.allDay, start, recurring.duration);
    this.createUnavailableEvent(recurring, startSearch, endSearch, dataEvent);
  };

  private createUnavailableEvent = (recurring: any, start: Date, end: Date, dataEvent: IDataEvent): void => {
    const isDarkMode = this.isDarkMode();
    const color = findStateColor('DEFAULT', isDarkMode);
    const meta = new Meta(!recurring.allDay, this.getOfficeForm.room.value?.timeZone, undefined, undefined,
      recurring.professionalId);
    const event = newEvent(recurring.title, color, start, isDarkMode, end, recurring.path, meta);
    dataEvent.addEvent(event);
  };

  private createSelectEvent = (title: string, content: string, event: CalendarEvent, eventData: IDataEvent): void => {
    if (this.alreadyCreated) {
      this.createSelectedEvent(eventData, event);
      this.alreadyCreated = false;
    } else {
      const dialogRef = this.dialog.open(DialogComponent, {
        data: { title, content, value: event },
      });

      dialogRef.afterClosed().subscribe(result => {
        if (result) {
          this.createSelectedEvent(eventData, event);
        }
      });
    }
  };

  private createSelectedEvent = (eventData: IDataEvent, event: CalendarEvent): void => {
    const selectedEvent = this.getFormEventControls(eventData.index).event;
    if (selectedEvent?.value) {
      eventData.removeEvent(selectedEvent.value);
    }
    selectedEvent?.setValue(event);
    eventData.addEvent(event);
    this.refresh.next(event);
  };

  private filterCustomer = (name: string, customers?: IUserAll[]): IUserAll[] | undefined => customers?.filter(
    option => option.displayName?.toLowerCase().indexOf(name.toLowerCase()) === 0);

  private filterGroup = (name: string, groups?: IGroupService[]): IGroupService[] | undefined => groups?.filter(
    option => option.name?.toLowerCase().indexOf(name.toLowerCase()) === 0);

  private filterTreatment = (name: string, treatmentList?: IService[]): IService[] | undefined => treatmentList?.filter(
    option => option.name?.toLowerCase().indexOf(name.toLowerCase()) === 0);

  private filterOffice = (name: string, offices?: IOfficeAll[]): IOfficeAll[] | undefined => offices?.filter(
    option => option.name?.toLowerCase().indexOf(name.toLowerCase()) === 0);

  private filterRoom = (addressName: string, roomList?: IRoomAll[]): IRoomAll[] | undefined => roomList?.filter(
    option => option.address?.name?.toLowerCase().indexOf(addressName.toLowerCase()) === 0);

  private filterProfessional = (
    name: string,
    professionalList?: IUserAll[],
  ): IUserAll[] | undefined => professionalList?.filter(
    option => option.displayName?.toLowerCase().indexOf(name.toLowerCase()) === 0);

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

  private setData = (reservation: IReservationAll): void => {
    this.treatmentDiscount = reservation.treatment.discountCustomer;
    this.isPreview = false;
    const date = newDateTimestamp(reservation.timestamp, reservation.room.timeZone);
    this.professionalId.set(reservation.professional.id);
    this.roomId.set(reservation.room.id);
    this.getCustomerForm.customer.setValue(reservation.customer);
    this.treatmentId.set(reservation.treatment.key);
    // this.getTreatmentForm.group.setValue(reservation.treatment.group)
    const time = getTime(date, this.dateFormat);
    if (this.dateTimeList.controls?.length === 1) {
      const control = this.getFormDateTimeControls(0);
      const controlDate = control.date;
      if (!controlDate.value) {
        controlDate.setValue(date);
        control.start.setValue(time);
      } else {
        this.addDate(date, getTime(date, this.dateFormat));
      }
    } else {
      this.addDate(date, getTime(date, this.dateFormat));
    }
    this.price = getPrice(reservation);
    this.additionalSelected.set(reservation.additional ? reservation.additional
      .map(ad => Object.assign({}, ad, { id: ad.key })) : []);
    this.getConfigurationForm.note.setValue(reservation.note);
    if (reservation.configurationCanCustomerChange !== undefined || reservation.configurationReference) {
      this.getConfigurationForm.reference.setValue(reservation.configurationReference);
      this.getConfigurationForm.customerChange.setValue(reservation.configurationCanCustomerChange ?? false);
    }
    if (this.myStepper) {
      completeAndNext(this.steps, this.myStepper, true);
    }
  };

  private getRoomList = (customerId?: string): void => this.store.dispatch(
    getAllRooms({ customerId }));

  private getTreatmentList = (roomId?: string, customerId?: string): void => {
    if (roomId) {
      this.store.dispatch(getAllTreatments({ roomId, customerId }));
    }
  };

  private getAdditionalList = (roomId?: string, groupId?: string): void => {
    if (roomId && groupId) {
      this.store.dispatch(getAllAdditionalByGroupId({ roomId, groupId }));
    }
  };
}
