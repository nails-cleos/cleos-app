import { Component, OnDestroy, OnInit } from '@angular/core';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Observable, Subscription } from 'rxjs';
import { map, shareReplay } from 'rxjs/operators';
import { MatDatepicker } from '@angular/material/datepicker';
import { FormControl, UntypedFormControl } from '@angular/forms';
import { DateAdapter } from '@angular/material/core';
import { YearAdapter } from '../../util/adapter/year.adapter';
import { getNow } from '../../util/dates';
import { AppState, selectDashboardState } from '../../store/app.states';
import { Store } from '@ngrx/store';
import { ISummaryRoom, IYearSummary } from '../../interfaces/dashboard';
import * as fromActionsDashboard from '../../store/dashboard.actions';

@Component({
  selector: 'app-quarter-summary',
  templateUrl: './quarter-summary.component.html',
  styleUrls: ['./quarter-summary.component.scss'],
  providers: [
    { provide: DateAdapter, useClass: YearAdapter }
  ]
})
export class QuarterSummaryComponent implements OnInit, OnDestroy {
  date = new FormControl<Date | null>(null);
  selectedRoom = new UntypedFormControl();
  yearSummaryMap?: Map<ISummaryRoom, { yearSummaries: IYearSummary[] }>;
  yearSummaries?: IYearSummary[];

  isLoading = false;

  isHandset$: Observable<boolean> = this.breakpointObserver.observe([
    Breakpoints.XSmall,
    Breakpoints.Small
  ]).pipe(map(result => result.matches), shareReplay());

  private getState: Observable<any>;
  private subscription?: Subscription;

  constructor(private store: Store<AppState>, private breakpointObserver: BreakpointObserver) {
    this.getState = this.store.select(selectDashboardState);
  }

  ngOnInit(): void {
    this.subscribe();
    this.clean();
    this.valueChange();
    this.date.setValue(getNow());
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
      this.yearSummaries = this.yearSummaryMap?.get(this.selectedRoom.value)?.yearSummaries;
    }
  }

  private getSummary(year: number): void {
    this.yearSummaries = undefined;
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
