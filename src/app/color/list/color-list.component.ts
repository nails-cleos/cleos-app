import { ChangeDetectionStrategy, Component, computed, effect, inject, viewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { createMatTableState } from 'src/app/util/mat-table-state';
import { MOBILE_PAGE_SIZE, PAGE_SIZE } from '../../interfaces/pagination';
import { IColor } from '../../interfaces/color';
import { TranslateService } from '@ngx-translate/core';
import { MatDialog } from '@angular/material/dialog';
import { Store } from '@ngrx/store';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { cleanColor, colorSelected, deleteColor, getColorsPage } from '../../store/color.actions';
import { executeDialogNoWidth } from '../../util/helper';
import { DialogComponent } from '../../shared/dialog/generic/dialog.component';
import { SharedModule } from '../../shared/shared.module';
import { toSignal } from '@angular/core/rxjs-interop';
import { getColorPaginationPipe, getColorResponsePipe } from '../../store/selectors/color.selectors';
import { ColorState } from '../../store/reducers/color.reducers';

@Component({
  selector: 'app-color-list',
  templateUrl: './color-list.component.html',
  styleUrls: ['./color-list.component.scss'],
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
  private tableState = createMatTableState(this.paginator, this.sort, 'name', 'asc');

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

  paginatorPageIndex = this.tableState.pageIndex;
  dataSourceSignal = computed(() => this.colorListSignal()?.content);
  resultsLengthSignal = computed(() => this.colorListSignal()?.totalElements || 0);
  pageSizeSignal = computed(() => this.breakpointsSignal()?.matches ? MOBILE_PAGE_SIZE : PAGE_SIZE);

  displayedColumns: string[] = ['position', 'name', 'description', 'actions'];

  expandedColor?: IColor;

  language: string = this.translate.getCurrentLang();

  constructor() {
    effect(() => {
      const request = this.tableState.baseRequest();
      this.store.dispatch(
        getColorsPage({
          ...request,
          size: this.pageSizeSignal(),
        }),
      );
    });
    this.tableState.resetOn(this.responseSignal, () => this.store.dispatch(cleanColor()));
  }

  edit = (selected: IColor): void => this.store.dispatch(colorSelected({ selected }));

  delete = (color: IColor): void => {
    const title = this.translate.instant('COLOR.DELETED.TITLE');
    const content = this.translate.instant('COLOR.DELETED.CONTENT', { name: color.name });

    executeDialogNoWidth(this.dialog, DialogComponent, { title, content, value: color, variant: 'warning' }, result => {
      if (result) {
        this.store.dispatch(deleteColor({ id: result.id, name: result.name }));
      }
    });
  };
}
