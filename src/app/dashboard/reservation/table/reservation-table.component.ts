import { ChangeDetectionStrategy, Component, computed, effect, inject, input, viewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort, MatSortHeader } from '@angular/material/sort';
import { createMatTableState } from 'src/app/util/mat-table-state';
import { Store } from '@ngrx/store';
import { deleteReservation, getPage } from '../../../store/actions/reservation.actions';
import { IReservation, IReservationAll } from '../../../reservation/reservation';
import { MOBILE_PAGE_SIZE, PAGE_SIZE } from '../../../interfaces/pagination';
import { DialogComponent } from '../../../shared/dialog/generic/dialog.component';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { MatDialog } from '@angular/material/dialog';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { executeDialogNoWidth, openDialog } from '../../../util/helper';
import { isSameTimeZone, newDateTimestamp } from '../../../util/dates';
import { AuthUserService } from '../../../services/auth-user.service';
import { TimeDetailPipe } from '../../../pipes/time-detail.pipe';
import { ReservationIconPipe } from '../../../pipes/reservation-icon.pipe';
import { ErrorComponent } from '../../../shared/error/error.component';
import {
  getReservationErrorPipe,
  getReservationPaginationPipe,
  selectReservationIsLoading,
} from '../../../store/selectors/reservation.selectors';
import { toSignal } from '@angular/core/rxjs-interop';
import { ReservationState } from '../../../store/reducers/reservation.reducers';
import { MatPrefix } from '@angular/material/input';
import { MatIcon } from '@angular/material/icon';
import { MatList, MatListItem, MatListItemIcon } from '@angular/material/list';
import { MatIconButton } from '@angular/material/button';
import { ReactiveFormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import {
  MatCell,
  MatCellDef,
  MatColumnDef,
  MatFooterCell, MatFooterCellDef,
  MatFooterRow,
  MatFooterRowDef,
  MatHeaderCell,
  MatHeaderCellDef,
  MatHeaderRow,
  MatHeaderRowDef,
  MatRow,
  MatRowDef,
  MatTable,
} from '@angular/material/table';
import { MatTooltip } from '@angular/material/tooltip';
import { TableSkeletonColumn, TableSkeletonComponent } from '../../../shared/skeleton/table-skeleton.component';

@Component({
  selector: 'app-reservation-table',
  templateUrl: './reservation-table.component.html',
  styleUrls: ['./reservation-table.component.scss'],
  imports: [TimeDetailPipe, ReservationIconPipe, ErrorComponent, TimeDetailPipe, MatIcon, MatList, MatListItem,
    MatIconButton, ReactiveFormsModule, TranslatePipe, RouterLink, DatePipe, MatTable, MatSort, MatHeaderCell,
    MatCellDef, MatHeaderCellDef, MatColumnDef, MatCell, MatPrefix, MatTooltip, MatListItemIcon, MatFooterCell,
    MatHeaderRow, MatRow, MatFooterRow, MatPaginator, MatHeaderRowDef, MatRowDef, MatFooterRowDef, MatSortHeader,
    MatFooterCellDef, TableSkeletonComponent],
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
  private tableState = createMatTableState(this.paginator, this.sort, 'timestamp', 'desc');

  private reservationListSignal = toSignal(this.reservationList$);
  private loadingSignal = toSignal(this.store.select(selectReservationIsLoading), { initialValue: false });
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
  errorSignal = toSignal(this.error$);
  paginatorPageIndex = this.tableState.pageIndex;

  hasAdminRole = computed(() => this.authUserSignal().hasAdminRole);
  isLoading = computed(() => this.loadingSignal());
  dataSourceSignal = computed(() => this.reservationListSignal()?.content);
  resultsLengthSignal = computed(() => this.reservationListSignal()?.totalElements || 0);
  pageSizeSignal = computed(() => this.breakpointsSignal()?.matches ? MOBILE_PAGE_SIZE : PAGE_SIZE);

  tableColumns: TableSkeletonColumn[] = [
    { key: 'position' },
    { key: 'customer' },
    { key: 'professional', hideOnMobile: true },
    { key: 'timestamp', hideOnMobile: true },
    { key: 'treatment', hideOnMobile: true },
    { key: 'state', hideOnMobile: true },
    { key: 'actions', hideOnMobile: true },
  ];
  displayedColumns: string[] = this.tableColumns.map((column) => column.key);
  expanded?: IReservationAll;

  dateFormat: string = this.translate.getCurrentLang();
  language: string = this.translate.getCurrentLang();

  constructor() {
    effect(() => {
      const request = this.tableState.baseRequest();
      this.store.dispatch(
        getPage({
          ...request,
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

    executeDialogNoWidth(this.dialog, DialogComponent, { title, content, value: reservation, variant: 'warning' },
      result => {
        if (result) {
          this.store.dispatch(
            deleteReservation({ id: result.id, timestamp: result.timestamp, timeZone: result.room.timeZone }),
          );
        }
      });
  };
}
