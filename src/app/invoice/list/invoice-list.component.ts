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
import {
  FormControl,
  FormGroup,
  NonNullableFormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { combineLatestWith } from 'rxjs';
import {
  backendFormatDate,
  datesInSameWeek,
  invoiceFormat,
  newDateTimestamp,
} from '@app/util/dates';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { IPaymentOption } from '@app/interfaces/payment';
import { map, startWith } from 'rxjs/operators';
import {
  MatAutocomplete,
  MatAutocompleteSelectedEvent,
  MatAutocompleteTrigger,
} from '@angular/material/autocomplete';
import { TranslatePipe } from '@ngx-translate/core';
import { SelectionModel } from '@angular/cdk/collections';
import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';
import { IInvoice } from '../invoice';
import { IOfficeAll } from '@app/office/office';
import { pdf } from '@app/util/invoice';
import { requireMatch } from '@app/util/validators';
import { TimeDetailPipe } from '@app/pipes/time-detail.pipe';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { MOBILE_PAGE_SIZE, PAGE_SIZE } from '@app/interfaces/pagination';
import {
  MatDatepickerToggle,
  MatDateRangeInput,
  MatDateRangePicker,
  MatEndDate,
  MatStartDate,
} from '@angular/material/datepicker';
import { provideMonthPeriodAdapter } from '@app/util/adapter/app-date.provider';
import { DriveAccessService } from '@app/services/drive-access.service';
import { BackButtonDirective } from '@app/directives/back-button.directive';
import { EnvService } from '@app/services/env.service';
import {
  MatError,
  MatFormField,
  MatInput,
  MatLabel,
} from '@angular/material/input';
import { MatOption } from '@angular/material/core';
import { MatIcon } from '@angular/material/icon';
import {
  MatList,
  MatListItem,
  MatListItemIcon,
  MatListSubheaderCssMatStyler,
} from '@angular/material/list';
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
import {
  MatChipGrid,
  MatChipInput,
  MatChipRemove,
  MatChipRow,
} from '@angular/material/chips';
import { MatSuffix } from '@angular/material/form-field';
import { OfficeStore } from '@app/store/office.store';
import { InvoiceStore } from '@app/store/invoice.store';
import {
  TableSkeletonColumn,
  TableSkeletonComponent,
} from '@app/shared/skeleton/table-skeleton.component';
import { SkeletonComponent } from '@app/shared/skeleton/skeleton.component';
import { NavigationService } from '@app/services/navigation.service';
import { PaymentStore } from '@app/store/payment.store';

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
  selector: 'app-invoice-list',
  templateUrl: './invoice-list.component.html',
  styleUrls: ['./invoice-list.component.scss'],
  imports: [
    TimeDetailPipe,
    MatFormField,
    MatLabel,
    MatInput,
    MatDatepickerToggle,
    MatOption,
    MatIcon,
    MatList,
    MatListItem,
    MatListSubheaderCssMatStyler,
    MatIconButton,
    MatButton,
    ReactiveFormsModule,
    TranslatePipe,
    NgClass,
    DatePipe,
    MatAutocomplete,
    MatError,
    MatTable,
    MatColumnDef,
    MatHeaderCellDef,
    MatHeaderCell,
    MatCellDef,
    MatCell,
    MatTooltip,
    MatListItemIcon,
    MatFooterCellDef,
    MatFooterCell,
    MatHeaderRowDef,
    MatHeaderRow,
    MatRowDef,
    MatRow,
    MatFooterRow,
    MatFooterRowDef,
    MatAutocompleteTrigger,
    TimeDetailPipe,
    BackButtonDirective,
    MatCheckbox,
    MatChipGrid,
    MatChipRow,
    MatChipInput,
    MatChipRemove,
    MatDateRangeInput,
    MatDateRangePicker,
    MatStartDate,
    MatEndDate,
    MatSuffix,
    TableSkeletonComponent,
    SkeletonComponent,
  ],
  providers: [...provideMonthPeriodAdapter()],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InvoiceListComponent {
  private readonly env: EnvService = inject(EnvService);
  private readonly formBuilder: NonNullableFormBuilder = inject(
    NonNullableFormBuilder,
  );
  private readonly breakpointObserver: BreakpointObserver =
    inject(BreakpointObserver);
  private readonly paymentStore = inject(PaymentStore);
  private readonly officeStore = inject(OfficeStore);
  private readonly invoiceStore = inject(InvoiceStore);
  private readonly navigationService: NavigationService =
    inject(NavigationService);
  private readonly driveAccessService: DriveAccessService =
    inject(DriveAccessService);

  private breakpointObserver$ = this.breakpointObserver.observe([
    Breakpoints.XSmall,
    Breakpoints.Small,
  ]);

  private allOfficesSignal = computed(() => {
    const data = this.officeStore.data();
    return data?.kind === 'list' ? data.value : undefined;
  });
  private paymentOptionsSignal = this.paymentStore.options;
  private breakpointsSignal = toSignal(this.breakpointObserver$, {
    initialValue: {
      matches: false,
      breakpoints: {
        [Breakpoints.XSmall]: false,
        [Breakpoints.Small]: false,
      },
    },
  });

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
  private startDateSignal = toSignal(
    this.getDateRangeForm.startDate.valueChanges,
  );
  private endDateSignal = toSignal(this.getDateRangeForm.endDate.valueChanges);

  filteredOfficeSignal = toSignal(
    this.getForm.office.valueChanges.pipe(
      startWith(''),
      map((value: any) =>
        !value || typeof value === 'string' ? value : value.code,
      ),
      combineLatestWith(toObservable(this.allOfficesSignal)),
      map(([name, offices]) => {
        if (name) {
          return this.filterOffice(name, offices ?? []);
        } else {
          return offices ? offices.slice() : offices;
        }
      }),
    ),
  );

  selectedPaymentOptionsSignal = signal<IPaymentOption[]>([]);
  allPaymentOptionsWritableSignal = signal<IPaymentOption[] | undefined>(
    undefined,
  );
  isLoading = this.invoiceStore.isLoading;
  isOfficeLoading = this.officeStore.isLoading;
  dataSourceSignal = computed(() => {
    const invoiceList = this.invoiceStore.data();
    return invoiceList?.map((invoice: IInvoice, position: number) => {
      const date1 = newDateTimestamp(invoice.timestamp, invoice.room.timeZone);
      let order;
      if (position + 1 < invoiceList.length) {
        const nextRow = invoiceList[position + 1];
        const date2 = newDateTimestamp(
          nextRow.timestamp,
          nextRow.room.timeZone,
        );
        if (!datesInSameWeek(date1, date2)) {
          order = 'newWeek';
        }
      }
      return Object.assign({}, invoice, { position, order });
    });
  });
  showResultsSignal = computed(
    () => this.isLoading() || this.dataSourceSignal() !== undefined,
  );
  resultsLengthSignal = computed(() => this.dataSourceSignal()?.length || 0);
  pageSizeSignal = computed(() =>
    this.breakpointsSignal()?.matches ? MOBILE_PAGE_SIZE : PAGE_SIZE,
  );

  filteredTypesSignal = toSignal(
    this.getForm.type.valueChanges.pipe(
      startWith(''),
      map((type: string | undefined) => type),
      combineLatestWith(toObservable(this.allPaymentOptionsWritableSignal)),
      map(([type, allPaymentTypes]) =>
        type ? this.filterTypes(type, allPaymentTypes) : allPaymentTypes,
      ),
    ),
  );

  typeInput = viewChild.required<ElementRef<HTMLInputElement>>('typeInput');

  tableColumns: TableSkeletonColumn[] = [
    { key: 'select' },
    { key: 'position', hideOnMobile: true },
    { key: 'customer' },
    { key: 'timestamp' },
    { key: 'description', hideOnMobile: true },
    { key: 'actions', hideOnMobile: true },
  ];
  displayedColumns: string[] = this.tableColumns.map((column) => column.key);
  expandedInvoice?: IInvoice;

  selectionSignal = signal<SelectionModel<IInvoice>>(
    new SelectionModel<IInvoice>(true, []),
  );
  isAllSelected = computed(
    () => this.selectionSignal().selected.length === this.resultsLengthSignal(),
  );
  isIndeterminate = computed(
    () => this.selectionSignal().selected.length > 0 && !this.isAllSelected(),
  );

  readonly language = this.navigationService.language;

  constructor() {
    this.invoiceStore.clean();
    this.paymentStore.getOptions();
    this.officeStore.loadMyOffices();

    effect(() => {
      const paymentOptions = this.paymentOptionsSignal();
      if (!paymentOptions.length) {
        return;
      }

      const filteredOptions = paymentOptions.filter(
        (option) => option.enabled && option.filter,
      );
      const selectedTypes = filteredOptions.filter(
        (option) => option.defaultFilter,
      );
      const availableOptions = filteredOptions.filter(
        (option) => !selectedTypes.includes(option),
      );

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
      const startDate = this.startDateSignal();
      const endDate = this.endDateSignal();
      if (!startDate || !endDate) {
        return;
      }
      const start = backendFormatDate(startDate);
      const end = backendFormatDate(endDate);
      if (start && end) {
        const types = this.selectedPaymentOptionsSignal().map(
          (option: IPaymentOption) => option.type,
        );
        this.invoiceStore.loadOfficeToInvoice(officeId, start, end, types);
      }
    });

    effect(() => {
      this.driveAccessService.requestAccessIfNeeded(
        this.env.googleDriveUploadFile,
      );
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
    const allSelected =
      this.selectionSignal().selected.length === this.resultsLengthSignal();
    if (allSelected) {
      this.officeStore.update(selectedOffice.id, {
        lastInvoiceNumber: start + this.selectionSignal().selected.length,
      });
    }
    await this.loadFonts();
    const fileName = `Sales ${invoiceFormat(this.getDateRangeForm.startDate.value!)}.pdf`;
    const createPDF = pdf(
      this.selectionSignal().selected,
      selectedOffice,
      start,
      fileName,
      this.env,
    );
    const printPdf: any = pdfMake.createPdf(createPDF);

    printPdf
      .getBlob()
      .then((blob: Blob) =>
        this.invoiceStore.uploadInvoices(
          selectedOffice.id,
          blob,
          fileName,
          allSelected,
        ),
      );
  }

  keyDownHandler = (event: KeyboardEvent): void => {
    if (event.code === 'Backspace') {
      this.getForm.office.setValue(undefined);
    }
  };

  displayFnOffice = (office: IOfficeAll): string => (office ? office.name : '');

  selected = (event: MatAutocompleteSelectedEvent): void => {
    const type = event.option.value as string;
    const option = this.paymentOptionsSignal().find(
      (option) => option.type === type,
    );
    if (option) {
      this.selectedPaymentOptionsSignal.update((current) =>
        current.includes(option) ? current : [...current, option],
      );
      this.allPaymentOptionsWritableSignal.update((current) =>
        current?.filter((filter) => filter !== option),
      );

      if (this.typeInput()) {
        this.typeInput().nativeElement.value = '';
      }
      this.getForm.type.setValue('');
    }
  };

  remove = (type: IPaymentOption): void => {
    this.selectedPaymentOptionsSignal.update((current) =>
      current.filter((c) => c !== type),
    );

    this.allPaymentOptionsWritableSignal.update((current) =>
      current ? [...current, type] : [type],
    );

    this.getForm.type.setValue('');
  };

  toggleAllRows = (): void => {
    const invoiceList = this.dataSourceSignal() || [];
    const current = this.selectionSignal();

    if (current.selected.length === invoiceList.length) {
      this.selectionSignal.set(new SelectionModel<IInvoice>(true, []));
    } else {
      this.selectionSignal.set(
        new SelectionModel<IInvoice>(true, [...invoiceList]),
      );
    }
  };

  toggleRow = (row: IInvoice): void => {
    const current = this.selectionSignal();
    if (current.isSelected(row)) {
      this.selectionSignal.set(
        new SelectionModel<IInvoice>(
          true,
          current.selected.filter((prev) => prev !== row),
        ),
      );
    } else {
      this.selectionSignal.set(
        new SelectionModel<IInvoice>(true, [...current.selected, row]),
      );
    }
  };

  checkboxLabel = (row?: IInvoice): string =>
    !row
      ? `${this.isAllSelected() ? 'deselect' : 'select'} all`
      : `${this.selectionSignal().isSelected(row) ? 'deselect' : 'select'} row ${row.position + 1}`;

  goToPath = (invoice: IInvoice): void => {
    this.navigationService.navigate(invoice.paths);
  };

  private filterTypes = (
    value: string,
    allPaymentTypes?: IPaymentOption[],
  ): IPaymentOption[] | undefined =>
    allPaymentTypes?.filter((option) => {
      return (
        option.label.toLowerCase().includes(value.toLowerCase()) ||
        option.type.toLowerCase().includes(value.toLowerCase())
      );
    });

  private filterOffice = (
    name: string,
    offices: IOfficeAll[],
  ): IOfficeAll[] | undefined =>
    offices?.filter(
      (option) => option.name?.toLowerCase().indexOf(name.toLowerCase()) === 0,
    );

  private loadFonts = async () => {
    await this.loadFont(
      'EBGaramond-Regular.ttf',
      '/assets/fonts/EBGaramond-Regular.ttf',
    );
    await this.loadFont(
      'EBGaramond-Bold.ttf',
      '/assets/fonts/EBGaramond-Bold.ttf',
    );
    await this.loadFont(
      'EBGaramond-Italic.ttf',
      '/assets/fonts/EBGaramond-Italic.ttf',
    );
    await this.loadFont(
      'EBGaramond-BoldItalic.ttf',
      '/assets/fonts/EBGaramond-BoldItalic.ttf',
    );

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
      new Uint8Array(buffer).reduce(
        (data, byte) => data + String.fromCharCode(byte),
        '',
      ),
    );
    (pdfMake as any).virtualfs.storage[name] = new Uint8Array(buffer);
  };
}
