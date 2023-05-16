import { ChangeDetectorRef, Component, ElementRef, Injectable, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { DateAdapter } from '@angular/material/core';
import { DateRange, MAT_DATE_RANGE_SELECTION_STRATEGY, MatDateRangeSelectionStrategy } from '@angular/material/datepicker';
import { FormBuilder, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { AppState, selectInvoiceState } from '../store/app.states';
import { Observable, Subscription } from 'rxjs';
import { Store } from '@ngrx/store';
import * as fromActionsInvoice from '../store/invoice.actions';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { MOBILE_PAGE_SIZE, PAGE_SIZE } from '../interfaces/pagination';
import { backendFormatDate, newDateTimestamp } from '../util/dates';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { PaymentType, PaymentTypeKey } from '../interfaces/payment';
import { map, startWith } from 'rxjs/operators';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { TranslateService } from '@ngx-translate/core';
import { detailExpandAnimation } from '../util/animation';
import { SelectionModel } from '@angular/cdk/collections';
import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';
import { IInvoice } from '../interfaces/invoice';
import { IOffice, IOfficeAll, Office } from '../interfaces/office';
import { pdf } from '../util/invoice';
import { requireMatch } from '../util/validators';
import { ViewportScroller } from '@angular/common';

pdfMake.vfs = pdfFonts.pdfMake.vfs;

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
  @ViewChild('pdfTable') pdfTable!: ElementRef;
  @ViewChild(MatPaginator) paginator?: MatPaginator;
  @ViewChild('typeInput') typeInput!: ElementRef<HTMLInputElement>;
  title = 'htmltopdf';

  displayedColumns: string[] = ['select', 'position', 'customer', 'timestamp', 'treatment', 'actions'];
  expandedInvoice?: IInvoice;
  invoices?: IInvoice[];

  form!: UntypedFormGroup;
  office: UntypedFormControl = new UntypedFormControl('', [
    Validators.required, requireMatch
  ]);
  filteredOffice: Observable<IOfficeAll[] | undefined> | undefined;

  dateRange!: UntypedFormGroup;
  startDate: UntypedFormControl = new UntypedFormControl('', [Validators.required]);
  endDate: UntypedFormControl = new UntypedFormControl('', [Validators.required]);
  type: UntypedFormControl = new UntypedFormControl();
  filteredTypes: Observable<string[]>;
  types: string[] = [];

  dataSource: any;
  selection = new SelectionModel<IInvoice>(true, []);

  resultsLength = 0;
  pageSize = PAGE_SIZE;

  dateFormat: string;
  startNumber: UntypedFormControl = new UntypedFormControl('', [Validators.required, Validators.min(1)]);

  private getState: Observable<any>;

  private subscription: Subscription | undefined;
  private allPaymentTypes: string[] = Object.keys(PaymentType);
  private offices?: IOfficeAll[];

  constructor(private readonly translate: TranslateService, private store: Store<AppState>, private formBuilder: FormBuilder,
              private cdRef: ChangeDetectorRef, private breakpointObserver: BreakpointObserver,
              private viewportScroller: ViewportScroller) {
    breakpointObserver.observe([
      Breakpoints.XSmall,
      Breakpoints.Small
    ]).subscribe(result => {
      if (result.matches) {
        this.pageSize = MOBILE_PAGE_SIZE;
      }
    });
    this.getState = this.store.select(selectInvoiceState);
    this.dateFormat = this.translate.currentLang;
    this.filteredTypes = this.type.valueChanges.pipe(
      startWith(null),
      map((type: string | null) => type ? this.filterTypes(type) : this.allPaymentTypes.slice()));
  }

  get print(): void {
    pdfMake.fonts = {
      belleza: {
        normal: `${ window.location.origin }/assets/Belleza/Belleza-Regular.ttf`,
        bold: `${ window.location.origin }/assets/Belleza/Belleza-Regular.ttf`,
        italics: `${ window.location.origin }/assets/Belleza/Belleza-Regular.ttf`,
      },
    };

    const start = Number(this.startNumber.value || 0);

    if (this.selection.selected.length === this.invoices?.length) {
      const lastInvoiceNumber = start + this.selection.selected.length;
      const office: IOffice = new Office();
      office.id = this.office.value.id;
      office.lastInvoiceNumber = lastInvoiceNumber;
      this.store.dispatch(
        new fromActionsInvoice.UpdateOffices(office)
      );
    }
    const printPdf = pdf(this.selection.selected, this.office.value, start, this.startDate.value, this.endDate.value);
    pdfMake.createPdf(printPdf).open();
    return;
  }

  ngOnInit(): void {
    this.clean();
    this.createForm();
    this.subscribe();
    this.findOffices();
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }

  keyDownHandler(event: any): void {
    if (event.code === 'Backspace') {
      this.office.setValue(null);
    }
  }

  displayFnOffice(office: IOfficeAll): string {
    return office ? office.name : '';
  }

  selected(event: MatAutocompleteSelectedEvent): void {
    const type = PaymentType[event.option.value as PaymentTypeKey];
    this.types = [...this.types, type];
    this.allPaymentTypes = this.allPaymentTypes.filter(s => PaymentType[s as PaymentTypeKey] !== type);
    this.typeInput.nativeElement.value = '';
    this.type.setValue(null);
    this.findInvoices();
  }

  remove(type: string): void {
    const index = this.types.indexOf(type);

    if (index >= 0) {
      this.types = this.types.filter(s => s !== type);
      this.allPaymentTypes = Object.keys(PaymentType).filter(s => !this.types.includes(s.toUpperCase()));

      this.type.setValue(null);
      this.findInvoices();
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
      office: this.office,
      dateRange: this.dateRange,
      type: this.type
    });

    this.filteredOffice = this.office.valueChanges.pipe(
      startWith(''),
      map(value => typeof value === 'string' ? value : value ? value.name : ''),
      map(name => name ? this.filterOffice(name) : this.offices ? this.offices.slice() : this.offices)
    );

    this.valueChanges();
  }

  private valueChanges(): void {
    this.dateRange.valueChanges.subscribe(value => {
      if (value?.startDate && value?.endDate && this.office.value.id) {
        this.findInvoices();
      }
    });
    this.office.valueChanges.subscribe(value => {
      if (value && value.id) {
        this.startNumber.setValue(value.lastInvoiceNumber || 1);
        if (value?.startDate && value?.endDate) {
          this.findInvoices();
        }
      }
    });
  }

  private subscribe(): void {
    this.subscription = this.getState.subscribe(state => {
      this.offices = state.offices;
      if (this.offices?.length === 1) {
        this.office.setValue(this.offices[0]);
      }
      if (state.data) {
        this.invoices = state.data.map((invoice: IInvoice, position: number) => {
          if (invoice.id) {
            const month = newDateTimestamp(invoice.timestamp, invoice.room.timeZone).getMonth();
            let order;
            if (position + 1 < state.data.length) {
              const nextRow = state.data[position + 1];
              const nextMonth = newDateTimestamp(nextRow.timestamp, nextRow.room.timeZone).getMonth();
              if (nextMonth !== month) {
                if (month - this.startDate.value.getMonth() === 0) {
                  order = 'first';
                } else {
                  order = 'second';
                }
              }
            } else {
              order = 'third';
            }
            return Object.assign({}, invoice, { position, order });
          }
          return invoice;
        });
        this.dataSource = new MatTableDataSource(this.invoices);
        if (this.invoices && this.invoices[0]?.id) {
          this.dataSource.paginator = this.paginator;
        }
      }
    });
  }

  private findInvoices(): void {
    if (this.startDate.value && this.endDate.value) {
      const payload = {
        officeId: this.office.value.id,
        types: this.types,
        start: backendFormatDate(this.startDate.value),
        end: backendFormatDate(this.endDate.value)
      };
      this.store.dispatch(
        new fromActionsInvoice.InvoiceFind(payload)
      );
    }
  }

  private findOffices(): void {
    this.store.dispatch(
      new fromActionsInvoice.FindMyOffices()
    );
  }

  private clean(): void {
    this.store.dispatch(
      new fromActionsInvoice.Clean()
    );
  }

  private filterTypes(value: string): string[] {
    const filterValue = value.toLowerCase();

    return this.allPaymentTypes.filter(state => state.toLowerCase().indexOf(filterValue) === 0);
  }

  private filterOffice(name: string): IOfficeAll[] | undefined {
    const filterValue = name.toLowerCase();

    return this.offices?.filter(option => option.name?.toLowerCase().indexOf(filterValue) === 0);
  }
}
