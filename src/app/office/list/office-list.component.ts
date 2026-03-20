import { ChangeDetectionStrategy, Component, computed, effect, inject, signal, viewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MOBILE_PAGE_SIZE, PAGE_SIZE } from '../../interfaces/pagination';
import { IOffice } from '../../interfaces/office';
import { TranslateService } from '@ngx-translate/core';
import { MatDialog } from '@angular/material/dialog';
import { Store } from '@ngrx/store';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { cleanOffice, deleteOffice, getOfficesPage, officeSelected } from '../../store/office.actions';
import { DialogComponent } from '../../shared/dialog/generic/dialog.component';
import { SharedModule } from '../../shared/shared.module';
import { OfficeState } from '../../store/reducers/office.reducers';
import { getOfficePaginationPipe, getOfficeResponsePipe } from '../../store/selectors/office.selectors';
import { toSignal } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-office-list',
  templateUrl: './office-list.component.html',
  styleUrls: ['./office-list.component.scss'],
  imports: [SharedModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OfficeListComponent {
  private readonly breakpointObserver: BreakpointObserver = inject(BreakpointObserver);
  private readonly store: Store<OfficeState> = inject(Store<OfficeState>);
  private readonly translate: TranslateService = inject(TranslateService);
  private readonly dialog: MatDialog = inject(MatDialog);

  private breakpointObserver$ = this.breakpointObserver.observe([Breakpoints.XSmall, Breakpoints.Small]);
  private officeList$ = this.store.pipe(getOfficePaginationPipe);
  private response$ = this.store.pipe(getOfficeResponsePipe);

  private paginator = viewChild(MatPaginator);
  private sort = viewChild(MatSort);

  private officeListSignal = toSignal(this.officeList$);
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

  private sortActive = computed(() => this.sort()?.active ?? 'name');
  private sortDirection = computed(() => this.sort()?.direction ?? 'asc');

  paginatorPageIndex = signal(0);
  dataSourceSignal = computed(() => this.officeListSignal()?.content);
  resultsLengthSignal = computed(() => this.officeListSignal()?.totalElements || 0);
  pageSizeSignal = computed(() => this.breakpointsSignal()?.matches ? MOBILE_PAGE_SIZE : PAGE_SIZE);

  displayedColumns: string[] = ['position', 'name', 'manager', 'subject', 'actions'];
  expanded?: IOffice;

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
        getOfficesPage({
          page: page,
          sort: this.sortActive(),
          direction: this.sortDirection(),
          size: this.pageSizeSignal(),
        }),
      );
    });

    effect(() => {
      if (this.responseSignal()) {
        this.store.dispatch(cleanOffice());
        this.paginator()?.firstPage();
      }
    });
  }

  edit = (selected: IOffice): void => this.store.dispatch(officeSelected({ selected }));

  delete = (office: IOffice): void => {
    const title = this.translate.instant('OFFICE.DELETED.TITLE');
    const content = this.translate.instant('OFFICE.DELETED.CONTENT', { name: office.name });
    const dialogRef = this.dialog.open(DialogComponent, {
      data: { title, content, value: office },
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.store.dispatch(deleteOffice({ id: result.id, name: result.name }));
      }
    });
  };
}
