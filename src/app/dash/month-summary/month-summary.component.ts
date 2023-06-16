import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormControl, UntypedFormControl } from '@angular/forms';
import { DateAdapter, NativeDateAdapter } from '@angular/material/core';
import { MatDatepicker } from '@angular/material/datepicker';

import { getNow, getWeeksInMonth, newDateTimestamp } from '../../util/dates';
import { Observable, Subscription } from 'rxjs';
import { AppState, selectDashboardState } from '../../store/app.states';
import { Store } from '@ngrx/store';
import { TranslateService } from '@ngx-translate/core';
import * as fromActionsDashboard from '../../store/dashboard.actions';
import { IMonthlyRoom, IMonthlySummaryReservation, IMonthlySummaryTotal, IMonthSummaryPayment } from '../../interfaces/dashboard';

export class CustomDateAdapter extends NativeDateAdapter {

  parse(value: any): Date | null {
    if ((typeof value === 'string') && (value.indexOf('/') > -1)) {
      const str = value.split('/');

      const year = Number(str[2]);
      const month = Number(str[1]) - 1;
      const date = Number(str[0]);

      return new Date(year, month, date);
    }
    const timestamp = typeof value === 'number' ? value : Date.parse(value);
    return isNaN(timestamp) ? null : new Date(timestamp);
  }

  format(date: Date, displayFormat: any): string {
    date = new Date(Date.UTC(
      date.getFullYear(), date.getMonth(), date.getDate(), date.getHours(),
      date.getMinutes(), date.getSeconds(), date.getMilliseconds()));

    const dtf = new Intl.DateTimeFormat(this.locale, {
      year: 'numeric', month: 'long'
    });
    return dtf.format(date);
  }
}

@Component({
  selector: 'app-month-summary',
  templateUrl: './month-summary.component.html',
  styleUrls: ['./month-summary.component.scss'],
  providers: [
    { provide: DateAdapter, useClass: CustomDateAdapter }
  ]
})
export class MonthSummaryComponent implements OnInit {
  @ViewChild('tableData') table!: ElementRef;

  date = new FormControl<Date | null>(null);
  monthlySummaryMap?: Map<IMonthlyRoom, IMonthlySummaryReservation[]>;
  selectedRoom = new UntypedFormControl();
  summaries?: IMonthlySummaryReservation[];
  weeks: any[];
  dateFormat: string;
  showInput = true;
  totalMonth = 0;
  excBTWMonth = 0;
  btwMonth = 0;

  private getState: Observable<any>;
  private subscription?: Subscription;

  constructor(private readonly translate: TranslateService, private store: Store<AppState>) {
    this.getState = this.store.select(selectDashboardState);
    this.dateFormat = this.translate.currentLang;
    this.weeks = getWeeksInMonth(getNow());
  }

  get exportCVS(): void {
    this.showInput = false;
    setTimeout(() => {
      let csv = '';
      const table = this.table.nativeElement;

      const th = table.children[1].children[0]; // start in 1 to exclude col

      for (const thChildren of Array.from(th.children).slice(1, th.children.length)) {
        // @ts-ignore
        csv += this.cleanCVSText(thChildren.innerText);
      }

      csv = `${ csv.substring(0, csv.length - 1) }\n`;

      for (const tbody of Array.from(table.children).slice(2, table.children.length - 1)) {
        // @ts-ignore
        for (const trBody of tbody.children) {
          for (const tdBody of Array.from(trBody.children).slice(1, trBody.children.length)) {
            // @ts-ignore
            const value = tdBody.innerText;
            csv += `${ value },`;
          }
          csv = `${ csv.substring(0, csv.length - 1) }\n`;
        }
      }

      csv += `,,,,${ this.totalMonth },${ this.excBTWMonth }, ${ this.btwMonth }\n`;

      csv = `${ csv.substring(0, csv.length - 1) }\n`;
      const hiddenElement = document.createElement('a');
      hiddenElement.href = 'data:text/csv;charset=utf-8,' + encodeURI(csv);
      hiddenElement.target = '_blank';
      hiddenElement.download = 'data.csv';
      hiddenElement.click();
    }, 0);
    return;
  }

  ngOnInit(): void {
    this.subscribe();
    this.valueChange();
    this.date.setValue(getNow());
  }

  setMonthAndYear(normalizedMonthAndYear: Date, datepicker: MatDatepicker<Date>): void {
    const ctrlValue = this.date.value;
    ctrlValue?.setMonth(normalizedMonthAndYear.getMonth());
    ctrlValue?.setFullYear(normalizedMonthAndYear.getFullYear());

    this.date.setValue(ctrlValue);

    datepicker.close();
  }

  twoDigit(input: HTMLInputElement, summaryId: string, index?: number): void {
    this.summaries = this.summaries?.map(summary => {
      if (summary.id === summaryId) {
        const isInvalidInput = this.isInvalidInput(input.value);
        let total = isInvalidInput ?
          index || index === 0 ?
            summary.total.payments[index].total
            : summary.total.total
          : parseFloat(input.value);
        let excBTW = 0;
        let btw = 0;
        if (input.id === 'totalInput') {
          excBTW = total * 100 / 121;
          btw = total - excBTW;
        } else if (input.id === 'excBTWInput') {
          if (!isInvalidInput) {
            excBTW = parseFloat(input.value);
            total = excBTW * 1.21;
            btw = total - excBTW;
          }
        } else if (input.id === 'btwInput') {
          if (!isInvalidInput) {
            btw = parseFloat(input.value);
            excBTW = btw * 100 / 21;
            total = btw + excBTW;
          }
        }
        return this.newSummary(summary, index, total, excBTW, btw);
      }
      return summary;
    });

    this.calculateTotals();
  }

  private newSummary(summary: IMonthlySummaryReservation, paymentIndex?: number, total: number = 0, excBTW: number = 0,
                     btw: number = 0): IMonthlySummaryReservation {
    if (paymentIndex || paymentIndex === 0) {
      const payments = summary.total.payments.map((payment, i) => {
        if (paymentIndex === i) {
          return Object.assign({}, payment, { total, excBTW, btw });
        }
        return payment;
      });
      return Object.assign({}, summary, { total: { ...summary.total, payments } });
    }
    return Object.assign({}, summary, { total: { ...summary.total, total, excBTW, btw } });
  }

  private isInvalidInput(value: string): boolean {
    return !value || new RegExp(/^0\.?0{0,2}$/g).test(value) || new RegExp(/^\.0{0,2}$/g).test(value);
  }

  private valueChange(): void {
    this.selectedRoom.valueChanges.subscribe(value => {
      if (value) {
        this.createData();
      }
    });
    this.date.valueChanges.subscribe(value => {
      if (value) {
        const month = `0${ value.getMonth() + 1 }`.slice(0, 2);
        const year = value.getFullYear();

        this.getSummary(`${ month }-${ year }`);
        this.weeks = getWeeksInMonth(value);
        this.showInput = true;
      }
    });
  }

  private getSummary(date: string): void {
    this.store.dispatch(
      new fromActionsDashboard.GetSummary(date)
    );
  }

  private subscribe(): void {
    this.subscription = this.getState.subscribe(state => {
      this.monthlySummaryMap = state.monthlySummaryMap;
      if (this.monthlySummaryMap?.size === 1) {
        const [room] = this.monthlySummaryMap.keys();
        this.selectedRoom.setValue(room);
      }
    });
  }

  private createData(): void {
    if (this.selectedRoom.value) {
      this.summaries = this.monthlySummaryMap?.get(this.selectedRoom.value)?.map((s: IMonthlySummaryReservation) => {
        if (s.id) {
          const date = newDateTimestamp(s.timestamp);
          return Object.assign({}, s, { date, day: date.getDate() });
        }
        return s;
      });
      this.calculateTotals();
    }
  }

  private cleanCVSText(text: string): string {
    return `${ text.replace(/,/g, '') },`;
  }

  private calculateTotals(): void {
    const t = this.summaries?.map(s => s.total).reduce((totals: any, next: IMonthlySummaryTotal) => {
      let total;
      let excBTW;
      let btw;
      if (next.payments?.length) {
        const paid = next.payments.reduce((payments: any, payment: IMonthSummaryPayment) => {
          payments.total += payment.total;
          payments.excBTW += payment.excBTW;
          payments.btw += payment.btw;
          return payments;
        }, { total: 0, excBTW: 0, btw: 0 });
        total = paid.total;
        excBTW = paid.excBTW;
        btw = paid.btw;
      } else {
        total = next.total;
        excBTW = next.excBTW;
        btw = next.btw;
      }
      totals.total += total;
      totals.excBTW += excBTW;
      totals.btw += btw;
      return totals;
    }, { total: 0, excBTW: 0, btw: 0 });

    this.totalMonth = t?.total || 0;
    this.excBTWMonth = t?.excBTW || 0;
    this.btwMonth = t?.btw || 0;
  }
}
