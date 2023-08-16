import { Component, OnDestroy, OnInit } from '@angular/core';
import * as fromActionsDashboard from '../../store/dashboard.actions';
import { FormControl, UntypedFormControl } from '@angular/forms';
import { IMonthSummary, ISummaryRoom, ISummaryTotals, SummaryTotals, Total } from '../../interfaces/dashboard';
import { Observable, Subscription } from 'rxjs';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { map, shareReplay } from 'rxjs/operators';
import { Store } from '@ngrx/store';
import { AppState, selectDashboardState } from '../../store/app.states';
import { ActivatedRoute, Router } from '@angular/router';
import { DateAdapter } from '@angular/material/core';
import { YearAdapter } from '../../util/adapter/year.adapter';
import { MatDatepicker } from '@angular/material/datepicker';
import { dateMonthYear, getDateQuarter, getNow } from '../../util/dates';
import { AuthUserService } from '../../services/auth-user.service';

@Component({
  selector: 'app-quarter-summary',
  templateUrl: './quarter-summary.component.html',
  styleUrls: ['./quarter-summary.component.scss'],
  providers: [
    { provide: DateAdapter, useClass: YearAdapter }
  ]
})
export class QuarterSummaryComponent implements OnInit, OnDestroy {

  selectedRoom = new UntypedFormControl();
  selectedQuarter = new FormControl<number | null>(null);
  date = new FormControl<Date | null>(null);
  quarterSummaryMap?: Map<ISummaryRoom, { monthSummaries: IMonthSummary[] }>;
  monthSummaries?: IMonthSummary[];

  isLoading = false;
  quarter?: number;
  year?: number;
  quarterSummaryTotals: ISummaryTotals = new SummaryTotals();
  showCash: boolean;

  isHandset$: Observable<boolean> = this.breakpointObserver.observe([
    Breakpoints.XSmall,
    Breakpoints.Small,
    Breakpoints.Medium
  ]).pipe(map(result => result.matches), shareReplay());

  private getState: Observable<any>;
  private subscription?: Subscription;
  private readonly extras: any;

  constructor(private store: Store<AppState>, private breakpointObserver: BreakpointObserver, private route: ActivatedRoute,
              private router: Router, private authUserService: AuthUserService) {
    this.showCash = false;
    this.getState = this.store.select(selectDashboardState);
    this.extras = this.router.getCurrentNavigation()?.extras.state;
    this.authUserService.authUser.subscribe(value => {
      this.showCash = value.showCash;
    });
  }

  get goBack(): void {
    this.router.navigate(['dashboard', 'year', 'summary'], { state: { year: this.year } });
    return;
  }

  ngOnInit(): void {
    this.subscribe();
    this.clean();
    this.valueChange();
    const now = getNow();
    if (this.extras) {
      const year = this.extras.year || now.getFullYear();
      this.year = year;
      const quarter = this.extras.quarter || getDateQuarter(now);
      this.quarter = quarter;
      this.date.setValue(dateMonthYear(0, year));
      this.selectedQuarter.setValue(quarter);
    } else {
      this.date.setValue(now);
      this.selectedQuarter.setValue(getDateQuarter(now));
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
    this.selectedQuarter.valueChanges.subscribe(value => {
      if (value && this.date.value) {
        this.getSummary(this.date.value.getFullYear(), value);
      }
    });
    this.date.valueChanges.subscribe(value => {
      if (value && this.selectedQuarter.value) {
        this.getSummary(value.getFullYear(), this.selectedQuarter.value);
      }
    });
  }

  private subscribe(): void {
    this.subscription = this.getState.subscribe(state => {
      this.quarterSummaryMap = state.quarterSummaryMap;
      if (this.quarterSummaryMap) {
        this.isLoading = false;
        if (this.quarterSummaryMap?.size === 1) {
          const [room] = this.quarterSummaryMap.keys();
          this.selectedRoom.setValue(room);
        }
      }
    });
  }

  private createData(): void {
    if (this.selectedRoom.value) {
      this.monthSummaries = this.quarterSummaryMap?.get(this.selectedRoom.value)?.monthSummaries;
      let totals = new Total();
      let totalsWithoutCash = new Total();
      this.monthSummaries?.forEach(value => {
        value.total.forEach(t => {
          switch (t.type) {
            case 'INCOME':
              this.quarterSummaryTotals.income = new Total(this.quarterSummaryTotals.income.gross + t.gross,
                this.quarterSummaryTotals.income.btw + t.btw, this.quarterSummaryTotals.income.net + t.net);
              break;
            case 'EXPENSE':
              this.quarterSummaryTotals.expense = new Total(this.quarterSummaryTotals.expense.gross + t.gross,
                this.quarterSummaryTotals.expense.btw + t.btw, this.quarterSummaryTotals.expense.net + t.net);
              break;
            case 'CASH':
              this.quarterSummaryTotals.cash = new Total(this.quarterSummaryTotals.cash.gross + t.gross,
                this.quarterSummaryTotals.cash.btw + t.btw, this.quarterSummaryTotals.cash.net + t.net);
              break;
          }
        });
        totals = new Total(totals.gross + value.totalGross, totals.btw + value.totalBTW,
          totals.net + value.totalNet);
        totalsWithoutCash = new Total(totalsWithoutCash.gross + value.totalWithoutGross, totalsWithoutCash.btw + value.totalWithoutBTW,
          totalsWithoutCash.net + value.totalWithoutNet);

        this.quarterSummaryTotals = new SummaryTotals(this.quarterSummaryTotals.income, this.quarterSummaryTotals.expense,
          this.quarterSummaryTotals.cash, totalsWithoutCash, totals);
      });
    }
  }

  private getSummary(year: number, quarter: number): void {
    this.reset();
    this.year = year;
    this.quarter = quarter;
    this.isLoading = true;
    this.store.dispatch(
      new fromActionsDashboard.GetQuarterSummary({ year, quarter })
    );
  }

  private reset(): void {
    this.monthSummaries = undefined;
    this.quarterSummaryTotals = new SummaryTotals();
  }

  private clean(): void {
    this.store.dispatch(
      new fromActionsDashboard.Clean()
    );
  }
}
