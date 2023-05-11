import { ChangeDetectorRef, Component, Inject, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Store } from '@ngrx/store';
import { AppState, selectAuthState, selectReservationState, selectUserState } from '../../store/app.states';
import { Observable, Subscription } from 'rxjs';
import * as fromActionsReservation from '../../store/reservation.actions';
import { CancelOption, IReservationAll, States } from '../../interfaces/reservation';
import { ActivatedRoute, Router } from '@angular/router';
import {
  createNewDate,
  Duration,
  formatDateTime,
  getNow,
  getReservationGMT,
  getTime,
  greaterOrEqualsThanToday,
  IDuration,
  isSameTimeZone,
  newDate,
  newDateTimestamp,
  reservationDuration
} from '../../util/dates';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { IUser, IUserAll } from '../../interfaces/user';
import { DialogComponent } from '../../shared/dialog/generic/dialog.component';
import { TranslateService } from '@ngx-translate/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Role } from '../../interfaces/token';
import {
  customerEditDialog,
  executeDialog,
  getFullUserName,
  getPrice,
  getUserName,
  isProfessional,
  openCancel,
  openDialog,
  snakeToCamel,
  totalPaid
} from '../../util/helper';
import { IPrice, PENALTY, Price } from '../../interfaces/treatment';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { MatFabMenu, MatFabMenuDirection } from '@angular-material-extensions/fab-menu/lib/mat-fab-menu.component';
import { IPayment, IPaymentAll } from '../../interfaces/payment';
import { detailExpandAnimation, transitionAnimation } from '../../util/animation';
import { isToday, isTomorrow } from 'date-fns';
import { ReservationIconName } from '../../util/icon';
import { DiscountDialogComponent } from '../../discount/list/discounts.component';
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { map, startWith } from 'rxjs/operators';
import * as fromActionsUser from '../../store/user.actions';
import { requireMatch } from '../../util/validators';
import * as fromActionsPayment from '../../store/payment.actions';

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
  dateFormat: string;
  changeState: MatFabMenu[] = [];

  displayedColumns: string[] = ['position', 'professional', 'start', 'treatment', 'state'];
  dataSource: any;
  expanded?: IReservationAll;
  pageSize = 5;

  price: IPrice;

  direction: MatFabMenuDirection = 'left';
  showFireworks = false;

  paymentPaid: any;
  paymentDisplayedColumns: string[] = ['position', 'description', 'status', 'type', 'amount'];
  paymentExpanded?: IPayment;

  private tooltipPosition = 'below';
  private machine: any;
  private customerId?: string;
  private professionalId?: string;
  private isLoading = false;
  private getState: Observable<any>;
  private subscription?: Subscription;
  private small = false;
  private reservationId?: string;

  private readonly language: string;

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
    this.dateFormat = this.translate.currentLang;
    this.price = new Price();

    this.store.select(selectAuthState).subscribe((state: any) => {
      const user: IUserAll = state.user;
      this.professionalId = user.authorities.some(u => u.authority === Role.professional) ? user.id : undefined;
      this.customerId = user.authorities.some(u => u.authority === Role.customer) ? user.id : undefined;
    });
  }

  get gmt(): string {
    return getReservationGMT(this.reservation);
  }

  get total(): number {
    return totalPaid(this.paymentPaid);
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
    return { target, action };
  }

  private static getDateTimeDetail(reservation: IReservationAll): Date {
    return newDateTimestamp(reservation.timestamp);
  }

  openHistoryDialog(history: IReservationAll): void {
    this.openDialog(ReservationDetailComponent.getDateTimeDetail(history));
  }

  openDialog(reservationDate: Date): void {
    if (this.reservation) {
      openDialog(this.reservation.room, this.language, this.translate, this.dialog, reservationDate);
    }
  }

  showTimeZone(reservation: IReservationAll | undefined = this.reservation): boolean {
    return !isSameTimeZone(reservation?.room.timeZone);
  }

  ngOnInit(): void {
    this.subscribe();
    this.route.params.subscribe(routeParams => {
      this.reservationId = routeParams.id;
      this.getReservation(this.reservationId);
    });
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }

  onChangeState(id: any): void {
    if (['send', 'book', 'more', 'change', 'cancel', 'cancel_edit'].indexOf(id.toString()) >= 0 && this.reservation) {
      this.machine.transition(snakeToCamel(this.reservation.state), snakeToCamel(id));
      return;
    }
    const title = this.translate.instant('RESERVATION.CHANGE_STATE.TITLE');
    const action = this.translate.instant(`RESERVATION.CHANGE_STATE.ACTION.${ String(id).toUpperCase() }`);
    const content = this.translate.instant('RESERVATION.CHANGE_STATE.CONTENT', { action });
    const dialogRef = this.dialog.open(DialogComponent, {
      data: { title, content, value: id }
    });

    dialogRef.afterClosed().subscribe(event => {
      if (event && this.reservation) {
        this.machine.transition(snakeToCamel(this.reservation.state), event);
      }
    });
  }

  notify(payment: IPaymentAll): void {
    this.store.dispatch(
      new fromActionsPayment.PaymentNotify({
        id: payment.id, reservationId: payment?.reservation?.id,
        preferenceId: payment.preferenceId,
        type: payment.type
      })
    );
  }

  private createAction(tooltip: string, icon: string, id: string, color?: string): MatFabMenu {
    return { tooltip, tooltipPosition: this.tooltipPosition, icon, id, color } as MatFabMenu;
  }

  private subscribe(): void {
    this.subscription = this.getState.subscribe(state => {
      this.isLoading = state.isLoading;
      const isCustomer = this.customerId && this.customerId === state.selected?.customer?.id;
      if (state.payments && state.payments[0].id) {
        this.paymentPaid = isCustomer ? state.payments?.map((p: IPayment) => {
          if (p.status && !['APPROVED', 'APPROVED_REFUND', 'REFUND_PENDING', 'REFUND'].includes(p.status)) {
            this.addActions();
          }
          return p;
        }).sort((a?: IPaymentAll, b?: IPaymentAll) => b?.status && a?.status?.localeCompare(b?.status)) : state.payments;
      } else {
        this.paymentPaid = [];
      }
      if (state.selected) {
        this.duration = reservationDuration(state.selected);
        this.start = newDateTimestamp(state.selected.timestamp);
        this.end = createNewDate(this.start, this.start.getHours() + this.duration.hour,
          this.start.getMinutes() + this.duration.minute);
        this.state = state.selected.state;
        this.reservation = state.selected;
        if (this.professionalId && isProfessional(this.professionalId, this.reservation?.room?.professionals)) {
          this.professionalMachine(this);
          this.changeState = this.machine.next(snakeToCamel(this.reservation?.state));
        } else if (isCustomer) {
          this.customerMachine(this);
          this.changeState = this.machine.next(snakeToCamel(state.selected.state));
          if (state.selected.state === States.completed) {
            this.showFireworks = true;
            setTimeout(() => {
              this.showFireworks = false;
            }, 5000);
          }
        }
        if (this.reservation && this.reservation.treatment) {
          this.price = getPrice(this.reservation, this.paymentPaid);
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

  private getReservation(id?: string | null): void {
    this.reservation = undefined;
    this.store.dispatch(
      new fromActionsReservation.ReservationFind({ id })
    );
    this.store.dispatch(
      new fromActionsReservation.ReservationFindPayments(id)
    );
    this.store.dispatch(
      new fromActionsReservation.ReservationFindHistory({ id })
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
    if (isToday(newDate(self.start))) {
      approveActions = [start];
    }
    approveActions = [...approveActions, edit];
    if (reservation.customer.phone && greaterOrEqualsThanToday(newDate(self.start))) {
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
      if (self.start) {
        const startDate = newDate(self.start);
        let key;
        let date = getTime(startDate, self.language);
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
        const message = translate.instant(`WHATSAPP.SEND.${ key }`, { date });
        window.open(`https://api.whatsapp.com/send?phone=+${ reservation.customer?.phone }&text=${ message }`, '_blank');
      }
    });

    const startTransaction = ReservationDetailComponent.createTransaction('started', (): void => {
      self.reservation = undefined;
      store.dispatch(
        new fromActionsReservation.Start(reservationId)
      );
    });

    const editTransaction = ReservationDetailComponent.createTransaction('edited', (): void => {
      self.router.navigate(['reservation', reservationId, 'edit'], { state: { roomId } });
    });

    const completeTransaction = ReservationDetailComponent.createTransaction('completed', (): void => {
      self.router.navigate(['reservation', reservationId, 'rooms', roomId, 'customer', customerId, 'complete']);
    });

    const moreTransaction = ReservationDetailComponent.createTransaction('more', (): void => {
      self.router.navigate(['reservation', reservationId, 'more-info']);
    });

    const changeCustomerTransaction = ReservationDetailComponent.createTransaction('change',
      (): void => self.changeUser(reservation));

    const options = Object.values(CancelOption).filter(co => co !== CancelOption.charge);
    const cancelTransaction = ReservationDetailComponent.createTransaction('cancelled', (): void =>
      self.cancel(reservation, options, self.price, result => {
        if (result) {
          this.reservation = undefined;
          this.store.dispatch(
            new fromActionsReservation.Cancel({ id: reservation.id, paymentCancellation: result })
          );
        }
      }));

    const finishTransaction = ReservationDetailComponent.createTransaction('completed', (): void => {
      self.reservation = undefined;
      self.store.dispatch(
        new fromActionsReservation.PaymentComplete(reservationId)
      );
    });

    const bookTransaction = ReservationDetailComponent.createTransaction('booked', (): void => {
      const customer = reservation.customer;
      const room = reservation.room;
      const treatment = reservation.treatment;
      const professional = reservation.professional;
      const data = { customer, room, treatment, professional };
      this.router.navigate(['reservation'], { state: data });
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
      },
      cancelledPaymentRequired: {
        next: []
      },
      editCancelled: {
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

    const book = this.createAction(translate.instant('RESERVATION.ACTION.BOOK'),
      ReservationIconName.book, 'book', 'primary');

    let cancelIcon = ReservationIconName.cancelled;
    let cancelOptions: string[] = [];
    const price = self.price;
    let showPenalty = false;
    /* CANCEL */
    if (reservation.canEdit) {
      if (price.totalPaid) {
        cancelOptions = [CancelOption.discount, CancelOption.refund];
      } else {
        cancelOptions = [CancelOption.none];
      }
      cancelIcon = ReservationIconName.freeCancellation;
    } else {
      const penaltyToPay = (price.total * PENALTY / 100);
      price.setPenalty(penaltyToPay);
      if (price.totalPaid < penaltyToPay) {
        cancelOptions = [CancelOption.charge];
        showPenalty = true;
      } else if (price.totalPaid === penaltyToPay) {
        cancelOptions = [CancelOption.none];
        cancelIcon = ReservationIconName.freeCancellation;
      } else {
        cancelOptions = [CancelOption.chargeWithDiscount, CancelOption.chargeWithRefund];
        showPenalty = true;
        cancelIcon = ReservationIconName.freeCancellation;
      }
    }

    const cancel = this.createAction(translate.instant('RESERVATION.ACTION.CANCEL'), cancelIcon, 'cancel', 'warn');

    const cancelTransaction = ReservationDetailComponent.createTransaction('cancelled', (): void =>
      self.cancel(reservation, cancelOptions, price, result => {
        if (result) {
          this.reservation = undefined;
          this.store.dispatch(
            new fromActionsReservation.CustomerCancel({ id: reservation.id, paymentCancellation: result })
          );
        }
      }, showPenalty));

    const bookTransaction = ReservationDetailComponent.createTransaction('booked', (): void => {
      const room = reservation.room;
      const treatment = reservation.treatment;
      const professional = reservation.professional;
      const data = { room, treatment, professional };
      this.router.navigate(['me', 'reservation'], { state: data });
    });

    const created = {
      transitions: {
        edit: null,
        cancelEdit: null,
        cancel: cancelTransaction
      },
      next: [cancel]
    };

    const approved = {
      transitions: {
        edit: null,
        cancelEdit: null,
        cancel: cancelTransaction,
        pay: null
      },
      next: [cancel]
    };

    const paid = {
      transitions: {
        edit: null,
        cancelEdit: null,
        cancel: cancelTransaction
      },
      next: [cancel]
    };

    const partiallyCompleted = {
      transitions: {
        pay: null
      },
      next: [] as any[]
    };

    const cancelledPaymentRequired = {
      transitions: {
        pay: null
      },
      next: [] as any[]
    };

    /* EDIT */
    if (reservation.canEdit || price.totalPaid >= price.penalty) {
      const edit = this.createAction(translate.instant('RESERVATION.ACTION.EDIT'),
        ReservationIconName.edit, 'edit', 'accent');

      const editTransaction = ReservationDetailComponent.createTransaction('edited', (): void => {
        self.router.navigate(['me', 'reservation', reservationId]);
      });

      created.transitions.edit = editTransaction;
      created.next.unshift(edit);

      approved.transitions.edit = editTransaction;
      approved.next.unshift(edit);

      paid.transitions.edit = editTransaction;
      paid.next.unshift(edit);
    } else {
      const edit = this.createAction(translate.instant('RESERVATION.ACTION.EDIT'),
        ReservationIconName.edit, 'cancel_edit', 'accent');

      const editTransaction = ReservationDetailComponent.createTransaction('edited', (): void =>
        customerEditDialog(self.dialog, self.router, reservationId, reservation.room.currency, self.small, price));

      created.transitions.cancelEdit = editTransaction;
      created.next.unshift(edit);

      approved.transitions.cancelEdit = editTransaction;
      approved.next.unshift(edit);

      paid.transitions.cancelEdit = editTransaction;
      paid.next.unshift(edit);
    }

    if (reservation.paymentRequired) {
      const pay = this.createAction(translate.instant('RESERVATION.ACTION.PAY'),
        ReservationIconName.payment, 'pay', 'blue');
      cancelledPaymentRequired.next = [pay];

      cancelledPaymentRequired.transitions.pay = ReservationDetailComponent.createTransaction('cancelledPaymentRequired', (): void => {
        self.router.navigate(['me', 'reservation']);
      });
      self.addActions();
    }

    if (self.price.total > self.price.totalPaid) {
      const next = this.createAction(translate.instant('RESERVATION.ACTION.PAY'),
        ReservationIconName.payment, 'pay', 'blue');
      approved.next = [...approved.next, next];
      partiallyCompleted.next = [...partiallyCompleted.next, next];

      const transaction = ReservationDetailComponent.createTransaction('paid',
        (): void => {
          this.router.navigate(['/me', 'reservation', reservation.id, 'payment', 'option']);
        });
      approved.transitions.pay = transaction;
      partiallyCompleted.transitions.pay = transaction;
    }

    this.machine = ReservationDetailComponent.createMachine({
      initialState: ReservationIconName.created,
      created,
      approved,
      paid,
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
      },
      editCancelled: {
        next: []
      },
      cancelledPaymentRequired
    }, initialState);
  }

  private addActions(): void {
    if (!this.paymentDisplayedColumns.includes('actions')) {
      this.paymentDisplayedColumns.splice(this.paymentDisplayedColumns.length - 1, 0, 'actions');
    }
  }

  private changeUser(reservation: IReservationAll): void {
    const data = {
      customerId: reservation.customer.id,
      small: this.small
    };
    executeDialog(this.dialog, ChangeCustomerDialogComponent, data, result => {
      if (result) {
        this.reservation = undefined;
        this.store.dispatch(
          new fromActionsReservation.ChangeCustomer({ customerId: result.customerId, reservationId: reservation.id })
        );
      }
    }, true);
  }

  private cancel(reservation: IReservationAll, options: string[], price: IPrice, afterClose: (result: any) => void,
                 showPenalty?: boolean): void {
    openCancel(this.dialog, reservation.room, this.small, options, afterClose, showPenalty, price);
  }
}

@Component({
  selector: 'app-change-customer-dialog-component',
  templateUrl: './change-customer-dialog.component.html'
})
export class ChangeCustomerDialogComponent implements OnInit, OnDestroy {
  customerForm!: UntypedFormGroup;
  customers?: IUserAll[];
  filteredCustomer?: Observable<IUser[] | undefined>;
  customer: UntypedFormControl = new UntypedFormControl('', [
    Validators.required, requireMatch
  ]);

  private getState: Observable<any>;
  private subscription?: Subscription;

  constructor(public dialogRef: MatDialogRef<DiscountDialogComponent>, @Inject(MAT_DIALOG_DATA) public data: any,
              private store: Store<AppState>, private formBuilder: UntypedFormBuilder) {
    this.getState = this.store.select(selectUserState);
  }

  get onNoClick(): void {
    return this.dialogRef.close();
  }

  get doAction(): void {
    return this.dialogRef.close({ customerId: this.customer.value.id });
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

  displayFnUser(user: IUser): string {
    return user ? getUserName(user) : '';
  }

  keyDownHandler(event: any): void {
    if (event.code === 'Backspace') {
      this.customer.setValue('');
    }
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
