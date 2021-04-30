import { ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Store } from '@ngrx/store';
import { AppState, selectReservationState } from '../../store/app.states';
import { Observable, Subscription } from 'rxjs';
import * as fromActionsReservation from '../../store/reservation.actions';
import { IReservationAll } from '../../interfaces/reservation';
import { ActivatedRoute, Router } from '@angular/router';
import { convertDuration, Duration, IDuration } from '../../util/dates';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { IUserAll } from '../../interfaces/user';
import { DialogComponent } from '../../dialog/dialog.component';
import { TranslateService } from '@ngx-translate/core';
import { MatDialog } from '@angular/material/dialog';
import { Role } from '../../interfaces/token';

export enum ReservationIconName {
  created = 'assignment',
  approved = 'done',
  started = 'play_arrow',
  completed = 'done_all',
  cancelled = 'clear',
  edit = 'edit'
}

@Component({
  selector: 'app-reservation-detail',
  templateUrl: './reservation-detail.component.html',
  styleUrls: ['./reservation-detail.component.scss']
})
export class ReservationDetailComponent implements OnInit, OnDestroy {
  getState: Observable<any>;
  subscription: Subscription | undefined;
  reservation: IReservationAll | undefined;
  duration: IDuration = new Duration();
  start: Date = new Date();
  end: Date = new Date();
  state: string | undefined;

  locale: string;
  language: string;
  isLoading = false;
  error: any;
  changeState: any;
  professionalId: string | undefined;
  machine: any;

  displayedColumns: string[] = ['position', 'professional', 'start', 'product', 'state'];
  dataSource: any;
  pageSize = 5;
  user: IUserAll | undefined;

  public paginator: MatPaginator | undefined;

  constructor(private readonly translate: TranslateService, public dialog: MatDialog, private route: ActivatedRoute,
              private store: Store<AppState>, private snackBar: MatSnackBar, private cdRef: ChangeDetectorRef, private router: Router) {
    this.getState = this.store.select(selectReservationState);
    const userLang = this.translate.currentLang;
    this.language = userLang;
    const index = userLang.indexOf('-');
    this.locale = index === -1 ? userLang : userLang.substr(0, index);

    const token = localStorage.getItem('auth');
    if (token) {
      const user: IUserAll = JSON.parse(token).user;
      this.professionalId = user.authorities.some(u => u.authority === Role.professional) ? user.id : undefined;
      this.user = user;
    }
  }

  @ViewChild(MatPaginator) set matPaginator(mp: MatPaginator) {
    this.paginator = mp;
    if (this.dataSource) {
      this.dataSource.paginator = this.paginator;
    }
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
        this.start = new Date(state.selected.start);
        this.end = new Date(new Date(state.selected.start).setHours(this.start.getHours() + this.duration.hour,
          this.start.getMinutes() + this.duration.minute));
        // @ts-ignore
        this.state = ReservationIconName[state.selected.state.toLowerCase()];
        this.reservation = state.selected;
        if (this.professionalId && this.professionalId === this.reservation?.room.professional.id) {
          this.setupMachine(this);
          this.changeState = this.machine.next(this.reservation.state.toLowerCase());
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

  private setupMachine(self: this): void {
    const reservationId = self.reservation?.id;
    const initialState = self.reservation?.state;
    const store = self.store;
    const translate = self.translate;
    this.machine = ReservationDetailComponent.createMachine({
      initialState: ReservationIconName.created,
      created: {
        transitions: {
          approve: {
            target: 'approved',
            action: (): void => {
              self.reservation = undefined;
              store.dispatch(
                new fromActionsReservation.Approve(reservationId)
              );
            }
          },
          cancel: {
            target: 'cancelled',
            action: (): void => {
              self.reservation = undefined;
              store.dispatch(
                new fromActionsReservation.Cancel(reservationId)
              );
            }
          },
          edit: {
            target: 'edited',
            action: (): void => {
              const data = {editReservation: {reservation: self.reservation, user: self.user}};
              self.router.navigateByUrl('/reservation', {state: data});
            }
          }
        },
        next: [{
          tooltip: translate.instant('RESERVATION.DETAIL.ACTION.APPROVE'),
          tooltipPosition: 'below',
          icon: ReservationIconName.approved,
          id: 'approve',
          color: 'accent'
        }, {
          tooltip: translate.instant('RESERVATION.DETAIL.ACTION.EDIT'),
          tooltipPosition: 'below',
          icon: ReservationIconName.edit,
          id: 'edit',
          color: 'accent'
        }, {
          tooltip: translate.instant('RESERVATION.DETAIL.ACTION.CANCEL'),
          tooltipPosition: 'below',
          icon: ReservationIconName.cancelled,
          id: 'cancel',
          color: 'warn'
        }]
      },
      approved: {
        transitions: {
          start: {
            target: 'started',
            action: (): void => {
              self.reservation = undefined;
              store.dispatch(
                new fromActionsReservation.Start(reservationId)
              );
            }
          },
          cancel: {
            target: 'cancelled',
            action: (): void => {
              self.reservation = undefined;
              store.dispatch(
                new fromActionsReservation.Cancel(reservationId)
              );
            }
          },
          edit: {
            target: 'edited',
            action: (): void => {
              const data = {editReservation: {reservation: self.reservation, user: self.user}};
              self.router.navigateByUrl('/reservation', {state: data});
            }
          }
        },
        next: [{
          tooltip: translate.instant('RESERVATION.DETAIL.ACTION.START'),
          tooltipPosition: 'below',
          icon: ReservationIconName.started,
          id: 'start',
          color: 'accent'
        }, {
          tooltip: translate.instant('RESERVATION.DETAIL.ACTION.EDIT'),
          tooltipPosition: 'below',
          icon: ReservationIconName.edit,
          id: 'edit',
          color: 'accent'
        }, {
          tooltip: translate.instant('RESERVATION.DETAIL.ACTION.CANCEL'),
          tooltipPosition: 'below',
          icon: ReservationIconName.cancelled,
          id: 'cancel',
          color: 'warn'
        }]
      },
      started: {
        transitions: {
          complete: {
            target: 'completed',
            action: (): void => {
              self.reservation = undefined;
              store.dispatch(
                new fromActionsReservation.Complete(reservationId)
              );
            }
          }
        },
        next: [{
          tooltip: translate.instant('RESERVATION.DETAIL.ACTION.COMPLETE'),
          tooltipPosition: 'below',
          icon: ReservationIconName.completed,
          id: 'complete',
          color: 'accent'
        }]
      },
      completed: {
        next: []
      },
      cancelled: {
        next: []
      }
    }, initialState);
  }
}
