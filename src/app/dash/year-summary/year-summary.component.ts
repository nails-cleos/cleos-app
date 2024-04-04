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
import {
  IMonthlyExport,
  IQuarterSummary,
  ISummaryRoom,
  ISummaryTotal,
  ISummaryTotals,
  MonthSummary,
  QuarterSummary,
  SummaryTotals,
  Total
} from '../../interfaces/dashboard';
import * as fromActionsDashboard from '../../store/dashboard.actions';
import { Router } from '@angular/router';
import { AuthUserService } from '../../services/auth-user.service';
import { allElementsHaveSameKeyFilterValue, currencySymbol } from '../../util/helper';
import { ICurrencyAll } from '../../interfaces/currency';
import { createYearlyWorkbook } from '../../util/report';
import fs from 'file-saver';

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
  yearExport?: Map<ISummaryRoom, { monthlyExport: IMonthlyExport[] }>;
  yearSummaryMap?: Map<ISummaryRoom, { quarterSummaries: IQuarterSummary[] }>;
  quarterSummaries?: IQuarterSummary[];
  sheetData: IMonthlyExport[] = [];

  export = false;
  isExportLoading = false;
  isLoading = false;
  primaryRoom?: ISummaryRoom;
  currency?: ICurrencyAll;
  timeZone?: string;
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
  private userName?: string;

  constructor(private store: Store<AppState>, private breakpointObserver: BreakpointObserver, private router: Router,
              private authUserService: AuthUserService) {
    this.getState = this.store.select(selectDashboardState);
    this.extras = this.router.getCurrentNavigation()?.extras.state;
    this.showCash = false;
    this.authUserService.authUser.subscribe(value => {
      this.userName = value.displayName;
      this.showCash = value.showCash;
    });
  }

  get exportAction(): void {
    if (this.date.value) {
      if (this.export) {
        this.exportToExcel();
      } else {
        this.getExportData(this.date.value.getFullYear());
      }
    }
    return;
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
        this.createExportData();
      }
    });
    this.date.valueChanges.subscribe(value => {
      if (value) {
        this.getSummary(value.getFullYear());
      }
    });
  }

  private createData(): void {
    const room = this.selectedRoom.value;
    if (room) {
      if (room === 'All' && this.yearSummaryMap) {
        this.currency = this.primaryRoom?.currency;
        this.timeZone = this.primaryRoom?.timeZone;
        let result: IQuarterSummary[] | undefined;
        this.yearSummaryMap.forEach((value) => {
          const quarterSummaries: IQuarterSummary[] = value.quarterSummaries;
          if (!result?.length) {
            result = quarterSummaries;
          } else {
            this.quarterSummaries = this.getAllQuarterSummaries(quarterSummaries, result);
          }
        });
      } else {
        this.quarterSummaries = this.yearSummaryMap?.get(room)?.quarterSummaries;
        this.currency = room.currency;
        this.timeZone = room.timeZone;
      }
      this.yearSummaryTotals = new SummaryTotals();
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

  private getAllQuarterSummaries(quarterSummaries: IQuarterSummary[], result: IQuarterSummary[]): IQuarterSummary[] {
    return result.map(q => {
      const quarter = quarterSummaries.find(it => it.quarter === q.quarter);
      return new QuarterSummary(q.quarter, q.monthSummaries.map(m => {
        const month = quarter?.monthSummaries?.find(it => it.month === m.month);
        return new MonthSummary(m.month, m.total.map(t => {
          const total = month?.total?.find(it => it.type === t.type);
          const type = t.type;
          const net = t.net + (total?.net || 0);
          const btw = t.btw + (total?.btw || 0);
          const gross = t.gross + (total?.gross || 0);
          return { type, net, btw, gross } as ISummaryTotal;
        }));
      }));
    });
  }

  private createExportData(): void {
    this.sheetData = [];
    const room = this.selectedRoom.value;
    if (room) {
      if (room === 'All' && this.yearExport) {
        this.yearExport.forEach(({ monthlyExport }) => {
          monthlyExport.forEach(({ month, saleSummary, expenseSummary, cashSaleSummary }) => {
            const existingIndex = this.sheetData.findIndex(item => item.month === month);
            if (existingIndex !== -1) {
              this.sheetData[existingIndex].saleSummary.push(...saleSummary);
              this.sheetData[existingIndex].expenseSummary.push(...expenseSummary);
              this.sheetData[existingIndex].cashSaleSummary.push(...cashSaleSummary);
            } else {
              this.sheetData.push({
                month,
                saleSummary: [...saleSummary],
                expenseSummary: [...expenseSummary],
                cashSaleSummary: [...cashSaleSummary]
              });
            }
          });
        });
        this.sheetData = this.sheetData.sort((a, b) => a.month - b.month);
      } else {
        this.yearExport?.forEach(({ monthlyExport }, key) => {
          if (key.roomId === room.roomId) {
            this.sheetData = monthlyExport;
            return;
          }
        });
      }
    }
  }

  private exportToExcel(): void {
    if (this.sheetData.length) {
      const workbook = createYearlyWorkbook(this.sheetData, this.date.value || getNow(), currencySymbol(this.currency), this.timeZone);

      workbook.creator = this.userName || '';
      workbook.created = getNow();

      // Generate & Save Excel File
      workbook.xlsx.writeBuffer().then((content) => {
        const blob = new Blob([content], {
          type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        });
        fs.saveAs(blob, `Report_${ this.date.value?.getFullYear() }.xlsx`);
      });
    }
  }

  private reset(): void {
    this.quarterSummaries = undefined;
    this.yearSummaryTotals = new SummaryTotals();
    this.selectedRoom.setValue(null);
    this.primaryRoom = undefined;
    this.export = false;
  }

  private getSummary(year: number): void {
    this.reset();
    this.isLoading = true;
    this.store.dispatch(
      new fromActionsDashboard.GetYearSummary(year)
    );
  }

  private getExportData(year: number): void {
    this.isExportLoading = true;
    this.store.dispatch(
      new fromActionsDashboard.GetYearExport(year)
    );
  }

  private clean(): void {
    this.store.dispatch(
      new fromActionsDashboard.Clean()
    );
  }

  private subscribe(): void {
    this.subscription = this.getState.subscribe(state => {
      this.yearSummaryMap = state.yearSummaryMap;
      if (this.yearSummaryMap) {
        if (this.yearSummaryMap.size === 1) {
          this.selectedRoom.setValue(this.yearSummaryMap.keys().next().value);
        } else {
          this.yearSummaryMap.forEach((_, key) => {
            if (key.primary) {
              this.selectedRoom.setValue(key);
            }
          });
          if (this.yearSummaryMap.size > 1 && allElementsHaveSameKeyFilterValue(this.yearSummaryMap, ['currency', 'id'])) {
            this.primaryRoom = this.selectedRoom.value;
          }
        }
        this.isLoading = false;
      }
      this.yearExport = state.yearExport;
      if (this.yearExport) {
        this.sheetData = [];
        this.createExportData();
        this.isExportLoading = false;
        this.export = true;
      }
    });
  }
}
