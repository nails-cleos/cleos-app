import { AfterViewInit, ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { DEFAULT_LENGTH, MOBILE_PAGE_SIZE, PAGE_SIZE, Pagination } from '../../interfaces/pagination';
import { IOffice } from '../../interfaces/office';
import { Observable, Subscription } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import { MatDialog } from '@angular/material/dialog';
import { Store } from '@ngrx/store';
import { AppState, selectOfficeState } from '../../store/app.states';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import * as fromActionsOffice from '../../store/office.actions';
import { DialogComponent } from '../../shared/dialog/generic/dialog.component';
import { detailExpandAnimation } from '../../util/animation';
import { SharedModule } from '../../shared/shared.module';

@Component({
  selector: 'app-office-list',
  templateUrl: './office-list.component.html',
  styleUrls: ['./office-list.component.scss'],
  animations: [detailExpandAnimation],
  imports: [SharedModule]
})
export class OfficeListComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  displayedColumns: string[] = ['position', 'name', 'manager', 'subject', 'actions'];
  dataSource: any = new MatTableDataSource<Pagination<IOffice>>();
  expanded?: IOffice;

  resultsLength = DEFAULT_LENGTH;
  pageSize = PAGE_SIZE;
  language: string;

  private subscription: Subscription | undefined;
  private paginatorSubscription: Subscription | undefined;
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
    this.getState = this.store.select(selectOfficeState);
    this.language = this.translate.currentLang;
  }

  ngAfterViewInit(): void {
    this.getOffices();
  }

  ngOnInit(): void {
    this.clean();
    this.subscribe();
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
    this.paginatorSubscription?.unsubscribe();
  }

  edit = (office: IOffice): void => this.store.dispatch(
    new fromActionsOffice.OfficeSelected({ office, redirect: true }));

  delete = (office: IOffice): void => {
    const title = this.translate.instant('OFFICE.DELETED.TITLE');
    const content = this.translate.instant('OFFICE.DELETED.CONTENT', { name: office.name });
    const dialogRef = this.dialog.open(DialogComponent, {
      data: { title, content, value: office }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.store.dispatch(
          new fromActionsOffice.DeleteOffice(result)
        );
      }
    });
  };

  private clean = (): void => this.store.dispatch(new fromActionsOffice.Clean());

  private createPageSubscriptions = (): void => {
    this.sort.sortChange.subscribe(() => {
      this.paginator.pageIndex = 0;
      this.getOffices();
    });
    this.paginatorSubscription = this.paginator?.page.subscribe(() => this.getOffices(this.paginator.pageIndex));

    this.cdRef.detectChanges();
  };

  private getOffices = (page: number = 0): void => this.store.dispatch(
    new fromActionsOffice.GetAll({
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
        this.getOffices();
      }
      this.dataSource = state.data?.content;
      this.resultsLength = state.data?.totalElements;
      if (!this.paginatorSubscription && this.resultsLength) {
        this.createPageSubscriptions();
      }
    });
  };
}
