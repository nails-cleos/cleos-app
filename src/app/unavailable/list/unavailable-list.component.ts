import { AfterViewInit, ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { DEFAULT_LENGTH, MOBILE_PAGE_SIZE, PAGE_SIZE, Pagination } from '../../interfaces/pagination';
import { Observable, Subscription } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import { MatDialog } from '@angular/material/dialog';
import { Store } from '@ngrx/store';
import { AppState, selectUnavailableState } from '../../store/app.states';
import * as fromActionsUnavailable from '../../store/unavailable.actions';
import { DialogComponent } from '../../shared/dialog/dialog.component';
import { convertDuration } from '../../util/dates';
import { IUnavailable } from '../../interfaces/unavailable';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { detailExpandAnimation } from '../../util/animation';

@Component({
  selector: 'app-unavailable-list',
  templateUrl: './unavailable-list.component.html',
  styleUrls: ['./unavailable-list.component.scss'],
  animations: [detailExpandAnimation]
})
export class UnavailableListComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  displayedColumns: string[] = ['position', 'professional', 'description', 'start', 'duration', 'repeat', 'actions'];
  dataSource: any = new MatTableDataSource<Pagination<IUnavailable>>();

  expandedUnavailable?: IUnavailable;

  resultsLength = DEFAULT_LENGTH;
  pageSize = PAGE_SIZE;

  language: string;

  private subscription?: Subscription;
  private paginatorSubscription?: Subscription;
  private getState: Observable<any>;

  constructor(private readonly translate: TranslateService, public dialog: MatDialog, private store: Store<AppState>,
              private cdRef: ChangeDetectorRef, private breakpointObserver: BreakpointObserver) {
    breakpointObserver.observe([
      Breakpoints.XSmall,
      Breakpoints.Small
    ]).subscribe(result => {
      if (result.matches) {
        this.pageSize = MOBILE_PAGE_SIZE;
      }
    });
    this.getState = this.store.select(selectUnavailableState);
    this.language = this.translate.currentLang;
  }

  ngAfterViewInit(): void {
    this.getUnavailableList();
  }

  ngOnInit(): void {
    this.clean();
    this.subscribe();
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
    this.paginatorSubscription?.unsubscribe();
  }

  edit(unavailable: IUnavailable): void {
    this.store.dispatch(
      new fromActionsUnavailable.UnavailableSelected(unavailable)
    );
  }

  delete(unavailable: IUnavailable): void {
    const title = this.translate.instant('UNAVAILABLE.DELETED.TITLE');
    const content = this.translate.instant('UNAVAILABLE.DELETED.CONTENT', {date: unavailable.start});
    const dialogRef = this.dialog.open(DialogComponent, {
      data: {title, content, value: unavailable}
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.store.dispatch(
          new fromActionsUnavailable.DeleteUnavailable(result.id)
        );
      }
    });
  }

  private subscribe(): void {
    this.subscription = this.getState.subscribe((state) => {
      if (state.message) {
        this.clean();
        this.getUnavailableList();
      }
      this.dataSource = state.data?.content?.map((unavailable: IUnavailable) => {
        if (unavailable.duration) {
          const duration = convertDuration(unavailable.duration);

          return Object.assign({}, unavailable, {hour: duration.hour, minute: duration.minute});
        }
        return unavailable;
      });
      this.resultsLength = state.data?.totalElements;
      if (!this.paginatorSubscription && this.resultsLength) {
        this.createPageSubscriptions();
      }
    });
  }

  private clean(): void {
    this.store.dispatch(
      new fromActionsUnavailable.Clean()
    );
  }

  private createPageSubscriptions(): void {
    this.sort.sortChange.subscribe(() => {
      this.paginator.pageIndex = 0;
      this.getUnavailableList();
    });
    this.paginatorSubscription = this.paginator?.page.subscribe(() => this.getUnavailableList(this.paginator.pageIndex));

    this.cdRef.detectChanges();
  }

  private getUnavailableList(page: number = 0): void {
    const payload = {
      active: this.sort.active,
      direction: this.sort.direction,
      size: this.pageSize,
      page
    };
    this.store.dispatch(
      new fromActionsUnavailable.GetAll(payload)
    );
  }
}
