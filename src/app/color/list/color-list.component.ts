import { ChangeDetectionStrategy, Component, computed, effect, inject, signal, viewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MOBILE_PAGE_SIZE, PAGE_SIZE } from '../../interfaces/pagination';
import { IColor } from '../../interfaces/color';
import { TranslateService } from '@ngx-translate/core';
import { MatDialog } from '@angular/material/dialog';
import { Store } from '@ngrx/store';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { cleanColor, colorSelected, deleteColor, getColorsPage } from '../../store/color.actions';
import { executeDialogNoWidth } from '../../util/helper';
import { DialogComponent } from '../../shared/dialog/generic/dialog.component';
import { detailExpandAnimation } from '../../util/animation';
import { SharedModule } from '../../shared/shared.module';
import { toSignal } from '@angular/core/rxjs-interop';
import { getColorPaginationPipe, getColorResponsePipe } from '../../store/selectors/color.selectors';
import { ColorState } from '../../store/reducers/color.reducers';

@Component({
  selector: 'app-color-list',
  templateUrl: './color-list.component.html',
  styleUrls: ['./color-list.component.scss'],
  animations: [detailExpandAnimation],
  imports: [SharedModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ColorListComponent {
  private readonly breakpointObserver: BreakpointObserver = inject(BreakpointObserver);
  private readonly store: Store<ColorState> = inject(Store<ColorState>);
  private readonly translate: TranslateService = inject(TranslateService);
  private readonly dialog: MatDialog = inject(MatDialog);

  private breakpointObserver$ = this.breakpointObserver.observe([Breakpoints.XSmall, Breakpoints.Small]);
  private colorList$ = this.store.pipe(getColorPaginationPipe);
  private response$ = this.store.pipe(getColorResponsePipe);

  private paginator = viewChild(MatPaginator);
  private sort = viewChild(MatSort);

  private colorListSignal = toSignal(this.colorList$);
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
  dataSourceSignal = computed(() => this.colorListSignal()?.content);
  resultsLengthSignal = computed(() => this.colorListSignal()?.totalElements || 0);
  pageSizeSignal = computed(() => this.breakpointsSignal()?.matches ? MOBILE_PAGE_SIZE : PAGE_SIZE);

  displayedColumns: string[] = ['position', 'name', 'description', 'actions'];

  expandedColor?: IColor;

  language: string = this.translate.currentLang;

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
        getColorsPage({
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
  }

  edit = (selected: IColor): void => this.store.dispatch(colorSelected({ selected }));

  delete = (color: IColor): void => {
    const title = this.translate.instant('COLOR.DELETED.TITLE');
    const content = this.translate.instant('COLOR.DELETED.CONTENT', { name: color.name });

    executeDialogNoWidth(this.dialog, DialogComponent, { title, content, value: color }, result => {
      if (result) {
        this.store.dispatch(deleteColor({ id: result.id, name: result.name }));
      }
    });
  };
}
