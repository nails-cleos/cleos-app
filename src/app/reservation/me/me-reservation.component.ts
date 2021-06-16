import { AfterViewInit, ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatStepper } from '@angular/material/stepper';
import { Observable, Subscription } from 'rxjs';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { requireMatch, valueChange } from '../../util/validators';
import { IProduct } from '../../interfaces/product';
import { IRoom } from '../../interfaces/room';
import { IAvailableDTO, IReservation, IReservationAll, Reservation } from '../../interfaces/reservation';
import {
  areEqualDate,
  convertDuration,
  createNewDate,
  Duration,
  formatDateName,
  formatDateTime,
  getAvailability,
  getNow,
  getTime,
  IDuration,
  newDate,
  plusMonthDate
} from '../../util/dates';
import { TranslateService } from '@ngx-translate/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Store } from '@ngrx/store';
import { AppState, selectReservationState } from '../../store/app.states';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { ActivatedRoute, Router } from '@angular/router';
import * as fromActionsReservation from '../../store/reservation.actions';
import { map, startWith } from 'rxjs/operators';
import { STEPPER_GLOBAL_OPTIONS } from '@angular/cdk/stepper';
import { getPriceDiscount, getUserName, round } from '../../util/helper';
import { DiscountType, IUserDiscount, transitionAnimation } from '../../interfaces/discount';

@Component({
  selector: 'app-me-reservation',
  animations: [transitionAnimation],
  templateUrl: './me-reservation.component.html',
  styleUrls: ['./me-reservation.component.scss'],
  providers: [{
    provide: STEPPER_GLOBAL_OPTIONS, useValue: {displayDefaultIndicatorType: false}
  }]
})
export class MeReservationComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('stepper') myStepper!: MatStepper;

  reservationMonths = 3;
  maxDate: Date;
  minDate: Date;

  getState: Observable<any>;
  subscription: Subscription | undefined;
  errors: any = [];

  isLoading = false;
  error: any;

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

  date: FormControl = new FormControl('', [
    Validators.required
  ]);

  availableList = new Map<string, any[]>();
  eventSelected: Date | undefined;
  time: any;
  locale: string;

  smallScreen: boolean | undefined;
  isPreview = false;
  duration: IDuration = new Duration();

  measure = 'long';
  distance: string | undefined;

  isEditing = false;
  reservation: IReservationAll | undefined;

  startDate: Date | undefined;
  endDate: Date | undefined;

  canCreate = false;
  selectedIndex = 1;
  extras: any;

  constructor(private readonly translate: TranslateService, private snackBar: MatSnackBar, private store: Store<AppState>,
              private formBuilder: FormBuilder, private breakpointObserver: BreakpointObserver,
              private router: Router, private route: ActivatedRoute, private cdRef: ChangeDetectorRef) {
    this.getState = this.store.select(selectReservationState);
    const userLang = this.translate.currentLang;
    const index = userLang.indexOf('-');
    this.locale = index === -1 ? userLang : userLang.substr(0, index);
    breakpointObserver.observe([
      Breakpoints.XSmall,
      Breakpoints.Small
    ]).subscribe(result => {
      this.smallScreen = result.matches;
      this.measure = 'short';
    });
    this.minDate = getNow();
    this.maxDate = plusMonthDate(this.minDate, this.reservationMonths, this.minDate.getDate() + 1);
    this.extras = this.router.getCurrentNavigation()?.extras.state;
    if (this.extras) {
      this.room.setValue(this.extras.room);
      this.product.setValue(this.extras.product);
      this.date.setValue(this.extras.date);
    }
    this.product.valueChanges.subscribe(value => {
      this.priceDiscount = undefined;
      if (value && this.discount.value && this.discounts) {
        const userDiscount = this.discounts.find(d => d.id === this.discount.value);
        if (userDiscount) {
          this.priceDiscount = getPriceDiscount(userDiscount.discount, value.price);
        }
      }
      if (this.extras && this.extras.discount) {
        this.showDiscount = true;
        this.discount.setValue(this.extras.discount.id);
      }
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

  get professionalName(): string {
    return getUserName(this.room.value.professional);
  }

  get durationTime(): string {
    const duration = convertDuration(this.product.value.duration);
    return getTime(createNewDate(getNow(), duration.hour, duration.minute));
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
        this.getRoomList();
      }
    });
  }

  ngAfterViewInit(): void {
    if (this.isEditing) {
      this.getProductList();
      this.cdRef.detectChanges();
    } else {
      this.getUpcomingReservation();
    }
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }

  myFilter = (d: Date | null): boolean => {
    const now = getNow();
    const date = (d || now);
    let result = date > now;
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

  displayFnProduct(product: IProduct): string {
    return product ? `${product.name}` : '';
  }

  displayFnRoom(room: IRoom): string {
    return room ? `${room.name}` : '';
  }

  searchAvailability(): void {
    if (this.productForm.invalid) {
      return;
    }
    if (this.eventSelected !== this.date.value) {
      this.eventSelected = undefined;
      this.time = undefined;
    }
    this.duration = convertDuration(this.product.value.duration);

    this.store.dispatch(
      new fromActionsReservation.CustomerSearchReservation({
        date: this.date.value,
        roomId: this.room.value.id,
        productId: this.product.value.id
      })
    );
    this.myStepper.next();
  }

  selectDate(datetime: any): void {
    this.eventSelected = datetime.date;
    this.time = datetime.time;
  }

  preview(): void {
    if (!this.eventSelected) {
      this.errors.schedule = true;
      return;
    }

    this.startDate = newDate(this.eventSelected);
    this.endDate = createNewDate(this.startDate, this.duration.hour, this.duration.minute);

    this.isPreview = true;
    this.myStepper.next();
  }

  create(): void {
    const reservation: IReservation = new Reservation();
    reservation.customerId = this.room.value.id;
    reservation.roomId = this.room.value.id;
    if (this.startDate) {
      reservation.start = this.startDate.toLocaleString('en-GB');
    }

    if (this.isEditing && this.reservation) {
      reservation.id = this.reservation.id;
      reservation.productId = valueChange(this.product.value.id, this.reservation.product.id);

      this.store.dispatch(
        new fromActionsReservation.Edit({reservation, isCustomer: true})
      );
    } else {
      reservation.productId = this.product.value.id;
      reservation.discountId = this.discount.value;
      this.store.dispatch(
        new fromActionsReservation.ReservationSave({reservation, isCustomer: true})
      );
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

  sortDate(a: any, b: any): number {
    return newDate(a.key).getTime() - newDate(b.key).getTime();
  }

  sortTime(data: any): any {
    return data.sort((a: any, b: any) => newDate(a.date).getTime() - newDate(b.date).getTime());
  }

  getDateNoContent(): string | null {
    return this.date.value ? formatDateName(this.date.value, this.translate.currentLang, this.measure) : null;
  }

  setDistance($event: number): void {
    this.distance = $event > 999 ?
      this.translate.instant('RESERVATION.CUSTOMER.ADD.ROOM.ADDRESS.DISTANCE.KM',
        {distance: round($event / 1000)}) :
      this.translate.instant('RESERVATION.CUSTOMER.ADD.ROOM.ADDRESS.DISTANCE.M',
        {distance: round($event)});
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

  private getUpcomingReservation(): void {
    this.store.dispatch(
      new fromActionsReservation.GetUpcomingReservation()
    );
  }

  private getProductList(): void {
    this.store.dispatch(
      new fromActionsReservation.GetAllProducts()
    );
  }

  private createForm(): void {
    this.productForm = this.formBuilder.group({
      product: this.product,
      discount: this.discount,
      date: this.date
    });
    this.roomForm = this.formBuilder.group({
      room: this.room
    });

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

  private subscribe(): void {
    this.subscription = this.getState.subscribe(state => {
      this.isLoading = state.isLoading;
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
      if (state.customerReservation && state.customerReservation.upcoming) {
        this.canCreate = false;
        const message = this.translate.instant('RESERVATION.CUSTOMER.ADD.UPCOMING.ERROR',
          {date: formatDateTime(newDate(state.customerReservation.upcoming.start), this.translate.currentLang)});
        const snackBarRef = this.snackBar.open(message, 'OK', {
          duration: 5000
        });
        snackBarRef.afterDismissed().subscribe(() => {
          this.clean();
          this.router.navigate(['me', 'reservations']);
        });
      } else {
        this.canCreate = true;
      }
      if (state.data && Array.isArray(state.data)) {
        this.availableList = state.data.reduce((group: Map<string, string[]>, item: IAvailableDTO) => {
          const date = newDate(item.start);
          const formattedDate = formatDateName(date, this.translate.currentLang, this.measure);
          const key = formattedDate.charAt(0).toUpperCase() + formattedDate.slice(1);

          let dates: any = group.get(key) || [];
          dates = [...dates, {time: getTime(newDate(item.start)), date}];
          group.set(key, dates);

          return group;
        }, new Map<string, any[]>());
      }

      this.setSelectedIndex();

      if (state.errorMessage) {
        this.error = state.error;
        this.snackBar.open(state.errorMessage, 'OK', {
          duration: 5000
        });
      }
    });
  }

  private setSelectedIndex(): void {
    let i = 0;
    new Map([...this.availableList.entries()]
      .sort((a: any, b: any) => this.sortDate({key: a[0]}, {key: b[0]})))
      .forEach((value, key) => {
        if (areEqualDate(this.date.value, newDate(key))) {
          this.selectedIndex = i;
        }
        i++;
      });
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
    const date = newDate(reservation.start);
    this.time = getTime(date);
    this.room.setValue(reservation.room);
    this.date.setValue(date);
    this.product.valueChanges.subscribe(value => {
      if (reservation.product.discount && reservation.product.discount.amount) {
        let discount;
        switch (reservation.product.discount.type) {
          case DiscountType.money: {
            discount = reservation.product.discount.amount;
            break;
          }
          case DiscountType.percentage: {
            discount = (value.price / reservation.product.discount.amount);
          }
        }
        if (discount) {
          this.priceDiscount = value.price - discount;
        }
      }
    });
    this.product.setValue(reservation.product);
    this.duration = convertDuration(reservation.product.duration);

    this.myStepper.next();
  }
}
