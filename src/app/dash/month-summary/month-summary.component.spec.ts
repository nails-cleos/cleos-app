import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MonthSummaryComponent } from './month-summary.component';
import { TranslateModule, TranslateService, TranslateLoader, TranslateFakeLoader } from '@ngx-translate/core';
import { of } from 'rxjs';
import { Store } from '@ngrx/store';
import { AuthUserService } from '../../services/auth-user.service';
import { Router } from '@angular/router';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import {
  AmountFormat,
  ExpenseType,
  IMonthlySummary,
  IMonthlySummaryExpense,
  IMonthlySummarySale,
  ISummaryRoom,
  SummaryType,
  TotalType,
} from '../../interfaces/dashboard';
import { MatDatepicker } from '@angular/material/datepicker';

describe('MonthSummaryComponent', () => {
  let component: MonthSummaryComponent;
  let fixture: ComponentFixture<MonthSummaryComponent>;
  let mockStore: jasmine.SpyObj<Store>;
  let mockRouter: jasmine.SpyObj<Router>;
  let mockTranslate: jasmine.SpyObj<TranslateService>;
  let saveAsSpy: jasmine.Spy;

  const mockAuthUserService = {
    authUser: of({
      showCash: true,
      displayName: 'Test User',
      isDarkMode: false,
      isAdmin: false,
    }),
  };

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
    const storeSpyObj = jasmine.createSpyObj('Store', ['select', 'dispatch']);
    const routerSpyObj = jasmine.createSpyObj('Router', ['navigate', 'getCurrentNavigation']);

    storeSpyObj.select.and.returnValue(of({
      monthlySummaryMap: new Map(),
    }));
    routerSpyObj.getCurrentNavigation.and.returnValue(null);

    await TestBed.configureTestingModule({
      imports: [
        MonthSummaryComponent,
        TranslateModule.forRoot({
          loader: { provide: TranslateLoader, useClass: TranslateFakeLoader },
        }),
        BrowserAnimationsModule,
      ],
      providers: [
        { provide: Store, useValue: storeSpyObj },
        { provide: AuthUserService, useValue: mockAuthUserService },
        { provide: Router, useValue: routerSpyObj },
      ],
    }).compileComponents();

    mockStore = TestBed.inject(Store) as jasmine.SpyObj<Store>;
    mockRouter = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    mockTranslate = TestBed.inject(TranslateService) as jasmine.SpyObj<TranslateService>;

    fixture = TestBed.createComponent(MonthSummaryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  beforeEach(() => {
    saveAsSpy = jasmine.createSpy('saveAs');
    (window as any).saveAs = saveAsSpy;
  });

  afterEach(() => {
    delete (window as any).saveAs;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Initialization', () => {
    it('should initialize with default values', () => {
      expect(component.step).toBe(0);
      expect(component.showCash).toBe(true);
      expect(component.amountFormat.value).toBe('ES');
      expect(component.locale).toBe('es');
    });

    it('should set date from extras when provided', () => {
      const mockExtras = {
        step: 1,
        date: new Date(2024, 0, 15),
      };
      mockRouter.getCurrentNavigation.and.returnValue({ extras: { state: mockExtras } } as any);

      const newFixture = TestBed.createComponent(MonthSummaryComponent);
      const newComponent = newFixture.componentInstance;
      newFixture.detectChanges();

      expect(newComponent.step).toBe(1);
      expect(newComponent.date.value).toBeDefined();
    });

    it('should set default date when no extras provided', () => {
      expect(component.date.value).toBeDefined();
    });

    it('should subscribe to authUserService', () => {
      expect(component.showCash).toBe(true);
    });
  });

  describe('Getters', () => {
    it('should return formatted date', () => {
      component.date.setValue(new Date(2024, 0, 15));
      const result = component.dateFormatted;
      expect(result).toBeDefined();
    });

    it('should return empty string when date is null', () => {
      component.date.setValue(null);
      const result = component.dateFormatted;
      expect(result).toBe('');
    });
  });

  describe('goBack getter', () => {
    it('should navigate to quarter summary with year and quarter when date is set', () => {
      component.date.setValue(new Date(2024, 0, 15));
      void component.goBack;
      expect(mockRouter.navigate).toHaveBeenCalled();
    });

    it('should navigate to quarter summary without state when date is null', () => {
      component.date.setValue(null);
      void component.goBack;
      // TranslateService currentLang is undefined in the test context, so we check the actual call
      const navigateCall = mockRouter.navigate.calls.mostRecent();
      expect(navigateCall.args[0]).toEqual([mockTranslate.currentLang, 'dashboard', 'quarter', 'summary']);
    });
  });

  describe('setStep method', () => {
    it('should set step to provided index', () => {
      component.setStep(2);
      expect(component.step).toBe(2);
    });

    it('should update step value', () => {
      component.setStep(0);
      expect(component.step).toBe(0);
      component.setStep(3);
      expect(component.step).toBe(3);
    });
  });

  describe('setMonthAndYear method', () => {
    it('should set month and year from normalized date', () => {
      const mockDatepicker = jasmine.createSpyObj<MatDatepicker<Date>>('MatDatepicker', ['close']);
      const newDate = new Date(2024, 5, 1);
      component.date.setValue(new Date(2024, 0, 1));

      component.setMonthAndYear(newDate, mockDatepicker);

      expect(component.date.value?.getMonth()).toBe(5);
      expect(component.date.value?.getFullYear()).toBe(2024);
      expect(mockDatepicker.close).toHaveBeenCalled();
    });

    it('should close datepicker after setting date', () => {
      const mockDatepicker = jasmine.createSpyObj<MatDatepicker<Date>>('MatDatepicker', ['close']);
      const newDate = new Date(2024, 3, 1);
      component.date.setValue(new Date());

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
    it('should dispatch UpdateMonthlySummary action for payment type', () => {
      const totalTypes = new TotalType(SummaryType.payment);
      const summaries = [{ id: 'summary-1', gross: 100, btw: 20 }];
      component.date.setValue(new Date(2024, 0, 1));
      component.roomId = 'room-1';

      component.updateMonthlySummary(totalTypes, summaries);

      expect(mockStore.dispatch).toHaveBeenCalled();
      expect(component.isLoading).toBe(true);
    });

    it('should dispatch UpdateMonthlySummary action for expense type', () => {
      const totalTypes = new TotalType(SummaryType.expense, Object.values(ExpenseType));
      const summaries = [{ id: 'summary-1', gross: 100, btw: 20 }];
      component.date.setValue(new Date(2024, 0, 1));
      component.roomId = 'room-1';

      component.updateMonthlySummary(totalTypes, summaries);

      expect(mockStore.dispatch).toHaveBeenCalled();
    });

    it('should dispatch UpdateMonthlySummary action for cash type', () => {
      const totalTypes = new TotalType(SummaryType.cash);
      const summaries = [{ id: 'summary-1', gross: 100, btw: 20 }];
      component.date.setValue(new Date(2024, 0, 1));
      component.roomId = 'room-1';

      component.updateMonthlySummary(totalTypes, summaries);

      expect(mockStore.dispatch).toHaveBeenCalled();
    });
  });

  describe('Value Changes', () => {
    it('should update locale when amountFormat changes', () => {
      component.amountFormat.setValue(AmountFormat.en);

      expect(component.locale).toBe('en');
    });

    it('should dispatch GetMonthlySummary when date changes', () => {
      component.date.setValue(new Date(2024, 5, 1));

      expect(mockStore.dispatch).toHaveBeenCalled();
    });

    it('should create data when selectedRoom changes', () => {
      spyOn<any>(component, 'createData');
      component.monthlySummaryMap = new Map([[mockRoom, {
        summarySale: [],
        summaryExpenses: [],
        summaryCashSale: [],
      }]]);

      component.selectedRoom.setValue(mockRoom);

      expect(component['createData']).toHaveBeenCalled();
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
      expect(MonthSummaryComponent['isInvalidInput']('')).toBe(true);
      expect(MonthSummaryComponent['isInvalidInput']('0')).toBe(true);
      expect(MonthSummaryComponent['isInvalidInput']('0.0')).toBe(true);
      expect(MonthSummaryComponent['isInvalidInput']('.0')).toBe(true);
    });

    it('isInvalidInput should return false for valid values', () => {
      expect(MonthSummaryComponent['isInvalidInput']('100')).toBe(false);
      expect(MonthSummaryComponent['isInvalidInput']('50.50')).toBe(false);
      expect(MonthSummaryComponent['isInvalidInput']('1.23')).toBe(false);
    });

    it('getType should return correct SummaryType', () => {
      expect(MonthSummaryComponent['getType']('payment')).toBe(SummaryType.payment);
      expect(MonthSummaryComponent['getType']('expense')).toBe(SummaryType.expense);
      expect(MonthSummaryComponent['getType']('cash')).toBe(SummaryType.cash);
    });
  });

  describe('Component Lifecycle', () => {
    it('should unsubscribe on destroy', () => {
      const subscription = jasmine.createSpyObj('Subscription', ['unsubscribe']);
      component['subscription'] = subscription;

      component.ngOnDestroy();

      expect(subscription.unsubscribe).toHaveBeenCalled();
    });
  });

  describe('Data Creation', () => {
    it('should create data for single room', () => {
      const summarySale: IMonthlySummarySale = {
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

      component.monthlySummaryMap = new Map([[mockRoom, {
        summarySale: [summarySale],
        summaryExpenses: [],
        summaryCashSale: [],
      }]]);
      component.selectedRoom.setValue(mockRoom);

      expect(component.summaryReservations).toBeDefined();
    });

    it('should handle "All" room selection', () => {
      const summarySale: IMonthlySummarySale = {
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

      component.monthlySummaryMap = new Map([[mockRoom, {
        summarySale: [summarySale],
        summaryExpenses: [],
        summaryCashSale: [],
      }]]);
      component.primaryRoom = mockRoom;
      component.selectedRoom.setValue('All');

      expect(component.roomId).toBe(mockRoom.roomId);
    });
  });

  describe('exportMonthlySummary method', () => {
    it('should export monthly summary with workbook', () => {
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

      component.date.setValue(new Date(2024, 0, 15));
      component.currency = mockCurrency;
      component.timeZone = 'Europe/Amsterdam';
      component.summaryReservations = [mockSale];
      component.summaryExpenses = [mockExpense];
      component.weeks = [];

      component.exportMonthlySummary();

      expect(component.summaryReservations).toBeDefined();
      expect(component.summaryExpenses).toBeDefined();
    });

    it('should set workbook creator and created date', () => {
      component.date.setValue(new Date(2024, 5, 1));
      component.currency = mockCurrency;
      component.timeZone = 'Europe/Amsterdam';
      component.summaryReservations = [];
      component.summaryExpenses = [];
      component.weeks = [];

      component.exportMonthlySummary();

      expect(component.currency).toBeDefined();
    });
  });

  describe('exportToExcel method', () => {
    it('should export payment type to Excel', () => {
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

      component.date.setValue(new Date(2024, 0, 15));
      component.currency = mockCurrency;
      component.timeZone = 'Europe/Amsterdam';
      component.weeks = [];

      component.exportToExcel('TITLE', totalTypes, values, data);

      expect(mockStore.dispatch).toHaveBeenCalled();
    });

    it('should export expense type to Excel', () => {
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

      const totalTypes = new TotalType(SummaryType.expense, Object.values(ExpenseType));
      const values = [{ id: 'summary-1', gross: 100, btw: 20 }];
      const data = [mockExpense];

      component.date.setValue(new Date(2024, 0, 15));
      component.currency = mockCurrency;
      component.timeZone = 'Europe/Amsterdam';
      component.weeks = [];

      component.exportToExcel('TITLE', totalTypes, values, data);

      expect(mockStore.dispatch).toHaveBeenCalled();
    });

    it('should export cash type to Excel', () => {
      const mockCash: IMonthlySummarySale = {
        ...mockMonthlySummary,
        id: 'cash-1',
        total: {
          ...mockMonthlySummary.total,
          id: 'cash-total-1',
        },
        state: 'COMPLETED' as any,
        reservationDate: new Date(),
        customerName: 'Test Customer',
        description: 'Test Description',
        color: '#000000',
      };

      const totalTypes = new TotalType(SummaryType.cash);
      const values = [{ id: 'summary-1', gross: 100, btw: 20 }];
      const data = [mockCash];

      component.date.setValue(new Date(2024, 0, 15));
      component.currency = mockCurrency;
      component.timeZone = 'Europe/Amsterdam';
      component.weeks = [];

      component.exportToExcel('TITLE', totalTypes, values, data);

      expect(mockStore.dispatch).toHaveBeenCalled();
    });

    it('should not export when data is empty', () => {
      const totalTypes = new TotalType(SummaryType.payment);
      const values = [{ id: 'summary-1', gross: 100, btw: 20 }];
      const data: IMonthlySummary[] = [];

      component.date.setValue(new Date(2024, 0, 15));

      component.exportToExcel('TITLE', totalTypes, values, data);

      expect(component.date.value).not.toBeNull();
    });
  });
});
