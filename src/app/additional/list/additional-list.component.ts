import { AfterViewInit, ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { DEFAULT_LENGTH, MOBILE_PAGE_SIZE, PAGE_SIZE, Pagination } from '../../interfaces/pagination';
import { IAdditional } from '../../interfaces/additional';
import { Observable, Subscription } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import { MatDialog } from '@angular/material/dialog';
import { Store } from '@ngrx/store';
import { AppState, selectAdditionalState } from '../../store/app.states';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import * as fromActionsAdditional from '../../store/additional.actions';
import { DialogComponent } from '../../shared/dialog/generic/dialog.component';
import { convertDuration } from '../../util/dates';
import { detailExpandAnimation } from '../../util/animation';
import { executeDialogNoWidth } from '../../util/helper';
import { SharedModule } from '../../shared/shared.module';

@Component({
  selector: 'app-additional-list',
  templateUrl: './additional-list.component.html',
  styleUrls: ['./additional-list.component.scss'],
  animations: [detailExpandAnimation],
  imports: [SharedModule]
})
export class AdditionalListComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  displayedColumns: string[] = ['order', 'name', 'description', 'duration', 'actions'];
  dataSource: any = new MatTableDataSource<Pagination<IAdditional>>();

  expandedAdditional: IAdditional | undefined;

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
    this.getState = this.store.select(selectAdditionalState);
    this.language = this.translate.currentLang;
  }

  ngAfterViewInit(): void {
    this.getAdditionalList();
  }

  ngOnInit(): void {
    this.clean();
    this.subscribe();
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
    this.paginatorSubscription?.unsubscribe();
  }

  edit = (additional: IAdditional): void => this.store.dispatch(
    new fromActionsAdditional.AdditionalSelected(additional)
  );

  delete = (additional: IAdditional): void => {
    const title = this.translate.instant('ADDITIONAL.DELETED.TITLE');
    const content = this.translate.instant('ADDITIONAL.DELETED.CONTENT', { name: additional.name });

    executeDialogNoWidth(this.dialog, DialogComponent, { title, content, value: additional }, result => {
      if (result) {
        this.store.dispatch(
          new fromActionsAdditional.DeleteAdditional(result)
        );
      }
    });
  };

  private clean = (): void => this.store.dispatch(new fromActionsAdditional.Clean());

  private createPageSubscriptions = (): void => {
    this.sort.sortChange.subscribe(() => {
      this.paginator.pageIndex = 0;
      this.getAdditionalList();
    });
    this.paginatorSubscription = this.paginator?.page.subscribe(() => this.getAdditionalList(this.paginator.pageIndex));

    this.cdRef.detectChanges();
  };

  private getAdditionalList = (page: number = 0): void => this.store.dispatch(
    new fromActionsAdditional.GetAll({
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
        this.getAdditionalList();
      }
      this.dataSource = state.data?.content?.map((additional: IAdditional) => {
        if (additional.duration) {
          const duration = convertDuration(additional.duration);

          return Object.assign({}, additional, { hour: duration.hour, minute: duration.minute });
        }
        return additional;
      });
      this.resultsLength = state.data?.totalElements;
      if (!this.paginatorSubscription && this.resultsLength) {
        this.createPageSubscriptions();
      }
    });
  };
}
