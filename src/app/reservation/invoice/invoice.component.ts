import { ChangeDetectorRef, Component, ElementRef, Injectable, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { DateAdapter } from '@angular/material/core';
import { DateRange, MAT_DATE_RANGE_SELECTION_STRATEGY, MatDateRangeSelectionStrategy } from '@angular/material/datepicker';
import { FormBuilder, FormControl, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { AppState, selectReservationState } from '../../store/app.states';
import { Observable, Subscription } from 'rxjs';
import { Store } from '@ngrx/store';
import * as fromActionsReservation from '../../store/reservation.actions';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { MOBILE_PAGE_SIZE, PAGE_SIZE } from '../../interfaces/pagination';
import { API_LOCALE, backendFormatDate, dayViewTitle, invoiceTitle, newDateTimestamp } from '../../util/dates';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { PaymentType, PaymentTypeKey } from '../../interfaces/payment';
import { map, startWith } from 'rxjs/operators';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { TranslateService } from '@ngx-translate/core';
import { detailExpandAnimation } from '../../util/animation';
import { SelectionModel } from '@angular/cdk/collections';
import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';
import { currencySymbol, getFullUserName, getUserName } from '../../util/helper';
import { IRoomAll } from '../../interfaces/room';
import { IInvoice, IItem, IReservationInvoice } from '../../interfaces/invoice';
import { IUser, IUserAll } from '../../interfaces/user';
import { environment } from '../../../environments/environment';
import { IOfficeAll } from '../../interfaces/office';

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

  // displayedColumns: string[] = ['select', 'position', 'customer', 'timestamp', 'treatment'];
  displayedColumns: string[] = ['select', 'position', 'customer', 'timestamp'];
  expandedReservation?: IReservationInvoice;
  reservations?: IReservationInvoice[];

  form!: UntypedFormGroup;
  office: UntypedFormControl = new UntypedFormControl('', [Validators.required]);
  filteredOffice: Observable<IOfficeAll[] | undefined> | undefined;

  dateRange!: UntypedFormGroup;
  startDate: UntypedFormControl = new UntypedFormControl('', [Validators.required]);
  endDate: UntypedFormControl = new UntypedFormControl('', [Validators.required]);
  type: UntypedFormControl = new UntypedFormControl();
  filteredTypes: Observable<string[]>;
  types: string[] = [];

  dataSource: any;
  selection = new SelectionModel<IReservationInvoice>(true, []);

  resultsLength = 0;
  pageSize = PAGE_SIZE;

  dateFormat: string;
  startNumber: FormControl<number | null> = new FormControl<number>(1, [Validators.required]);

  private getState: Observable<any>;

  private subscription: Subscription | undefined;
  private allPaymentTypes: string[] = Object.keys(PaymentType);
  private offices?: IOfficeAll[];
  private officeId?: string;

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
    pdfMake.fonts = {
      // download default Roboto font from cdnjs.com
      belleza: {
        normal: `${ window.location.origin }/assets/Belleza/Belleza-Regular.ttf`,
        bold: `${ window.location.origin }/assets/Belleza/Belleza-Regular.ttf`,
        italics: `${ window.location.origin }/assets/Belleza/Belleza-Regular.ttf`,
      },
    };

    const pdf = this.pdf();
    console.log(JSON.stringify(pdf));
    pdfMake.createPdf(pdf).open();
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
      if (value?.startDate && value?.endDate && this.officeId) {
        this.findReservations();
      }
    });
    this.office.valueChanges.subscribe(value => {
      if (value && value.id) {
        if (value?.startDate && value?.endDate) {
          this.findReservations();
        }
      }
    });
  }

  private subscribe(): void {
    this.subscription = this.getState.subscribe(state => {
      if (state.data) {
        this.reservations = state.data.map((reservation?: IReservationInvoice, position?: number) => {
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

  private findReservations(): void {
    if (this.startDate.value && this.endDate.value) {
      const payload = {
        officeId: this.office.value.id,
        types: this.types,
        start: backendFormatDate(this.startDate.value),
        end: backendFormatDate(this.endDate.value)
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

  private filterOffice(name: string): IOfficeAll[] | undefined {
    const filterValue = name.toLowerCase();

    return this.offices?.filter(option => option.name?.toLowerCase().indexOf(filterValue) === 0);
  }

  private createField(text: string, width: string | number, alignment: string, color?: string, margin: number[] = [0, 0, 0, 0],
                      border: boolean[] = [false, false, false, false], fontSize: number = 12, fillColor: string = '#fff'): any {

    if (color) {
      return { text, color, width, alignment, fontSize, margin, border, fillColor };
    }

    return { text, width, alignment, fontSize, margin, border, fillColor };
  }

  private createHeader(index: number, date: string, subject: string = '', kvKNr: string = '', accountNr: string = '', btwNr: string = ''): any {
    const image = {
      image: 'logo',
      width: '*',
      fit: [100, 100],
      alignment: 'center',
      pageBreak: 'none'
    };

    const data = {
      pageBreak: 'none',
      stack: [
        {
          columns: [
            this.createField('Date', 80, 'left', '#aaaaab'), // TODO
            this.createField(date, '*', 'left', '#333333')
          ]
        }, {
          columns: [
            this.createField('Subject', 80, 'left', '#aaaaab'), // TODO
            this.createField(subject, '*', 'left', '#333333')
          ]
        }, {
          columns: [
            this.createField('KvK nr', 80, 'left', '#aaaaab'), // TODO
            this.createField(kvKNr, '*', 'left', '#333333')
          ]
        }, {
          columns: [
            this.createField('Account nr', 80, 'left', '#aaaaab'), // TODO
            this.createField(accountNr, '*', 'left', '#333333')
          ]
        }, {
          columns: [
            this.createField('BTW nr', 80, 'left', '#aaaaab'), // TODO
            this.createField(btwNr, '*', 'left', '#333333')
          ]
        }
      ]
    };

    if (index > 0) {
      image.pageBreak = 'before';
      data.pageBreak = 'before';
    }

    return {
      columns: [[data], image]
    };
  }

  private fromTo(): any {
    return {
      columns: [
        this.createField('', '*', 'left', undefined, [0, 20, 0, 5]),
        this.createField('', '*', 'right', undefined, [0, 20, 0, 5])
      ]
    };
  }

  private companyName(room: IRoomAll): any {
    const phone = room.office.manager?.phone || '';
    const email = room.office.manager?.email || '';
    return [{
      columns: [
        this.createField('Address', 80, 'left', '#333333', [0, 0, 0, 5]), // TODO
        this.createField(room.address.name, 'auto', 'right', '#333333', [0, 0, 0, 0])
      ]
    }, {
      columns: [
        this.createField('Phone', 80, 'left', '#333333', [0, 0, 0, 5]), // TODO
        this.createField(phone, 'auto', 'right', '#333333', [0, 0, 0, 0])
      ]
    }, {
      columns: [
        this.createField('Email', 80, 'left', '#333333', [0, 0, 0, 5]), // TODO
        this.createField(email, 'auto', 'right', '#333333', [0, 0, 0, 0])
      ]
    }];
  }

  private clientName(customer: IUserAll): any {
    const clientName = getUserName(customer);
    const contact = customer.phone || customer.email;
    return [{
      columns: [
        this.createField('Client', 80, 'left', '#333333'), // TODO
        this.createField(clientName, '*', 'left', '#333333')
      ]
    }, {
      columns: [
        this.createField('Contact', 80, 'left', '#333333'), // TODO
        this.createField(contact, '*', 'left', '#333333')
      ]
    }];
  }

  private invoiceNro(receiptNro: string): any {
    const text = `Invoice No. ${ receiptNro }`; // TODO
    return this.createField(text, 'auto', 'center', undefined, [0, 10, 0, 10], undefined, 15);
  }

  private itemTitle(): any {
    return [
      this.createField('ITEM DESCRIPTION', '*', 'center', undefined, // TODO
        [0, 12, 0, 5], [false, true, false, true], undefined, '#a9a397'),
      this.createField('ITEM \n (excl. btw)', '*', 'center', undefined, // TODO
        [0, 5, 0, 5], [false, true, false, true], undefined, '#a9a397'),
      this.createField('BTW', '*', 'center', undefined, // TODO
        [0, 12, 0, 5], [false, true, false, true], undefined, '#a9a397'),
      this.createField('ITEM TOTAL (incl. btw)', '*', 'center', undefined, // TODO
        [0, 5, 0, 5], [false, true, false, true], undefined, '#a9a397')
    ];
  }

  private itemBody(name: string, neto: number, bruto: number, symbol: string): any {
    return [
      this.createField(name, '*', 'left', undefined, [0, 5, 0, 5], [false, false, false, true]),
      this.createField(`${ symbol } ${ neto.toFixed(2) }`, '*', 'right', undefined,
        [0, 5, 0, 5], [false, false, false, true], undefined, '#eee4e1'),
      this.createField(`${ symbol } ${ (bruto - neto).toFixed(2) }`, '*', 'right', undefined,
        [0, 5, 0, 5], [false, false, false, true], undefined, '#eee4e1'),
      this.createField(`${ symbol } ${ bruto.toFixed(2) }`, '*', 'right', undefined,
        [0, 5, 0, 5], [false, false, false, true], undefined, '#eee4e1')
    ];
  }

  private items(itemTitle: any, items: IItem[], currency: string): any {
    let body = [itemTitle];
    items.forEach(item => {
      const add = this.itemBody(item.name, item.netoPrice, item.brutoPrice, currency);
      body = [...body, add];
    });
    return {
      layout: {
        defaultBorder: false,
        hLineWidth: (i: number) => i === 1 || i === 0 ? 2 : 1,
        vLineWidth: () => 0,
        hLineColor: (i: number) => i === 1 || i === 0 ? '#8f887a' : '#dcc8c2',
        vLineColor: () => '#8f887a',
        hLineStyle: () => null,
        // vLineStyle: function (i, node) { return {dash: { length: 10, space: 4 }}; },
        paddingLeft: () => 10,
        paddingRight: () => 10,
        paddingTop: () => 2,
        paddingBottom: () => 2,
        fillColor: () => '#fff',
      },
      table: {
        headerRows: 1,
        widths: ['*', 80, 45, 80],
        body
      }
    };
  }

  private totals(totals: IInvoice, currency: string): any {
    const subTotal = [
      this.createField('Subtotal:', '*', 'right', undefined, [0, 5, 0, 5], [false, true, false, true]), // TODO
      this.createField(`${ currency } ${ totals.subTotal.toFixed(2) }`, '*', 'right', undefined,
        [0, 5, 0, 5], [false, true, false, true], undefined, '#eee4e1')
    ];

    const excBTW = [
      this.createField('Excl. BTW:', '*', 'right', undefined, [0, 5, 0, 5], [false, false, false, true]), // TODO
      this.createField(`${ currency } ${ totals.excBTW.toFixed(2) }`, '*', 'right', undefined,
        [0, 5, 0, 5], [false, false, false, true], undefined, '#eee4e1')
    ];

    const btw = [
      this.createField('BTW (21%):', '*', 'right', undefined, [0, 5, 0, 5], [false, false, false, true]), // TODO
      this.createField(`${ currency } ${ totals.btw.toFixed(2) }`, '*', 'right', undefined,
        [0, 5, 0, 5], [false, false, false, true], undefined, '#eee4e1')
    ];

    const total = [
      this.createField('Total:', '*', 'right', undefined, [0, 5, 0, 5], [false, false, false, true], 20), // TODO
      this.createField(`${ currency } ${ totals.totalPaid.toFixed(2) }`, '*', 'right', undefined,
        [0, 5, 0, 5], [false, false, false, true], 20, '#eee4e1')
    ];

    let body = [total, btw, excBTW];

    if (totals.discount) {
      const discount = [
        this.createField('Discount:', '*', 'right', undefined, [0, 5, 0, 5], [false, false, false, true]), // TODO
        this.createField(`(${ currency } ${ totals.discount.toFixed(2) })`, '*', 'right', '#ff8080',
          [0, 5, 0, 5], [false, false, false, true], undefined, '#eee4e1')];
      body = [subTotal, discount, total, btw, excBTW];
    }

    return {
      layout: {
        defaultBorder: false,
        hLineWidth: (i: number) => i === 0 ? 2 : 1,
        vLineWidth: () => 0,
        hLineColor: () => '#dcc8c2',
        vLineColor: () => '#dcc8c2',
        hLineStyle: () => null,
        // vLineStyle: function (i, node) { return {dash: { length: 10, space: 4 }}; },
        paddingLeft: () => 10,
        paddingRight: () => 10,
        paddingTop: () => 3,
        paddingBottom: () => 3,
        fillColor: () => '#fff',
      },
      table: {
        headerRows: 1,
        widths: ['*', 80],
        body
      }
    };
  }

  private pdf(): any {
    let content: any[] = [];
    this.selection.selected.map((reservation, index) => {
      const companyName = this.companyName(reservation.room);
      const fromTo = this.fromTo();
      const itemTitle = this.itemTitle();

      const start = Number(this.startNumber.value || 0);
      const next = start + index;
      const receiptNro = `${ next }`.padStart(5, '0');
      const date = dayViewTitle(newDateTimestamp(reservation.timestamp, reservation.room.timeZone), API_LOCALE);
      const office = reservation.room.office;
      const header = this.createHeader(index, date, office.subject, office.kvk, office.account, office.btw);
      const clientName = this.clientName(reservation.customer);
      const invoiceNro = this.invoiceNro(receiptNro);
      const currency = currencySymbol(reservation.room.currency);
      const items = this.items(itemTitle, reservation.items.slice().sort((a, b) => a.order - b.order), currency);
      const totals = this.totals(reservation.invoice, currency);

      content = [...content, header, fromTo, {
        columns: [clientName, companyName]
      }, '\n\n', invoiceNro, items, totals];

    });

    return {
      info: {
        title: `${ invoiceTitle(this.startDate.value) } - ${ invoiceTitle(this.endDate.value) }`
      },
      content,
      defaultStyle: {
        font: 'belleza'
      },
      images: {
        logo: `${ environment.appServer }/assets/icons/icon-192x192.png`
      },
      pageSize: 'A4'
    };
  }
}
