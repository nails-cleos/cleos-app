import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  input,
  viewChild,
} from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort, MatSortHeader } from '@angular/material/sort';
import { createMatTableState } from '@app/util/mat-table-state';
import { IReservation, IReservationAll } from '@app/reservation/reservation';
import { MOBILE_PAGE_SIZE, PAGE_SIZE } from '@app/interfaces/pagination';
import { DialogComponent } from '@app/shared/dialog/generic/dialog.component';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { MatDialog } from '@angular/material/dialog';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { executeDialogNoWidth, openDialog } from '@app/util/helper';
import { isSameTimeZone, newDateTimestamp } from '@app/util/dates';
import { AuthUserService } from '@app/services/auth-user.service';
import { TimeDetailPipe } from '@app/pipes/time-detail.pipe';
import { ReservationIconPipe } from '@app/pipes/reservation-icon.pipe';
import { ErrorComponent } from '@app/shared/error/error.component';
import { toSignal } from '@angular/core/rxjs-interop';
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
} from '@angular/material/table';
import { MatTooltip } from '@angular/material/tooltip';
import {
  TableSkeletonColumn,
  TableSkeletonComponent,
} from '@app/shared/skeleton/table-skeleton.component';
import { NavigationService } from '@app/services/navigation.service';
import { ReservationStore } from '@app/store/reservation.store';

@Component({
  selector: 'app-reservation-table',
  templateUrl: './reservation-table.component.html',
  styleUrls: ['./reservation-table.component.scss'],
  imports: [
    TimeDetailPipe,
    ReservationIconPipe,
    ErrorComponent,
    MatIcon,
    MatList,
    MatListItem,
    MatIconButton,
    ReactiveFormsModule,
    TranslatePipe,
    RouterLink,
    DatePipe,
    MatTable,
    MatSort,
    MatHeaderCell,
    MatCellDef,
    MatHeaderCellDef,
    MatColumnDef,
    MatCell,
    MatPrefix,
    MatTooltip,
    MatListItemIcon,
    MatFooterCell,
    MatHeaderRow,
    MatRow,
    MatFooterRow,
    MatPaginator,
    MatHeaderRowDef,
    MatRowDef,
    MatFooterRowDef,
    MatSortHeader,
    MatFooterCellDef,
    TableSkeletonComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReservationTableComponent {
  roomId = input<string>();
  professionalId = input<string>();
  all = input<boolean>(false);

  private readonly breakpointObserver: BreakpointObserver =
    inject(BreakpointObserver);
  private readonly reservationStore = inject(ReservationStore);
  private readonly navigationService: NavigationService =
    inject(NavigationService);
  private readonly translateService: TranslateService =
    inject(TranslateService);
  private readonly dialog: MatDialog = inject(MatDialog);
  private readonly authUserService: AuthUserService = inject(AuthUserService);

  private breakpointObserver$ = this.breakpointObserver.observe([
    Breakpoints.XSmall,
    Breakpoints.Small,
  ]);

  private paginator = viewChild(MatPaginator);
  private sort = viewChild(MatSort);
  readonly tableState = createMatTableState(
    this.paginator,
    this.sort,
    'timestamp',
    'desc',
  );

  private reservationListSignal = computed(() => {
    const data = this.reservationStore.data();
    return data?.kind === 'pagination' ? data.value : undefined;
  });
  private loadingSignal = this.reservationStore.isLoading;
  private authUserSignal = this.authUserService.authUser;
  private breakpointsSignal = toSignal(this.breakpointObserver$, {
    initialValue: {
      matches: false,
      breakpoints: {
        [Breakpoints.XSmall]: false,
        [Breakpoints.Small]: false,
      },
    },
  });
  errorSignal = this.reservationStore.error;
  paginatorPageIndex = this.tableState.pageIndex;

  hasAdminRole = computed(() => this.authUserSignal().hasAdminRole);
  isLoading = computed(() => this.loadingSignal());
  dataSourceSignal = computed(() => this.reservationListSignal()?.content);
  resultsLengthSignal = computed(
    () => this.reservationListSignal()?.totalElements || 0,
  );
  pageSizeSignal = computed(() =>
    this.breakpointsSignal()?.matches ? MOBILE_PAGE_SIZE : PAGE_SIZE,
  );

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

  readonly language = this.navigationService.language;

  constructor() {
    effect(() => {
      const request = this.tableState.baseRequest();
      this.reservationStore.loadPage({
        ...request,
        size: this.pageSizeSignal(),
        roomId: this.roomId(),
        all: this.all(),
        professionalId: this.professionalId(),
      });
    });
  }

  showTimeZone = (reservation: IReservationAll): boolean =>
    !isSameTimeZone(reservation.room.timeZone);

  openDialog = (reservation: IReservationAll): void => {
    const time = newDateTimestamp(reservation.timestamp);
    openDialog(
      reservation.room,
      this.language,
      this.translateService,
      this.dialog,
      time,
    );
  };

  delete = (reservation: IReservation): void => {
    const title = this.translateService.instant('RESERVATION.DELETED.TITLE');
    const content = this.translateService.instant(
      'RESERVATION.DELETED.CONTENT',
      { date: newDateTimestamp(reservation.timestamp) },
    );

    executeDialogNoWidth(
      this.dialog,
      DialogComponent,
      { title, content, value: reservation, variant: 'warning' },
      (result) => {
        if (result) {
          this.reservationStore.delete(
            result.id,
            result.timestamp,
            result.room.timeZone,
          );
        }
      },
    );
  };
}
