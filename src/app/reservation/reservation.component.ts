import { AfterViewInit, ChangeDetectorRef, Component, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { STEPPER_GLOBAL_OPTIONS } from '@angular/cdk/stepper';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { map, startWith } from 'rxjs/operators';
import { IUser, IUserAll } from '../interfaces/user';
import { Observable, Subscription } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Store } from '@ngrx/store';
import { AppState, selectReservationState } from '../store/app.states';
import * as fromActionsReservation from '../store/reservation.actions';
import { requireMatch } from '../util/validators';
import { IProduct } from '../interfaces/product';
import { MatStepper } from '@angular/material/stepper';
import { IAvailability, IRoom } from '../interfaces/room';
import { IReservation, IReservationAll, Reservation } from '../interfaces/reservation';
import { CalendarEvent } from 'angular-calendar';
import { TranslateService } from '@ngx-translate/core';
import { MatDialog } from '@angular/material/dialog';
import { DialogComponent } from '../dialog/dialog.component';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { convertDuration, Duration, getStartEndDay, IDuration } from '../util/dates';
import { fillNotAvailable, newEvent } from '../util/event';
import { Router } from '@angular/router';
import { DateAdapter } from '@angular/material/core';
import { findStateColor } from '../util/flags';
import { GeocoderResult } from '@agm/core';
import { Role } from '../interfaces/token';

@Component({
  selector: 'app-reservation',
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
  viewDate: Date = new Date();

  dayStartHour = 9;
  dayStartMinute = 0;
  dayEndHour = 18;
  dayEndMinute = 0;
  daysInWeek = 7;
  lessDays = 3;
  hourSegments = 2;
  locale: string;

  eventSelected: CalendarEvent | undefined;
  smallScreen: boolean | undefined;
  isPreview = false;
  duration: IDuration = new Duration();

  extras: any;

  isEditing = false;
  editReservation: IReservationAll | undefined;
  showTime = false;
  minDate: Date | undefined;
  maxDate: Date | undefined;

  isAdmin = false;

  constructor(private readonly translate: TranslateService, public dialog: MatDialog, private snackBar: MatSnackBar,
              private store: Store<AppState>, private formBuilder: FormBuilder, private breakpointObserver: BreakpointObserver,
              private router: Router, private adapter: DateAdapter<any>, private cdRef: ChangeDetectorRef) {
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
        this.hourSegments = 1;
      }
    });
    this.extras = this.router.getCurrentNavigation()?.extras.state;
    if (this.extras) {
      if (this.extras.editReservation) {
        this.showTime = true;
        this.setData();
      } else {
        this.room.setValue(this.extras.room);
        this.date.setValue(this.extras.date);
      }
    }
    const token = localStorage.getItem('auth');
    if (token) {
      const user: IUserAll = JSON.parse(token).user;
      this.isAdmin = user.authorities.some(u => u.authority === Role.admin);
    }
  }

  ngOnInit(): void {
    this.createForm();
    this.clean();
    this.subscribe();
    this.getCustomers();
  }

  ngAfterViewInit(): void {
    if (this.isEditing) {
      this.myStepper.next();
      if (!this.isAdmin) {
        this.myStepper.next();
      } else {
        this.getRoomList();
      }
    }
    if (this.showTime) {
      this.productForm = this.formBuilder.group({
        ...this.productForm.controls,
        start: this.start
      });
      const day = this.start.value.getDay();
      let av: IAvailability;
      switch (day) {
        case 0:
          const {sunday} = this.getAvailability();
          av = sunday;
          break;
        case 6:
          const {saturday} = this.getAvailability();
          av = saturday;
          break;
        default:
          const {week} = this.getAvailability();
          av = week;
          break;
      }
      if (av.start) {
        const start = av.start.split(':');
        this.minDate = new Date(new Date(this.start.value).setHours(Number(start[0]), Number(start[1])));
      }
      if (av.end) {
        const end = av.end.split(':');
        this.maxDate = new Date(new Date(this.start.value).setHours(Number(end[0]), Number(end[1])));
      }
    }
    this.cdRef.detectChanges();
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }

  myFilter = (d: Date | null): boolean => {
    const now = new Date();
    const date = (d || now);
    let result = date > now;
    if (this.room.value) {
      const day = date.getDay();
      const {week, saturday, sunday} = this.getAvailability();
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

    const date = new Date(this.date.value);
    date.setDate(date.getDate() - this.lessDays);

    const {week, saturday, sunday} = this.getAvailability();

    this.setStartEndDay(week, saturday, sunday);
    const unavailable = this.translate.instant('RESERVATION.ADD.EVENT.MESSAGE.UNAVAILABLE');
    const lunch = this.translate.instant('RESERVATION.ADD.EVENT.MESSAGE.LUNCH');
    const notWorking = this.translate.instant('RESERVATION.ADD.EVENT.MESSAGE.OUT_OF_WORK');
    this.events = this.events.concat(fillNotAvailable(unavailable, lunch, notWorking,
      this.daysInWeek, 1, date, sunday, saturday, week, true));
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

    const start = new Date(date.setHours(Number(nowTime[0]), Number(nowTime[1])));
    const end = new Date(new Date(start).setHours(
      start.getHours() + duration.hour, start.getMinutes() + duration.minute)
    );

    const detail = this.translate.instant('RESERVATION.ADD.EVENT.DETAIL', {
      customerName: `${this.customer.value.firstName} ${this.customer.value.lastName}`,
      productName: this.product.value.name,
      duration: `${duration.hour}:${duration.minute}`
    });

    const event = newEvent(detail, findStateColor(state), start, end, '#000', id);

    let title;
    let content;
    const eventsOverlapping = this.isAnOverlapEvent(start, end);
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
      if (!this.eventSelected) {
        title = this.translate.instant('RESERVATION.ADD.EVENT.TITLE');
        content = this.translate.instant('RESERVATION.ADD.EVENT.CONTENT', {date: start.toLocaleString('en-GB')});
      } else {
        title = this.translate.instant('RESERVATION.ADD.EVENT.CHANGE.TITLE');
        content = this.translate.instant('RESERVATION.ADD.EVENT.CHANGE.CONTENT', {date: start.toLocaleString('en-GB')});
      }
    }
    this.createSelectEvent(title, content, event);
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
    reservation.productId = this.product.value.id;
    if (this.eventSelected) {
      reservation.start = this.eventSelected.start.toLocaleString('en-GB');

      if (this.editReservation) {
        reservation.id = this.editReservation.id;
        this.store.dispatch(
          new fromActionsReservation.Edit(reservation)
        );
      } else {
        this.store.dispatch(
          new fromActionsReservation.ReservationSave(reservation)
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

  private getRoomList(): void {
    this.store.dispatch(
      new fromActionsReservation.GetAllRooms()
    );
  }

  private getProductList(): void {
    this.store.dispatch(
      new fromActionsReservation.GetAllProducts()
    );
  }

  private createForm(): void {
    this.customerForm = this.formBuilder.group({
      customer: this.customer
    });
    this.productForm = this.formBuilder.group({
      product: this.product,
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
        const start = new Date(it.start);
        if (start < new Date()) {
          return;
        }
        const duration = convertDuration(it.product.duration);
        const end = new Date(new Date(start).setHours(
          start.getHours() + duration.hour, start.getMinutes() + duration.minute)
        );
        const detail = this.translate.instant('RESERVATION.ADD.EVENT.DETAIL', {
          customerName: `${it.customer.firstName} ${it.customer.lastName}`,
          productName: it.product.name,
          duration: `${duration.hour}:${duration.minute}`
        });

        const color = findStateColor(it.state);
        const event = newEvent(detail, color, start, end, '#000', it.id);
        if (this.editReservation && this.editReservation.id === it.id) {
          this.eventSelected = event;
        }
        this.events = [...this.events, event];
      }
    });
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
      this.products = state.products;
      this.rooms = state.rooms;
      if (this.rooms?.length === 1) {
        this.room.setValue(this.rooms[0]);
      }
      if (state.data && Array.isArray(state.data) && !state.isLoading) {
        this.reservations = state.data;
        this.addReservations();
        if (this.extras?.date && !this.eventSelected) {
          this.segmentClick(this.date.value, 'CREATED');
        } else if (this.editReservation) {
          const time: Date = this.start.value;
          const date: Date = new Date(new Date(this.date.value).setHours(time.getHours(), time.getMinutes()));
          this.segmentClick(date, this.editReservation.state, this.editReservation.id);
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
          this.productForm.controls[value.field]?.setErrors({incorrect: true});
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

  private getAvailability(): any {
    const week: IAvailability = this.room.value.availabilities.filter((el: IAvailability) => el.day === 'WEEK')[0];
    const saturday: IAvailability = this.room.value.availabilities.filter((el: IAvailability) => el.day === 'SATURDAY')[0];
    const sunday: IAvailability = this.room.value.availabilities.filter((el: IAvailability) => el.day === 'SUNDAY')[0];
    return {week, saturday, sunday};
  }

  // private isAnOverlapEvent(eventStartDay: Date, eventEndDay: Date): CalendarEvent | undefined {
  //   return this.events.find((eventA: CalendarEvent) => {
  //     if (eventStartDay > eventA.start && eventA.end && eventStartDay < eventA.end) {
  //       console.log('start-time in between any of the events');
  //       return eventA;
  //     }
  //     if (eventEndDay > eventA.start && eventA.end && eventEndDay < eventA.end) {
  //       console.log('end-time in between any of the events');
  //       return eventA;
  //     }
  //     if (eventStartDay <= eventA.start && eventA.end && eventEndDay >= eventA.end) {
  //       console.log('any of the events in between/on the start-time and end-time');
  //       return eventA;
  //     }
  //     return null;
  //   });
  // }

  private setStartEndDay(week: IAvailability, saturday: IAvailability, sunday: IAvailability): void {
    const {min, max} = getStartEndDay(week, saturday, sunday);

    this.dayStartHour = min.getHours();
    this.dayStartMinute = min.getMinutes();
    this.dayEndHour = max.getHours();
    this.dayEndMinute = max.getMinutes();
  }

  private isAnOverlapEvent(eventStartDay: Date, eventEndDay: Date): CalendarEvent[] {
    return this.events.filter((eventA: CalendarEvent) => (eventStartDay > eventA.start && eventA.end && eventStartDay < eventA.end)
      || (eventEndDay > eventA.start && eventA.end && eventEndDay < eventA.end)
      || (eventStartDay <= eventA.start && eventA.end && eventEndDay >= eventA.end)
    );
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

  private setData(): void {
    this.isEditing = true;

    const reservation: IReservationAll = this.extras.editReservation.reservation;
    this.editReservation = reservation;
    const user: IUserAll = this.extras.editReservation.user;
    const date = new Date(reservation.start);
    this.room.setValue(reservation.room);
    this.date.setValue(date);
    this.start.setValue(date);
    this.customer.setValue(reservation.customer);
    this.product.setValue(reservation.product);
    const isAdmin = user.authorities.some(u => u.authority === Role.admin);

    if (!isAdmin) {
      this.getProductList();
    }
  }
}
