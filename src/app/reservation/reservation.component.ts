import { AfterViewInit, ChangeDetectorRef, Component, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { STEPPER_GLOBAL_OPTIONS } from '@angular/cdk/stepper';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { map, startWith } from 'rxjs/operators';
import { IUser, IUserAll } from '../interfaces/user';
import { Observable, Subscription } from 'rxjs';
import { Store } from '@ngrx/store';
import { AppState, selectAuthState, selectReservationState } from '../store/app.states';
import * as fromActionsReservation from '../store/reservation.actions';
import { requireMatch, valueChange } from '../util/validators';
import { IPrice, IProduct, Price } from '../interfaces/product';
import { MatStepper } from '@angular/material/stepper';
import { IAvailability, IRoom } from '../interfaces/room';
import { IReservation, IReservationAll, MAX_RESERVATION_MONTH, Reservation } from '../interfaces/reservation';
import { CalendarEvent } from 'angular-calendar';
import { TranslateService } from '@ngx-translate/core';
import { MatDialog } from '@angular/material/dialog';
import { DialogComponent } from '../shared/dialog/dialog.component';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import {
  convertDuration,
  createDate,
  createFullDate,
  createNewDate,
  Duration,
  filterDateRoom,
  getAvailability,
  getNow,
  getStartEndDay,
  getTime,
  getWeekDay,
  greaterOrEqualsThan,
  IDuration,
  isBetween,
  newDate,
  reservationDateTime
} from '../util/dates';
import { fillNotAvailable, getOverlapEvent, Meta, newEvent } from '../util/event';
import { ActivatedRoute, Router } from '@angular/router';
import { DateAdapter } from '@angular/material/core';
import { GeocoderResult } from '@agm/core';
import { Role } from '../interfaces/token';
import { IUnavailableAll } from '../interfaces/unavailable';
import { DiscountType, IUserDiscount } from '../interfaces/discount';
import { getFullUserName, getPrice, getUserName, newDiscount, newPrice } from '../util/helper';
import { transitionAnimation } from '../util/animation';
import { addDays, addMonths, isEqual } from 'date-fns';
import { findStateColor, isDarkMode } from '../util/theme';
import RRule from 'rrule';

@Component({
  selector: 'app-reservation',
  animations: [transitionAnimation],
  templateUrl: './reservation.component.html',
  styleUrls: ['./reservation.component.scss'],
  providers: [{
    provide: STEPPER_GLOBAL_OPTIONS, useValue: {displayDefaultIndicatorType: false}
  }]
})
export class ReservationComponent implements OnInit, AfterViewInit, OnDestroy {
  @Input() events: CalendarEvent[] = [];
  @ViewChild('stepper') myStepper!: MatStepper;

  errors: any = [];

  customerForm!: FormGroup;
  customers: IUserAll[] | undefined;
  filteredCustomer: Observable<IUser[] | undefined> | undefined;
  customer: FormControl = new FormControl('', [
    Validators.required, requireMatch
  ]);

  productForm!: FormGroup;
  products: IProduct[] | undefined;
  filteredProduct: Observable<IProduct[] | undefined> | undefined;
  product: FormControl = new FormControl('', [
    Validators.required, requireMatch
  ]);

  discounts: IUserDiscount[] | undefined;
  discount = new FormControl();
  showDiscount = false;
  price: IPrice;

  roomForm!: FormGroup;
  rooms: IRoom[] | undefined;
  filteredRoom: Observable<IRoom[] | undefined> | undefined;
  room: FormControl = new FormControl('', [
    Validators.required, requireMatch
  ]);
  address: string | undefined;

  date: FormControl = new FormControl('', [
    Validators.required
  ]);

  start: FormControl = new FormControl('', [
    Validators.required
  ]);

  viewDate: Date = getNow();
  dayStartHour = 9;
  dayStartMinute = 0;
  dayEndHour = 18;
  dayEndMinute = 0;
  daysInWeek = 7;
  weekendDays: number[] = [0, 6];
  unavailableEventLength = 0;

  eventSelected: CalendarEvent | undefined;
  locale: string;
  smallScreen: boolean | undefined;
  isPreview = false;
  duration: IDuration = new Duration();

  isEditing = false;
  isAdmin = false;

  minDate: any;
  maxDate: any;
  showTime = false;
  maxCalendarDate: Date;

  private productId: string | undefined;
  private isDarkMode = false;
  private readonly extras: any;
  private lessDays = 3;
  private reservations: IReservationAll[] | undefined;
  private reservation: IReservationAll | undefined;
  private unavailableList: IUnavailableAll[] | undefined;
  private getState: Observable<any>;
  private subscription: Subscription | undefined;

  constructor(private readonly translate: TranslateService, public dialog: MatDialog, private store: Store<AppState>,
              private formBuilder: FormBuilder, private breakpointObserver: BreakpointObserver,
              private router: Router, private route: ActivatedRoute, private adapter: DateAdapter<any>,
              private cdRef: ChangeDetectorRef) {
    this.price = new Price();
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
      this.productId = this.extras.product?.id;
      this.customer.setValue(this.extras.customer);
      this.room.setValue(this.extras.room);
      this.date.setValue(this.extras.date);
    }
    this.store.select(selectAuthState).subscribe((state: any) => {
      if (state.user) {
        const user: IUserAll = state.user;
        this.isAdmin = user.authorities.some(u => u.authority === Role.admin);
        this.isDarkMode = isDarkMode(user.theme);
      }
    });
    this.customer.valueChanges.subscribe(() => {
      this.discount.setValue(null);
      this.showDiscount = false;
    });
    this.product.valueChanges.subscribe(value => {
      if (value) {
        this.price = newPrice(this.price, value.price);
      }
    });
    this.discount.valueChanges.subscribe(value => {
      if (value && this.discounts) {
        const userDiscount = this.discounts.find(d => d.id === value);
        if (userDiscount) {
          this.price = newDiscount(this.price, userDiscount.discount);
        }
      }
    });
    this.maxCalendarDate = addMonths(getNow(), MAX_RESERVATION_MONTH);
  }

  get professionalName(): string {
    return getUserName(this.room.value.professional);
  }

  getDateTime(date: Date | string | undefined): string {
    return date ? reservationDateTime(newDate(date), this.locale) : '';
  }

  ngOnInit(): void {
    this.createForm();
    this.clean();
    this.subscribe();
    this.route.params.subscribe(routeParams => {
      const reservationId = routeParams.id;
      if (reservationId) {
        this.isEditing = true;
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
    }
    if (this.showTime) {
      this.productForm = this.formBuilder.group({
        ...this.productForm.controls,
        start: this.start
      });
      const day = this.date.value.getDay();
      let av: IAvailability;
      const {week, saturday, sunday} = getAvailability(this.room.value);
      switch (day) {
        case 0:
          av = sunday;
          break;
        case 6:
          av = saturday;
          break;
        default:
          av = week;
          break;
      }
      if (av.start) {
        this.minDate = av.start.slice(0, 5);
      }
      if (av.end) {
        this.maxDate = av.end.slice(0, 5);
      }
    }
    this.cdRef.detectChanges();
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }

  getUsername(user: any): string {
    return getFullUserName(user);
  }

  myFilter = (d: Date | null): boolean => filterDateRoom(d, this.room.value);

  displayFnUser(user: IUser): string {
    return user ? getUserName(user) : '';
  }

  displayFnProduct(product: IProduct): string {
    return product ? `${product.name}` : '';
  }

  displayFnRoom(room: IRoom): string {
    if (room) {
      return `${room.name}`;
    } else {
      return '';
    }
  }

  searchAvailability(): void {
    if (this.productForm.invalid) {
      return;
    }
    this.duration = convertDuration(this.product.value.duration);
    this.events = [];

    let date = newDate(this.date.value);
    const now = createDate();
    date = addDays(date, -this.lessDays);
    if (date < createFullDate(now)) {
      date = now;
    }

    const {week, saturday, sunday, exclude} = getAvailability(this.room.value);
    this.weekendDays = exclude;

    this.setStartEndDay(week, saturday, sunday);
    const unavailable = this.translate.instant('RESERVATION.EVENT.MESSAGE.UNAVAILABLE');
    const lunch = this.translate.instant('RESERVATION.EVENT.MESSAGE.LUNCH');
    const notWorking = this.translate.instant('RESERVATION.EVENT.MESSAGE.OUT_OF_WORK');
    this.events = this.events.concat(fillNotAvailable(unavailable, lunch, notWorking,
      date, sunday, saturday, week, this.isDarkMode, true, addMonths(getNow(), MAX_RESERVATION_MONTH)));
    this.unavailableEventLength = this.events.length;
    this.viewDate = date;
    this.store.dispatch(
      new fromActionsReservation.SearchReservation({date: this.date.value, roomId: this.room.value.id})
    );
    this.myStepper.next();
  }

  segmentClick(date: Date, state: string, id?: string): void {
    if (!this.dateIsValid(date)) {
      return;
    }
    this.errors.overlapping = false;
    const nowTime = date.toLocaleTimeString('en-GB').split(':');
    const duration = convertDuration(this.product.value.duration);

    const start = createNewDate(date, Number(nowTime[0]), Number(nowTime[1]));
    const end = createNewDate(start, start.getHours() + duration.hour, start.getMinutes() + duration.minute);
    const event = this.createNewEvent(start, end, state, id);

    if (event) {
      let title;
      let content;
      const eventsOverlapping = getOverlapEvent(this.events, start, end);
      if (eventsOverlapping.length && eventsOverlapping[0] !== this.eventSelected) {
        const overlapping = eventsOverlapping.find(e => e.id);
        if (overlapping) {
          this.errors.overlapping = this.translate.instant('RESERVATION.EVENT.OVERLAPPING.ERROR', {data: overlapping.title});
          return;
        }
        let message = '';
        eventsOverlapping.forEach(e => {
          message += `<div>${e.title}</div>`;
        });
        title = this.translate.instant('RESERVATION.EVENT.OVERLAPPING.TITLE');
        content = this.translate.instant('RESERVATION.EVENT.OVERLAPPING.CONTENT', {data: message});
      } else {
        if (!this.eventSelected && !id) {
          title = this.translate.instant('RESERVATION.EVENT.TITLE');
          content = this.translate.instant('RESERVATION.EVENT.CONTENT', {date: start.toLocaleString('en-GB')});
        } else {
          title = this.translate.instant('RESERVATION.EVENT.CHANGE.TITLE');
          content = this.translate.instant('RESERVATION.EVENT.CHANGE.CONTENT', {date: start.toLocaleString('en-GB')});
        }
      }
      this.createSelectEvent(title, content, event);
    }
  }

  preview(): void {
    this.errors.schedule = false;
    this.errors.overlapping = false;
    if (!this.eventSelected) {
      this.errors.schedule = true;
      return;
    }
    this.isPreview = true;
    this.myStepper.next();
  }

  create(): void {
    const reservation: IReservation = new Reservation();
    reservation.customerId = this.customer.value.id;
    reservation.roomId = this.room.value.id;
    if (this.eventSelected) {
      reservation.start = this.eventSelected.start.toLocaleString('en-GB');

      if (this.isEditing && this.reservation) {
        reservation.id = this.reservation.id;
        reservation.productId = valueChange(this.product.value.id, this.reservation.product.id);
        this.store.dispatch(
          new fromActionsReservation.Edit({reservation, isCustomer: false})
        );
      } else {
        reservation.productId = this.product.value.id;
        reservation.discountId = this.discount.value;
        this.store.dispatch(
          new fromActionsReservation.ReservationSave({reservation, isCustomer: false})
        );
      }
    }
  }

  goBack(): void {
    this.isPreview = false;
    this.myStepper.previous();
  }

  getProducts(): void {
    if (this.roomForm.invalid) {
      return;
    }
    this.getProductList();
    this.myStepper.next();
  }

  getRooms(): void {
    if (this.customerForm.invalid) {
      return;
    }
    this.getRoomList();
    this.myStepper.next();
  }

  addCustomer(): void {
    this.router.navigate(['users', 'add'], {state: {role: Role.customer}});
  }

  getAddress($event: GeocoderResult): void {
    this.address = $event.formatted_address;
  }

  timeChange($event: string): void {
    const time = $event.split(':');
    this.date.value.setHours(time[0], time[1]);
  }

  keyDownHandler(event: any, form: FormControl): void {
    if (event.code === 'Backspace') {
      form.setValue('');
    }
  }

  beforeMonthViewRender({header}: any): void {
    header.forEach((day: any) => {
      if (!this.dateIsValid(day.date)) {
        day.cssClass = 'cal-disabled';
      }
    });
  }

  private createNewEvent(start: Date, end: Date, state: string, id: string | undefined): CalendarEvent | undefined {
    const detail = this.translate.instant('RESERVATION.EVENT.DETAIL', {
      customerName: getUserName(this.customer.value),
      productName: this.product.value.name
    });

    const meta = new Meta(true);
    return newEvent(detail, findStateColor(state, this.isDarkMode), start, end, '#000', id, meta);
  }

  private dateIsValid(date: Date): boolean {
    return isBetween(getNow(), this.maxCalendarDate, date);
  }

  private getReservation(id: string | null): void {
    this.store.dispatch(
      new fromActionsReservation.ReservationFind(id)
    );
  }

  private getRoomList(): void {
    this.store.dispatch(
      new fromActionsReservation.GetAllRooms()
    );
  }

  private getProductList(): void {
    this.store.dispatch(
      new fromActionsReservation.GetAllProducts({customerId: this.customer.value.id})
    );
  }

  private createForm(): void {
    this.customerForm = this.formBuilder.group({
      customer: this.customer
    });
    this.productForm = this.formBuilder.group({
      product: this.product,
      discount: this.discount,
      date: this.date
    });
    this.roomForm = this.formBuilder.group({
      room: this.room
    });

    this.filteredCustomer = this.customer.valueChanges.pipe(
      startWith(''),
      map(value => typeof value === 'string' ? value : value.name),
      map(name => name ? this.filterCustomer(name) : this.customers ? this.customers.slice() : this.customers)
    );
    this.filteredProduct = this.product.valueChanges.pipe(
      startWith(''),
      map(value => typeof value === 'string' ? value : value.name),
      map(name => name ? this.filterProduct(name) : this.products ? this.products.slice() : this.products)
    );
    this.filteredRoom = this.room.valueChanges.pipe(
      startWith(''),
      map(value => typeof value === 'string' ? value : value.name),
      map(name => name ? this.filterRoom(name) : this.rooms ? this.rooms.slice() : this.rooms)
    );
  }

  private clean(): void {
    this.store.dispatch(
      new fromActionsReservation.Clean()
    );
  }

  private addReservations(): void {
    this.reservations?.forEach(it => {
      if (it.product.duration) {
        const start = newDate(it.start);
        if (start < getNow()) {
          return;
        }
        const duration = convertDuration(it.product.duration);
        const end = createNewDate(start, start.getHours() + duration.hour, start.getMinutes() + duration.minute);
        const detail = this.translate.instant('RESERVATION.EVENT.DETAIL', {
          customerName: getUserName(it.customer),
          productName: it.product.name
        });

        const color = findStateColor(it.state, this.isDarkMode);
        const meta = new Meta(true);
        const event = newEvent(detail, color, start, end, '#000', it.id, meta);
        if (event) {
          if (this.isEditing && this.reservation && this.reservation.id === it.id) {
            this.eventSelected = event;
          }
          this.events = [...this.events, event];
        }
      }
    });
  }

  private addUnavailableList(): void {
    let recurringEvents: any[] = [];
    this.unavailableList?.forEach(it => {
      if (it.duration) {
        const start = newDate(it.start);
        const duration = convertDuration(it.duration);
        if (it.repeat === 'NONE') {
          if (!greaterOrEqualsThan(start, this.maxDate)) {
            this.validateUnavailableEvent(start, duration, it);
          }
        } else {
          let startDate;
          let rrule;
          switch (it.repeat) {
            case 'ONCE_A_WEEK':
              const byweekday = getWeekDay(start.getDay());
              startDate = createNewDate(addDays(this.viewDate, (start.getDay() + 7 - this.viewDate.getDay()) % 7),
                start.getHours(), start.getMinutes());
              rrule = {
                freq: RRule.WEEKLY,
                byweekday
              };
              break;
            case 'EVERY_DAY':
              startDate = createNewDate(this.viewDate, start.getHours(), start.getMinutes());
              rrule = {
                freq: RRule.DAILY
              };
              break;
          }
          recurringEvents = [...recurringEvents, {duration, it, startDate, rrule}];
        }
      }
    });

    recurringEvents.forEach(recurring => {
      const rule: RRule = new RRule({
        ...recurring.rrule,
        dtstart: recurring.startDate,
        until: this.maxCalendarDate
      });

      rule.all().forEach((date) =>
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
            } else if (start > value.start && end > value.end) {
              value.end = start;
              this.events = [...this.events, value];
            }
          }
          this.createUnavailableEvent(it.id, start, end, it.description);
        }
      });
    } else {
      this.createUnavailableEvent(it.id, start, end, it.description);
    }
  }

  private createUnavailableEvent(id: string, start: Date, end: Date, description?: string): void {
    const detail = this.translate.instant('RESERVATION.EVENT.UNAVAILABLE', {
      description: description ? description : ''
    });

    const color = findStateColor('DEFAULT', this.isDarkMode);
    const meta = new Meta(true);
    const event = newEvent(detail, color, start, end, '#000', `unavailable/${id}`, meta);
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
      this.customers = state.customers;
      this.products = state.productDiscount?.products;
      if (this.products && this.productId) {
        this.product.setValue(this.products.find(product => product.id === this.productId));
        this.productId = this.product.value.id;
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
        return Object.assign({}, ud, {title});
      });
      this.rooms = state.rooms;
      if (this.rooms?.length === 1) {
        this.room.setValue(this.rooms[0]);
      }
      if (state.selected) {
        this.setData(state.selected);
      }
      if (state.data && (Array.isArray(state.data.reservations) || Array.isArray(state.data.unavailableList)) && !state.isLoading) {
        if (this.events.length === this.unavailableEventLength) {
          this.reservations = state.data.reservations;
          this.unavailableList = state.data.unavailableList;
          this.addReservations();
          this.addUnavailableList();
          if (this.extras?.date && !this.eventSelected) {
            this.segmentClick(this.date.value, 'CREATED');
          } else if (this.reservation && this.date && this.myStepper.selectedIndex === 3) {
            let date: Date;
            if (this.start && this.start.value) {
              const time = this.start.value.split(':');
              date = createNewDate(this.date.value, Number(time[0]), Number(time[1]));
            } else {
              date = createNewDate(this.date.value, this.date.value.getHours(), this.date.value.getMinutes());
            }
            if (isEqual(newDate(this.reservation.start), date)) {
              const duration = convertDuration(this.reservation.product.duration);
              const end = createNewDate(date, date.getHours() + duration.hour,
                date.getMinutes() + duration.minute);
              const event = this.createNewEvent(date, end, this.reservation.state, this.reservation.id);
              if (event) {
                this.eventSelected = event;
                this.events = [...this.events, event];
              }
            } else {
              this.segmentClick(date, this.reservation.state, this.reservation.id);
            }
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
          this.customerForm.controls[value.field]?.setErrors({incorrect: true});
          this.roomForm.controls[value.field]?.setErrors({incorrect: true});
        });
      }
    });
  }

  private createSelectEvent(title: string, content: string, event: CalendarEvent): void {
    const dialogRef = this.dialog.open(DialogComponent, {
      data: {title, content, value: event}
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

  private setStartEndDay(week: IAvailability, saturday: IAvailability, sunday: IAvailability): void {
    const {min, max} = getStartEndDay(week, saturday, sunday);

    this.dayStartHour = min.getHours();
    this.dayStartMinute = min.getMinutes();
    const maxTime = newDate(max.getTime() + 30 * 60000);
    this.dayEndHour = maxTime.getHours();
    this.dayEndMinute = maxTime.getMinutes();
  }

  private filterCustomer(name: string): IUser[] | undefined {
    const filterValue = name.toLowerCase();

    return this.customers?.filter(option => getFullUserName(option)?.toLowerCase().indexOf(filterValue) === 0);
  }

  private filterProduct(name: string): IProduct[] | undefined {
    const filterValue = name.toLowerCase();

    return this.products?.filter(option => option.name?.toLowerCase().indexOf(filterValue) === 0);
  }

  private filterRoom(name: string): IRoom[] | undefined {
    const filterValue = name.toLowerCase();

    return this.rooms?.filter(option => option.name?.toLowerCase().indexOf(filterValue) === 0);
  }

  private setData(reservation: IReservationAll): void {
    this.reservation = reservation;
    this.showTime = true;
    const date = newDate(reservation.start);
    this.room.setValue(reservation.room);
    this.date.setValue(date);
    this.start.setValue(getTime(date, this.locale));
    this.customer.setValue(reservation.customer);
    this.price = getPrice(this.reservation.product);
    this.product.setValue(reservation.product);

    this.myStepper.next();
    if (!this.isAdmin) {
      this.myStepper.next();
    }
  }
}
