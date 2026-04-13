import { ChangeDetectionStrategy, Component, computed, effect, inject, signal, viewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
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
import { additionalSelected, cleanAdditional, deleteAdditional, getAdditionalPage } from '../../store/additional.actions';
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

  private sortActive = computed(() => this.sort()?.active ?? 'order');
  private sortDirection = computed(() => this.sort()?.direction ?? 'asc');

  paginatorPageIndex = signal(0);
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
        getAdditionalPage({
          page: page,
          sort: this.sortActive(),
          direction: this.sortDirection(),
          size: this.pageSizeSignal(),
        }),
      );
    });

    effect(() => {
      if (this.responseSignal()) {
        this.store.dispatch(cleanAdditional());
        this.paginator()?.firstPage();
      }
    });
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
