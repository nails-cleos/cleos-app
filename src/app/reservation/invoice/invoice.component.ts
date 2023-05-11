import { ChangeDetectorRef, Component, ElementRef, Injectable, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { DateAdapter } from '@angular/material/core';
import { DateRange, MAT_DATE_RANGE_SELECTION_STRATEGY, MatDateRangeSelectionStrategy } from '@angular/material/datepicker';
import { FormBuilder, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { AppState, selectReservationState } from '../../store/app.states';
import { Observable, Subscription } from 'rxjs';
import { Store } from '@ngrx/store';
import * as fromActionsReservation from '../../store/reservation.actions';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { MOBILE_PAGE_SIZE, PAGE_SIZE } from '../../interfaces/pagination';
import { IReservation, IReservationAll } from '../../interfaces/reservation';
import { backendFormatDate, newDateTimestamp } from '../../util/dates';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { PaymentType, PaymentTypeKey } from '../../interfaces/payment';
import { map, startWith } from 'rxjs/operators';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { TranslateService } from '@ngx-translate/core';
import { detailExpandAnimation } from '../../util/animation';
import { SelectionModel } from '@angular/cdk/collections';


@Injectable()
export class PeriodRangeSelectionStrategy<D> implements MatDateRangeSelectionStrategy<D> {
  constructor(private dateAdapter: DateAdapter<D>) {
  }

  selectionFinished(date: D | null): DateRange<D> {
    return this.createPeriodRange(date);
  }

  createPreview(activeDate: D | null): DateRange<D> {
    return this.createPeriodRange(activeDate);
  }

  private createPeriodRange(date: D | null): DateRange<D> {
    if (date) {
      const year = this.dateAdapter.getYear(date);
      const month = this.dateAdapter.getMonth(date);
      const lastDay = this.dateAdapter.getNumDaysInMonth(date);

      let startMonth = month - 2;
      let startYear = year;
      if (startMonth < 0) {
        startMonth += 12;
        startYear -= 1;
      }

      const start = this.dateAdapter.createDate(startYear, startMonth, 1);
      const end = this.dateAdapter.createDate(year, month, lastDay);
      return new DateRange<D>(start, end);
    }

    return new DateRange<D>(null, null);
  }
}

@Component({
  selector: 'app-invoice',
  templateUrl: './invoice.component.html',
  styleUrls: ['./invoice.component.scss'],
  animations: [detailExpandAnimation],
  providers: [
    {
      provide: MAT_DATE_RANGE_SELECTION_STRATEGY,
      useClass: PeriodRangeSelectionStrategy,
    },
  ]
})
export class InvoiceComponent implements OnInit, OnDestroy {
  @ViewChild(MatPaginator) paginator?: MatPaginator;
  @ViewChild('typeInput') typeInput!: ElementRef<HTMLInputElement>;

  displayedColumns: string[] = ['select', 'position', 'customer', 'timestamp', 'treatment'];
  expandedReservation?: IReservation;
  reservations?: IReservation[];

  form!: UntypedFormGroup;
  dateRange!: UntypedFormGroup;
  startDate: UntypedFormControl = new UntypedFormControl('', [Validators.required]);
  endDate: UntypedFormControl = new UntypedFormControl('', [Validators.required]);
  type: UntypedFormControl = new UntypedFormControl();
  filteredTypes: Observable<string[]>;
  types: string[] = [];

  dataSource: any;
  selection = new SelectionModel<IReservationAll>(true, []);

  resultsLength = 0;
  pageSize = PAGE_SIZE;

  dateFormat: string;

  private getState: Observable<any>;

  private subscription: Subscription | undefined;
  private allPaymentTypes: string[] = Object.keys(PaymentType);

  constructor(private readonly translate: TranslateService, private store: Store<AppState>, private formBuilder: FormBuilder,
              private cdRef: ChangeDetectorRef, private breakpointObserver: BreakpointObserver) {
    breakpointObserver.observe([
      Breakpoints.XSmall,
      Breakpoints.Small
    ]).subscribe(result => {
      if (result.matches) {
        this.pageSize = MOBILE_PAGE_SIZE;
      }
    });
    this.getState = this.store.select(selectReservationState);
    this.dateFormat = this.translate.currentLang;
    this.filteredTypes = this.type.valueChanges.pipe(
      startWith(null),
      map((type: string | null) => type ? this.filterTypes(type) : this.allPaymentTypes.slice()));
  }

  get print(): void {
    console.log(this.selection.selected);
    return;
  }

  ngOnInit(): void {
    this.clean();
    this.createForm();
    this.subscribe();
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }

  selected(event: MatAutocompleteSelectedEvent): void {
    const type = PaymentType[event.option.value as PaymentTypeKey];
    this.types = [...this.types, type];
    this.allPaymentTypes = this.allPaymentTypes.filter(s => PaymentType[s as PaymentTypeKey] !== type);
    this.typeInput.nativeElement.value = '';
    this.type.setValue(null);
    this.findReservations();
  }

  remove(type: string): void {
    const index = this.types.indexOf(type);

    if (index >= 0) {
      this.types = this.types.filter(s => s !== type);
      this.allPaymentTypes = Object.keys(PaymentType).filter(s => !this.types.includes(s.toUpperCase()));

      this.type.setValue(null);
      this.findReservations();
    }
  }

  isAllSelected(): boolean {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSource.data.length;
    return numSelected === numRows;
  }

  toggleAllRows(): void {
    if (this.isAllSelected()) {
      this.selection.clear();
      return;
    }

    this.selection.select(...this.dataSource.data);
  }

  checkboxLabel(row?: any): string {
    if (!row) {
      return `${ this.isAllSelected() ? 'deselect' : 'select' } all`;
    }
    return `${ this.selection.isSelected(row) ? 'deselect' : 'select' } row ${ row.position + 1 }`;
  }

  private createForm(): void {
    this.dateRange = this.formBuilder.group({
      startDate: this.startDate,
      endDate: this.endDate
    });
    this.form = this.formBuilder.group({
      dateRange: this.dateRange,
      type: this.type
    });

    this.valueChanges();
  }

  private valueChanges(): void {
    this.dateRange.valueChanges.subscribe(value => {
      if (value?.startDate && value?.endDate) {
        this.findReservations();
      }
    });
  }

  private subscribe(): void {
    this.subscription = this.getState.subscribe(state => {
      if (state.data) {
        this.reservations = state.data?.map((reservation?: IReservationAll, position?: number) => {
          if (reservation?.id) {
            const month = newDateTimestamp(reservation.timestamp, reservation.room.timeZone).getMonth();
            let order;
            switch (month - this.startDate.value.getMonth()) {
              case 0:
                order = 'first';
                break;
              case 1:
                order = 'second';
                break;
              default:
                order = 'third';
            }
            return Object.assign({}, reservation, { position, order });
          }
          return reservation;
        });
        this.dataSource = new MatTableDataSource(this.reservations);
        if (this.reservations && this.reservations[0]?.id) {
          this.dataSource.paginator = this.paginator;
        }
      }
    });
  }

  private findReservations(page: number = 0): void {
    if (this.startDate.value && this.endDate.value) {
      const payload = {
        types: this.types,
        start: backendFormatDate(this.startDate.value),
        end: backendFormatDate(this.endDate.value),
        size: this.pageSize,
        page
      };
      this.store.dispatch(
        new fromActionsReservation.FindInvoiceReservation(payload)
      );
    }
  }

  private clean(): void {
    this.store.dispatch(
      new fromActionsReservation.Clean()
    );
  }

  private filterTypes(value: string): string[] {
    const filterValue = value.toLowerCase();

    return this.allPaymentTypes.filter(state => state.toLowerCase().indexOf(filterValue) === 0);
  }
}
