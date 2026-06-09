import { ChangeDetectionStrategy, Component, computed, effect, inject, viewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort, MatSortHeader } from '@angular/material/sort';
import { createMatTableState } from 'src/app/util/mat-table-state';
import { MOBILE_PAGE_SIZE, PAGE_SIZE } from '../../interfaces/pagination';
import { IAdditional } from '../additional';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { MatDialog } from '@angular/material/dialog';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { DialogComponent } from '../../shared/dialog/generic/dialog.component';
import { convertDuration } from '../../util/dates';
import { executeDialogNoWidth } from '../../util/helper';
import { toSignal } from '@angular/core/rxjs-interop';
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
import { MatIcon } from '@angular/material/icon';
import { MatTooltip } from '@angular/material/tooltip';
import { MatIconButton } from '@angular/material/button';
import { MatPrefix } from '@angular/material/input';
import { MatList, MatListItem, MatListItemIcon } from '@angular/material/list';
import { DecimalPipe } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { AdditionalStore } from '../../store/additional.store';

@Component({
  selector: 'app-additional-list',
  templateUrl: './additional-list.component.html',
  styleUrls: ['./additional-list.component.scss'],
  imports: [MatIcon, MatList, MatListItem, MatIconButton, TranslatePipe, DecimalPipe, RouterLink,
    MatTable, MatSort, MatColumnDef, MatHeaderCellDef, MatHeaderCell, MatCellDef, MatCell, MatSortHeader, MatTooltip,
    MatListItemIcon, MatFooterCellDef, MatFooterCell, MatHeaderRowDef, MatHeaderRow, MatRowDef, MatRow, MatFooterRow,
    MatFooterRowDef, MatPaginator, MatPrefix],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdditionalListComponent {
  private readonly breakpointObserver: BreakpointObserver = inject(BreakpointObserver);
  private readonly additionalStore = inject(AdditionalStore);
  private readonly translate: TranslateService = inject(TranslateService);
  private readonly dialog: MatDialog = inject(MatDialog);
  private readonly router = inject(Router);

  private breakpointObserver$ = this.breakpointObserver.observe([Breakpoints.XSmall, Breakpoints.Small]);

  private paginator = viewChild(MatPaginator);
  private sort = viewChild(MatSort);
  private tableState = createMatTableState(this.paginator, this.sort, 'order', 'asc');

  private additionalListSignal = computed(() => {
    const data = this.additionalStore.data();
    return data?.kind === 'pagination' ? data.value : undefined;
  });
  private responseSignal = this.additionalStore.response;
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
  dataSourceSignal = computed(() => this.additionalListSignal()?.content?.map((additional: IAdditional) => {
    if (additional.duration) {
      const duration = convertDuration(additional.duration);

      return Object.assign({}, additional, { hour: duration.hour, minute: duration.minute });
    }
    return additional;
  }));
  resultsLengthSignal = computed(() => this.additionalListSignal()?.totalElements || 0);
  pageSizeSignal = computed(() => this.breakpointsSignal()?.matches ? MOBILE_PAGE_SIZE : PAGE_SIZE);

  displayedColumns: string[] = ['order', 'name', 'description', 'duration', 'actions'];

  expandedAdditional?: IAdditional;

  language: string = this.translate.getCurrentLang();

  constructor() {
    this.additionalStore.clean();
    effect(() => {
      const request = this.tableState.baseRequest();
      this.additionalStore.loadPage({
        ...request,
        size: this.pageSizeSignal(),
      });
    });
    this.tableState.resetOn(this.responseSignal, () => this.additionalStore.clearResponse());
  }

  edit = (selected: IAdditional): void => {
    void this.router.navigate([this.language, 'additional', selected.id]);
  };

  delete = (additional: IAdditional): void => {
    const title = this.translate.instant('ADDITIONAL.DELETED.TITLE');
    const content = this.translate.instant('ADDITIONAL.DELETED.CONTENT', { name: additional.name });

    executeDialogNoWidth(this.dialog, DialogComponent, { title, content, value: additional, variant: 'warning' },
      result => {
        if (result) {
          this.additionalStore.delete(result.id, result.name);
        }
      });
  };
}
