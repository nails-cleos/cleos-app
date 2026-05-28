import { ChangeDetectionStrategy, Component, computed, effect, inject, viewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort, MatSortHeader } from '@angular/material/sort';
import { createMatTableState } from 'src/app/util/mat-table-state';
import { MOBILE_PAGE_SIZE, PAGE_SIZE } from '../../interfaces/pagination';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { MatDialog } from '@angular/material/dialog';
import { Store } from '@ngrx/store';
import {
  cleanUnavailable,
  deleteUnavailable,
  getUnavailablePage,
  unavailableSelected,
} from '../../store/unavailable.actions';
import { DialogComponent } from '../../shared/dialog/generic/dialog.component';
import { getCurrentTimeZone, isSameTimeZone, newDateTimestamp } from '../../util/dates';
import { IUnavailable, IUnavailableAll } from '../../interfaces/unavailable';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { createDialog } from '../../util/helper';
import { TimeDetailPipe } from '../../pipes/time-detail.pipe';
import { DurationTimePipe } from '../../pipes/durationTime.pipe';
import { ColorState } from '../../store/reducers/color.reducers';
import { getUnavailablePaginationPipe, getUnavailableResponsePipe } from '../../store/selectors/unavailable.selectors';
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
import { MatPrefix } from '@angular/material/input';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-unavailable-list',
  templateUrl: './unavailable-list.component.html',
  styleUrls: ['./unavailable-list.component.scss'],
  imports: [TimeDetailPipe, MatIcon, MatList, MatListItem, MatListSubheaderCssMatStyler, MatIconButton,
    TranslatePipe, RouterLink, DatePipe, MatTable, MatSort, MatColumnDef, MatHeaderCellDef,
    MatHeaderCell, MatCellDef, MatCell, MatSortHeader, MatTooltip, MatListItemIcon, MatFooterCellDef, MatFooterCell,
    MatHeaderRowDef, MatHeaderRow, MatRowDef, MatRow, MatFooterRow, MatFooterRowDef, MatPaginator, MatPrefix,
    TimeDetailPipe, DurationTimePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UnavailableListComponent {
  private readonly breakpointObserver: BreakpointObserver = inject(BreakpointObserver);
  private readonly store: Store<ColorState> = inject(Store<ColorState>);
  private readonly translate: TranslateService = inject(TranslateService);
  private readonly dialog: MatDialog = inject(MatDialog);

  private breakpointObserver$ = this.breakpointObserver.observe([Breakpoints.XSmall, Breakpoints.Small]);
  private unavailableList$ = this.store.pipe(getUnavailablePaginationPipe);
  private response$ = this.store.pipe(getUnavailableResponsePipe);

  private paginator = viewChild(MatPaginator);
  private sort = viewChild(MatSort);
  private tableState = createMatTableState(this.paginator, this.sort, 'timestamp', 'desc');

  private unavailableListSignal = toSignal(this.unavailableList$);
  private responseSignal = toSignal(this.response$);
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
  dataSourceSignal = computed(() => this.unavailableListSignal()?.content);
  resultsLengthSignal = computed(() => this.unavailableListSignal()?.totalElements || 0);
  pageSizeSignal = computed(() => this.breakpointsSignal()?.matches ? MOBILE_PAGE_SIZE : PAGE_SIZE);

  displayedColumns: string[] = ['position', 'professional', 'description', 'timestamp', 'duration', 'repeat',
    'actions'];

  expandedUnavailable?: IUnavailable;

  dateFormat: string = this.translate.getCurrentLang();
  language: string = this.translate.getCurrentLang();

  constructor() {
    effect(() => {
      const request = this.tableState.baseRequest();
      this.store.dispatch(
        getUnavailablePage({
          ...request,
          size: this.pageSizeSignal(),
        }),
      );
    });
    this.tableState.resetOn(this.responseSignal, () => this.store.dispatch(cleanUnavailable()));
  }

  edit = (selected: IUnavailableAll): void => this.store.dispatch(unavailableSelected({ selected }));

  delete = (unavailable: IUnavailableAll): void => {
    const title = this.translate.instant('UNAVAILABLE.DELETED.TITLE');
    const content = this.translate.instant('UNAVAILABLE.DELETED.CONTENT',
      { date: newDateTimestamp(unavailable.timestamp) });
    const dialogRef = this.dialog.open(DialogComponent, {
      data: { title, content, value: unavailable, variant: 'warning' },
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.store.dispatch(
          deleteUnavailable({ id: result.id, timestamp: result.timestamp, timeZone: result.timeZone }),
        );
      }
    });
  };

  showTimeZone = (unavailable: IUnavailableAll): boolean =>
    !isSameTimeZone(unavailable.timeZone || unavailable.professional.timeZone || getCurrentTimeZone());

  openDialog = (unavailable: IUnavailableAll): void => {
    const time = newDateTimestamp(unavailable.timestamp);
    const name = unavailable.professional.displayName;
    const timeZone = unavailable.timeZone || unavailable.professional.timeZone;
    createDialog('PROFESSIONAL_INFO', name, this.dateFormat, this.translate, this.dialog, timeZone, time);
  };
}
