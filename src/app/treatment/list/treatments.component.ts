import { ChangeDetectionStrategy, Component, computed, effect, inject, viewChild } from '@angular/core';
import { MOBILE_PAGE_SIZE, PAGE_SIZE } from '../../interfaces/pagination';
import { ITreatmentGroup, ITreatmentGroupAll } from '../../interfaces/treatment';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { createMatTableState } from 'src/app/util/mat-table-state';
import { TranslateService } from '@ngx-translate/core';
import { MatDialog } from '@angular/material/dialog';
import { Store } from '@ngrx/store';
import { cleanTreatment, deleteTreatmentGroup, getTreatmentsPage } from '../../store/treatment.actions';
import { DialogComponent } from '../../shared/dialog/generic/dialog.component';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { SharedModule } from '../../shared/shared.module';
import { CurrencySymbolPipe } from '../../pipes/currency-symbol.pipe';
import { TreatmentState } from '../../store/reducers/treatment.reducers';
import { getTreatmentPaginationPipe, getTreatmentResponsePipe } from '../../store/selectors/treatment.selectors';
import { toSignal } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-treatments',
  templateUrl: './treatments.component.html',
  styleUrls: ['./treatments.component.scss'],
  imports: [SharedModule, CurrencySymbolPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TreatmentsComponent {
  private readonly breakpointObserver: BreakpointObserver = inject(BreakpointObserver);
  private readonly store: Store<TreatmentState> = inject(Store<TreatmentState>);
  private readonly translate: TranslateService = inject(TranslateService);
  private readonly dialog: MatDialog = inject(MatDialog);

  private breakpointObserver$ = this.breakpointObserver.observe([Breakpoints.XSmall, Breakpoints.Small]);
  private treatmentList$ = this.store.pipe(getTreatmentPaginationPipe);
  private response$ = this.store.pipe(getTreatmentResponsePipe);

  private paginator = viewChild(MatPaginator);
  private sort = viewChild(MatSort);
  private tableState = createMatTableState(this.paginator, this.sort, 'order', 'asc');

  private treatmentListSignal = toSignal(this.treatmentList$);
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
  dataSourceSignal = computed(() => this.treatmentListSignal()?.content);
  resultsLengthSignal = computed(() => this.treatmentListSignal()?.totalElements || 0);
  pageSizeSignal = computed(() => this.breakpointsSignal()?.matches ? MOBILE_PAGE_SIZE : PAGE_SIZE);

  displayedColumns: string[] = ['order', 'name', 'priceFrom', 'actions'];

  expanded?: ITreatmentGroup;

  dateFormat: string = this.translate.getCurrentLang();
  language: string = this.translate.getCurrentLang();

  constructor() {
    effect(() => {
      const request = this.tableState.baseRequest();
      this.store.dispatch(
        getTreatmentsPage({
          ...request,
          size: this.pageSizeSignal(),
        }),
      );
    });
    this.tableState.resetOn(this.responseSignal, () => this.store.dispatch(cleanTreatment()));
  }

  delete = (treatment: ITreatmentGroupAll): void => {
    const title = this.translate.instant('TREATMENT.DELETED.TITLE');
    const content = this.translate.instant('TREATMENT.DELETED.CONTENT', { name: treatment.name });
    const dialogRef = this.dialog.open(DialogComponent, {
      data: { title, content, value: treatment, variant: 'warning' },
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.store.dispatch(deleteTreatmentGroup({ id: result.id, name: result.name }));
      }
    });
  };
}
