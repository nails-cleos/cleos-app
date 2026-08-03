import { ChangeDetectionStrategy, Component, computed, effect, inject, input, signal, viewChild } from '@angular/core';
import { CancelOption, IFabMenu, IReservationAll, IUpcomingAll, States } from '../reservation';
import { RouterLink } from '@angular/router';
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
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
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
import { IPrice, Price } from '../../treatment/treatment';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { IPayment, IPaymentAll, IPaymentOption, IPaymentRequest, PENALTY } from '../../interfaces/payment';
import { isToday, isTomorrow } from 'date-fns';
import { ReservationIconName } from '../../util/icon';
import { FormArray, FormControl, FormGroup, NonNullableFormBuilder, ReactiveFormsModule } from '@angular/forms';
import { startWith } from 'rxjs/operators';
import { ChangeCustomerDialogComponent } from './change-customer-dialog.component';
import { ChangeColorDialogComponent } from './change-color-dialog.component';
import { AddNoteDialogComponent } from './add-note-dialog.component';
import { AddDiscountDialogComponent } from './add-discount-dialog.component';
import { AuthUserService } from '../../services/auth-user.service';
import { Role } from '../../interfaces/token';
import { ReservationCloneDialogComponent } from './reservation-clone-dialog.component';
import { RoomNamePipe } from '../../pipes/room-name.pipe';
import { ReservationIconPipe } from '../../pipes/reservation-icon.pipe';
import { PriceExtrasComponent } from '../../shared/price-extras/price-extras.component';
import { PaymentOptionSelectComponent } from '../../shared/payment-option-select/payment-option-select.component';
import { TwoDigitsDirective } from '../../directives/two-digits.directive';
import { TimeDetailPipe } from '../../pipes/time-detail.pipe';
import { BackButtonDirective } from '../../directives/back-button.directive';
import { FabMenuComponent } from './fab-menu/fab-menu.component';
import { toSignal } from '@angular/core/rxjs-interop';
import {
  MatCell,
  MatCellDef,
  MatColumnDef,
  MatFooterCell,
  MatFooterCellDef,
  MatFooterRow,
  MatFooterRowDef,
  MatHeaderCell,
  MatHeaderCellDef,
  MatHeaderRow,
  MatHeaderRowDef,
  MatRow,
  MatRowDef,
  MatTable,
  MatTableDataSource,
} from '@angular/material/table';
import { findStateColor } from '../../util/theme';
import { DurationTimePipe } from '../../pipes/durationTime.pipe';
import { MatFormField, MatInput, MatPrefix } from '@angular/material/input';
import { MatIcon } from '@angular/material/icon';
import {
  MatDivider,
  MatList,
  MatListItem,
  MatListItemIcon,
  MatListSubheaderCssMatStyler,
} from '@angular/material/list';
import { MatButton, MatIconButton } from '@angular/material/button';
import { DatePipe, DecimalPipe, NgClass } from '@angular/common';
import { MatSort } from '@angular/material/sort';
import { MatTooltip } from '@angular/material/tooltip';
import { MatCard, MatCardContent } from '@angular/material/card';
import { TableSkeletonColumn, TableSkeletonComponent } from '../../shared/skeleton/table-skeleton.component';
import { ReservationDetailSkeletonComponent } from './reservation-detail-skeleton.component';
import { NavigationService } from '../../services/navigation.service';
import { PaymentStore } from '../../store/payment.store';
import { ReservationStore } from '../../store/reservation.store';

type PaymentForm = {
  amount: FormControl<string>;
  type: FormControl<string>;
}

type DetailForm = {
  payments: FormArray<FormGroup<PaymentForm>>;
}

@Component({
  selector: 'app-reservation-detail',
  templateUrl: './reservation-detail.component.html',
  styleUrls: ['./reservation-detail.component.scss'],
  imports: [TimeDetailPipe, TwoDigitsDirective, MatFormField, MatInput, MatIcon, MatList, MatListItem,
    MatListSubheaderCssMatStyler, MatIconButton, MatButton, ReactiveFormsModule, TranslatePipe, DecimalPipe, NgClass,
    RouterLink, DatePipe, MatTable, MatSort, MatColumnDef, MatHeaderCellDef, MatHeaderCell, MatCellDef, MatCell,
    MatTooltip, MatListItemIcon, MatFooterCellDef, MatFooterCell, MatHeaderRowDef, MatHeaderRow, MatRowDef, MatRow,
    MatFooterRow, MatFooterRowDef, MatPaginator, MatPrefix, BackButtonDirective, MatCard,
    MatCardContent, RoomNamePipe, ReservationIconPipe, PriceExtrasComponent,
    PaymentOptionSelectComponent, TwoDigitsDirective, TimeDetailPipe, BackButtonDirective, FabMenuComponent,
    DurationTimePipe, MatDivider, TableSkeletonComponent, ReservationDetailSkeletonComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReservationDetailComponent {
  id = input.required<string>();

  private static readonly PROFESSIONAL_PAYMENT_TYPES = ['CASH', 'TRANSFER', 'MOLLIE'];

  private readonly translateService: TranslateService = inject(TranslateService);
  private readonly dialog: MatDialog = inject(MatDialog);
  private readonly reservationStore = inject(ReservationStore);
  private readonly paymentStore = inject(PaymentStore);
  private readonly navigationService: NavigationService = inject(NavigationService);
  private readonly breakpointObserver: BreakpointObserver = inject(BreakpointObserver);
  private readonly formBuilder: NonNullableFormBuilder = inject(NonNullableFormBuilder);
  private readonly authUserService: AuthUserService = inject(AuthUserService);

  private paginator = viewChild(MatPaginator);

  private breakpointObserver$ = this.breakpointObserver.observe([Breakpoints.XSmall, Breakpoints.Small]);

  private readonly authUserSignal = this.authUserService.authUser;
  private readonly params = computed(() => {
    const navigationState = history.state;
    if (navigationState) {
      return { step: navigationState['step'] };
    }
    return undefined;
  });
  private readonly paymentOptionsSignal = this.paymentStore.options;
  private readonly breakpointsSignal = toSignal(
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

  private readonly historiesSignal = computed(() => {
    const data = this.reservationStore.data();
    return data?.kind === 'list' ? data.value : undefined;
  });
  private readonly paymentResource = this.paymentStore.data;

  reservationSignal = this.reservationStore.selected;
  readonly isLoading = this.reservationStore.isLoading;
  readonly paymentsLoading = computed(() => !!this.reservationSignal() && this.paymentStore.isLoading());
  readonly historyLoading = computed(() => !!this.reservationSignal() && this.historiesSignal() === undefined);

  readonly paginatorPageIndex = signal(0);
  duration: IDuration = new Duration();
  start: Date = getNowTimeZone();
  end: Date = getNowTimeZone();
  state = signal<string | undefined>(undefined);
  readonly language: string = this.navigationService.language;
  changeState: IFabMenu[] = [];

  historyTableColumns: TableSkeletonColumn[] = [
    { key: 'position', hideOnMobile: true },
    { key: 'professional', hideOnMobile: true },
    { key: 'start' },
    { key: 'treatment' },
    { key: 'state', hideOnMobile: true },
  ];
  paymentTableColumns: TableSkeletonColumn[] = [
    { key: 'position' },
    { key: 'description' },
    { key: 'status', hideOnMobile: true },
    { key: 'type', hideOnMobile: true },
    { key: 'amount' },
  ];
  displayedColumns: string[] = this.historyTableColumns.map((column) => column.key);
  dataSource = computed(() => new MatTableDataSource(this.historiesSignal()));

  expanded?: IReservationAll;
  pageSize = 5;

  price: IPrice = new Price();
  private readonly paymentOptions = computed(() => this.paymentOptionsSignal().filter(
    option => option.enabled && option.show,
  ));
  options = signal<IPaymentOption[] | undefined>(undefined);

  showFireworks = false;

  paymentPaid = signal<IPaymentAll[]>([]);
  paymentDisplayedColumns: string[] = this.paymentTableColumns.map((column) => column.key);
  paymentExpanded?: IPayment;

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
  step = computed(() => this.params()?.step);

  private static stateMachineDefinition: any;
  private machine: any;
  small = computed(() => this.breakpointsSignal()?.matches);
  isDarkMode = computed(() => this.authUserSignal()?.isDarkMode ?? false);
  private hasRoomAdmin = computed(() => {
    const auth = this.authUserSignal();
    return (auth?.isAdmin || auth?.isManager || auth?.isRoomAdmin) ?? false;
  });

  readonly switchablePaymentTypes = ['CASH', 'TRANSFER'];
  private hasFetched = signal(false);

  private getReservationPaymentOptions = (
    reservation: IReservationAll,
    isCustomer: boolean,
    isReservationAdmin: boolean,
  ): IPaymentOption[] => {
    const roomPaymentTypes = new Set(reservation.room.paymentTypes);
    const options = this.paymentOptions().filter(option => roomPaymentTypes.has(option.type));

    if (isCustomer) {
      return options.filter(option => option.enabledCustomer);
    }

    if (isReservationAdmin) {
      const professionalPaymentTypes = new Set(ReservationDetailComponent.PROFESSIONAL_PAYMENT_TYPES);
      return options.filter(option => professionalPaymentTypes.has(option.type));
    }

    return [];
  };

  isEditablePaymentType = (paymentType?: string): boolean => {
    return !!this.professionalId() && this.switchablePaymentTypes.includes(paymentType || '');
  };

  getAllowedPaymentTypes = (paymentType?: string): string[] => {
    return this.isEditablePaymentType(paymentType) ? this.switchablePaymentTypes : [];
  };

  getStatusBadgeColor = (state?: string): string => findStateColor(state || 'DEFAULT', this.isDarkMode());

  getStatusBadgeTextColor = (state?: string): string => {
    const hex = this.getStatusBadgeColor(state).replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    const luminance = (0.299 * r) + (0.587 * g) + (0.114 * b);

    return luminance > 160 ? '#2a241f' : '#f7f3ee';
  };

  constructor() {
    this.payments.clear();
    this.paymentStore.getOptions();
    effect(() => {
      const id = this.id();
      if (id && !this.hasFetched()) {
        this.hasFetched.set(true);
        this.reservationStore.loadById(id);
        this.paymentStore.getPaymentByResourceId(id, 'reservation');
        this.reservationStore.loadHistory(id);
      }
    });

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
      const reservation = this.reservationSignal();
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
        this.options.set(this.getReservationPaymentOptions(reservation, isCustomer, this.isReservationAdmin));
        this.price = getPrice(reservation, this.paymentPaid());
        if (isProfessionalAdmin) {
          this.professionalMachine(this);
          this.changeState = this.machine.next(snakeToCamel(reservation.state));
          if (reservation.state === 'APPROVED') {
            const discount = this.createAction(this.translateService.instant('RESERVATION.TREATMENT.DISCOUNT.FIELD'),
              ReservationIconName.discount, 'discount');
            const discountTransaction = ReservationDetailComponent.createTransaction('discount',
              (): void => this.addDiscount());
            ReservationDetailComponent.addTransitionToAllStates(
              'discount',
              discountTransaction,
              discount,
              false,
            );
          }
        } else if (isCustomer) {
          this.customerMachine(this);
          this.changeState = this.machine.next(snakeToCamel(reservation.state));
          if (reservation.state === States.completed) {
            this.showFireworks = true;
            setTimeout(() => {
              this.showFireworks = false;
            }, 5000);
          }
        }
        const note = this.createAction(this.translateService.instant('RESERVATION.NOTE.FIELD'),
          ReservationIconName.note, 'note');
        const noteTransaction = ReservationDetailComponent.createTransaction('note',
          (): void => this.addNote());
        ReservationDetailComponent.addTransitionToAllStates(
          'note',
          noteTransaction,
          note,
          false,
        );
        const overview = this.createAction(this.translateService.instant('COMMON.BUTTON.VIEW'),
          ReservationIconName.overview, 'overview');
        const overviewTransaction = ReservationDetailComponent.createTransaction('overview',
          (): void => this.overview());
        ReservationDetailComponent.addTransitionToAllStates(
          'overview',
          overviewTransaction,
          overview,
          false,
        );
        this.isCustomer.set(isCustomer);
      }
    });

    effect(() => {
      const payments = this.paymentResource()?.payments;
      if (!payments?.length) {
        this.paymentPaid.set([]);
        return;
      }

      if (this.isCustomer()) {
        this.paymentPaid.set(payments.map((p) => {
          if (p.status &&
            !['APPROVED', 'APPROVED_REFUND', 'REFUND_FAILURE', 'REFUND_PENDING', 'REFUND'].includes(p.status)) {
            this.addActions();
          }
          return p;
        }).sort((a, b) => a.status.localeCompare(b.status)));
      } else if (!this.payments.length) {
        this.paymentPaid.set(payments.map((p: IPaymentAll) => {
          const amount = (p.transactionAmount || 0).toFixed(2);
          const paymentForm = this.formBuilder.group({
            amount: [amount],
            type: [p.type],
          });
          this.payments.push(paymentForm);
          return p;
        }));
      } else {
        this.paymentPaid.set(payments);
      }
    });
    effect(() => {
      const history = this.historiesSignal();
      const reservation = this.reservationSignal();

      if (!history || !reservation) {
        return;
      }

      const allReservations = [...history, reservation]
        .sort((a, b) => a.timestamp - b.timestamp)
        .map(r => r.id);

      const currentIndex = allReservations.indexOf(reservation.id);

      if (currentIndex > 0) {
        const previous = 'previous';

        const previousAction = this.createAction(
          this.translateService.instant('RESERVATION.ACTION.PREVIOUS'),
          ReservationIconName.previous,
          previous,
        );

        const previousTransition =
          ReservationDetailComponent.createTransaction(
            previous,
            () => this.navigationService.navigate([
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
          this.translateService.instant('RESERVATION.ACTION.NEXT'),
          ReservationIconName.next,
          next,
        );

        const nextTransition =
          ReservationDetailComponent.createTransaction(
            next,
            () => this.navigationService.navigate([
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

  }

  get payments(): FormArray<FormGroup<PaymentForm>> {
    return this.form.controls.payments;
  }

  get gmt(): string {
    return getReservationGMT(this.reservationSignal());
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
            pointOfSale: true,
          },
        ];
      }
    });

    this.paymentStore.adjust(paymentRequests);
  }

  overview() {
    if (this.isCustomer()) {
      this.navigationService.navigate(['me', 'overview']);
    } else {
      this.navigationService.navigate(['users', this.reservationSignal()?.customer?.id, 'overview']);
    }
  }

  addNote() {
    const reservation = this.reservationSignal();
    if (reservation) {
      executeDialog(this.dialog, AddNoteDialogComponent, {
        note: reservation.note,
        customerNote: reservation.customerNote,
        isCustomer: this.isCustomer(),
      }, result => {
        if (result) {
          this.reservationStore.updateNote(
            reservation.id,
            this.professionalId() ? Role.professional : Role.customer,
            result.note,
            result.customerNote,
            reservation.paymentLink,
            reservation.timestamp,
            reservation.room.timeZone,
          );
        }
      }, true);
    }
  }

  addDiscount() {
    const reservation = this.reservationSignal();
    if (reservation) {
      executeDialog(this.dialog, AddDiscountDialogComponent, { customerId: reservation.customer.id },
        result => {
          if (result) {
            this.reservationStore.updateDiscount(reservation.id, result.discountId);
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

  private static createBullet = (name: string): string => `%0A\uD83D\uDC85\uD83C\uDFFB ${ name }`;

  openHistoryDialog = (history: IReservationAll): void => this.openDialog(
    ReservationDetailComponent.getDateTimeDetail(history));

  openDialog = (reservationDate: Date): void => {
    const reservation = this.reservationSignal();
    if (reservation) {
      openDialog(reservation.room, this.language, this.translateService, this.dialog, reservationDate);
    }
  };

  showTimeZone = (reservation?: IUpcomingAll): boolean => !isSameTimeZone(
    (reservation || this.reservationSignal())?.room.timeZone);

  onChangeState = (id: string): void => {
    const list = ['send', 'coffee', 'book', 'more', 'change', 'cancel', 'cancel_edit', 'notify', 'pay', 'color',
      'clone', 'previous', 'next', 'overview', 'note', 'discount'];
    const state = this.state();
    if (!state) {
      return;
    }
    if (list.indexOf(id) >= 0) {
      this.machine.transition(snakeToCamel(state), snakeToCamel(id));
      return;
    }
    const title = this.translateService.instant('RESERVATION.CHANGE_STATE.TITLE');
    const action = this.translateService.instant(`RESERVATION.CHANGE_STATE.ACTION.${ id.toUpperCase() }`);
    const content = this.translateService.instant('RESERVATION.CHANGE_STATE.CONTENT', { action });
    const dialogRef = this.dialog.open(DialogComponent, {
      data: { title, content, value: id },
    });

    dialogRef.afterClosed().subscribe(event => {
      if (event) {
        this.machine.transition(snakeToCamel(state), event);
      }
    });
  };

  notify = (payment: IPaymentAll): void => this.paymentStore.notify(
    payment.id,
    'reservation',
    payment.reservation!.id,
    payment.preferenceId,
    payment.type,
  );

  pay = (payment: IPaymentAll): void => {
    window.open(payment.link || payment.paymentURL, '_self');
  };

  twoDigit = (i: number): void => {
    const payment = this.payments.at(i).getRawValue();

    this.payments.at(i).setValue({
      ...payment,
      amount: parseFloat(payment.amount).toFixed(2),
    });
  };

  private createAction = (
    name: string,
    icon: string,
    id: string,
  ): IFabMenu => ({ name, icon, id });

  private professionalMachine = (self: this): any => {
    const reservation = self.reservationSignal();
    if (!reservation) {
      return;
    }
    const id = reservation.id;
    const roomId = reservation.room.id;
    const customerId = reservation.customer.id;
    const initialState = reservation.state;
    const reservationStore = self.reservationStore;
    const translateService = self.translateService;

    const approve = this.createAction(translateService.instant('RESERVATION.ACTION.APPROVE'),
      ReservationIconName.approved, 'approve');
    const start = this.createAction(translateService.instant('RESERVATION.ACTION.START'),
      ReservationIconName.started, 'start');
    const complete = this.createAction(translateService.instant('RESERVATION.ACTION.COMPLETE'),
      ReservationIconName.completed, 'complete');
    const edit = this.createAction(translateService.instant('RESERVATION.ACTION.EDIT'),
      ReservationIconName.edit, 'edit');
    const cancel = this.createAction(translateService.instant('RESERVATION.ACTION.CANCEL'),
      ReservationIconName.cancelled, 'cancel');
    const book = this.createAction(translateService.instant('RESERVATION.ACTION.BOOK'),
      ReservationIconName.book, 'book');
    const sendMessage = this.createAction(translateService.instant('RESERVATION.ACTION.SEND'),
      ReservationIconName.send, 'send');
    const coffeeMessage = this.createAction(translateService.instant('RESERVATION.ACTION.COFFEE'),
      ReservationIconName.coffee, 'coffee');
    const change = this.createAction(translateService.instant('RESERVATION.ACTION.CHANGE'),
      ReservationIconName.change, 'change');

    const more = this.createAction(translateService.instant('RESERVATION.ACTION.MORE'),
      ReservationIconName.more, 'more');

    const color = this.createAction(translateService.instant('RESERVATION.ACTION.COLOR'),
      ReservationIconName.color, 'color');

    const clone = this.createAction(translateService.instant('RESERVATION.ACTION.CLONE'),
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
      reservationStore.approve(id);
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
        const message = translateService.instant(`WHATSAPP.SEND.${ key }`, { date, treatment });
        window.open(`https://api.whatsapp.com/send?phone=+${ userPhone }&text=${ message }`, '_blank');
      }
    });

    const coffeeMessageTransaction = ReservationDetailComponent.createTransaction('send', (): void => {
      const message = translateService.instant('WHATSAPP.SEND.COFFEE');
      window.open(`https://api.whatsapp.com/send?phone=+${ userPhone }&text=${ message }`, '_blank');
    });

    const startTransaction = ReservationDetailComponent.createTransaction('started', (): void => {
      reservationStore.start(id);
    });

    const editTransaction = ReservationDetailComponent.createTransaction('edited', (): void => {
      self.navigationService.navigate(['reservation', id, 'edit'], { state: { roomId } });
    });

    const completeTransaction = ReservationDetailComponent.createTransaction('completed', (): void => {
      self.navigationService.navigate(
        ['reservation', id, 'rooms', roomId, 'customer', customerId, 'complete']);
    });

    const moreTransaction = ReservationDetailComponent.createTransaction('more', (): void => {
      self.navigationService.navigate(['reservation', id, 'more-info']);
    });

    const changeCustomerTransaction = ReservationDetailComponent.createTransaction('change',
      (): void => self.changeUser(reservation));

    const changeColorTransaction = ReservationDetailComponent.createTransaction('color',
      (): void => self.changeColor(reservation));

    const cloneTransaction = ReservationDetailComponent.createTransaction('clone',
      (): void => self.clone(reservation));

    const options = Object.values(CancelOption).filter(co => co !== CancelOption.chargeAndAccount);
    const cancelTransaction = ReservationDetailComponent.createTransaction('cancelled', (): void =>
      self.cancel(reservation, options, self.price, result => {
        if (result) {
          this.reservationStore.cancel(reservation.id, result);
        }
      }));

    const finishTransaction = ReservationDetailComponent.createTransaction('completed', (): void => {
      self.reservationStore.paymentComplete(id);
    });

    const bookTransaction = ReservationDetailComponent.createTransaction('booked', (): void => {
      const customerId = reservation.customer.id;
      const roomId = reservation.room.id;
      const treatmentId = reservation.treatment.key;
      const professionalId = reservation.professional.id;
      const data = { customerId, roomId, treatmentId, professionalId };
      this.navigationService.navigate(['reservation'], { state: data });
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
        transitions: {
          cancel: cancelTransaction,
        },
        next: [cancel],
      },
      editCancelled: {
        transitions: {
          cancel: cancelTransaction,
        },
        next: [cancel],
      },
    }, initialState);
  };

  private customerMachine = (self: this): any => {
    const reservation = self.reservationSignal();
    if (!reservation) {
      return;
    }
    const reservationId = reservation.id;
    const initialState = reservation.state;
    const translateService = self.translateService;

    const book = this.createAction(translateService.instant('RESERVATION.ACTION.BOOK'),
      ReservationIconName.book, 'book');

    let cancelIcon = ReservationIconName.cancelled;
    let cancelOptions: string[] = [];
    const price = self.price;
    let showPenalty = false;
    /* CANCEL */
    if (reservation.canEdit) {
      if (price.totalPaid) {
        cancelOptions = [CancelOption.account, CancelOption.refund];
      } else {
        cancelOptions = [CancelOption.none];
      }
      cancelIcon = ReservationIconName.freeCancellation;
    } else {
      const penaltyToPay = (price.total * PENALTY / 100);
      price.setPenalty(penaltyToPay);
      if (price.totalPaid < penaltyToPay) {
        cancelOptions = [CancelOption.chargeAndAccount];
        showPenalty = true;
      } else if (price.totalPaid === penaltyToPay) {
        cancelOptions = [CancelOption.none];
        cancelIcon = ReservationIconName.freeCancellation;
      } else {
        cancelOptions = [CancelOption.chargeAndAccount, CancelOption.chargeAndRefund];
        showPenalty = true;
        cancelIcon = ReservationIconName.freeCancellation;
      }
    }

    const cancel = this.createAction(translateService.instant('RESERVATION.ACTION.CANCEL'), cancelIcon, 'cancel');

    const cancelTransaction = ReservationDetailComponent.createTransaction('cancelled', (): void =>
      self.cancel(reservation, cancelOptions, price, result => {
        if (result) {
          this.reservationStore.customerCancel(reservation.id, result);
        }
      }, showPenalty, self.options()));

    const bookTransaction = ReservationDetailComponent.createTransaction('booked', (): void => {
      const roomId = reservation.room.id;
      const treatmentId = reservation.treatment.key;
      const professionalId = reservation.professional.id;
      const data = { roomId, treatmentId, professionalId };
      this.navigationService.navigate(['me', 'reservation'], { state: data });
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
      const edit = this.createAction(translateService.instant('RESERVATION.ACTION.EDIT'),
        ReservationIconName.edit, 'edit');

      const editTransaction = ReservationDetailComponent.createTransaction('edited', (): void => {
        self.navigationService.navigate(['me', 'reservation', reservationId]);
      });

      created.transitions.edit = editTransaction;
      created.next.unshift(edit);

      approved.transitions.edit = editTransaction;
      approved.next.unshift(edit);

      paid.transitions.edit = editTransaction;
      paid.next.unshift(edit);
    } else {
      const edit = this.createAction(translateService.instant('RESERVATION.ACTION.EDIT'),
        ReservationIconName.edit, 'cancel_edit');

      const editTransaction = ReservationDetailComponent.createTransaction('edited', (): void =>
        customerEditDialog(self.dialog, self.navigationService, reservationId, reservation.room.currency, self.small(),
          price));

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
        const notify = this.createAction(translateService.instant('RESERVATION.ACTION.NOTIFY'),
          ReservationIconName.notify, 'notify');
        cancelledPaymentRequired.next = [notify];

        cancelledPaymentRequired.transitions.notify =
          ReservationDetailComponent.createTransaction('cancelledPaymentRequired', (): void => {
            this.notify(paymentPending);
          });
      } else {
        const pay = this.createAction(translateService.instant('RESERVATION.ACTION.PAY'),
          ReservationIconName.payment, 'pay');
        cancelledPaymentRequired.next = [pay];

        cancelledPaymentRequired.transitions.pay =
          ReservationDetailComponent.createTransaction('cancelledPaymentRequired', (): void => {
            this.navigationService.navigate(['me', 'payment',
              paymentPaid?.filter((p: IPayment) => p.status !== 'APPROVED')[0]?.id]);
          });
      }
      self.addActions();
    }

    if (price.total > price.totalPaid) {
      const next = this.createAction(translateService.instant('RESERVATION.ACTION.PAY'),
        ReservationIconName.payment, 'pay');
      approved.next = [...approved.next, next];
      partiallyCompleted.next = [...partiallyCompleted.next, next];

      const transaction = ReservationDetailComponent.createTransaction('paid',
        (): void => {
          this.navigationService.navigate(['me', 'reservation', reservation.id, 'payment', 'option']);
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
    if (!this.paymentTableColumns.some((column) => column.key === 'actions')) {
      this.paymentTableColumns.splice(this.paymentTableColumns.length - 1, 0, { key: 'actions', hideOnMobile: true });
      this.paymentDisplayedColumns = this.paymentTableColumns.map((column) => column.key);
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
        this.reservationStore.updateCustomer(reservation.id, result.customerId);
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
        this.reservationStore.updateColor(reservation.id, result.colorId);
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
        this.navigationService.navigate(['reservation'], { state });
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
