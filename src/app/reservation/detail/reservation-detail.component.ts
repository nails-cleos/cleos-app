import { ChangeDetectionStrategy, Component, computed, effect, inject, signal, viewChild } from '@angular/core';
import { Store } from '@ngrx/store';
import {
  approveReservation,
  cancelReservation,
  customerCancelReservation,
  getReservation,
  getReservationHistory,
  paymentCompleteReservation,
  paymentOptions,
  reservationFindPayments,
  startReservation,
  updateReservationColor,
  updateReservationCustomer,
  updateReservationDiscount,
  updateReservationNote,
} from '../../store/reservation.actions';
import { CancelOption, IFabMenu, IReservationAll, IUpcomingAll, States } from '../../interfaces/reservation';
import { Router } from '@angular/router';
import {
  createNewDate,
  Duration,
  formatDateTime,
  getNowTimeZone,
  getReservationGMT,
  getTime,
  getTimeNumber,
  greaterOrEqualsThanToday,
  IDuration,
  isSameTimeZone,
  lessOrEqualsThanToday,
  newDate,
  newDateTimestamp,
  reservationDuration,
} from '../../util/dates';
import { MatPaginator } from '@angular/material/paginator';
import { DialogComponent } from '../../shared/dialog/generic/dialog.component';
import { TranslateService } from '@ngx-translate/core';
import { MatDialog } from '@angular/material/dialog';
import {
  areEquals,
  customerEditDialog,
  executeDialog,
  getPrice,
  isProfessional,
  openCancel,
  openDialog,
  snakeToCamel,
  totalPaid,
} from '../../util/helper';
import { IPrice, Price } from '../../interfaces/treatment';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import {
  getPaymentOptions,
  getPayNlOptions,
  IPayment,
  IPaymentAll,
  IPaymentOption,
  IPaymentRequest,
  PaymentType,
  PENALTY,
} from '../../interfaces/payment';
import { isToday, isTomorrow } from 'date-fns';
import { ReservationIconName } from '../../util/icon';
import { FormArray, FormControl, FormGroup, NonNullableFormBuilder } from '@angular/forms';
import { startWith } from 'rxjs/operators';
import { adjustPayments, notifyPayment, paymentSend } from '../../store/payment.actions';
import { ChangeCustomerDialogComponent } from './change-customer-dialog.component';
import { ChangeColorDialogComponent } from './change-color-dialog.component';
import { AddNoteDialogComponent } from './add-note-dialog.component';
import { AddDiscountDialogComponent } from './add-discount-dialog.component';
import { AuthUserService } from '../../services/auth-user.service';
import { Role } from '../../interfaces/token';
import { ReservationCloneDialogComponent } from './reservation-clone-dialog.component';
import { SharedModule } from '../../shared/shared.module';
import { RoomNamePipe } from '../../pipes/room-name.pipe';
import { ReservationIconPipe } from '../../pipes/reservation-icon.pipe';
import { PriceExtrasComponent } from '../../shared/price-extras/price-extras.component';
import { PricePreviewComponent } from '../../shared/price-preview/price-preview.component';
import { TwoDigitsDirective } from '../../directives/two-digits.directive';
import { TimeDetailPipe } from '../../pipes/time-detail.pipe';
import { BackButtonDirective } from '../../directives/back-button.directive';
import { FabMenuComponent } from './fab-menu/fab-menu.component';
import { ReservationState } from '../../store/reducers/reservation.reducers';
import { PaymentState } from '../../store/reducers/payment.reducers';
import { toSignal } from '@angular/core/rxjs-interop';
import {
  getCurrentReservationIdPipe,
  getDetailNavigationParamsPipe,
  getHistoriesPipe,
  getPaymentOptionsPipe,
  getPaymentsPipe,
  getSelectedReservationPipe,
} from '../../store/selectors/reservation.selectors';
import { MatTableDataSource } from '@angular/material/table';

type PaymentForm = {
  amount: FormControl<string>;
  type: FormControl<PaymentType>;
}

type DetailForm = {
  payments: FormArray<FormGroup<PaymentForm>>;
}

@Component({
  selector: 'app-reservation-detail',
  templateUrl: './reservation-detail.component.html',
  styleUrls: ['./reservation-detail.component.scss'],
  imports: [SharedModule, RoomNamePipe, ReservationIconPipe, PriceExtrasComponent, PricePreviewComponent,
    TwoDigitsDirective, TimeDetailPipe, BackButtonDirective, FabMenuComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReservationDetailComponent {
  private readonly translate: TranslateService = inject(TranslateService);
  private readonly dialog: MatDialog = inject(MatDialog);
  private readonly store: Store<ReservationState | PaymentState> = inject(Store<ReservationState | PaymentState>);
  private readonly router: Router = inject(Router);
  private readonly breakpointObserver: BreakpointObserver = inject(BreakpointObserver);
  private readonly formBuilder: NonNullableFormBuilder = inject(NonNullableFormBuilder);
  private readonly authUserService: AuthUserService = inject(AuthUserService);

  private paginator = viewChild(MatPaginator);

  private breakpointObserver$ = this.breakpointObserver.observe([Breakpoints.XSmall, Breakpoints.Small]);
  private reservationId$ = this.store.pipe(getCurrentReservationIdPipe);
  private navigationParams$ = this.store.pipe(getDetailNavigationParamsPipe);
  private reservationSelected$ = this.store.pipe(getSelectedReservationPipe);
  private payments$ = this.store.pipe(getPaymentsPipe);
  private histories$ = this.store.pipe(getHistoriesPipe);
  private paymentOptions$ = this.store.pipe(getPaymentOptionsPipe);

  private authUserSignal = this.authUserService.authUser;
  private reservationIdSignal = toSignal(this.reservationId$);
  private navigationParams = toSignal(this.navigationParams$);
  private paymentOptionsSignal = toSignal(this.paymentOptions$);
  private breakpointsSignal = toSignal(
    this.breakpointObserver$, {
      initialValue: {
        matches: false,
        breakpoints: {
          [Breakpoints.XSmall]: false,
          [Breakpoints.Small]: false,
        },
      },
    },
  );

  historiesSignal = toSignal(this.histories$);
  paymentsSignal = toSignal(this.payments$);

  paginatorPageIndex = signal(0);

  reservation = toSignal(this.reservationSelected$);
  duration: IDuration = new Duration();
  start: Date = getNowTimeZone();
  end: Date = getNowTimeZone();
  state = signal<string | undefined>(undefined);
  dateFormat: string = this.translate.getCurrentLang();
  changeState: IFabMenu[] = [];

  displayedColumns: string[] = ['position', 'professional', 'start', 'treatment', 'state'];
  dataSource = computed(() => new MatTableDataSource(this.historiesSignal()));

  expanded?: IReservationAll;
  pageSize = 5;

  price: IPrice = new Price();
  options = signal<IPaymentOption[] | undefined>(undefined);

  showFireworks = false;

  paymentPaid = signal<IPaymentAll[]>([]);
  paymentDisplayedColumns: string[] = ['position', 'description', 'status', 'type', 'amount'];
  paymentExpanded?: IPayment;

  allPaymentTypes: string[] = [PaymentType.cash, PaymentType.transfer];

  professionalId = computed(() => this.authUserSignal()?.professionalId);

  form: FormGroup<DetailForm> = this.formBuilder.group<DetailForm>({
    payments: this.formBuilder.array<FormGroup<PaymentForm>>([]),
  });

  readonly paymentsValue = toSignal(this.payments.valueChanges.pipe(startWith(this.payments.getRawValue())));
  readonly disableUpdateButton = computed(() => {
    const paymentsValue = this.paymentsValue();
    if (paymentsValue?.length) {
      return areEquals(paymentsValue, this.paymentPaid().map(p => ({
        amount: (p.transactionAmount || 0).toFixed(2),
        type: p.type,
      })));
    }
    return true;
  });

  customerId = computed(() => this.authUserSignal()?.customerId);
  isReservationAdmin?: boolean;
  isCustomer = signal(false);
  step = computed(() => this.navigationParams()?.step);
  language: string = this.translate.getCurrentLang();

  private static stateMachineDefinition: any;
  private machine: any;
  small = computed(() => this.breakpointsSignal()?.matches);
  private hasRoomAdmin = computed(() => {
    const auth = this.authUserSignal();
    return (auth?.isAdmin || auth?.isManager || auth?.isRoomAdmin) ?? false;
  });

  constructor() {
    this.payments.clear();
    effect((onCleanup) => {
      const paginator = this.paginator();
      if (paginator) {
        const sub = paginator.page.subscribe((pageEvent) => {
          this.paginatorPageIndex.set(pageEvent.pageIndex);
        });
        onCleanup(() => sub.unsubscribe());
      }
    });

    effect(() => {
      const dataSource = this.dataSource();
      const paginator = this.paginator();
      if (dataSource && paginator) {
        dataSource.paginator = paginator;
      }
    });

    effect(() => {
      const id = this.reservationIdSignal();
      if (id) {
        this.store.dispatch(getReservation({ id }));
        this.store.dispatch(reservationFindPayments({ id }));
        this.store.dispatch(getReservationHistory({ id }));
      }
    });

    effect(() => {
      const reservation = this.reservation();
      if (reservation) {
        const isCustomer = this.customerId() === reservation.customer.id;
        this.duration = reservationDuration(reservation);
        this.start = newDateTimestamp(reservation.timestamp);
        this.end = createNewDate(this.start, this.start.getHours() + this.duration.hour,
          this.start.getMinutes() + this.duration.minute);
        this.state.set(reservation.state);
        const professionalId = this.professionalId();
        const isProfessionalAdmin = professionalId &&
          isProfessional(professionalId, reservation?.room?.professionals);
        this.isReservationAdmin = isProfessionalAdmin || this.hasRoomAdmin();
        this.price = getPrice(reservation, this.paymentPaid());
        if (isProfessionalAdmin) {
          this.professionalMachine(this);
          this.changeState = this.machine.next(snakeToCamel(reservation.state));
        } else if (isCustomer) {
          const types = reservation.room.paymentTypes.filter(
            (p: PaymentType) => ![PaymentType.cash, PaymentType.transfer]
              .includes(p));
          if (types?.includes(PaymentType.paynl)) {
            this.getOptions();
          } else {
            this.options.set(getPaymentOptions(this.translate, types));
          }
          this.customerMachine(this);
          this.changeState = this.machine.next(snakeToCamel(reservation.state));
          if (reservation.state === States.completed) {
            this.showFireworks = true;
            setTimeout(() => {
              this.showFireworks = false;
            }, 5000);
          }
        }
        this.isCustomer.set(isCustomer);
      }
    });

    effect(() => {
      const payments = this.paymentsSignal();
      if (payments && payments[0].id) {
        if (this.isCustomer()) {
          this.paymentPaid.set(payments.map((p) => {
            if (p.status &&
              !['APPROVED', 'APPROVED_REFUND', 'REFUND_FAILURE', 'REFUND_PENDING', 'REFUND'].includes(p.status)) {
              this.addActions();
            }
            return p;
          }).sort((a, b) => a.status.localeCompare(b.status)));
        } else {
          if (!this.payments.length) {
            let arr: any[] = [];
            this.paymentPaid.set(payments.map((p: IPaymentAll) => {
              if (p.id) {
                const amount = (p.transactionAmount || 0).toFixed(2);
                const paymentForm = this.formBuilder.group({
                  amount: [amount],
                  type: [p.type],
                });
                arr = [...arr, { amount: amount, type: p.type }];
                this.payments.push(paymentForm);
              }
              return p;
            }));
          } else {
            this.paymentPaid.set(payments);
          }
        }
      } else {
        this.paymentPaid.set([]);
      }
    });
    effect(() => {
      const history = this.historiesSignal();
      const reservation = this.reservation();

      if (!history?.length || !history[0]?.id || !reservation) {
        return;
      }

      const allReservations = [...history, reservation]
        .sort((a, b) => a.timestamp - b.timestamp)
        .map(r => r.id);

      const currentIndex = allReservations.indexOf(reservation.id);

      if (currentIndex > 0) {
        const previous = 'previous';

        const previousAction = this.createAction(
          this.translate.instant('RESERVATION.ACTION.PREVIOUS'),
          ReservationIconName.previous,
          previous,
          'gray',
        );

        const previousTransition =
          ReservationDetailComponent.createTransaction(
            previous,
            () => this.router.navigate([
              this.language,
              'reservation',
              allReservations[currentIndex - 1],
            ]),
          );

        ReservationDetailComponent.addTransitionToAllStates(
          previous,
          previousTransition,
          previousAction,
          false,
        );
      }

      if (currentIndex >= 0 && currentIndex < allReservations.length - 1) {
        const next = 'next';

        const nextAction = this.createAction(
          this.translate.instant('RESERVATION.ACTION.NEXT'),
          ReservationIconName.next,
          next,
          'gray',
        );

        const nextTransition =
          ReservationDetailComponent.createTransaction(
            next,
            () => this.router.navigate([
              this.language,
              'reservation',
              allReservations[currentIndex + 1],
            ]),
          );

        ReservationDetailComponent.addTransitionToAllStates(
          next,
          nextTransition,
          nextAction,
        );
      }
    });

    effect(() => {
      const paymentOptions = this.paymentOptionsSignal();
      if (paymentOptions) {
        this.options.set(getPayNlOptions(paymentOptions));
      }
    });
  }

  get getForm(): DetailForm {
    return this.form.controls;
  }

  get payments(): FormArray<FormGroup<PaymentForm>> {
    return this.form.controls.payments;
  }

  get gmt(): string {
    return getReservationGMT(this.reservation());
  }

  get total(): number {
    return totalPaid(this.paymentPaid());
  }

  get historyLength(): number {
    return this.historiesSignal()?.length || 0;
  }

  updatePayment() {
    let paymentRequests: IPaymentRequest[] = [];
    this.paymentPaid().forEach((p, i) => {
      const payment = this.payments.at(i).getRawValue();
      const amount = (p.transactionAmount ?? 0).toFixed(2);

      if (amount !== payment.amount || p.type !== payment.type) {
        paymentRequests = [
          ...paymentRequests,
          {
            paymentId: p.id,
            amount: parseFloat(payment.amount) - parseFloat(amount),
            paymentType: payment.type,
          },
        ];
      }
    });

    this.store.dispatch(adjustPayments({ payments: paymentRequests }));
  }

  addNote() {
    const reservation = this.reservation();
    if (reservation) {
      executeDialog(this.dialog, AddNoteDialogComponent, {
        note: reservation.note,
        customerNote: reservation.customerNote,
        isCustomer: this.isCustomer,
      }, result => {
        if (result) {
          this.store.dispatch(
            updateReservationNote({
              id: reservation.id,
              role: this.professionalId() ? Role.professional : Role.customer,
              note: result.note,
              customerNote: result.customerNote,
              paymentLink: reservation.paymentLink,
              timestamp: reservation.timestamp,
              timeZone: reservation.room.timeZone,
            }),
          );
        }
      }, true);
    }
  }

  addDiscount() {
    const reservation = this.reservation();
    if (reservation) {
      executeDialog(this.dialog, AddDiscountDialogComponent, { customerId: reservation.customer.id },
        result => {
          if (result) {
            this.store.dispatch(updateReservationDiscount({ id: reservation.id, discountId: result.discountId }));
          }
        }, true);
    }
  }

  private static createMachine = (stateMachineDefinition: any, initialState: any): any => {
    ReservationDetailComponent.stateMachineDefinition = stateMachineDefinition;
    const machine = {
      value: initialState,
      transition: (currentState: any, event: any): any => {
        const currentStateDefinition = stateMachineDefinition[currentState];
        const destinationTransition = currentStateDefinition.transitions[event];
        if (!destinationTransition) {
          return undefined;
        }
        const destinationState = destinationTransition.target;
        destinationTransition.action();
        machine.value = destinationState;
        return machine.value;
      },
      next: (currentState: any): any => {
        const currentStateDefinition = stateMachineDefinition[currentState];
        return currentStateDefinition.next;
      },
    };
    return machine;
  };

  private static addTransitionToAllStates = (
    eventName: string,
    transitionDetails: any,
    nextState: any,
    last: boolean = true,
  ): void => {
    for (const state in ReservationDetailComponent.stateMachineDefinition) {
      if (state !== 'initialState') {
        if (ReservationDetailComponent.stateMachineDefinition.hasOwnProperty(state)) {
          const stateDefinition = ReservationDetailComponent.stateMachineDefinition[state];
          if (!stateDefinition.transitions) {
            stateDefinition.transitions = {};
          }
          stateDefinition.transitions[eventName] = transitionDetails;

          if (!stateDefinition.next) {
            stateDefinition.next = [];
          }
          if (!stateDefinition.next.includes(nextState)) {
            if (last) {
              stateDefinition.next.push(nextState);
            } else {
              stateDefinition.next.unshift(nextState);
            }
          }
        }
      }
    }
  };

  private static createTransaction = (target: string, action: any): any => ({ target, action });

  private static getDateTimeDetail = (reservation: IReservationAll): Date => newDateTimestamp(reservation.timestamp);

  private static createBullet = (name: string): string => `%0A\uD83D\uDC85\uD83C\uDFFB ${name}`;

  openHistoryDialog = (history: IReservationAll): void => this.openDialog(
    ReservationDetailComponent.getDateTimeDetail(history));

  openDialog = (reservationDate: Date): void => {
    const reservation = this.reservation();
    if (reservation) {
      openDialog(reservation.room, this.language, this.translate, this.dialog, reservationDate);
    }
  };

  showTimeZone = (reservation?: IUpcomingAll): boolean => !isSameTimeZone(
    (reservation || this.reservation())?.room.timeZone);

  onChangeState = (id: string): void => {
    const list = ['send', 'coffee', 'book', 'more', 'change', 'cancel', 'cancel_edit', 'notify', 'pay', 'color',
      'clone', 'previous', 'next'];
    const state = this.state();
    if (!state) {
      return;
    }
    if (list.indexOf(id) >= 0) {
      this.machine.transition(snakeToCamel(state), snakeToCamel(id));
      return;
    }
    const title = this.translate.instant('RESERVATION.CHANGE_STATE.TITLE');
    const action = this.translate.instant(`RESERVATION.CHANGE_STATE.ACTION.${id.toUpperCase()}`);
    const content = this.translate.instant('RESERVATION.CHANGE_STATE.CONTENT', { action });
    const dialogRef = this.dialog.open(DialogComponent, {
      data: { title, content, value: id },
    });

    dialogRef.afterClosed().subscribe(event => {
      if (event) {
        this.machine.transition(snakeToCamel(state), event);
      }
    });
  };

  notify = (payment: IPaymentAll): void => this.store.dispatch(notifyPayment({
    id: payment.id,
    path: 'reservation',
    resourceId: payment.reservation!.id,
    preferenceId: payment.preferenceId,
    paymentType: payment.type,
  }));

  pay = (payment: IPaymentAll): void => this.store.dispatch(paymentSend({ link: payment.paymentURL || payment.link }));

  twoDigit = (i: number): void => {
    const payment = this.payments.at(i).getRawValue();

    this.payments.at(i).setValue({
      ...payment,
      amount: parseFloat(payment.amount).toFixed(2),
    });
  };


  private createAction = (
    tooltip: string,
    icon: string,
    id: string,
    color?: string,
  ): IFabMenu => ({ tooltip, icon, id, color } as IFabMenu);

  private getOptions = (): void => this.store.dispatch(paymentOptions());

  private professionalMachine = (self: this): any => {
    const reservation = self.reservation();
    if (!reservation) {
      return;
    }
    const id = reservation.id;
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
    const coffeeMessage = this.createAction(translate.instant('RESERVATION.ACTION.COFFEE'),
      ReservationIconName.coffee, 'coffee', 'accent');
    const change = this.createAction(translate.instant('RESERVATION.ACTION.CHANGE'),
      ReservationIconName.change, 'change', 'accent');

    const more = this.createAction(translate.instant('RESERVATION.ACTION.MORE'),
      ReservationIconName.more, 'more');

    const color = this.createAction(translate.instant('RESERVATION.ACTION.COLOR'),
      ReservationIconName.color, 'color');

    const clone = this.createAction(translate.instant('RESERVATION.ACTION.CLONE'),
      ReservationIconName.clone, 'clone');

    const userPhone = reservation.customer.phone;

    let approveActions: IFabMenu[] = [];
    const startDate = newDate(self.start);
    if (lessOrEqualsThanToday(startDate, reservation.room.timeZone)) {
      approveActions = [start];
    }
    approveActions = [...approveActions, edit];
    if (userPhone) {
      if (greaterOrEqualsThanToday(startDate, reservation.room.timeZone)) {
        approveActions = [...approveActions, sendMessage];
      }
      if (isTomorrow(startDate)) {
        approveActions = [...approveActions, coffeeMessage];
      }
    }
    approveActions = [...approveActions, more, clone, cancel];

    const approveTransaction = ReservationDetailComponent.createTransaction('approved', (): void => {
      store.dispatch(approveReservation(id));
    });

    const sendMessageTransaction = ReservationDetailComponent.createTransaction('send', (): void => {
      if (startDate) {
        let key;
        let date = getTime(startDate, self.language);
        let treatment = ReservationDetailComponent.createBullet(reservation.treatment.name);
        treatment +=
          reservation.additional?.map(additional => ReservationDetailComponent.createBullet(additional.name));
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
        const message = translate.instant(`WHATSAPP.SEND.${key}`, { date, treatment });
        window.open(`https://api.whatsapp.com/send?phone=+${userPhone}&text=${message}`, '_blank');
      }
    });

    const coffeeMessageTransaction = ReservationDetailComponent.createTransaction('send', (): void => {
      const message = translate.instant('WHATSAPP.SEND.COFFEE');
      window.open(`https://api.whatsapp.com/send?phone=+${userPhone}&text=${message}`, '_blank');
    });

    const startTransaction = ReservationDetailComponent.createTransaction('started', (): void => {
      store.dispatch(startReservation(id));
    });

    const editTransaction = ReservationDetailComponent.createTransaction('edited', (): void => {
      self.router.navigate([this.language, 'reservation', id, 'edit'], { state: { roomId } });
    });

    const completeTransaction = ReservationDetailComponent.createTransaction('completed', (): void => {
      self.router.navigate(
        [this.language, 'reservation', id, 'rooms', roomId, 'customer', customerId, 'complete']);
    });

    const moreTransaction = ReservationDetailComponent.createTransaction('more', (): void => {
      self.router.navigate([this.language, 'reservation', id, 'more-info']);
    });

    const changeCustomerTransaction = ReservationDetailComponent.createTransaction('change',
      (): void => self.changeUser(reservation));

    const changeColorTransaction = ReservationDetailComponent.createTransaction('color',
      (): void => self.changeColor(reservation));

    const cloneTransaction = ReservationDetailComponent.createTransaction('clone',
      (): void => self.clone(reservation));

    const options = Object.values(CancelOption).filter(co => co !== CancelOption.charge);
    const cancelTransaction = ReservationDetailComponent.createTransaction('cancelled', (): void =>
      self.cancel(reservation, options, self.price, result => {
        if (result) {
          this.store.dispatch(cancelReservation(reservation.id, result));
        }
      }));

    const finishTransaction = ReservationDetailComponent.createTransaction('completed', (): void => {
      self.store.dispatch(paymentCompleteReservation(id));
    });

    const bookTransaction = ReservationDetailComponent.createTransaction('booked', (): void => {
      const customerId = reservation.customer.id;
      const roomId = reservation.room.id;
      const treatmentId = reservation.treatment.key;
      const professionalId = reservation.professional.id;
      const data = { customerId, roomId, treatmentId, professionalId };
      this.router.navigate([this.language, 'reservation'], { state: data });
    });

    const approved = {
      transitions: {
        start: startTransaction,
        cancel: cancelTransaction,
        edit: editTransaction,
        send: sendMessageTransaction,
        coffee: coffeeMessageTransaction,
        more: moreTransaction,
        clone: cloneTransaction,
      },
      next: approveActions,
    };

    let completeActions: IFabMenu[] = [book];
    if (reservation.configurationCanCustomerChange) {
      completeActions = [...completeActions, change];
    }
    completeActions = [...completeActions, more, color, clone];

    const completed = {
      transitions: {
        book: bookTransaction,
        more: moreTransaction,
        change: changeCustomerTransaction,
        color: changeColorTransaction,
        clone: cloneTransaction,
      },
      next: completeActions,
    };

    this.machine = ReservationDetailComponent.createMachine({
      initialState: ReservationIconName.created,
      created: {
        transitions: {
          approve: approveTransaction,
          cancel: cancelTransaction,
          edit: editTransaction,
          more: moreTransaction,
          clone: cloneTransaction,
        },
        next: [approve, edit, cancel, more, clone],
      },
      approved,
      paid: approved,
      partiallyPaid: approved,
      started: {
        transitions: {
          complete: completeTransaction,
        },
        next: [complete],
      },
      partiallyCompleted: {
        transitions: {
          complete: finishTransaction,
          more: moreTransaction,
        },
        next: [complete, more],
      },
      completed,
      cancelled: {
        transitions: {
          clone: cloneTransaction,
        },
        next: [clone],
      },
      cancelledPaymentRequired: {
        next: [],
      },
      editCancelled: {
        next: [],
      },
    }, initialState);
  };

  private customerMachine = (self: this): any => {
    const reservation = self.reservation();
    if (!reservation) {
      return;
    }
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
          this.store.dispatch(customerCancelReservation(reservation.id, result));
        }
      }, showPenalty, self.options()));

    const bookTransaction = ReservationDetailComponent.createTransaction('booked', (): void => {
      const roomId = reservation.room.id;
      const treatmentId = reservation.treatment.key;
      const professionalId = reservation.professional.id;
      const data = { roomId, treatmentId, professionalId };
      this.router.navigate([this.language, 'me', 'reservation'], { state: data });
    });

    const created = {
      transitions: {
        edit: null,
        cancelEdit: null,
        cancel: cancelTransaction,
      },
      next: [cancel],
    };

    const approved = {
      transitions: {
        edit: null,
        cancelEdit: null,
        cancel: cancelTransaction,
        pay: null,
      },
      next: [cancel],
    };

    const paid = {
      transitions: {
        edit: null,
        cancelEdit: null,
        cancel: cancelTransaction,
      },
      next: [cancel],
    };

    const partiallyCompleted = {
      transitions: {
        pay: null,
      },
      next: [] as any[],
    };

    const cancelledPaymentRequired = {
      transitions: {
        pay: null,
        notify: null,
      },
      next: [] as any[],
    };

    /* EDIT */
    if (reservation.canEdit || price.totalPaid >= price.penalty) {
      const edit = this.createAction(translate.instant('RESERVATION.ACTION.EDIT'),
        ReservationIconName.edit, 'edit', 'accent');

      const editTransaction = ReservationDetailComponent.createTransaction('edited', (): void => {
        self.router.navigate([this.language, 'me', 'reservation', reservationId]);
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
        customerEditDialog(self.dialog, self.router, reservationId, reservation.room.currency, self.small(),
          self.language, price));

      created.transitions.cancelEdit = editTransaction;
      created.next.unshift(edit);

      approved.transitions.cancelEdit = editTransaction;
      approved.next.unshift(edit);

      paid.transitions.cancelEdit = editTransaction;
      paid.next.unshift(edit);
    }

    if (reservation.paymentRequired) {
      const paymentPaid = self.paymentPaid();
      const paymentPending = paymentPaid?.filter((p: IPayment) => p.status === 'PENDING')[0];
      if (paymentPending) {
        const notify = this.createAction(translate.instant('RESERVATION.ACTION.NOTIFY'),
          ReservationIconName.notify, 'notify');
        cancelledPaymentRequired.next = [notify];

        cancelledPaymentRequired.transitions.notify =
          ReservationDetailComponent.createTransaction('cancelledPaymentRequired', (): void => {
            this.notify(paymentPending);
          });
      } else {
        const pay = this.createAction(translate.instant('RESERVATION.ACTION.PAY'),
          ReservationIconName.payment, 'pay', 'blue');
        cancelledPaymentRequired.next = [pay];

        cancelledPaymentRequired.transitions.pay =
          ReservationDetailComponent.createTransaction('cancelledPaymentRequired', (): void => {
            this.router.navigate(['/', this.language, 'me', 'payment',
              paymentPaid?.filter((p: IPayment) => p.status !== 'APPROVED')[0]?.id]);
          });
      }
      self.addActions();
    }

    if (price.total > price.totalPaid) {
      const next = this.createAction(translate.instant('RESERVATION.ACTION.PAY'),
        ReservationIconName.payment, 'pay', 'blue');
      approved.next = [...approved.next, next];
      partiallyCompleted.next = [...partiallyCompleted.next, next];

      const transaction = ReservationDetailComponent.createTransaction('paid',
        (): void => {
          this.router.navigate(['/', this.language, 'me', 'reservation', reservation.id, 'payment', 'option']);
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
        next: [],
      },
      partiallyCompleted,
      completed: {
        transitions: {
          book: bookTransaction,
        },
        next: [book],
      },
      cancelled: {
        next: [],
      },
      editCancelled: {
        next: [],
      },
      cancelledPaymentRequired,
    }, initialState);
  };

  private addActions = (): void => {
    if (!this.paymentDisplayedColumns.includes('actions')) {
      this.paymentDisplayedColumns.splice(this.paymentDisplayedColumns.length - 1, 0, 'actions');
    }
  };

  private changeUser = (reservation: IReservationAll): void => executeDialog(
    this.dialog,
    ChangeCustomerDialogComponent,
    {
      customerId: reservation.customer.id,
      small: this.small,
    },
    result => {
      if (result) {
        this.store.dispatch(updateReservationCustomer({ id: reservation.id, customerId: result.customerId }));
      }
    },
    true,
  );

  private changeColor = (reservation: IReservationAll): void => executeDialog(
    this.dialog,
    ChangeColorDialogComponent,
    {
      treatmentId: reservation.treatment.key,
      colorId: reservation.treatment.color?.id,
      small: this.small,
    },
    result => {
      if (result) {
        this.store.dispatch(updateReservationColor({ id: reservation.id, colorId: result.colorId }));
      }
    },
    true,
  );

  private clone = (reservation: IReservationAll): void => executeDialog(
    this.dialog,
    ReservationCloneDialogComponent,
    {
      room: reservation.room,
      small: this.small,
    },
    result => {
      if (result) {
        if (result.time) {
          const timeValue = getTimeNumber(result.time);
          if (timeValue) {
            result.date.setHours(timeValue.hour, timeValue.minute);
          }
        }
        const state = {
          date: result.date,
          customerId: reservation.customer.id,
          professionalId: reservation.professional.id,
          roomId: reservation.room.id,
          treatmentId: reservation.treatment.key,
          groupId: reservation.treatment.groupId,
          additionalIds: reservation.additional?.map(it => it.key),
        };
        this.router.navigate([this.language, 'reservation'], { state });
      }
    },
    true,
  );

  private cancel = (
    reservation: IReservationAll,
    options: string[], price: IPrice,
    afterClose: (result: any) => void,
    showPenalty?: boolean,
    paymentOptions?: IPaymentOption[],
  ) => openCancel(this.dialog, reservation.room, this.small(), options, afterClose, showPenalty, price, paymentOptions);
}
