import { ChangeDetectionStrategy, Component, computed, effect, inject, signal } from '@angular/core';
import { FormControl, FormGroup, NonNullableFormBuilder, ReactiveFormsModule } from '@angular/forms';
import { MatDatepicker, MatDatepickerInput, MatDatepickerToggle } from '@angular/material/datepicker';
import { toSignal } from '@angular/core/rxjs-interop';
import {
  dateMonthYear,
  getDateFormat,
  getDateQuarter,
  getNowTimeZone,
  getWeeksInMonth,
  monthViewTitle,
  newDateTimestamp,
} from '../../util/dates';
import { Store } from '@ngrx/store';
import {
  getMonthlyNavigationParamsPipe,
  getMonthlySummaryMapPipe,
  isDashboardLoadingPipe,
} from '../../store/selectors/dashboard.selectors';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { getMonthlySummary, updateMonthlySummary } from '../../store/dashboard.actions';
import {
  AmountFormat,
  ExpenseType,
  IMonthlySummary,
  IMonthlySummaryExpense,
  IMonthlySummaryRequest,
  IMonthlySummarySale,
  ISummaryRoom,
  ISummaryTotal,
  ITotal,
  ITotalType,
  SummaryType,
  TotalType,
} from '../../interfaces/dashboard';
import {
  allElementsHaveSameKeyFilterValue,
  currencySymbol,
  getCurrencyFromRoom,
  getTimeZoneFromRoom,
  titleCase,
} from '../../util/helper';
import { Router, RouterLink } from '@angular/router';
import { AuthUserService } from '../../services/auth-user.service';
import fs from 'file-saver';
import { createMonthlyExpenseWorkbook, createMonthlyIncomeWorkbook, createMonthlySummary } from '../../util/report';
import { FilterByPipe } from '../../pipes/filterBy.pipe';
import { TimeDetailPipe } from '../../pipes/time-detail.pipe';
import { TwoDigitsDirective } from '../../directives/two-digits.directive';
import { DashboardState } from '../../store/reducers/dashboard.reducers';
import { MatOption } from '@angular/material/core';
import { provideYearMonthDateAdapter } from '../../util/adapter/app-date.provider';
import { EnvService } from '../../services/env.service';
import { MatFormField, MatInput, MatLabel } from '@angular/material/input';
import { MatSuffix } from '@angular/material/form-field';
import { MatSelect } from '@angular/material/select';
import { MatIcon } from '@angular/material/icon';
import { MatList, MatListItem, MatListSubheaderCssMatStyler } from '@angular/material/list';
import {
  MatAccordion,
  MatExpansionPanel,
  MatExpansionPanelActionRow,
  MatExpansionPanelDescription,
  MatExpansionPanelHeader,
  MatExpansionPanelTitle,
} from '@angular/material/expansion';
import { MatButton, MatIconButton } from '@angular/material/button';
import {
  CurrencyPipe,
  DatePipe,
  DecimalPipe,
  KeyValuePipe,
  NgClass,
  NgTemplateOutlet,
  SlicePipe,
} from '@angular/common';

type MonthlySummaryForm = {
  date: FormControl<Date>;
  selectedRoom: FormControl<ISummaryRoom | 'All' | undefined>;
  amountFormat: FormControl<string>;
}

@Component({
  selector: 'app-month-summary',
  templateUrl: './month-summary.component.html',
  styleUrls: ['./month-summary.component.scss'],
  imports: [FilterByPipe, TimeDetailPipe, TwoDigitsDirective, MatFormField, MatLabel, MatInput,
    MatDatepickerInput, MatDatepickerToggle, MatDatepicker, MatSelect, MatOption, MatIcon, MatList, MatListItem,
    MatAccordion, MatExpansionPanel, MatExpansionPanelHeader, MatExpansionPanelTitle, MatExpansionPanelDescription,
    MatListSubheaderCssMatStyler, MatIconButton, MatExpansionPanelActionRow, MatButton, ReactiveFormsModule,
    TranslatePipe, KeyValuePipe, CurrencyPipe, DecimalPipe, NgClass, RouterLink, NgTemplateOutlet, DatePipe,
    SlicePipe, MatSuffix],
  providers: [...provideYearMonthDateAdapter()],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MonthSummaryComponent {
  private readonly env: EnvService = inject(EnvService);
  private readonly translate: TranslateService = inject(TranslateService);
  private readonly store: Store<DashboardState> = inject(Store<DashboardState>);
  private readonly router: Router = inject(Router);
  private readonly authUserService: AuthUserService = inject(AuthUserService);
  private readonly formBuilder: NonNullableFormBuilder = inject(NonNullableFormBuilder);

  private monthlySummaryMap$ = this.store.pipe(getMonthlySummaryMapPipe);
  private navigationParams$ = this.store.pipe(getMonthlyNavigationParamsPipe);
  private isLoading$ = this.store.pipe(isDashboardLoadingPipe);

  private authUserSignal = this.authUserService.authUser;
  private navigationParams = toSignal(this.navigationParams$);
  readonly isLoading = toSignal(this.isLoading$, { initialValue: false });

  private selectedRoomSignal = signal<ISummaryRoom | 'All' | undefined>(undefined);
  private primaryRoomSignal = signal<ISummaryRoom | undefined>(undefined);

  private userName = computed(() => this.authUserSignal()?.displayName);
  private timeZone = computed(() => getTimeZoneFromRoom(this.selectedRoomSignal(), this.primaryRoomSignal()));
  private roomId = computed(() => {
    const room = this.selectedRoomSignal();
    const primaryRoom = this.primaryRoomSignal();
    if (room === 'All' && primaryRoom) {
      return primaryRoom.roomId;
    } else if (room && room !== 'All') {
      return room.roomId;
    }
    return undefined;
  });

  form: FormGroup<MonthlySummaryForm> = this.formBuilder.group<MonthlySummaryForm>({
    date: this.formBuilder.control(getNowTimeZone()),
    selectedRoom: this.formBuilder.control(undefined),
    amountFormat: this.formBuilder.control('ES'),
  });

  private dateSignal = toSignal(this.getForm.date.valueChanges);
  private amountFormatSignal = toSignal(this.getForm.amountFormat.valueChanges);

  monthlySummaryMapSignal = toSignal(this.monthlySummaryMap$);

  showCash = computed(() => this.authUserSignal().showCash);
  stepSignal = signal<number>(0);
  currencySignal = computed(() => getCurrencyFromRoom(this.selectedRoomSignal(), this.primaryRoomSignal()));

  private now = getNowTimeZone(this.timeZone());

  amountFormatKeys = Object.values(AmountFormat);
  summaryReservations?: IMonthlySummary[];
  summaryExpenses?: IMonthlySummary[];
  summaryCash?: IMonthlySummary[];
  weeks = getWeeksInMonth(this.now);
  reservationMonth: ITotalType = new TotalType(SummaryType.payment);
  expenseMonth: ITotalType = new TotalType(SummaryType.expense, Object.values(ExpenseType));
  cashMonth: ITotalType = new TotalType(SummaryType.cash);
  monthlySummaryPayment: IMonthlySummaryRequest[] = [];

  monthlySummaryExpense: IMonthlySummaryRequest[] = [];
  monthlySummaryCash: IMonthlySummaryRequest[] = [];
  type: typeof SummaryType = SummaryType;
  locale = 'es';

  dateFormat: string = this.translate.getCurrentLang();
  readonly language: string = this.translate.getCurrentLang();

  constructor() {
    effect(() => {
      const params = this.navigationParams();
      if (params) {
        this.stepSignal.set(params?.step || 0);
        const dateTime = params.date;
        let month;
        let year;
        if (dateTime instanceof Date) {
          month = dateTime.getMonth();
          year = dateTime.getFullYear();
        } else {
          const date = dateTime.split('-');
          month = Number(date[0]) - 1;
          year = date[1];
        }
        this.getForm.date.setValue(dateMonthYear(month, year));
      }
    });

    effect(() => {
      const monthlySummaryMapValue = this.monthlySummaryMapSignal();
      if (monthlySummaryMapValue) {
        monthlySummaryMapValue.forEach((value, key) => {
          monthlySummaryMapValue.set(key, {
            summarySale: value.summarySale.map(s => this.getNewObject(s)),
            summaryExpenses: value.summaryExpenses.map(s => this.getNewObject(s)),
            summaryCashSale: value.summaryCashSale.map(s => this.getNewObject(s)),
          });
        });

        if (monthlySummaryMapValue.size === 1) {
          const room = monthlySummaryMapValue.keys().next().value;
          this.getForm.selectedRoom.setValue(room);
          this.selectedRoomSignal.set(room);
        } else {
          monthlySummaryMapValue.forEach((_, key) => {
            if (key.primary) {
              this.getForm.selectedRoom.setValue(key);
              this.selectedRoomSignal.set(key);
            }
          });
          if (monthlySummaryMapValue.size > 1 &&
            allElementsHaveSameKeyFilterValue(monthlySummaryMapValue, ['currency', 'id'])) {
            const selectedRoomValue = this.getForm.selectedRoom.value;
            if (selectedRoomValue && typeof selectedRoomValue !== 'string') {
              this.primaryRoomSignal.set(selectedRoomValue);
            }
          }
        }
      }
    });

    effect(() => {
      const value = this.dateSignal();
      if (value) {
        this.getSummary(getDateFormat(value));
        this.weeks = getWeeksInMonth(value);
      }
    });

    effect(() => {
      const format = this.amountFormatSignal();
      if (format) {
        this.locale = format.toLowerCase();
      }
    });

    effect(() => {
      const room = this.selectedRoomSignal();
      const monthlySummaryMapValue = this.monthlySummaryMapSignal();

      if (room && monthlySummaryMapValue) {
        let summary: {
          summarySale: IMonthlySummarySale[];
          summaryExpenses: IMonthlySummaryExpense[];
          summaryCashSale: IMonthlySummarySale[];
        } | undefined;

        if (room === 'All' && this.primaryRoom) {
          summary = [...monthlySummaryMapValue.values()].reduce((prev, curr) => {
            prev.summarySale = prev.summarySale.concat(curr.summarySale);
            prev.summaryExpenses = prev.summaryExpenses.concat(curr.summaryExpenses);
            prev.summaryCashSale = prev.summaryCashSale.concat(curr.summaryCashSale);
            return prev;
          }, { summarySale: [], summaryExpenses: [], summaryCashSale: [] });
          summary.summarySale = summary.summarySale.sort((a, b) => a.timestamp - b.timestamp);
        } else if (room !== 'All') {
          summary = monthlySummaryMapValue.get(room);
        }

        this.summaryReservations = summary?.summarySale.map((s, i) => {
          if (s.id) {
            const reservationDate = newDateTimestamp(s.timestamp, this.timeZone());
            return Object.assign({}, s, { day: reservationDate.getDate(), position: i });
          }
          return s;
        });
        this.calculateReservationSummary();

        this.summaryExpenses = summary?.summaryExpenses.map((s, i) => {
          if (s.id) {
            const expenseDate = newDateTimestamp(s.timestamp, this.timeZone());
            return Object.assign({}, s, { day: expenseDate.getDate(), position: i });
          }
          return s;
        });
        this.calculateExpenseSummary();

        this.summaryCash = summary?.summaryCashSale.map((s, i) => {
          if (s.id) {
            const reservationDate = newDateTimestamp(s.timestamp, this.timeZone());
            return Object.assign({}, s, { day: reservationDate.getDate(), position: i });
          }
          return s;
        });
        this.calculateCashSummary();
      }
    });
  }

  get getForm(): MonthlySummaryForm {
    return this.form.controls;
  }

  get primaryRoom(): ISummaryRoom | undefined {
    return this.primaryRoomSignal();
  }

  get dateFormatted(): string {
    return this.getForm.date.value ? monthViewTitle(this.getForm.date.value, this.translate.getCurrentLang()) : '';
  }

  private static groupSummary = (summaries?: IMonthlySummary[]): Map<string, IMonthlySummary[]> =>
    summaries?.reduce((grouped: Map<string, IMonthlySummary[]>, item: IMonthlySummary) => {
      const length = item.total.payments.length;
      if (length) {
        item.total.payments.forEach(total => {
          const key = total.expenseType;
          const group = grouped.get(key) || [];
          const newItem = { ...item };
          newItem.total = {
            ...newItem.total,
            gross: total.gross,
            btw: total.btw,
            net: total.net,
            payments: [],
          };
          group.push(newItem);
          grouped.set(key, group);
        });
      } else {
        const key = item.total.expenseType;
        const group = grouped.get(key) || [];
        group.push(item);
        grouped.set(key, group);
      }
      return grouped;
    }, new Map()) || new Map();

  private static calculateTotals = (summaries?: IMonthlySummary[]): { gross: number; btw: number; net: number } => {
    const t = summaries?.map(s => s.total).reduce((totals: any, next: ISummaryTotal) => {
      let gross;
      let net;
      let btw;
      if (next.payments?.length) {
        const paid = next.payments.reduce((payments: any, payment: ISummaryTotal) => {
          payments.gross += payment.gross;
          payments.net += payment.net;
          payments.btw += payment.btw;
          return payments;
        }, { gross: 0, net: 0, btw: 0 });
        gross = paid.gross;
        net = paid.net;
        btw = paid.btw;
      } else {
        gross = next.gross;
        net = next.net;
        btw = next.btw;
      }
      totals.gross += gross;
      totals.net += net;
      totals.btw += btw;
      return totals;
    }, { gross: 0, net: 0, btw: 0 });

    return { gross: t?.gross || 0, net: t?.net || 0, btw: t?.btw || 0 };
  };

  private static isInvalidInput = (value: string): boolean => !value
    || new RegExp(/^0\.?0{0,2}$/g).test(value)
    || new RegExp(/^\.0{0,2}$/g).test(value);

  private static getType = (key: string): SummaryType => SummaryType[key.toLowerCase() as keyof typeof SummaryType];

  private static addSummary = (
    id: string,
    gross: number,
    btw: number,
    summaries: IMonthlySummaryRequest[],
  ): IMonthlySummaryRequest[] => {
    const newSummary = { id, gross, btw };
    const exist = summaries.find(ms => ms.id === id);
    if (exist) {
      return summaries.map(u => u.id !== newSummary.id ? u : newSummary);
    }
    return [...summaries, newSummary];
  };

  private static newSummary = (
    summary: IMonthlySummary,
    newSummaries: IMonthlySummaryRequest[],
    id: string,
    gross: number = 0,
    net: number = 0,
    btw: number = 0,
  ): { monthlySummary: IMonthlySummary; newSummaries: IMonthlySummaryRequest[] } => {
    newSummaries = MonthSummaryComponent.addSummary(id, gross, btw, newSummaries);
    if (summary.total.payments?.length) {
      const objIndex = summary.total.payments?.findIndex((obj => obj.id === id));
      const payment = summary.total.payments[objIndex];

      const updatedObj = Object.assign({}, payment, { gross, net, btw });

      const payments = [
        ...summary.total.payments.slice(0, objIndex),
        updatedObj,
        ...summary.total.payments.slice(objIndex + 1),
      ];
      return { monthlySummary: Object.assign({}, summary, { total: { ...summary.total, payments } }), newSummaries };
    } else {
      return {
        monthlySummary: Object.assign({}, summary, { total: { ...summary.total, gross, net, btw } }),
        newSummaries,
      };
    }
  };

  private static parseValue(total: ISummaryTotal, key: 'btw' | 'gross' | 'net', id?: string): number {
    if (id) {
      const t = total.payments?.find(payment => payment.id === id);
      if (t) {
        return t[key] >= 0 ? t[key] : total[key];
      }
      return total[key];
    }
    return total[key];

  }

  private static updateAmounts(
    summaries: IMonthlySummary[],
    summaryRequests: IMonthlySummaryRequest[],
    input: HTMLInputElement,
    index: number,
    id: string,
  ): { monthlySummaries: IMonthlySummary[]; newSummaries: IMonthlySummaryRequest[] } {
    const objIndex = summaries.findIndex((obj => obj.position === index));
    const isInvalidInput = MonthSummaryComponent.isInvalidInput(input.value);
    const summary = summaries[objIndex];
    const total = summary.total;
    let gross = isInvalidInput ? this.parseValue(total, 'gross', id) : parseFloat(input.value);
    const btwCurrent = this.parseValue(total, 'btw', id);
    const netCurrent = this.parseValue(total, 'net', id);
    const btwPercentage = Math.round((btwCurrent / netCurrent) * 100);
    let net = gross;
    let btw = 0;
    if (input.id === 'grossInput') {
      net = gross * 100 / (btwPercentage + 100);
      btw = gross - net;
    } else if (input.id === 'netInput') {
      if (!isInvalidInput) {
        net = parseFloat(input.value);
        gross = net * ((btwPercentage / 100) + 1);
        btw = gross - net;
      }
    } else if (input.id === 'btwInput') {
      if (!isInvalidInput) {
        btw = parseFloat(input.value);
        net = btw * 100 / btwPercentage;
        gross = btw + net;
      }
    }
    const { monthlySummary, newSummaries } = MonthSummaryComponent.newSummary(summary, summaryRequests, id, gross, net,
      btw);

    const monthlySummaries = [
      ...summaries.slice(0, objIndex),
      monthlySummary,
      ...summaries.slice(objIndex + 1),
    ];

    return { monthlySummaries, newSummaries };
  }

  goBack(): void {
    if (this.getForm.date.value) {
      const year = this.getForm.date.value.getFullYear();
      const quarter = getDateQuarter(this.getForm.date.value);
      this.router.navigate([this.language, 'dashboard', 'quarter', 'summary'], { state: { year, quarter } });
    } else {
      this.router.navigate([this.language, 'dashboard', 'quarter', 'summary']);
    }
    return;
  }

  setStep = (index: number): void => {
    this.stepSignal.set(index);
  };

  setMonthAndYear = (normalizedMonthAndYear: Date, datepicker: MatDatepicker<Date>): void => {
    const ctrlValue = new Date(this.getForm.date.value);
    ctrlValue?.setMonth(normalizedMonthAndYear.getMonth());
    ctrlValue?.setFullYear(normalizedMonthAndYear.getFullYear());

    this.getForm.date.setValue(ctrlValue);

    datepicker.close();
  };

  twoDigit = (input: HTMLInputElement, index: number, key: string, id: string): void => {
    const type = MonthSummaryComponent.getType(key);
    switch (type) {
      case SummaryType.payment:
        if (this.summaryReservations) {
          this.setSummaryReservation(input, index, id);
        }
        this.calculateReservationSummary();
        break;
      case SummaryType.expense:
        if (this.summaryExpenses) {
          this.setSummaryExpense(input, index, id);
        }
        this.calculateExpenseSummary();
        break;
      case SummaryType.cash:
        if (this.summaryCash) {
          this.setSummaryCash(input, index, id);
        }
        this.calculateCashSummary();
        break;
    }
  };

  getTotal = (total: ITotalType, attribute: 'gross' | 'net' | 'btw'): number => {
    let sum = 0;
    total.totals.forEach(value => sum += value[attribute]);

    return sum;
  };

  exportMonthlySummary = (): void => {
    const title = monthViewTitle(this.getForm.date.value || getNowTimeZone(this.timeZone()));
    const workbook = createMonthlySummary(title, this.weeks, currencySymbol(this.currencySignal()), this.translate,
      this.env, this.timeZone(), this.summaryReservations as IMonthlySummarySale[],
      this.summaryExpenses as IMonthlySummaryExpense[]);

    workbook.creator = this.userName() || '';
    workbook.created = getNowTimeZone(this.timeZone());

    // Generate & Save Excel File
    workbook.xlsx.writeBuffer().then((content: any) => {
      const blob = new Blob([content], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });
      fs.saveAs(blob, `Report_${ title.replace(' ', '_') }.xlsx`);
    });
  };

  exportToExcel = (
    title: string,
    totalTypes: ITotalType,
    values: IMonthlySummaryRequest[],
    data?: IMonthlySummary[],
  ): void => {
    if (data?.length) {
      const workbookName = `${ titleCase(totalTypes.type) }-${ getDateFormat(this.getForm.date.value) }`;
      const name = this.translate.instant(`SUMMARY.${ title }`);

      let workbook;
      const header = monthViewTitle(this.getForm.date.value || getNowTimeZone(this.timeZone()));

      switch (totalTypes.type) {
        case SummaryType.payment:
          workbook = createMonthlyIncomeWorkbook(header, data as IMonthlySummarySale[], this.weeks,
            name, totalTypes.type, workbookName, this.translate, currencySymbol(this.currencySignal()),
            this.env, this.timeZone());
          break;
        case SummaryType.expense:
          workbook = createMonthlyExpenseWorkbook(header, data as IMonthlySummaryExpense[], this.weeks,
            name, workbookName, this.translate, currencySymbol(this.currencySignal()), this.env, this.timeZone());
          break;
        case SummaryType.cash:
          workbook = createMonthlyIncomeWorkbook(header, data as IMonthlySummarySale[], this.weeks,
            name, totalTypes.type, workbookName, this.translate, currencySymbol(this.currencySignal()),
            this.env, this.timeZone());
          break;
      }

      workbook.creator = this.userName() || '';
      workbook.created = getNowTimeZone(this.timeZone());

      // Generate & Save Excel File
      workbook.xlsx.writeBuffer().then((content: any) => {
        const blob = new Blob([content], {
          type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        });
        fs.saveAs(blob, `${ workbookName }.xlsx`);
      });

      this.updateMonthlySummary(totalTypes, values);
    }
  };

  updateMonthlySummary = (totalTypes: ITotalType, summaries: IMonthlySummaryRequest[]): void => {
    let totals: ITotal[];
    switch (totalTypes.type) {
      case SummaryType.cash:
        totals = Array.from(totalTypes.totals.values());
        break;
      case SummaryType.payment:
        totals = Array.from(totalTypes.totals.values());
        break;
      case SummaryType.expense:
        totals = Array.from(totalTypes.totals, ([key, value]) => ({
          expenseType: key,
          ...value,
        }));
        break;
    }
    return this.store.dispatch(
      updateMonthlySummary({
        date: getDateFormat(this.getForm.date.value),
        summaryType: totalTypes.type,
        totals: totals,
        summaries: summaries,
        roomId: this.roomId()!,
        step: this.stepSignal(),
      }),
    );
  };

  private setSummaryReservation = (input: HTMLInputElement, index: number, id: string): void => {
    if (this.summaryReservations) {
      const {
        monthlySummaries,
        newSummaries,
      } = MonthSummaryComponent.updateAmounts(this.summaryReservations, this.monthlySummaryPayment, input, index, id);
      this.summaryReservations = monthlySummaries;
      this.monthlySummaryPayment = newSummaries;
    }
  };

  private setSummaryExpense = (input: HTMLInputElement, index: number, id: string): void => {
    if (this.summaryExpenses) {
      const {
        monthlySummaries,
        newSummaries,
      } = MonthSummaryComponent.updateAmounts(this.summaryExpenses, this.monthlySummaryExpense, input, index, id);
      this.summaryExpenses = monthlySummaries;
      this.monthlySummaryExpense = newSummaries;
    }
  };

  private setSummaryCash = (input: HTMLInputElement, index: number, id: string): void => {
    if (this.summaryCash) {
      const {
        monthlySummaries,
        newSummaries,
      } = MonthSummaryComponent.updateAmounts(this.summaryCash, this.monthlySummaryCash, input, index, id);
      this.summaryCash = monthlySummaries;
      this.monthlySummaryCash = newSummaries;
    }
  };

  private getSummary = (date: string): void => {
    this.summaryReservations = undefined;
    this.summaryExpenses = undefined;
    this.summaryCash = undefined;
    this.reservationMonth = new TotalType(SummaryType.payment);
    this.expenseMonth = new TotalType(SummaryType.expense, Object.values(ExpenseType));
    this.cashMonth = new TotalType(SummaryType.cash);
    this.store.dispatch(getMonthlySummary({ date }));
  };

  private calculateReservationSummary = (): void => {
    this.reservationMonth = this.reservationMonth.reset();
    MonthSummaryComponent.groupSummary(this.summaryReservations)?.forEach((it, key) => {
      const { gross, net, btw } = MonthSummaryComponent.calculateTotals(it);
      this.reservationMonth = this.reservationMonth.withTotal(gross, net, btw, it.length, key);
    });
  };

  private calculateExpenseSummary = (): void => {
    this.expenseMonth = this.expenseMonth.reset(Object.values(ExpenseType));
    MonthSummaryComponent.groupSummary(this.summaryExpenses)?.forEach((it, key) => {
      const { gross, net, btw } = MonthSummaryComponent.calculateTotals(it);
      this.expenseMonth = this.expenseMonth.withTotal(gross, net, btw, it.length, key);
    });
  };

  private calculateCashSummary = (): void => {
    this.cashMonth = this.cashMonth.reset();
    MonthSummaryComponent.groupSummary(this.summaryCash)?.forEach((it, key) => {
      const { gross, net, btw } = MonthSummaryComponent.calculateTotals(it);
      this.cashMonth = this.cashMonth.withTotal(gross, net, btw, it.length, key);
    });
  };

  private getNewObject = (s: IMonthlySummary): any => {
    if (s?.paths) {
      const paths = Array.isArray(s.paths) ? `/${ this.language }/${ s.paths.join('/') }` : s.paths;
      return Object.assign({}, s, { paths });
    }
    return s;
  };
}
