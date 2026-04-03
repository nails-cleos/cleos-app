import { ChangeDetectionStrategy, Component, computed, effect, inject, input, signal, viewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { Store } from '@ngrx/store';
import { deleteReservation, getPage } from '../../../store/reservation.actions';
import { IReservation, IReservationAll } from '../../../interfaces/reservation';
import { MOBILE_PAGE_SIZE, PAGE_SIZE } from '../../../interfaces/pagination';
import { DialogComponent } from '../../../shared/dialog/generic/dialog.component';
import { TranslateService } from '@ngx-translate/core';
import { MatDialog } from '@angular/material/dialog';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { executeDialogNoWidth, openDialog } from '../../../util/helper';
import { isSameTimeZone, newDateTimestamp } from '../../../util/dates';
import { AuthUserService } from '../../../services/auth-user.service';
import { SharedModule } from '../../../shared/shared.module';
import { TimeDetailPipe } from '../../../pipes/time-detail.pipe';
import { ReservationIconPipe } from '../../../pipes/reservation-icon.pipe';
import { ErrorComponent } from '../../../shared/error/error.component';
import { getReservationErrorPipe, getReservationPaginationPipe } from '../../../store/selectors/reservation.selectors';
import { toSignal } from '@angular/core/rxjs-interop';
import { ReservationState } from '../../../store/reducers/reservation.reducers';

@Component({
  selector: 'app-reservation-table',
  templateUrl: './reservation-table.component.html',
  styleUrls: ['./reservation-table.component.scss'],
  imports: [SharedModule, TimeDetailPipe, ReservationIconPipe, ErrorComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReservationTableComponent {
  roomId = input<string>();
  professionalId = input<string>();
  all = input<boolean>(false);

  private readonly breakpointObserver: BreakpointObserver = inject(BreakpointObserver);
  private readonly store: Store<ReservationState> = inject(Store<ReservationState>);
  private readonly translate: TranslateService = inject(TranslateService);
  private readonly dialog: MatDialog = inject(MatDialog);
  private readonly authUserService: AuthUserService = inject(AuthUserService);

  private breakpointObserver$ = this.breakpointObserver.observe([Breakpoints.XSmall, Breakpoints.Small]);
  private reservationList$ = this.store.pipe(getReservationPaginationPipe);
  private error$ = this.store.pipe(getReservationErrorPipe);

  private paginator = viewChild(MatPaginator);
  private sort = viewChild(MatSort);

  private reservationListSignal = toSignal(this.reservationList$);
  private authUserSignal = this.authUserService.authUser;
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
  private sortActive = computed(() => this.sort()?.active ?? 'timestamp');

  private sortDirection = computed(() => this.sort()?.direction ?? 'desc');

  errorSignal = toSignal(this.error$);
  paginatorPageIndex = signal(0);

  hasAdminRole = computed(() => this.authUserSignal().hasAdminRole);
  dataSourceSignal = computed(() => this.reservationListSignal()?.content);
  resultsLengthSignal = computed(() => this.reservationListSignal()?.totalElements || 0);
  pageSizeSignal = computed(() => this.breakpointsSignal()?.matches ? MOBILE_PAGE_SIZE : PAGE_SIZE);

  displayedColumns: string[] = ['position', 'customer', 'professional', 'timestamp', 'treatment', 'state', 'actions'];
  expanded?: IReservationAll;

  dateFormat: string = this.translate.getCurrentLang();
  language: string = this.translate.getCurrentLang();

  constructor() {
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
      const page = this.paginatorPageIndex();
      this.store.dispatch(
        getPage({
          page,
          sort: this.sortActive(),
          direction: this.sortDirection(),
          size: this.pageSizeSignal(),
          roomId: this.roomId(),
          all: this.all(),
          professionalId: this.professionalId(),
        }),
      );
    });
  }

  showTimeZone = (reservation: IReservationAll): boolean => !isSameTimeZone(reservation.room.timeZone);

  openDialog = (reservation: IReservationAll): void => {
    const time = newDateTimestamp(reservation.timestamp);
    openDialog(reservation.room, this.dateFormat, this.translate, this.dialog, time);
  };

  delete = (reservation: IReservation): void => {
    const title = this.translate.instant('RESERVATION.DELETED.TITLE');
    const content = this.translate.instant('RESERVATION.DELETED.CONTENT',
      { date: newDateTimestamp(reservation.timestamp) });

    executeDialogNoWidth(this.dialog, DialogComponent, { title, content, value: reservation }, result => {
      if (result) {
        this.store.dispatch(
          deleteReservation({ id: result.id, timestamp: result.timestamp, timeZone: result.room.timeZone }),
        );
      }
    });
  };
}
