import { ChangeDetectionStrategy, Component, computed, effect, inject, signal } from '@angular/core';
import { getQuarterSummary } from '../../store/actions/dashboard.actions';
import { FormControl, FormGroup, NonNullableFormBuilder, ReactiveFormsModule } from '@angular/forms';
import {
  IMonthSummary,
  ISummaryRoom,
  ISummaryTotal,
  ISummaryTotals,
  MonthSummary,
  SummaryTotals,
  Total,
} from '../dashboard';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { map } from 'rxjs/operators';
import { Store } from '@ngrx/store';
import { Router, RouterLink } from '@angular/router';
import { MatDatepicker, MatDatepickerInput, MatDatepickerToggle } from '@angular/material/datepicker';
import { dateMonthYear, getDateQuarter, getNowTimeZone } from '../../util/dates';
import { AuthUserService } from '../../services/auth-user.service';
import { allElementsHaveSameKeyFilterValue, currencySymbol, getCurrencyFromRoom } from '../../util/helper';
import { ICurrencyAll } from '../../currency/currency';
import { createQuarterSummary } from '../../util/report';
import fs from 'file-saver';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { QuarterComponent } from './quarter/quarter.component';
import { TotalSummaryComponent } from '../total-summary/total-summary.component';
import { toSignal } from '@angular/core/rxjs-interop';
import {
  getQuarterNavigationParamsPipe,
  getQuarterSummaryMapPipe,
  isDashboardLoadingPipe,
} from '../../store/selectors/dashboard.selectors';
import { DashboardState } from '../../store/reducers/dashboard.reducers';
import { MatOption } from '@angular/material/core';
import { provideYearDateAdapter } from '../../util/adapter/app-date.provider';
import { MatFormField, MatInput, MatLabel } from '@angular/material/input';
import { MatSuffix } from '@angular/material/form-field';
import { MatSelect } from '@angular/material/select';
import { MatButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { KeyValuePipe } from '@angular/common';

type QuarterSummaryForm = {
  selectedRoom: FormControl<ISummaryRoom | 'All' | undefined>;
  selectedQuarter: FormControl<number>;
  date: FormControl<Date>;
}

@Component({
  selector: 'app-quarter-summary',
  templateUrl: './quarter-summary.component.html',
  styleUrls: ['./quarter-summary.component.scss'],
  imports: [QuarterComponent, TotalSummaryComponent, MatFormField, MatLabel, MatInput, MatDatepicker,
    MatDatepickerInput, MatDatepickerToggle, MatSelect, MatOption, MatButton, MatIcon, MatSuffix,
    ReactiveFormsModule, TranslatePipe, KeyValuePipe, RouterLink],
  providers: [...provideYearDateAdapter()],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class QuarterSummaryComponent {
  private readonly translate: TranslateService = inject(TranslateService);
  private readonly store: Store<DashboardState> = inject(Store<DashboardState>);
  private readonly router: Router = inject(Router);
  private readonly authUserService: AuthUserService = inject(AuthUserService);
  private readonly breakpointObserver: BreakpointObserver = inject(BreakpointObserver);
  private readonly formBuilder: NonNullableFormBuilder = inject(NonNullableFormBuilder);

  private quarterSummaryMap$ = this.store.pipe(getQuarterSummaryMapPipe);
  private navigationParams$ = this.store.pipe(getQuarterNavigationParamsPipe);
  private isLoading$ = this.store.pipe(isDashboardLoadingPipe);

  private now = getNowTimeZone();

  private authUserSignal = this.authUserService.authUser;
  private navigationParams = toSignal(this.navigationParams$);

  private primaryRoomSignal = signal<ISummaryRoom | undefined>(undefined);

  private userName = computed(() => this.authUserSignal()?.displayName);

  form: FormGroup<QuarterSummaryForm> = this.formBuilder.group<QuarterSummaryForm>({
    selectedRoom: this.formBuilder.control(undefined),
    selectedQuarter: this.formBuilder.control<number>(getDateQuarter(this.now)),
    date: this.formBuilder.control<Date>(this.now),
  });

  private dateSignal = toSignal(this.getForm.date.valueChanges);
  private selectedQuarterSignal = toSignal(this.getForm.selectedQuarter.valueChanges);
  private selectedRoomSignal = toSignal(this.getForm.selectedRoom.valueChanges);

  quarterSummaryMapSignal = toSignal(this.quarterSummaryMap$);
  isHandset = toSignal(
    this.breakpointObserver.observe([
      Breakpoints.XSmall,
      Breakpoints.Small,
      Breakpoints.Medium,
    ]).pipe(map(result => result.matches)),
    { initialValue: false },
  );

  showCash = computed(() => this.authUserSignal().showCash);
  currencySignal = computed(() => getCurrencyFromRoom(this.selectedRoomSignal(), this.primaryRoomSignal()));

  monthSummaries = signal<IMonthSummary[]>([]);
  quarter = signal<number>(getDateQuarter(getNowTimeZone()));
  year = signal<number>(getNowTimeZone().getFullYear());
  quarterSummaryTotals = signal<ISummaryTotals>(new SummaryTotals());
  readonly isLoading = toSignal(this.isLoading$, { initialValue: false });

  readonly language: string = this.translate.getCurrentLang();

  constructor() {
    // Effect to handle navigation params
    effect(() => {
      const params = this.navigationParams();
      if (params) {
        const now = getNowTimeZone();
        const year = params.year || now.getFullYear();
        const quarter = params.quarter || getDateQuarter(now);
        this.year.set(year);
        this.quarter.set(quarter);
        this.getForm.date.setValue(dateMonthYear(0, year));
        this.getForm.selectedQuarter.setValue(quarter);
      }
    });

    // Effect to handle quarter summary map changes
    effect(() => {
      const quarterSummaryMapValue = this.quarterSummaryMapSignal();
      if (quarterSummaryMapValue) {
        if (quarterSummaryMapValue.size === 1) {
          const room = quarterSummaryMapValue.keys().next().value;
          this.getForm.selectedRoom.setValue(room);
        } else {
          quarterSummaryMapValue.forEach((_, key) => {
            if (key.primary) {
              this.getForm.selectedRoom.setValue(key);
            }
          });
          if (quarterSummaryMapValue.size > 1 &&
            allElementsHaveSameKeyFilterValue(quarterSummaryMapValue, ['currency', 'id'])) {
            const selectedRoomValue = this.getForm.selectedRoom.value;
            if (selectedRoomValue && typeof selectedRoomValue !== 'string') {
              this.primaryRoomSignal.set(selectedRoomValue);
            }
          }
        }
      }
    });

    // Effect to fetch summary when date or quarter changes
    effect(() => {
      const date = this.dateSignal();
      const quarter = this.selectedQuarterSignal();
      if (date && quarter) {
        this.getSummary(date.getFullYear(), quarter);
      }
    });

    // Effect to create data when room selection changes
    effect(() => {
      const room = this.selectedRoomSignal();
      const quarterSummaryMap = this.quarterSummaryMapSignal();

      if (room) {
        if (room === 'All' && this.primaryRoom) {
          let result: IMonthSummary[] = [];
          quarterSummaryMap?.forEach((value) => {
            const monthSummaries: IMonthSummary[] = value.monthSummaries;
            if (!result?.length) {
              result = monthSummaries;
            } else {
              result = this.getAllMonthSummaries(monthSummaries, result);
            }
          });
          this.monthSummaries.set(result);
        } else if (room !== 'All') {
          const result = quarterSummaryMap?.get(room)?.monthSummaries || [];
          this.monthSummaries.set(result);
        }

        let totals = new Total();
        let totalsWithoutCash = new Total();
        const newQuarterSummaryTotals = new SummaryTotals();

        this.monthSummaries()?.forEach(value => {
          value.total.forEach(t => {
            switch (t.type) {
              case 'INCOME':
                newQuarterSummaryTotals.income = new Total(newQuarterSummaryTotals.income.gross + t.gross,
                  newQuarterSummaryTotals.income.btw + t.btw, newQuarterSummaryTotals.income.net + t.net);
                break;
              case 'EXPENSE':
                newQuarterSummaryTotals.expense = new Total(newQuarterSummaryTotals.expense.gross + t.gross,
                  newQuarterSummaryTotals.expense.btw + t.btw, newQuarterSummaryTotals.expense.net + t.net);
                break;
              case 'CASH':
                newQuarterSummaryTotals.cash = new Total(newQuarterSummaryTotals.cash.gross + t.gross,
                  newQuarterSummaryTotals.cash.btw + t.btw, newQuarterSummaryTotals.cash.net + t.net);
                break;
            }
          });
          totals = new Total(totals.gross + value.totalGross, totals.btw + value.totalBTW,
            totals.net + value.totalNet);
          totalsWithoutCash =
            new Total(totalsWithoutCash.gross + value.totalWithoutGross, totalsWithoutCash.btw + value.totalWithoutBTW,
              totalsWithoutCash.net + value.totalWithoutNet);
        });

        this.quarterSummaryTotals.set(
          new SummaryTotals(newQuarterSummaryTotals.income, newQuarterSummaryTotals.expense,
            newQuarterSummaryTotals.cash, totalsWithoutCash, totals),
        );
      }
    });
  }

  get getForm(): QuarterSummaryForm {
    return this.form.controls;
  }

  get primaryRoom(): ISummaryRoom | undefined {
    return this.primaryRoomSignal();
  }

  get quarterSummaryMap(): Map<ISummaryRoom, { monthSummaries: IMonthSummary[] }> | undefined {
    return this.quarterSummaryMapSignal();
  }

  get currency(): ICurrencyAll | undefined {
    return this.currencySignal();
  }

  goBack(): void {
    this.router.navigate([this.language, 'dashboard', 'year', 'summary'], { state: { year: this.year() } });
    return;
  }

  setYear = (normalizedMonthAndYear: Date, datepicker: MatDatepicker<Date>): void => {
    const ctrlValue = new Date(this.getForm.date.value);
    ctrlValue?.setFullYear(normalizedMonthAndYear.getFullYear());

    this.getForm.date.setValue(ctrlValue);

    datepicker.close();
  };

  exportQuarterSummary = (): void => {
    const monthSummariesValue = this.monthSummaries();
    if (monthSummariesValue?.length) {
      const now = getNowTimeZone();
      const quarter = this.selectedQuarterSignal() || getDateQuarter(getNowTimeZone());
      const year = this.year() || now.getFullYear();
      const workbook = createQuarterSummary(quarter, year, monthSummariesValue, this.quarterSummaryTotals(),
        currencySymbol(this.currencySignal()), this.translate);

      workbook.creator = this.userName() || '';
      workbook.created = getNowTimeZone();

      // Generate & Save Excel File
      workbook.xlsx.writeBuffer().then((content: any) => {
        const blob = new Blob([content], {
          type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        });
        fs.saveAs(blob, `Report_Q${quarter}_${year}.xlsx`);
      });
    }
  };

  private getAllMonthSummaries = (quarterSummaries: IMonthSummary[], result: IMonthSummary[]): IMonthSummary[] => {
    return result.map(m => {
      const month = quarterSummaries?.find(it => it.month === m.month);
      return new MonthSummary(m.month, m.total.map(t => {
        const total = month?.total?.find(it => it.type === t.type);
        const type = t.type;
        const net = t.net + (total?.net || 0);
        const btw = t.btw + (total?.btw || 0);
        const gross = t.gross + (total?.gross || 0);
        return { type, net, btw, gross } as ISummaryTotal;
      }));
    });
  };

  private getSummary = (year: number, quarter: number): void => {
    this.reset();
    this.year.set(year);
    this.quarter.set(quarter);
    this.store.dispatch(getQuarterSummary({ year, quarter }));
  };

  private reset = (): void => {
    this.monthSummaries.set([]);
    this.quarterSummaryTotals.set(new SummaryTotals());
  };
}
