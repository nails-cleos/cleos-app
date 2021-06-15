import { AfterViewInit, ChangeDetectorRef, Component, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { STEPPER_GLOBAL_OPTIONS } from '@angular/cdk/stepper';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { map, startWith } from 'rxjs/operators';
import { IUser, IUserAll } from '../interfaces/user';
import { Observable, Subscription } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Store } from '@ngrx/store';
import { AppState, selectAuthState, selectReservationState } from '../store/app.states';
import * as fromActionsReservation from '../store/reservation.actions';
import { requireMatch, valueChange } from '../util/validators';
import { IProduct } from '../interfaces/product';
import { MatStepper } from '@angular/material/stepper';
import { IAvailability, IRoom } from '../interfaces/room';
import { IReservation, IReservationAll, Reservation } from '../interfaces/reservation';
import { CalendarEvent } from 'angular-calendar';
import { TranslateService } from '@ngx-translate/core';
import { MatDialog } from '@angular/material/dialog';
import { DialogComponent } from '../dialog/dialog.component';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import {
  convertDuration,
  createDate,
  createFullDate,
  createNewDate,
  Duration,
  formatTime,
  getAvailability,
  getNow,
  getStartEndDay,
  getTime,
  IDuration,
  newDate,
  plusDay
} from '../util/dates';
import { fillNotAvailable, getOverlapEvent, newEvent } from '../util/event';
import { ActivatedRoute, Router } from '@angular/router';
import { DateAdapter } from '@angular/material/core';
import { findStateColor } from '../util/flags';
import { GeocoderResult } from '@agm/core';
import { Role } from '../interfaces/token';
import { IUnavailableAll } from '../interfaces/unavailable';
import { timeTheme } from '../util/theme';
import { DiscountType, IUserDiscount, transitionAnimation } from '../interfaces/discount';
import { getPriceDiscount } from '../util/helper';

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

  getState: Observable<any>;
  subscription: Subscription | undefined;
  errors: any = [];

  isLoading = false;
  error: any;

  customerForm!: FormGroup;
  customers: IUser[] | undefined;
  filteredCustomer: Observable<IUser[] | undefined> | undefined;
  customer: FormControl = new FormControl('', [
    Validators.required, requireMatch
  ]);

  productForm!: FormGroup;
  products: IProduct[] | undefined;
  discounts: IUserDiscount[] | undefined;
  showDiscount = false;
  priceDiscount: number | undefined;
  discount = new FormControl();
  filteredProduct: Observable<IProduct[] | undefined> | undefined;
  product: FormControl = new FormControl('', [
    Validators.required, requireMatch
  ]);

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

  reservations: IReservationAll[] | undefined;
  unavailableList: IUnavailableAll[] | undefined;
  viewDate: Date = getNow();

  dayStartHour = 9;
  dayStartMinute = 0;
  dayEndHour = 18;
  dayEndMinute = 0;
  daysInWeek = 7;
  lessDays = 3;
  hourSegments = 4;
  locale: string;

  eventSelected: CalendarEvent | undefined;
  smallScreen: boolean | undefined;
  isPreview = false;
  duration: IDuration = new Duration();

  extras: any;

  isEditing = false;
  reservation: IReservationAll | undefined;
  showTime = false;
  startDate: Date | undefined;
  minDate: any;
  maxDate: any;
  theme = timeTheme();

  isAdmin = false;

  constructor(private readonly translate: TranslateService, public dialog: MatDialog, private snackBar: MatSnackBar,
              private store: Store<AppState>, private formBuilder: FormBuilder, private breakpointObserver: BreakpointObserver,
              private router: Router, private route: ActivatedRoute, private adapter: DateAdapter<any>,
              private cdRef: ChangeDetectorRef) {
    this.getState = this.store.select(selectReservationState);
    const userLang = this.translate.currentLang;
    const index = userLang.indexOf('-');
    this.locale = index === -1 ? userLang : userLang.substr(0, index);
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
      this.customer.setValue(this.extras.customer);
      this.room.setValue(this.extras.room);
      this.product.setValue(this.extras.product);
      this.date.setValue(this.extras.date);
    }
    this.store.select(selectAuthState).subscribe((state: any) => {
      if (state.user) {
        const user: IUserAll = state.user;
        this.isAdmin = user.authorities.some(u => u.authority === Role.admin);
      }
    });
    this.customer.valueChanges.subscribe(() => {
      this.discount.setValue(null);
      this.showDiscount = false;
    });
    this.discount.valueChanges.subscribe(value => {
      this.priceDiscount = undefined;
      if (value && this.discounts) {
        const userDiscount = this.discounts.find(d => d.id === value);
        if (userDiscount) {
          this.priceDiscount = getPriceDiscount(userDiscount.discount, this.product.value.price);
        }
      }
    });
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
      const day = this.startDate?.getDay();
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

  myFilter = (d: Date | null): boolean => {
    const now = createDate();
    const date = (d || now);
    let result = date >= now;
    if (this.room.value) {
      const day = date.getDay();
      const {week, saturday, sunday} = getAvailability(this.room.value);
      if (!week) {
        result = result && (day === 0 || day === 6);
      }
      if (!sunday) {
        result = result && day !== 0;
      }
      if (!saturday) {
        result = result && day !== 6;
      }
    }
    return result;
  };

  displayFnUser(user: IUser): string {
    return user ? `${user.firstName} ${user.lastName}` : '';
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
    date = plusDay(date, -this.lessDays);
    if (date < createFullDate(now)) {
      date = now;
    }

    const {week, saturday, sunday} = getAvailability(this.room.value);

    this.setStartEndDay(week, saturday, sunday);
    const unavailable = this.translate.instant('RESERVATION.ADD.EVENT.MESSAGE.UNAVAILABLE');
    const lunch = this.translate.instant('RESERVATION.ADD.EVENT.MESSAGE.LUNCH');
    const notWorking = this.translate.instant('RESERVATION.ADD.EVENT.MESSAGE.OUT_OF_WORK');
    this.events = this.events.concat(fillNotAvailable(unavailable, lunch, notWorking,
      this.daysInWeek, date, sunday, saturday, week, true));
    this.viewDate = date;
    this.store.dispatch(
      new fromActionsReservation.SearchReservation({date: this.date.value, roomId: this.room.value.id})
    );
    this.myStepper.next();
  }

  segmentClick(date: Date, state: string, id?: string): void {
    this.errors.overlapping = false;
    const nowTime = date.toLocaleTimeString('en-GB').split(':');
    const duration = convertDuration(this.product.value.duration);

    const start = createNewDate(date, Number(nowTime[0]), Number(nowTime[1]));
    const end = createNewDate(start, start.getHours() + duration.hour, start.getMinutes() + duration.minute);

    const detail = this.translate.instant('RESERVATION.ADD.EVENT.DETAIL', {
      customerName: `${this.customer.value.firstName} ${this.customer.value.lastName}`,
      productName: this.product.value.name,
      duration: formatTime(duration.hour, duration.minute)
    });

    const event = newEvent(detail, findStateColor(state), start, end, '#000', id);

    if (event) {
      let title;
      let content;
      const eventsOverlapping = getOverlapEvent(this.events, start, end);
      if (eventsOverlapping.length && eventsOverlapping[0] !== this.eventSelected) {
        const overlapping = eventsOverlapping.find(e => e.id);
        if (overlapping) {
          this.errors.overlapping = this.translate.instant('RESERVATION.ADD.EVENT.OVERLAPPING.ERROR', {data: overlapping.title});
          return;
        }
        let message = '';
        eventsOverlapping.forEach(e => {
          message += `<div>${e.title}</div>`;
        });
        title = this.translate.instant('RESERVATION.ADD.EVENT.OVERLAPPING.TITLE');
        content = this.translate.instant('RESERVATION.ADD.EVENT.OVERLAPPING.CONTENT', {data: message});
      } else {
        if (!this.eventSelected && !id) {
          title = this.translate.instant('RESERVATION.ADD.EVENT.TITLE');
          content = this.translate.instant('RESERVATION.ADD.EVENT.CONTENT', {date: start.toLocaleString('en-GB')});
        } else {
          title = this.translate.instant('RESERVATION.ADD.EVENT.CHANGE.TITLE');
          content = this.translate.instant('RESERVATION.ADD.EVENT.CHANGE.CONTENT', {date: start.toLocaleString('en-GB')});
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
    this.router.navigateByUrl('/user', {state: {role: Role.customer}});
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
        const detail = this.translate.instant('RESERVATION.ADD.EVENT.DETAIL', {
          customerName: `${it.customer.firstName} ${it.customer.lastName}`,
          productName: it.product.name,
          duration: formatTime(duration.hour, duration.minute)
        });

        const color = findStateColor(it.state);
        const event = newEvent(detail, color, start, end, '#000', it.id);
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
    const weeks = 56;
    this.unavailableList?.forEach(it => {
      if (it.duration) {
        const start = newDate(it.start);
        const duration = convertDuration(it.duration);
        switch (it.repeat) {
          case 'NONE':
            this.validateUnavailableEvent(start, duration, it);
            break;
          case 'ONCE_A_WEEK':
            for (let i = 0; i < weeks; i++) {
              const onceWeekDate = plusDay(start, +i * 7);
              this.validateUnavailableEvent(onceWeekDate, duration, it);
            }
            break;
          case 'EVERY_DAY':
            for (let i = 0; i < weeks * 7; i++) {
              const everyDayDate = plusDay(start, +i);
              this.validateUnavailableEvent(everyDayDate, duration, it);
            }
            break;
        }
      }
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
          this.createUnavailableEvent(it.id, start, end, duration, it.description);
        }
      });
    } else {
      this.createUnavailableEvent(it.id, start, end, duration, it.description);
    }
  }

  private createUnavailableEvent(id: string, start: Date, end: Date, duration: IDuration, description?: string): void {
    const detail = this.translate.instant('RESERVATION.ADD.EVENT.UNAVAILABLE', {
      description: description ? description : '',
      duration: formatTime(duration.hour, duration.minute)
    });

    const color = findStateColor('DEFAULT');
    const event = newEvent(detail, color, start, end, '#000', `unavailable/${id}`);
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
      this.isLoading = state.isLoading;
      this.customers = state.customers;
      this.products = state.productDiscount?.products;
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
        this.reservations = state.data.reservations;
        this.unavailableList = state.data.unavailableList;
        this.addReservations();
        this.addUnavailableList();
        if (this.extras?.date && !this.eventSelected) {
          this.segmentClick(this.date.value, 'CREATED');
          // } else if (this.editReservation) {
          //   if (this.startDate) {
          //     const date: Date = createNewDate(this.date.value, this.startDate.getHours(), this.startDate.getMinutes());
          //     this.segmentClick(date, this.editReservation.state, this.editReservation.id);
          //   }
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
      } else if (state.errorMessage) {
        this.error = state.error;
        this.snackBar.open(state.errorMessage, 'OK', {
          duration: 5000
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

    return this.customers?.filter(option => option.firstName?.toLowerCase().indexOf(filterValue) === 0 ||
      option.lastName?.toLowerCase().indexOf(filterValue) === 0);
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
    this.start.setValue(getTime(date));
    this.startDate = date;
    this.customer.setValue(reservation.customer);
    this.product.valueChanges.subscribe(value => {
      if (reservation.product.discount && reservation.product.discount.amount) {
        this.priceDiscount = getPriceDiscount(reservation.product.discount, value.price);
      }
    });
    this.product.setValue(reservation.product);

    this.myStepper.next();
    if (!this.isAdmin) {
      this.myStepper.next();
    }
  }
}
