import { AfterViewInit, ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Store } from '@ngrx/store';
import { AppState, selectReservationState } from '../../store/app.states';
import { Observable, Subscription } from 'rxjs';
import * as fromActionsReservation from '../../store/reservation.actions';
import { IReservationAll } from '../../interfaces/reservation';
import { ActivatedRoute } from '@angular/router';
import { ConvertDuration, Duration, IDuration } from '../../util/dates';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { IUserAll } from '../../interfaces/user';
import { DialogComponent } from '../../dialog/dialog.component';
import { TranslateService } from '@ngx-translate/core';
import { MatDialog } from '@angular/material/dialog';

export enum ReservationIconName {
  CREATED = 'assignment',
  APPROVED = 'done',
  STARTED = 'play_arrow',
  COMPLETED = 'done_all',
  CANCELLED = 'clear'
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

  public paginator: MatPaginator | undefined;

  constructor(private readonly translate: TranslateService, public dialog: MatDialog, private route: ActivatedRoute,
              private store: Store<AppState>, private snackBar: MatSnackBar, private cdRef: ChangeDetectorRef) {
    this.getState = this.store.select(selectReservationState);
    const userLang = this.translate.currentLang;
    this.language = userLang;
    const index = userLang.indexOf('-');
    this.locale = index === -1 ? userLang : userLang.substr(0, index);

    const token = localStorage.getItem('auth');
    if (token) {
      const user: IUserAll = JSON.parse(token).user;
      this.professionalId = user.id;
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
      transition(currentState: any, event: any): any {
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
      next(currentState: any): any {
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
        const state = this.reservation?.state;
        this.reservation = undefined;
        this.machine.transition(state, event);
      }
    });
  }

  private subscribe(): void {
    this.subscription = this.getState.subscribe(state => {
      this.isLoading = state.isLoading;
      if (state.selected) {
        this.duration = ConvertDuration(state.selected.product.duration);
        this.start = new Date(state.selected.start);
        this.end = new Date(new Date(state.selected.start).setHours(this.start.getHours() + this.duration.hour,
          this.start.getMinutes() + this.duration.minute));
        // @ts-ignore
        this.state = ReservationIconName[state.selected.state];
        this.reservation = state.selected;
        if (this.professionalId && this.professionalId === this.reservation?.room.professional.id) {
          this.setupMachine(this.reservation.id, this.store, this.translate, this.reservation?.state);
          this.changeState = this.machine.next(this.reservation.state);
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

  private setupMachine(reservationId: string, store: Store<AppState>, translate: TranslateService, initialState: string): void {
    this.machine = ReservationDetailComponent.createMachine({
      initialState: ReservationIconName.CREATED,
      CREATED: {
        transitions: {
          approve: {
            target: 'APPROVED',
            action(): void {
              store.dispatch(
                new fromActionsReservation.Approve(reservationId)
              );
            }
          },
          cancel: {
            target: 'CANCELLED',
            action(): void {
              store.dispatch(
                new fromActionsReservation.Cancel(reservationId)
              );
            }
          }
        },
        next: [{
          tooltip: translate.instant('RESERVATION.DETAIL.ACTION.APPROVE'),
          tooltipPosition: 'below',
          icon: ReservationIconName.APPROVED,
          id: 'approve',
          color: 'accent'
        }, {
          tooltip: translate.instant('RESERVATION.DETAIL.ACTION.CANCEL'),
          tooltipPosition: 'below',
          icon: ReservationIconName.CANCELLED,
          id: 'cancel',
          color: 'warn'
        }]
      },
      APPROVED: {
        transitions: {
          start: {
            target: 'STARTED',
            action(): void {
              store.dispatch(
                new fromActionsReservation.Start(reservationId)
              );
            }
          },
          cancel: {
            target: 'CANCELLED',
            action(): void {
              store.dispatch(
                new fromActionsReservation.Cancel(reservationId)
              );
            }
          }
        },
        next: [{
          tooltip: translate.instant('RESERVATION.DETAIL.ACTION.START'),
          tooltipPosition: 'below',
          icon: ReservationIconName.STARTED,
          id: 'start',
          color: 'accent'
        }, {
          tooltip: translate.instant('RESERVATION.DETAIL.ACTION.CANCEL'),
          tooltipPosition: 'below',
          icon: ReservationIconName.CANCELLED,
          id: 'cancel',
          color: 'warn'
        }]
      },
      STARTED: {
        transitions: {
          complete: {
            target: 'COMPLETED',
            action(): void {
              store.dispatch(
                new fromActionsReservation.Complete(reservationId)
              );
            }
          }
        },
        next: [{
          tooltip: translate.instant('RESERVATION.DETAIL.ACTION.COMPLETE'),
          tooltipPosition: 'below',
          icon: ReservationIconName.COMPLETED,
          id: 'complete',
          color: 'accent'
        }]
      },
      COMPLETED: {
        next: []
      },
      CANCELLED: {
        next: []
      }
    }, initialState);
  }
}
