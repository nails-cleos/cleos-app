import { AfterViewInit, ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatStepper } from '@angular/material/stepper';
import { Observable, Subscription } from 'rxjs';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { requireMatch, valueChange } from '../../../util/validators';
import { IPrice, IProduct, IProductGroup, Price } from '../../../interfaces/product';
import { IRoom } from '../../../interfaces/room';
import {
  IAvailableDTO,
  IReservation,
  IReservationAll,
  MAX_RESERVATION_MONTH,
  Reservation
} from '../../../interfaces/reservation';
import {
  API_LOCALE,
  convertDuration,
  createNewDate,
  Duration,
  filterDateRoom,
  formatDateName,
  formatDateTwoDigit,
  formatDuration,
  formatFullDateTime,
  getNow,
  getTime,
  IDuration,
  newDate,
  plusMonthDate
} from '../../../util/dates';
import { TranslateService } from '@ngx-translate/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Store } from '@ngrx/store';
import { AppState, selectAuthState, selectReservationState } from '../../../store/app.states';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { ActivatedRoute, Router } from '@angular/router';
import * as fromActionsReservation from '../../../store/reservation.actions';
import { map, startWith } from 'rxjs/operators';
import { STEPPER_GLOBAL_OPTIONS } from '@angular/cdk/stepper';
import { getPrice, getUserName, newDiscount, newPrice, round } from '../../../util/helper';
import { DiscountType, IUserDiscount } from '../../../interfaces/discount';
import { transitionAnimation } from '../../../util/animation';
import { isEqual } from 'date-fns';

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

  errors: any = [];

  productForm!: FormGroup;
  groups: IProductGroup[] | undefined;
  filteredGroup: Observable<IProductGroup[] | undefined> | undefined;
  group: FormControl = new FormControl('', [
    Validators.required, requireMatch
  ]);
  productList: IProduct[] | undefined;
  filteredProduct: Observable<IProduct[] | undefined> | undefined;
  product: FormControl = new FormControl('', [
    Validators.required, requireMatch
  ]);

  discounts: IUserDiscount[] | undefined;
  showDiscount = false;
  price: IPrice;
  discount = new FormControl();

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
  selectedIndex = 1;
  smallScreen: boolean | undefined;
  isPreview = false;
  locale: string;

  isEditing = false;
  canCreate = false;
  distance: string | undefined;
  maxDate: Date;
  minDate: Date;
  startDate: Date | undefined;
  endDate: Date | undefined;

  private readonly extras: any;
  private reservation: IReservationAll | undefined;
  private measure = 'long';
  private duration: IDuration = new Duration();
  private time: any;
  private customerId: string | undefined;
  private productId: string | undefined;
  private reservationMonths = MAX_RESERVATION_MONTH;
  private getState: Observable<any>;
  private subscription: Subscription | undefined;

  constructor(private readonly translate: TranslateService, private snackBar: MatSnackBar, private store: Store<AppState>,
              private formBuilder: FormBuilder, private breakpointObserver: BreakpointObserver,
              private router: Router, private route: ActivatedRoute, private cdRef: ChangeDetectorRef) {
    this.getState = this.store.select(selectReservationState);
    this.store.select(selectAuthState).subscribe((state: any) => this.customerId = state.user.id);
    this.price = new Price();
    this.locale = this.translate.currentLang;
    breakpointObserver.observe([Breakpoints.XSmall, Breakpoints.Small])
      .subscribe(result => this.smallScreen = result.matches);
    this.minDate = getNow();
    this.maxDate = plusMonthDate(this.minDate, this.reservationMonths, this.minDate.getDate() + 1);
    this.extras = this.router.getCurrentNavigation()?.extras.state;
    if (this.extras) {
      this.productId = this.extras.product?.id;
      this.room.setValue(this.extras.room);
      this.date.setValue(this.extras.date);
    }
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
          this.price = newDiscount(this.price, userDiscount.discount);
        }
      }
    });
  }

  get professionalName(): string {
    return getUserName(this.room.value.professional);
  }

  get durationTime(): string {
    return formatDuration(this.product.value.duration, this.locale);
  }

  get products(): void {
    if (this.roomForm.invalid) {
      return;
    }
    this.getProductList();
    this.myStepper.next();

    return;
  }

  get availability(): void {
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

    return;
  }

  get preview(): void {
    if (!this.eventSelected) {
      this.errors.schedule = true;
      return;
    }

    this.startDate = newDate(this.eventSelected);
    this.endDate = createNewDate(this.startDate, this.startDate.getHours() + this.duration.hour,
      this.startDate.getMinutes() + this.duration.minute);

    this.isPreview = true;
    this.myStepper.next();

    return;
  }

  get back(): void {
    this.isPreview = false;
    this.myStepper.previous();

    return;
  }

  get dateNoContent(): string | null {
    return this.date.value ? formatDateName(this.date.value, this.translate.currentLang, this.measure) : null;
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

  myFilter = (d: Date | null): boolean => filterDateRoom(d, this.room.value);

  displayFnGroup(group: IProductGroup): string {
    return group ? `${group.name}` : '';
  }

  displayFnProduct(product: IProduct): string {
    return product ? `${product.name}` : '';
  }

  displayFnRoom(room: IRoom): string {
    return room ? `${room.name}` : '';
  }

  selectDate(datetime: any): void {
    this.eventSelected = datetime.date;
    this.time = datetime.time;
  }

  areEquals(datetime: any): boolean {
    let result = false;
    if (this.eventSelected) {
      result = isEqual(this.eventSelected, datetime.date) && this.time === datetime.time;
    }
    return result;
  }

  create(): void {
    const reservation: IReservation = new Reservation();
    reservation.customerId = this.customerId;
    reservation.roomId = this.room.value.id;
    if (this.startDate) {
      reservation.start = this.startDate.toLocaleString(API_LOCALE);
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

  sortDate(a: any, b: any): number {
    return newDate(a.key).getTime() - newDate(b.key).getTime();
  }

  formatKey(key: string): string {
    const date = newDate(key);
    const formattedDate = this.smallScreen ? formatDateTwoDigit(date, this.translate.currentLang)
      : formatDateName(date, this.translate.currentLang, this.measure);

    return formattedDate.charAt(0).toUpperCase() + formattedDate.slice(1);
  }

  sortTime(data: any): any {
    return data.sort((a: any, b: any) => newDate(a.date).getTime() - newDate(b.date).getTime());
  }

  setDistance($event: number): void {
    this.distance = $event > 999 ?
      this.translate.instant('ROOM.ADDRESS.DISTANCE.KM',
        {distance: round($event / 1000)}) :
      this.translate.instant('ROOM.ADDRESS.DISTANCE.M',
        {distance: round($event)});
  }

  keyDownHandler(event: any, form: FormControl): void {
    if (event.code === 'Backspace') {
      form.setValue('');
    }
  }

  keyDownGroup(event: any): void {
    this.productList = undefined;
    this.keyDownHandler(event, this.product);
    this.keyDownHandler(event, this.group);
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
    this.filteredGroup = this.group.valueChanges.pipe(startWith(''), map(value => {
      if (typeof value === 'string') {
        return value;
      }
      this.productList = value.products;
      this.product.setValue('');
      return value.name;
    }), map(name => name ? this.filterGroup(name) : this.groups ? this.groups.slice() : this.groups));
    this.filteredProduct = this.product.valueChanges.pipe(
      startWith(''),
      map(value => typeof value === 'string' ? value : value.name),
      map(name => name ? this.filterProduct(name) : this.productList ? this.productList.slice() : this.productList)
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
      this.groups = state.productDiscount?.groups;
      if (this.groups && this.productId && !this.group.value) {
        this.group.setValue(this.groups?.find(group => {
          const product = group.products?.find(p => p.id === this.productId);
          if (product) {
            this.productList = group.products;
            this.product.setValue(product);
            this.productId = this.product.value.id;
            return group;
          }
          return undefined;
        }));
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
      if (state.customerReservation && state.customerReservation.upcoming) {
        this.canCreate = false;
        const message = this.translate.instant('RESERVATION.UPCOMING.CUSTOMER.ERROR',
          {date: formatFullDateTime(newDate(state.customerReservation.upcoming.start), this.translate.currentLang)});
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
          const key = createNewDate(date).toString();

          let dates: any = group.get(key) || [];
          dates = [...dates, {time: getTime(newDate(item.start), this.locale), date}];
          group.set(key, dates);

          return group;
        }, new Map<string, any[]>());
      }

      this.setSelectedIndex();
    });
  }

  private setSelectedIndex(): void {
    let i = 0;
    new Map([...this.availableList.entries()]
      .sort((a: any, b: any) => this.sortDate({key: a[0]}, {key: b[0]})))
      .forEach((value, key) => {
        if (isEqual(this.date.value, newDate(key))) {
          this.selectedIndex = i;
        }
        i++;
      });
  }

  private filterGroup(name: string): IProductGroup[] | undefined {
    const filterValue = name.toLowerCase();

    return this.groups?.filter(option => option.name?.toLowerCase().indexOf(filterValue) === 0);
  }

  private filterProduct(name: string): IProduct[] | undefined {
    const filterValue = name.toLowerCase();

    return this.productList?.filter(option => option.name?.toLowerCase().indexOf(filterValue) === 0);
  }

  private filterRoom(name: string): IRoom[] | undefined {
    const filterValue = name.toLowerCase();

    return this.rooms?.filter(option => option.name?.toLowerCase().indexOf(filterValue) === 0);
  }

  private setData(reservation: IReservationAll): void {
    this.reservation = reservation;
    const date = newDate(reservation.start);
    this.time = getTime(date, this.locale);
    this.room.setValue(reservation.room);
    this.date.setValue(date);
    this.eventSelected = date;
    this.price = getPrice(this.reservation.product);
    this.group.setValue(this.groups?.find(group => {
      const product = group.products?.find(p => p.id === reservation.product.id);
      if (product) {
        return group;
      }
      return undefined;
    }));
    this.product.setValue(reservation.product);
    this.duration = convertDuration(reservation.product.duration);

    this.myStepper.next();
  }
}
