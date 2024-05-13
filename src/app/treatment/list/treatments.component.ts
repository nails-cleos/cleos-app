import { AfterViewInit, ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { DEFAULT_LENGTH, MOBILE_PAGE_SIZE, PAGE_SIZE, Pagination } from '../../interfaces/pagination';
import { ITreatment, ITreatmentGroup } from '../../interfaces/treatment';
import { Observable, Subscription } from 'rxjs';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { TranslateService } from '@ngx-translate/core';
import { MatDialog } from '@angular/material/dialog';
import { AppState, selectTreatmentState } from '../../store/app.states';
import { Store } from '@ngrx/store';
import * as fromActionsTreatment from '../../store/treatment.actions';
import { DialogComponent } from '../../shared/dialog/generic/dialog.component';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { detailExpandAnimation } from '../../util/animation';

@Component({
  selector: 'app-treatments',
  templateUrl: './treatments.component.html',
  styleUrls: ['./treatments.component.scss'],
  animations: [detailExpandAnimation]
})
export class TreatmentsComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  displayedColumns: string[] = ['order', 'name', 'priceFrom', 'actions'];
  dataSource: any = new MatTableDataSource<Pagination<ITreatmentGroup>>();

  resultsLength = DEFAULT_LENGTH;
  pageSize = PAGE_SIZE;

  expanded?: ITreatmentGroup;
  dateFormat: string;
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
    this.dateFormat = this.translate.currentLang;
    this.language = this.translate.currentLang;
    this.getState = this.store.select(selectTreatmentState);
  }

  ngAfterViewInit(): void {
    this.getTreatments();
  }

  ngOnInit(): void {
    this.clean();
    this.subscribe();
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
    this.paginatorSubscription?.unsubscribe();
  }

  delete(treatment: ITreatment): void {
    const title = this.translate.instant('TREATMENT.DELETED.TITLE');
    const content = this.translate.instant('TREATMENT.DELETED.CONTENT', {name: treatment.name});
    const dialogRef = this.dialog.open(DialogComponent, {
      data: {title, content, value: treatment}
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.store.dispatch(
          new fromActionsTreatment.DeleteTreatment(result.id)
        );
      }
    });
  }

  private createPageSubscriptions(): void {
    this.sort.sortChange.subscribe(() => {
      this.paginator.pageIndex = 0;
      this.getTreatments();
    });
    this.paginatorSubscription = this.paginator?.page.subscribe(() => this.getTreatments(this.paginator.pageIndex));

    this.cdRef.detectChanges();
  }

  private subscribe(): void {
    this.subscription = this.getState.subscribe((stateValue) => {
      if (stateValue.message) {
        this.clean();
        this.getTreatments();
      }
      this.dataSource = stateValue.data?.content;
      this.resultsLength = stateValue.data?.totalElements;
      if (!this.paginatorSubscription && this.resultsLength) {
        this.createPageSubscriptions();
      }
    });
  }

  private clean(): void {
    this.store.dispatch(
      new fromActionsTreatment.Clean()
    );
  }

  private getTreatments(page: number = 0): void {
    const payload = {
      active: this.sort.active,
      direction: this.sort.direction,
      size: this.pageSize,
      page
    };
    this.store.dispatch(
      new fromActionsTreatment.GetAll(payload)
    );
  }
}
