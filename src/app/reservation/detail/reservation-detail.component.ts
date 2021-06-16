import { ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Store } from '@ngrx/store';
import { AppState, selectAuthState, selectReservationState } from '../../store/app.states';
import { Observable, Subscription } from 'rxjs';
import * as fromActionsReservation from '../../store/reservation.actions';
import { IReservationAll } from '../../interfaces/reservation';
import { ActivatedRoute, Router } from '@angular/router';
import { convertDuration, createNewDate, Duration, getNow, IDuration, newDate } from '../../util/dates';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { IUserAll } from '../../interfaces/user';
import { DialogComponent } from '../../dialog/dialog.component';
import { TranslateService } from '@ngx-translate/core';
import { MatDialog } from '@angular/material/dialog';
import { Role } from '../../interfaces/token';
import { getPriceDiscount, getUserName } from '../../util/helper';
import { transitionAnimation } from '../../interfaces/discount';

export enum ReservationIconName {
  created = 'assignment',
  approved = 'done',
  started = 'play_arrow',
  completed = 'done_all',
  cancelled = 'clear',
  edit = 'edit_calendar',
  book = 'book_online'
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
  error: any;
  changeState: any;
  professionalId: string | undefined;
  customerId: string | undefined;
  machine: any;

  displayedColumns: string[] = ['position', 'professional', 'start', 'product', 'state'];
  dataSource: any;
  pageSize = 5;
  user: IUserAll | undefined;

  priceDiscount: number | undefined;

  public paginator: MatPaginator | undefined;

  constructor(private readonly translate: TranslateService, public dialog: MatDialog, private route: ActivatedRoute,
              private store: Store<AppState>, private snackBar: MatSnackBar, private cdRef: ChangeDetectorRef, private router: Router) {
    this.getState = this.store.select(selectReservationState);
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
    return this.reservation ? getUserName(this.reservation.customer) : '';
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

  private static createAction(tooltip: string, icon: string, id: string, color: string): any {
    return {tooltip, tooltipPosition: 'below', icon, id, color};
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
    return ReservationIconName[name];
  }

  onChangeState(id: string | number): void {
    const title = this.translate.instant('RESERVATION.DETAIL.CHANGE_STATE.TITLE');
    const action = this.translate.instant(`RESERVATION.DETAIL.CHANGE_STATE.ACTION.${String(id).toUpperCase()}`);
    const content = this.translate.instant('RESERVATION.DETAIL.CHANGE_STATE.CONTENT', {action});
    const dialogRef = this.dialog.open(DialogComponent, {
      data: {title, content, value: id}
    });

    dialogRef.afterClosed().subscribe(event => {
      if (event) {
        const state = this.reservation?.state.toLowerCase();
        this.machine.transition(state, event);
      }
    });
  }

  private subscribe(): void {
    this.subscription = this.getState.subscribe(state => {
      this.isLoading = state.isLoading;
      if (state.selected) {
        this.duration = convertDuration(state.selected.product.duration);
        this.start = newDate(state.selected.start);
        this.end = createNewDate(this.start, this.start.getHours() + this.duration.hour,
          this.start.getMinutes() + this.duration.minute);
        // @ts-ignore
        this.state = ReservationIconName[state.selected.state.toLowerCase()];
        this.reservation = state.selected;
        if (this.professionalId && this.professionalId === this.reservation?.room.professional.id) {
          this.professionalMachine(this);
          this.changeState = this.machine.next(this.reservation.state.toLowerCase());
        } else if (this.customerId && this.customerId === this.reservation?.customer.id) {
          this.customerMachine(this);
          this.changeState = this.machine.next(this.reservation.state.toLowerCase());
        }
        if (this.reservation && this.reservation.product) {
          this.priceDiscount = getPriceDiscount(this.reservation.product.discount, this.reservation.product.price);
        }
        this.dataSource = new MatTableDataSource<IReservationAll>(state.selected.history);
        this.cdRef.detectChanges();
      }
      if (state.errorMessage || state.message) {
        if (state.message) {
          const id: string | null = this.route.snapshot.paramMap.get('id');
          this.getReservation(id);
        } else {
          this.error = state.error;
        }
        this.snackBar.open(state.errorMessage || state.message, 'OK', {
          duration: 5000
        });
      }
    });
  }

  private getReservation(id: string | null): void {
    this.reservation = undefined;
    this.store.dispatch(
      new fromActionsReservation.ReservationFind(id)
    );
  }

  private professionalMachine(self: this): any {
    const reservationId = self.reservation?.id;
    const initialState = self.reservation?.state;
    const store = self.store;
    const translate = self.translate;

    const approve = ReservationDetailComponent.createAction(translate.instant('RESERVATION.DETAIL.ACTION.APPROVE'),
      ReservationIconName.approved, 'approve', 'primary');
    const start = ReservationDetailComponent.createAction(translate.instant('RESERVATION.DETAIL.ACTION.START'),
      ReservationIconName.started, 'start', 'primary');
    const complete = ReservationDetailComponent.createAction(translate.instant('RESERVATION.DETAIL.ACTION.COMPLETE'),
      ReservationIconName.completed, 'complete', 'primary');
    const edit = ReservationDetailComponent.createAction(translate.instant('RESERVATION.DETAIL.ACTION.EDIT'),
      ReservationIconName.edit, 'edit', 'accent');
    const cancel = ReservationDetailComponent.createAction(translate.instant('RESERVATION.DETAIL.ACTION.CANCEL'),
      ReservationIconName.cancelled, 'cancel', 'warn');
    const book = ReservationDetailComponent.createAction(translate.instant('RESERVATION.DETAIL.ACTION.BOOK'),
      ReservationIconName.book, 'book', 'primary');

    const approveTransaction = ReservationDetailComponent.createTransaction('approved', (): void => {
      self.reservation = undefined;
      store.dispatch(
        new fromActionsReservation.Approve(reservationId)
      );
    });

    const startTransaction = ReservationDetailComponent.createTransaction('approved', (): void => {
      self.reservation = undefined;
      store.dispatch(
        new fromActionsReservation.Start(reservationId)
      );
    });

    const editTransaction = ReservationDetailComponent.createTransaction('started', (): void => {
      self.router.navigate(['reservation', reservationId, 'edit']);
    });

    const completeTransaction = ReservationDetailComponent.createTransaction('cancelled', (): void => {
      self.reservation = undefined;
      self.store.dispatch(
        new fromActionsReservation.Complete(reservationId)
      );
    });

    const cancelTransaction = ReservationDetailComponent.createTransaction('completed', (): void => {
      self.reservation = undefined;
      self.store.dispatch(
        new fromActionsReservation.Cancel(reservationId)
      );
    });

    const bookTransaction = ReservationDetailComponent.createTransaction('booked', (): void => {
      const customer = self.reservation?.customer;
      const room = self.reservation?.room;
      const product = self.reservation?.product;
      const data = {customer, room, product};
      this.router.navigateByUrl('/reservation', {state: data});
    });

    this.machine = ReservationDetailComponent.createMachine({
      initialState: ReservationIconName.created,
      created: {
        transitions: {
          approve: approveTransaction,
          cancel: cancelTransaction,
          edit: editTransaction
        },
        next: [approve, edit, cancel]
      },
      approved: {
        transitions: {
          start: startTransaction,
          cancel: cancelTransaction,
          edit: editTransaction
        },
        next: [start, edit, cancel]
      },
      started: {
        transitions: {
          complete: completeTransaction
        },
        next: [complete]
      },
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

  private customerMachine(self: this): any {
    const reservationId = self.reservation?.id;
    const initialState = self.reservation?.state;
    const translate = self.translate;

    const edit = ReservationDetailComponent.createAction(translate.instant('RESERVATION.DETAIL.ACTION.EDIT'),
      ReservationIconName.edit, 'edit', 'accent');
    const cancel = ReservationDetailComponent.createAction(translate.instant('RESERVATION.DETAIL.ACTION.CANCEL'),
      ReservationIconName.cancelled, 'cancel', 'warn');
    const book = ReservationDetailComponent.createAction(translate.instant('RESERVATION.DETAIL.ACTION.BOOK'),
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
      this.router.navigateByUrl('/me/reservation', {state: data});
    });

    this.machine = ReservationDetailComponent.createMachine({
      initialState: ReservationIconName.created,
      created: {
        transitions: {
          cancel: cancelTransaction,
          edit: editTransaction
        },
        next: [edit, cancel]
      },
      approved: {
        transitions: {
          edit: editTransaction,
          cancel: cancelTransaction
        },
        next: [edit, cancel]
      },
      started: {
        next: []
      },
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
