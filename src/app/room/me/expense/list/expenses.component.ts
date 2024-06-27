import { AfterViewInit, ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { detailExpandAnimation } from '../../../../util/animation';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { DEFAULT_LENGTH, MOBILE_PAGE_SIZE, PAGE_SIZE, Pagination } from '../../../../interfaces/pagination';
import { IExpense, IExpenseAll } from '../../../../interfaces/expense';
import { Observable, Subscription } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import { MatDialog } from '@angular/material/dialog';
import { Store } from '@ngrx/store';
import { AppState, selectExpenseState } from '../../../../store/app.states';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import * as fromActionsExpense from '../../../../store/expense.actions';
import { DialogComponent } from '../../../../shared/dialog/generic/dialog.component';
import { ActivatedRoute } from '@angular/router';
import { getDateFormat, getNow, isSameTimeZone, newDateTimestamp } from '../../../../util/dates';
import { openDialog } from '../../../../util/helper';
import { DateAdapter } from '@angular/material/core';
import { YearMonthAdapter } from '../../../../util/adapter/year-month.adapter';
import { FormControl } from '@angular/forms';
import { MatDatepicker } from '@angular/material/datepicker';

@Component({
  selector: 'app-expenses',
  templateUrl: './expenses.component.html',
  styleUrls: ['./expenses.component.scss'],
  animations: [detailExpandAnimation],
  providers: [
    { provide: DateAdapter, useClass: YearMonthAdapter }
  ]
})
export class ExpensesComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  displayedColumns: string[] = ['position', 'invoice', 'supplyStore.name', 'timestamp', 'type', 'gross', 'btw', 'net', 'actions'];
  dataSource: any = new MatTableDataSource<Pagination<IExpense>>();
  expanded?: IExpense;

  resultsLength = DEFAULT_LENGTH;
  pageSize = PAGE_SIZE;
  roomId: string | null = null;
  dateFormat: string;
  language: string;
  date = new FormControl<Date | null>(null);
  private subscription: Subscription | undefined;

  private paginatorSubscription: Subscription | undefined;
  private getState: Observable<any>;
  private filter?: string;
  private dateFilter: string | null = null;

  constructor(private readonly translate: TranslateService, public dialog: MatDialog, private store: Store<AppState>,
              private cdRef: ChangeDetectorRef, breakpointObserver: BreakpointObserver, private route: ActivatedRoute) {
    breakpointObserver.observe([
      Breakpoints.XSmall,
      Breakpoints.Small
    ]).subscribe(result => {
      if (result.matches) {
        this.pageSize = MOBILE_PAGE_SIZE;
      }
    });
    this.getState = this.store.select(selectExpenseState);
    this.dateFormat = this.translate.currentLang;
    this.language = this.translate.currentLang;
  }

  ngAfterViewInit(): void {
    this.route.paramMap.subscribe(param => {
      this.roomId = param.get('id');
      this.getExpenses();
    });
  }

  ngOnInit(): void {
    this.clean();
    this.subscribe();
    this.valueChange();
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
    this.paginatorSubscription?.unsubscribe();
  }

  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.filter = filterValue.trim().toLowerCase();
    this.getExpenses(0);
  }

  showTimeZone(expense: IExpenseAll): boolean {
    return !isSameTimeZone(expense.room.timeZone);
  }

  setMonthAndYear(normalizedMonthAndYear: Date, datepicker: MatDatepicker<Date>): void {
    const ctrlValue = this.date.value || getNow();

    ctrlValue.setMonth(normalizedMonthAndYear.getMonth());
    ctrlValue.setFullYear(normalizedMonthAndYear.getFullYear());

    this.date.setValue(ctrlValue);

    datepicker.close();
  }

  keyDownHandler(event: any): void {
    if (event.code === 'Backspace') {
      this.date.setValue(null);
    }
  }

  openDialog(expense: IExpenseAll): void {
    const time = newDateTimestamp(expense.timestamp);
    openDialog(expense.room, this.dateFormat, this.translate, this.dialog, time);
  }

  edit(expense: IExpense): void {
    this.store.dispatch(
      new fromActionsExpense.ExpenseSelected({ expense, redirect: true })
    );
  }

  delete(expense: IExpense): void {
    const title = this.translate.instant('EXPENSE.DELETED.TITLE');
    const content = this.translate.instant('EXPENSE.DELETED.CONTENT', { invoice: expense.invoice });
    const dialogRef = this.dialog.open(DialogComponent, {
      data: { title, content, value: expense }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.store.dispatch(
          new fromActionsExpense.DeleteExpense({ roomId: this.roomId, id: result.id, invoice: result.invoice })
        );
      }
    });
  }

  private valueChange(): void {
    this.date.valueChanges.subscribe(value => {
      this.dateFilter = value ? getDateFormat(value) : value;
      this.getExpenses(0);
    });
  }

  private subscribe(): void {
    this.subscription = this.getState.subscribe((state) => {
      if (state.message) {
        this.clean();
        this.getExpenses();
      }
      this.dataSource = state.data?.content.map((expense: IExpenseAll) => {
        let net;
        if (expense.btw) {
          net = expense.gross / (expense.btw + 100) * 100;
        } else {
          net = expense.gross;
        }
        return Object.assign({}, expense, { net });
      });
      this.resultsLength = state.data?.totalElements;
      if (!this.paginatorSubscription && this.resultsLength) {
        this.createPageSubscriptions();
      }
    });
  }

  private clean(): void {
    this.store.dispatch(
      new fromActionsExpense.Clean()
    );
  }

  private createPageSubscriptions(): void {
    this.sort.sortChange.subscribe(() => {
      this.paginator.pageIndex = 0;
      this.getExpenses();
    });
    this.paginatorSubscription = this.paginator?.page.subscribe(() => this.getExpenses(this.paginator.pageIndex));

    this.cdRef.detectChanges();
  }

  private getExpenses(page: number = 0): void {
    const payload = {
      roomId: this.roomId,
      active: this.sort.active,
      direction: this.sort.direction,
      size: this.pageSize,
      filter: this.filter,
      dateFilter: this.dateFilter,
      page
    };
    this.paginatorSubscription?.unsubscribe();
    this.paginatorSubscription = undefined;
    this.store.dispatch(
      new fromActionsExpense.GetAll(payload)
    );
  }
}
