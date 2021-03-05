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
import { IProduct } from '../../interfaces/product';
import { DialogComponent } from '../../dialog/dialog.component';
import * as fromActionsProduct from '../../store/product.actions';
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
export class ReservationDetailComponent implements OnInit, OnDestroy, AfterViewInit {
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
    const userLang = navigator.language;
    const index = userLang.indexOf('-');
    this.language = userLang;
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

  ngOnInit(): void {
    this.subscribe();
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }

  ngAfterViewInit(): void {
    this.getReservation();
  }

  getIcon(name: any): any {
    // @ts-ignore
    return ReservationIconName[name];
  }

  onChangeState(id: string): void {
    const title = this.translate.instant('RESERVATION.DETAIL.CHANGE_STATE.TITLE');
    const action = this.translate.instant(`RESERVATION.DETAIL.CHANGE_STATE.ACTION.${id.toUpperCase()}`);
    const content = this.translate.instant('RESERVATION.DETAIL.CHANGE_STATE.CONTENT', {action});
    const dialogRef = this.dialog.open(DialogComponent, {
      data: {title, content, value: id}
    });

    dialogRef.afterClosed().subscribe(event => {
      if (event) {
        this.machine.transition(this.reservation?.state, event);
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
          this.setupMachine(this.reservation.id, this.store, this.translate);
          this.changeState = this.machine.next(this.reservation.state);
        }
        this.dataSource = new MatTableDataSource<IReservationAll>(state.selected.history);
        this.cdRef.detectChanges();
      }
      if (state.errorMessage || state.message) {
        const snack = this.snackBar.open(state.errorMessage || state.message, 'OK', {
          duration: 5000
        });
        snack.afterDismissed().subscribe(() => window.location.reload());
      }
    });
  }

  private getReservation(): void {
    if (!this.reservation) {
      const id = this.route.snapshot.paramMap.get('id');
      this.store.dispatch(
        new fromActionsReservation.ReservationFind(id)
      );
    }
  }

  private createMachine(stateMachineDefinition: any, initialState: any): any {
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

  private setupMachine(reservationId: string, store: Store<AppState>, translate: TranslateService): void {
    this.machine = this.createMachine({
      initialState: ReservationIconName.CREATED,
      CREATED: {
        transitions: {
          approve: {
            target: 'APPROVED',
            action(): void {
              store.dispatch(
                new fromActionsReservation.Approve(reservationId)
              );
              console.log('transition action for "approve" in "CREATED" state');
            }
          },
          cancel: {
            target: 'CANCELLED',
            action(): void {
              store.dispatch(
                new fromActionsReservation.Cancel(reservationId)
              );
              console.log('transition action for "cancel" in "CREATED" state');
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
              console.log('transition action for "start" in "APPROVED" state');
            }
          },
          cancel: {
            target: 'CANCELLED',
            action(): void {
              store.dispatch(
                new fromActionsReservation.Cancel(reservationId)
              );
              console.log('transition action for "cancel" in "CREATED" state');
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
              console.log('transition action for "start" in "APPROVED" state');
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
    }, this.reservation?.state);
  }
}
