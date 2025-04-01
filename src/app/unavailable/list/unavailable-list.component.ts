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
import { DialogComponent } from '../../shared/dialog/generic/dialog.component';
import { isSameTimeZone, newDateTimestamp } from '../../util/dates';
import { IUnavailable, IUnavailableAll } from '../../interfaces/unavailable';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { detailExpandAnimation } from '../../util/animation';
import { createDialog } from '../../util/helper';
import { SharedModule } from '../../shared/shared.module';
import { TimeDetailPipe } from '../../pipes/time-detail.pipe';
import { DurationTimePipe } from '../../pipes/durationTime.pipe';

@Component({
  selector: 'app-unavailable-list',
  templateUrl: './unavailable-list.component.html',
  styleUrls: ['./unavailable-list.component.scss'],
  animations: [detailExpandAnimation],
  imports: [SharedModule, TimeDetailPipe, DurationTimePipe]
})
export class UnavailableListComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  displayedColumns: string[] = ['position', 'professional', 'description', 'timestamp', 'duration', 'repeat',
    'actions'];
  dataSource: any = new MatTableDataSource<Pagination<IUnavailable>>();

  expandedUnavailable?: IUnavailable;

  resultsLength = DEFAULT_LENGTH;
  pageSize = PAGE_SIZE;

  dateFormat: string;
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
    this.getState = this.store.select(selectUnavailableState);
    this.dateFormat = this.translate.currentLang;
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

  edit = (unavailable: IUnavailable): void => this.store.dispatch(
    new fromActionsUnavailable.UnavailableSelected(unavailable)
  );

  delete = (unavailable: IUnavailable): void => {
    const title = this.translate.instant('UNAVAILABLE.DELETED.TITLE');
    const content = this.translate.instant('UNAVAILABLE.DELETED.CONTENT',
      { date: newDateTimestamp(unavailable.timestamp) });
    const dialogRef = this.dialog.open(DialogComponent, {
      data: { title, content, value: unavailable }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.store.dispatch(
          new fromActionsUnavailable.DeleteUnavailable(result)
        );
      }
    });
  }

  showTimeZone = (unavailable: IUnavailableAll): boolean => !isSameTimeZone(unavailable.professional.timeZone)

  openDialog = (unavailable: IUnavailableAll): void => {
    const time = newDateTimestamp(unavailable.timestamp);
    const name = unavailable.professional.displayName;
    const timeZone = unavailable.professional.timeZone;
    createDialog('PROFESSIONAL_INFO', name, this.dateFormat, this.translate, this.dialog, timeZone, time);
  }

  private clean = (): void => this.store.dispatch(new fromActionsUnavailable.Clean());

  private createPageSubscriptions = (): void => {
    this.sort.sortChange.subscribe(() => {
      this.paginator.pageIndex = 0;
      this.getUnavailableList();
    });
    this.paginatorSubscription =
      this.paginator?.page.subscribe(() => this.getUnavailableList(this.paginator.pageIndex));

    this.cdRef.detectChanges();
  }

  private getUnavailableList = (page: number = 0): void => this.store.dispatch(
    new fromActionsUnavailable.GetAll({
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
        this.getUnavailableList();
      }
      this.dataSource = state.data?.content;
      this.resultsLength = state.data?.totalElements;
      if (!this.paginatorSubscription && this.resultsLength) {
        this.createPageSubscriptions();
      }
    });
  }
}
