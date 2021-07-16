import { ChangeDetectorRef, Component, Inject, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Store } from '@ngrx/store';
import { AppState, selectAuthState, selectReservationState } from '../../store/app.states';
import { Observable, Subscription } from 'rxjs';
import * as fromActionsReservation from '../../store/reservation.actions';
import * as fromActionsPayment from '../../store/payment.actions';
import { IReservationAll } from '../../interfaces/reservation';
import { ActivatedRoute, Router } from '@angular/router';
import {
  convertDuration,
  createNewDate,
  Duration,
  formatDateTime,
  getNow,
  getTime,
  greaterThanToday,
  IDuration,
  isTomorrow,
  newDate
} from '../../util/dates';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { IUserAll } from '../../interfaces/user';
import { DialogComponent } from '../../dialog/dialog.component';
import { TranslateService } from '@ngx-translate/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Role } from '../../interfaces/token';
import { getFullUserName, getPriceDiscount, getUserName, snakeToCamel, totalPaid, totalPrice } from '../../util/helper';
import { FormControl } from '@angular/forms';
import { map, startWith } from 'rxjs/operators';
import { IProduct } from '../../interfaces/product';
import { requireMatch, valueChange } from '../../util/validators';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { MatFabMenuDirection } from '@angular-material-extensions/fab-menu/lib/mat-fab-menu.component';
import { IPayment, PaymentType } from '../../interfaces/payment';
import { transitionAnimation } from '../../util/animation';

export enum ReservationIconName {
  created = 'assignment',
  approved = 'done',
  send = 'sms',
  started = 'play_arrow',
  completed = 'done_all',
  cancelled = 'clear',
  edit = 'edit_calendar',
  book = 'book_online',
  paid = 'price_check',
  partiallyPaid = 'request_quote',
  payment = 'payment',
  partiallyCompleted = 'rule',
  more = 'read_more'
}

@Component({
  selector: 'app-reservation-detail',
  animations: [transitionAnimation],
  templateUrl: './reservation-detail.component.html',
  styleUrls: ['./reservation-detail.component.scss']
})
export class ReservationDetailComponent implements OnInit, OnDestroy {
  getState: Observable<any>;
  subscription: Subscription | undefined;
  reservation: IReservationAll | undefined;
  duration: IDuration = new Duration();
  start: Date = getNow();
  end: Date = getNow();
  state: string | undefined;

  locale: string;
  language: string;
  isLoading = false;
  changeState: any;
  professionalId: string | undefined;
  customerId: string | undefined;
  machine: any;

  displayedColumns: string[] = ['position', 'professional', 'start', 'product', 'state'];
  dataSource: any;
  pageSize = 5;
  user: IUserAll | undefined;

  priceDiscount: number | undefined;
  total: number | undefined;

  public paginator: MatPaginator | undefined;

  direction: MatFabMenuDirection = 'left';
  tooltipPosition = 'below';

  showFireworks = false;

  payments: any;
  paymentPaid: any;
  paymentDisplayedColumns: string[] = ['position', 'description', 'status', 'type', 'amount'];

  constructor(private readonly translate: TranslateService, public dialog: MatDialog, private route: ActivatedRoute,
              private store: Store<AppState>, private cdRef: ChangeDetectorRef, private router: Router,
              private breakpointObserver: BreakpointObserver) {
    this.getState = this.store.select(selectReservationState);
    breakpointObserver.observe([
      Breakpoints.XSmall,
      Breakpoints.Small
    ]).subscribe(result => {
      if (result.matches) {
        this.direction = 'bottom';
        this.tooltipPosition = 'left';
      }
    });
    const userLang = this.translate.currentLang;
    this.language = userLang;
    const index = userLang.indexOf('-');
    this.locale = index === -1 ? userLang : userLang.substr(0, index);

    this.store.select(selectAuthState).subscribe((state: any) => {
      const user: IUserAll = state.user;
      this.professionalId = user.authorities.some(u => u.authority === Role.professional) ? user.id : undefined;
      this.customerId = user.authorities.some(u => u.authority === Role.customer) ? user.id : undefined;
      this.user = user;
    });
  }

  @ViewChild(MatPaginator) set matPaginator(mp: MatPaginator) {
    this.paginator = mp;
    if (this.dataSource) {
      this.dataSource.paginator = this.paginator;
    }
  }

  get customerName(): string {
    return this.reservation ? getFullUserName(this.reservation.customer) : '';
  }

  get professionalName(): string {
    return this.reservation ? getUserName(this.reservation.room.professional) : '';
  }

  private static createMachine(stateMachineDefinition: any, initialState: any): any {
    const machine = {
      value: initialState,
      transition: (currentState: any, event: any): any => {
        const currentStateDefinition = stateMachineDefinition[currentState];
        const destinationTransition = currentStateDefinition.transitions[event];
        if (!destinationTransition) {
          return;
        }
        const destinationState = destinationTransition.target;
        destinationTransition.action();
        machine.value = destinationState;
        return machine.value;
      },
      next: (currentState: any): any => {
        const currentStateDefinition = stateMachineDefinition[currentState];
        return currentStateDefinition.next;
      }
    };
    return machine;
  }

  private static createTransaction(target: string, action: any): any {
    return {target, action};
  }

  getProfessionalName(history: any): string {
    return getUserName(history.room.professional);
  }

  ngOnInit(): void {
    this.subscribe();
    this.route.params.subscribe(routeParams => {
      this.getReservation(routeParams.id);
    });
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }

  getIcon(name: any): any {
    // @ts-ignore
    return ReservationIconName[snakeToCamel(name)];
  }

  onChangeState(id: string | number): void {
    if (['send', 'book', 'more'].indexOf(id.toString()) >= 0 && this.reservation) {
      this.machine.transition(snakeToCamel(this.reservation.state), id);
      return;
    }
    const title = this.translate.instant('RESERVATION.DETAIL.CHANGE_STATE.TITLE');
    const action = this.translate.instant(`RESERVATION.DETAIL.CHANGE_STATE.ACTION.${String(id).toUpperCase()}`);
    const content = this.translate.instant('RESERVATION.DETAIL.CHANGE_STATE.CONTENT', {action});
    const dialogRef = this.dialog.open(DialogComponent, {
      data: {title, content, value: id}
    });

    dialogRef.afterClosed().subscribe(event => {
      if (event && this.reservation) {
        this.machine.transition(snakeToCamel(this.reservation.state), event);
      }
    });
  }

  getTotal(): number {
    return this.paymentPaid?.map((p: IPayment) => p.amount).reduce((acc: number, value: number) => acc + value, 0);
  }

  private createAction(tooltip: string, icon: string, id: string, color?: string): any {
    return {tooltip, tooltipPosition: this.tooltipPosition, icon, id, color};
  }

  private subscribe(): void {
    this.subscription = this.getState.subscribe(state => {
      this.isLoading = state.isLoading;
      this.payments = state.payments;
      this.paymentPaid = state.payments?.filter((p: IPayment) => p.status === 'approved');
      if (state.selected) {
        this.duration = convertDuration(state.selected.product.duration);
        this.start = newDate(state.selected.start);
        this.end = createNewDate(this.start, this.start.getHours() + this.duration.hour,
          this.start.getMinutes() + this.duration.minute);
        // @ts-ignore
        this.state = ReservationIconName[snakeToCamel(state.selected.state)];
        this.reservation = state.selected;
        if (this.professionalId && this.professionalId === this.reservation?.room.professional.id) {
          this.professionalMachine(this);
          this.changeState = this.machine.next(snakeToCamel(this.reservation.state));
        } else if (this.customerId && this.customerId === this.reservation?.customer.id) {
          this.customerMachine(this);
          this.changeState = this.machine.next(snakeToCamel(this.reservation.state));
          if (this.reservation.state === 'COMPLETED') {
            this.showFireworks = true;
            setTimeout(() => {
              this.showFireworks = false;
            }, 5000);
          }
        }
        if (this.reservation && this.reservation.product) {
          this.priceDiscount = getPriceDiscount(this.reservation.product.discount, this.reservation.product.price);
          if (this.reservation.product.extras && this.reservation.product.extras.price) {
            this.total = this.reservation.product.extras.price +
              (this.priceDiscount ? this.priceDiscount : this.reservation.product.price);
          }
        }
        this.dataSource = new MatTableDataSource<IReservationAll>(state.selected.history);
        this.cdRef.detectChanges();
      }
      if (state.errorMessage || state.message) {
        if (state.message) {
          const id: string | null = this.route.snapshot.paramMap.get('id');
          this.getReservation(id);
        }
      }
    });
  }

  private getReservation(id: string | null): void {
    this.reservation = undefined;
    this.store.dispatch(
      new fromActionsReservation.ReservationFind(id)
    );
    this.store.dispatch(
      new fromActionsReservation.ReservationFindPayments(id)
    );
  }

  private professionalMachine(self: this): any {
    const reservationId = self.reservation?.id;
    const initialState = self.reservation?.state;
    const store = self.store;
    const translate = self.translate;

    const approve = this.createAction(translate.instant('RESERVATION.DETAIL.ACTION.APPROVE'),
      ReservationIconName.approved, 'approve', 'primary');
    const start = this.createAction(translate.instant('RESERVATION.DETAIL.ACTION.START'),
      ReservationIconName.started, 'start', 'primary');
    const complete = this.createAction(translate.instant('RESERVATION.DETAIL.ACTION.COMPLETE'),
      ReservationIconName.completed, 'complete', 'primary');
    const edit = this.createAction(translate.instant('RESERVATION.DETAIL.ACTION.EDIT'),
      ReservationIconName.edit, 'edit', 'accent');
    const cancel = this.createAction(translate.instant('RESERVATION.DETAIL.ACTION.CANCEL'),
      ReservationIconName.cancelled, 'cancel', 'warn');
    const book = this.createAction(translate.instant('RESERVATION.DETAIL.ACTION.BOOK'),
      ReservationIconName.book, 'book', 'primary');
    const sendMessage = this.createAction(translate.instant('RESERVATION.DETAIL.ACTION.SEND'),
      ReservationIconName.send, 'send', 'green');

    const more = this.createAction(translate.instant('RESERVATION.DETAIL.ACTION.MORE'),
      ReservationIconName.more, 'more');

    let approveActions = [start, edit];
    if (self.reservation && self.reservation.customer && self.reservation.customer.phone &&
      greaterThanToday(newDate(self.reservation.start))) {
      approveActions = [...approveActions, sendMessage];
    }
    approveActions = [...approveActions, more, cancel];

    const approveTransaction = ReservationDetailComponent.createTransaction('approved', (): void => {
      self.reservation = undefined;
      store.dispatch(
        new fromActionsReservation.Approve(reservationId)
      );
    });

    const sendMessageTransaction = ReservationDetailComponent.createTransaction('send', (): void => {
      if (self.reservation && self.reservation.start) {
        const startDate = newDate(self.reservation.start);
        let message;
        if (isTomorrow(startDate)) {
          const date = getTime(startDate);
          message = translate.instant('WHATSAPP.SEND.TOMORROW', {date});
        } else {
          const date = formatDateTime(startDate, self.language);
          message = translate.instant('WHATSAPP.SEND.APPROVE', {date});
        }
        window.open(`https://api.whatsapp.com/send?phone=+${self.reservation.customer?.phone}&text=${message}`, '_blank');
      }
    });

    const startTransaction = ReservationDetailComponent.createTransaction('started', (): void => {
      self.reservation = undefined;
      store.dispatch(
        new fromActionsReservation.Start(reservationId)
      );
    });

    const editTransaction = ReservationDetailComponent.createTransaction('edited', (): void => {
      self.router.navigate(['reservation', reservationId, 'edit']);
    });

    const completeTransaction = ReservationDetailComponent.createTransaction('completed', (): void => {
      const dialogRef = self.dialog.open(CompleteDialogComponent, {
        disableClose: true,
        data: {
          reservation: self.reservation,
          payments: self.payments
        }
      });

      dialogRef.afterClosed().subscribe(result => {
        if (result) {
          self.reservation = undefined;
          self.store.dispatch(
            new fromActionsReservation.Complete({reservationId, extras: result})
          );
        }
      });
    });

    const moreTransaction = ReservationDetailComponent.createTransaction('more', (): void => {
      self.router.navigate(['reservation', reservationId, 'more-info']);
    });

    const cancelTransaction = ReservationDetailComponent.createTransaction('cancelled', (): void => {
      self.reservation = undefined;
      self.store.dispatch(
        new fromActionsReservation.Cancel(reservationId)
      );
    });

    const finishTransaction = ReservationDetailComponent.createTransaction('completed', (): void => {
      self.reservation = undefined;
      self.store.dispatch(
        new fromActionsReservation.PaymentComplete(reservationId)
      );
    });

    const bookTransaction = ReservationDetailComponent.createTransaction('booked', (): void => {
      const customer = self.reservation?.customer;
      const room = self.reservation?.room;
      const product = self.reservation?.product;
      const data = {customer, room, product};
      this.router.navigate(['reservation'], {state: data});
    });

    const approved = {
      transitions: {
        start: startTransaction,
        cancel: cancelTransaction,
        edit: editTransaction,
        send: sendMessageTransaction,
        more: moreTransaction
      },
      next: approveActions
    };

    this.machine = ReservationDetailComponent.createMachine({
      initialState: ReservationIconName.created,
      created: {
        transitions: {
          approve: approveTransaction,
          cancel: cancelTransaction,
          edit: editTransaction,
          more: moreTransaction
        },
        next: [approve, edit, cancel, more]
      },
      approved,
      paid: approved,
      partiallyPaid: approved,
      started: {
        transitions: {
          complete: completeTransaction
        },
        next: [complete]
      },
      partiallyCompleted: {
        transitions: {
          complete: finishTransaction,
          more: moreTransaction
        },
        next: [complete, more]
      },
      completed: {
        transitions: {
          book: bookTransaction,
          more: moreTransaction
        },
        next: [book, more]
      },
      cancelled: {
        next: []
      }
    }, initialState);
  }

  private customerMachine(self: this): any {
    const reservationId = self.reservation?.id;
    const initialState = self.reservation?.state;
    const translate = self.translate;

    const edit = this.createAction(translate.instant('RESERVATION.DETAIL.ACTION.EDIT'),
      ReservationIconName.edit, 'edit', 'accent');
    const cancel = this.createAction(translate.instant('RESERVATION.DETAIL.ACTION.CANCEL'),
      ReservationIconName.cancelled, 'cancel', 'warn');
    const book = this.createAction(translate.instant('RESERVATION.DETAIL.ACTION.BOOK'),
      ReservationIconName.book, 'book', 'primary');

    const editTransaction = ReservationDetailComponent.createTransaction('edited', (): void => {
      self.router.navigate(['me', 'reservation', reservationId]);
    });

    const cancelTransaction = ReservationDetailComponent.createTransaction('cancelled', (): void => {
      self.reservation = undefined;
      self.store.dispatch(
        new fromActionsReservation.CustomerCancel(reservationId)
      );
    });

    const bookTransaction = ReservationDetailComponent.createTransaction('booked', (): void => {
      const room = self.reservation?.room;
      const product = self.reservation?.product;
      const data = {room, product};
      this.router.navigate(['me', 'reservation'], {state: data});
    });

    const approved = {
      transitions: {
        edit: editTransaction,
        cancel: cancelTransaction,
        pay: null
      },
      next: [edit, cancel]
    };

    const partiallyCompleted = {
      transitions: {
        pay: null
      },
      next: [] as any[]
    };

    if (self.payments && self.reservation) {
      const paid = totalPaid(self.payments);
      const total = totalPrice(self.reservation.product);
      if (total > paid) {
        const next = this.createAction(translate.instant('RESERVATION.DETAIL.ACTION.PAY'),
          ReservationIconName.payment, 'pay', 'blue');
        approved.next = [...approved.next, next];
        partiallyCompleted.next = [...partiallyCompleted.next, next];

        const transaction = ReservationDetailComponent.createTransaction('paid',
          (): void => self.store.dispatch(
            new fromActionsPayment.PaymentSelected(self.payments)
          ));
        approved.transitions.pay = transaction;
        partiallyCompleted.transitions.pay = transaction;
      }
    }

    this.machine = ReservationDetailComponent.createMachine({
      initialState: ReservationIconName.created,
      created: {
        transitions: {
          cancel: cancelTransaction,
          edit: editTransaction
        },
        next: [edit, cancel]
      },
      approved,
      paid: {
        transitions: {
          edit: editTransaction,
          cancel: cancelTransaction
        },
        next: [edit, cancel]
      },
      partiallyPaid: approved,
      started: {
        next: []
      },
      partiallyCompleted,
      completed: {
        transitions: {
          book: bookTransaction
        },
        next: [book]
      },
      cancelled: {
        next: []
      }
    }, initialState);
  }
}

@Component({
  selector: 'app-complete-dialog-component',
  animations: [transitionAnimation],
  templateUrl: './complete-dialog.component.html'
})
export class CompleteDialogComponent implements OnInit, OnDestroy {
  getState: Observable<any>;
  subscription: Subscription | undefined;

  products: IProduct[] | undefined;
  priceDiscount: number | undefined;
  filteredProduct: Observable<IProduct[] | undefined> | undefined;
  product: FormControl = new FormControl('', [requireMatch]);

  description: FormControl = new FormControl();
  price: FormControl = new FormControl();
  type: FormControl = new FormControl(PaymentType.cash);

  total = 0;
  totalToPaid = 0;

  types = PaymentType;

  constructor(public dialogRef: MatDialogRef<CompleteDialogComponent>, @Inject(MAT_DIALOG_DATA) public data: any,
              private store: Store<AppState>) {
    this.getState = store.select(selectReservationState);
    const paid: number = totalPaid(data.payments);
    this.product.valueChanges.subscribe(value => {
      if (value) {
        this.total = value.price + (this.price.value ? this.price.value : 0);
        if (data.reservation.product) {
          this.priceDiscount = getPriceDiscount(data.reservation.product.discount, this.total);
        }
        this.totalToPaid = (this.priceDiscount ? this.priceDiscount : this.total) - paid;
      }
    });
    this.price.valueChanges.subscribe(value => {
      if (value) {
        this.total = this.product.value.price + value;
        if (data.reservation.product) {
          this.priceDiscount = getPriceDiscount(data.reservation.product.discount, this.total);
        }
      } else {
        this.total = this.product.value.price;
      }
      this.totalToPaid = (this.priceDiscount ? this.priceDiscount : this.total) - paid;
    });
    this.product.setValue(data.reservation?.product);
  }

  get customerName(): string {
    return this.data.reservation ? getUserName(this.data.reservation.customer) : '';
  }

  get durationTime(): string {
    const duration = convertDuration(this.product.value.duration);
    return getTime(createNewDate(getNow(), duration.hour, duration.minute));
  }

  ngOnInit(): void {
    this.getProducts();
    this.subscribe();
    this.filteredProduct = this.product.valueChanges.pipe(
      startWith(''),
      map(value => typeof value === 'string' ? value : value.name),
      map(name => name ? this.filterProduct(name) : this.products ? this.products.slice() : this.products)
    );
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  doAction(): void {
    const productId = valueChange(this.product.value.id, this.data.reservation.product.id);
    const description = this.description.value;
    const price = this.price.value;
    const paymentType = this.type.value;
    this.dialogRef.close({description, price, productId, paymentType});
  }

  displayFnProduct(product: IProduct): string {
    return product ? `${product.name}` : '';
  }

  keyDownHandler(event: any): void {
    if (event.code === 'Backspace') {
      this.product.setValue('');
    }
  }

  private subscribe(): void {
    this.subscription = this.getState.subscribe(state => {
      if (state.productDiscount) {
        this.products = state.productDiscount.products;
      }
    });
  }

  private getProducts(): void {
    this.store.dispatch(
      new fromActionsReservation.GetAllProducts()
    );
  }

  private filterProduct(name: string): IProduct[] | undefined {
    const filterValue = name.toLowerCase();

    return this.products?.filter(option => option.name?.toLowerCase().indexOf(filterValue) === 0);
  }
}
