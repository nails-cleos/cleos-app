import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  type Mock,
  vi,
} from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BehaviorSubject } from 'rxjs';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { InvoiceListComponent } from './invoice-list.component';
import { IInvoice, IRoomInvoice } from '../invoice';
import { MOBILE_PAGE_SIZE, PAGE_SIZE } from '@app/interfaces/pagination';
import { ActivatedRoute } from '@angular/router';
import { IOfficeAll } from '@app/office/office';
import {
  backendFormatDate,
  DEFAULT_LOCALE,
  getNowTimeZone,
} from '@app/util/dates';
import { IUserAll } from '@app/user/user';
import { addDays } from 'date-fns';
import { IPaymentOption } from '@app/interfaces/payment';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { DriveAccessService } from '@app/services/drive-access.service';
import pdfMake from 'pdfmake/build/pdfmake';
import { SelectionModel } from '@angular/cdk/collections';
import { PaymentService } from '@app/services/payment.service';
import { provideAppDateAdapter } from '@app/util/adapter/app-date.provider';
import { NavigationService } from '@app/services/navigation.service';
import { signal } from '@angular/core';
import { OfficeStore } from '@app/store/office.store';
import { InvoiceStore } from '@app/store/invoice.store';
import { PaymentStore } from '@app/store/payment.store';
import { provideTranslateService } from '@ngx-translate/core';
describe('InvoiceListComponent', () => {
  let component: InvoiceListComponent;
  let fixture: ComponentFixture<InvoiceListComponent>;
  let navigationServiceSpy: Pick<
    NavigationService,
    'back' | 'navigate' | 'language'
  > & {
    back: ReturnType<typeof vi.fn>;
    navigate: ReturnType<typeof vi.fn>;
  };

  let breakpointObserverSpy: Pick<BreakpointObserver, 'observe'> & {
    observe: ReturnType<typeof vi.fn>;
  };
  let activatedRouteSpy: {
    snapshot: {
      paramMap: {
        get: ReturnType<typeof vi.fn>;
      };
    };
  };
  let driveAccessServiceSpy: {
    requestAccessIfNeeded: Mock;
  };
  let paymentServiceSpy: {
    getPaymentOptions: Mock;
  };
  let officeStoreSpy: {
    isLoading: ReturnType<typeof signal<boolean>>;
    data: ReturnType<typeof signal>;
    loadMyOffices: Mock;
    update: Mock;
  };
  let invoiceStoreSpy: {
    isLoading: ReturnType<typeof signal<boolean>>;
    data: ReturnType<typeof signal>;
    clean: Mock;
    loadOfficeToInvoice: Mock;
    uploadInvoices: Mock;
  };
  let paymentStoreSpy: {
    options: ReturnType<typeof signal>;
    getOptions: Mock;
  };

  let createPdfSpy: ReturnType<typeof vi.spyOn>;

  const mockOffice: IOfficeAll = {
    id: '1',
    manager: { id: '1', displayName: 'Officer' },
    name: 'Office 1',
  };

  const customer: IUserAll = {
    authorities: [],
    displayName: 'customer 1',
    email: 'customer@1.comn',
    id: '1',
    locale: DEFAULT_LOCALE,
    timeZone: 'Europe/Amsterdam',
  };

  const room: IRoomInvoice = {
    timeZone: 'Europe/Amsterdam',
    addressName: 'room address',
    currencyCode: 'EUR',
    email: 'room@euro.com',
    phone: '123456789',
  };

  const mockInvoice: IInvoice[] = [
    {
      id: '1',
      paths: ['invoice', '1'],
      customer,
      room,
      items: [
        {
          name: 'item 1',
          netPrice: 100,
          grossPrice: 121,
          order: 0,
        },
      ],
      timestamp: getNowTimeZone().getTime() / 1000,
      totals: {
        subTotal: 121,
        discount: 0,
        price: 100,
        totalPaid: 121,
        excBTW: 100,
        btw: 21,
      },
      discounts: [],
      position: 0,
    },
    {
      id: '2',
      paths: ['invoice', '2'],
      customer,
      room,
      items: [
        {
          name: 'item 2',
          netPrice: 100,
          grossPrice: 121,
          order: 0,
        },
      ],
      timestamp: getNowTimeZone().getTime() / 1000,
      totals: {
        subTotal: 121,
        discount: 0,
        price: 100,
        totalPaid: 121,
        excBTW: 100,
        btw: 21,
      },
      discounts: [],
      position: 1,
    },
  ];

  const fakeBlob = new Blob(['test'], { type: 'application/pdf' });
  const paymentOptions: IPaymentOption[] = [
    {
      label: 'Cash',
      type: 'CASH',
      enabled: true,
      enabledCustomer: false,
      default: true,
      filter: true,
      defaultFilter: false,
      show: true,
      icon: 'cash',
    },
    {
      label: 'Transfer',
      type: 'TRANSFER',
      enabled: true,
      enabledCustomer: false,
      default: true,
      filter: true,
      defaultFilter: true,
      show: true,
      icon: 'transfer',
    },
    {
      label: 'Mollie',
      type: 'MOLLIE',
      enabled: true,
      enabledCustomer: true,
      default: false,
      filter: true,
      defaultFilter: true,
      show: true,
    },
    {
      label: 'Account',
      type: 'ACCOUNT',
      enabled: true,
      enabledCustomer: true,
      default: false,
      filter: false,
      defaultFilter: false,
      show: false,
    },
  ];
  let breakpoint$: BehaviorSubject<any>;

  beforeEach(async () => {
    navigationServiceSpy = {
      back: vi.fn().mockName('NavigationService.back'),
      navigate: vi.fn().mockName('NavigationService.navigate'),
      language: DEFAULT_LOCALE,
    };
    paymentStoreSpy = {
      options: signal(paymentOptions),
      getOptions: vi.fn().mockName('getOptions'),
    };
    breakpoint$ = new BehaviorSubject<any>({
      matches: false,
      breakpoints: {
        [Breakpoints.XSmall]: false,
        [Breakpoints.Small]: false,
      },
    });

    breakpointObserverSpy = {
      observe: vi.fn().mockName('BreakpointObserver.observe'),
    };
    driveAccessServiceSpy = {
      requestAccessIfNeeded: vi
        .fn()
        .mockName('DriveAccessService.requestAccessIfNeeded'),
    };
    paymentServiceSpy = {
      getPaymentOptions: vi.fn().mockName('PaymentService.getPaymentOptions'),
    };
    paymentServiceSpy.getPaymentOptions.mockReturnValue(
      new BehaviorSubject(paymentOptions).asObservable(),
    );
    officeStoreSpy = {
      isLoading: signal(false),
      data: signal<any>(undefined),
      loadMyOffices: vi.fn().mockName('loadMyOffices'),
      update: vi.fn().mockName('update'),
    };
    invoiceStoreSpy = {
      isLoading: signal(false),
      data: signal<any>(undefined),
      clean: vi.fn().mockName('clean'),
      loadOfficeToInvoice: vi.fn().mockName('loadOfficeToInvoice'),
      uploadInvoices: vi.fn().mockName('uploadInvoices'),
    };
    activatedRouteSpy = {
      snapshot: {
        paramMap: {
          get: vi.fn().mockName('ParamMap.get'),
        },
      },
    };

    breakpointObserverSpy.observe.mockReturnValue(breakpoint$.asObservable());

    await TestBed.configureTestingModule({
      imports: [InvoiceListComponent],
      providers: [
        provideTranslateService(),
        { provide: NavigationService, useValue: navigationServiceSpy },
        { provide: PaymentStore, useValue: paymentStoreSpy },
        { provide: OfficeStore, useValue: officeStoreSpy },
        { provide: InvoiceStore, useValue: invoiceStoreSpy },
        { provide: BreakpointObserver, useValue: breakpointObserverSpy },
        { provide: ActivatedRoute, useValue: activatedRouteSpy },
        { provide: DriveAccessService, useValue: driveAccessServiceSpy },
        { provide: PaymentService, useValue: paymentServiceSpy },
        provideAppDateAdapter(),
      ],
      teardown: {
        destroyAfterEach: true,
      },
    }).compileComponents();

    fixture = TestBed.createComponent(InvoiceListComponent);
    component = fixture.componentInstance;

    vi.spyOn(globalThis, 'fetch').mockImplementation(() =>
      Promise.resolve({
        arrayBuffer: () => Promise.resolve(new ArrayBuffer(8)),
      } as Response),
    );

    createPdfSpy = vi.spyOn(pdfMake, 'createPdf').mockReturnValue({
      getBlob: vi.fn().mockResolvedValue(fakeBlob),
    } as any);

    fixture.detectChanges();
    paymentStoreSpy.getOptions.mockClear();
  });

  it('should filter payment types by label or type', () => {
    const byLabel = component['filterTypes']('cash', paymentOptions);
    const byType = component['filterTypes']('moll', paymentOptions);

    expect(byLabel?.map((option) => option.type)).toEqual(['CASH']);
    expect(byType?.map((option) => option.type)).toEqual(['MOLLIE']);
  });

  afterEach(() => {
    vi.clearAllMocks();
    breakpoint$.complete();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should compute dataSourceSignal correctly', () => {
    invoiceStoreSpy.data.set(mockInvoice);
    fixture.detectChanges();

    const data = component.dataSourceSignal() as any;
    expect(data?.length).toBe(2);
  });

  it('should compute resultsLengthSignal correctly', () => {
    invoiceStoreSpy.data.set(mockInvoice);
    fixture.detectChanges();

    expect(component.resultsLengthSignal()).toBe(2);
  });

  it('should set mobile page size when small breakpoint matches', () => {
    breakpoint$.next({
      matches: true,
      breakpoints: {
        [Breakpoints.XSmall]: true,
        [Breakpoints.Small]: true,
      },
    });
    fixture.detectChanges();

    expect(component.pageSizeSignal()).toBe(MOBILE_PAGE_SIZE);
  });

  it('should keep default page size when breakpoint does not match', () => {
    breakpoint$.next({
      matches: false,
      breakpoints: {
        [Breakpoints.XSmall]: false,
        [Breakpoints.Small]: false,
      },
    });
    fixture.detectChanges();

    expect(component.pageSizeSignal()).toBe(PAGE_SIZE);
  });

  it('should load invoices when office, start and endDate is set', () => {
    const date = getNowTimeZone();
    const start = addDays(date, -10);
    const end = date;
    component.getForm.office.setValue(mockOffice);
    component.getDateRangeForm.startDate.setValue(start);
    component.getDateRangeForm.endDate.setValue(end);
    fixture.detectChanges();

    expect(invoiceStoreSpy.loadOfficeToInvoice).toHaveBeenCalledWith(
      mockOffice.id,
      backendFormatDate(start)!,
      backendFormatDate(end)!,
      ['TRANSFER', 'MOLLIE'],
    );
  });

  it('should display office name with displayFnOffice', () => {
    const result = component.displayFnOffice(mockOffice);
    expect(result).toBe('Office 1');
  });

  it('should return empty string when displayFnOffice receives undefined', () => {
    const result = component.displayFnOffice(undefined as any);
    expect(result).toBe('');
  });

  it('should clear office value on Backspace key', () => {
    component.getForm.office.setValue(mockOffice);
    const event = { code: 'Backspace' } as KeyboardEvent;
    component.keyDownHandler(event);
    expect(component.getForm.office.value).toBeUndefined();
  });

  it('should not clear office value on other keys', () => {
    component.getForm.office.setValue(mockOffice);
    const event = { code: 'Enter' } as KeyboardEvent;
    component.keyDownHandler(event);
    expect(component.getForm.office.value).toBe(mockOffice);
  });

  it('should add payment type to selected when selected is called', () => {
    const cashOption = paymentOptions.find((option) => option.type === 'CASH')!;
    const event = {
      option: { value: cashOption.type },
    } as MatAutocompleteSelectedEvent;

    component.selected(event);

    expect(component.selectedPaymentOptionsSignal()).toContain(cashOption);
  });

  it('should remove payment type from available types when selected', () => {
    const cashOption = paymentOptions.find((option) => option.type === 'CASH')!;
    component.allPaymentOptionsWritableSignal.set(paymentOptions.slice(0, 2));
    const event = {
      option: { value: cashOption.type },
    } as MatAutocompleteSelectedEvent;

    component.selected(event);
    fixture.detectChanges();

    expect(
      component.allPaymentOptionsWritableSignal()?.map((option) => option.type),
    ).not.toContain('CASH');
  });

  it('should remove payment type from selected when remove is called', () => {
    const cashOption = paymentOptions.find((option) => option.type === 'CASH')!;
    const transferOption = paymentOptions.find(
      (option) => option.type === 'TRANSFER',
    )!;
    component.selectedPaymentOptionsSignal.set([cashOption, transferOption]);

    component.remove(cashOption);

    expect(component.selectedPaymentOptionsSignal()).not.toContain(cashOption);
  });

  it('should add payment type back to available types when removed', () => {
    const cashOption = paymentOptions.find((option) => option.type === 'CASH')!;
    const transferOption = paymentOptions.find(
      (option) => option.type === 'TRANSFER',
    )!;
    component.allPaymentOptionsWritableSignal.set(
      paymentOptions.filter((option) => option.type === 'TRANSFER'),
    );
    component.selectedPaymentOptionsSignal.set([cashOption, transferOption]);

    component.remove(cashOption);

    expect(
      component.allPaymentOptionsWritableSignal()?.map((option) => option.type),
    ).toContain('CASH');
  });

  it('should initialize selected invoice filters from defaultFilter options only', () => {
    expect(
      component.selectedPaymentOptionsSignal().map((option) => option.type),
    ).toEqual(['TRANSFER', 'MOLLIE']);
    expect(
      component.allPaymentOptionsWritableSignal()?.map((option) => option.type),
    ).toEqual(['CASH']);
  });

  it('should return true when all rows are selected', () => {
    invoiceStoreSpy.data.set(mockInvoice);
    fixture.detectChanges();
    component.toggleAllRows();

    expect(component.isAllSelected()).toBe(true);
  });

  it('should return false when not all rows are selected', () => {
    invoiceStoreSpy.data.set(mockInvoice);
    fixture.detectChanges();
    component.selectionSignal().select(mockInvoice[0]);

    expect(component.isAllSelected()).toBe(false);
  });

  it('should select all rows when toggleAllRows is called and not all selected', () => {
    invoiceStoreSpy.data.set(mockInvoice);
    fixture.detectChanges();

    component.toggleAllRows();

    expect(component.selectionSignal().selected.length).toBe(2);
  });

  it('should clear selection when toggleAllRows is called and all selected', () => {
    invoiceStoreSpy.data.set(mockInvoice);
    fixture.detectChanges();
    component.selectionSignal().select(...mockInvoice);

    component.toggleAllRows();

    expect(component.selectionSignal().selected.length).toBe(0);
  });

  it('should toggle selection of a row when toggleRow is called', () => {
    invoiceStoreSpy.data.set(mockInvoice);
    fixture.detectChanges();

    component.toggleRow(mockInvoice[0]);

    expect(component.selectionSignal().isSelected(mockInvoice[0])).toBe(true);

    component.toggleRow(mockInvoice[0]);

    expect(component.selectionSignal().isSelected(mockInvoice[0])).toBe(false);
  });

  it('should return "select all" label when no row provided and not all selected', () => {
    invoiceStoreSpy.data.set(mockInvoice);
    fixture.detectChanges();

    const label = component.checkboxLabel();

    expect(label).toBe('select all');
  });

  it('should return "deselect all" label when no row provided and all selected', () => {
    invoiceStoreSpy.data.set(mockInvoice);
    fixture.detectChanges();

    component.toggleAllRows();
    fixture.detectChanges();

    const label = component.checkboxLabel();

    expect(label).toBe('deselect all');
  });

  it('should return "select row X" label when row provided and not selected', () => {
    invoiceStoreSpy.data.set(mockInvoice);
    fixture.detectChanges();

    const label = component.checkboxLabel(mockInvoice[0]);

    expect(label).toBe('select row 1');
  });

  it('should return "deselect row X" label when row provided and selected', () => {
    invoiceStoreSpy.data.set(mockInvoice);
    fixture.detectChanges();
    component.selectionSignal().select(mockInvoice[0]);

    const label = component.checkboxLabel(mockInvoice[0]);

    expect(label).toBe('deselect row 1');
  });

  it('should navigate to invoice path when goToPath is called', () => {
    component.goToPath(mockInvoice[0]);

    expect(navigationServiceSpy.navigate).toHaveBeenCalledWith([
      'invoice',
      '1',
    ]);
  });

  it('should auto-select office when only one office is available', () => {
    const singleOffice = [mockOffice];
    officeStoreSpy.data.set({ kind: 'list', value: singleOffice });
    fixture.detectChanges();

    expect(component.getForm.office.value).toBe(mockOffice);
  });

  it('should clear office form control when keyDownHandler is called with Backspace', () => {
    component.getForm.office.setValue(mockOffice);

    component.keyDownHandler({ code: 'Backspace' } as KeyboardEvent);

    expect(component.getForm.office.value).toBe(undefined);
  });

  it('should filter office correctly using filteredOfficeSignal', () => {
    officeStoreSpy.data.set({
      kind: 'list',
      value: [
        mockOffice,
        {
          id: '2',
          name: 'Another Office',
          manager: { id: '1', displayName: 'Officer' },
        },
      ],
    });
    (component.getForm.office as any).setValue('A');
    fixture.detectChanges();

    const filtered = component.filteredOfficeSignal();
    expect(filtered?.length).toBe(1);
    expect(filtered?.[0].name).toBe('Another Office');
  });

  it('displayFnOffice should return office name', () => {
    const office = { name: 'Test Office' } as IOfficeAll;
    expect(component.displayFnOffice(office)).toBe('Test Office');
    expect(component.displayFnOffice(null as any)).toBe('');
  });

  it('should set startNumber when office has lastInvoiceNumber', () => {
    const officeWithLastInvoice = {
      ...mockOffice,
      lastInvoiceNumber: 100,
    };

    component.getForm.office.setValue(officeWithLastInvoice);
    fixture.detectChanges();

    expect(component.getForm.startNumber.value).toBe(101);
  });

  it('should generate PDF and upload invoices when print is called', async () => {
    // Arrange
    const startDate = new Date(2024, 0, 1);
    invoiceStoreSpy.data.set(mockInvoice);
    fixture.detectChanges();

    component.getForm.office.setValue(mockOffice);
    component.getForm.startNumber.setValue(10);
    component.getDateRangeForm.startDate.setValue(startDate);
    fixture.detectChanges();

    component.selectionSignal.set(
      new SelectionModel<IInvoice>(true, [...mockInvoice]),
    );

    // Act
    await component.print();

    expect(officeStoreSpy.update).toHaveBeenCalledWith(
      mockOffice.id,
      expect.objectContaining({
        lastInvoiceNumber: 12,
      }),
    );

    expect(invoiceStoreSpy.uploadInvoices).toHaveBeenCalledWith(
      mockOffice.id,
      fakeBlob,
      expect.stringMatching(/Sales .*\.pdf/),
      true,
    );

    expect(createPdfSpy).toHaveBeenCalled();
  });

  it('should NOT print when no office is selected', async () => {
    component.getForm.office.setValue(undefined);

    await component.print();

    expect(createPdfSpy).not.toHaveBeenCalled();
    expect(officeStoreSpy.update).not.toHaveBeenCalled();
    expect(invoiceStoreSpy.uploadInvoices).not.toHaveBeenCalled();
  });

  it('should NOT update office when not all invoices are selected', async () => {
    const startDate = new Date(2024, 0, 1);
    invoiceStoreSpy.data.set(mockInvoice);
    fixture.detectChanges();

    component.getForm.office.setValue(mockOffice);
    component.getDateRangeForm.startDate.setValue(startDate);
    component.selectionSignal.set(
      new SelectionModel<IInvoice>(true, [mockInvoice[0]]),
    );
    fixture.detectChanges();

    await component.print();

    expect(officeStoreSpy.update).not.toHaveBeenCalled();
    expect(invoiceStoreSpy.uploadInvoices).toHaveBeenCalledWith(
      mockOffice.id,
      fakeBlob,
      expect.stringMatching(/Sales .*\.pdf/),
      false,
    );
  });
});
