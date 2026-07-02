/* eslint-disable @typescript-eslint/no-unused-vars */
import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { MonthSummaryComponent } from './month-summary.component';
import { AuthUserService, IAuthUser, initialAuthUser } from '../../services/auth-user.service';
import {
  ExpenseType,
  IMonthlySummary,
  IMonthlySummaryExpense,
  IMonthlySummarySale,
  ISummaryRoom,
  SummaryType,
  TotalType,
} from '../dashboard';
import { MatDatepicker } from '@angular/material/datepicker';
import fs from 'file-saver';
import { signal } from '@angular/core';
import { DEFAULT_LOCALE } from '../../util/dates';
import { DashboardStore } from '../../store/dashboard.store';
import { NavigationService } from '../../services/navigation.service';

describe('MonthSummaryComponent', () => {
  let component: MonthSummaryComponent;
  let fixture: ComponentFixture<MonthSummaryComponent>;
  let navigationServiceSpy: jasmine.SpyObj<NavigationService>;

  let dashboardStoreSpy: {
    monthlySummaryMap: ReturnType<typeof signal>;
    updateMonthlySummary: jasmine.Spy;
    getMonthlySummary: jasmine.Spy;
    clean: jasmine.Spy;
  };

  let saveAsSpy: jasmine.Spy;
  let authUserServiceSpy: jasmine.SpyObj<AuthUserService>;

  const authUserSignal = signal<IAuthUser>({ ...initialAuthUser, showCash: true, displayName: 'Test User' });

  const mockCurrency = {
    id: 'eur',
    name: 'Euro',
    code: 'EUR',
    icon: '€',
  };

  const mockRoom: ISummaryRoom = {
    roomId: 'room-1',
    roomName: 'Test Room',
    currency: mockCurrency,
    timeZone: 'Europe/Amsterdam',
    primary: true,
  };

  const mockMonthlySummary: IMonthlySummary = {
    id: 'summary-1',
    timestamp: Date.now(),
    total: {
      id: 'total-1',
      gross: 100,
      net: 80,
      btw: 20,
      size: 1,
      paymentType: 'CASH' as any,
      expenseType: ExpenseType.directCosts,
      expenseSubType: '',
      type: '',
      description: '',
      discountDescription: '',
      discountValue: 0,
      payments: [],
    },
    paths: [],
    position: 0,
    day: 15,
  };

  beforeEach(async () => {
    navigationServiceSpy = jasmine.createSpyObj('NavigationService', ['navigate'],
      { language: DEFAULT_LOCALE },
    );
    history.replaceState({}, '');
    dashboardStoreSpy = {
      monthlySummaryMap: signal<any>(undefined),
      updateMonthlySummary: jasmine.createSpy('updateMonthlySummary'),
      getMonthlySummary: jasmine.createSpy('getMonthlySummary'),
      clean: jasmine.createSpy('clean'),
    };

    authUserServiceSpy = jasmine.createSpyObj('AuthUserService', [], {
      authUser: authUserSignal.asReadonly(),
    });

    await TestBed.configureTestingModule({
      imports: [MonthSummaryComponent, TranslateModule.forRoot()],
      providers: [
        { provide: NavigationService, useValue: navigationServiceSpy },
        { provide: DashboardStore, useValue: dashboardStoreSpy },
        { provide: AuthUserService, useValue: authUserServiceSpy },
      ],
    }).compileComponents();

    const translateService = TestBed.inject(TranslateService);
    translateService.use(DEFAULT_LOCALE);

    fixture = TestBed.createComponent(MonthSummaryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    saveAsSpy = spyOn(fs as any, 'saveAs').and.callFake((blob: Blob, filename?: string) => {
      // no-op
    });
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Initialization', () => {
    it('should initialize with default values', () => {
      expect(component.stepSignal()).toBe(0);
      expect(component.showCash()).toBeTrue();
      expect(component.getForm.amountFormat.value).toBe('ES');
      expect(component.locale).toBe('es');
    });

    it('should set date and step from navigation params', () => {
      history.pushState({
        step: 1,
        date: new Date(2024, 0, 15),
      }, '', '/...');

      fixture = TestBed.createComponent(MonthSummaryComponent);
      component = fixture.componentInstance;

      fixture.detectChanges();

      expect(component.stepSignal()).toBe(1);
      expect(component.getForm.date.value).toBeDefined();
    });

    it('should subscribe to authUserService', () => {
      expect(component.showCash()).toBeTrue();
    });
  });

  describe('Signals and Computed Values', () => {
    it('should return formatted date', () => {
      component.getForm.date.setValue(new Date(2024, 0, 15));
      const result = component.dateFormatted;
      expect(result).toBeDefined();
    });

    it('should return empty string when date is null', () => {
      component.getForm.date.setValue(undefined as any);
      const result = component.dateFormatted;
      expect(result).toBe('');
    });

    it('should update locale when amountFormat changes', () => {
      component.getForm.amountFormat.setValue('en');
      fixture.detectChanges();

      expect(component.locale).toBe('en');
    });
  });

  describe('goBack method', () => {
    it('should navigate to quarter summary with year and quarter when date is set', () => {
      component.getForm.date.setValue(new Date(2024, 0, 15));
      component.goBack();
      expect(navigationServiceSpy.navigate).toHaveBeenCalled();
    });

    it('should navigate to quarter summary without state when date is undefined', () => {
      component.getForm.date.setValue(undefined as any);
      component.goBack();
      expect(navigationServiceSpy.navigate).toHaveBeenCalledWith(['dashboard', 'quarter', 'summary']);
    });
  });

  describe('setStep method', () => {
    it('should set step to provided index', () => {
      component.setStep(2);
      expect(component.stepSignal()).toBe(2);
    });

    it('should update step value', () => {
      component.setStep(0);
      expect(component.stepSignal()).toBe(0);
      component.setStep(3);
      expect(component.stepSignal()).toBe(3);
    });
  });

  describe('setMonthAndYear method', () => {
    it('should set month and year from normalized date', () => {
      const mockDatepicker = jasmine.createSpyObj<MatDatepicker<Date>>('MatDatepicker', ['close']);
      const newDate = new Date(2024, 5, 1);
      component.getForm.date.setValue(new Date(2024, 0, 1));

      component.setMonthAndYear(newDate, mockDatepicker);

      expect(component.getForm.date.value?.getMonth()).toBe(5);
      expect(component.getForm.date.value?.getFullYear()).toBe(2024);
      expect(mockDatepicker.close).toHaveBeenCalled();
    });

    it('should close datepicker after setting date', () => {
      const mockDatepicker = jasmine.createSpyObj<MatDatepicker<Date>>('MatDatepicker', ['close']);
      const newDate = new Date(2024, 3, 1);
      component.getForm.date.setValue(new Date());

      component.setMonthAndYear(newDate, mockDatepicker);

      expect(mockDatepicker.close).toHaveBeenCalled();
    });
  });

  describe('getTotal method', () => {
    it('should calculate total gross amount', () => {
      const totalType = new TotalType(SummaryType.payment);
      totalType.totals.set('key1', { gross: 100, net: 80, btw: 20, size: 1 });
      totalType.totals.set('key2', { gross: 50, net: 40, btw: 10, size: 1 });

      const total = component.getTotal(totalType, 'gross');

      expect(total).toBe(150);
    });

    it('should calculate total net amount', () => {
      const totalType = new TotalType(SummaryType.payment);
      totalType.totals.set('key1', { gross: 100, net: 80, btw: 20, size: 1 });
      totalType.totals.set('key2', { gross: 50, net: 40, btw: 10, size: 1 });

      const total = component.getTotal(totalType, 'net');

      expect(total).toBe(120);
    });

    it('should calculate total btw amount', () => {
      const totalType = new TotalType(SummaryType.payment);
      totalType.totals.set('key1', { gross: 100, net: 80, btw: 20, size: 1 });
      totalType.totals.set('key2', { gross: 50, net: 40, btw: 10, size: 1 });

      const total = component.getTotal(totalType, 'btw');

      expect(total).toBe(30);
    });

    it('should return 0 for empty totals', () => {
      const totalType = new TotalType(SummaryType.payment);

      const total = component.getTotal(totalType, 'gross');

      expect(total).toBe(0);
    });
  });

  describe('twoDigit method', () => {
    beforeEach(() => {
      component.summaryReservations = [mockMonthlySummary];
      component.summaryExpenses = [mockMonthlySummary];
      component.summaryCash = [mockMonthlySummary];
    });

    it('should handle payment type input', () => {
      const input = document.createElement('input');
      input.value = '100.50';
      input.id = 'grossInput';

      component.twoDigit(input, 0, 'payment', 'summary-1');

      expect(component.summaryReservations).toBeDefined();
    });

    it('should handle expense type input', () => {
      const input = document.createElement('input');
      input.value = '50.25';
      input.id = 'grossInput';

      component.twoDigit(input, 0, 'expense', 'summary-1');

      expect(component.summaryExpenses).toBeDefined();
    });

    it('should handle cash type input', () => {
      const input = document.createElement('input');
      input.value = '75.00';
      input.id = 'grossInput';

      component.twoDigit(input, 0, 'cash', 'summary-1');

      expect(component.summaryCash).toBeDefined();
    });
  });

  describe('updateMonthlySummary method', () => {
    beforeEach(() => {
      // Set up required component state
      component.getForm.date.setValue(new Date(2024, 0, 1));
      const summaryMap = new Map([[mockRoom, {
        summarySale: [],
        summaryExpenses: [],
        summaryCashSale: [],
      }]]);
      dashboardStoreSpy.monthlySummaryMap.set(summaryMap);
      fixture.detectChanges();
    });

    it('should dispatch updateMonthlySummary action for payment type', () => {
      dashboardStoreSpy.updateMonthlySummary.calls.reset();

      const totalTypes = new TotalType(SummaryType.payment);
      const summaries = [{ id: 'summary-1', gross: 100, btw: 20 }];

      component.updateMonthlySummary(totalTypes, summaries);
      fixture.detectChanges();

      expect(dashboardStoreSpy.updateMonthlySummary).toHaveBeenCalled();
    });

    it('should dispatch updateMonthlySummary action for expense type', () => {
      dashboardStoreSpy.updateMonthlySummary.calls.reset();

      const totalTypes = new TotalType(SummaryType.expense, Object.values(ExpenseType));
      const summaries = [{ id: 'summary-1', gross: 100, btw: 20 }];

      component.updateMonthlySummary(totalTypes, summaries);

      expect(dashboardStoreSpy.updateMonthlySummary).toHaveBeenCalled();
    });

    it('should dispatch updateMonthlySummary action for cash type', () => {
      dashboardStoreSpy.updateMonthlySummary.calls.reset();

      const totalTypes = new TotalType(SummaryType.cash);
      const summaries = [{ id: 'summary-1', gross: 100, btw: 20 }];

      component.updateMonthlySummary(totalTypes, summaries);

      expect(dashboardStoreSpy.updateMonthlySummary).toHaveBeenCalled();
    });
  });

  describe('Static Methods', () => {
    it('groupSummary should group summaries by expense type', () => {
      const summaries: IMonthlySummary[] = [
        {
          ...mockMonthlySummary,
          id: 'summary-1',
          total: {
            ...mockMonthlySummary.total,
            gross: 100,
            net: 80,
            btw: 20,
            expenseType: ExpenseType.directCosts,
          },
        },
        {
          ...mockMonthlySummary,
          id: 'summary-2',
          total: {
            ...mockMonthlySummary.total,
            id: 'total-2',
            gross: 50,
            net: 40,
            btw: 10,
            expenseType: ExpenseType.directCosts,
          },
          position: 1,
          day: 16,
        },
      ];

      const result = MonthSummaryComponent['groupSummary'](summaries);

      expect(result.size).toBeGreaterThan(0);
      expect(result.get(ExpenseType.directCosts)).toBeDefined();
    });

    it('calculateTotals should sum up all totals', () => {
      const summaries: IMonthlySummary[] = [
        {
          ...mockMonthlySummary,
          id: 'summary-1',
          total: {
            ...mockMonthlySummary.total,
            gross: 100,
            net: 80,
            btw: 20,
          },
        },
        {
          ...mockMonthlySummary,
          id: 'summary-2',
          total: {
            ...mockMonthlySummary.total,
            id: 'total-2',
            gross: 50,
            net: 40,
            btw: 10,
          },
          position: 1,
          day: 16,
        },
      ];

      const result = MonthSummaryComponent['calculateTotals'](summaries);

      expect(result.gross).toBe(150);
      expect(result.net).toBe(120);
      expect(result.btw).toBe(30);
    });

    it('isInvalidInput should return true for invalid values', () => {
      expect(MonthSummaryComponent['isInvalidInput']('')).toBeTrue();
      expect(MonthSummaryComponent['isInvalidInput']('0')).toBeTrue();
      expect(MonthSummaryComponent['isInvalidInput']('0.0')).toBeTrue();
      expect(MonthSummaryComponent['isInvalidInput']('.0')).toBeTrue();
    });

    it('isInvalidInput should return false for valid values', () => {
      expect(MonthSummaryComponent['isInvalidInput']('100')).toBeFalse();
      expect(MonthSummaryComponent['isInvalidInput']('50.50')).toBeFalse();
      expect(MonthSummaryComponent['isInvalidInput']('1.23')).toBeFalse();
    });

    it('getType should return correct SummaryType', () => {
      expect(MonthSummaryComponent['getType']('payment')).toBe(SummaryType.payment);
      expect(MonthSummaryComponent['getType']('expense')).toBe(SummaryType.expense);
      expect(MonthSummaryComponent['getType']('cash')).toBe(SummaryType.cash);
    });
  });

  describe('Monthly Summary Map Effects', () => {
    it('should process monthlySummaryMap when it emits', () => {
      const summaryMap = new Map([[mockRoom, {
        summarySale: [],
        summaryExpenses: [],
        summaryCashSale: [],
      }]]);

      dashboardStoreSpy.monthlySummaryMap.set(summaryMap);
      fixture.detectChanges();

      expect(component.getForm.selectedRoom.value).toBe(mockRoom);
    });

    it('should set primary room when multiple rooms with same currency', () => {
      const room2 = { ...mockRoom, roomId: 'room-2', roomName: 'Room 2', primary: false };
      const summaryMap = new Map([
        [mockRoom, { summarySale: [], summaryExpenses: [], summaryCashSale: [] }],
        [room2, { summarySale: [], summaryExpenses: [], summaryCashSale: [] }],
      ]);

      dashboardStoreSpy.monthlySummaryMap.set(summaryMap);
      fixture.detectChanges();

      expect(component.primaryRoom).toBe(mockRoom);
    });
  });

  describe('Date Signal Effects', () => {
    it('should dispatch getMonthlySummary when date changes', () => {
      dashboardStoreSpy.getMonthlySummary.calls.reset();

      component.getForm.date.setValue(new Date(2024, 5, 1));
      fixture.detectChanges();

      expect(dashboardStoreSpy.getMonthlySummary).toHaveBeenCalled();
    });
  });

  describe('exportMonthlySummary method', () => {
    it('should export monthly summary with workbook', fakeAsync(() => {
      const mockSale: IMonthlySummarySale = {
        ...mockMonthlySummary,
        id: 'sale-1',
        total: {
          ...mockMonthlySummary.total,
          id: 'sale-total-1',
        },
        state: 'COMPLETED' as any,
        reservationDate: new Date(),
        customerName: 'Test Customer',
        description: 'Test Description',
        color: '#000000',
      };

      const mockExpense: IMonthlySummaryExpense = {
        ...mockMonthlySummary,
        id: 'expense-1',
        total: {
          ...mockMonthlySummary.total,
          id: 'expense-total-1',
        },
        expenseDate: new Date(),
        invoice: '',
        supplyStore: '',
      };

      component.getForm.date.setValue(new Date(2024, 0, 15));
      component.summaryReservations = [mockSale];
      component.summaryExpenses = [mockExpense];
      component.weeks = [];

      component.exportMonthlySummary();
      tick();

      expect(component.summaryReservations).toBeDefined();
      expect(component.summaryExpenses).toBeDefined();
      expect(saveAsSpy).toHaveBeenCalledTimes(1);

      const lastCallArgs = saveAsSpy.calls.mostRecent().args;
      const fileName = lastCallArgs[1];
      expect(fileName).toBe('Report_January_2024.xlsx');

      const blob = lastCallArgs[0];
      expect(blob instanceof Blob).toBeTrue();
      expect(blob.type).toBe('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    }));
  });

  describe('exportToExcel method', () => {
    it('should export payment type to Excel', fakeAsync(() => {
      dashboardStoreSpy.updateMonthlySummary.calls.reset();

      const mockSale: IMonthlySummarySale = {
        ...mockMonthlySummary,
        id: 'sale-1',
        total: {
          ...mockMonthlySummary.total,
          id: 'sale-total-1',
        },
        state: 'COMPLETED' as any,
        reservationDate: new Date(),
        customerName: 'Test Customer',
        description: 'Test Description',
        color: '#000000',
      };

      const totalTypes = new TotalType(SummaryType.payment);
      const values = [{ id: 'summary-1', gross: 100, btw: 20 }];
      const data = [mockSale];

      component.getForm.date.setValue(new Date(2024, 0, 15));
      component.weeks = [];

      // Set up room
      const summaryMap = new Map([[mockRoom, {
        summarySale: [],
        summaryExpenses: [],
        summaryCashSale: [],
      }]]);
      dashboardStoreSpy.monthlySummaryMap.set(summaryMap);
      fixture.detectChanges();

      component.exportToExcel('TITLE', totalTypes, values, data);
      tick();

      expect(dashboardStoreSpy.updateMonthlySummary).toHaveBeenCalled();
      expect(saveAsSpy).toHaveBeenCalledTimes(1);

      const lastCallArgs = saveAsSpy.calls.mostRecent().args;
      const fileName = lastCallArgs[1];
      expect(fileName).toBe('PAYMENT-01-2024.xlsx');

      const blob = lastCallArgs[0];
      expect(blob instanceof Blob).toBeTrue();
      expect(blob.type).toBe('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    }));

    it('should not export when data is empty', () => {
      dashboardStoreSpy.updateMonthlySummary.calls.reset();

      const totalTypes = new TotalType(SummaryType.payment);
      const values = [{ id: 'summary-1', gross: 100, btw: 20 }];
      const data: IMonthlySummary[] = [];

      component.getForm.date.setValue(new Date(2024, 0, 15));

      component.exportToExcel('TITLE', totalTypes, values, data);

      expect(dashboardStoreSpy.updateMonthlySummary).not.toHaveBeenCalled();
      expect(saveAsSpy).not.toHaveBeenCalled();
    });
  });
});
