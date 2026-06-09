import { ChangeDetectionStrategy, Component, computed, effect, inject, viewChild } from '@angular/core';
import { MOBILE_PAGE_SIZE, PAGE_SIZE } from '../../interfaces/pagination';
import { IAvailability, IRoom, IRoomAll } from '../room';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort, MatSortHeader } from '@angular/material/sort';
import { createMatTableState } from 'src/app/util/mat-table-state';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { MatDialog } from '@angular/material/dialog';
import { DialogComponent } from '../../shared/dialog/generic/dialog.component';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { findDayOfWeek, getTimeZone, ITimeZone } from '../../util/dates';
import { executeDialogNoWidth } from '../../util/helper';
import { SortByPipe } from '../../pipes/sort-by.pipe';
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
import { MatList, MatListItem, MatListItemIcon, MatListSubheaderCssMatStyler } from '@angular/material/list';
import { RouterLink } from '@angular/router';
import { RoomStore } from '../../store/room.store';

@Component({
  selector: 'app-room-list',
  templateUrl: './room-list.component.html',
  styleUrls: ['./room-list.component.scss'],
  imports: [MatIcon, MatList, MatListItem, MatListSubheaderCssMatStyler, MatIconButton,
    TranslatePipe, RouterLink, MatTable, MatSort, MatColumnDef, MatHeaderCellDef, MatHeaderCell, MatCellDef, MatCell,
    MatSortHeader, MatTooltip, MatListItemIcon, MatFooterCellDef, MatFooterCell, MatHeaderRowDef, MatHeaderRow,
    MatRowDef, MatRow, MatFooterRow, MatFooterRowDef, MatPaginator, SortByPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RoomListComponent {
  private readonly breakpointObserver: BreakpointObserver = inject(BreakpointObserver);
  private readonly roomStore = inject(RoomStore);
  private readonly translate: TranslateService = inject(TranslateService);
  private readonly dialog: MatDialog = inject(MatDialog);

  private breakpointObserver$ = this.breakpointObserver.observe([Breakpoints.XSmall, Breakpoints.Small]);

  private paginator = viewChild(MatPaginator);
  private sort = viewChild(MatSort);
  private tableState = createMatTableState(this.paginator, this.sort, 'office', 'asc');

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

  paginatorPageIndex = this.tableState.pageIndex;
  dataSourceSignal = computed(() => this.roomStore.data()?.content?.map((room: IRoom) => {
    if (room && room.availabilities && room.availabilities.length) {
      const availabilities = room.availabilities.map((i: IAvailability) =>
        Object.assign({}, i, { order: findDayOfWeek(i.day) }));
      return Object.assign({}, room, { availabilities });
    }
    return room;
  }));
  resultsLengthSignal = computed(() => this.roomStore.data()?.totalElements || 0);
  pageSizeSignal = computed(() => this.breakpointsSignal()?.matches ? MOBILE_PAGE_SIZE : PAGE_SIZE);

  displayedColumns: string[] = ['position', 'currency', 'office', 'address', 'timeZone', 'availability', 'actions'];
  expanded?: IRoom;

  language: string = this.translate.getCurrentLang();

  constructor() {
    this.roomStore.clean();

    effect(() => {
      const request = this.tableState.baseRequest();
      this.roomStore.loadPage({
        ...request,
        size: this.pageSizeSignal(),
      });
    });
    this.tableState.resetOn(this.roomStore.response, () => this.roomStore.clean());
  }

  getTimeZone = (timeZone?: string): ITimeZone => getTimeZone(timeZone);

  getGMT = (timeZone?: string): string => this.getTimeZone(timeZone).gmt;

  edit = (selected: IRoomAll): void => this.roomStore.selectAndNavigate(selected);

  delete = (room: IRoom): void => {
    const title = this.translate.instant('ROOM.DELETED.TITLE');
    const content = this.translate.instant('ROOM.DELETED.CONTENT', { name: room.address?.name });
    executeDialogNoWidth(this.dialog, DialogComponent, { title, content, value: room, variant: 'warning' }, result => {
      if (result) {
        this.roomStore.delete(result);
      }
    });
  };
}
