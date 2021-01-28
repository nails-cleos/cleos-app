import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { STEPPER_GLOBAL_OPTIONS } from '@angular/cdk/stepper';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { map, startWith } from 'rxjs/operators';
import { IUser } from '../interfaces/user';
import { Observable } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Store } from '@ngrx/store';
import { AppState, selectReservationState } from '../store/app.states';
import * as fromActionsReservation from '../store/reservation.actions';
import { RequireMatch } from '../util/validators';
import { IProduct } from '../interfaces/product';
import { MatStepper } from '@angular/material/stepper';
import { IAvailability, IRoom } from '../interfaces/room';
import { IReservation } from '../interfaces/reservation';
import { CalendarEvent } from 'angular-calendar';
import { TranslateService } from '@ngx-translate/core';
import { MatDialog } from '@angular/material/dialog';
import { DialogComponent } from '../dialog/dialog.component';
import * as fromActionsRoom from '../store/room.actions';

@Component({
  selector: 'app-reservation',
  templateUrl: './reservation.component.html',
  styleUrls: ['./reservation.component.scss'],
  providers: [{
    provide: STEPPER_GLOBAL_OPTIONS, useValue: {displayDefaultIndicatorType: false}
  }]
})
export class ReservationComponent implements OnInit {
  getState: Observable<any>;
  errors: any = [];

  isLoading = false;

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

  reservations: IReservation | undefined;
  viewDate: Date = new Date();
  @Input() events: CalendarEvent[] = [];

  dayStartHour = 9;
  dayStartMinute = 0;
  dayEndHour = 18;
  dayEndMinute = 0;

  eventSelected: CalendarEvent | undefined;

  constructor(private readonly translate: TranslateService, public dialog: MatDialog, private snackBar: MatSnackBar,
              private store: Store<AppState>, private formBuilder: FormBuilder) {
    this.getState = this.store.select(selectReservationState);
  }

  private static getMinAndMax(availability: IAvailability, date: Date): any {
    let min;
    let max;
    if (availability) {
      if (availability.start) {
        const start = availability.start.split(':');
        min = new Date(date.setHours(Number(start[0]), Number(start[1])));
      }
      if (availability.end) {
        const end = availability.end.split(':');
        max = new Date(date.setHours(Number(end[0]), Number(end[1])));
      }
    }
    return {min, max};
  }

  ngOnInit(): void {
    this.createForm();
    this.clean();
    this.subscribe();
    this.getCustomers();
  }

  createForm(): void {
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

  clean(): void {
    this.store.dispatch(
      new fromActionsReservation.Clean()
    );
  }

  subscribe(): void {
    this.getState.subscribe(state => {
      this.isLoading = state.isLoading;
      this.reservations = state.data;
      this.customers = state.customers;
      this.products = state.products;
      this.rooms = state.rooms;
      if (this.rooms) {
        this.room.setValue(this.rooms[0]);
      }
      if (state.subErrors) {
        state.subErrors.forEach((value: any) => {
          this.errors[value.field] = value.message;
          this.customerForm.controls[value.field]?.setErrors({incorrect: true});
          this.productForm.controls[value.field]?.setErrors({incorrect: true});
        });
      } else if (state.errorMessage) {
        this.snackBar.open(state.errorMessage, 'OK', {
          duration: 5000
        });
      }
    });
  }

  getCustomers(): void {
    this.store.dispatch(
      new fromActionsReservation.GetAllCustomers()
    );
  }

  getProducts(stepper: MatStepper): void {
    this.store.dispatch(
      new fromActionsReservation.GetAllProducts()
    );
    stepper.next();
  }

  getRooms(stepper: MatStepper): void {
    this.store.dispatch(
      new fromActionsReservation.GetAllRooms()
    );
    stepper.next();
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
      // TODO show info
      return `${room.name}`;
    } else {
      return '';
    }
  }

  searchAvailability(stepper: MatStepper): void {
    this.events = [];
    this.store.dispatch(
      new fromActionsReservation.SearchReservation({date: this.date.value, roomId: this.room.value.id})
    );

    const date = new Date(new Date().setDate(this.date.value.getDate() - 3));
    const {week, saturday, sunday} = this.getAvailability();

    this.setStartEndDay(week, saturday, sunday);
    this.fillNotAvailable(date, sunday, saturday, week);
    this.viewDate = date;
    stepper.next();
  }

  segmentClick(date: Date): void {
    const nowTime = date.toLocaleTimeString('en-GB').split(':');
    const duration: string = this.product.value.duration;
    const durationTime = duration.split(':');

    const start = new Date(date.setHours(Number(nowTime[0]), Number(nowTime[1])));
    const end = new Date(new Date(start).setHours(
      start.getHours() + Number(durationTime[0]), start.getMinutes() + Number(durationTime[1]))
    );
    const detail = this.translate.instant('RESERVATION.ADD.EVENT.DETAIL', {
      customerName: `${this.customer.value.firstName} ${this.customer.value.lastName}`,
      productName: this.product.value.name,
      duration: this.product.value.duration
    });

    // TODO validate if fit.
    const event = {
      start, end,
      color: {
        primary: '#000',
        secondary: '#ede7f6'
      },
      title: detail
    } as unknown as CalendarEvent;

    let title;
    let content;
    if (!this.eventSelected) {
      title = this.translate.instant('RESERVATION.ADD.EVENT.TITLE');
      content = this.translate.instant('RESERVATION.ADD.EVENT.CONTENT', {date: start.toLocaleString('en-GB')});
    } else {
      title = this.translate.instant('RESERVATION.ADD.EVENT.TITLE');
      content = this.translate.instant('RESERVATION.ADD.EVENT.CHANGE', {date: start.toLocaleString('en-GB')});
    }

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

  private fillNotAvailable(selectDate: Date, sunday: IAvailability, saturday: IAvailability, week: IAvailability): void {
    const date = new Date(selectDate.getFullYear(), selectDate.getMonth(), selectDate.getDate());
    for (let i = 0; i < 7; i++) {
      const day = date.getDay();
      if (date < new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate())) {
        const event = {
          start: new Date(new Date(date).setHours(0, 0)),
          end: new Date(new Date(date).setHours(23, 59)),
          color: {
            secondary: '#ffebee'
          },
          title: this.translate.instant('RESERVATION.ADD.EVENT.MESSAGE.UNAVAILABLE')
        } as unknown as CalendarEvent;
        this.events = [...this.events, event];
      } else if (day === 0) {
        this.createEvent(sunday, date);
      } else if (day === 6) {
        this.createEvent(saturday, date);
      } else {
        this.createEvent(week, date);
      }
      date.setDate(date.getDate() + 1);
    }
  }

  private setStartEndDay(week: IAvailability, saturday: IAvailability, sunday: IAvailability): void {
    const date: Date = new Date();
    const weekMinMax = ReservationComponent.getMinAndMax(week, date);
    const saturdayMinMax = ReservationComponent.getMinAndMax(saturday, date);
    const sundayMinMax = ReservationComponent.getMinAndMax(sunday, date);

    let min: Date = weekMinMax.min;
    let max: Date = weekMinMax.max;

    if (!min || saturdayMinMax.min < min) {
      min = saturdayMinMax.min;
    }
    if (sundayMinMax.min < min) {
      min = sundayMinMax.min;
    }

    if (!max || saturdayMinMax.max > max) {
      max = saturdayMinMax.max;
    }
    if (sundayMinMax.max > max) {
      max = sundayMinMax.max;
    }

    this.dayStartHour = min.getHours();
    this.dayStartMinute = min.getMinutes();
    this.dayEndHour = max.getHours();
    this.dayEndMinute = max.getMinutes();
  }

  private createEvent(it: IAvailability, date: Date): void {
    const notWorking = this.translate.instant('RESERVATION.ADD.EVENT.MESSAGE.NOT_WORKING');
    if (!it) {
      const event = {
        start: new Date(new Date(date).setHours(0, 0)),
        end: new Date(new Date(date).setHours(23, 59)),
        color: {
          secondary: '#ffebee'
        },
        title: notWorking
      } as unknown as CalendarEvent;
      this.events = [...this.events, event];
    } else {
      if (it.start) {
        const start = it.start.split(':');
        const eventBefore = {
          start: new Date(new Date(date).setHours(0, 0)),
          end: new Date(date.setHours(Number(start[0]), Number(start[1]))),
          color: {
            secondary: '#ffebee'
          },
          title: notWorking
        } as unknown as CalendarEvent;
        this.events = [...this.events, eventBefore];
      }
      if (it.end) {
        const end = it.end.split(':');
        const eventAfter = {
          start: new Date(date.setHours(Number(end[0]), Number(end[1]))),
          end: new Date(new Date(date).setHours(23, 59)),
          color: {
            secondary: '#ffebee'
          },
          title: notWorking
        } as unknown as CalendarEvent;
        this.events = [...this.events, eventAfter];
      }
      this.createLunchEvent(it, date);
    }
  }

  private createLunchEvent(it: IAvailability, date: Date): void {
    if (it.startLunch && it.endLunch) {
      const lunchStart = it.startLunch.split(':');
      const lunchEnd = it.endLunch.split(':');
      const lunchEndHour = Number(lunchEnd[0]);
      const lunchEndMinute = Number(lunchEnd[1]);
      const lunchStartHour = Number(lunchStart[0]);
      const lunchStartMinute = Number(lunchStart[1]);
      const now = new Date();

      if (date.getFullYear() === now.getFullYear() && date.getMonth() === now.getMonth() && date.getDate() === now.getDate()) {
        const nowTime = now.toLocaleTimeString('en-GB').split(':');
        let hour = Number(nowTime[0]);
        let minute = Number(nowTime[1]);
        if (hour > 23) {
          hour = 23;
          minute = 59;
        } else {
          hour = hour + 1;
          this.lunchEvent(hour, lunchStartHour, minute, lunchStartMinute, lunchEndHour, lunchEndMinute, date);
        }
        const event = {
          start: new Date(new Date().setHours(0, 0)),
          end: new Date(new Date().setHours(hour, minute)),
          color: {
            secondary: '#ffebee'
          },
          title: this.translate.instant('RESERVATION.ADD.EVENT.MESSAGE.UNAVAILABLE')
        } as unknown as CalendarEvent;
        this.events = [...this.events, event];
      } else {
        const lunchEvent = {
          start: new Date(date.setHours(lunchStartHour, lunchStartMinute)),
          end: new Date(date.setHours(lunchEndHour, lunchEndMinute)),
          color: {
            secondary: '#ffebee'
          },
          title: this.translate.instant('RESERVATION.ADD.EVENT.MESSAGE.LUNCH')
        } as unknown as CalendarEvent;
        this.events = [...this.events, lunchEvent];
      }
    }
  }

  private lunchEvent(hour: number, lunchStartHour: number, minute: number, lunchStartMinute: number, lunchEndHour: number,
                     lunchEndMinute: number, date: Date): void {
    let lunchHour;
    let lunchMinute;
    if (hour < lunchStartHour || (hour === lunchStartHour && minute < lunchStartMinute)) {
      lunchHour = lunchStartHour;
      lunchMinute = lunchStartMinute;
    } else if ((hour > lunchStartHour || (hour === lunchStartHour && minute > lunchStartMinute))
      && (hour < lunchEndHour || (hour === lunchEndHour && minute < lunchEndMinute))) {
      lunchHour = hour;
      lunchMinute = minute;
    }
    if ((lunchHour || lunchHour === 0) && (lunchMinute || lunchMinute === 0)) {
      const lunchEvent = {
        start: new Date(date.setHours(lunchHour, lunchMinute)),
        end: new Date(date.setHours(lunchEndHour, lunchEndMinute)),
        color: {
          secondary: '#ffebee'
        },
        title: this.translate.instant('RESERVATION.ADD.EVENT.MESSAGE.LUNCH')
      } as unknown as CalendarEvent;
      this.events = [...this.events, lunchEvent];
    }
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
