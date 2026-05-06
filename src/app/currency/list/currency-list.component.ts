import { ChangeDetectionStrategy, Component, computed, effect, inject, signal, viewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MOBILE_PAGE_SIZE, PAGE_SIZE } from '../../interfaces/pagination';
import { ICurrency } from '../../interfaces/currency';
import { TranslateService } from '@ngx-translate/core';
import { Store } from '@ngrx/store';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { clean, currencySelected, deleteCurrency, getCurrenciesPage } from '../../store/currency.actions';
import { DialogComponent } from '../../shared/dialog/generic/dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { executeDialogNoWidth } from '../../util/helper';
import { SharedModule } from '../../shared/shared.module';
import { getCurrencyPaginationPipe, getCurrencyResponsePipe } from '../../store/selectors/currency.selectors';
import { toSignal } from '@angular/core/rxjs-interop';
import { CurrencyState } from '../../store/reducers/currency.reducers';

@Component({
  selector: 'app-currency-list',
  templateUrl: './currency-list.component.html',
  styleUrls: ['./currency-list.component.scss'],
  imports: [SharedModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CurrencyListComponent {
  private readonly breakpointObserver: BreakpointObserver = inject(BreakpointObserver);
  private readonly store: Store<CurrencyState> = inject(Store<CurrencyState>);
  private readonly translate: TranslateService = inject(TranslateService);
  private readonly dialog: MatDialog = inject(MatDialog);

  private breakpointObserver$ = this.breakpointObserver.observe([Breakpoints.XSmall, Breakpoints.Small]);
  private currencyList$ = this.store.pipe(getCurrencyPaginationPipe);
  private response$ = this.store.pipe(getCurrencyResponsePipe);

  private paginator = viewChild(MatPaginator);
  private sort = viewChild(MatSort);

  private currencyListSignal = toSignal(this.currencyList$);
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

  private sortActive = computed(() => this.sort()?.active ?? 'code');
  private sortDirection = computed(() => this.sort()?.direction ?? 'asc');

  paginatorPageIndex = signal(0);
  dataSourceSignal = computed(() => this.currencyListSignal()?.content);
  resultsLengthSignal = computed(() => this.currencyListSignal()?.totalElements || 0);
  pageSizeSignal = computed(() => this.breakpointsSignal()?.matches ? MOBILE_PAGE_SIZE : PAGE_SIZE);

  displayedColumns: string[] = ['position', 'code', 'name', 'actions'];
  expanded?: ICurrency;

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
        getCurrenciesPage({
          page: page,
          sort: this.sortActive(),
          direction: this.sortDirection(),
          size: this.pageSizeSignal(),
        }),
      );
    });

    effect(() => {
      if (this.responseSignal()) {
        this.store.dispatch(clean());
        this.paginator()?.firstPage();
      }
    });
  }

  edit = (selected: ICurrency): void => this.store.dispatch(currencySelected({ selected }));

  delete = (currency: ICurrency): void => {
    const title = this.translate.instant('CURRENCY.DELETED.TITLE');
    const content = this.translate.instant('CURRENCY.DELETED.CONTENT', { code: currency.code });
    executeDialogNoWidth(this.dialog, DialogComponent, { title, content, value: currency, variant: 'warning' }, result => {
      if (result) {
        this.store.dispatch(deleteCurrency({ id: result.id, code: result.code }));
      }
    });
  };
}
