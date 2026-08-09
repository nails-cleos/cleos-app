import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  viewChild,
} from '@angular/core';
import { MOBILE_PAGE_SIZE, PAGE_SIZE } from '@app/interfaces/pagination';
import { IAvailability, IRoom, IRoomAll } from '../room';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort, MatSortHeader } from '@angular/material/sort';
import { createMatTableState } from '@app/util/mat-table-state';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { MatDialog } from '@angular/material/dialog';
import { DialogComponent } from '@app/shared/dialog/generic/dialog.component';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { findDayOfWeek, getTimeZone, ITimeZone } from '@app/util/dates';
import { executeDialogNoWidth } from '@app/util/helper';
import { SortByPipe } from '@app/pipes/sort-by.pipe';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatIcon } from '@angular/material/icon';
import { MatIconButton } from '@angular/material/button';
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
  MatList,
  MatListItem,
  MatListItemIcon,
  MatListSubheaderCssMatStyler,
} from '@angular/material/list';
import { RouterLink } from '@angular/router';
import { RoomStore } from '@app/store/room.store';
import {
  TableSkeletonColumn,
  TableSkeletonComponent,
} from '@app/shared/skeleton/table-skeleton.component';
import { NavigationService } from '@app/services/navigation.service';

@Component({
  selector: 'app-room-list',
  templateUrl: './room-list.component.html',
  styleUrls: ['./room-list.component.scss'],
  imports: [
    MatIcon,
    MatList,
    MatListItem,
    MatListSubheaderCssMatStyler,
    MatIconButton,
    TranslatePipe,
    RouterLink,
    MatTable,
    MatSort,
    MatColumnDef,
    MatHeaderCellDef,
    MatHeaderCell,
    MatCellDef,
    MatCell,
    MatSortHeader,
    MatTooltip,
    MatListItemIcon,
    MatFooterCellDef,
    MatFooterCell,
    MatHeaderRowDef,
    MatHeaderRow,
    MatRowDef,
    MatRow,
    MatFooterRow,
    MatFooterRowDef,
    MatPaginator,
    SortByPipe,
    TableSkeletonComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RoomListComponent {
  private readonly breakpointObserver: BreakpointObserver =
    inject(BreakpointObserver);
  private readonly roomStore = inject(RoomStore);
  private readonly translateService: TranslateService =
    inject(TranslateService);
  private readonly navigationService: NavigationService =
    inject(NavigationService);
  private readonly dialog: MatDialog = inject(MatDialog);

  private breakpointObserver$ = this.breakpointObserver.observe([
    Breakpoints.XSmall,
    Breakpoints.Small,
  ]);

  private paginator = viewChild(MatPaginator);
  private sort = viewChild(MatSort);
  private tableState = createMatTableState(
    this.paginator,
    this.sort,
    'office',
    'asc',
  );

  private breakpointsSignal = toSignal(this.breakpointObserver$, {
    initialValue: {
      matches: false,
      breakpoints: {
        [Breakpoints.XSmall]: false,
        [Breakpoints.Small]: false,
      },
    },
  });

  paginatorPageIndex = this.tableState.pageIndex;
  isLoading = this.roomStore.isLoading;
  private roomListSignal = computed(() => {
    const data = this.roomStore.data();
    return data?.kind === 'pagination' ? data.value : undefined;
  });
  dataSourceSignal = computed(() =>
    this.roomListSignal()?.content?.map((room: IRoom) => {
      if (room && room.availabilities && room.availabilities.length) {
        const availabilities = room.availabilities.map((i: IAvailability) =>
          Object.assign({}, i, { order: findDayOfWeek(i.day) }),
        );
        return Object.assign({}, room, { availabilities });
      }
      return room;
    }),
  );
  resultsLengthSignal = computed(
    () => this.roomListSignal()?.totalElements || 0,
  );
  pageSizeSignal = computed(() =>
    this.breakpointsSignal()?.matches ? MOBILE_PAGE_SIZE : PAGE_SIZE,
  );

  tableColumns: TableSkeletonColumn[] = [
    { key: 'position' },
    { key: 'currency', hideOnMobile: true },
    { key: 'office', hideOnMobile: true },
    { key: 'address' },
    { key: 'timeZone', hideOnMobile: true },
    { key: 'availability', hideOnMobile: true },
    { key: 'actions', hideOnMobile: true },
  ];
  displayedColumns: string[] = this.tableColumns.map((column) => column.key);
  expanded?: IRoom;

  readonly language: string = this.navigationService.language;

  constructor() {
    this.roomStore.clean();

    effect(() => {
      const request = this.tableState.baseRequest();
      this.roomStore.loadPage({
        ...request,
        size: this.pageSizeSignal(),
      });
    });
    this.tableState.resetOn(this.roomStore.response, () =>
      this.roomStore.clean(),
    );
  }

  getTimeZone = (timeZone?: string): ITimeZone => getTimeZone(timeZone);

  getGMT = (timeZone?: string): string => this.getTimeZone(timeZone).gmt;

  edit = (selected: IRoomAll): void =>
    this.roomStore.selectAndNavigate(selected);

  delete = (room: IRoom): void => {
    const title = this.translateService.instant('ROOM.DELETED.TITLE');
    const content = this.translateService.instant('ROOM.DELETED.CONTENT', {
      name: room.address?.name,
    });
    executeDialogNoWidth(
      this.dialog,
      DialogComponent,
      { title, content, value: room, variant: 'warning' },
      (result) => {
        if (result) {
          this.roomStore.delete(result);
        }
      },
    );
  };
}
