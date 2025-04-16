import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  inject,
  Input,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { STEPPER_GLOBAL_OPTIONS, StepperSelectionEvent } from '@angular/cdk/stepper';
import {
  FormArray,
  FormGroup,
  UntypedFormBuilder,
  UntypedFormControl,
  UntypedFormGroup,
  Validators,
} from '@angular/forms';
import { map, shareReplay, startWith } from 'rxjs/operators';
import { IUser, IUserAll } from '../interfaces/user';
import { Observable, Subject, Subscription } from 'rxjs';
import { Store } from '@ngrx/store';
import { AppState, selectReservationState } from '../store/app.states';
import * as fromActionsReservation from '../store/reservation.actions';
import { noDuplicateDatesValidator, requireMatch, valueChange } from '../util/validators';
import { IGroupService, IPrice, ITreatment, ITreatmentGroup, Price } from '../interfaces/treatment';
import { MatStepper } from '@angular/material/stepper';
import { IRoom, IService } from '../interfaces/room';
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
import { CalendarEvent, CalendarEventTimesChangedEvent, CalendarModule } from 'angular-calendar';
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
  getDuration,
  getDurationOrUndefined,
  getNowTimeZone,
  getStartEndDay,
  getTime,
  getTimeNumber,
  greaterOrEqualsThan,
  IDuration,
  isBetween,
  isSameTimeZone,
  newDate,
  newDateTimestamp,
  reservationDuration,
  searchDates,
  totalDuration,
} from '../util/dates';
import { createBullet, DataEvent, IDataEvent, Meta, newEvent } from '../util/event';
import { ActivatedRoute, Router } from '@angular/router';
import { Role } from '../interfaces/token';
import { IUnavailableAll } from '../interfaces/unavailable';
import { DiscountType, IDiscount, IUserDiscount } from '../interfaces/discount';
import {
  createRoomOffice,
  createTreatmentGroupService,
  executeDialogNoWidth,
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
import { IOffice } from '../interfaces/office';
import { IStep, Step } from '../interfaces/step';
import { TimeZoneSnackBarComponent } from '../shared/snack/time-zone/time-zone-snack-bar.component';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SelectProfessionalDialogComponent } from './select-professional-dialog.component';
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
import PlaceResult = google.maps.places.PlaceResult;

@Component({
  selector: 'app-reservation',
  animations: [transitionAnimation],
  templateUrl: './reservation.component.html',
  styleUrls: ['./reservation.component.scss'],
  providers: [{
    provide: STEPPER_GLOBAL_OPTIONS, useValue: { displayDefaultIndicatorType: false },
  }],
  imports: [SharedModule, RoomNamePipe, SortByPipe, CurrencySymbolPipe, DurationTimePipe, PricePreviewComponent,
    CalendarModule, BackButtonDirective, GoogleMapComponent],
})
export class ReservationComponent implements OnInit, AfterViewInit, OnDestroy {
  readonly dialog = inject(MatDialog);
  private readonly snackBar: MatSnackBar = inject(MatSnackBar);
  private readonly translate: TranslateService = inject(TranslateService);
  private readonly store: Store<AppState> = inject(Store<AppState>);
  private readonly formBuilder: UntypedFormBuilder = inject(UntypedFormBuilder);
  private readonly breakpointObserver: BreakpointObserver = inject(BreakpointObserver);
  private readonly router: Router = inject(Router);
  private readonly route: ActivatedRoute = inject(ActivatedRoute);
  private readonly cdRef: ChangeDetectorRef = inject(ChangeDetectorRef);

  private authUserService: AuthUserService = inject(AuthUserService);

  @Input() dataEvents: Map<string, IDataEvent> = new Map();
  @ViewChild('stepper') myStepper!: MatStepper;

  errors: any = [];

  customerForm!: UntypedFormGroup;
  customers?: IUserAll[];
  filteredCustomer?: Observable<IUser[] | undefined>;
  customer: UntypedFormControl = new UntypedFormControl('', [
    Validators.required, requireMatch,
  ]);
  customerInfo?: ICustomerLastReservation;

  treatmentForm!: UntypedFormGroup;
  groups?: IGroupService[];
  filteredGroup?: Observable<IGroupService[] | undefined>;
  group: UntypedFormControl = new UntypedFormControl('', [
    Validators.required, requireMatch,
  ]);
  treatmentList?: IService[];
  filteredTreatment?: Observable<IService[] | undefined>;
  treatment: UntypedFormControl = new UntypedFormControl('', [
    Validators.required, requireMatch,
  ]);

  discounts?: IUserDiscount[];
  discount = new UntypedFormControl();
  showDiscount = false;
  price: IPrice = new Price();

  officeForm!: UntypedFormGroup;
  offices?: IOffice[];
  filteredOffice?: Observable<IOffice[] | undefined>;
  office: UntypedFormControl = new UntypedFormControl('', [
    Validators.required, requireMatch,
  ]);
  roomList?: IRoom[];
  filteredRoom?: Observable<IRoom[] | undefined>;
  room: UntypedFormControl = new UntypedFormControl('', [
    Validators.required, requireMatch,
  ]);
  professionalList?: IUser[];
  filteredProfessional?: Observable<IUser[] | undefined>;
  professional: UntypedFormControl = new UntypedFormControl('', [
    requireMatch,
  ]);
  address?: string;

  additionalList: IAdditionalAll[] = [];
  additionalSelected: IAdditionalAll[] = [];
  customerAdditionalIds?: string[];

  configurationForm!: UntypedFormGroup;
  customerChange: UntypedFormControl = new UntypedFormControl();
  reference: UntypedFormControl = new UntypedFormControl();
  note: UntypedFormControl = new UntypedFormControl();
  type: UntypedFormControl = new UntypedFormControl();
  amount: UntypedFormControl = new UntypedFormControl('', [Validators.min(1)]);
  transfer: UntypedFormControl = new UntypedFormControl();

  eventGroup!: UntypedFormGroup;

  daysInWeek = 7;
  weekendDays: number[] = [0, 6];
  day: IDay = new Day();
  refresh: Subject<any> = new Subject();

  dateFormat: string = this.translate.currentLang;
  smallScreen?: boolean;
  isPreview = false;
  totalDurationFormatted?: string;

  isEditing = false;
  isAdmin = false;
  reservationId?: string;

  minDate: string = '';
  maxDate: string = '';
  maxCalendarDate: Date = addMonths(getNowTimeZone(), MAX_RESERVATION_MONTH);
  types: string[] = [PaymentType.cash, PaymentType.transfer];

  handset$: Observable<{
    smallScreen: boolean;
    daysInWeek: number;
    lessDays: number;
  }> = this.breakpointObserver.observe([
      Breakpoints.XSmall,
      Breakpoints.Small,
    ]).pipe(
      map(result => ({
        smallScreen: result.matches,
        daysInWeek: result.matches ? 3 : 7,
        lessDays: result.matches ? 1 : 3,
      })),
      shareReplay(),
    );

  private treatmentId?: string;
  private roomId?: string;
  private professionalId?: string;
  private additionalIds?: string[];
  private skip: boolean = false;
  private isDarkMode = false;
  private lessDays = 3;
  private reservation?: IReservationAll;
  private getState: Observable<any> = this.store.select(selectReservationState);
  private subscription?: Subscription;
  private handsetSubscription: Subscription =
    this.handset$.subscribe(({ smallScreen, daysInWeek, lessDays }) => {
      this.smallScreen = smallScreen;
      this.daysInWeek = daysInWeek;
      this.lessDays = lessDays;
    });
  private authUserServiceSubscription: Subscription = this.authUserService.authUser.subscribe(value => {
    this.isAdmin = value.isAdmin;
    this.isDarkMode = value.isDarkMode;
  });
  private steps: IStep[];
  private dismiss = false;
  private treatmentDiscount?: IDiscount;
  private totalDuration: IDuration = new Duration();
  private alreadyCreated = false;
  private readonly groupId?: string;
  private readonly isDashboard = false;
  private readonly extras: any = this.router.getCurrentNavigation()?.extras.state;
  private readonly language: string = this.translate.currentLang;

  constructor() {
    if (this.extras) {
      this.customer.setValue(this.extras.customer);
      this.isDashboard = this.extras.isDashboard;
      this.treatmentId = this.extras.treatment?.key || this.extras.treatment?.id || this.extras.treatmentId;
      this.groupId = this.extras.groupId;
      this.roomId = this.extras.room?.id || this.extras.roomId;
      this.professionalId = this.extras.professional?.id || this.extras.professionalId;
      this.skip = this.extras.skip;
      this.additionalIds = this.extras.additionalIds;
    }
    const preview = new Step(6, 'preview', () => this.create);
    const book = new Step(5, 'book_online', (goNext: boolean) => this.callStepSeven(goNext), preview);
    const settings = new Step(4, 'settings', (goNext: boolean) => this.callStepSix(goNext), book);
    const additional = new Step(3, 'post_add', (goNext: boolean) => this.callStepFive(goNext), settings, true);
    const treatment = new Step(2, 'spa', (goNext: boolean) => this.callStepFour(goNext), additional);
    const room = new Step(1, 'room', (goNext: boolean) => this.callStepThree(goNext), treatment);
    const customer = new Step(0, 'person_search', (goNext: boolean) => this.callStepTwo(goNext), room);
    this.steps = [customer, room, treatment, additional, settings, book, preview];
  }

  get dateTimeList(): FormArray {
    return this.treatmentForm.get('dateTimeList') as FormArray;
  }

  get events(): FormArray {
    return this.eventGroup.get('events') as FormArray;
  }

  get treatmentDetail(): string {
    if (this.customerInfo) {
      return this.customerInfo.treatment.name;
    }
    return '';
  }

  get roomDetail(): string {
    return roomDetail(this.room.value);
  }

  get back(): void {
    if (this.isPreview) {
      this.isPreview = false;
      this.alreadyCreated = true;
    } else {
      this.cleanEvent();
    }

    this.myStepper.selectedIndex = getBackIndex(this.steps, this.myStepper.selectedIndex);
    return;
  }

  get create(): void {
    const reservation: IReservation = new Reservation();
    reservation.customerId = this.customer.value.id;
    const dates: string[] = this.events.value?.map(
      (calendarEvent: any) => calendarEvent.event.start.toLocaleString(API_LOCALE)) ?? [];
    if (dates.length) {
      reservation.start = dates.shift();
      reservation.moreStart = dates;
      reservation.timeZone = getCurrentTimeZone();
      reservation.additionalIds = this.additionalSelected?.map(value => value.id);
      reservation.canCustomerChange = this.customerChange.value;
      reservation.reference = this.reference.value;
      reservation.note = this.note.value;
      if (this.amount.value && this.type.value) {
        reservation.payment = {
          type: this.type.value,
          amount: this.amount.value,
          transfer: this.transfer.value,
        } as IReservationPayment;
      }

      const role = this.isDashboard ? Role.roomAdmin : Role.professional;
      if (this.isEditing && this.reservation) {
        reservation.id = this.reservation.id;
        reservation.treatmentId = valueChange(this.treatment.value.id, this.reservation.treatment.id);
        reservation.roomId = valueChange(this.room.value.id, this.reservation.room.id);
        reservation.professionalId = valueChange(this.professional.value.id, this.reservation.professional.id);
        this.store.dispatch(
          new fromActionsReservation.Edit({ reservation, role }),
        );
      } else {
        reservation.treatmentId = this.treatment.value.id;
        reservation.roomId = this.room.value.id;
        reservation.professionalId = this.professional.value.id;
        reservation.discountId = this.discount.value;
        this.store.dispatch(
          new fromActionsReservation.ReservationSave({ reservation, role }),
        );
      }
    }
    return;
  }

  get addCustomer(): void {
    this.router.navigate([this.language, 'users', 'add'], { state: { role: Role.customer } });
    return;
  }

  get showTimeZone(): boolean {
    return !isSameTimeZone(this.room.value.timeZone);
  }

  get isAddButtonDisabled(): boolean {
    if (this.dateTimeList.invalid) {
      return true;
    }

    return this.dateTimeList.controls.some(control => control.invalid || !control.get('date')?.value);
  }

  ngOnInit(): void {
    this.createForm();
    this.createFilters();
    this.clean();
    this.subscribe();
    if (this.extras?.date) {
      let start = this.minDate;
      if (this.extras.date.getMinutes() % 15 === 0 && this.extras.date.getSeconds() === 0) {
        start = getTime(this.extras.date, this.dateFormat);
      }
      this.removeDate(0);
      this.addDate(this.extras.date, start);
    }
    this.route.params.subscribe(routeParams => {
      const reservationId = routeParams.id;
      if (reservationId) {
        this.reservationId = reservationId;
        this.isEditing = true;
        this.steps = this.steps.map(value => {
          switch (value.order) {
            case 0:
              value.enable = false;
              return value;
            case 1:
              const enable = !(this.isEditing && !this.isAdmin);
              value.enable = enable;
              return value;
            default:
              return value;
          }
        });
        this.getReservation(reservationId);
      } else {
        this.getCustomers();
      }
    });
    if (this.skip) {
      this.getRoomList();
      this.getTreatmentList();
      this.getAdditionalList();
    }
  }

  ngAfterViewInit(): void {
    if (this.isEditing) {
      if (this.isAdmin) {
        this.getRoomList();
      } else {
        this.getTreatmentList();
      }
    }
    this.cdRef.detectChanges();
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
    this.authUserServiceSubscription.unsubscribe();
    this.handsetSubscription.unsubscribe();
  }

  triggerClick = (event: StepperSelectionEvent): void => getStepCall(this.steps, event.selectedIndex - 1);

  callStepTwo = (goNext: boolean): void => {
    if (this.customerForm.invalid) {
      return;
    }
    if (!goNext) {
      this.isPreview = false;
      this.getRoomList();
      this.cleanEvent();
    }
    completeAndNext(this.steps, this.myStepper, goNext);
  };

  callStepThree = (goNext: boolean): void => {
    if (this.officeForm.invalid) {
      return;
    }
    if (!goNext) {
      this.isPreview = false;
      this.getTreatmentList();
      this.cleanEvent();
    }
    completeAndNext(this.steps, this.myStepper, goNext);
  };

  callStepFour = (goNext: boolean): void => {
    if (this.treatmentForm.invalid) {
      return;
    }
    if (!goNext) {
      this.isPreview = false;
      this.getAdditionalList();
      this.cleanEvent();
    }
    completeAndNext(this.steps, this.myStepper, goNext);
  };

  callStepFive = (goNext: boolean): void => {
    if (!goNext) {
      this.isPreview = false;
      this.cleanEvent();
    }
    completeAndNext(this.steps, this.myStepper, goNext);
  };

  callStepSix = (goNext: boolean): void => {
    if (this.configurationForm.invalid) {
      return;
    }
    if (!goNext) {
      this.isPreview = false;
      const duration = totalDuration(this.treatment.value, this.additionalSelected);
      this.totalDuration = duration.duration;
      this.totalDurationFormatted = formatTime(duration.duration, this.room.value.timeZone, this.dateFormat);
      this.dataEvents = new Map();

      const timeZone = this.room.value.timeZone;
      const now = dateToUTC(createDate(timeZone), timeZone);

      const dates: string[] = [];
      this.dateTimeList.value.forEach((value: any, i: number) => {
        const timeValue = getTimeNumber(value.start || this.minDate);
        if (timeValue) {
          value.date.setHours(timeValue.hour, timeValue.minute);
        }
        const dateValue = value.date.toISOString().split('T')[0];
        let date = dateToUTC(newDate(dateValue), timeZone);
        date = addDays(date, -this.lessDays);
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
        new fromActionsReservation.SearchReservation({
          dates,
          roomId: this.room.value.id,
          professionalId: this.professional.value.id,
          days: this.daysInWeek,
        }),
      );
    }
    completeAndNext(this.steps, this.myStepper, goNext);
  };

  callStepSeven = (goNext: boolean): void => {
    this.errors.schedule = [];
    this.errors.overlapping = false;
    if (!this.eventGroup.invalid) {
      for (const dataEvent of this.dataEvents.values()) {
        let eventFound = false;

        for (const eventData of this.events.value) {
          const eventToCheck = eventData.event;

          if (dataEvent.calendarEvents.some(calendarEvent => calendarEvent.id === eventToCheck.id)) {
            eventFound = true;
            break;
          }
        }

        if (!eventFound) {
          this.errors.schedule[dataEvent.index] = true;
        }
      }
    }
    if (this.errors.schedule.length) {
      return;
    }
    if (!goNext) {
      this.isPreview = true;
    }
    completeAndNext(this.steps, this.myStepper, goNext);
  };

  getStepName = (index: number): string => getStepName(this.steps, index);

  getStepEnabled = (index: number): boolean => getStepEnabled(this.steps, index);

  getStepOptional = (index: number): boolean => getStepOptional(this.steps, index);

  getStepCompleted = (index: number): boolean => getStepCompleted(this.steps, index);

  myFilter = (d: Date | null): boolean => filterDateRoom(d, this.room.value);

  displayFnUser = (user: IUser): string => user?.displayName ? user.displayName : '';

  displayFnGroup = (group: ITreatmentGroup): string => group ? `${ group.name }` : '';

  displayFnTreatment = (treatment: ITreatment): string => treatment ? `${ treatment.name }` : '';

  displayFnOffice = (office: IOffice): string => office ? `${ office.name }` : '';

  displayFnRoom = (room: IRoom): string => room.address ? room.address.name : '';

  displayFnProfessional = (professional: IUser): string => professional?.displayName ? professional.displayName : '';

  openDialog = (reservationDate?: Date): void => openDialog(
    this.room.value, this.dateFormat, this.translate, this.dialog, reservationDate,
  );

  segmentClick = (date: Date, state: string, eventKey: string, id: string = `${ Math.random() }`): void => {
    const eventData = this.dataEvents.get(eventKey);
    if (eventData) {
      if (!this.dateIsValid(date)) {
        return;
      }
      this.dataEvents.delete(eventKey);
      this.dataEvents.set(date.toISOString().split('T')[0], eventData);
      if (this.errors.schedule) {
        this.errors.schedule[eventData.index] = false;
      }
      if (!this.professionalId) {
        const data = {
          professionals: this.professionalList,
          small: this.smallScreen,
        };

        executeDialogNoWidth(this.dialog, SelectProfessionalDialogComponent, data, result => {
          if (result) {
            this.professional.setValue(result.professional);
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
    const dateGroup = this.dateTimeList.at(index) as FormGroup;
    const time = getTimeNumber($event);
    dateGroup.get('date')?.value.setHours(time?.hour || 0, time?.minute || 0);
  };

  keyDownHandler = (event: any, form: UntypedFormControl): void => {
    if (event.code === 'Backspace') {
      form.setValue('');
    }
  };

  keyDownGroup = (event: any): void => {
    this.treatmentList = undefined;
    this.keyDownHandler(event, this.treatment);
    this.keyDownHandler(event, this.group);
    this.errors = this.errors.filter((it: any) => it !== 'treatment');
    this.errors = this.errors.filter((it: any) => it !== 'group');
    this.errors = this.errors.filter((it: any) => it !== 'start');
  };

  keyDownOffice = (event: any): void => {
    this.keyDownRoom(event);
    this.keyDownHandler(event, this.office);
    this.errors = this.errors.filter((it: any) => it !== 'office');
  };

  keyDownRoom = (event: any): void => {
    if (event.code === 'Backspace') {
      this.keyDownHandler(event, this.professional);
      this.keyDownHandler(event, this.room);
      this.professionalList = undefined;
      this.roomId = undefined;
      this.professionalId = undefined;
      this.errors = this.errors.filter((it: any) => it !== 'room');
      this.errors = this.errors.filter((it: any) => it !== 'professional');
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
    const dateTimeForm = this.dateTimeList.at(eventData.index);
    dateTimeForm.get('date')?.setValue(newStart);
    dateTimeForm.get('start')?.setValue(getTime(newStart));
  };

  onChange = (options: MatListOption[]): void => {
    this.additionalSelected = options.map(o => o.value);
    this.price = newAdditional(this.price, this.additionalSelected, this.treatmentDiscount);
    this.cleanEvent();
  };

  isSelected = (it: IAdditionalAll): boolean => this.additionalSelected.filter(el => el.id === it.id).length > 0;

  addDate = (dateValue?: Date, startTime?: string): void => {
    this.dateTimeList.push(this.createDate(dateValue, startTime));
    this.events.push(this.createEventForm());
  };

  removeDate = (index: number): void => {
    this.dateTimeList.removeAt(index);
    this.events.removeAt(index);
  };

  private createEvent = (eventData: IDataEvent, date: Date, state: string, id?: string): void => {
    this.errors.overlapping = false;

    const dateGroup = this.dateTimeList.at(eventData.index) as FormGroup;
    dateGroup.get('date')?.setValue(date);
    dateGroup.get('start')?.setValue(getTime(date, this.dateFormat));

    const nowTime = getTimeNumber(date);

    const start = createNewDate(date, nowTime?.hour, nowTime?.minute);
    const end = createNewDate(start, start.getHours() + this.totalDuration.hour,
      start.getMinutes() + this.totalDuration.minute);
    const event = this.createNewEvent(start, end, state, this.room.value.timeZone, id);

    if (event) {
      let title;
      let content;
      const selectedEvent = this.events.at(eventData.index)?.get('event')?.value;
      const eventsOverlapping = eventData.getOverlapEvent(start, end, this.professionalId);
      if (eventsOverlapping.length && eventsOverlapping[0] !== selectedEvent) {
        let message = '';
        eventsOverlapping.forEach(e => {
          message += `<div>${ e.title }</div>`;
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

  private createDate = (dateValue?: Date, startTime?: string): FormGroup => this.formBuilder.group({
    date: [dateValue, [Validators.required]],
    start: [startTime || this.minDate],
  });

  private createEventForm = (): FormGroup => this.formBuilder.group({ event: ['', Validators.required] });

  private createNewEvent = (start: Date, end: Date, state: string, timeZone: string = getCurrentTimeZone(),
    id?: string): CalendarEvent | undefined => {
    let treatments = createBullet(this.treatment.value.name);
    treatments += this.additionalSelected.map(additional => createBullet(additional.name));

    const detail = this.translate.instant('RESERVATION.EVENT.DETAIL', {
      customerName: this.customer.value.displayName,
      professionalName: this.professional.value.displayName,
      treatments,
    });

    const meta = new Meta(true, timeZone, undefined, undefined, this.professional.value.id);
    return newEvent(detail, findStateColor(state, this.isDarkMode), start, this.isDarkMode, end, id, meta, true);
  };

  private dateIsValid = (date: Date): boolean => isBetween(getNowTimeZone(), this.maxCalendarDate, date);

  private createForm = (): void => {
    this.customerForm = this.formBuilder.group({
      customer: this.customer,
    });
    this.treatmentForm = this.formBuilder.group({
      group: this.group,
      treatment: this.treatment,
      discount: this.discount,
      dateTimeList: this.formBuilder.array([this.createDate()], noDuplicateDatesValidator()),
    });
    this.officeForm = this.formBuilder.group({
      office: this.office,
      room: this.room,
      professional: this.professional,
    });
    this.configurationForm = this.formBuilder.group({
      customerChange: this.customerChange,
      reference: this.reference,
      note: this.note,
      amount: this.amount,
      type: this.type,
      transfer: this.transfer,
    });
    this.eventGroup = this.formBuilder.group({
      events: this.formBuilder.array([this.createEventForm()]),
    });
    this.valueChanges();
  };

  private valueChanges = (): void => {
    this.customer.valueChanges.subscribe((value) => {
      this.customerInfo = undefined;
      if (value && value.id && !this.isEditing) {
        this.store.dispatch(
          new fromActionsReservation.GetCustomerInfo(value.id),
        );
      }
      this.cleanTreatment();
    });
    this.office.valueChanges.subscribe(value => {
      if (!value) {
        return;
      }
      this.roomList = value.rooms;
      const room = value.rooms?.find((o: IOffice) => o.id === this.roomId);
      if (room) {
        this.roomList = value.rooms;
        if (this.room.value.id !== this.roomId) {
          this.room.setValue(room);
          this.roomId = this.room.value.id;
        }
      } else {
        if (this.roomList?.length === 1) {
          this.room.setValue(this.roomList[0]);
        } else {
          this.room.setValue('');
        }
      }
    });
    this.room.valueChanges.subscribe((value) => {
      if (value) {
        if (!this.dismiss && !isSameTimeZone(value.timeZone)) {
          const now = getNowTimeZone();
          const snack = this.snackBar.openFromComponent(TimeZoneSnackBarComponent, {
            data: { date: now, timeZone: value.timeZone },
          });
          snack.afterDismissed().subscribe(() => {
            this.dismiss = true;
          });
        }
        this.professionalList = value.professionals;
        const professional = value.professionals?.find((o: IRoom) => o.id === this.professionalId);
        if (professional) {
          this.professionalList = value.professionals;
          if (this.professional.value.id !== this.professionalId) {
            this.professional.setValue(professional);
            this.professionalId = this.professional.value.id;
          }
        } else {
          if (this.professionalList?.length === 1) {
            this.professional.setValue(this.professionalList[0]);
          } else {
            this.professional.setValue('');
          }
        }
        if (this.roomId !== value.id) {
          this.getTreatmentList();
        }
        const { monday, tuesday, wednesday, thursday, friday, saturday, sunday } = getAvailability(value);
        const {
          min,
          max,
        } = getStartEndDay(monday, tuesday, wednesday, thursday, friday, saturday, sunday, value.timeZone);
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
      }
      this.group.setValue('');
      this.cleanTreatment();
    });
    this.professional.valueChanges.subscribe(value => this.professionalId = value ? value.id : undefined);
    this.group.valueChanges.subscribe(value => {
      if (!value) {
        return;
      }
      this.treatmentList = value.treatments;
      const treatment = value.treatments?.find((p: ITreatmentGroup) => p.id === this.treatmentId);
      if (treatment) {
        this.treatmentList = value.treatments;
        this.treatment.setValue(treatment);
        this.treatmentId = this.treatment.value.id;
      } else {
        if (this.treatmentList?.length === 1) {
          this.treatment.setValue(this.treatmentList[0]);
        } else {
          this.treatment.setValue('');
        }
      }
    });
    this.treatment.valueChanges.subscribe(value => {
      if (value) {
        this.price = newPrice(this.price, value.price, this.treatmentDiscount);
        this.cleanEvent();
      }
      if (this.extras && this.extras.discount) {
        this.showDiscount = true;
        this.discount.setValue(this.extras.discount.id);
      }
    });
    this.discount.valueChanges.subscribe(value => {
      if (value && this.discounts) {
        const userDiscount = this.discounts.find(d => d.id === value);
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
    this.customerChange.valueChanges.subscribe((value) => {
      if (value) {
        this.reference.setValidators([Validators.required]);
        this.reference.updateValueAndValidity();
      } else {
        this.reference.setValidators([]);
        this.reference.updateValueAndValidity();
      }
    });
    this.amount.valueChanges.subscribe(value => {
      if (value) {
        this.type.setValidators([Validators.required]);
        this.type.updateValueAndValidity();
      } else {
        this.type.setValidators([]);
        this.type.updateValueAndValidity();
      }
    });
    this.dateTimeList.valueChanges.subscribe(() => {
      this.dateTimeList.updateValueAndValidity({ onlySelf: true, emitEvent: false });
    });
  };

  private cleanTreatment = (): void => {
    if (!this.skip) {
      this.price = new Price();
      this.discount.setValue(undefined);
      this.treatment.setValue('');
      this.treatmentId = undefined;
      this.showDiscount = false;
      this.treatmentList = undefined;
      this.groups = undefined;
      this.additionalSelected = [];
      this.cleanEvent();
    }
  };

  private createFilters = (): void => {
    this.filteredCustomer = this.customer.valueChanges.pipe(
      startWith(''),
      map(value => typeof value === 'string' ? value : value.name),
      map(name => name ? this.filterCustomer(name) : this.customers ? this.customers.slice() : this.customers),
    );
    this.filteredGroup = this.group.valueChanges.pipe(startWith(''),
      map(value => typeof value === 'string' ? value : value?.name),
      map(name => name ? this.filterGroup(name) : this.groups ? this.groups.slice() : this.groups),
    );
    this.filteredTreatment = this.treatment?.valueChanges.pipe(
      startWith(''),
      map(value => typeof value === 'string' ? value : value.name),
      map(name => name ? this.filterTreatment(name) :
        this.treatmentList ? this.treatmentList.slice() : this.treatmentList),
    );
    this.filteredOffice = this.office.valueChanges.pipe(startWith(''),
      map(value => typeof value === 'string' ? value : value.name),
      map(name => name ? this.filterOffice(name) : this.offices ? this.offices.slice() : this.offices),
    );
    this.filteredRoom = this.room.valueChanges.pipe(
      startWith(''),
      map(value => typeof value === 'string' ? value : value.name),
      map(addressName => addressName ? this.filterRoom(
        addressName) : this.roomList ? this.roomList.slice() : this.roomList),
    );
    this.filteredProfessional = this.professional.valueChanges.pipe(
      startWith(''),
      map(value => typeof value === 'string' ? value : value.name),
      map(addressName => addressName ? this.filterProfessional(addressName) : this.professionalList
        ? this.professionalList.slice() : this.professionalList),
    );
  };

  private addNotAvailable = (eventData: IDataEvent) => {
    const timeZone = this.room.value.timeZone;

    const { monday, tuesday, wednesday, thursday, friday, saturday, sunday, exclude } = getAvailability(
      this.room.value);
    this.weekendDays = exclude;
    const { min, max } = getStartEndDay(monday, tuesday, wednesday, thursday, friday, saturday, sunday, timeZone);
    this.day = new Day(min, max, getNowTimeZone(), exclude, 1);

    const unavailable = this.translate.instant('RESERVATION.EVENT.MESSAGE.UNAVAILABLE');
    const lunch = this.translate.instant('RESERVATION.EVENT.MESSAGE.LUNCH');
    const notWorking = this.translate.instant('RESERVATION.EVENT.MESSAGE.OUT_OF_WORK');

    eventData.recurringEvent?.addNotAvailableRecurring(eventData, unavailable, lunch, notWorking, sunday, saturday,
      friday,
      thursday, wednesday, tuesday, monday, this.isDarkMode, timeZone);
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

          const color = findStateColor(it.state, this.isDarkMode);
          const meta = new Meta(true, timeZone, undefined, undefined, it.professional.id);
          meta.isReservation = true;
          return newEvent(detail, color, start, this.isDarkMode, end, it.id, meta);
        }
      }
    }
    return undefined;
  }).filter((item): item is CalendarEvent => item !== undefined) ?? [];

  private addUnavailableList = (dataEvent: IDataEvent, unavailableList: IUnavailableAll[]) => {
    unavailableList.forEach(it => {
      if (it.duration || it.allDay) {
        const startDate = newDateTimestamp(it.timestamp, this.room.value.timeZone);
        const start = it.allDay ? createNewDate(startDate) : startDate;
        const duration = getDuration(it.allDay, it.duration);
        const id = it.id;
        const allDay = it.allDay;
        const professionalId = it.professional.id;
        const title = this.translate.instant('RESERVATION.EVENT.UNAVAILABLE', {
          description: it.description ? it.description : '',
          professionalName: it.professional.displayName,
        });
        let path = 'unavailable/';
        if (it.type === 'BLOCK_AGENDA') {
          path += 'block-agenda/';
        }
        if (it.repeat === 'NONE') {
          if (!greaterOrEqualsThan(start, this.maxCalendarDate)) {
            const data = { id, allDay, title, path, duration, professionalId };
            this.validateUnavailable(start, data, dataEvent);
          }
        } else {
          dataEvent.recurringEvent?.addFrequency(it.repeat, start, it.id, title, 'UNAVAILABLE', path,
            (date, recurring) => this.validateUnavailable(date, recurring, dataEvent),
            getDurationOrUndefined(it.duration), professionalId, it.allDay);
        }
      }
    });
  };

  private validateUnavailable = (start: Date, recurring: any, dataEvent: IDataEvent): void => {
    const [startSearch, endSearch] = searchDates(recurring.allDay, start, recurring.duration);
    this.createUnavailableEvent(recurring, startSearch, endSearch, dataEvent);
  };

  private createUnavailableEvent = (recurring: any, start: Date, end: Date, dataEvent: IDataEvent): void => {
    const color = findStateColor('DEFAULT', this.isDarkMode);
    const meta = new Meta(!recurring.allDay, this.room.value.timeZone, undefined, undefined, recurring.professionalId);
    const event = newEvent(recurring.title, color, start, this.isDarkMode, end, recurring.path, meta);
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
    const selectedEvent = this.events.at(eventData.index)?.get('event');
    if (selectedEvent?.value) {
      eventData.removeEvent(selectedEvent.value);
    }
    selectedEvent?.setValue(event);
    eventData.addEvent(event);
  };

  private filterCustomer = (name: string): IUser[] | undefined => this.customers?.filter(
    option => option.displayName?.toLowerCase().indexOf(name.toLowerCase()) === 0);

  private filterGroup = (name: string): IGroupService[] | undefined => this.groups?.filter(
    option => option.name?.toLowerCase().indexOf(name.toLowerCase()) === 0);

  private filterTreatment = (name: string): IService[] | undefined => this.treatmentList?.filter(
    option => option.name?.toLowerCase().indexOf(name.toLowerCase()) === 0);

  private filterOffice = (name: string): IOffice[] | undefined => this.offices?.filter(
    option => option.name?.toLowerCase().indexOf(name.toLowerCase()) === 0);

  private filterRoom = (addressName: string): IRoom[] | undefined => this.roomList?.filter(
    option => option.address?.name?.toLowerCase().indexOf(addressName.toLowerCase()) === 0);

  private filterProfessional = (name: string): IUser[] | undefined => this.professionalList?.filter(
    option => option.displayName?.toLowerCase().indexOf(name.toLowerCase()) === 0);

  private setData = (reservation: IReservationAll): void => {
    if (!this.reservation) {
      this.reservation = reservation;
      this.treatmentDiscount = this.reservation.treatment.discountCustomer;
      this.isPreview = false;
      const date = newDateTimestamp(reservation.timestamp, this.reservation.room.timeZone);
      this.room.setValue(reservation.room);
      this.professional.setValue(reservation.professional);
      const time = getTime(date, this.dateFormat);
      if (this.dateTimeList.controls?.length === 1) {
        const control = this.dateTimeList.at(0);
        const controlDate = control.get('date');
        if (!controlDate?.value) {
          controlDate?.setValue(date);
          control.get('start')?.setValue(time);
        } else {
          this.addDate(date, getTime(date, this.dateFormat));
        }
      } else {
        this.addDate(date, getTime(date, this.dateFormat));
      }
      this.customer.setValue(reservation.customer);
      this.price = getPrice(this.reservation);
      this.additionalSelected = this.reservation.additional ? this.reservation.additional
        .map(ad => Object.assign({}, ad, { id: ad.key })) : [];
      this.treatmentId = reservation.treatment.key;
      this.roomId = reservation.room.id;
      this.professionalId = reservation.professional.id;
      this.note.setValue(reservation.note);
      if (reservation.configurationCanCustomerChange !== null || reservation.configurationReference) {
        this.reference.setValue(reservation.configurationReference);
        this.customerChange.setValue(reservation.configurationCanCustomerChange);
      }
      completeAndNext(this.steps, this.myStepper, true);
    }
  };

  private cleanEvent = (): void => {
    this.alreadyCreated = false;
    for (const dataEvent of this.dataEvents.values()) {
      const event = this.events.at(dataEvent.index)?.get('event');
      if (event) {
        dataEvent.removeEvent(event.value);
        event.setValue(null);
      }
    }
  };

  private getReservation = (id: string | null): void => this.store.dispatch(
    new fromActionsReservation.ReservationFind({ id }));

  private getRoomList = (): void => this.store.dispatch(
    new fromActionsReservation.GetAllRooms({ customerId: this.customer?.value?.id }));

  private getTreatmentList = (): void => {
    const roomId = this.room?.value?.id || this.roomId;
    if (roomId) {
      this.store.dispatch(
        new fromActionsReservation.GetAllTreatments({ roomId, customerId: this.customer.value?.id }),
      );
    }
  };

  private getAdditionalList = (): void => {
    const roomId = this.room?.value?.id || this.roomId;
    const groupId = this.group?.value?.id || this.groupId;
    if (roomId) {
      this.store.dispatch(
        new fromActionsReservation.GetAllAdditional({ roomId, groupId }),
      );
    }
  };

  private clean = (): void => this.store.dispatch(new fromActionsReservation.Clean());

  private getCustomers = (): void => this.store.dispatch(new fromActionsReservation.GetAllCustomers());

  private setOffice = (): void => {
    let office;
    if (this.offices && this.roomId && !this.office.value) {
      office = this.offices?.find(office => office.rooms?.find(o => o.id === this.roomId) ? office : undefined);
    } else if (this.offices && this.offices.length === 1 && !this.office.value) {
      office = this.offices[0];
    } else if (this.offices && this.professionalId && !this.office.value) {
      office = this.offices.find(office => {
        const room = office.rooms?.find(
          r => r.professionals?.find(o => o.id === this.professionalId) ? r : undefined);
        this.roomId = room?.id;
        return room ? office : undefined;
      });
    }
    if (office) {
      this.office.setValue(office);
      if (!this.skip) {
        setTimeout(() => getStepCall(this.steps, 1, true), 300);
      }
    }
  };

  private setCustomerInfo = (treatmentIndex?: number): void => {
    if (this.customerInfo && this.myStepper.selectedIndex === treatmentIndex) {
      this.treatmentId = this.treatmentId || this.customerInfo.treatment.key;
      this.customerAdditionalIds = this.customerAdditionalIds || this.customerInfo.additionalIds;
    }
  };

  private setAdditional = (): void => {
    if (this.additionalList && this.additionalList.length) {
      const additionalIndex = enableStep(this.steps, 'post_add');
      if (this.customerAdditionalIds?.length && !this.additionalSelected.length && this.myStepper.selectedIndex ===
        additionalIndex) {
        this.additionalSelected = this.additionalList.filter(ad => this.customerAdditionalIds?.includes(ad.id))
          .map(ad => Object.assign({}, ad, { id: ad.id }));
        this.price = newAdditional(this.price, this.additionalSelected, this.reservation?.treatment?.discountCustomer);
      }

      if (this.additionalSelected?.length) {
        const selectIds = this.additionalSelected?.map(value => value.id);
        const newList = this.additionalList.filter(al => selectIds.includes(al.id));
        if (newList.length !== this.additionalSelected.length) {
          this.additionalSelected = newList;
          this.price =
            newAdditional(this.price, this.additionalSelected, this.reservation?.treatment?.discountCustomer);
        }
      }
      if (this.additionalIds?.length) {
        const ids = this.additionalIds;
        const newList = this.additionalList.filter(al => ids.includes(al.id));
        if (newList.length !== this.additionalSelected.length) {
          this.additionalSelected = newList;
          this.additionalIds = [];
          this.price =
            newAdditional(this.price, this.additionalSelected, this.reservation?.treatment?.discountCustomer);
        }
      }
    }
  };

  private subscribe = (): void => {
    this.subscription = this.getState.subscribe(state => {
      this.offices = Array.from(createRoomOffice(state.rooms)?.values() || []);
      this.customerInfo = state.customer;
      this.customers = state.customers;
      this.additionalList = state.additional;
      this.setOffice();
      const treatment = getIndex(this.steps, 'spa');
      this.setCustomerInfo(treatment);
      this.setAdditional();
      if (!this.groups && state.treatmentDiscount?.treatments) {
        this.groups = Array.from(
          createTreatmentGroupService(new Map<string, IGroupService>(), state.treatmentDiscount.treatments,
            this.room.value.currency).values());
      }
      if (this.groups && this.treatmentId && !this.group.value) {
        this.group.setValue(
          this.groups?.find(group => group.treatments?.find(p => p.id === this.treatmentId) ? group : undefined));
      }
      this.discounts = state.treatmentDiscount?.discounts.map((ud: IUserDiscount) => {
        let title = ud.discountCustomer.name;
        switch (ud.discountCustomer.type) {
          case DiscountType.money:
            title = `$ ${ ud.discountCustomer.amount } ${ title }`;
            break;
          case DiscountType.percentage:
            title = `${ ud.discountCustomer.amount } % ${ title }`;
            break;
        }
        return Object.assign({}, ud, { title });
      });
      if (state.selected) {
        this.setData(state.selected);
      }

      if (this.skip && !this.customerForm.invalid && !this.officeForm.invalid && !this.treatmentForm.invalid &&
        !this.configurationForm.invalid) {
        for (let i = 0; i < 5; i++) {
          setTimeout(() => getStepCall(this.steps, i, true), 300);
        }
        this.skip = false;
      }

      if (state.data && (Array.isArray(state.data) && (Array.isArray(state.data[0].reservations) || Array.isArray(
        state.data[0].unavailableList))) && !state.isLoading) {
        state.data.forEach((data: any) => {
          const dataEvent = this.dataEvents.get(data.date);
          if (dataEvent && dataEvent.calendarEvents.length === dataEvent.unavailableEventLength) {
            this.addNotAvailable(dataEvent);
            dataEvent.addEvents(this.addReservations(data.reservations));
            this.addUnavailableList(dataEvent, data.unavailableList);
            dataEvent.recurringEvent?.execute();
            const bookOrder = getIndex(this.steps, 'book_online');
            setTimeout(() => {
              const dateTime = this.dateTimeList.at(dataEvent.index);
              const start = dateTime.get('start')?.value;
              const dateValue = dateTime?.get('date')?.value;
              if (this.reservationId && this.reservation && dateValue
                && this.myStepper.selectedIndex === bookOrder) {
                let date: Date;
                if (start) {
                  const time = getTimeNumber(start);
                  date = createNewDate(dateValue, time?.hour, time?.minute);
                } else {
                  date = createNewDate(dateValue, dateValue.getHours(), dateValue.getMinutes());
                }
                if (isEqual(newDateTimestamp(this.reservation.timestamp), date)) {
                  const duration = reservationDuration(this.reservation);
                  const end = createNewDate(date, date.getHours() + duration.hour,
                    date.getMinutes() + duration.minute);
                  const event = this.createNewEvent(date, end, 'EDITING', this.reservation.room.timeZone,
                    this.reservation.id);
                  if (event) {
                    this.events.at(dataEvent.index)?.get('event')?.setValue(event);
                    dataEvent.addEvent(event);
                  }
                } else {
                  this.segmentClick(date, 'EDITING', data.date, this.reservation.id);
                }
              } else if ((this.extras?.date || start && this.myStepper.selectedIndex === bookOrder)) {
                this.segmentClick(dateValue, 'CREATED', data.date);
              }
            }, 50);
          }
        });
      }
      if (state.subErrors) {
        this.isPreview = false;
        state.subErrors.forEach((value: any) => {
          let step = this.isEditing ? this.isAdmin ? 1 : 2 : 0;
          switch (value.field) {
            case 'room':
              step = 1;
              break;
            case 'professional':
              step = 3;
              break;
          }
          this.errors[value.field] = value.message;
          this.myStepper.selectedIndex = step;
          this.customerForm.controls[value.field]?.setErrors({ incorrect: true });
          this.officeForm.controls[value.field]?.setErrors({ incorrect: true });
          this.cleanEvent();
          setTimeout(() => {
            const inputField = document.querySelector(
              `input[formControlName="${ value.field }"]`,
            ) as HTMLInputElement;
            if (inputField) {
              inputField.focus();
              inputField.blur();
            }
          }, 100);
        });
      }
    });
  };
}
