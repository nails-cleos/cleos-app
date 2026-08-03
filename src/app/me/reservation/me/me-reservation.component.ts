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
  viewChild,
  viewChildren,
} from '@angular/core';
import { combineLatestWith } from 'rxjs';
import { FormControl, FormGroup, NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { requireMatch } from '../../../util/validators';
import { IGroupService, IPrice, ITreatment, ITreatmentGroup, Price } from '../../../treatment/treatment';
import { IRoom, IRoomAll, IService } from '../../../room/room';
import {
  IAvailableDTO,
  IReservation,
  IReservationAll,
  IUpcomingAll,
  MAX_RESERVATION_CUSTOMER_MONTH,
  Reservation,
} from '../../../reservation/reservation';
import {
  createNewDate,
  Duration,
  filterDateRoom,
  formatDateName,
  formatDateTwoDigit,
  formatFullDateTime,
  formatTime,
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
import { LangChangeEvent, TranslatePipe, TranslateService } from '@ngx-translate/core';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { map, startWith } from 'rxjs/operators';
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
import { DiscountType, IDiscount, IUserDiscount } from '../../../discount/discount';
import { isEqual } from 'date-fns';
import { IAdditionalAll } from '../../../additional/additional';
import { MatDivider, MatListOption, MatSelectionList } from '@angular/material/list';
import { MatDatepicker, MatDatepickerInput, MatDatepickerToggle } from '@angular/material/datepicker';
import { IOffice, IOfficeAll } from '../../../office/office';
import { MatDialog } from '@angular/material/dialog';
import { Role } from '../../../interfaces/token';
import { IUser, IUserAll } from '../../../user/user';
import { IPaymentOption, PaymentPercentage, PENALTY } from '../../../interfaces/payment';
import { AuthUserService } from '../../../services/auth-user.service';
import { enableStep, getBackIndex, getIndex, IStep, Step } from '../../../util/step';
import { RoomNamePipe } from '../../../pipes/room-name.pipe';
import { SortByPipe } from '../../../pipes/sort-by.pipe';
import { CurrencySymbolPipe } from '../../../pipes/currency-symbol.pipe';
import { DurationTimePipe } from '../../../pipes/durationTime.pipe';
import { PriceComponent } from '../../../shared/price/price.component';
import { PaymentPreviewComponent } from '../../../shared/payment-preview/payment-preview.component';
import { GoogleMapComponent } from '../../../shared/google-map/google-map.component';
import { BackButtonDirective } from '../../../directives/back-button.directive';
import { NgxMaterialIntlTelInputComponent } from 'ngx-material-intl-tel-input';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { ToastService } from '../../../services/toast.service';
import { IError } from '../../../interfaces/common';
import { BankForm } from '../../../shared/bank/bank.component';
import { FirebaseService } from '../../../services/firebase.service';
import {
  createMeReservationErrors,
  MeReservationAcceptForm,
  MeReservationErrors,
  MeReservationEventForm,
  MeReservationFormField,
  MeReservationForms,
  MeReservationTreatmentForm,
  OfficeForm,
} from '../../../reservation/reservation-form.types';
import { ReservationFormErrorService } from '../../../reservation/reservation-form-error.service';
import { MatError, MatFormField, MatInput, MatLabel } from '@angular/material/input';
import { MatSuffix } from '@angular/material/form-field';
import { MatSelect } from '@angular/material/select';
import { MatOption } from '@angular/material/core';
import { MatIcon } from '@angular/material/icon';
import { MatButton, MatIconButton } from '@angular/material/button';
import { DatePipe, DecimalPipe, KeyValuePipe, NgTemplateOutlet } from '@angular/common';
import { MatAutocomplete, MatAutocompleteTrigger } from '@angular/material/autocomplete';
import { MatCard, MatCardContent } from '@angular/material/card';
import { MatTab, MatTabGroup } from '@angular/material/tabs';
import { MatCheckbox } from '@angular/material/checkbox';
import { NavigationService } from '../../../services/navigation.service';
import { TreatmentStore } from '../../../store/treatment.store';
import { AdditionalStore } from '../../../store/additional.store';
import { PaymentStore } from '../../../store/payment.store';
import { ReservationStore } from '../../../store/reservation.store';
import { MeReservationParams } from '../../../util/models/reservation.models';

const MAX_UPCOMING_RESERVATION = 10;

type AvailabilityData = { time: string; date: Date }

const ME_RESERVATION_ERROR_FIELDS = [
  'room',
  'professional',
  'office',
  'treatment',
  'discount',
  'startDate',
  'group',
  'event',
  'option',
  'percentage',
  'accept',
  'phone',
] as const satisfies readonly MeReservationFormField[];

@Component({
  selector: 'app-me-reservation',
  templateUrl: './me-reservation.component.html',
  imports: [MatFormField, MatLabel, MatInput, MatDatepickerInput, MatDatepickerToggle, MatDatepicker, MatSelect,
    MatOption, MatIcon, MatIconButton, MatButton, ReactiveFormsModule, TranslatePipe, KeyValuePipe, DecimalPipe,
    NgTemplateOutlet, DatePipe, MatAutocomplete, MatError, MatAutocompleteTrigger, BackButtonDirective,
    CurrencySymbolPipe, MatCard, MatCardContent, RoomNamePipe, SortByPipe, CurrencySymbolPipe, DurationTimePipe,
    PriceComponent, PaymentPreviewComponent, NgxMaterialIntlTelInputComponent, GoogleMapComponent, BackButtonDirective,
    MatSelectionList, MatListOption, MatDivider, MatTabGroup, MatTab, MatCheckbox, MatSuffix],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MeReservationComponent {
  id = input<string>();
  rooms = input<IRoomAll[]>();
  params = input<MeReservationParams>();

  submitData = output<{ reservation: IReservation; role: Role }>();

  private readonly translateService: TranslateService = inject(TranslateService);
  private readonly toastService: ToastService = inject(ToastService);
  private readonly reservationStore = inject(ReservationStore);
  private readonly treatmentStore = inject(TreatmentStore);
  private readonly additionalStore = inject(AdditionalStore);
  private readonly paymentStore = inject(PaymentStore);
  private readonly formBuilder: NonNullableFormBuilder = inject(NonNullableFormBuilder);
  private readonly breakpointObserver: BreakpointObserver = inject(BreakpointObserver);
  private readonly navigationService: NavigationService = inject(NavigationService);
  private readonly dialog: MatDialog = inject(MatDialog);
  private readonly authUserService: AuthUserService = inject(AuthUserService);
  private readonly firebaseService = inject(FirebaseService);
  private readonly formErrorService = inject(ReservationFormErrorService);

  private breakpointObserver$ = this.breakpointObserver.observe([Breakpoints.XSmall, Breakpoints.Small]);

  private readonly treatmentDiscountSignal = this.treatmentStore.treatmentDiscount;
  private readonly selectedReservationSignal = this.reservationStore.selected;
  private readonly customerReservationSignal = computed(() => {
    const data = this.reservationStore.data();
    return data?.kind === 'customerReservation' ? data.value : undefined;
  });
  private readonly availableListSignal = this.reservationStore.availability;
  private readonly subErrorsSignal = this.reservationStore.subErrors;
  private readonly authUserSignal = this.authUserService.authUser;
  private readonly paymentOptionsSignal = this.paymentStore.options;

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
  private langChangeSignal = toSignal<LangChangeEvent>(this.translateService.onLangChange, {
    initialValue: undefined,
  });
  private readonly paymentOptions = computed(
    () => this.paymentOptionsSignal().filter(option => option.enabled && option.enabledCustomer),
  );

  readonly additionalListSignal = computed(() => {
    const data = this.additionalStore.data();
    return data?.kind === 'list' ? data.value : undefined;
  });

  labels = computed(() => {
    this.langChangeSignal();
    const phoneTranslations = this.translateService.instant('COMMON.USER.PHONE');

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

  private picker = viewChild<MatDatepicker<Date>>('picker');
  private additionalLists = viewChildren<MatSelectionList>('additional');

  errors = signal<MeReservationErrors>(createMeReservationErrors());

  treatmentForm: FormGroup<MeReservationTreatmentForm> = this.formBuilder.group<MeReservationTreatmentForm>({
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

  eventGroup: FormGroup<MeReservationEventForm> = this.formBuilder.group<MeReservationEventForm>({
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
    option: this.formBuilder.control(undefined),
    percentage: this.formBuilder.control(undefined),
  });

  acceptForm: FormGroup<MeReservationAcceptForm> = this.formBuilder.group<MeReservationAcceptForm>({
    accept: this.formBuilder.control(false, {
      validators: [Validators.required],
    }),
    phone: this.formBuilder.control(undefined, {
      validators: [Validators.required],
    }),
  });

  form: FormGroup<MeReservationForms> = this.formBuilder.group<MeReservationForms>({
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

  offices = computed(() => Array.from(createRoomOffice(this.rooms())?.values() || []));
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

  discounts = computed(() =>
    this.treatmentDiscountSignal()?.discounts.map((ud: IUserDiscount) => {
      let title = ud.discountCustomer.name;
      switch (ud.discountCustomer.type) {
        case DiscountType.money:
          title =
            `${ currencySymbol(ud.discountCustomer.discount?.currency) } ${ ud.discountCustomer.amount } ${ title }`;
          break;
        case DiscountType.percentage:
          title = `${ ud.discountCustomer.amount } % ${ title }`;
          break;
      }
      return Object.assign({}, ud, { title });
    }));
  showDiscount = false;
  price = signal<IPrice>(new Price());
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
  private groupId?: string;
  private reservationMonths = MAX_RESERVATION_CUSTOMER_MONTH;
  private steps: IStep[];
  private dismiss = false;
  private treatmentDiscount?: IDiscount;
  private hydratedReservationKey?: string;
  private hydratingEdit = false;
  readonly language: string = this.navigationService.language;

  smallScreen = computed(() => this.breakpointsSignal()?.matches);

  options = signal<IPaymentOption[] | undefined>(undefined);
  additionalSelected = signal<IAdditionalAll[]>([]);

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
        dates = [...dates, { time: getTime(date, this.language), date }];
        group.set(key, dates);

        return group;
      }, map);
      return map;
    }
    return new Map<string, AvailabilityData[]>();
  });
  selectedIndex = 1;
  activeStepIndex = signal(0);
  isPreview = false;
  isPayment = false;

  isEditing = false;
  canCreate = true;
  firstTime = false;
  balance = 0;
  distance?: string;
  minDate: Date = getNowTimeZone();
  maxDate: Date = plusMonthDate(this.minDate, this.reservationMonths, this.minDate.getDate() + 1);
  maxDateFormat: string = formatDateTwoDigit(this.maxDate, this.language);
  date?: Date;
  endDate?: Date;
  totalDurationFormatted?: string;
  reservationId?: string;
  showPenalty = false;
  penalty = PENALTY;

  constructor() {
    this.reservationStore.clean();
    this.paymentStore.getOptions();
    this.reservationStore.loadUpcoming();
    const preview = new Step(5, 'preview', () => this.create());
    const payment = new Step(4, 'payment', () => this.callStepSix, preview);
    const book = new Step(3, 'book_online', () => this.callStepFive, payment);
    const additional = new Step(2, 'post_add', () => this.callStepFour, book, true, false);
    const treatment = new Step(1, 'spa', () => this.callStepThree, additional);
    const room = new Step(0, 'room', () => this.callStepTwo, treatment);
    this.steps = [room, treatment, additional, book, payment, preview];

    effect(() => {
      const params = this.params();
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
      const reservationId = this.id();
      if (reservationId) {
        this.firebaseService.logEvent('screen_view', {
          // eslint-disable-next-line camelcase
          firebase_screen: `Edit customer reservation ${ reservationId }`,
          // eslint-disable-next-line camelcase
          firebase_screen_class: 'MeReservationComponent',
        });
        this.reservationId = reservationId;
        this.isEditing = true;
        this.activeStepIndex.set(1);
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
        this.reservationStore.loadById(reservationId);
      }
    });

    effect(() => {
      const office = this.selectOfficeSignal();
      if (!office) {
        return;
      }
      this.roomList.set(office.rooms);
      const room = getList(office.rooms, this.roomId);
      this.getOfficeForm.room.setValue(room, { emitEvent: !this.hydratingEdit });
    });

    effect(() => {
      const room = this.selectRoomSignal();
      this.roomId = room?.id;
      if (room) {
        if (!this.dismiss && !isSameTimeZone(room.timeZone)) {
          const now = getNowTimeZone();
          const localDate = localeTimeZoneDate(this.language, now);
          const timeZoneDate = localeTimeZoneDate(this.language, now, room.timeZone);
          const warning = this.translateService.instant('COMMON.TIME_ZONE.WARNING');
          const localDateLabel = this.translateService.instant('COMMON.TIME_ZONE.DATE.LOCAL', { date: localDate });
          const roomDateLabel = this.translateService.instant('COMMON.TIME_ZONE.DATE.ROOM', { date: timeZoneDate });
          const message = `${ warning } - ${ localDateLabel } / ${ roomDateLabel }`;
          const toastRef = this.toastService.show(message, 'warning', 0, { actionType: 'button' });
          toastRef.onAction().subscribe(() => {
            this.dismiss = true;
          });
        }
        this.professionalList.set(room.professionals);
        const professional = getList(room.professionals, this.professionalId);
        this.getOfficeForm.professional.setValue(professional, { emitEvent: !this.hydratingEdit });
        this.professionalId = professional?.id;
      }
      if (this.hydratingEdit) {
        return;
      }
      this.getTreatmentForm.group.setValue(undefined);
      if (!this.isEditing) {
        this.cleanTreatment();
      }
    });

    effect(() => {
      const group = this.selectGroupSignal();
      this.groupId = group?.id;
      if (!group) {
        return;
      }
      this.treatmentList.set(group.treatments);
      const treatment = getList(group.treatments, this.treatmentId);
      this.getTreatmentForm.treatment.setValue(treatment, { emitEvent: !this.hydratingEdit });
    });

    effect(() => {
      const treatment = this.selectTreatmentSignal();
      this.treatmentId = treatment?.id;
      if (treatment) {
        const currentPrice = untracked(() => this.price());
        this.setPrice(newPrice(currentPrice, treatment.price, this.treatmentDiscount));
      }
    });

    effect(() => {
      const discountId = this.selectDiscountSignal();
      const discounts = this.discounts();
      if (discountId && discounts) {
        const userDiscount = discounts.find(d => d.id === discountId);
        if (userDiscount) {
          this.treatmentDiscount = userDiscount.discountCustomer;
          const currentPrice = untracked(() => this.price());
          this.setPrice(newDiscount(currentPrice, this.treatmentDiscount));
        }
      } else {
        this.treatmentDiscount = undefined;
        const currentPrice = untracked(() => this.price());
        this.setPrice(removeDiscount(currentPrice));
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
          if (this.shouldSyncAdditionalSelection(additionalSelected, newList)) {
            this.additionalSelected.set(newList);
            this.syncRenderedAdditionalSelections();
            const currentPrice = untracked(() => this.price());
            this.setPrice(
              newAdditional(currentPrice, newList, this.reservation?.treatment?.discountCustomer),
            );
          }
        }
      }
    });

    effect(() => {
      const treatmentDiscount = this.treatmentDiscountSignal();
      if (treatmentDiscount?.treatments) {
        const room = this.getOfficeForm.room.value || this.reservation?.room;
        if (room) {
          const groups = Array.from(
            createTreatmentGroupService(new Map<string, IGroupService>(), treatmentDiscount.treatments,
              room.currency.code).values());
          this.groups.set(groups);

          const currentGroupId = this.groupId;
          const currentGroup = currentGroupId
            ? groups.find(group => group.id === currentGroupId)
            : groups.find(group => group.treatments.some(treatment => treatment.id === this.treatmentId));

          if (currentGroup) {
            this.treatmentList.set(currentGroup.treatments);
            if (this.getTreatmentForm.group.value?.id !== currentGroup.id) {
              this.getTreatmentForm.group.setValue(currentGroup, { emitEvent: !this.hydratingEdit });
            }

            const currentTreatment = getList(currentGroup.treatments, this.treatmentId);
            if (currentTreatment && this.getTreatmentForm.treatment.value?.id !== currentTreatment.id) {
              this.getTreatmentForm.treatment.setValue(currentTreatment, { emitEvent: !this.hydratingEdit });
            }
          }
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
        const reservationKey = this.getReservationHydrationKey(reservation);
        if (this.hydratedReservationKey === reservationKey) {
          return;
        }
        this.hydratedReservationKey = reservationKey;
        if (reservation.paymentRequired) {
          const message = this.translateService.instant('ME.RESERVATION.UPCOMING.ERROR.PAYMENT');
          this.canNotContinue(message, 'update');
        } else {
          this.setData(reservation);
        }
        if (!reservation.canEdit) {
          this.firstTime = true;
          this.getTypeForm.option.setValidators([Validators.required]);
          this.getTypeForm.option.updateValueAndValidity();
        }
      }
    });

    effect(() => {
      const customerReservation = this.customerReservationSignal();
      if (customerReservation?.upcoming && customerReservation.upcoming.length >=
        MAX_UPCOMING_RESERVATION) {
        const dates = customerReservation.upcoming.map((upcoming: IReservationAll) => formatFullDateTime(
          newDateTimestamp(upcoming.timestamp, upcoming.room.timeZone), this.language));
        const message = this.translateService.instant('ME.RESERVATION.UPCOMING.ERROR.CUSTOMER',
          { date1: dates[0], date2: dates[1], date3: dates[2] });
        this.canNotContinue(message, 'create');
      } else {
        this.canCreate = true;
        this.applyCustomerBalance(customerReservation?.balance);
        this.getAcceptForm.phone.setValue(customerReservation?.phone || this.reservation?.customer?.phone);
        if (customerReservation?.isFirstTime) {
          this.firstTime = true;
          this.getTypeForm.option.setValidators([Validators.required]);
          this.getTypeForm.option.updateValueAndValidity();
        }
      }
    });

    effect(() => {
      const availableList = this.availableListSignal();
      if (availableList) {
        this.setSelectedIndex();
        const isPaid = untracked(() => this.price().isPaid);
        if (isPaid) {
          this.firstTime = false;
          this.getTypeForm.option.clearValidators();
          this.getTypeForm.option.updateValueAndValidity();
        }
      }
    });

    effect(() => {
      const subErrors = this.subErrorsSignal();
      if (subErrors) {
        this.applySubErrors(subErrors);
      }
    });
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
    return this.getOfficeForm.room.value || this.selectedReservationSignal()?.room;
  }

  get summaryRoom() {
    return this.room;
  }

  get summaryProfessional() {
    return this.getOfficeForm.professional.value || this.selectedReservationSignal()?.professional;
  }

  get summaryTreatment() {
    return this.getTreatmentForm.treatment.value || this.selectedReservationSignal()?.treatment;
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

  get hasDiscountApplied(): boolean {
    return !!this.getTreatmentForm.discount.value ||
      this.price().total !== this.price().totalWithoutDiscount || this.price().discount > 0;
  }

  get selectedTreatmentPrice(): number {
    return Number(this.treatment?.price ?? this.price().amount ?? 0);
  }

  get selectedAdditionalTotal(): number {
    return this.additionalSelected().reduce((total, additional) => total + Number(additional.price || 0), 0);
  }

  get effectiveDiscountAmount(): number {
    return this.price().discount || 0;
  }

  get effectiveTotalWithoutDiscount(): number {
    const fallbackTotal = this.selectedTreatmentPrice + this.selectedAdditionalTotal;
    return this.price().totalWithoutDiscount === 0 && fallbackTotal > 0
      ? fallbackTotal
      : this.price().totalWithoutDiscount;
  }

  get effectiveTreatmentDisplayPrice(): number {
    if (this.hasDiscountApplied && this.effectiveDiscountAmount > 0) {
      const discountedPrice = this.price().priceWithDiscount;
      return discountedPrice || Math.max(this.selectedTreatmentPrice - this.effectiveDiscountAmount, 0);
    }

    return this.selectedTreatmentPrice;
  }

  get effectiveTotalPrice(): number {
    if (this.price().total === 0 && this.effectiveTotalWithoutDiscount > 0) {
      return Math.max(this.effectiveTotalWithoutDiscount - this.effectiveDiscountAmount, 0);
    }

    return this.price().total;
  }

  get effectivePaidTotal(): number {
    return this.oldPrice?.totalPaid || this.price().totalPaid || 0;
  }

  get showCoveredAmounts(): boolean {
    return this.effectivePaidTotal > 0 || this.accountBalanceUsed > 0;
  }

  get appointmentStart(): Date | undefined {
    return this.getEventForm.event.value || this.getTreatmentForm.startDate.value || this.date;
  }

  get appointmentEnd(): Date | undefined {
    if (this.endDate) {
      return this.endDate;
    }

    const start = this.appointmentStart;
    const treatment = this.treatment;
    if (!start || !treatment) {
      return undefined;
    }

    const duration = totalDuration(treatment, this.additionalSelected()).duration;
    return createNewDate(start, start.getHours() + duration.hour, start.getMinutes() + duration.minute);
  }

  private get getForm(): MeReservationForms {
    return this.form.controls;
  }

  get getTreatmentForm(): MeReservationTreatmentForm {
    return this.getForm.treatmentForm.controls;
  }

  get getOfficeForm(): OfficeForm {
    return this.getForm.officeForm.controls;
  }

  get getEventForm(): MeReservationEventForm {
    return this.getForm.eventGroup.controls;
  }

  get getAcceptForm(): MeReservationAcceptForm {
    return this.getForm.acceptForm.controls;
  }

  get getTypeForm(): BankForm {
    return this.getForm.typeForm.controls;
  }

  get paymentToPay(): number {
    if (!this.oldPrice) {
      const amount = this.price().total;
      const covered = this.price().totalPaid + this.accountBalanceUsed;
      return Math.max(amount - covered, 0);
    }

    const covered = this.oldPrice.totalPaid + this.oldPrice.balance;
    const amount = this.showPenalty
      ? (this.hasReservationChanges ? this.oldPrice.penalty + this.price().total : this.oldPrice.penalty)
      : this.price().total;
    return Math.max(amount - covered, 0);
  }

  get paymentCredit(): number {
    if (!this.oldPrice) {
      const amount = this.price().total;
      const covered = this.price().totalPaid + this.accountBalanceUsed;
      return Math.max(covered - amount, 0);
    }

    if (!this.hasReservationChanges) {
      return 0;
    }

    const amount = this.showPenalty ? this.oldPrice.penalty + this.price().total : this.price().total;
    const covered = this.oldPrice.totalPaid + this.accountBalanceUsed;
    return Math.max(covered - amount, 0);
  }

  get accountBalanceUsed(): number {
    if (this.oldPrice) {
      const totalPaid = this.oldPrice.totalPaid;
      const balance = this.oldPrice.balance || this.balance || 0;
      const amount = this.showPenalty
        ? (this.hasReservationChanges ? this.oldPrice.penalty + this.price().total : this.oldPrice.penalty)
        : this.price().total;
      return Math.min(balance, Math.max(amount - totalPaid, 0));
    }

    const balance = this.price().balance || this.balance || 0;
    return Math.min(balance, Math.max(this.price().total - this.price().totalPaid, 0));
  }

  get hasReservationChanges(): boolean {
    if (!this.isEditing || !this.reservation) {
      return false;
    }

    const roomId = this.getOfficeForm.room.value?.id;
    const professionalId = this.getOfficeForm.professional.value?.id;
    const treatmentId = this.getTreatmentForm.treatment.value?.id;
    const event = this.getEventForm.event.value;
    const reservationDate = newDateTimestamp(this.reservation.timestamp, this.reservation.room.timeZone);
    const currentAdditionalIds = this.additionalSelected().map(item => item.id).sort();
    const reservationAdditionalIds = (this.reservation.additional ?? []).map(item => item.id ?? item.key).sort();
    const reservationTreatmentId = this.reservation.treatment.id ?? this.reservation.treatment.key;

    return roomId !== this.reservation.room.id ||
      professionalId !== this.reservation.professional.id ||
      treatmentId !== reservationTreatmentId ||
      !!event && !isEqual(event, reservationDate) ||
      currentAdditionalIds.length !== reservationAdditionalIds.length ||
      currentAdditionalIds.some((id, index) => id !== reservationAdditionalIds[index]);
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
    const previousIndex = getBackIndex(this.steps, this.activeStepIndex());
    if (previousIndex >= 0) {
      this.setActiveStep(previousIndex);
    }
  }

  create(): void {
    if (this.acceptForm.invalid) {
      return;
    }
    const role = Role.customer;
    const option = this.getTypeForm.option?.value;
    let payment = undefined;
    if (option && option.type.toLowerCase() !== 'account') {
      const percentage = this.getTypeForm.percentage?.value || PaymentPercentage.total;

      payment = { type: option.type, percentage };
    }
    const reservation = Reservation.fromMeForm(
      this.getForm,
      this.customerId(),
      this.date,
      this.additionalSelected()?.map(value => value.id),
      payment,
      this.isEditing ? this.reservation : undefined,
    );
    this.submitData.emit({ reservation, role });
  }

  callStepTwo = (goNext: boolean): void => {
    if (this.officeForm.invalid || !this.room) {
      return;
    }
    this.isPreview = false;
    this.professionalId = this.getOfficeForm.professional.value?.id;
    this.roomId = this.room.id;
    this.setTypes();
    this.getTreatmentList(this.room.id);
    if (goNext) {
      this.completeAndGoToNextStep(0);
    }
  };

  callStepThree = (goNext: boolean): void => {
    if (this.treatmentForm.invalid) {
      return;
    }
    this.isPreview = false;
    this.treatmentId = this.getTreatmentForm.treatment.value?.id;
    enableStep(this.steps, 'post_add');
    this.getAdditionalList();
    if (goNext) {
      this.completeAndGoToNextStep(1);
    }
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
    this.totalDurationFormatted = formatTime(duration.duration, room.timeZone, this.language);

    this.reservationStore.loadAvailability(
      room.id,
      treatment.id,
      startDate,
      professional.id,
      additionalSelected?.map(additional => additional.id),
    );
    if (goNext) {
      this.completeAndGoToNextStep(2);
    }
  };

  callStepFive = (goNext: boolean): void => {
    if (this.eventGroup.invalid) {
      this.errors.update(prev => ({ ...prev, schedule: true }));
    }

    this.date = newDate(this.getEventForm.event.value!);
    this.endDate = createNewDate(this.date, this.date.getHours() + this.duration.hour,
      this.date.getMinutes() + this.duration.minute);

    const requiresPayment = this.paymentToPay > 0 || this.paymentCredit > 0;
    const paymentIndex = getIndex(this.steps, 'payment');
    if (paymentIndex !== undefined) {
      this.steps[paymentIndex].enable = requiresPayment;
      this.steps[paymentIndex].optional = !requiresPayment;
      this.steps[paymentIndex].completed = !requiresPayment;
    }

    if (!requiresPayment) {
      this.isPayment = false;
      this.isPreview = true;
      this.completeStep(3);
      this.setActiveStep(5);
      return;
    }

    this.isPayment = true;
    if (goNext) {
      this.completeAndGoToNextStep(3);
    }
  };

  callStepSix = (goNext: boolean): void => {
    if (this.typeForm.invalid) {
      return;
    }

    this.isPreview = true;
    if (goNext) {
      this.completeAndGoToNextStep(4);
    }
  };

  private setActiveStep = (index: number): void => {
    this.activeStepIndex.set(index);
    if (this.steps[index]?.name === 'post_add') {
      queueMicrotask(() => this.syncRenderedAdditionalSelections());
    }
  };

  private completeStep = (index: number): void => {
    const step = this.steps.find(value => value.order === index);
    if (!step) {
      return;
    }
    step.completed = true;
    this.steps[step.order] = step;
    this.firebaseService.logEvent('screen_view', {
      // eslint-disable-next-line camelcase
      firebase_screen: `Customer reservation. Step: ${ step.name }`,
      // eslint-disable-next-line camelcase
      firebase_screen_class: 'MeReservationComponent',
    });
  };

  private completeAndGoToNextStep = (index: number): void => {
    this.completeStep(index);
    const nextIndex = this.getNextEnabledStepIndex(index);
    if (nextIndex !== undefined) {
      this.setActiveStep(nextIndex);
    }
  };

  private getNextEnabledStepIndex = (currentIndex: number): number | undefined => {
    for (const step of this.steps.slice(currentIndex + 1)) {
      if (step.enable) {
        return step.order;
      }
    }
    return undefined;
  };

  openDialog = (reservationDate?: Date): void => openDialog(
    this.room!, this.language, this.translateService, this.dialog, reservationDate,
  );

  myFilter = (d: Date | null): boolean => filterDateRoom(d, this.getOfficeForm.room.value);

  displayFnGroup = (group: ITreatmentGroup): string => group ? `${ group.name }` : '';

  displayFnTreatment = (treatment: ITreatment): string => treatment ? `${ treatment.name }` : '';

  displayFnOffice = (office: IOffice): string => office ? `${ office.name }` : '';

  displayFnRoom = (room: IRoom): string => room.address ? room.address.name : '';

  displayFnProfessional = (professional: IUser): string => professional?.displayName ? professional.displayName : '';

  dateNoContent = (date?: Date): string => formatDateName(
    createNewDate(date ? date : this.getTreatmentForm.startDate.value!), this.language, this.measure,
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
    const formattedDate = this.smallScreen() ? formatDateTwoDigit(date, this.language)
      : formatDateName(date, this.language, this.measure);

    return formattedDate.charAt(0).toUpperCase() + formattedDate.slice(1);
  };

  sortTime = (data: AvailabilityData[]): AvailabilityData[] => data.sort(
    (a: AvailabilityData, b: AvailabilityData) => newDate(a.date).getTime() -
      newDate(b.date).getTime());

  setDistance = ($event: number): void => {
    this.distance = $event > 999 ?
      this.translateService.instant('ME.RESERVATION.ROOM.ADDRESS.DISTANCE.KM',
        { distance: round($event / 1000) }) :
      this.translateService.instant('ME.RESERVATION.ROOM.ADDRESS.DISTANCE.M',
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

  onChange = (list: MatSelectionList): void => {
    Promise.resolve().then(() => {
      const additionalSelected = list.selectedOptions.selected.map(option => option.value as IAdditionalAll);
      const currentIds = this.additionalSelected().map(item => item.id).sort();
      const nextIds = additionalSelected.map(item => item.id).sort();

      if (currentIds.length === nextIds.length && currentIds.every((id, index) => id === nextIds[index])) {
        return;
      }

      this.additionalSelected.set(additionalSelected);
      this.syncRenderedAdditionalSelections();
      this.setPrice(newAdditional(this.price(), additionalSelected, this.treatmentDiscount));
    });
  };

  isSelected = (it: IAdditionalAll): boolean => this.additionalSelected().filter(el => el.id === it.id).length > 0;

  compareAdditional = (first?: IAdditionalAll, second?: IAdditionalAll): boolean => first?.id === second?.id;

  getPercentage = (percentage: number): void => {
    this.setPrice(newPercentage(this.price(), percentage));
  };

  private getTreatmentList = (roomId: string): void => {
    this.treatmentStore.getAllTreatments(roomId);
  };

  private shouldSyncAdditionalSelection = (current: IAdditionalAll[], next: IAdditionalAll[]): boolean => {
    if (current.length !== next.length) {
      return true;
    }

    return next.some((item, index) => current[index]?.id !== item.id || current[index] !== item);
  };

  private syncRenderedAdditionalSelections = (): void => {
    queueMicrotask(() => {
      const selectedIds = new Set(this.additionalSelected().map(item => item.id));
      this.additionalLists().forEach(list => {
        list.options.forEach((option: MatListOption) => {
          const additionalId = (option.value as IAdditionalAll | undefined)?.id;
          option.selected = additionalId ? selectedIds.has(additionalId) : false;
        });
      });
    });
  };

  private getAdditionalList = (): void => {
    const roomId = this.getOfficeForm.room.value!.id;
    const groupId = this.groupId || this.getTreatmentForm.group.value!.id;
    this.additionalStore.loadAllByGroupId(roomId, groupId);
  };

  private canNotContinue = (message: string, type: string): void => {
    this.firebaseService.logEvent('screen_view', {
      // eslint-disable-next-line camelcase
      firebase_screen: `Customer cannot ${ type } a reservation`,
      // eslint-disable-next-line camelcase
      firebase_screen_class: 'MeReservationComponent',
    });
    this.canCreate = false;
    const toastRef = this.toastService.show(message, 'error', 5000);
    toastRef.onDismiss().subscribe(() => {
      this.reservationStore.clean();
      this.navigationService.navigate(['me', 'reservations']);
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
      .forEach((_value, key) => {
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
    this.hydratingEdit = true;
    this.treatmentDiscount = reservation.treatment.discountCustomer;
    this.reservation = reservation;
    this.isPreview = false;
    const date = newDateTimestamp(reservation.timestamp, this.reservation.room.timeZone);
    this.groupId = reservation.treatment.groupId;
    this.treatmentId = reservation.treatment.key;
    this.roomId = reservation.room.id;
    this.professionalId = reservation.professional.id;
    this.roomList.set(reservation.room.office.rooms);
    this.professionalList.set(reservation.room.professionals);
    this.getEventForm.event.setValue(date, { emitEvent: false });
    this.time = getTime(date, this.language);
    this.getOfficeForm.office.setValue(reservation.room.office, { emitEvent: false });
    this.getOfficeForm.room.setValue(reservation.room, { emitEvent: false });
    this.getOfficeForm.professional.setValue(reservation.professional, { emitEvent: false });
    this.getTreatmentForm.startDate.setValue(date, { emitEvent: false });
    this.getTreatmentForm.treatment.setValue(reservation.treatment, { emitEvent: false });
    this.setPrice(getPrice(this.reservation, this.reservation?.payments));
    this.applyCustomerBalance(this.balance);
    this.additionalSelected.set(this.reservation.additional ? this.reservation.additional
      .map(ad => Object.assign({}, ad, { id: ad.key })) : []);
    this.syncRenderedAdditionalSelections();
    if (this.isEditing) {
      this.oldPrice = this.price();
      this.showPenalty = !this.reservation.canEdit;
      this.setTypes();
      if (!this.reservation.canEdit) {
        this.getTypeForm.option.setValidators([Validators.required]);
        this.getTypeForm.option.updateValueAndValidity();
        this.firstTime = true;
      } else {
        enableStep(this.steps, 'payment', false);
      }
      this.getTreatmentList(this.roomId!);
    }
    if (this.isEditing) {
      this.setActiveStep(1);
    } else {
      this.completeAndGoToNextStep(0);
    }
    queueMicrotask(() => {
      this.hydratingEdit = false;
    });
  };

  private getReservationHydrationKey = (reservation: IUpcomingAll): string => [
    reservation.id,
    reservation.timestamp,
    reservation.room.id,
    reservation.professional.id,
    reservation.treatment.id ?? reservation.treatment.key,
    (reservation.additional ?? []).map(item => item.id ?? item.key).join(','),
    reservation.canEdit ? '1' : '0',
    reservation.paymentRequired ? '1' : '0',
  ].join('|');

  private applyCustomerBalance = (balance?: number): void => {
    this.balance = balance || 0;
    const currentPrice = untracked(() => this.price());
    this.setPrice(currentPrice.withBalance(balance));
    if (this.oldPrice) {
      this.oldPrice = this.oldPrice.withBalance(balance);
    }
  };

  private setTypes = (): void => {
    const options = this.paymentOptions();
    const types = this.getOfficeForm.room.value?.paymentTypes.filter(
      p => !['cash', 'transfer'].includes(p.toLowerCase()));
    this.options.set(options.filter(option => types?.includes(option.type)));
  };

  private cleanTreatment = (): void => {
    this.price.set(new Price());
    this.getTreatmentForm.treatment.setValue(undefined);
    this.treatmentList.set(undefined);
    this.getEventForm.event.setValue(undefined);
  };

  private setPrice = (price: IPrice): void => {
    this.price.set(price);
  };

  private applySubErrors = (subErrors: IError[]): void => {
    const state = this.formErrorService.createErrorState(subErrors, {
      allowedFields: ME_RESERVATION_ERROR_FIELDS,
      createErrors: createMeReservationErrors,
      defaultStepIndex: 0,
      stepByField: { startDate: 1 },
    });

    if (state.stepIndex !== undefined) {
      this.setActiveStep(state.stepIndex);
    }

    state.fields.forEach(field => {
      if (field in this.getOfficeForm) {
        this.getOfficeForm[field as keyof OfficeForm]?.setErrors({ incorrect: true });
      }
      if (field in this.getTreatmentForm) {
        this.getTreatmentForm[field as keyof MeReservationTreatmentForm]?.setErrors({ incorrect: true });
      }
      if (field in this.getEventForm) {
        this.getEventForm[field as keyof MeReservationEventForm]?.setErrors({ incorrect: true });
      }
      if (field in this.getTypeForm) {
        this.getTypeForm[field as keyof BankForm]?.setErrors({ incorrect: true });
      }
      if (field in this.getAcceptForm) {
        this.getAcceptForm[field as keyof MeReservationAcceptForm]?.setErrors({ incorrect: true });
      }
    });

    this.errors.set(state.errors);
  };

}
