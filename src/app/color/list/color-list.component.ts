import { AfterViewInit, ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { DEFAULT_LENGTH, MOBILE_PAGE_SIZE, PAGE_SIZE, Pagination } from '../../interfaces/pagination';
import { IColor } from '../../interfaces/color';
import { Observable, Subscription } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import { MatDialog } from '@angular/material/dialog';
import { Store } from '@ngrx/store';
import { AppState, selectColorState } from '../../store/app.states';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import * as fromActionsColor from '../../store/color.actions';
import { executeDialogNoWidth } from '../../util/helper';
import { DialogComponent } from '../../shared/dialog/generic/dialog.component';
import { detailExpandAnimation } from '../../util/animation';
import { SharedModule } from '../../shared/shared.module';

@Component({
  selector: 'app-color-list',
  templateUrl: './color-list.component.html',
  styleUrls: ['./color-list.component.scss'],
  animations: [detailExpandAnimation],
  imports: [SharedModule]
})
export class ColorListComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  displayedColumns: string[] = ['position', 'name', 'description', 'actions'];
  dataSource: any = new MatTableDataSource<Pagination<IColor>>();

  expandedColor?: IColor;

  resultsLength = DEFAULT_LENGTH;
  pageSize = PAGE_SIZE;
  language: string;

  private subscription?: Subscription;
  private paginatorSubscription?: Subscription;
  private getState: Observable<any>;

  constructor(private readonly translate: TranslateService, public dialog: MatDialog, private store: Store<AppState>,
              private cdRef: ChangeDetectorRef, breakpointObserver: BreakpointObserver) {
    breakpointObserver.observe([
      Breakpoints.XSmall,
      Breakpoints.Small
    ]).subscribe(result => {
      if (result.matches) {
        this.pageSize = MOBILE_PAGE_SIZE;
      }
    });
    this.getState = this.store.select(selectColorState);
    this.language = this.translate.currentLang;
  }

  ngAfterViewInit(): void {
    this.getColorList();
  }

  ngOnInit(): void {
    this.clean();
    this.subscribe();
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
    this.paginatorSubscription?.unsubscribe();
  }

  edit = (color: IColor): void => this.store.dispatch(new fromActionsColor.ColorSelected(color));

  delete = (color: IColor): void => {
    const title = this.translate.instant('COLOR.DELETED.TITLE');
    const content = this.translate.instant('COLOR.DELETED.CONTENT', { name: color.name });

    executeDialogNoWidth(this.dialog, DialogComponent, { title, content, value: color }, result => {
      if (result) {
        this.store.dispatch(
          new fromActionsColor.DeleteColor(result)
        );
      }
    });
  }

  private clean = (): void => this.store.dispatch(new fromActionsColor.Clean());

  private createPageSubscriptions = (): void => {
    this.sort.sortChange.subscribe(() => {
      this.paginator.pageIndex = 0;
      this.getColorList();
    });
    this.paginatorSubscription = this.paginator?.page.subscribe(() => this.getColorList(this.paginator.pageIndex));

    this.cdRef.detectChanges();
  }

  private getColorList = (page: number = 0): void => this.store.dispatch(
    new fromActionsColor.GetAll({
      active: this.sort.active,
      direction: this.sort.direction,
      size: this.pageSize,
      page
    })
  );

  private subscribe = (): void => {
    this.subscription = this.getState.subscribe((state) => {
      if (state.message) {
        this.clean();
        this.getColorList();
      }
      this.dataSource = state.data?.content;
      this.resultsLength = state.data?.totalElements;
      if (!this.paginatorSubscription && this.resultsLength) {
        this.createPageSubscriptions();
      }
    });
  }
}
