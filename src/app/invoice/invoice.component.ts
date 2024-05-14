import { ChangeDetectorRef, Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MAT_DATE_RANGE_SELECTION_STRATEGY } from '@angular/material/datepicker';
import { FormBuilder, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { AppState, selectInvoiceState } from '../store/app.states';
import { Observable, Subscription } from 'rxjs';
import { Store } from '@ngrx/store';
import * as fromActionsInvoice from '../store/invoice.actions';
import { MatTableDataSource } from '@angular/material/table';
import { MOBILE_PAGE_SIZE, PAGE_SIZE } from '../interfaces/pagination';
import { backendFormatDate, datesInSameWeek, newDateTimestamp } from '../util/dates';
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
import { MonthPeriodAdapter } from '../util/adapter/month-period-adapter.service';

pdfMake.vfs = pdfFonts.pdfMake.vfs;

@Component({
  selector: 'app-invoice',
  templateUrl: './invoice.component.html',
  styleUrls: ['./invoice.component.scss'],
  animations: [detailExpandAnimation],
  providers: [
    {
      provide: MAT_DATE_RANGE_SELECTION_STRATEGY,
      useClass: MonthPeriodAdapter,
    },
  ]
})
export class InvoiceComponent implements OnInit, OnDestroy {
  @ViewChild('pdfTable') pdfTable!: ElementRef;
  @ViewChild('typeInput') typeInput!: ElementRef<HTMLInputElement>;

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
  language: string;
  startNumber: UntypedFormControl = new UntypedFormControl('', [Validators.required, Validators.min(1)]);

  private getState: Observable<any>;

  private subscription: Subscription | undefined;
  private allPaymentTypes: string[] = Object.keys(PaymentType);
  private offices?: IOfficeAll[];

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
    this.getState = this.store.select(selectInvoiceState);
    this.dateFormat = this.translate.currentLang;
    this.language = this.translate.currentLang;
    this.filteredTypes = this.type.valueChanges.pipe(
      startWith(null),
      map((type: string | null) => type ? this.filterTypes(type) : this.allPaymentTypes.slice()));
  }

  get print(): void {
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

  private filterTypes(value: string): string[] {
    const filterValue = value.toLowerCase();

    return this.allPaymentTypes.filter(state => state.toLowerCase().indexOf(filterValue) === 0);
  }

  private filterOffice(name: string): IOfficeAll[] | undefined {
    const filterValue = name.toLowerCase();

    return this.offices?.filter(option => option.name?.toLowerCase().indexOf(filterValue) === 0);
  }

  private findInvoices(): void {
    if (this.startDate.value && this.endDate.value) {
      this.selection.clear();
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

  private subscribe(): void {
    this.subscription = this.getState.subscribe(state => {
      this.offices = state.offices;
      if (this.offices?.length === 1) {
        this.office.setValue(this.offices[0]);
      }
      if (state.changes) {
        this.invoices = state.data?.map((invoice: IInvoice, position: number) => {
          if (invoice.id) {
            const date1 = newDateTimestamp(invoice.timestamp, invoice.room.timeZone);
            let order;
            if (position + 1 < state.data.length) {
              const nextRow = state.data[position + 1];
              const date2 = newDateTimestamp(nextRow.timestamp, nextRow.room.timeZone);
              if (!datesInSameWeek(date1, date2)) {
                order = 'newWeek';
              }
            }
            return Object.assign({}, invoice, { position, order });
          }
          return invoice;
        });
        this.dataSource = new MatTableDataSource(this.invoices);
      }
    });
  }
}
