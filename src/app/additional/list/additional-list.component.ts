import { ChangeDetectionStrategy, Component, computed, effect, inject, viewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { createMatTableState } from 'src/app/util/mat-table-state';
import { MOBILE_PAGE_SIZE, PAGE_SIZE } from '../../interfaces/pagination';
import { IAdditional } from '../../interfaces/additional';
import { TranslateService } from '@ngx-translate/core';
import { MatDialog } from '@angular/material/dialog';
import { Store } from '@ngrx/store';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { DialogComponent } from '../../shared/dialog/generic/dialog.component';
import { convertDuration } from '../../util/dates';
import { executeDialogNoWidth } from '../../util/helper';
import { SharedModule } from '../../shared/shared.module';
import {
  additionalSelected,
  cleanAdditional,
  deleteAdditional,
  getAdditionalPage,
} from '../../store/additional.actions';
import { toSignal } from '@angular/core/rxjs-interop';
import { getAdditionalPaginationPipe, getAdditionalResponsePipe } from '../../store/selectors/additional.selectors';
import { AdditionalState } from '../../store/reducers/additional.reducers';

@Component({
  selector: 'app-additional-list',
  templateUrl: './additional-list.component.html',
  styleUrls: ['./additional-list.component.scss'],
  imports: [SharedModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdditionalListComponent {
  private readonly breakpointObserver: BreakpointObserver = inject(BreakpointObserver);
  private readonly store: Store<AdditionalState> = inject(Store<AdditionalState>);
  private readonly translate: TranslateService = inject(TranslateService);
  private readonly dialog: MatDialog = inject(MatDialog);

  private breakpointObserver$ = this.breakpointObserver.observe([Breakpoints.XSmall, Breakpoints.Small]);
  private additionalList$ = this.store.pipe(getAdditionalPaginationPipe);
  private response$ = this.store.pipe(getAdditionalResponsePipe);

  private paginator = viewChild(MatPaginator);
  private sort = viewChild(MatSort);
  private tableState = createMatTableState(this.paginator, this.sort, 'order', 'asc');

  private additionalListSignal = toSignal(this.additionalList$);
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

  expandedAdditional: IAdditional | undefined;

  language: string = this.translate.getCurrentLang();

  constructor() {
    effect(() => {
      const request = this.tableState.baseRequest();
      this.store.dispatch(
        getAdditionalPage({
          ...request,
          size: this.pageSizeSignal(),
        }),
      );
    });
    this.tableState.resetOn(this.responseSignal, () => this.store.dispatch(cleanAdditional()));
  }

  edit = (selected: IAdditional): void => this.store.dispatch(
    additionalSelected({ selected }),
  );

  delete = (additional: IAdditional): void => {
    const title = this.translate.instant('ADDITIONAL.DELETED.TITLE');
    const content = this.translate.instant('ADDITIONAL.DELETED.CONTENT', { name: additional.name });

    executeDialogNoWidth(this.dialog, DialogComponent, { title, content, value: additional, variant: 'warning' }, result => {
      if (result) {
        this.store.dispatch(
          deleteAdditional({ id: result.id, name: result.name }),
        );
      }
    });
  };
}
