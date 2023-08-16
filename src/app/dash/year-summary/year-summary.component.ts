import { Component, OnDestroy, OnInit } from '@angular/core';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Observable, Subscription } from 'rxjs';
import { map, shareReplay } from 'rxjs/operators';
import { MatDatepicker } from '@angular/material/datepicker';
import { FormControl, UntypedFormControl } from '@angular/forms';
import { DateAdapter } from '@angular/material/core';
import { YearAdapter } from '../../util/adapter/year.adapter';
import { dateMonthYear, getNow } from '../../util/dates';
import { AppState, selectDashboardState } from '../../store/app.states';
import { Store } from '@ngrx/store';
import { IQuarterSummary, ISummaryRoom, ISummaryTotals, SummaryTotals, Total } from '../../interfaces/dashboard';
import * as fromActionsDashboard from '../../store/dashboard.actions';
import { Router } from '@angular/router';
import { AuthUserService } from '../../services/auth-user.service';

@Component({
  selector: 'app-year-summary',
  templateUrl: './year-summary.component.html',
  styleUrls: ['./year-summary.component.scss'],
  providers: [
    { provide: DateAdapter, useClass: YearAdapter }
  ]
})
export class YearSummaryComponent implements OnInit, OnDestroy {
  date = new FormControl<Date | null>(null);
  selectedRoom = new UntypedFormControl();
  yearSummaryMap?: Map<ISummaryRoom, { quarterSummaries: IQuarterSummary[] }>;
  quarterSummaries?: IQuarterSummary[];

  isLoading = false;
  yearSummaryTotals: ISummaryTotals = new SummaryTotals();
  showCash: boolean;

  isHandset$: Observable<boolean> = this.breakpointObserver.observe([
    Breakpoints.XSmall,
    Breakpoints.Small,
    Breakpoints.Medium
  ]).pipe(map(result => result.matches), shareReplay());

  private getState: Observable<any>;
  private subscription?: Subscription;
  private readonly extras: any;

  constructor(private store: Store<AppState>, private breakpointObserver: BreakpointObserver, private router: Router,
              private authUserService: AuthUserService) {
    this.getState = this.store.select(selectDashboardState);
    this.extras = this.router.getCurrentNavigation()?.extras.state;
    this.showCash = false;
    this.authUserService.authUser.subscribe(value => this.showCash = value.showCash);
  }

  ngOnInit(): void {
    this.subscribe();
    this.clean();
    this.valueChange();
    const now = getNow();
    if (this.extras) {
      this.date.setValue(dateMonthYear(now.getMonth(), this.extras.year));
    } else {
      this.date.setValue(now);
    }
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }

  setYear(normalizedMonthAndYear: Date, datepicker: MatDatepicker<Date>): void {
    const ctrlValue = this.date.value;
    ctrlValue?.setFullYear(normalizedMonthAndYear.getFullYear());

    this.date.setValue(ctrlValue);

    datepicker.close();
  }

  private valueChange(): void {
    this.selectedRoom.valueChanges.subscribe(value => {
      if (value) {
        this.createData();
      }
    });
    this.date.valueChanges.subscribe(value => {
      if (value) {
        this.getSummary(value.getFullYear());
      }
    });
  }

  private subscribe(): void {
    this.subscription = this.getState.subscribe(state => {
      this.yearSummaryMap = state.yearSummaryMap;
      if (this.yearSummaryMap) {
        this.isLoading = false;
        if (this.yearSummaryMap?.size === 1) {
          const [room] = this.yearSummaryMap.keys();
          this.selectedRoom.setValue(room);
        }
      }
    });
  }

  private createData(): void {
    if (this.selectedRoom.value) {
      this.quarterSummaries = this.yearSummaryMap?.get(this.selectedRoom.value)?.quarterSummaries;
      this.quarterSummaries?.forEach(q => {
        q.monthSummaries.forEach(value => {
          value.total.forEach(t => {
            switch (t.type) {
              case 'INCOME':
                this.yearSummaryTotals.income = new Total(this.yearSummaryTotals.income.gross + t.gross,
                  this.yearSummaryTotals.income.btw + t.btw, this.yearSummaryTotals.income.net + t.net);
                break;
              case 'EXPENSE':
                this.yearSummaryTotals.expense = new Total(this.yearSummaryTotals.expense.gross + t.gross,
                  this.yearSummaryTotals.expense.btw + t.btw, this.yearSummaryTotals.expense.net + t.net);
                break;
              case 'CASH':
                this.yearSummaryTotals.cash = new Total(this.yearSummaryTotals.cash.gross + t.gross,
                  this.yearSummaryTotals.cash.btw + t.btw, this.yearSummaryTotals.cash.net + t.net);
                break;
            }
          });
          this.yearSummaryTotals.totals = new Total(this.yearSummaryTotals.totals.gross + value.totalGross,
            this.yearSummaryTotals.totals.btw + value.totalBTW, this.yearSummaryTotals.totals.net + value.totalNet);
          this.yearSummaryTotals.totalsWithoutCash = new Total(this.yearSummaryTotals.totalsWithoutCash.gross + value.totalWithoutGross,
            this.yearSummaryTotals.totalsWithoutCash.btw + value.totalWithoutBTW,
            this.yearSummaryTotals.totalsWithoutCash.net + value.totalWithoutNet);
        });
      });
    }
  }

  private reset(): void {
    this.quarterSummaries = undefined;
    this.yearSummaryTotals = new SummaryTotals();
  }

  private getSummary(year: number): void {
    this.reset();
    this.isLoading = true;
    this.store.dispatch(
      new fromActionsDashboard.GetYearSummary(year)
    );
  }

  private clean(): void {
    this.store.dispatch(
      new fromActionsDashboard.Clean()
    );
  }
}
