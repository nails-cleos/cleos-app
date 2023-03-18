import {
  AfterViewInit, ChangeDetectorRef, Component, Inject, Input, OnDestroy, OnInit, ViewChild
} from '@angular/core';
import { STEPPER_GLOBAL_OPTIONS } from '@angular/cdk/stepper';
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { map, startWith } from 'rxjs/operators';
import { IUser, IUserAll } from '../interfaces/user';
import { Observable, Subject, Subscription } from 'rxjs';
import { Store } from '@ngrx/store';
import { AppState, selectAuthState, selectReservationState } from '../store/app.states';
import * as fromActionsReservation from '../store/reservation.actions';
import { requireMatch, valueChange } from '../util/validators';
import { IGroupService, IPrice, IProduct, IProductGroup, Price } from '../interfaces/product';
import { MatStepper } from '@angular/material/stepper';
import { IRoom, IService } from '../interfaces/room';
import {
  Day, ICustomerLastReservation, IDay, IReservation, IReservationAll, MAX_RESERVATION_MONTH, Reservation
} from '../interfaces/reservation';
import { CalendarEvent, CalendarEventTimesChangedEvent } from 'angular-calendar';
import { TranslateService } from '@ngx-translate/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { DialogComponent } from '../shared/dialog/dialog.component';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import {
  API_LOCALE, createDate, createFullDate, createNewDate, dateToTimestamp, dateToUTC, Duration, filterDateRoom,
  getAvailability, getCurrentTimeZone, getDuration, getNow, getStartEndDay, getTime, greaterOrEqualsThan, IDuration,
  isBetween, isSameTimeZone, newDate, newDateTimestamp, reservationDuration, totalDuration
} from '../util/dates';
import { createRecurringEvent, fillNotAvailable, getOverlapEvent, Meta, newEvent } from '../util/event';
import { ActivatedRoute, Router } from '@angular/router';
import { DateAdapter } from '@angular/material/core';
import { Role } from '../interfaces/token';
import { IUnavailableAll } from '../interfaces/unavailable';
import { DiscountType, IUserDiscount } from '../interfaces/discount';
import {
  createProductGroupService, createRoomOffice, getBackIndex, getFullUserName, getPrice, getProductDurability, getStep,
  getUserName, newAdditional, newDiscount, newPrice, openDialog, roomDetail
} from '../util/helper';
import { transitionAnimation } from '../util/animation';
import { addDays, addMonths, isEqual, isSameDay } from 'date-fns';
import { findStateColor, isDarkMode } from '../util/theme';
import { IAdditionalAll } from '../interfaces/additional';
import { MatListOption } from '@angular/material/list';
import { IOffice } from '../interfaces/office';
import { IStep, Step } from '../interfaces/step';
import { TimeZoneSnackBarComponent } from '../shared/snak/time-zone/time-zone-snack-bar.component';
import { MatSnackBar } from '@angular/material/snack-bar';
import { DiscountDialogComponent } from '../discount/list/discounts.component';
import GeocoderResult = google.maps.GeocoderResult;

@Component({
  selector: 'app-reservation',
  animations: [transitionAnimation],
  templateUrl: './reservation.component.html',
  styleUrls: ['./reservation.component.scss'],
  providers: [{
    provide: STEPPER_GLOBAL_OPTIONS, useValue: { displayDefaultIndicatorType: false }
  }]
})
export class ReservationComponent implements OnInit, AfterViewInit, OnDestroy {
  @Input() events: CalendarEvent[] = [];
  @ViewChild('stepper') myStepper!: MatStepper;

  errors: any = [];

  customerForm!: UntypedFormGroup;
  customers?: IUserAll[];
  filteredCustomer?: Observable<IUser[] | undefined>;
  customer: UntypedFormControl = new UntypedFormControl('', [
    Validators.required, requireMatch
  ]);
  customerInfo?: ICustomerLastReservation;

  productForm!: UntypedFormGroup;
  groups?: IGroupService[];
  filteredGroup?: Observable<IGroupService[] | undefined>;
  group: UntypedFormControl = new UntypedFormControl('', [
    Validators.required, requireMatch
  ]);
  productList?: IService[];
  filteredProduct?: Observable<IService[] | undefined>;
  product: UntypedFormControl = new UntypedFormControl('', [
    Validators.required, requireMatch
  ]);

  discounts?: IUserDiscount[];
  discount = new UntypedFormControl();
  showDiscount = false;
  price: IPrice;

  officeForm!: UntypedFormGroup;
  offices?: IOffice[];
  filteredOffice?: Observable<IOffice[] | undefined>;
  office: UntypedFormControl = new UntypedFormControl('', [
    Validators.required, requireMatch
  ]);
  roomList?: IRoom[];
  filteredRoom?: Observable<IRoom[] | undefined>;
  room: UntypedFormControl = new UntypedFormControl('', [
    Validators.required, requireMatch
  ]);
  professionalList?: IUser[];
  filteredProfessional?: Observable<IUser[] | undefined>;
  professional: UntypedFormControl = new UntypedFormControl('', [
    requireMatch
  ]);
  address?: string;

  date: UntypedFormControl = new UntypedFormControl('', [
    Validators.required
  ]);

  start: UntypedFormControl = new UntypedFormControl('');

  additionalList: IAdditionalAll[] = [];
  additionalSelected: IAdditionalAll[] = [];

  configurationForm!: UntypedFormGroup;
  customerChange: UntypedFormControl = new UntypedFormControl();
  reference: UntypedFormControl = new UntypedFormControl();

  viewDate: Date = getNow();
  daysInWeek = 7;
  weekendDays: number[] = [0, 6];
  unavailableEventLength = 0;
  day: IDay;
  refresh: Subject<any> = new Subject();

  eventSelected?: CalendarEvent;
  locale: string;
  smallScreen?: boolean;
  isPreview = false;
  duration: IDuration = new Duration();

  isEditing = false;
  isAdmin = false;
  reservationId?: string;

  minDate: any;
  maxDate: any;
  maxCalendarDate: Date;
  durability?: string;

  private productId?: string;
  private roomId?: string;
  private professionalId?: string;
  private isDarkMode = false;
  private readonly isDashboard = false;
  private readonly extras: any;
  private lessDays = 3;
  private reservations?: IReservationAll[];
  private reservation?: IReservationAll;
  private unavailableList?: IUnavailableAll[];
  private getState: Observable<any>;
  private subscription?: Subscription;
  private steps: IStep[];
  private dismiss = false;

  constructor(private readonly translate: TranslateService, public dialog: MatDialog, private store: Store<AppState>,
              private formBuilder: UntypedFormBuilder, private breakpointObserver: BreakpointObserver,
              private router: Router, private route: ActivatedRoute, private adapter: DateAdapter<any>,
              private cdRef: ChangeDetectorRef, private snackBar: MatSnackBar) {
    this.price = new Price();
    this.day = new Day();
    this.getState = this.store.select(selectReservationState);
    this.locale = this.translate.currentLang;
    this.adapter.setLocale(this.locale);
    breakpointObserver.observe([
      Breakpoints.XSmall,
      Breakpoints.Small
    ]).subscribe(result => {
      this.smallScreen = result.matches;
      if (this.smallScreen) {
        this.daysInWeek = 3;
        this.lessDays = 1;
      }
    });
    this.extras = this.router.getCurrentNavigation()?.extras.state;
    if (this.extras) {
      this.productId = this.extras.product?.key || this.extras.product?.id;
      this.customer.setValue(this.extras.customer);
      this.roomId = this.extras.room?.id;
      this.professionalId = this.extras.professional?.id;
      this.isDashboard = this.extras.isDashboard;
      if (this.extras.date) {
        this.date.setValue(this.extras.date);
        this.start.setValue(getTime(this.extras.date, this.locale));
      }
    }
    this.store.select(selectAuthState).subscribe((state: any) => {
      if (state.user) {
        const user: IUserAll = state.user;
        this.isAdmin = user.authorities.some(u => u.authority === Role.admin);
        this.isDarkMode = isDarkMode(user.theme);
      }
    });
    this.maxCalendarDate = addMonths(getNow(), MAX_RESERVATION_MONTH);
    const preview = new Step(6, 'preview', () => this.create);
    const book = new Step(5, 'book_online', () => this.callStepSeven, preview);
    const settings = new Step(4, 'settings', () => this.callStepSix, book);
    const additional = new Step(3, 'post_add', () => this.callStepFive, settings);
    const product = new Step(2, 'home_repair_service', () => this.callStepFour, additional);
    const room = new Step(1, 'room', () => this.callStepThree, product);
    const customer = new Step(0, 'person_search', () => this.callStepTwo, room);
    this.steps = [customer, room, product, additional, settings, book, preview];
  }

  get productDetail(): string {
    if (this.customerInfo) {
      return this.customerInfo.product.name;
    }
    return '';
  }

  get roomDetail(): string {
    return roomDetail(this.room.value);
  }

  get back(): void {
    if (this.isPreview) {
      this.isPreview = false;
    }
    else {
      this.eventSelected = undefined;
    }
    this.myStepper.selectedIndex = getBackIndex(this.steps, this.myStepper.selectedIndex);
    return;
  }

  get callStepTwo(): void {
    if (this.customerForm.invalid) {
      return;
    }
    this.getRoomList();
    return this.completeAndNext();
  }

  get callStepThree(): void {
    if (this.officeForm.invalid) {
      return;
    }
    this.getProductList();
    return this.completeAndNext();
  }

  get callStepFour(): void {
    if (this.productForm.invalid) {
      return;
    }
    return this.completeAndNext();
  }

  get callStepFive(): void {
    return this.completeAndNext();
  }

  get callStepSix(): void {
    if (this.configurationForm.invalid) {
      return;
    }
    this.duration = totalDuration(this.product.value, this.additionalSelected);
    this.events = [];

    const timeZone = this.room.value.timeZone;

    let date = dateToUTC(newDate(this.date.value), timeZone);
    const now = dateToUTC(createDate(), timeZone);
    date = addDays(date, -this.lessDays);
    if (date < createFullDate(now)) {
      date = now;
    }

    const { monday, tuesday, wednesday, thursday, friday, saturday, sunday, exclude } = getAvailability(
      this.room.value);
    this.weekendDays = exclude;

    const { min, max } = getStartEndDay(monday, tuesday, wednesday, thursday, friday, saturday, sunday, timeZone);
    this.day = new Day(min, max, getNow(), exclude, 1);
    const unavailable = this.translate.instant('RESERVATION.EVENT.MESSAGE.UNAVAILABLE');
    const lunch = this.translate.instant('RESERVATION.EVENT.MESSAGE.LUNCH');
    const notWorking = this.translate.instant('RESERVATION.EVENT.MESSAGE.OUT_OF_WORK');
    this.events = this.events.concat(fillNotAvailable(unavailable, lunch, notWorking,
      date, sunday, saturday, friday, thursday, wednesday, tuesday, monday, this.isDarkMode,
      addMonths(getNow(), MAX_RESERVATION_MONTH), timeZone));
    this.unavailableEventLength = this.events.length;
    this.viewDate = date;
    this.store.dispatch(
      new fromActionsReservation.SearchReservation({
        date: this.date.value,
        roomId: this.room.value.id,
        professionalId: this.professional.value.id,
        days: this.daysInWeek
      })
    );
    return this.completeAndNext();
  }

  get callStepSeven(): void {
    this.errors.schedule = false;
    this.errors.overlapping = false;
    if (!this.eventSelected) {
      this.errors.schedule = true;
      return;
    }
    this.isPreview = true;
    return this.completeAndNext();
  }

  get create(): void {
    const reservation: IReservation = new Reservation();
    reservation.customerId = this.customer.value.id;
    reservation.roomId = this.room.value.id;
    reservation.professionalId = this.professional.value.id;
    if (this.eventSelected) {
      reservation.start = this.eventSelected.start.toLocaleString(API_LOCALE);
      reservation.timeZone = getCurrentTimeZone();
      reservation.additionalIds = this.additionalSelected?.map(value => value.id);

      const role = this.isDashboard ? Role.roomAdmin : Role.professional;
      if (this.isEditing && this.reservation) {
        reservation.id = this.reservation.id;
        reservation.productId = valueChange(this.product.value.id, this.reservation.product.id);
        reservation.roomId = valueChange(this.room.value.id, this.reservation.room.id);
        reservation.professionalId = valueChange(this.professional.value.id, this.reservation.professional.id);
        this.store.dispatch(
          new fromActionsReservation.Edit({ reservation, role })
        );
      }
      else {
        reservation.productId = this.product.value.id;
        reservation.roomId = this.room.value.id;
        reservation.professionalId = this.professional.value.id;
        reservation.discountId = this.discount.value;
        reservation.canCustomerChange = this.customerChange.value;
        reservation.reference = this.reference.value;
        this.store.dispatch(
          new fromActionsReservation.ReservationSave({ reservation, role })
        );
      }
    }
    return;
  }

  get addCustomer(): void {
    this.router.navigate(['users', 'add'], { state: { role: Role.customer } });
    return;
  }

  get showTimeZone(): boolean {
    return !isSameTimeZone(this.room.value.timeZone);
  }

  private static goNext(step: IStep): void {
    console.log("NEXT")
    const nextStep = step.next;
    if (nextStep && !nextStep.enable) {
      nextStep.call();
    }
    return;
  }

  ngOnInit(): void {
    this.createForm();
    this.createFilters();
    this.clean();
    this.subscribe();
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
            case 4:
              value.enable = false;
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
  }

  ngAfterViewInit(): void {
    if (this.isEditing) {
      if (this.isAdmin) {
        this.getRoomList();
      } else {
        this.getProductList();
      }
      if (this.date.value) {
        const { monday, tuesday, wednesday, thursday, friday, saturday, sunday } = getAvailability(this.room.value);
        const { min, max } = getStartEndDay(monday, tuesday, wednesday, thursday, friday, saturday, sunday, this.room.value.timeZone);
        if (min) {
          this.minDate = getTime(min);
        }
        if (max) {
          this.maxDate = getTime(max);
        }
      }
    }
    this.cdRef.detectChanges();
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }

  getStepName(index: number): string {
    const step = getStep(this.steps, index);
    return step ? step.name : '';
  }

  getStepEnabled(index: number): boolean {
    const step = getStep(this.steps, index);
    return !!step?.enable;
  }

  getStepCompleted(index: number): boolean {
    const step = getStep(this.steps, index);
    return !!step?.completed;
  }

  myFilter = (d: Date | null): boolean => filterDateRoom(d, this.room.value);

  displayFnUser(user: IUser): string {
    return user ? getUserName(user) : '';
  }

  displayFnGroup(group: IProductGroup): string {
    return group ? `${group.name}` : '';
  }

  displayFnProduct(product: IProduct): string {
    return product ? `${product.name}` : '';
  }

  displayFnOffice(office: IOffice): string {
    return office ? `${office.name}` : '';
  }

  displayFnRoom(room: IRoom): string {
    return room.address ? room.address.name : '';
  }

  displayFnProfessional(professional: IUser): string {
    return professional ? getFullUserName(professional) : '';
  }

  openDialog(reservationDate?: Date): void {
    openDialog(this.room.value, this.locale, this.translate, this.dialog, reservationDate);
  }

  segmentClick(date: Date, state: string, id?: string): void {
    if (!this.dateIsValid(date)) {
      return;
    }
    if (!this.professionalId) {
      const dialogRef = this.dialog.open(SelectProfessionalDialogComponent, {
        disableClose: true,
        data: {
          professionals: this.professionalList,
          small: this.smallScreen
        }
      });

      dialogRef.afterClosed().subscribe(result => {
        if (result) {
          this.professional.setValue(result.professional);
          this.createEvent(date, state, id);
        }
      });
    }
    else {
      this.createEvent(date, state, id);
    }
  }

  getAddress($event: GeocoderResult): void {
    this.address = $event.formatted_address;
  }

  timeChange($event: string): void {
    const time = $event.split(':');
    this.date.value.setHours(time[0], time[1]);
  }

  keyDownHandler(event: any, form: UntypedFormControl): void {
    if (event.code === 'Backspace') {
      form.setValue('');
    }
  }

  keyDownGroup(event: any): void {
    this.productList = undefined;
    this.keyDownHandler(event, this.product);
    this.keyDownHandler(event, this.group);
  }

  keyDownOffice(event: any): void {
    if (event.code === 'Backspace') {
      this.office.setValue('');
      this.keyDownRoom(event);
    }
  }

  keyDownRoom(event: any): void {
    if (event.code === 'Backspace') {
      this.professionalList = undefined;
      this.roomId = undefined;
      this.professionalId = undefined;
      this.keyDownHandler(event, this.professional);
      this.keyDownHandler(event, this.room);
    }
  }

  beforeMonthViewRender({ header }: any): void {
    header.forEach((day: any) => {
      if (!this.dateIsValid(day.date)) {
        day.cssClass = 'cal-disabled';
      }
    });
  }

  eventTimesChanged({ event, newStart, newEnd }: CalendarEventTimesChangedEvent): void {
    event.start = newStart;
    event.end = newEnd;
    console.log(event)
    this.refresh.next(event);
  }

  onChange(options: MatListOption[]): void {
    this.additionalSelected = options.map(o => o.value);
    this.price = newAdditional(this.price, this.additionalSelected);
  }

  isSelected(it: IAdditionalAll): boolean {
    return this.additionalSelected.filter(el => el.id === it.id).length > 0;
  }

  private createEvent(date: Date, state: string, id?: string): void {
    this.errors.overlapping = false;
    this.date.setValue(date);
    this.start.setValue(getTime(date, this.locale));
    const nowTime = date.toLocaleTimeString(API_LOCALE).split(':');

    const start = createNewDate(date, Number(nowTime[0]), Number(nowTime[1]));
    const end = createNewDate(start, start.getHours() + this.duration.hour,
      start.getMinutes() + this.duration.minute);
    const event = this.createNewEvent(start, end, state, this.room.value.timeZone, id);

    if (event) {
      let title;
      let content;
      const eventsOverlapping = getOverlapEvent(this.events, start, end, this.professionalId);
      if (eventsOverlapping.length && eventsOverlapping[0] !== this.eventSelected) {
        let message = '';
        eventsOverlapping.forEach(e => {
          message += `<div>${e.title}</div>`;
        });
        title = this.translate.instant('RESERVATION.EVENT.OVERLAPPING.TITLE');
        content = this.translate.instant('RESERVATION.EVENT.OVERLAPPING.CONTENT', { data: message });
      }
      else {
        if (!this.eventSelected && !id) {
          title = this.translate.instant('RESERVATION.EVENT.TITLE');
          content = this.translate.instant('RESERVATION.EVENT.CONTENT', { date: start.toLocaleString(API_LOCALE) });
        }
        else {
          title = this.translate.instant('RESERVATION.EVENT.CHANGE.TITLE');
          content = this.translate.instant('RESERVATION.EVENT.CHANGE.CONTENT',
            { date: start.toLocaleString(API_LOCALE) });
        }
      }
      this.createSelectEvent(title, content, event);
    }
  }

  private createNewEvent(start: Date, end: Date, state: string, timeZone: string = getCurrentTimeZone(),
                         id?: string): CalendarEvent | undefined {
    const detail = this.translate.instant('RESERVATION.EVENT.DETAIL', {
      customerName: getUserName(this.customer.value),
      productName: this.product.value.name,
      professionalName: getUserName(this.professional.value)
    });

    const meta = new Meta(true, timeZone, undefined, undefined, this.professional.value.id);
    return newEvent(detail, findStateColor(state, this.isDarkMode), start, end, this.isDarkMode, id, meta, true);
  }

  private dateIsValid(date: Date): boolean {
    return isBetween(getNow(), this.maxCalendarDate, date);
  }

  private getReservation(id: string | null): void {
    this.store.dispatch(
      new fromActionsReservation.ReservationFind({ id })
    );
  }

  private getRoomList(): void {
    this.store.dispatch(
      new fromActionsReservation.GetAllRooms({ customerId: this.customer?.value?.id })
    );
  }

  private getProductList(): void {
    const roomId = this.room?.value?.id || this.roomId;
    if (roomId) {
      this.store.dispatch(
        new fromActionsReservation.GetAllServices({ roomId, customerId: this.customer.value?.id })
      );
    }
  }

  private createForm(): void {
    this.customerForm = this.formBuilder.group({
      customer: this.customer
    });
    this.productForm = this.formBuilder.group({
      product: this.product,
      discount: this.discount,
      date: this.date,
      start: this.start
    });
    this.officeForm = this.formBuilder.group({
      office: this.office,
      room: this.room,
      professional: this.professional
    });
    this.configurationForm = this.formBuilder.group({
      customerChange: this.customerChange,
      reference: this.reference
    });
    this.valueChanges();
  }

  private valueChanges(): void {
    this.customer.valueChanges.subscribe((value) => {
      this.customerInfo = undefined;
      if (value && value.id) {
        this.store.dispatch(
          new fromActionsReservation.GetCustomerInfo(value.id)
        );
      }
      this.cleanProduct();
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
      }
      else {
        if (this.roomList?.length === 1) {
          this.room.setValue(this.roomList[0]);
        }
        else {
          this.room.setValue('');
        }
      }
    });
    this.room.valueChanges.subscribe((value) => {
      if (value) {
        if (!this.dismiss && !isSameTimeZone(value.timeZone)) {
          const now = getNow();
          const snack = this.snackBar.openFromComponent(TimeZoneSnackBarComponent, {
            data: { date: now, timeZone: value.timeZone }
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
        }
        else {
          if (this.professionalList?.length === 1) {
            this.professional.setValue(this.professionalList[0]);
          }
          else {
            this.professional.setValue('');
          }
        }
      }
      this.group.setValue('');
      this.cleanProduct();
    });
    this.professional.valueChanges.subscribe(value => this.professionalId = value ? value.id : undefined);
    this.group.valueChanges.subscribe(value => {
      if (!value) {
        return;
      }
      this.productList = value.products;
      const product = value.products?.find((p: IProductGroup) => p.id === this.productId);
      if (product) {
        this.productList = value.products;
        this.product.setValue(product);
        this.productId = this.product.value.id;
      }
      else {
        if (this.productList?.length === 1) {
          this.product.setValue(this.productList[0]);
        }
        else {
          this.product.setValue('');
        }
      }
      this.durability = getProductDurability(value.durabilityMin, value.durabilityMax, this.translate);
    });
    this.product.valueChanges.subscribe(value => {
      if (value) {
        this.price = newPrice(this.price, value.price);
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
          console.log(this.price.priceWithDiscount)
          this.price = newDiscount(this.price, userDiscount.discount);
          console.log(this.price)
        }
      }
    });
    this.customerChange.valueChanges.subscribe((value) => {
      if (value) {
        this.reference.setValidators([Validators.required]);
        this.reference.updateValueAndValidity();
      }
      else {
        this.reference.setValidators([]);
        this.reference.updateValueAndValidity();
      }
    });
  }

  private cleanProduct(): void {
    this.price = new Price();
    this.discount.setValue(undefined);
    this.product.setValue('');
    this.showDiscount = false;
    this.productList = undefined;
  }

  private createFilters(): void {
    this.filteredCustomer = this.customer.valueChanges.pipe(
      startWith(''),
      map(value => typeof value === 'string' ? value : value.name),
      map(name => name ? this.filterCustomer(name) : this.customers ? this.customers.slice() : this.customers)
    );
    this.filteredGroup = this.group.valueChanges.pipe(startWith(''),
      map(value => typeof value === 'string' ? value : value.name),
      map(name => name ? this.filterGroup(name) : this.groups ? this.groups.slice() : this.groups)
    );
    this.filteredProduct = this.product?.valueChanges.pipe(
      startWith(''),
      map(value => typeof value === 'string' ? value : value.name),
      map(name => name ? this.filterProduct(name) : this.productList ? this.productList.slice() : this.productList)
    );
    this.filteredOffice = this.office.valueChanges.pipe(startWith(''),
      map(value => typeof value === 'string' ? value : value.name),
      map(name => name ? this.filterOffice(name) : this.offices ? this.offices.slice() : this.offices)
    );
    this.filteredRoom = this.room.valueChanges.pipe(
      startWith(''),
      map(value => typeof value === 'string' ? value : value.name),
      map(addressName => addressName ? this.filterRoom(
        addressName) : this.roomList ? this.roomList.slice() : this.roomList)
    );
    this.filteredProfessional = this.professional.valueChanges.pipe(
      startWith(''),
      map(value => typeof value === 'string' ? value : value.name),
      map(addressName => addressName ? this.filterProfessional(addressName) : this.professionalList
        ? this.professionalList.slice() : this.professionalList)
    );
  }

  private clean(): void {
    this.store.dispatch(
      new fromActionsReservation.Clean()
    );
  }

  private addReservations(): void {
    this.reservations?.forEach(it => {
      if (it.id === this.reservationId) {
        return;
      }
      if (it.product.duration) {
        if (it.timestamp < dateToTimestamp()) {
          return;
        }
        const timeZone = it.room.timeZone;
        const start = newDateTimestamp(it.timestamp);
        const duration = reservationDuration(it);
        const end = createNewDate(start, start.getHours() + duration.hour, start.getMinutes() + duration.minute);
        const detail = this.translate.instant('RESERVATION.EVENT.DETAIL', {
          customerName: getUserName(it.customer),
          productName: it.product.name,
          professionalName: getUserName(it.professional)
        });

        const color = findStateColor(it.state, this.isDarkMode);
        const meta = new Meta(true, timeZone, undefined, undefined, it.professional.id);
        const event = newEvent(detail, color, start, end, this.isDarkMode, it.id, meta);
        if (event) {
          this.events = [...this.events, event];
        }
      }
    });
  }

  private addUnavailableList(): void {
    let recurringEvents: any[] = [];
    this.unavailableList?.forEach(it => {
      if (it.duration || it.allDay) {
        const startDate = newDateTimestamp(it.timestamp, this.room.value.timeZone);
        const start = it.allDay ? createNewDate(startDate) : startDate;
        const duration = getDuration(it.allDay, it.duration);
        if (it.repeat === 'NONE') {
          if (!greaterOrEqualsThan(start, this.maxDate)) {
            this.validateUnavailableEvent(start, duration, it);
          }
        }
        else {
          recurringEvents = [...recurringEvents, createRecurringEvent(start, this.viewDate, it, duration)];
        }
      }
    });

    recurringEvents.forEach(recurring => {
      recurring.rrule.all().forEach((date: Date) =>
        this.validateUnavailableEvent(date, recurring.duration, recurring.it));
    });
  }

  private validateUnavailableEvent(start: Date, duration: IDuration, it: IUnavailableAll): void {
    const end = createNewDate(start, start.getHours() + duration.hour, start.getMinutes() + duration.minute);
    const overlapEvent = getOverlapEvent(this.events, start, end);
    if (overlapEvent.length > 0) {
      overlapEvent.forEach(value => {
        if (value.id !== 'NOT_WORKING_ALL_DAY') {
          this.events = this.events.filter(ev => ev !== value);
          if (value.end) {
            if (start < value.start && end < value.end) {
              value.start = end;
              this.events = [...this.events, value];
            }
            else if (start > value.start && end > value.end) {
              value.end = start;
              this.events = [...this.events, value];
            }
          }
          if (!this.events.find(ce => ce.id === `unavailable/${it.id}` && isSameDay(value.start, ce.start))) {
            this.createUnavailableEvent(it, start, end);
          }
        }
      });
    }
    else {
      this.createUnavailableEvent(it, start, end);
    }
  }

  private createUnavailableEvent(it: IUnavailableAll, start: Date, end: Date): void {
    const detail = this.translate.instant('RESERVATION.EVENT.UNAVAILABLE', {
      description: it.description ? it.description : '',
      professionalName: getUserName(it.professional)
    });

    const color = findStateColor('DEFAULT', this.isDarkMode);
    const meta = new Meta(!it.allDay, this.room.value.timeZone, undefined, undefined, it.professional.id);
    const event = newEvent(detail, color, start, end, this.isDarkMode, `unavailable/${it.id}`, meta);
    if (event) {
      this.events = [...this.events, event];
    }
  }

  private getCustomers(): void {
    this.store.dispatch(
      new fromActionsReservation.GetAllCustomers()
    );
  }

  private subscribe(): void {
    this.subscription = this.getState.subscribe(state => {
      this.offices = Array.from(createRoomOffice(state.rooms)?.values() || []);
      if (this.offices && this.roomId && !this.office.value) {
        this.office.setValue(
          this.offices?.find(office => office.rooms?.find(o => o.id === this.roomId) ? office : undefined));
      }
      else if (this.offices && this.offices.length === 1 && !this.office.value) {
        this.office.setValue(this.offices[0]);
      }
      else if (this.offices && this.professionalId && !this.office.value) {
        this.offices.find(office => {
          const room = office.rooms?.find(
            r => r.professionals?.find(o => o.id === this.professionalId) ? r : undefined);
          this.roomId = room?.id;
          return room ? office : undefined;
        });
      }
      this.customerInfo = state.customer;
      this.customers = state.customers;
      this.additionalList = state.productDiscount?.additionalList;
      if (this.additionalList && this.additionalList.length) {
        // const sp = this.steps[3];
        // sp.enable = true;
        // this.steps[3] = sp;
      }
      if (state.productDiscount?.products) {
        this.groups = Array.from(
          createProductGroupService(new Map<string, IGroupService>(), state.productDiscount.products,
            this.room.value.currency).values());
      }
      if (this.groups && this.productId && !this.group.value) {
        this.group.setValue(
          this.groups?.find(group => group.products?.find(p => p.id === this.productId) ? group : undefined));
      }
      this.discounts = state.productDiscount?.discounts.map((ud: IUserDiscount) => {
        let title = ud.discount.name;
        switch (ud.discount.type) {
          case DiscountType.money:
            title = `$ ${ud.discount.amount} ${title}`;
            break;
          case DiscountType.percentage:
            title = `${ud.discount.amount} % ${title}`;
            break;
        }
        return Object.assign({}, ud, { title });
      });
      if (state.selected) {
        this.setData(state.selected);
      }
      if (state.data && (Array.isArray(state.data.reservations) || Array.isArray(
        state.data.unavailableList)) && !state.isLoading) {
        if (this.events.length === this.unavailableEventLength) {
          this.reservations = state.data.reservations;
          this.unavailableList = state.data.unavailableList;
          this.addReservations();
          this.addUnavailableList();
          if (this.reservationId && this.reservation && this.date && this.myStepper.selectedIndex === 4) {
            let date: Date;
            if (this.start && this.start.value) {
              const time = this.start.value.split(':');
              date = createNewDate(this.date.value, Number(time[0]), Number(time[1]));
            }
            else {
              date = createNewDate(this.date.value, this.date.value.getHours(), this.date.value.getMinutes());
            }
            console.log("RESERVATION START", this.reservation.start)
            if (isEqual(newDate(this.reservation.start), date)) {
              const duration = reservationDuration(this.reservation);
              const end = createNewDate(date, date.getHours() + duration.hour,
                date.getMinutes() + duration.minute);
              const event = this.createNewEvent(date, end, this.reservation.state, this.reservation.room.timeZone,
                this.reservation.id);
              if (event) {
                this.eventSelected = event;
                this.events = [...this.events, event];
              }
            }
            else {
              this.segmentClick(date, this.reservation.state, this.reservation.id);
            }
          }
          else if ((this.extras?.date || this.start.value && this.myStepper.selectedIndex === 4) && !this.eventSelected) {
            this.segmentClick(this.date.value, 'CREATED');
          }
        }
      }
      if (state.subErrors) {
        state.subErrors.forEach((value: any) => {
          switch (value.field) {
            case 'room':
              this.myStepper.selectedIndex = 1;
              break;
            case 'professional':
              this.myStepper.selectedIndex = 3;
              break;
            default:
              this.myStepper.selectedIndex = 0;
              break;
          }
          this.eventSelected = undefined;
          this.errors[value.field] = value.message;
          this.customerForm.controls[value.field]?.setErrors({ incorrect: true });
          this.officeForm.controls[value.field]?.setErrors({ incorrect: true });
        });
      }
    });
  }

  private createSelectEvent(title: string, content: string, event: CalendarEvent): void {
    const dialogRef = this.dialog.open(DialogComponent, {
      data: { title, content, value: event }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        if (this.eventSelected) {
          const i = this.events.indexOf(this.eventSelected);
          this.events.splice(i, 1);
        }
        this.eventSelected = event;
        this.events = [...this.events, event];
      }
    });
  }

  private filterCustomer(name: string): IUser[] | undefined {
    const filterValue = name.toLowerCase();

    return this.customers?.filter(option => getFullUserName(option)?.toLowerCase().indexOf(filterValue) === 0);
  }

  private filterGroup(name: string): IGroupService[] | undefined {
    const filterValue = name.toLowerCase();

    return this.groups?.filter(option => option.name?.toLowerCase().indexOf(filterValue) === 0);
  }

  private filterProduct(name: string): IService[] | undefined {
    const filterValue = name.toLowerCase();

    return this.productList?.filter(option => option.name?.toLowerCase().indexOf(filterValue) === 0);
  }

  private filterOffice(name: string): IOffice[] | undefined {
    const filterValue = name.toLowerCase();

    return this.offices?.filter(option => option.name?.toLowerCase().indexOf(filterValue) === 0);
  }

  private filterRoom(addressName: string): IRoom[] | undefined {
    const filterValue = addressName.toLowerCase();

    return this.roomList?.filter(option => option.address?.name?.toLowerCase().indexOf(filterValue) === 0);
  }

  private filterProfessional(name: string): IUser[] | undefined {
    const filterValue = name.toLowerCase();

    return this.professionalList?.filter(option => getFullUserName(option)?.toLowerCase().indexOf(filterValue) === 0);
  }

  private completeAndNext(): void {
    setTimeout(() => {
      const step = getStep(this.steps, this.myStepper.selectedIndex);
      console.log("Complete", step)
      if (step) {
        this.completeStep(step);
        ReservationComponent.goNext(step);
      }
    }, 100);
  }

  private completeStep(step: IStep): void {
    console.log("stepper", this.myStepper)
    this.myStepper.selectedIndex = step.order + 1;
    step.completed = true;
    this.steps[step.order] = step;
  }

  private setData(reservation: IReservationAll): void {
    if (!this.reservation) {
      this.completeAndNext();
    }
    this.reservation = reservation;
    this.isPreview = false;
    const date = newDateTimestamp(reservation.timestamp, this.reservation.room.timeZone)
    this.room.setValue(reservation.room);
    this.professional.setValue(reservation.professional);
    this.date.setValue(date);
    this.start.setValue(getTime(date, this.locale));
    this.customer.setValue(reservation.customer);
    this.price = getPrice(this.reservation);
    this.additionalSelected = this.reservation.additional ? this.reservation.additional
      .map(ad => Object.assign({}, ad, { id: ad.key })) : [];
    this.productId = reservation.product.key;
    this.roomId = reservation.room.id;
    this.professionalId = reservation.professional.id;
    if (reservation.configuration) {
      this.reference.setValue(reservation.configuration.reference);
      this.customerChange.setValue(reservation.configuration.canCustomerChange);
    }
  }
}

@Component({
  selector: 'app-select-professional-dialog-component',
  templateUrl: './select-professional-dialog.component.html'
})
export class SelectProfessionalDialogComponent implements OnInit {
  professionalForm!: UntypedFormGroup;
  professionals?: IUser[];
  filteredProfessional?: Observable<IUser[] | undefined>;
  professional: UntypedFormControl = new UntypedFormControl('', [
    Validators.required, requireMatch
  ]);

  constructor(public dialogRef: MatDialogRef<DiscountDialogComponent>, @Inject(MAT_DIALOG_DATA) public data: any,
              private formBuilder: UntypedFormBuilder) {
    this.professionals = data.professionals;
  }

  get onNoClick(): void {
    return this.dialogRef.close();
  }

  get doAction(): void {
    return this.dialogRef.close({ professional: this.professional.value });
  }

  ngOnInit(): void {
    this.createForm();
    this.createFilters();
  }

  displayFnUser(user: IUser): string {
    return user ? getUserName(user) : '';
  }

  keyDownHandler(event: any): void {
    if (event.code === 'Backspace') {
      this.professional.setValue('');
    }
  }

  private createForm(): void {
    this.professionalForm = this.formBuilder.group({
      professional: this.professional
    });
  }

  private createFilters(): void {
    this.filteredProfessional = this.professional.valueChanges.pipe(
      startWith(''),
      map(value => typeof value === 'string' ? value : value.name),
      map(name => name ? this.filterProfessional(
        name) : this.professionals ? this.professionals.slice() : this.professionals)
    );
  }

  private filterProfessional(name: string): IUser[] | undefined {
    const filterValue = name.toLowerCase();

    return this.professionals?.filter(option => getFullUserName(option)?.toLowerCase().indexOf(filterValue) === 0);
  }
}
