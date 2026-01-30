import { ChangeDetectionStrategy, Component, computed, effect, inject, signal, viewChild } from '@angular/core';
import { MatStepper } from '@angular/material/stepper';
import { combineLatestWith } from 'rxjs';
import { FormControl, FormGroup, NonNullableFormBuilder, Validators } from '@angular/forms';
import { requireMatch, valueChange } from '../../../util/validators';
import { IGroupService, IPrice, ITreatment, ITreatmentGroup, Price } from '../../../interfaces/treatment';
import { IRoom, IRoomAll, IService } from '../../../interfaces/room';
import {
  IAvailableDTO,
  IReservation,
  IReservationAll,
  IUpcomingAll,
  MAX_RESERVATION_CUSTOMER_MONTH,
  Reservation,
} from '../../../interfaces/reservation';
import {
  API_LOCALE,
  createNewDate,
  Duration,
  filterDateRoom,
  formatDateName,
  formatDateTwoDigit,
  formatFullDateTime,
  formatTime,
  getCurrentTimeZone,
  getNowTimeZone,
  getTime,
  IDuration,
  isSameTimeZone,
  localeTimeZoneDate,
  newDate,
  newDateTimestamp,
  plusMonthDate,
  totalDuration,
} from '../../../util/dates';
import { LangChangeEvent, TranslateService } from '@ngx-translate/core';
import { Store } from '@ngrx/store';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Router } from '@angular/router';
import {
  cleanReservation,
  createReservation,
  customerSearchReservation,
  getAllAdditionalByGroupId,
  getAllTreatments,
  getEditReservation,
  paymentOptions,
  updateReservationById,
} from '../../../store/reservation.actions';
import { map, startWith } from 'rxjs/operators';
import { STEPPER_GLOBAL_OPTIONS, StepperSelectionEvent } from '@angular/cdk/stepper';
import {
  createRoomOffice,
  createTreatmentGroupService,
  currencySymbol,
  getList,
  getPrice,
  newAdditional,
  newDiscount,
  newPercentage,
  newPrice,
  openDialog,
  removeDiscount,
  roomDetail,
  round,
} from '../../../util/helper';
import { DiscountType, IDiscount, IUserDiscount } from '../../../interfaces/discount';
import { transitionAnimation } from '../../../util/animation';
import { isEqual } from 'date-fns';
import { IAdditionalAll } from '../../../interfaces/additional';
import { MatListOption } from '@angular/material/list';
import { MatDatepicker } from '@angular/material/datepicker';
import { IOffice, IOfficeAll } from '../../../interfaces/office';
import { IStep, Step } from '../../../interfaces/step';
import { MatDialog } from '@angular/material/dialog';
import { Role } from '../../../interfaces/token';
import { IUser, IUserAll } from '../../../interfaces/user';
import {
  accountCredit,
  getPaymentOptions,
  getPayNlOptions,
  IPaymentOption,
  PaymentPercentage,
  PaymentType,
  PENALTY,
} from '../../../interfaces/payment';
import { AuthUserService } from '../../../services/auth-user.service';
import { Analytics, logEvent } from '@angular/fire/analytics';
import {
  completeAndNext,
  enableStep,
  getBackIndex,
  getStepCall,
  getStepCompleted,
  getStepEnabled,
  getStepName,
  getStepOptional,
} from '../../../util/step';
import { SharedModule } from '../../../shared/shared.module';
import { RoomNamePipe } from '../../../pipes/room-name.pipe';
import { SortByPipe } from '../../../pipes/sort-by.pipe';
import { CurrencySymbolPipe } from '../../../pipes/currency-symbol.pipe';
import { DurationTimePipe } from '../../../pipes/durationTime.pipe';
import { PriceComponent } from '../../../shared/price/price.component';
import { PricePreviewComponent } from '../../../shared/price-preview/price-preview.component';
import { PaymentPreviewComponent } from '../../../shared/payment-preview/payment-preview.component';
import { GoogleMapComponent } from '../../../shared/google-map/google-map.component';
import { BackButtonDirective } from '../../../directives/back-button.directive';
import { NgxMaterialIntlTelInputComponent } from 'ngx-material-intl-tel-input';
import {
  getAdditionalListPipe,
  getAvailableListPipe,
  getCurrentReservationIdPipe,
  getCustomerReservationPipe,
  getMeNavigationParamsPipe,
  getPaymentOptionsPipe,
  getRoomsPipe,
  getSelectedReservationPipe,
  getSubErrorsPipe,
  getTreatmentDiscountPipe,
} from '../../../store/selectors/reservation.selectors';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { ToastService } from '../../../services/toast.service';
import { IError } from '../../../interfaces/common';
import { ReservationState } from '../../../store/reducers/reservation.reducers';
import { BankForm } from '../../../shared/bank/bank.component';

const MAX_UPCOMING_RESERVATION = 10;

type OfficeForm = {
  room: FormControl<IRoomAll | undefined>;
  professional: FormControl<IUserAll | undefined>;
  office: FormControl<IOfficeAll | undefined>;
};

type TreatmentForm = {
  treatment: FormControl<IService | undefined>;
  discount: FormControl<string | undefined>;
  startDate: FormControl<Date | undefined>;
  group: FormControl<IGroupService | undefined>;
};

type EventForm = {
  event: FormControl<Date | undefined>;
};

type AcceptForm = {
  accept: FormControl<boolean>;
  phone: FormControl<string | undefined>;
};

type ReservationForms = {
  officeForm: FormGroup<OfficeForm>;
  treatmentForm: FormGroup<TreatmentForm>;
  eventGroup: FormGroup<EventForm>;
  typeForm: FormGroup<BankForm>;
  acceptForm: FormGroup<AcceptForm>;
};

type AvailabilityData = { time: string; date: Date }

@Component({
  selector: 'app-me-reservation',
  animations: [transitionAnimation],
  templateUrl: './me-reservation.component.html',
  styleUrls: ['./me-reservation.component.scss'],
  imports: [SharedModule, RoomNamePipe, SortByPipe, CurrencySymbolPipe, DurationTimePipe, PriceComponent,
    PricePreviewComponent, PaymentPreviewComponent, NgxMaterialIntlTelInputComponent, GoogleMapComponent,
    BackButtonDirective],
  providers: [{
    provide: STEPPER_GLOBAL_OPTIONS, useValue: { displayDefaultIndicatorType: false },
  }],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MeReservationComponent {
  private readonly translate: TranslateService = inject(TranslateService);
  private readonly toastService: ToastService = inject(ToastService);
  private readonly store: Store<ReservationState> = inject(Store<ReservationState>);
  private readonly formBuilder: NonNullableFormBuilder = inject(NonNullableFormBuilder);
  private readonly breakpointObserver: BreakpointObserver = inject(BreakpointObserver);
  private readonly router: Router = inject(Router);
  private readonly dialog: MatDialog = inject(MatDialog);
  private readonly analytic: Analytics = inject(Analytics);
  private readonly authUserService: AuthUserService = inject(AuthUserService);

  private navigationParams$ = this.store.pipe(getMeNavigationParamsPipe);
  private reservationId$ = this.store.pipe(getCurrentReservationIdPipe);
  private additionalList$ = this.store.pipe(getAdditionalListPipe);
  private treatmentDiscount$ = this.store.pipe(getTreatmentDiscountPipe);
  private rooms$ = this.store.pipe(getRoomsPipe);
  private selectedReservation$ = this.store.pipe(getSelectedReservationPipe);
  private customerReservation$ = this.store.pipe(getCustomerReservationPipe);
  private availableList$ = this.store.pipe(getAvailableListPipe);
  private paymentOptions$ = this.store.pipe(getPaymentOptionsPipe);
  private subErrors$ = this.store.pipe(getSubErrorsPipe);

  private breakpointObserver$ = this.breakpointObserver.observe([Breakpoints.XSmall, Breakpoints.Small]);

  private navigationParams = toSignal(this.navigationParams$);
  private reservationIdSignal = toSignal(this.reservationId$);
  private treatmentDiscountSignal = toSignal(this.treatmentDiscount$);
  private roomsSignal = toSignal(this.rooms$);
  private selectedReservationSignal = toSignal(this.selectedReservation$);
  private customerReservationSignal = toSignal(this.customerReservation$);
  private availableListSignal = toSignal(this.availableList$);
  private paymentOptionsSignal = toSignal(this.paymentOptions$);
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
  private langChangeSignal = toSignal<LangChangeEvent>(this.translate.onLangChange, {
    initialValue: undefined,
  });

  additionalListSignal = toSignal(this.additionalList$);

  labels = computed(() => {
    this.langChangeSignal();
    const phoneTranslations = this.translate.instant('COMMON.USER.PHONE');

    return {
      mainLabel: '',
      codePlaceholder: '',
      searchPlaceholderLabel: phoneTranslations.SEARCH || '',
      noEntriesFoundLabel: phoneTranslations.COUNTRY_NOT_FOUND || '',
      nationalNumberLabel: phoneTranslations.FIELD || '',
      hintLabel: '',
      invalidNumberError: phoneTranslations.INVALID || '',
      requiredError: phoneTranslations.REQUIRED || '',
    };
  });

  private stepper = viewChild.required<MatStepper>('stepper');
  private picker = viewChild.required<MatDatepicker<Date>>('picker');

  errors = signal<Record<string, unknown>>({});

  treatmentForm: FormGroup<TreatmentForm> = this.formBuilder.group<TreatmentForm>({
    treatment: this.formBuilder.control(undefined, {
      validators: [Validators.required, requireMatch],
    }),
    discount: this.formBuilder.control(undefined),
    startDate: this.formBuilder.control(undefined, {
      validators: [Validators.required],
    }),
    group: this.formBuilder.control(undefined, {
      validators: [Validators.required, requireMatch],
    }),
  });

  eventGroup: FormGroup<EventForm> = this.formBuilder.group<EventForm>({
    event: this.formBuilder.control(undefined, {
      validators: [Validators.required],
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
      validators: [Validators.required, requireMatch],
    }),
  });

  typeForm: FormGroup<BankForm> = this.formBuilder.group<BankForm>({
    type: this.formBuilder.control(undefined),
    bank: this.formBuilder.control(undefined),
    percentage: this.formBuilder.control(undefined),
  });

  acceptForm: FormGroup<AcceptForm> = this.formBuilder.group<AcceptForm>({
    accept: this.formBuilder.control(false, {
      validators: [Validators.required],
    }),
    phone: this.formBuilder.control(undefined, {
      validators: [Validators.required],
    }),
  });

  form = this.formBuilder.group({
    officeForm: this.officeForm,
    treatmentForm: this.treatmentForm,
    eventGroup: this.eventGroup,
    typeForm: this.typeForm,
    acceptForm: this.acceptForm,
  });

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

  discounts = computed(() => {
    return this.treatmentDiscountSignal()?.discounts.map((ud: IUserDiscount) => {
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
    });
  });
  showDiscount = false;
  price: IPrice = new Price();
  oldPrice?: IPrice;

  private selectOfficeSignal = toSignal(this.getOfficeForm.office.valueChanges);
  private selectRoomSignal = toSignal(this.getOfficeForm.room.valueChanges);
  private selectGroupSignal = toSignal(this.getTreatmentForm.group.valueChanges);
  private selectTreatmentSignal = toSignal(this.getTreatmentForm.treatment.valueChanges);
  private selectDiscountSignal = toSignal(this.getTreatmentForm.discount.valueChanges);

  private reservation?: IUpcomingAll;
  private measure = 'long';
  private duration: IDuration = new Duration();
  private time: any;
  private roomId?: string;
  private professionalId?: string;
  private customerId = computed(() => this.authUserSignal()?.customerId);
  private treatmentId?: string;
  private reservationMonths = MAX_RESERVATION_CUSTOMER_MONTH;
  private steps: IStep[];
  private dismiss = false;
  private treatmentDiscount?: IDiscount;
  private readonly language: string = this.translate.getCurrentLang();

  smallScreen = computed(() => this.breakpointsSignal()?.matches);

  options = signal<IPaymentOption[] | undefined>(undefined);
  additionalSelected = signal<IAdditionalAll[]>([]);

  accountCreditOptions: IPaymentOption[] = accountCredit(this.translate.instant('COMMON.PAYMENT.TYPE.ACCOUNT'));
  availableList = computed(() => {
    const availableList = this.availableListSignal();
    if (availableList?.length) {
      const map = new Map<string, AvailabilityData[]>();
      const startDate = this.getTreatmentForm.startDate.value;
      if (startDate) {
        map.set(createNewDate(startDate).toString(), []);
      }
      availableList.reduce((group: Map<string, AvailabilityData[]>, item: IAvailableDTO) => {
        const date = newDateTimestamp(item.dateTime);
        const key = createNewDate(date).toString();

        let dates: any = group.get(key) || [];
        dates = [...dates, { time: getTime(date, this.dateFormat), date }];
        group.set(key, dates);

        return group;
      }, map);
      return map;
    }
    return new Map<string, AvailabilityData[]>();
  });
  selectedIndex = 1;
  isPreview = false;
  isPayment = false;
  dateFormat: string = this.translate.getCurrentLang();

  isEditing = false;
  canCreate = true;
  firstTime = false;
  balance = 0;
  distance?: string;
  minDate: Date = getNowTimeZone();
  maxDate: Date = plusMonthDate(this.minDate, this.reservationMonths, this.minDate.getDate() + 1);
  maxDateFormat: string = formatDateTwoDigit(this.maxDate, this.dateFormat);
  date?: Date;
  endDate?: Date;
  totalDurationFormatted?: string;
  reservationId?: string;
  showPenalty = false;
  penalty = PENALTY;

  constructor() {
    const preview = new Step(5, 'preview', () => this.create());
    const payment = new Step(4, 'payment', () => this.callStepSix, preview);
    const book = new Step(3, 'book_online', () => this.callStepFive, payment);
    const additional = new Step(2, 'post_add', () => this.callStepFour, book, true, false);
    const treatment = new Step(1, 'spa', () => this.callStepThree, additional);
    const room = new Step(0, 'room', () => this.callStepTwo, treatment);
    this.steps = [room, treatment, additional, book, payment, preview];

    effect(() => {
      const params = this.navigationParams();
      this.treatmentId = params?.treatmentId;
      this.roomId = params?.roomId;
      this.professionalId = params?.professionalId;
      if (params?.date) {
        this.getTreatmentForm.startDate.setValue(params.date);
      }
      if (params?.discountId) {
        this.showDiscount = true;
        this.getTreatmentForm.discount.setValue(params.discountId);
      }
    });

    effect(() => {
      const reservationId = this.reservationIdSignal();
      if (reservationId) {
        logEvent(this.analytic, 'screen_view', {
          // eslint-disable-next-line camelcase
          firebase_screen: `Edit customer reservation ${reservationId}`,
          // eslint-disable-next-line camelcase
          firebase_screen_class: 'MeReservationComponent',
        });
        this.reservationId = reservationId;
        this.isEditing = true;
        this.steps = this.steps.map(value => {
          switch (value.order) {
            case 0:
              value.enable = false;
              value.completed = true;
              return value;
            default:
              return value;
          }
        });
        this.store.dispatch(getEditReservation({ id: reservationId }));
      }
    });

    effect(() => {
      const office = this.selectOfficeSignal();
      if (!office) {
        return;
      }
      this.roomList.set(office.rooms);
      const room = getList(office.rooms, this.roomId);
      this.getOfficeForm.room.setValue(room);
    });

    effect(() => {
      const room = this.selectRoomSignal();
      this.roomId = room?.id;
      if (room) {
        if (!this.dismiss && !isSameTimeZone(room.timeZone)) {
          const now = getNowTimeZone();
          const localDate = localeTimeZoneDate(this.translate.getCurrentLang(), now);
          const timeZoneDate = localeTimeZoneDate(this.translate.getCurrentLang(), now, room.timeZone);
          const warning = this.translate.instant('COMMON.TIME_ZONE.WARNING');
          const localDateLabel = this.translate.instant('COMMON.TIME_ZONE.DATE.LOCAL', { date: localDate });
          const roomDateLabel = this.translate.instant('COMMON.TIME_ZONE.DATE.ROOM', { date: timeZoneDate });
          const message = `${warning} - ${localDateLabel} / ${roomDateLabel}`;
          const toastRef = this.toastService.show(message, 'warning', 0, { actionType: 'button' });
          toastRef.onAction().subscribe(() => {
            this.dismiss = true;
          });
        }
        this.professionalList.set(room.professionals);
        const professional = getList(room.professionals, this.professionalId);
        this.getOfficeForm.professional.setValue(professional);
        this.professionalId = professional?.id;
      }
      this.getTreatmentForm.group.setValue(undefined);
      this.cleanTreatment();
    });

    effect(() => {
      const group = this.selectGroupSignal();
      if (!group) {
        return;
      }
      this.treatmentList.set(group.treatments);
      const treatment = getList(group.treatments, this.treatmentId);
      this.getTreatmentForm.treatment.setValue(treatment);
    });

    effect(() => {
      const treatment = this.selectTreatmentSignal();
      this.treatmentId = treatment?.id;
      if (treatment) {
        this.price = newPrice(this.price, treatment.price, this.treatmentDiscount);
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
        }
      } else {
        this.treatmentDiscount = undefined;
        this.price = removeDiscount(this.price);
      }
    });

    effect(() => {
      const additionalList = this.additionalListSignal();
      if (additionalList && additionalList.length) {
        enableStep(this.steps, 'post_add');
        const additionalSelected = this.additionalSelected();
        if (additionalSelected?.length) {
          const selectIds = additionalSelected?.map(value => value.id);
          const newList = additionalList.filter(al => selectIds.includes(al.id));
          if (newList.length !== additionalSelected.length) {
            this.additionalSelected.set(newList);
            this.price = newAdditional(this.price, additionalSelected, this.reservation?.treatment?.discountCustomer);
          }
        }
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
      const groups = this.groups();
      if (groups && this.treatmentId && !this.getTreatmentForm.group.value) {
        this.getTreatmentForm.group.setValue(
          groups?.find(group => group.treatments?.find(p => p.id === this.treatmentId) ? group : undefined));
        if (this.reservation) {
          this.datePicker?.open();
        }
      }
    });

    effect(() => {
      const offices = this.offices();
      if (offices && offices.length === 1) {
        this.getOfficeForm.office.setValue(offices[0]);
      }
    });

    effect(() => {
      const reservation = this.selectedReservationSignal();
      if (reservation) {
        if (reservation.paymentRequired) {
          const message = this.translate.instant('ME.RESERVATION.UPCOMING.ERROR.PAYMENT');
          this.canNotContinue(message, 'update');
        } else {
          this.setData(reservation);
        }
        if (!reservation.canEdit) {
          this.firstTime = true;
          this.getTypeForm.type.setValidators([Validators.required]);
          this.getTypeForm.type.updateValueAndValidity();
        }
      }
    });

    effect(() => {
      const customerReservation = this.customerReservationSignal();
      if (customerReservation?.upcoming && customerReservation.upcoming.length >=
        MAX_UPCOMING_RESERVATION) {
        const dates = customerReservation.upcoming.map((upcoming: IReservationAll) => formatFullDateTime(
          newDateTimestamp(upcoming.timestamp, upcoming.room.timeZone), this.translate.getCurrentLang()));
        const message = this.translate.instant('ME.RESERVATION.UPCOMING.ERROR.CUSTOMER',
          { date1: dates[0], date2: dates[1], date3: dates[2] });
        this.canNotContinue(message, 'create');
      } else {
        this.canCreate = true;
        this.balance = customerReservation?.balance || 0;
        this.price = this.price.withBalance(customerReservation?.balance);
        this.getAcceptForm.phone.setValue(customerReservation?.phone || this.reservation?.customer?.phone);
        if (customerReservation?.isFirstTime) {
          this.firstTime = true;
          this.getTypeForm.type.setValidators([Validators.required]);
          this.getTypeForm.type.updateValueAndValidity();
        }
      }
    });

    effect(() => {
      const availableList = this.availableListSignal();
      if (availableList) {
        this.setSelectedIndex();
        if (this.price.isPaid) {
          this.firstTime = false;
          this.getTypeForm.type.clearValidators();
          this.getTypeForm.type.updateValueAndValidity();
        }
      }
    });

    effect(() => {
      const paymentOptions = this.paymentOptionsSignal();
      if (paymentOptions) {
        this.options.set(getPayNlOptions(paymentOptions));
      }
    });

    effect(() => {
      const subErrors = this.subErrorsSignal();
      if (subErrors) {
        const errorMap: Record<string, unknown> = {};
        subErrors.forEach((error: IError) => {
          switch (error.field) {
            case 'startDate':
              this.myStepper.selectedIndex = 1;
              break;
            default:
              this.myStepper.selectedIndex = 0;
              break;
          }

          const field = error.field as keyof ReservationForms | undefined;
          if (field && field in this.form.controls) {
            errorMap[field] = error.message;
            this.form.controls[field].setErrors({ incorrect: true });
            if (field in this.getTreatmentForm) {
              this.treatmentForm.controls[field as keyof TreatmentForm]?.setErrors({ incorrect: true });
            }
          }
        });
        this.errors.set(errorMap);
      }
    });
  }

  private get myStepper() {
    return this.stepper();
  }

  private get datePicker() {
    return this.picker();
  }

  get professionalName(): string {
    const professional = this.getOfficeForm.professional.value;
    if (!professional) {
      return '';
    }
    return professional.displayName;
  }

  get roomDetail(): string {
    const room = this.getOfficeForm.room.value;
    if (!room) {
      return '';
    }
    return roomDetail(room);
  }

  get room() {
    return this.getOfficeForm.room.value;
  }

  get treatment() {
    return this.getTreatmentForm.treatment.value;
  }

  get addressName() {
    return this.room?.address?.name;
  }

  get addressDescription() {
    return this.room?.address?.description;
  }

  get showTimeZone(): boolean {
    return !isSameTimeZone(this.room?.timeZone);
  }

  get getTreatmentForm(): TreatmentForm {
    return this.treatmentForm.controls;
  }

  get getOfficeForm(): OfficeForm {
    return this.officeForm.controls;
  }

  get getEventForm(): EventForm {
    return this.eventGroup.controls;
  }

  get getAcceptForm(): AcceptForm {
    return this.acceptForm.controls;
  }

  get getTypeForm(): BankForm {
    return this.typeForm.controls;
  }

  back(): void {
    if (this.isPreview) {
      this.isPreview = false;
    }
    if (this.isPayment) {
      this.isPayment = false;
    } else {
      this.getEventForm.event.setValue(undefined);
    }
    this.myStepper.selectedIndex = getBackIndex(this.steps, this.myStepper.selectedIndex);
  }

  create(): void {
    if (this.acceptForm.invalid) {
      return;
    }
    const reservation: IReservation = new Reservation();
    reservation.customerId = this.customerId();
    reservation.roomId = this.getOfficeForm.room.value?.id;
    reservation.professionalId = this.getOfficeForm.professional.value?.id;
    if (this.date) {
      reservation.start = this.date.toLocaleString(API_LOCALE);
      reservation.timeZone = getCurrentTimeZone();
    }
    reservation.additionalIds = this.additionalSelected()?.map(value => value.id);
    reservation.phone = this.getAcceptForm.phone.value;

    const role = Role.customer;
    const option = this.getTypeForm.type?.value;
    // TODO validate if not first time and option empty firstTime
    if (option && option.type !== PaymentType.account) {
      const type = option.type;
      const paymentOptionId = option.bic;
      const percentage = this.getTypeForm.percentage?.value || PaymentPercentage.total;

      reservation.payment = { type, paymentOptionId, percentage, bic: undefined };
      if (option.subTypes.length) {
        reservation.payment.bic = this.getTypeForm.bank.value?.bic;
      }
    }
    if (this.isEditing && this.reservation) {
      reservation.id = this.reservation.id;
      reservation.treatmentId = valueChange(this.getTreatmentForm.treatment.value?.id, this.reservation.treatment.id);

      this.store.dispatch(updateReservationById({ id: this.reservation.id, reservation, role }));
    } else {
      reservation.treatmentId = this.getTreatmentForm.treatment.value?.id;
      reservation.discountId = this.getTreatmentForm.discount.value;
      this.store.dispatch(createReservation({ reservation, role }));
    }
  }

  triggerClick = (event: StepperSelectionEvent): void => getStepCall(this.steps, event.selectedIndex - 1);

  callStepTwo = (goNext: boolean): void => {
    if (this.officeForm.invalid || !this.room) {
      return;
    }
    this.isPreview = false;
    this.professionalId = this.getOfficeForm.professional.value?.id;
    this.roomId = this.room.id;
    this.setTypes();
    this.getTreatmentList(this.room.id);
    completeAndNext(this.steps, this.myStepper, goNext, this.analytic);
  };

  callStepThree = (goNext: boolean): void => {
    if (this.treatmentForm.invalid) {
      return;
    }
    this.isPreview = false;
    this.treatmentId = this.getTreatmentForm.treatment.value?.id;
    this.getAdditionalList();
    completeAndNext(this.steps, this.myStepper, goNext, this.analytic);
  };

  callStepFour = (goNext: boolean): void => {
    if (this.treatmentForm.invalid) {
      return;
    }
    const treatment = this.getTreatmentForm.treatment.value!;
    const room = this.getOfficeForm.room.value!;
    const startDate = this.getTreatmentForm.startDate.value!;
    const professional = this.getOfficeForm.professional.value!;
    this.isPreview = false;
    if (this.getEventForm.event.value !== startDate) {
      this.getEventForm.event.setValue(undefined);
      this.time = undefined;
    }
    const additionalSelected = this.additionalSelected();
    const duration = totalDuration(treatment, additionalSelected);
    this.totalDurationFormatted = formatTime(duration.duration, room.timeZone, this.dateFormat);

    this.store.dispatch(
      customerSearchReservation({
        roomId: room.id,
        treatmentId: treatment.id,
        date: startDate,
        professionalId: professional.id,
        additionalIds: additionalSelected?.map(additional => additional.id),
      }),
    );
    completeAndNext(this.steps, this.myStepper, goNext, this.analytic);
  };

  callStepFive = (goNext: boolean): void => {
    if (this.eventGroup.invalid) {
      this.errors.update(prev => ({ ...prev, schedule: true }));
    }

    this.date = newDate(this.getEventForm.event.value!);
    this.endDate = createNewDate(this.date, this.date.getHours() + this.duration.hour,
      this.date.getMinutes() + this.duration.minute);

    this.isPayment = true;
    completeAndNext(this.steps, this.myStepper, goNext, this.analytic);
  };

  callStepSix = (goNext: boolean): void => {
    if (this.typeForm.invalid) {
      return;
    }

    this.isPreview = true;
    completeAndNext(this.steps, this.myStepper, goNext, this.analytic);
  };

  getStepName = (index: number): string => getStepName(this.steps, index);

  getStepEnabled = (index: number): boolean => getStepEnabled(this.steps, index);

  getStepCompleted = (index: number): boolean => getStepCompleted(this.steps, index);

  getStepOptional = (index: number): boolean => getStepOptional(this.steps, index);

  openDialog = (reservationDate?: Date): void => openDialog(
    this.room!, this.dateFormat, this.translate, this.dialog, reservationDate,
  );

  myFilter = (d: Date | null): boolean => filterDateRoom(d, this.getOfficeForm.room.value);

  displayFnGroup = (group: ITreatmentGroup): string => group ? `${group.name}` : '';

  displayFnTreatment = (treatment: ITreatment): string => treatment ? `${treatment.name}` : '';

  displayFnOffice = (office: IOffice): string => office ? `${office.name}` : '';

  displayFnRoom = (room: IRoom): string => room.address ? room.address.name : '';

  displayFnProfessional = (professional: IUser): string => professional?.displayName ? professional.displayName : '';

  dateNoContent = (date?: Date): string => formatDateName(
    createNewDate(date ? date : this.getTreatmentForm.startDate.value!), this.translate.getCurrentLang(), this.measure,
  );

  selectDate = (datetime: AvailabilityData): void => {
    this.getEventForm.event.setValue(datetime.date);
    this.time = datetime.time;
  };

  areEquals = (datetime: AvailabilityData): boolean => {
    let result = false;
    if (this.getEventForm.event.value) {
      result = isEqual(this.getEventForm.event.value, datetime.date) && this.time === datetime.time;
    }
    return result;
  };

  sortDate = (a: { key: string }, b: { key: string }): number => newDate(a.key).getTime() - newDate(b.key).getTime();

  formatKey = (key: string): string => {
    const date = newDate(key);
    const formattedDate = this.smallScreen() ? formatDateTwoDigit(date, this.translate.getCurrentLang())
      : formatDateName(date, this.translate.getCurrentLang(), this.measure);

    return formattedDate.charAt(0).toUpperCase() + formattedDate.slice(1);
  };

  sortTime = (data: AvailabilityData[]): AvailabilityData[] => data.sort(
    (a: AvailabilityData, b: AvailabilityData) => newDate(a.date).getTime() -
      newDate(b.date).getTime());

  setDistance = ($event: number): void => {
    this.distance = $event > 999 ?
      this.translate.instant('ME.RESERVATION.ROOM.ADDRESS.DISTANCE.KM',
        { distance: round($event / 1000) }) :
      this.translate.instant('ME.RESERVATION.ROOM.ADDRESS.DISTANCE.M',
        { distance: round($event) });
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
  };

  keyDownOffice = (event: KeyboardEvent): void => {
    this.roomList.set(undefined);
    this.keyDownHandler(event, this.getOfficeForm.room);
    this.keyDownHandler(event, this.getOfficeForm.office);
  };

  onChange = (options: MatListOption[]): void => {
    const additionalSelected = options.map(o => o.value);
    this.additionalSelected.set(additionalSelected);
    this.price = newAdditional(this.price, additionalSelected, this.treatmentDiscount);
  };

  isSelected = (it: IAdditionalAll): boolean => this.additionalSelected().filter(el => el.id === it.id).length > 0;

  getPercentage = (percentage: number): void => {
    this.price = newPercentage(this.price, percentage);
  };

  private getTreatmentList = (roomId: string): void => {
    this.store.dispatch(getAllTreatments({ roomId }));
  };

  private getAdditionalList = (): void => {
    const roomId = this.getOfficeForm.room.value!.id;
    const groupId = this.getTreatmentForm.group.value!.id;
    this.store.dispatch(getAllAdditionalByGroupId({ roomId, groupId }));
  };

  private canNotContinue = (message: string, type: string): void => {
    logEvent(this.analytic, 'screen_view', {
      // eslint-disable-next-line camelcase
      firebase_screen: `Customer cannot ${type} a reservation`,
      // eslint-disable-next-line camelcase
      firebase_screen_class: 'MeReservationComponent',
    });
    this.canCreate = false;
    const toastRef = this.toastService.show(message, 'error', 5000);
    toastRef.onDismiss().subscribe(() => {
      this.store.dispatch(cleanReservation());
      this.router.navigate([this.language, 'me', 'reservations']);
    });
  };

  private setSelectedIndex = (): void => {
    let i = 0;
    const date = this.getTreatmentForm.startDate.value;
    if (!date) {
      return;
    }
    new Map([...this.availableList().entries()]
      .sort((a: any, b: any) => this.sortDate({ key: a[0] }, { key: b[0] })))
      .forEach((value, key) => {
        if (isEqual(date, newDate(key))) {
          this.selectedIndex = i;
        }
        i++;
      });
  };

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

  private setData = (reservation: IUpcomingAll): void => {
    this.reservation = reservation;
    this.isPreview = false;
    const date = newDateTimestamp(reservation.timestamp, this.reservation.room.timeZone);
    this.getEventForm.event.setValue(date);
    this.time = getTime(date, this.dateFormat);
    this.getOfficeForm.room.setValue(reservation.room);
    this.getOfficeForm.professional.setValue(reservation.professional);
    this.getTreatmentForm.startDate.setValue(date);
    this.price = getPrice(this.reservation, this.reservation?.payments);
    this.additionalSelected.set(this.reservation.additional ? this.reservation.additional
      .map(ad => Object.assign({}, ad, { id: ad.key })) : []);
    this.treatmentId = reservation.treatment.key;
    const roomId = reservation.room.id;
    this.roomId = roomId;
    this.professionalId = reservation.professional.id;
    if (this.isEditing) {
      if (!this.reservation.canEdit && this.price.totalPaid < this.price.penalty) {
        this.oldPrice = this.price;
        this.showPenalty = true;
        this.getTypeForm.type.setValidators([Validators.required]);
        this.getTypeForm.type.updateValueAndValidity();
        this.firstTime = true;
        this.setTypes();
      } else {
        enableStep(this.steps, 'payment', false);
      }
      this.getTreatmentList(roomId);
    }
    completeAndNext(this.steps, this.myStepper, true, this.analytic);
  };

  private setTypes = (): void => {
    const types = this.getOfficeForm.room.value?.paymentTypes.filter(
      (p: PaymentType) => ![PaymentType.cash, PaymentType.transfer].includes(p));
    if (types?.includes(PaymentType.paynl)) {
      this.getOptions();
    } else {
      this.options.set(getPaymentOptions(this.translate, types));
    }
  };

  private cleanTreatment = (): void => {
    this.price = new Price();
    this.getTreatmentForm.treatment.setValue(undefined);
    this.treatmentList.set(undefined);
    this.getEventForm.event.setValue(undefined);
  };

  private getOptions = (): void => this.store.dispatch(paymentOptions());
}
