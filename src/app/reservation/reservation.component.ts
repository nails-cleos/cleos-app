import { Component, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { STEPPER_GLOBAL_OPTIONS } from '@angular/cdk/stepper';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { map, startWith } from 'rxjs/operators';
import { IUser } from '../interfaces/user';
import { Observable, Subscription } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Store } from '@ngrx/store';
import { AppState, selectReservationState } from '../store/app.states';
import * as fromActionsReservation from '../store/reservation.actions';
import { RequireMatch } from '../util/validators';
import { IProduct } from '../interfaces/product';
import { MatStepper } from '@angular/material/stepper';
import { IAvailability, IRoom } from '../interfaces/room';
import { IReservation, IReservationAll, Reservation } from '../interfaces/reservation';
import { CalendarEvent } from 'angular-calendar';
import { TranslateService } from '@ngx-translate/core';
import { MatDialog } from '@angular/material/dialog';
import { DialogComponent } from '../dialog/dialog.component';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { ConvertDuration, Duration, GetStartEndDay, IDuration } from '../util/dates';
import { FillNotAvailable, NewEvent } from '../util/event';
import { Router } from '@angular/router';
import { DateAdapter } from '@angular/material/core';
import { FindStateColor } from '../util/flags';

@Component({
  selector: 'app-reservation',
  templateUrl: './reservation.component.html',
  styleUrls: ['./reservation.component.scss'],
  providers: [{
    provide: STEPPER_GLOBAL_OPTIONS, useValue: {displayDefaultIndicatorType: false}
  }]
})
export class ReservationComponent implements OnInit, OnDestroy {
  getState: Observable<any>;
  subscription: Subscription | undefined;
  errors: any = [];

  isLoading = false;
  error: string | undefined;

  customerForm!: FormGroup;
  customers: IUser[] | undefined;
  filteredCustomer: Observable<IUser[] | undefined> | undefined;
  customer: FormControl = new FormControl('', [
    Validators.required, RequireMatch
  ]);

  productForm!: FormGroup;
  products: IProduct[] | undefined;
  filteredProduct: Observable<IProduct[] | undefined> | undefined;
  product: FormControl = new FormControl('', [
    Validators.required, RequireMatch
  ]);

  roomForm!: FormGroup;
  rooms: IRoom[] | undefined;
  filteredRoom: Observable<IRoom[] | undefined> | undefined;
  room: FormControl = new FormControl('', [
    Validators.required, RequireMatch
  ]);

  date: FormControl = new FormControl('', [
    Validators.required
  ]);

  reservations: IReservationAll[] | undefined;
  viewDate: Date = new Date();
  @Input() events: CalendarEvent[] = [];

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

  @ViewChild('stepper') stepper!: MatStepper;

  constructor(private readonly translate: TranslateService, public dialog: MatDialog, private snackBar: MatSnackBar,
              private store: Store<AppState>, private formBuilder: FormBuilder, private breakpointObserver: BreakpointObserver,
              private router: Router, private adapter: DateAdapter<any>) {
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
      this.room.setValue(this.extras.room);
      this.date.setValue(this.extras.date);
    }
  }

  ngOnInit(): void {
    this.createForm();
    this.clean();
    this.subscribe();
    this.getCustomers();
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
  }

  displayFnUser(user: IUser): string {
    return user ? `${user.firstName} ${user.lastName}` : '';
  }

  displayFnProduct(product: IProduct): string {
    return product ? `${product.name}` : '';
  }

  displayFnRoom(room: IRoom): string {
    if (room) {
      // TODO show info
      return `${room.name}`;
    } else {
      return '';
    }
  }

  searchAvailability(stepper: MatStepper): void {
    if (this.productForm.invalid) {
      return;
    }
    this.duration = ConvertDuration(this.product.value.duration);
    this.events = [];

    const date = new Date(this.date.value);
    date.setDate(date.getDate() - this.lessDays);

    const {week, saturday, sunday} = this.getAvailability();

    this.setStartEndDay(week, saturday, sunday);
    const unavailable = this.translate.instant('RESERVATION.ADD.EVENT.MESSAGE.UNAVAILABLE');
    const lunch = this.translate.instant('RESERVATION.ADD.EVENT.MESSAGE.LUNCH');
    const notWorking = this.translate.instant('RESERVATION.ADD.EVENT.MESSAGE.OUT_OF_WORK');
    this.events = this.events.concat(FillNotAvailable(unavailable, lunch, notWorking,
      this.daysInWeek, 1, date, sunday, saturday, week, true));
    this.viewDate = date;
    this.store.dispatch(
      new fromActionsReservation.SearchReservation({date: this.date.value, roomId: this.room.value.id})
    );
    stepper.next();
  }

  segmentClick(date: Date): void {
    this.errors.overlapping = false;
    const nowTime = date.toLocaleTimeString('en-GB').split(':');
    const duration = ConvertDuration(this.product.value.duration);

    const start = new Date(date.setHours(Number(nowTime[0]), Number(nowTime[1])));
    const end = new Date(new Date(start).setHours(
      start.getHours() + duration.hour, start.getMinutes() + duration.minute)
    );

    const detail = this.translate.instant('RESERVATION.ADD.EVENT.DETAIL', {
      customerName: `${this.customer.value.firstName} ${this.customer.value.lastName}`,
      productName: this.product.value.name,
      duration: `${duration.hour}:${duration.minute}`
    });

    const event = NewEvent(detail, FindStateColor('CREATED'), start, end, '#000');

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
        title = this.translate.instant('RESERVATION.ADD.EVENT.TITLE');
        content = this.translate.instant('RESERVATION.ADD.EVENT.CHANGE', {date: start.toLocaleString('en-GB')});
      }
    }
    this.createSelectEvent(title, content, event);
  }

  preview(stepper: MatStepper): void {
    this.errors.schedule = false;
    this.errors.overlapping = false;
    if (!this.eventSelected) {
      this.errors.schedule = true;
      return;
    }
    this.isPreview = true;
    stepper.next();
  }

  create(): void {
    const reservation: IReservation = new Reservation();
    reservation.customerId = this.customer.value.id;
    reservation.roomId = this.room.value.id;
    reservation.productId = this.product.value.id;
    if (this.eventSelected) {
      reservation.start = this.eventSelected.start.toLocaleString('en-GB');

      this.store.dispatch(
        new fromActionsReservation.ReservationSave(reservation)
      );
    }
  }

  goBack(stepper: MatStepper): void {
    this.isPreview = false;
    stepper.previous();
  }

  getProducts(stepper: MatStepper): void {
    if (this.roomForm.invalid) {
      return;
    }
    this.store.dispatch(
      new fromActionsReservation.GetAllProducts()
    );
    stepper.next();
  }

  getRooms(stepper: MatStepper): void {
    if (this.customerForm.invalid) {
      return;
    }
    this.store.dispatch(
      new fromActionsReservation.GetAllRooms()
    );
    stepper.next();
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
        const duration = ConvertDuration(it.product.duration);
        const end = new Date(new Date(start).setHours(
          start.getHours() + duration.hour, start.getMinutes() + duration.minute)
        );
        const detail = this.translate.instant('RESERVATION.ADD.EVENT.DETAIL', {
          customerName: `${it.customer.firstName} ${it.customer.lastName}`,
          productName: it.product.name,
          duration: `${duration.hour}:${duration.minute}`
        });

        const color = FindStateColor(it.state);
        const event = NewEvent(detail, color, start, end, '#000', it.id);
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
      if (state.data && !state.isLoading) {
        this.reservations = state.data;
        this.addReservations();
        if (this.extras && !this.eventSelected) {
          this.segmentClick(this.extras.date);
        }
      }
      if (state.subErrors) {
        state.subErrors.forEach((value: any) => {
          switch (value.field) {
            case 'room':
              this.stepper.selectedIndex = 1;
              break;
            case 'professional':
              this.stepper.selectedIndex = 3;
              break;
            default:
              this.stepper.selectedIndex = 0;
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

  private setStartEndDay(week: IAvailability, saturday: IAvailability, sunday: IAvailability): void {
    const {min, max} = GetStartEndDay(week, saturday, sunday);

    this.dayStartHour = min.getHours();
    this.dayStartMinute = min.getMinutes();
    this.dayEndHour = max.getHours();
    this.dayEndMinute = max.getMinutes();
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
}
