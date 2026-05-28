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
import { FormControl, FormGroup, NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { combineLatestWith } from 'rxjs';
import { Store } from '@ngrx/store';
import { getOfficeToInvoice, updateOfficeById, uploadInvoices } from '../store/invoice.actions';
import { backendFormatDate, datesInSameWeek, invoiceFormat, newDateTimestamp } from '../util/dates';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { IPaymentOption } from '../interfaces/payment';
import { map, startWith } from 'rxjs/operators';
import { MatAutocomplete, MatAutocompleteSelectedEvent, MatAutocompleteTrigger } from '@angular/material/autocomplete';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { SelectionModel } from '@angular/cdk/collections';
import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';
import { IInvoice } from '../interfaces/invoice';
import { IOffice, IOfficeAll, Office } from '../interfaces/office';
import { pdf } from '../util/invoice';
import { requireMatch } from '../util/validators';
import { TimeDetailPipe } from '../pipes/time-detail.pipe';
import { getInvoicesPipe } from '../store/selectors/invoice.selectors';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { MOBILE_PAGE_SIZE, PAGE_SIZE } from '../interfaces/pagination';
import { InvoiceState } from '../store/reducers/invoice.reducers';
import {
  MatEndDate,
  MatDatepickerToggle,
  MatDateRangeInput, MatDateRangePicker, MatStartDate,
} from '@angular/material/datepicker';
import { provideMonthPeriodAdapter } from '../util/adapter/app-date.provider';
import { DriveAccessService } from '../services/drive-access.service';
import { BackButtonDirective } from '../directives/back-button.directive';
import { getMyOfficesPipe } from '../store/selectors/office.selectors';
import { OfficeState } from '../store/reducers/office.reducers';
import { EnvService } from '../services/env.service';
import { getPaymentOptionsPipe } from '../store/selectors/payment.selectors';
import { PaymentState } from '../store/reducers/payment.reducers';
import { MatError, MatFormField, MatInput, MatLabel } from '@angular/material/input';
import { MatOption } from '@angular/material/core';
import { MatIcon } from '@angular/material/icon';
import { MatList, MatListItem, MatListItemIcon, MatListSubheaderCssMatStyler } from '@angular/material/list';
import { MatButton, MatIconButton } from '@angular/material/button';
import { DatePipe, NgClass } from '@angular/common';
import {
  MatCell,
  MatCellDef,
  MatColumnDef,
  MatFooterCell,
  MatFooterCellDef,
  MatFooterRow,
  MatFooterRowDef,
  MatHeaderCell,
  MatHeaderCellDef,
  MatHeaderRow,
  MatHeaderRowDef,
  MatRow,
  MatRowDef,
  MatTable,
} from '@angular/material/table';
import { MatTooltip } from '@angular/material/tooltip';
import { MatCheckbox } from '@angular/material/checkbox';
import { MatChipGrid, MatChipInput, MatChipRemove, MatChipRow } from '@angular/material/chips';
import { MatSuffix } from '@angular/material/form-field';

// Set up VFS fonts for pdfMake (provides fallback Roboto fonts)
(pdfMake as any).vfs = (pdfFonts as any).pdfMake?.vfs || pdfFonts;

type InvoiceForm = {
  office: FormControl<IOfficeAll | undefined>;
  dateRange: FormGroup<DateRangeForm>;
  type: FormControl<string>;
  startNumber: FormControl<number>;
};

type DateRangeForm = {
  startDate: FormControl<Date | undefined>;
  endDate: FormControl<Date | undefined>;
};

@Component({
  selector: 'app-invoice',
  templateUrl: './invoice.component.html',
  styleUrls: ['./invoice.component.scss'],
  imports: [TimeDetailPipe, MatFormField, MatLabel, MatInput, MatDatepickerToggle, MatOption, MatIcon, MatList,
    MatListItem, MatListSubheaderCssMatStyler, MatIconButton, MatButton, ReactiveFormsModule, TranslatePipe, NgClass,
    DatePipe, MatAutocomplete, MatError, MatTable, MatColumnDef, MatHeaderCellDef, MatHeaderCell, MatCellDef, MatCell,
    MatTooltip, MatListItemIcon, MatFooterCellDef, MatFooterCell, MatHeaderRowDef, MatHeaderRow, MatRowDef, MatRow,
    MatFooterRow, MatFooterRowDef, MatAutocompleteTrigger, TimeDetailPipe, BackButtonDirective, MatCheckbox,
    MatChipGrid, MatChipRow, MatChipInput, MatChipRemove, MatDateRangeInput, MatDateRangePicker, MatStartDate,
    MatEndDate, MatSuffix],
  providers: [...provideMonthPeriodAdapter()],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InvoiceComponent {
  private readonly env: EnvService = inject(EnvService);
  private readonly formBuilder: NonNullableFormBuilder = inject(NonNullableFormBuilder);
  private readonly breakpointObserver: BreakpointObserver = inject(BreakpointObserver);
  private readonly store: Store<InvoiceState | OfficeState | PaymentState> = inject(
    Store<InvoiceState | OfficeState | PaymentState>);
  private readonly translate: TranslateService = inject(TranslateService);
  private readonly router: Router = inject(Router);
  private readonly driveAccessService: DriveAccessService = inject(DriveAccessService);

  private allOffices$ = this.store.pipe(getMyOfficesPipe);
  private invoiceList$ = this.store.pipe(getInvoicesPipe);
  private breakpointObserver$ = this.breakpointObserver.observe([Breakpoints.XSmall, Breakpoints.Small]);
  private readonly paymentOptions$ = this.store.pipe(getPaymentOptionsPipe);

  private allOfficesSignal = toSignal(this.allOffices$);
  private paymentOptionsSignal = toSignal(this.paymentOptions$, { initialValue: [] });
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

  selectedPaymentOptionsSignal = signal<IPaymentOption[]>([]);
  allPaymentOptionsWritableSignal = signal<IPaymentOption[] | undefined>(undefined);
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
  resultsLengthSignal = computed(() => this.dataSourceSignal()?.length || 0);
  pageSizeSignal = computed(() => this.breakpointsSignal()?.matches ? MOBILE_PAGE_SIZE : PAGE_SIZE);

  filteredTypesSignal = toSignal(
    this.getForm.type.valueChanges.pipe(
      startWith(''),
      map((type: string | undefined) => type),
      combineLatestWith(toObservable(this.allPaymentOptionsWritableSignal)),
      map(([type, allPaymentTypes]) => type ? this.filterTypes(type, allPaymentTypes) : allPaymentTypes),
    ));

  typeInput = viewChild.required<ElementRef<HTMLInputElement>>('typeInput');

  displayedColumns: string[] = ['select', 'position', 'customer', 'timestamp', 'description', 'actions'];
  expandedInvoice?: IInvoice;

  selectionSignal = signal<SelectionModel<IInvoice>>(new SelectionModel<IInvoice>(true, []));
  isAllSelected = computed(() => this.selectionSignal().selected.length === this.resultsLengthSignal());
  isIndeterminate = computed(() => this.selectionSignal().selected.length > 0 && !this.isAllSelected());

  dateFormat: string = this.translate.getCurrentLang();
  language: string = this.translate.getCurrentLang();

  constructor() {
    effect(() => {
      const paymentOptions = this.paymentOptionsSignal();
      if (!paymentOptions.length) {
        return;
      }

      const filteredOptions = paymentOptions.filter(option => option.enabled && option.filter);
      const selectedTypes = filteredOptions.filter(option => option.defaultFilter);
      const availableOptions = filteredOptions.filter(option => !selectedTypes.includes(option));

      this.selectedPaymentOptionsSignal.set(selectedTypes);
      this.allPaymentOptionsWritableSignal.set(availableOptions);
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
        const types = this.selectedPaymentOptionsSignal().map((option: IPaymentOption) => option.type);
        this.store.dispatch(getOfficeToInvoice({ officeId, start, end, types }));
      }
    });

    effect(() => {
      this.driveAccessService.requestAccessIfNeeded(this.env.googleDriveUploadFile);
    });
  }

  get getForm(): InvoiceForm {
    return this.form.controls;
  }

  get getDateRangeForm(): DateRangeForm {
    return this.getForm.dateRange.controls;
  }

  async print() {
    const start = this.getForm.startNumber.value;

    const selectedOffice = this.getForm.office.value;
    if (!selectedOffice) {
      return;
    }
    const allSelected = this.selectionSignal().selected.length === this.resultsLengthSignal();
    if (allSelected) {
      const office: IOffice = new Office();
      office.lastInvoiceNumber = start + this.selectionSignal().selected.length;

      this.store.dispatch(updateOfficeById({ id: selectedOffice.id, office }));
    }
    await this.loadFonts();
    const fileName = `Sales ${ invoiceFormat(this.getDateRangeForm.startDate.value!) }.pdf`;
    const createPDF = pdf(this.selectionSignal().selected, selectedOffice, start, fileName, this.env);
    const printPdf: any = pdfMake.createPdf(createPDF);

    printPdf.getBlob().then((blob: Blob) => this.store.dispatch(
      uploadInvoices({ officeId: selectedOffice.id, blob, fileName, upload: allSelected }),
    ));
  }

  keyDownHandler = (event: KeyboardEvent): void => {
    if (event.code === 'Backspace') {
      this.getForm.office.setValue(undefined);
    }
  };

  displayFnOffice = (office: IOfficeAll): string => office ? office.name : '';

  selected = (event: MatAutocompleteSelectedEvent): void => {
    const type = event.option.value as string;
    const option = this.paymentOptionsSignal().find(option => option.type === type);
    if (option) {
      this.selectedPaymentOptionsSignal.update((current) => current.includes(option) ? current : [...current, option]);
      this.allPaymentOptionsWritableSignal.update((current) =>
        current?.filter((filter) => filter !== option));

      if (this.typeInput()) {
        this.typeInput().nativeElement.value = '';
      }
      this.getForm.type.setValue('');
    }
  };

  remove = (type: IPaymentOption): void => {
    this.selectedPaymentOptionsSignal.update((current) =>
      current.filter((c) => c !== type));

    this.allPaymentOptionsWritableSignal.update((current) =>
      current ? [...current, type] : [type]);

    this.getForm.type.setValue('');
  };

  toggleAllRows = (): void => {
    const invoiceList = this.dataSourceSignal() || [];
    const current = this.selectionSignal();

    if (current.selected.length === invoiceList.length) {
      this.selectionSignal.set(new SelectionModel<IInvoice>(true, []));
    } else {
      this.selectionSignal.set(new SelectionModel<IInvoice>(true, [...invoiceList]));
    }
  };

  toggleRow = (row: IInvoice): void => {
    const current = this.selectionSignal();
    if (current.isSelected(row)) {
      this.selectionSignal.set(new SelectionModel<IInvoice>(true, current.selected.filter(prev => prev !== row)));
    } else {
      this.selectionSignal.set(new SelectionModel<IInvoice>(true, [...current.selected, row]));
    }
  };

  checkboxLabel = (row?: IInvoice): string =>
    !row ? `${ this.isAllSelected() ? 'deselect' : 'select' } all` :
      `${ this.selectionSignal().isSelected(row) ? 'deselect' : 'select' } row ${ row.position + 1 }`;

  goToPath = (invoice: IInvoice): void => {
    this.router.navigate(invoice.paths);
  };

  private filterTypes = (
    value: string,
    allPaymentTypes?: IPaymentOption[],
  ): IPaymentOption[] | undefined => allPaymentTypes?.filter(option => {
    return option.label.toLowerCase().includes(value.toLowerCase()) ||
      option.type.toLowerCase().includes(value.toLowerCase());
  });

  private filterOffice = (name: string, offices: IOfficeAll[]): IOfficeAll[] | undefined => offices?.filter(
    option => option.name?.toLowerCase().indexOf(name.toLowerCase()) === 0);

  private loadFonts = async () => {
    await this.loadFont('EBGaramond-Regular.ttf', '/assets/fonts/EBGaramond-Regular.ttf');
    await this.loadFont('EBGaramond-Bold.ttf', '/assets/fonts/EBGaramond-Bold.ttf');
    await this.loadFont('EBGaramond-Italic.ttf', '/assets/fonts/EBGaramond-Italic.ttf');
    await this.loadFont('EBGaramond-BoldItalic.ttf', '/assets/fonts/EBGaramond-BoldItalic.ttf');

    // Configure fonts after loading
    pdfMake.fonts = {
      EBGaramond: {
        normal: 'EBGaramond-Regular.ttf',
        bold: 'EBGaramond-Bold.ttf',
        italics: 'EBGaramond-Italic.ttf',
        bolditalics: 'EBGaramond-BoldItalic.ttf',
      },
      Roboto: {
        normal: 'Roboto-Regular.ttf',
        bold: 'Roboto-Medium.ttf',
        italics: 'Roboto-Italic.ttf',
        bolditalics: 'Roboto-MediumItalic.ttf',
      },
    };
  };

  private loadFont = async (name: string, url: string) => {
    const res = await fetch(url);
    const buffer = await res.arrayBuffer();
    pdfMake.vfs[name] = btoa(
      new Uint8Array(buffer).reduce((data, byte) => data + String.fromCharCode(byte), ''),
    );
    (pdfMake as any).virtualfs.storage[name] = new Uint8Array(buffer);
  };
}
