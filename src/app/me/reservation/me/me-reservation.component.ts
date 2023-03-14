import { AfterViewInit, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatStepper } from '@angular/material/stepper';
import { Observable, Subscription } from 'rxjs';
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { requireMatch, valueChange } from '../../../util/validators';
import { IGroupService, IPrice, IProduct, IProductGroup, Price } from '../../../interfaces/product';
import { IRoom, IService } from '../../../interfaces/room';
import {
  IAvailableDTO, IReservation, IReservationAll, MAX_RESERVATION_MONTH, Reservation
} from '../../../interfaces/reservation';
import {
  API_LOCALE, createNewDate, Duration, filterDateRoom, formatDateName, formatDateTwoDigit, formatFullDateTime,
  formatTime, getCurrentTimeZone, getNow, getTime, IDuration, isSameTimeZone, newDate, newDateTimestamp, plusMonthDate,
  stringDateUTCToTimeZone, totalDuration
} from '../../../util/dates';
import { TranslateService } from '@ngx-translate/core';
import { MatLegacySnackBar as MatSnackBar } from '@angular/material/legacy-snack-bar';
import { Store } from '@ngrx/store';
import { AppState, selectAuthState, selectReservationState } from '../../../store/app.states';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { ActivatedRoute, Router } from '@angular/router';
import * as fromActionsReservation from '../../../store/reservation.actions';
import { map, startWith } from 'rxjs/operators';
import { STEPPER_GLOBAL_OPTIONS } from '@angular/cdk/stepper';
import {
  createProductGroupService, createRoomOffice, getBackIndex, getFullUserName, getPrice, getProductDurability, getStep,
  getUserName, newAdditional, newDiscount, newPrice, openDialog, roomDetail, round
} from '../../../util/helper';
import { DiscountType, IUserDiscount } from '../../../interfaces/discount';
import { transitionAnimation } from '../../../util/animation';
import { isEqual } from 'date-fns';
import { IAdditionalAll } from '../../../interfaces/additional';
import { MatLegacyListOption as MatListOption } from '@angular/material/legacy-list';
import { MatDatepicker } from '@angular/material/datepicker';
import { IOffice } from '../../../interfaces/office';
import { IStep, Step } from '../../../interfaces/step';
import { TimeZoneSnackBarComponent } from '../../../shared/snak/time-zone/time-zone-snack-bar.component';
import { MatLegacyDialog as MatDialog } from '@angular/material/legacy-dialog';
import { Role } from '../../../interfaces/token';
import { IUser } from "../../../interfaces/user";

@Component({
  selector: 'app-me-reservation',
  animations: [transitionAnimation],
  templateUrl: './me-reservation.component.html',
  styleUrls: ['./me-reservation.component.scss'],
  providers: [{
    provide: STEPPER_GLOBAL_OPTIONS, useValue: { displayDefaultIndicatorType: false }
  }]
})
export class MeReservationComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('stepper') myStepper!: MatStepper;
  @ViewChild('picker') datePicker!: MatDatepicker<Date>;

  errors: any = [];

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
  showDiscount = false;
  price: IPrice;
  discount = new UntypedFormControl();

  roomForm!: UntypedFormGroup;
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

  startDate: UntypedFormControl = new UntypedFormControl('', [
    Validators.required
  ]);

  professionalList?: IUser[];
  filteredProfessional?: Observable<IUser[] | undefined>;
  professional: UntypedFormControl = new UntypedFormControl('', [
    Validators.required, requireMatch
  ]);

  additionalList: IAdditionalAll[] = [];
  additionalSelected: IAdditionalAll[] = [];

  availableList = new Map<string, any[]>();
  eventSelected?: Date;
  selectedIndex = 1;
  smallScreen?: boolean;
  isPreview = false;
  locale: string;

  isEditing = false;
  canCreate = false;
  distance?: string;
  maxDate: Date;
  maxDateFormat: string;
  minDate: Date;
  date?: Date;
  endDate?: Date;
  additionalDuration?: string;
  totalDuration?: string;
  durability?: string;

  private readonly extras: any;
  private reservation?: IReservationAll;
  private measure = 'long';
  private duration: IDuration = new Duration();
  private time: any;
  private roomId?: string;
  private professionalId?: string;
  private customerId?: string;
  private productId?: string;
  reservationId?: string;
  private reservationMonths = MAX_RESERVATION_MONTH;
  private getState: Observable<any>;
  private subscription?: Subscription;
  private steps: IStep[];
  private dismiss = false;

  constructor(private readonly translate: TranslateService, private snackBar: MatSnackBar,
              private store: Store<AppState>,
              private formBuilder: UntypedFormBuilder, private breakpointObserver: BreakpointObserver,
              private router: Router, private route: ActivatedRoute, public dialog: MatDialog) {
    this.getState = this.store.select(selectReservationState);
    this.store.select(selectAuthState).subscribe((state: any) => this.customerId = state.user.id);
    this.price = new Price();
    this.locale = this.translate.currentLang;
    breakpointObserver.observe([Breakpoints.XSmall, Breakpoints.Small])
      .subscribe(result => this.smallScreen = result.matches);
    this.minDate = getNow();
    this.maxDate = plusMonthDate(this.minDate, this.reservationMonths, this.minDate.getDate() + 1);
    this.maxDateFormat = formatDateTwoDigit(this.maxDate, this.locale);
    this.extras = this.router.getCurrentNavigation()?.extras.state;
    if (this.extras) {
      this.productId = this.extras.product?.key || this.extras.product?.id;
      this.roomId = this.extras.room?.id;
      this.professionalId = this.extras.professional?.id;
      this.room.setValue(this.extras.room);
      this.startDate.setValue(this.extras.date);
    }
    const preview = new Step(4, 'preview', () => this.create);
    const book = new Step(3, 'book_online', () => this.callStepFive, preview);
    const additional = new Step(2, 'post_add', () => this.callStepFour, book, false);
    const product = new Step(1, 'home_repair_service', () => this.callStepThree, additional);
    const room = new Step(0, 'room', () => this.callStepTwo, product);
    this.steps = [room, product, additional, book, preview];
  }

  get professionalName(): string {
    return getUserName(this.professional.value);
  }

  get roomDetail(): string {
    return roomDetail(this.room.value);
  }

  get callStepTwo(): void {
    console.log("products")
    if (this.roomForm.invalid) {
      return;
    }
    this.professionalId = this.professional.value.id;
    this.roomId = this.room.value.id;
    this.getProductList();
    return this.completeAndNext();
  }

  get callStepThree(): void {
    if (this.productForm.invalid) {
      return;
    }
    this.productId = this.product.value.id
    return this.completeAndNext();
  }

  get callStepFour(): void {
    if (this.productForm.invalid) {
      return;
    }
    if (this.eventSelected !== this.startDate.value) {
      this.eventSelected = undefined;
      this.time = undefined;
    }
    this.duration = totalDuration(this.product.value, this.additionalSelected);
    this.totalDuration = formatTime(this.duration, this.locale);
    this.additionalDuration = formatTime(totalDuration(undefined, this.additionalSelected), this.locale);

    this.store.dispatch(
      new fromActionsReservation.CustomerSearchReservation({
        date: this.startDate.value,
        roomId: this.room.value.id,
        productId: this.product.value.id,
        professionalId: this.professional.value.id,
        additionalIds: this.additionalSelected?.map(additional => additional.id)
      })
    );
    return this.completeAndNext();
  }

  get callStepFive(): void {
    if (!this.eventSelected) {
      this.errors.schedule = true;
      return;
    }

    this.date = newDate(this.eventSelected);
    this.endDate = createNewDate(this.date, this.date.getHours() + this.duration.hour,
      this.date.getMinutes() + this.duration.minute);

    this.isPreview = true;
    return this.completeAndNext();
  }

  get back(): void {
    if (this.isPreview) {
      this.isPreview = false;
    } else {
      this.eventSelected = undefined;
    }
    this.myStepper.selectedIndex = getBackIndex(this.steps, this.myStepper.selectedIndex);
    return;
  }

  get create(): void {
    const reservation: IReservation = new Reservation();
    reservation.customerId = this.customerId;
    reservation.roomId = this.room.value.id;
    reservation.professionalId = this.professional.value.id;
    if (this.date) {
      reservation.start = this.date.toLocaleString(API_LOCALE);
      reservation.timeZone = getCurrentTimeZone();
    }
    reservation.additionalIds = this.additionalSelected?.map(value => value.id);

    const role = Role.customer;
    if (this.isEditing && this.reservation) {
      reservation.id = this.reservation.id;
      reservation.productId = valueChange(this.product.value.id, this.reservation.product.id);

      this.store.dispatch(
        new fromActionsReservation.Edit({ reservation, role })
      );
    }
    else {
      reservation.productId = this.product.value.id;
      reservation.discountId = this.discount.value;
      this.store.dispatch(
        new fromActionsReservation.ReservationSave({ reservation, role })
      );
    }

    return;
  }

  get showTimeZone(): boolean {
    return !isSameTimeZone(this.room.value.timeZone);
  }

  private static goNext(step: IStep): void {
    const nextStep = step.next;
    if (nextStep && !nextStep.enable) {
      nextStep.call();
    }
    return;
  }

  ngOnInit(): void {
    this.createForm();
    this.createFilter();
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
              value.completed = true;
              return value;
            default:
              return value;
          }
        });
        this.getReservation(reservationId);
      }
      else {
        this.getRoomList();
      }
    });
  }

  ngAfterViewInit(): void {
    if (!this.isEditing) {
      this.getUpcomingReservation();
    }
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

  openDialog(reservationDate?: Date): void {
    openDialog(this.room.value, this.locale, this.translate, this.dialog, reservationDate);
  }

  myFilter = (d: Date | null): boolean => filterDateRoom(d, this.room.value);

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

  dateNoContent(date?: any): string {
    return formatDateName(createNewDate(date ? date : this.startDate.value), this.translate.currentLang, this.measure);
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
      this.translate.instant('ME.RESERVATION.ROOM.ADDRESS.DISTANCE.KM',
        { distance: round($event / 1000) }) :
      this.translate.instant('ME.RESERVATION.ROOM.ADDRESS.DISTANCE.M',
        { distance: round($event) });
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
    this.roomList = undefined;
    this.keyDownHandler(event, this.room);
    this.keyDownHandler(event, this.office);
  }

  onChange(options: MatListOption[]): void {
    this.additionalSelected = options.map(o => o.value);
    this.price = newAdditional(this.price, this.additionalSelected);
  }

  isSelected(it: IAdditionalAll): boolean {
    return this.additionalSelected.filter(el => el.id === it.id).length > 0;
  }

  private getReservation(id: string | null): void {
    this.store.dispatch(
      new fromActionsReservation.ReservationFind({ id })
    );
  }

  private getRoomList(): void {
    this.store.dispatch(
      new fromActionsReservation.GetAllRooms({})
    );
  }

  private getUpcomingReservation(): void {
    this.store.dispatch(
      new fromActionsReservation.GetUpcomingReservation()
    );
  }

  private getProductList(): void {
    this.store.dispatch(
      new fromActionsReservation.GetAllServices({ roomId: this.room.value.id })
    );
  }

  private createForm(): void {
    this.productForm = this.formBuilder.group({
      product: this.product,
      discount: this.discount,
      startDate: this.startDate
    });
    this.roomForm = this.formBuilder.group({
      room: this.room,
      professional: this.professional
    });
    this.valueChange();
  }

  private valueChange(): void {
    this.office.valueChanges.subscribe(value => {
      if (!value) {
        return;
      }
      this.roomList = value.rooms;
      const room = value.rooms?.find((o: IRoom) => o.id === this.roomId);
      if (room) {
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

    this.room.valueChanges.subscribe(value => {
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
        const professional = value.professionals?.find((o: IUser) => o.id === this.professionalId);
        if (professional) {
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
        // if (!this.groups) {
        // this.getProductList();
        // }
      }
      this.group.setValue('');
      this.cleanProduct();
    });

    this.group.valueChanges.subscribe(value => {
      if (!value) {
        return;
      }
      this.productList = value.products;
      const product = value.products?.find((p: IProductGroup) => p.id === this.productId);
      if (product) {
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
          this.price = newDiscount(this.price, userDiscount.discount);
        }
      }
    });
  }

  private createFilter(): void {
    this.filteredGroup = this.group.valueChanges.pipe(startWith(''),
      map(value => typeof value === 'string' ? value : value.name),
      map(name => name ? this.filterGroup(name) : this.groups ? this.groups.slice() : this.groups));

    this.filteredProduct = this.product.valueChanges.pipe(
      startWith(''),
      map(value => typeof value === 'string' ? value : value.name),
      map(name => name ? this.filterProduct(name) : this.productList ? this.productList.slice() : this.productList)
    );
    this.filteredOffice = this.office.valueChanges.pipe(startWith(''),
      map(value => typeof value === 'string' ? value : value.name),
      map(name => name ? this.filterOffice(name) : this.offices ? this.offices.slice() : this.offices));

    this.filteredRoom = this.room.valueChanges.pipe(
      startWith(''),
      map(value => typeof value === 'string' ? value : value.name),
      map(name => name ? this.filterRoom(name) : this.roomList ? this.roomList.slice() : this.roomList)
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

  private subscribe(): void {
    this.subscription = this.getState.subscribe(state => {
      this.additionalList = state.productDiscount?.additionalList;
      if (this.additionalList && this.additionalList.length) {
        this.steps = this.steps.map(value => {
          if (value.order === 2) {
            value.enable = true;
            return value;
          }
          return value;
        });
      }
      if (state.productDiscount?.products) {
        this.groups = Array.from(
          createProductGroupService(new Map<string, IGroupService>(), state.productDiscount.products,
            this.room.value.currency).values());
      }
      if (this.groups && this.productId && !this.group.value) {
        this.group.setValue(
          this.groups?.find(group => group.products?.find(p => p.id === this.productId) ? group : undefined));
        if (this.reservation) {
          this.datePicker?.open();
        }
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
      this.offices = Array.from(createRoomOffice(state.rooms)?.values() || []);
      if (this.offices && this.offices.length === 1) {
        this.office.setValue(this.offices[0]);
      }
      if (state.selected && !this.reservation) {
        this.setData(state.selected);
      }
      if (state.customerReservation && state.customerReservation.upcoming && state.customerReservation.upcoming.length) {
        this.canCreate = false;
        const date = newDateTimestamp(state.customerReservation.upcoming[0].timestamp,
          state.customerReservation.upcoming[0].room.timeZone)
        const message = this.translate.instant('ME.RESERVATION.UPCOMING.CUSTOMER.ERROR',
          {
            date: formatFullDateTime(date, this.translate.currentLang)
          });
        const snackBarRef = this.snackBar.open(message, 'OK', {
          duration: 5000
        });
        snackBarRef.afterDismissed().subscribe(() => {
          this.clean();
          this.router.navigate(['me', 'reservations']);
        });
      }
      else {
        this.canCreate = true;
      }
      // Multiple professionals
      // if (state.data) {
      //   this.professionalAvailableList = new Map<string, Map<string, any[]>>();
      //   Object.keys(state.data).map((key) => {
      //     const date = newDate(key);
      //     const id = createNewDate(date).toString();
      //     state.data[key].reduce((group: Map<string, Map<string, any[]>>, pId: string) => {
      //       let professionals = group.get(pId) || new Map<string, any[]>();
      //
      //       let dates: any = professionals.get(id) || [];
      //       dates = [...dates, { time: getTime(date, this.locale), date }];
      //       professionals.set(id, dates);
      //       group.set(pId, professionals);
      //
      //       return group;
      //     }, this.professionalAvailableList);
      //   });
      //   this.setSelectedIndex();
      // }
      if (state.data && Array.isArray(state.data)) {
        this.availableList = new Map<string, any[]>();
        this.availableList.set(createNewDate(this.startDate.value).toString(), []);
        state.data.reduce((group: Map<string, string[]>, item: IAvailableDTO) => {
          const date = stringDateUTCToTimeZone(item.start);
          const key = createNewDate(date).toString();

          let dates: any = group.get(key) || [];
          dates = [...dates, { time: getTime(date, this.locale), date }];
          group.set(key, dates);

          return group;
        }, this.availableList);
        this.setSelectedIndex();
      }
      if (state.subErrors) {
        state.subErrors.forEach((value: any) => {
          switch (value.field) {
            case 'startDate':
              this.myStepper.selectedIndex = 1;
              break;
            default:
              this.myStepper.selectedIndex = 0;
              break;
          }
          this.eventSelected = undefined;
          this.errors[value.field] = value.message;
          this.productForm.controls[value.field]?.setErrors({ incorrect: true });
        });
      }
    });
  }

  private setSelectedIndex(): void {
    let i = 0;
    new Map([...this.availableList.entries()]
      .sort((a: any, b: any) => this.sortDate({ key: a[0] }, { key: b[0] })))
      .forEach((value, key) => {
        if (isEqual(this.startDate.value, newDate(key))) {
          this.selectedIndex = i;
        }
        i++;
      });
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

  private completeStep(step: IStep): void {
    this.myStepper.next();
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
    this.eventSelected = date;
    this.time = getTime(date, this.locale)
    this.room.setValue(reservation.room);
    this.professional.setValue(reservation.professional);
    this.startDate.setValue(date);
    this.price = getPrice(this.reservation);
    this.additionalSelected = this.reservation.additional ? this.reservation.additional
      .map(ad => Object.assign({}, ad, { id: ad.key })) : [];
    this.productId = reservation.product.key;
    this.roomId = reservation.room.id;
    this.professionalId = reservation.professional.id;
    if (this.isEditing) {
      this.getProductList();
    }
  }

  private completeAndNext(): void {
    setTimeout(() => {
      const step = getStep(this.steps, this.myStepper.selectedIndex);
      if (step) {
        this.completeStep(step);
        MeReservationComponent.goNext(step);
      }
    }, 100);
  }

  private cleanProduct(): void {
    this.price = new Price();
    this.discount.setValue(undefined);
    this.product.setValue('');
    this.showDiscount = false;
    this.productList = undefined;
  }
}
