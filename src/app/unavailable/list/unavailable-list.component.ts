import { ChangeDetectionStrategy, Component, computed, effect, inject, signal, viewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MOBILE_PAGE_SIZE, PAGE_SIZE } from '../../interfaces/pagination';
import { TranslateService } from '@ngx-translate/core';
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
import { detailExpandAnimation } from '../../util/animation';
import { createDialog } from '../../util/helper';
import { SharedModule } from '../../shared/shared.module';
import { TimeDetailPipe } from '../../pipes/time-detail.pipe';
import { DurationTimePipe } from '../../pipes/durationTime.pipe';
import { ColorState } from '../../store/reducers/color.reducers';
import { getUnavailablePaginationPipe, getUnavailableResponsePipe } from '../../store/selectors/unavailable.selectors';
import { toSignal } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-unavailable-list',
  templateUrl: './unavailable-list.component.html',
  styleUrls: ['./unavailable-list.component.scss'],
  animations: [detailExpandAnimation],
  imports: [SharedModule, TimeDetailPipe, DurationTimePipe],
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

  private sortActive = computed(() => this.sort()?.active ?? 'timestamp');
  private sortDirection = computed(() => this.sort()?.direction ?? 'desc');

  paginatorPageIndex = signal(0);
  dataSourceSignal = computed(() => this.unavailableListSignal()?.content);
  resultsLengthSignal = computed(() => this.unavailableListSignal()?.totalElements || 0);
  pageSizeSignal = computed(() => this.breakpointsSignal()?.matches ? MOBILE_PAGE_SIZE : PAGE_SIZE);

  displayedColumns: string[] = ['position', 'professional', 'description', 'timestamp', 'duration', 'repeat',
    'actions'];

  expandedUnavailable?: IUnavailable;

  dateFormat: string = this.translate.getCurrentLang();
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
        getUnavailablePage({
          page: page,
          sort: this.sortActive(),
          direction: this.sortDirection(),
          size: this.pageSizeSignal(),
        }),
      );
    });

    effect(() => {
      if (this.responseSignal()) {
        this.store.dispatch(cleanUnavailable());
        this.paginator()?.firstPage();
      }
    });
  }

  edit = (selected: IUnavailableAll): void => this.store.dispatch(unavailableSelected({ selected }));

  delete = (unavailable: IUnavailableAll): void => {
    const title = this.translate.instant('UNAVAILABLE.DELETED.TITLE');
    const content = this.translate.instant('UNAVAILABLE.DELETED.CONTENT',
      { date: newDateTimestamp(unavailable.timestamp) });
    const dialogRef = this.dialog.open(DialogComponent, {
      data: { title, content, value: unavailable },
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
