import { ChangeDetectionStrategy, Component, computed, effect, inject, signal } from '@angular/core';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Observable } from 'rxjs';
import { map, shareReplay } from 'rxjs/operators';
import { MatDatepicker, MatDatepickerInput, MatDatepickerToggle } from '@angular/material/datepicker';
import { FormControl, FormGroup, NonNullableFormBuilder, ReactiveFormsModule } from '@angular/forms';
import { dateMonthYear, getNowTimeZone } from '../../util/dates';
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
  Total,
} from '../../interfaces/dashboard';
import { exportYearSummary, getYearSummary } from '../../store/dashboard.actions';
import { AuthUserService } from '../../services/auth-user.service';
import {
  allElementsHaveSameKeyFilterValue,
  currencySymbol,
  getCurrencyFromRoom,
  getTimeZoneFromRoom,
} from '../../util/helper';
import { createYearlyWorkbook } from '../../util/report';
import fs from 'file-saver';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { YearComponent } from './year/year.component';
import { TotalSummaryComponent } from '../total-summary/total-summary.component';
import { toSignal } from '@angular/core/rxjs-interop';
import {
  getYearExportPipe,
  getYearNavigationParamsPipe,
  getYearSummaryMapPipe,
  isDashboardLoadingPipe,
} from '../../store/selectors/dashboard.selectors';
import { DashboardState } from '../../store/reducers/dashboard.reducers';
import { MatOption } from '@angular/material/core';
import { provideYearDateAdapter } from '../../util/adapter/app-date.provider';
import { EnvService } from '../../services/env.service';
import { MatFormField, MatInput, MatLabel } from '@angular/material/input';
import { MatSuffix } from '@angular/material/form-field';
import { MatSelect } from '@angular/material/select';
import { MatIcon } from '@angular/material/icon';
import { MatButton } from '@angular/material/button';
import { AsyncPipe, KeyValuePipe } from '@angular/common';
import { RouterLink } from '@angular/router';

type YearSummaryForm = {
  date: FormControl<Date>;
  selectedRoom: FormControl<ISummaryRoom | 'All' | undefined>;
}

@Component({
  selector: 'app-year-summary',
  templateUrl: './year-summary.component.html',
  styleUrls: ['./year-summary.component.scss'],
  imports: [MatFormField, MatLabel, MatInput, MatDatepickerInput, MatDatepickerToggle, MatDatepicker, MatSelect,
    MatOption, MatIcon, MatButton, MatSuffix, ReactiveFormsModule, TranslatePipe, KeyValuePipe,
    RouterLink, YearComponent, TotalSummaryComponent, AsyncPipe],
  providers: [...provideYearDateAdapter()],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class YearSummaryComponent {
  private readonly env: EnvService = inject(EnvService);
  private readonly translate: TranslateService = inject(TranslateService);
  private readonly store: Store<DashboardState> = inject(Store<DashboardState>);
  private readonly authUserService: AuthUserService = inject(AuthUserService);
  private readonly formBuilder: NonNullableFormBuilder = inject(NonNullableFormBuilder);
  private readonly breakpointObserver: BreakpointObserver = inject(BreakpointObserver);

  private yearSummaryMap$ = this.store.pipe(getYearSummaryMapPipe);
  private yearExport$ = this.store.pipe(getYearExportPipe);
  private navigationParams$ = this.store.pipe(getYearNavigationParamsPipe);
  private isLoading$ = this.store.pipe(isDashboardLoadingPipe);

  private authUserSignal = this.authUserService.authUser;

  private primaryRoomSignal = signal<ISummaryRoom | undefined>(undefined);
  private quarterSummariesSignal = signal<IQuarterSummary[] | undefined>(undefined);
  private sheetDataSignal = signal<IMonthlyExport[]>([]);
  private readonly exportSignal = signal<boolean>(false);
  private navigationParams = toSignal(this.navigationParams$);
  readonly isLoading = toSignal(this.isLoading$, { initialValue: false });

  private userName = computed(() => this.authUserSignal()?.displayName);

  form: FormGroup<YearSummaryForm> = this.formBuilder.group<YearSummaryForm>({
    date: this.formBuilder.control(getNowTimeZone()),
    selectedRoom: this.formBuilder.control(undefined),
  });

  private dateSignal = toSignal(this.getForm.date.valueChanges);
  private selectedRoomSignal = toSignal(this.getForm.selectedRoom.valueChanges);

  private timeZone = computed(() => getTimeZoneFromRoom(this.selectedRoomSignal(), this.primaryRoomSignal()));

  yearSummaryMapSignal = toSignal(this.yearSummaryMap$);
  yearExportSignal = toSignal(this.yearExport$);

  showCash = computed(() => this.authUserSignal()?.showCash || false);
  currencySignal = computed(() => getCurrencyFromRoom(this.selectedRoomSignal(), this.primaryRoomSignal()));
  yearSummaryTotalsSignal = computed(() => {
    const quarterSummaries = this.quarterSummariesSignal();
    const yearSummaryTotals: ISummaryTotals = new SummaryTotals();

    quarterSummaries?.forEach(q => {
      q.monthSummaries.forEach(value => {
        value.total.forEach(t => {
          switch (t.type) {
            case 'INCOME':
              yearSummaryTotals.income = new Total(yearSummaryTotals.income.gross + t.gross,
                yearSummaryTotals.income.btw + t.btw, yearSummaryTotals.income.net + t.net);
              break;
            case 'EXPENSE':
              yearSummaryTotals.expense = new Total(yearSummaryTotals.expense.gross + t.gross,
                yearSummaryTotals.expense.btw + t.btw, yearSummaryTotals.expense.net + t.net);
              break;
            case 'CASH':
              yearSummaryTotals.cash = new Total(yearSummaryTotals.cash.gross + t.gross,
                yearSummaryTotals.cash.btw + t.btw, yearSummaryTotals.cash.net + t.net);
              break;
          }
        });
        yearSummaryTotals.totals = new Total(yearSummaryTotals.totals.gross + value.totalGross,
          yearSummaryTotals.totals.btw + value.totalBTW, yearSummaryTotals.totals.net + value.totalNet);
        yearSummaryTotals.totalsWithoutCash =
          new Total(yearSummaryTotals.totalsWithoutCash.gross + value.totalWithoutGross,
            yearSummaryTotals.totalsWithoutCash.btw + value.totalWithoutBTW,
            yearSummaryTotals.totalsWithoutCash.net + value.totalWithoutNet);
      });
    });

    return yearSummaryTotals;
  });

  isHandset$: Observable<boolean> = this.breakpointObserver.observe([
    Breakpoints.XSmall,
    Breakpoints.Small,
    Breakpoints.Medium,
  ]).pipe(map(result => result.matches), shareReplay());

  isExportLoading = signal<boolean>(false);
  language: string = this.translate.getCurrentLang();

  constructor() {
    effect(() => {
      const params = this.navigationParams();
      if (params) {
        const now = getNowTimeZone(this.timeZone());
        this.getForm.date.setValue(dateMonthYear(now.getMonth(), params.year || now.getFullYear()));
      }
    });

    // Effect for handling date changes
    effect(() => {
      const value = this.dateSignal();
      if (value) {
        this.getSummary(value.getFullYear());
      }
    });

    // Effect for handling yearSummaryMap changes
    effect(() => {
      const yearSummaryMapValue = this.yearSummaryMapSignal();
      if (yearSummaryMapValue) {
        if (yearSummaryMapValue.size === 1) {
          const room = yearSummaryMapValue.keys().next().value;
          this.getForm.selectedRoom.setValue(room);
        } else {
          yearSummaryMapValue.forEach((_, key) => {
            if (key.primary) {
              this.getForm.selectedRoom.setValue(key);
            }
          });
          if (yearSummaryMapValue.size > 1 &&
            allElementsHaveSameKeyFilterValue(yearSummaryMapValue, ['currency', 'id'])) {
            const selectedRoomValue = this.getForm.selectedRoom.value;
            if (selectedRoomValue && typeof selectedRoomValue !== 'string') {
              this.primaryRoomSignal.set(selectedRoomValue);
            }
          }
        }
      }
    });

    // Effect for handling room selection changes
    effect(() => {
      const room = this.selectedRoomSignal();
      const yearSummaryMapValue = this.yearSummaryMapSignal();

      if (room && yearSummaryMapValue) {
        if (room === 'All' && this.primaryRoom) {
          let result: IQuarterSummary[] | undefined;
          yearSummaryMapValue.forEach((value) => {
            const quarterSummaries: IQuarterSummary[] = value.quarterSummaries;
            if (!result?.length) {
              result = quarterSummaries;
            } else {
              result = this.getAllQuarterSummaries(quarterSummaries, result);
            }
          });
          this.quarterSummariesSignal.set(result);
        } else if (room !== 'All') {
          this.quarterSummariesSignal.set(yearSummaryMapValue.get(room)?.quarterSummaries);
        }
      }
    });

    // Effect for handling yearExport changes
    effect(() => {
      const yearExportValue = this.yearExportSignal();
      if (yearExportValue) {
        this.createExportData(yearExportValue);
        this.isExportLoading.set(false);
        this.exportSignal.set(true);
      }
    });
  }

  get getForm(): YearSummaryForm {
    return this.form.controls;
  }

  get primaryRoom(): ISummaryRoom | undefined {
    return this.primaryRoomSignal();
  }

  get quarterSummaries(): IQuarterSummary[] | undefined {
    return this.quarterSummariesSignal();
  }

  get yearSummaryMap(): Map<ISummaryRoom, { quarterSummaries: IQuarterSummary[] }> | undefined {
    return this.yearSummaryMapSignal();
  }

  get sheetData(): IMonthlyExport[] {
    return this.sheetDataSignal();
  }

  get export(): boolean {
    return this.exportSignal();
  }

  get yearExport(): Map<ISummaryRoom, { monthlyExport: IMonthlyExport[] }> | undefined {
    return this.yearExportSignal();
  }

  exportAction(): void {
    if (this.getForm.date.value) {
      if (this.export) {
        this.exportToExcel();
      } else {
        this.getExportData(this.getForm.date.value.getFullYear());
      }
    }
    return;
  }

  setYear = (normalizedMonthAndYear: Date, datepicker: MatDatepicker<Date>): void => {
    const ctrlValue = new Date(this.getForm.date.value);
    ctrlValue?.setFullYear(normalizedMonthAndYear.getFullYear());

    this.getForm.date.setValue(ctrlValue);

    datepicker.close();
  };

  private getAllQuarterSummaries = (
    quarterSummaries: IQuarterSummary[],
    result: IQuarterSummary[],
  ): IQuarterSummary[] => result.map(q => {
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

  private createExportData = (yearExport: Map<ISummaryRoom, { monthlyExport: IMonthlyExport[] }>): void => {
    const sheetData: IMonthlyExport[] = [];
    const room = this.selectedRoomSignal();
    if (room) {
      if (room === 'All') {
        yearExport?.forEach(({ monthlyExport }) => {
          monthlyExport.forEach(({ month, saleSummary, expenseSummary, cashSummary }) => {
            const existingIndex = sheetData.findIndex(item => item.month === month);
            if (existingIndex !== -1) {
              sheetData[existingIndex].saleSummary.push(...saleSummary);
              sheetData[existingIndex].expenseSummary.push(...expenseSummary);
              sheetData[existingIndex].cashSummary.push(...cashSummary);
            } else {
              sheetData.push({
                month,
                saleSummary: [...saleSummary],
                expenseSummary: [...expenseSummary],
                cashSummary: [...cashSummary],
              });
            }
          });
        });
        this.sheetDataSignal.set(sheetData.sort((a, b) => a.month - b.month));
      } else {
        yearExport?.forEach(({ monthlyExport }, key) => {
          if (key.roomId === room.roomId) {
            this.sheetDataSignal.set(monthlyExport);
            return;
          }
        });
      }
    }
  };

  private exportToExcel = (): void => {
    const sortedSheetData = this.sheetData.map(monthly => ({
      ...monthly,
      saleSummary: [...monthly.saleSummary].sort((a, b) => a.timestamp - b.timestamp),
      expenseSummary: [...monthly.expenseSummary].sort((a, b) => a.timestamp - b.timestamp),
      cashSaleSummary: [...monthly.cashSummary].sort((a, b) => a.timestamp - b.timestamp),
    }));
    if (sortedSheetData.length) {
      const workbook = createYearlyWorkbook(sortedSheetData, this.getForm.date.value || getNowTimeZone(this.timeZone()),
        currencySymbol(this.currencySignal()), this.timeZone(), this.translate, this.env);

      workbook.creator = this.userName() || '';
      workbook.created = getNowTimeZone(this.timeZone());

      // Generate & Save Excel File
      workbook.xlsx.writeBuffer().then((content: any) => {
        const blob = new Blob([content], {
          type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        });
        fs.saveAs(blob, `Report_${ this.getForm.date.value?.getFullYear() }.xlsx`);
      });
    }
  };

  private getSummary = (year: number): void => {
    this.quarterSummariesSignal.set(undefined);
    this.primaryRoomSignal.set(undefined);
    this.exportSignal.set(false);
    this.store.dispatch(getYearSummary({ year }));
  };

  private getExportData = (year: number): void => {
    this.isExportLoading.set(true);
    this.store.dispatch(exportYearSummary({ year }));
  };
}
