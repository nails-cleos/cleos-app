import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BehaviorSubject } from 'rxjs';
import { Store } from '@ngrx/store';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { InvoiceComponent } from './invoice.component';
import { IInvoice, IRoomInvoice } from '../interfaces/invoice';
import { MOBILE_PAGE_SIZE, PAGE_SIZE } from '../interfaces/pagination';
import { ActivatedRoute, Router } from '@angular/router';
import { IOfficeAll } from '../interfaces/office';
import { backendFormatDate, getNowTimeZone } from '../util/dates';
import { getOfficeToInvoice } from '../store/invoice.actions';
import { IUserAll } from '../interfaces/user';
import { addDays } from 'date-fns';
import { IPaymentOption } from '../interfaces/payment';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { InvoiceState } from '../store/reducers/invoice.reducers';
import { DriveAccessService } from '../services/drive-access.service';
import pdfMake from 'pdfmake/build/pdfmake';
import { SelectionModel } from '@angular/cdk/collections';
import { PaymentService } from '../services/payment.service';

describe('InvoiceComponent', () => {
  let component: InvoiceComponent;
  let fixture: ComponentFixture<InvoiceComponent>;
  let storeSpy: jasmine.SpyObj<Store<InvoiceState>>;
  let breakpointObserverSpy: jasmine.SpyObj<BreakpointObserver>;
  let activatedRouteSpy: jasmine.SpyObj<ActivatedRoute>;
  let routerSpy: jasmine.SpyObj<Router>;
  let driveAccessServiceSpy: jasmine.SpyObj<DriveAccessService>;
  let paymentServiceSpy: jasmine.SpyObj<PaymentService>;
  let translate: TranslateService;

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
    locale: 'en-GB',
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
      items: [{
        name: 'item 1',
        netPrice: 100,
        grossPrice: 121,
        order: 0,
      }],
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
      items: [{
        name: 'item 2',
        netPrice: 100,
        grossPrice: 121,
        order: 0,
      }],
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

  let officeList$: BehaviorSubject<any>;
  let invoiceList$: BehaviorSubject<any>;
  let paymentOptions$: BehaviorSubject<any>;
  let breakpoint$: BehaviorSubject<any>;

  beforeEach(async () => {
    officeList$ = new BehaviorSubject(undefined);
    invoiceList$ = new BehaviorSubject(undefined);
    paymentOptions$ = new BehaviorSubject(paymentOptions);
    breakpoint$ = new BehaviorSubject<any>({
      matches: false,
      breakpoints: {
        [Breakpoints.XSmall]: false,
        [Breakpoints.Small]: false,
      },
    });

    storeSpy = jasmine.createSpyObj('Store', ['pipe', 'dispatch']);
    breakpointObserverSpy = jasmine.createSpyObj('BreakpointObserver', ['observe']);
    routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    driveAccessServiceSpy = jasmine.createSpyObj('DriveAccessService', ['requestAccessIfNeeded']);
    paymentServiceSpy = jasmine.createSpyObj('PaymentService', ['getPaymentOptions']);
    paymentServiceSpy.getPaymentOptions.and.returnValue(new BehaviorSubject(paymentOptions).asObservable());
    activatedRouteSpy = jasmine.createSpyObj('ActivatedRoute', [], {
      snapshot: {
        paramMap: jasmine.createSpyObj('ParamMap', ['get']),
      },
    });

    let pipeCallIndex = 0;
    storeSpy.pipe.and.callFake(() => {
      pipeCallIndex++;
      switch (pipeCallIndex) {
        case 1:
          return officeList$.asObservable();
        case 2:
          return invoiceList$.asObservable();
        case 3:
          return paymentOptions$.asObservable();
        default:
          return new BehaviorSubject(undefined).asObservable();
      }
    });

    breakpointObserverSpy.observe.and.returnValue(breakpoint$.asObservable());

    await TestBed.configureTestingModule({
      imports: [InvoiceComponent, TranslateModule.forRoot()],
      providers: [
        { provide: Store, useValue: storeSpy },
        { provide: BreakpointObserver, useValue: breakpointObserverSpy },
        { provide: ActivatedRoute, useValue: activatedRouteSpy },
        { provide: Router, useValue: routerSpy },
        { provide: DriveAccessService, useValue: driveAccessServiceSpy },
        { provide: PaymentService, useValue: paymentServiceSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(InvoiceComponent);
    component = fixture.componentInstance;

    translate = TestBed.inject(TranslateService);
    translate.use('en-GB');

    spyOn(globalThis, 'fetch').and.callFake(() =>
      Promise.resolve({
        arrayBuffer: () => Promise.resolve(new ArrayBuffer(8)),
      } as Response));

    spyOn(pdfMake, 'createPdf').and.returnValue({
      getBlob: () => Promise.resolve(fakeBlob),
    } as any);

    fixture.detectChanges();
  });

  it('should filter payment types by label or type', () => {
    const byLabel = component['filterTypes']('cash', paymentOptions);
    const byType = component['filterTypes']('moll', paymentOptions);

    expect(byLabel?.map(option => option.type)).toEqual(['CASH']);
    expect(byType?.map(option => option.type)).toEqual(['MOLLIE']);
  });

  afterEach(() => {
    officeList$.complete();
    invoiceList$.complete();
    paymentOptions$.complete();
    breakpoint$.complete();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should compute dataSourceSignal correctly', () => {
    invoiceList$.next(mockInvoice);
    fixture.detectChanges();

    const data = component.dataSourceSignal() as any;
    expect(data?.length).toBe(2);
  });

  it('should compute resultsLengthSignal correctly', () => {
    invoiceList$.next(mockInvoice);
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

  it('should dispatch getInvoice when office, start and endDate is set', () => {
    const date = getNowTimeZone();
    const start = addDays(date, -10);
    const end = date;
    component.getForm.office.setValue(mockOffice);
    component.getDateRangeForm.startDate.setValue(start);
    component.getDateRangeForm.endDate.setValue(end);
    fixture.detectChanges();

    expect(storeSpy.dispatch).toHaveBeenCalledWith(
      getOfficeToInvoice({
        officeId: mockOffice.id,
        start: backendFormatDate(start)!,
        end: backendFormatDate(end)!,
        types: ['TRANSFER', 'MOLLIE'],
      }),
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
    const cashOption = paymentOptions.find(option => option.type === 'CASH')!;
    const event = {
      option: { value: cashOption.type },
    } as MatAutocompleteSelectedEvent;

    component.selected(event);

    expect(component.selectedPaymentOptionsSignal()).toContain(cashOption);
  });

  it('should remove payment type from available types when selected', () => {
    const cashOption = paymentOptions.find(option => option.type === 'CASH')!;
    component.allPaymentOptionsWritableSignal.set(paymentOptions.slice(0, 2));
    const event = {
      option: { value: cashOption.type },
    } as MatAutocompleteSelectedEvent;

    component.selected(event);
    fixture.detectChanges();

    expect(component.allPaymentOptionsWritableSignal()?.map(option => option.type)).not.toContain('CASH');
  });

  it('should remove payment type from selected when remove is called', () => {
    const cashOption = paymentOptions.find(option => option.type === 'CASH')!;
    const transferOption = paymentOptions.find(option => option.type === 'TRANSFER')!;
    component.selectedPaymentOptionsSignal.set([cashOption, transferOption]);

    component.remove(cashOption);

    expect(component.selectedPaymentOptionsSignal()).not.toContain(cashOption);
  });

  it('should add payment type back to available types when removed', () => {
    const cashOption = paymentOptions.find(option => option.type === 'CASH')!;
    const transferOption = paymentOptions.find(option => option.type === 'TRANSFER')!;
    component.allPaymentOptionsWritableSignal.set(
      paymentOptions.filter(option => option.type === 'TRANSFER'));
    component.selectedPaymentOptionsSignal.set([cashOption, transferOption]);

    component.remove(cashOption);

    expect(component.allPaymentOptionsWritableSignal()?.map(option => option.type)).toContain('CASH');
  });

  it('should initialize selected invoice filters from defaultFilter options only', () => {
    expect(component.selectedPaymentOptionsSignal().map(option => option.type)).toEqual([
      'TRANSFER',
      'MOLLIE',
    ]);
    expect(component.allPaymentOptionsWritableSignal()?.map(option => option.type)).toEqual(['CASH']);
  });

  it('should return true when all rows are selected', () => {
    invoiceList$.next(mockInvoice);
    fixture.detectChanges();
    component.toggleAllRows();

    expect(component.isAllSelected()).toBe(true);
  });

  it('should return false when not all rows are selected', () => {
    invoiceList$.next(mockInvoice);
    fixture.detectChanges();
    component.selectionSignal().select(mockInvoice[0]);

    expect(component.isAllSelected()).toBe(false);
  });

  it('should select all rows when toggleAllRows is called and not all selected', () => {
    invoiceList$.next(mockInvoice);
    fixture.detectChanges();

    component.toggleAllRows();

    expect(component.selectionSignal().selected.length).toBe(2);
  });

  it('should clear selection when toggleAllRows is called and all selected', () => {
    invoiceList$.next(mockInvoice);
    fixture.detectChanges();
    component.selectionSignal().select(...mockInvoice);

    component.toggleAllRows();

    expect(component.selectionSignal().selected.length).toBe(0);
  });

  it('should toggle selection of a row when toggleRow is called', () => {
    invoiceList$.next(mockInvoice);
    fixture.detectChanges();

    component.toggleRow(mockInvoice[0]);

    expect(component.selectionSignal().isSelected(mockInvoice[0])).toBe(true);

    component.toggleRow(mockInvoice[0]);

    expect(component.selectionSignal().isSelected(mockInvoice[0])).toBe(false);
  });

  it('should return "select all" label when no row provided and not all selected', () => {
    invoiceList$.next(mockInvoice);
    fixture.detectChanges();

    const label = component.checkboxLabel();

    expect(label).toBe('select all');
  });

  it('should return "deselect all" label when no row provided and all selected', () => {
    invoiceList$.next(mockInvoice);
    fixture.detectChanges();

    component.toggleAllRows();
    fixture.detectChanges();

    const label = component.checkboxLabel();

    expect(label).toBe('deselect all');
  });

  it('should return "select row X" label when row provided and not selected', () => {
    invoiceList$.next(mockInvoice);
    fixture.detectChanges();

    const label = component.checkboxLabel(mockInvoice[0]);

    expect(label).toBe('select row 1');
  });

  it('should return "deselect row X" label when row provided and selected', () => {
    invoiceList$.next(mockInvoice);
    fixture.detectChanges();
    component.selectionSignal().select(mockInvoice[0]);

    const label = component.checkboxLabel(mockInvoice[0]);

    expect(label).toBe('deselect row 1');
  });

  it('should navigate to invoice path when goToPath is called', () => {
    component.goToPath(mockInvoice[0]);

    expect(routerSpy.navigate).toHaveBeenCalledWith(['invoice', '1']);
  });

  it('should auto-select office when only one office is available', () => {
    const singleOffice = [mockOffice];
    officeList$.next(singleOffice);
    fixture.detectChanges();

    expect(component.getForm.office.value).toBe(mockOffice);
  });

  it('should clear office form control when keyDownHandler is called with Backspace', () => {
    component.getForm.office.setValue(mockOffice);

    component.keyDownHandler({ code: 'Backspace' } as KeyboardEvent);

    expect(component.getForm.office.value).toBe(undefined);
  });

  it('should filter office correctly using filteredOfficeSignal', () => {
    officeList$.next([mockOffice, { id: '2', name: 'Another Office', manager: { id: '1', displayName: 'Officer' } }]);
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
    invoiceList$.next(mockInvoice);
    fixture.detectChanges();

    component.getForm.office.setValue(mockOffice);
    component.getForm.startNumber.setValue(10);
    component.getDateRangeForm.startDate.setValue(startDate);
    fixture.detectChanges();

    component.selectionSignal.set(new SelectionModel<IInvoice>(true, [...mockInvoice]));

    // Act
    await component.print();

    // Assert: updateOfficeById dispatched
    expect(storeSpy.dispatch).toHaveBeenCalledWith(
      jasmine.objectContaining({
        type: '[Invoice] Update office by id',
      }),
    );

    // Assert: uploadInvoices dispatched
    expect(storeSpy.dispatch).toHaveBeenCalledWith(
      jasmine.objectContaining({
        type: '[Invoice] Upload invoices',
        officeId: mockOffice.id,
        blob: fakeBlob,
        fileName: jasmine.stringMatching(/Sales .*\.pdf/),
      }),
    );

    // Assert: pdfMake used
    expect(pdfMake.createPdf).toHaveBeenCalled();
  });

  it('should NOT print when no office is selected', async () => {
    component.getForm.office.setValue(undefined);

    await component.print();

    expect(pdfMake.createPdf).not.toHaveBeenCalled();
    expect(storeSpy.dispatch).not.toHaveBeenCalled();
  });

  it('should NOT update office when not all invoices are selected', async () => {
    const startDate = new Date(2024, 0, 1);
    invoiceList$.next(mockInvoice);
    fixture.detectChanges();

    component.getForm.office.setValue(mockOffice);
    component.getDateRangeForm.startDate.setValue(startDate);
    component.selectionSignal.set(new SelectionModel<IInvoice>(true, [mockInvoice[0]]));
    fixture.detectChanges();

    await component.print();

    expect(storeSpy.dispatch).not.toHaveBeenCalledWith(
      jasmine.objectContaining({
        type: '[Invoice] Update Office By Id',
      }),
    );
  });
});
