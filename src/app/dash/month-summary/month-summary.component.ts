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
import { IMonthlyRoom, IMonthlySummaryReservation, IMonthlySummaryTotal, IMonthlySummaryPayment } from '../../interfaces/dashboard';

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
  monthlySummaryPayment: IMonthlySummaryPayment[] = [];
  weeks: any[];
  dateFormat: string;
  showInput = true;
  grossMonth = 0;
  netMonth = 0;
  btwMonth = 0;

  private getState: Observable<any>;
  private subscription?: Subscription;

  constructor(private readonly translate: TranslateService, private store: Store<AppState>) {
    this.getState = this.store.select(selectDashboardState);
    this.dateFormat = this.translate.currentLang;
    this.weeks = getWeeksInMonth(getNow());
  }

  get updateMonthlySummary(): void {
    return this.store.dispatch(
      new fromActionsDashboard.UpdateMonthlySummary(
        {
          date: this.getDateFormat(this.date.value),
          gross: this.grossMonth,
          btw: this.btwMonth,
          payments: this.monthlySummaryPayment
        }
      )
    );
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

      csv += `,,,,${ this.grossMonth },${ this.netMonth }, ${ this.btwMonth }\n`;

      csv = `${ csv.substring(0, csv.length - 1) }\n`;
      const hiddenElement = document.createElement('a');
      hiddenElement.href = 'data:text/csv;charset=utf-8,' + encodeURI(csv);
      hiddenElement.target = '_blank';
      hiddenElement.download = 'data.csv';
      hiddenElement.click();

      return this.updateMonthlySummary;
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

  twoDigit(input: HTMLInputElement, index: number, paymentId?: string): void {
    if (this.summaries) {
      const objIndex = this.summaries.findIndex((obj => obj.position === index));
      const isInvalidInput = this.isInvalidInput(input.value);
      const summary = this.summaries[objIndex];
      const total = summary.total;
      let gross = isInvalidInput ? paymentId ?
          total.payments.find(payment => payment.paymentId === paymentId)?.gross || total.gross
          : total.gross
        : parseFloat(input.value);
      let net = gross;
      let btw = 0;
      if (input.id === 'grossInput') {
        net = gross * 100 / 121;
        btw = gross - net;
      } else if (input.id === 'netInput') {
        if (!isInvalidInput) {
          net = parseFloat(input.value);
          gross = net * 1.21;
          btw = gross - net;
        }
      } else if (input.id === 'btwInput') {
        if (!isInvalidInput) {
          btw = parseFloat(input.value);
          net = btw * 100 / 21;
          gross = btw + net;
        }
      }
      const updatedObj = this.newSummary(summary, paymentId, gross, net, btw);

      this.summaries = [
        ...this.summaries.slice(0, objIndex),
        updatedObj,
        ...this.summaries.slice(objIndex + 1),
      ];
    }

    this.calculateTotals();
  }

  private newSummary(summary: IMonthlySummaryReservation, paymentId?: string, gross: number = 0, net: number = 0,
                     btw: number = 0): IMonthlySummaryReservation {
    if (paymentId) {
      this.addSummary(paymentId, gross, btw);
      const payments = summary.total.payments.map(payment => {
        if (payment.paymentId === paymentId) {
          return Object.assign({}, payment, { gross, net, btw });
        }
        return payment;
      });
      return Object.assign({}, summary, { total: { ...summary.total, payments } });
    }
    return Object.assign({}, summary, { total: { ...summary.total, gross, net, btw } });
  }

  private addSummary(paymentId: string, gross: number, btw: number): void {
    const newSummary = { paymentId, gross, btw };
    const exist = this.monthlySummaryPayment.find(ms => ms.paymentId === paymentId);
    if (exist) {
      this.monthlySummaryPayment = this.monthlySummaryPayment.map(u => u.paymentId !== newSummary.paymentId ? u : newSummary);
    } else {
      this.monthlySummaryPayment.push(newSummary);
    }
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
        this.getSummary(this.getDateFormat(value));
        this.weeks = getWeeksInMonth(value);
        this.showInput = true;
      }
    });
  }

  private getDateFormat(date: Date | null): string {
    if (!date) {
      return '';
    }
    const month = `0${ date.getMonth() + 1 }`.slice(0, 2);
    const year = date.getFullYear();

    return `${ month }-${ year }`;
  }

  private getSummary(date: string): void {
    this.store.dispatch(
      new fromActionsDashboard.GetMonthlySummary(date)
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
      this.summaries = this.monthlySummaryMap?.get(this.selectedRoom.value)?.map((s: IMonthlySummaryReservation, i) => {
        if (s.id) {
          const reservationDate = newDateTimestamp(s.timestamp);
          return Object.assign({}, s, { reservationDate, day: reservationDate.getDate(), position: i });
        }
        return s;
      });
      this.calculateTotals();
    }
  }

  private cleanCVSText(text: string): string {
    return `${ text.replace(/,/g, '') }, `;
  }

  private calculateTotals(): void {
    const t = this.summaries?.map(s => s.total).reduce((totals: any, next: IMonthlySummaryTotal) => {
      let gross;
      let net;
      let btw;
      if (next.payments?.length) {
        const paid = next.payments.reduce((payments: any, payment: IMonthlySummaryTotal) => {
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

    this.grossMonth = t?.gross || 0;
    this.netMonth = t?.net || 0;
    this.btwMonth = t?.btw || 0;
  }
}
