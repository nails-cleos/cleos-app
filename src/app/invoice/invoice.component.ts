import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  ElementRef,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { FormControl, FormGroup, NonNullableFormBuilder, Validators } from '@angular/forms';
import { combineLatestWith, of } from 'rxjs';
import { Store } from '@ngrx/store';
import { getOfficeToInvoice, updateOfficeById } from '../store/invoice.actions';
import { backendFormatDate, datesInSameWeek, newDateTimestamp } from '../util/dates';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { PaymentType, PaymentTypeKey } from '../interfaces/payment';
import { map, startWith } from 'rxjs/operators';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { TranslateService } from '@ngx-translate/core';
import { detailExpandAnimation } from '../util/animation';
import { SelectionModel } from '@angular/cdk/collections';
import pdfMake, { fonts } from 'pdfmake/build/pdfmake';
import { IInvoice } from '../interfaces/invoice';
import { IOffice, IOfficeAll, Office } from '../interfaces/office';
import { pdf } from '../util/invoice';
import { requireMatch } from '../util/validators';
import { environment } from '../../environments/environment';
import { SharedModule } from '../shared/shared.module';
import { TimeDetailPipe } from '../pipes/time-detail.pipe';
import { getInvoicesPipe, getOfficesPipe } from '../store/selectors/invoice.selectors';
import { toSignal } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { MOBILE_PAGE_SIZE, PAGE_SIZE } from '../interfaces/pagination';
import { InvoiceState } from '../store/reducers/invoice.reducers';
import { MAT_DATE_RANGE_SELECTION_STRATEGY } from '@angular/material/datepicker';
import { MonthPeriodAdapter } from '../util/adapter/month-period-adapter.service';

pdfMake.fonts = {
  EBGaramond: {
    normal: `${environment.appServer}/assets/fonts/EBGaramond-Regular.ttf`,
    bold: `${environment.appServer}/assets/fonts/EBGaramond-Bold.ttf`,
    italics: `${environment.appServer}/assets/fonts/EBGaramond-Italic.ttf`,
    bolditalics: `${environment.appServer}/assets/fonts/EBGaramond-BoldItalic.ttf`,
  },
};

type InvoiceForm = {
  office: FormControl<IOfficeAll | undefined>;
  dateRange: FormGroup<DateRangeForm>;
  type: FormControl<PaymentType | ''>;
  startNumber: FormControl<number>;
}

type DateRangeForm = {
  startDate: FormControl<Date | undefined>;
  endDate: FormControl<Date | undefined>;
}

@Component({
  selector: 'app-invoice',
  templateUrl: './invoice.component.html',
  styleUrls: ['./invoice.component.scss'],
  animations: [detailExpandAnimation],
  imports: [SharedModule, TimeDetailPipe],
  providers: [
    {
      provide: MAT_DATE_RANGE_SELECTION_STRATEGY,
      useClass: MonthPeriodAdapter,
    },
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InvoiceComponent {
  private readonly formBuilder: NonNullableFormBuilder = inject(NonNullableFormBuilder);
  private readonly breakpointObserver: BreakpointObserver = inject(BreakpointObserver);
  private readonly store: Store<InvoiceState> = inject(Store<InvoiceState>);
  private readonly translate: TranslateService = inject(TranslateService);
  private readonly router: Router = inject(Router);

  private allOffices$ = this.store.pipe(getOfficesPipe);
  private invoiceList$ = this.store.pipe(getInvoicesPipe);
  private breakpointObserver$ = this.breakpointObserver.observe([Breakpoints.XSmall, Breakpoints.Small]);
  private allPaymentTypes$ = of(Object.keys(PaymentType));

  private allOfficesSignal = toSignal(this.allOffices$);
  private allPaymentTypesSignal = toSignal(this.allPaymentTypes$);
  private invoiceListSignal = toSignal(this.invoiceList$);
  private breakpointsSignal = toSignal(
    this.breakpointObserver$, {
      initialValue: {
        matches: false,
        breakpoints: {
          [Breakpoints.XSmall]: false,
          [Breakpoints.Small]: false,
        },
      },
    },
  );

  form: FormGroup<InvoiceForm> = this.formBuilder.group<InvoiceForm>({
    office: this.formBuilder.control(undefined, {
      validators: [Validators.required, requireMatch],
    }),
    type: this.formBuilder.control(''),
    startNumber: this.formBuilder.control(0, {
      validators: [Validators.required, Validators.min(1)],
    }),
    dateRange: this.formBuilder.group<DateRangeForm>({
      startDate: this.formBuilder.control(undefined, {
        validators: [Validators.required],
      }),
      endDate: this.formBuilder.control(undefined, {
        validators: [Validators.required],
      }),
    }),
  });

  private officeSignal = toSignal(this.getForm.office.valueChanges);
  private startDateSignal = toSignal(this.getDateRangeForm.startDate.valueChanges);
  private endDateSignal = toSignal(this.getDateRangeForm.endDate.valueChanges);

  filteredOfficeSignal = toSignal(
    this.getForm.office.valueChanges.pipe(
      startWith(''),
      map((value: any) => !value || typeof value === 'string' ? value : value.code),
      combineLatestWith(this.allOffices$),
      map(([name, offices]) => {
        if (name) {
          return this.filterOffice(name, offices);
        } else {
          return offices ? offices.slice() : offices;
        }
      }),
    ));

  filteredTypesSignal = toSignal(
    this.getForm.type.valueChanges.pipe(
      startWith(''),
      map((type: string | undefined) => type),
      combineLatestWith(this.allPaymentTypes$),
      map(([type, allPaymentTypes]) => type ? this.filterTypes(type, allPaymentTypes) : allPaymentTypes),
    ));

  selectedPaymentTypesSignal = signal<string[]>([PaymentType.transfer, PaymentType.paynl]);
  allPaymentTypesWritableSignal = signal<string[] | undefined>(undefined);
  dataSourceSignal = computed(() => {
    const invoiceList = this.invoiceListSignal();
    return invoiceList?.map((invoice: IInvoice, position: number) => {
      if (invoice.id) {
        const date1 = newDateTimestamp(invoice.timestamp, invoice.room.timeZone);
        let order;
        if (position + 1 < invoiceList.length) {
          const nextRow = invoiceList[position + 1];
          const date2 = newDateTimestamp(nextRow.timestamp, nextRow.room.timeZone);
          if (!datesInSameWeek(date1, date2)) {
            order = 'newWeek';
          }
        }
        return Object.assign({}, invoice, { position, order });
      }
      return invoice;
    });
  });
  resultsLengthSignal = computed(() => this.invoiceListSignal()?.length || 0);
  pageSizeSignal = computed(() => this.breakpointsSignal()?.matches ? MOBILE_PAGE_SIZE : PAGE_SIZE);

  typeInput = viewChild.required<ElementRef<HTMLInputElement>>('typeInput');

  displayedColumns: string[] = ['select', 'position', 'customer', 'timestamp', 'description', 'actions'];
  expandedInvoice?: IInvoice;

  selection = new SelectionModel<IInvoice>(true, []);

  dateFormat: string = this.translate.currentLang;
  language: string = this.translate.currentLang;

  constructor() {
    const initial = this.allPaymentTypesSignal();
    this.allPaymentTypesWritableSignal.set(initial ? [...initial] : []);

    effect(() => {
      const paymentTypes = this.allPaymentTypesSignal();
      if (!paymentTypes) {
        return;
      }

      this.allPaymentTypesWritableSignal.set(paymentTypes);
    });

    effect(() => {
      const offices = this.allOfficesSignal();
      if (offices?.length === 1) {
        this.getForm.office.setValue(offices[0]);
      }
    });

    effect(() => {
      const office = this.officeSignal();
      if (!office) {
        return;
      }
      if (office.lastInvoiceNumber) {
        this.getForm.startNumber.setValue(office.lastInvoiceNumber + 1);
      }
      const officeId = office.id;
      const start = backendFormatDate(this.startDateSignal());
      const end = backendFormatDate(this.endDateSignal());
      if (start && end) {
        const types = this.selectedPaymentTypesSignal();
        this.store.dispatch(getOfficeToInvoice({ officeId, start, end, types }));
      }
    });
  }

  get getForm(): InvoiceForm {
    return this.form.controls;
  }

  get getDateRangeForm(): DateRangeForm {
    return this.getForm.dateRange.controls;
  }

  print(): void {
    const start = this.getForm.startNumber.value;

    const selectedOffice = this.getForm.office.value;
    if (!selectedOffice) {
      return;
    }
    if (this.selection.selected.length === this.resultsLengthSignal()) {
      const lastInvoiceNumber = start + this.selection.selected.length;
      const office: IOffice = new Office();
      const id = selectedOffice.id;
      office.lastInvoiceNumber = lastInvoiceNumber;
      this.store.dispatch(updateOfficeById({ id, office }));
    }
    const printPdf = pdf(this.selection.selected, selectedOffice, start, this.getDateRangeForm.startDate.value!,
      this.getDateRangeForm.endDate.value!);
    pdfMake.createPdf(printPdf, undefined, fonts).open();
    return;
  }

  keyDownHandler = (event: KeyboardEvent): void => {
    if (event.code === 'Backspace') {
      this.getForm.office.setValue(undefined);
    }
  };

  displayFnOffice = (office: IOfficeAll): string => office ? office.name : '';

  selected = (event: MatAutocompleteSelectedEvent): void => {
    const type = PaymentType[event.option.value as PaymentTypeKey];
    this.selectedPaymentTypesSignal.update((current) => [...current, type]);
    this.allPaymentTypesWritableSignal.update((current) =>
      current?.filter((c) => c !== type));

    if (this.typeInput()) {
      this.typeInput().nativeElement.value = '';
    }
    this.getForm.type.setValue('');
  };

  remove = (type: string): void => {
    this.selectedPaymentTypesSignal.update((current) =>
      current.filter((c) => c !== type));

    this.allPaymentTypesWritableSignal.update((current) =>
      current ? [...current, type] : [type]);

    this.getForm.type.setValue('');
  };

  // numSelected === numRows
  isAllSelected = (): boolean => this.selection.selected.length === this.resultsLengthSignal();

  toggleAllRows = (): void => {
    if (this.isAllSelected()) {
      this.selection.clear();
      return;
    }

    this.selection.select(...this.invoiceListSignal()!);
  };

  checkboxLabel = (row?: IInvoice): string =>
    !row ? `${this.isAllSelected() ? 'deselect' : 'select'} all` :
      `${this.selection.isSelected(row) ? 'deselect' : 'select'} row ${row.position + 1}`;

  goToPath = (invoice: IInvoice): void => {
    this.router.navigate(invoice.paths);
  };

  private filterTypes = (
    value: string,
    allPaymentTypes: string[],
  ): string[] => allPaymentTypes.filter(state => state.toLowerCase().indexOf(value.toLowerCase()) === 0);

  private filterOffice = (name: string, offices: IOfficeAll[]): IOfficeAll[] | undefined => offices?.filter(
    option => option.name?.toLowerCase().indexOf(name.toLowerCase()) === 0);
}
