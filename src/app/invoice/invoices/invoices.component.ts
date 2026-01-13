import { Component, computed, effect, inject, input, signal, viewChild } from '@angular/core';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Store } from '@ngrx/store';
import { TranslateService } from '@ngx-translate/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { toSignal } from '@angular/core/rxjs-interop';
import { MOBILE_PAGE_SIZE, PAGE_SIZE } from '../../interfaces/pagination';
import { cleanColor } from '../../store/color.actions';
import { InvoiceState } from '../../store/reducers/invoice.reducers';
import { getInvoicesPage, invoiceView } from '../../store/invoice.actions';
import { getInvoiceResponsePipe, getInvoicesPagePipe } from '../../store/selectors/invoice.selectors';
import { DriveAccessService } from '../../services/drive-access.service';
import { IInvoiceData } from '../../interfaces/invoice';
import { SharedModule } from '../../shared/shared.module';
import { detailExpandAnimation } from '../../util/animation';

@Component({
  selector: 'app-invoices',
  imports: [SharedModule],
  animations: [detailExpandAnimation],
  templateUrl: './invoices.component.html',
  styleUrl: './invoices.component.scss',
})
export class InvoicesComponent {
  officeId = input.required<string>();

  private readonly breakpointObserver: BreakpointObserver = inject(BreakpointObserver);
  private readonly store: Store<InvoiceState> = inject(Store<InvoiceState>);
  private readonly translate: TranslateService = inject(TranslateService);
  private readonly driveAccessService: DriveAccessService = inject(DriveAccessService);

  private breakpointObserver$ = this.breakpointObserver.observe([Breakpoints.XSmall, Breakpoints.Small]);
  private invoiceList$ = this.store.pipe(getInvoicesPagePipe);
  private response$ = this.store.pipe(getInvoiceResponsePipe);

  private paginator = viewChild(MatPaginator);
  private sort = viewChild(MatSort);

  private invoiceListSignal = toSignal(this.invoiceList$);
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

  private sortActive = computed(() => this.sort()?.active ?? 'date');
  private sortDirection = computed(() => this.sort()?.direction ?? 'desc');

  paginatorPageIndex = signal(0);
  dataSourceSignal = computed(() => this.invoiceListSignal()?.content);
  resultsLengthSignal = computed(() => this.invoiceListSignal()?.totalElements || 0);
  pageSizeSignal = computed(() => this.breakpointsSignal()?.matches ? MOBILE_PAGE_SIZE : PAGE_SIZE);

  displayedColumns: string[] = ['position', 'name', 'date', 'actions'];

  expandedInvoice?: IInvoiceData;

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
        getInvoicesPage({
          officeId: this.officeId(),
          page: page,
          sort: this.sortActive(),
          direction: this.sortDirection(),
          size: this.pageSizeSignal(),
        }),
      );
    });

    effect(() => {
      if (this.responseSignal()) {
        this.store.dispatch(cleanColor());
        this.paginator()?.firstPage();
      }
    });

    effect(() => {
      this.driveAccessService.requestAccessIfNeeded();
    });
  }

  view = (invoice: IInvoiceData): void => this.store.dispatch(invoiceView(
    { id: invoice.id, fileName: invoice.name, driveToken: this.driveAccessService.driveTokenSignal() },
  ));
}
