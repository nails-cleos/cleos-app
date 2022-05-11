import { ChangeDetectorRef, Component, Inject, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Store } from '@ngrx/store';
import { AppState, selectAuthState, selectReservationState, selectUserState } from '../../store/app.states';
import { Observable, Subscription } from 'rxjs';
import * as fromActionsReservation from '../../store/reservation.actions';
import * as fromActionsPayment from '../../store/payment.actions';
import { IReservationAll, States } from '../../interfaces/reservation';
import { ActivatedRoute, Router } from '@angular/router';
import {
  createNewDate,
  Duration,
  formatDateTime,
  getNow,
  getTime,
  greaterOrEqualsThanToday,
  IDuration,
  newDate,
  reservationDateTime,
  reservationDuration
} from '../../util/dates';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { IUser, IUserAll } from '../../interfaces/user';
import { DialogComponent } from '../../shared/dialog/dialog.component';
import { TranslateService } from '@ngx-translate/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Role } from '../../interfaces/token';
import { currencySymbol, getFullUserName, getPrice, getUserName, roomName, snakeToCamel } from '../../util/helper';
import { IPrice, Price } from '../../interfaces/product';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { MatFabMenu, MatFabMenuDirection } from '@angular-material-extensions/fab-menu/lib/mat-fab-menu.component';
import { IPayment } from '../../interfaces/payment';
import { detailExpandAnimation, transitionAnimation } from '../../util/animation';
import { isToday, isTomorrow } from 'date-fns';
import { ReservationIconKey, ReservationIconName } from '../../util/icon';
import { DiscountDialogComponent } from '../../discount/list/discounts.component';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { map, startWith } from 'rxjs/operators';
import * as fromActionsUser from '../../store/user.actions';
import { requireMatch } from '../../util/validators';

@Component({
  selector: 'app-reservation-detail',
  animations: [transitionAnimation, detailExpandAnimation],
  templateUrl: './reservation-detail.component.html',
  styleUrls: ['./reservation-detail.component.scss']
})
export class ReservationDetailComponent implements OnInit, OnDestroy {
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  reservation: IReservationAll | undefined;
  history: IReservationAll[] | undefined;
  duration: IDuration = new Duration();
  start: Date = getNow();
  end: Date = getNow();
  state: string | undefined;

  language: string;
  changeState: MatFabMenu[] = [];

  displayedColumns: string[] = ['position', 'professional', 'start', 'product', 'state'];
  dataSource: any;
  expanded?: IReservationAll;
  pageSize = 5;

  price: IPrice;

  direction: MatFabMenuDirection = 'left';
  showFireworks = false;

  paymentPaid: any;
  paymentDisplayedColumns: string[] = ['position', 'description', 'status', 'type', 'amount'];
  paymentExpanded?: IPayment;

  private payments: any;
  private tooltipPosition = 'below';
  private machine: any;
  private customerId: string | undefined;
  private professionalId: string | undefined;
  private isLoading = false;
  private getState: Observable<any>;
  private subscription: Subscription | undefined;
  private small = false;

  constructor(private readonly translate: TranslateService, public dialog: MatDialog, private route: ActivatedRoute,
              private store: Store<AppState>, private cdRef: ChangeDetectorRef, private router: Router,
              private breakpointObserver: BreakpointObserver) {
    this.getState = this.store.select(selectReservationState);
    breakpointObserver.observe([
      Breakpoints.XSmall,
      Breakpoints.Small
    ]).subscribe(result => {
      if (result.matches) {
        this.small = true;
        this.direction = 'bottom';
        this.tooltipPosition = 'left';
      }
    });
    this.language = this.translate.currentLang;
    this.price = new Price();

    this.store.select(selectAuthState).subscribe((state: any) => {
      const user: IUserAll = state.user;
      this.professionalId = user.authorities.some(u => u.authority === Role.professional) ? user.id : undefined;
      this.customerId = user.authorities.some(u => u.authority === Role.customer) ? user.id : undefined;
    });
  }

  get customerName(): string {
    return this.reservation ? getFullUserName(this.reservation.customer) : '';
  }

  get professionalName(): string {
    return this.reservation ? getUserName(this.reservation.room.professional) : '';
  }

  get currencySymbol(): string {
    return this.reservation ? currencySymbol(this.reservation.room.currency) : '';
  }

  get roomName(): string {
    return this.reservation ? roomName(this.reservation.room) : '';
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
    return ReservationIconName[snakeToCamel(name) as ReservationIconKey];
  }

  onChangeState(id: any): void {
    if (['send', 'book', 'more', 'change'].indexOf(id.toString()) >= 0 && this.reservation) {
      this.machine.transition(snakeToCamel(this.reservation.state), id);
      return;
    }
    const title = this.translate.instant('RESERVATION.CHANGE_STATE.TITLE');
    const action = this.translate.instant(`RESERVATION.CHANGE_STATE.ACTION.${String(id).toUpperCase()}`);
    const content = this.translate.instant('RESERVATION.CHANGE_STATE.CONTENT', {action});
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

  getDateTime(date: Date): string {
    return reservationDateTime(date, this.language);
  }

  private createAction(tooltip: string, icon: string, id: string, color?: string): MatFabMenu {
    return {tooltip, tooltipPosition: this.tooltipPosition, icon, id, color} as MatFabMenu;
  }

  private subscribe(): void {
    this.subscription = this.getState.subscribe(state => {
      this.isLoading = state.isLoading;
      this.payments = state.payments;
      this.paymentPaid = state.payments?.filter((p: IPayment) => p.status === 'approved');
      if (state.selected) {
        this.duration = reservationDuration(state.selected);
        this.start = newDate(state.selected.start);
        this.end = createNewDate(this.start, this.start.getHours() + this.duration.hour,
          this.start.getMinutes() + this.duration.minute);
        this.state = ReservationIconName[snakeToCamel(state.selected.state) as ReservationIconKey];
        this.reservation = state.selected;
        if (this.professionalId && this.professionalId === this.reservation?.room.professional.id) {
          this.professionalMachine(this);
          this.changeState = this.machine.next(snakeToCamel(this.reservation.state));
        } else if (this.customerId && this.customerId === this.reservation?.customer.id) {
          this.customerMachine(this);
          this.changeState = this.machine.next(snakeToCamel(this.reservation.state));
          if (this.reservation.state === States.completed) {
            this.showFireworks = true;
            setTimeout(() => {
              this.showFireworks = false;
            }, 5000);
          }
        }
        if (this.reservation && this.reservation.product) {
          this.price = getPrice(this.reservation);
        }
      }
      this.history = state.history;
      this.dataSource = new MatTableDataSource(state.history);
      this.dataSource.paginator = this.paginator;
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
      new fromActionsReservation.ReservationFind({id})
    );
    this.store.dispatch(
      new fromActionsReservation.ReservationFindPayments(id)
    );
    this.store.dispatch(
      new fromActionsReservation.ReservationFindHistory({id})
    );
  }

  private professionalMachine(self: this): any {
    if (!self.reservation) {
      return;
    }
    const reservation: IReservationAll = self.reservation;
    const reservationId = reservation.id;
    const roomId = reservation.room.id;
    const customerId = reservation.customer.id;
    const initialState = reservation.state;
    const store = self.store;
    const translate = self.translate;

    const approve = this.createAction(translate.instant('RESERVATION.ACTION.APPROVE'),
      ReservationIconName.approved, 'approve', 'primary');
    const start = this.createAction(translate.instant('RESERVATION.ACTION.START'),
      ReservationIconName.started, 'start', 'primary');
    const complete = this.createAction(translate.instant('RESERVATION.ACTION.COMPLETE'),
      ReservationIconName.completed, 'complete', 'primary');
    const edit = this.createAction(translate.instant('RESERVATION.ACTION.EDIT'),
      ReservationIconName.edit, 'edit', 'accent');
    const cancel = this.createAction(translate.instant('RESERVATION.ACTION.CANCEL'),
      ReservationIconName.cancelled, 'cancel', 'warn');
    const book = this.createAction(translate.instant('RESERVATION.ACTION.BOOK'),
      ReservationIconName.book, 'book', 'primary');
    const sendMessage = this.createAction(translate.instant('RESERVATION.ACTION.SEND'),
      ReservationIconName.send, 'send', 'green');
    const change = this.createAction(translate.instant('RESERVATION.ACTION.CHANGE'),
      ReservationIconName.change, 'change', 'accent');

    const more = this.createAction(translate.instant('RESERVATION.ACTION.MORE'),
      ReservationIconName.more, 'more');

    let approveActions: MatFabMenu[] = [];
    if (isToday(newDate(reservation.start))) {
      approveActions = [start];
    }
    approveActions = [...approveActions, edit];
    if (reservation.customer.phone && greaterOrEqualsThanToday(newDate(reservation.start))) {
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
      if (reservation.start) {
        const startDate = newDate(reservation.start);
        let key;
        let date = getTime(startDate, this.language);
        switch (true) {
          case isToday(startDate):
            key = 'TODAY';
            break;
          case isTomorrow(startDate):
            key = 'TOMORROW';
            break;
          default:
            date = formatDateTime(startDate, self.language);
            key = 'APPROVE';
            break;
        }
        const message = translate.instant(`WHATSAPP.SEND.${key}`, {date});
        window.open(`https://api.whatsapp.com/send?phone=+${reservation.customer?.phone}&text=${message}`, '_blank');
      }
    });

    const startTransaction = ReservationDetailComponent.createTransaction('started', (): void => {
      self.reservation = undefined;
      store.dispatch(
        new fromActionsReservation.Start(reservationId)
      );
    });

    const editTransaction = ReservationDetailComponent.createTransaction('edited', (): void => {
      self.router.navigate(['reservation', reservationId, 'edit'], {state: {roomId}});
    });

    const completeTransaction = ReservationDetailComponent.createTransaction('completed', (): void => {
      self.router.navigate(['reservation', reservationId, 'rooms', roomId, 'customer', customerId, 'complete']);
    });

    const moreTransaction = ReservationDetailComponent.createTransaction('more', (): void => {
      self.router.navigate(['reservation', reservationId, 'more-info']);
    });

    const changeCustomerTransaction = ReservationDetailComponent
      .createTransaction('change', (): void => self.changeUser(reservation));

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
      const customer = reservation.customer;
      const room = reservation.room;
      const product = reservation.product;
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

    let completeActions: MatFabMenu[] = [book];
    if (reservation.configuration?.canCustomerChange) {
      completeActions = [...completeActions, change];
    }
    completeActions = [...completeActions, more];

    const completed = {
      transitions: {
        book: bookTransaction,
        more: moreTransaction,
        change: changeCustomerTransaction
      },
      next: completeActions
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
      completed,
      cancelled: {
        next: []
      }
    }, initialState);
  }

  private customerMachine(self: this): any {
    if (!self.reservation) {
      return;
    }
    const reservation: IReservationAll = self.reservation;
    const reservationId = reservation.id;
    const initialState = reservation.state;
    const translate = self.translate;

    const edit = this.createAction(translate.instant('RESERVATION.ACTION.EDIT'),
      ReservationIconName.edit, 'edit', 'accent');
    const cancel = this.createAction(translate.instant('RESERVATION.ACTION.CANCEL'),
      ReservationIconName.cancelled, 'cancel', 'warn');
    const book = this.createAction(translate.instant('RESERVATION.ACTION.BOOK'),
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
      const room = reservation.room;
      const product = reservation.product;
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

    if (self.payments) {
      const price = getPrice(reservation);
      if (price.total > price.totalPaid) {
        const next = this.createAction(translate.instant('RESERVATION.ACTION.PAY'),
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

  private changeUser(reservation: IReservationAll): void {
    const dialogRef = this.dialog.open(ChangeCustomerDialogComponent, {
      width: '70vw',
      disableClose: true,
      data: {
        customerId: reservation.customer.id,
        small: this.small
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.reservation = undefined;
        this.store.dispatch(
          new fromActionsReservation.ChangeCustomer({customerId: result.customerId, reservationId: reservation.id})
        );
      }
    });
  }
}

@Component({
  selector: 'app-change-customer-dialog-component',
  templateUrl: './change-customer-dialog.component.html'
})
export class ChangeCustomerDialogComponent implements OnInit, OnDestroy {
  customerForm!: FormGroup;
  customers?: IUserAll[];
  filteredCustomer?: Observable<IUser[] | undefined>;
  customer: FormControl = new FormControl('', [
    Validators.required, requireMatch
  ]);

  private getState: Observable<any>;
  private subscription?: Subscription;

  constructor(public dialogRef: MatDialogRef<DiscountDialogComponent>, @Inject(MAT_DIALOG_DATA) public data: any,
              private store: Store<AppState>, private formBuilder: FormBuilder) {
    this.getState = this.store.select(selectUserState);
  }

  ngOnInit(): void {
    this.clean();
    this.createForm();
    this.createFilters();
    this.subscribe();
    this.getCustomers();
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  doAction(): void {
    this.dialogRef.close({customerId: this.customer.value.id});
  }

  displayFnUser(user: IUser): string {
    return user ? getUserName(user) : '';
  }

  keyDownHandler(event: any): void {
    if (event.code === 'Backspace') {
      this.customer.setValue('');
    }
  }

  getUsername(user: any): string {
    return getFullUserName(user);
  }

  private createForm(): void {
    this.customerForm = this.formBuilder.group({
      customer: this.customer
    });
  }

  private createFilters(): void {
    this.filteredCustomer = this.customer.valueChanges.pipe(
      startWith(''),
      map(value => typeof value === 'string' ? value : value.name),
      map(name => name ? this.filterCustomer(name) : this.customers ? this.customers.slice() : this.customers)
    );
  }

  private filterCustomer(name: string): IUser[] | undefined {
    const filterValue = name.toLowerCase();

    return this.customers?.filter(option => getFullUserName(option)?.toLowerCase().indexOf(filterValue) === 0);
  }

  private getCustomers(): void {
    this.store.dispatch(
      new fromActionsUser.GetAllCustomers()
    );
  }

  private subscribe(): void {
    this.subscription = this.getState.subscribe(state => {
      this.customers = state.data;
      this.customer.setValue(this.customers?.find(customer => customer.id === this.data.customerId));
    });
  }

  private clean(): void {
    this.store.dispatch(
      new fromActionsUser.Clean()
    );
  }
}
