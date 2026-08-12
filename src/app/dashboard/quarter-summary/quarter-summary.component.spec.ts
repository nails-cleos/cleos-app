import { beforeEach, describe, expect, it, type Mock, vi } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { QuarterSummaryComponent } from './quarter-summary.component';
import { of } from 'rxjs';
import {
  AuthUserService,
  IAuthUser,
  initialAuthUser,
} from '@app/services/auth-user.service';
import { provideTranslateService, TranslateService } from '@ngx-translate/core';
import { ActivatedRoute } from '@angular/router';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import {
  IMonthSummary,
  ISummaryRoom,
  ISummaryTotal,
  MonthSummary,
  SummaryTotals,
  Total,
} from '../dashboard';
import { ICurrencyAll } from '@app/currency/currency';
import fs from 'file-saver';
import { signal } from '@angular/core';
import { DEFAULT_LOCALE } from '@app/util/dates';
import { DashboardStore } from '@app/store/dashboard.store';
import { NavigationService } from '@app/services/navigation.service';

describe('QuarterSummaryComponent', () => {
  let component: QuarterSummaryComponent;
  let fixture: ComponentFixture<QuarterSummaryComponent>;
  let navigationServiceSpy: Pick<NavigationService, 'navigate' | 'language'> & {
    navigate: ReturnType<typeof vi.fn>;
  };

  let dashboardStoreSpy: {
    quarterSummaryMap: ReturnType<typeof signal>;
    getQuarterSummary: Mock;
    clean: Mock;
  };

  const authUserSignal = signal<IAuthUser>(initialAuthUser);

  let breakpointObserverSpy: Pick<BreakpointObserver, 'observe'> & {
    observe: ReturnType<typeof vi.fn>;
  };
  let authUserServiceSpy: Pick<AuthUserService, 'authUser'>;
  let activatedRouteSpy: {
    snapshot: {
      paramMap: {
        get: ReturnType<typeof vi.fn>;
      };
    };
  };
  let saveAsSpy: ReturnType<typeof vi.spyOn>;

  const mockCurrency: ICurrencyAll = {
    id: 'USD',
    name: 'US Dollar',
    code: 'USD',
    icon: '$',
  };

  const mockRoom: ISummaryRoom = {
    roomId: 'room1',
    roomName: 'Room 1',
    currency: mockCurrency,
    timeZone: 'America/New_York',
    primary: true,
  };

  const mockRoom2: ISummaryRoom = {
    roomId: 'room2',
    roomName: 'Room 2',
    currency: mockCurrency,
    timeZone: 'America/New_York',
    primary: false,
  };

  const mockSummaryTotal: ISummaryTotal = {
    id: 'total1',
    type: 'INCOME',
    gross: 1000,
    net: 850,
    btw: 150,
    size: 1,
    paymentType: 'CASH' as any,
    expenseType: '',
    expenseSubType: '',
    description: 'Test Income',
    discountDescription: '',
    discountValue: 0,
    payments: [],
  };

  const mockMonthSummary: IMonthSummary = new MonthSummary(1, [
    {
      ...mockSummaryTotal,
      type: 'INCOME',
      gross: 1000,
      net: 850,
      btw: 150,
    },
    {
      ...mockSummaryTotal,
      id: 'total2',
      type: 'EXPENSE',
      gross: 200,
      net: 170,
      btw: 30,
    },
    {
      ...mockSummaryTotal,
      id: 'total3',
      type: 'CASH',
      gross: 100,
      net: 85,
      btw: 15,
    },
  ]);

  const createMockQuarterSummaryMap = (): Map<
    ISummaryRoom,
    {
      monthSummaries: IMonthSummary[];
    }
  > => {
    const map = new Map();
    map.set(mockRoom, { monthSummaries: [mockMonthSummary] });
    return map;
  };

  beforeEach(async () => {
    navigationServiceSpy = {
      navigate: vi.fn().mockName('NavigationService.navigate'),
      language: DEFAULT_LOCALE,
    };
    dashboardStoreSpy = {
      quarterSummaryMap: signal<any>(undefined),
      getQuarterSummary: vi.fn().mockName('getQuarterSummary'),
      clean: vi.fn().mockName('clean'),
    };

    const paramMapSpy = {
      get: vi.fn().mockName('ParamMap.get'),
    };
    breakpointObserverSpy = {
      observe: vi.fn().mockName('BreakpointObserver.observe'),
    };
    authUserServiceSpy = {
      authUser: authUserSignal.asReadonly(),
    };
    activatedRouteSpy = {
      snapshot: {
        paramMap: paramMapSpy,
      },
    };

    breakpointObserverSpy.observe.mockReturnValue(
      of({ matches: false, breakpoints: {} }),
    );

    paramMapSpy.get.mockReturnValue('test');

    await TestBed.configureTestingModule({
      imports: [QuarterSummaryComponent],
      providers: [
        provideTranslateService(),
        { provide: NavigationService, useValue: navigationServiceSpy },
        { provide: DashboardStore, useValue: dashboardStoreSpy },
        { provide: AuthUserService, useValue: authUserServiceSpy },
        { provide: BreakpointObserver, useValue: breakpointObserverSpy },
        { provide: ActivatedRoute, useValue: activatedRouteSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(QuarterSummaryComponent);

    const translateService = TestBed.inject(TranslateService);
    translateService.use(DEFAULT_LOCALE);
    component = fixture.componentInstance;

    saveAsSpy = vi.spyOn(fs, 'saveAs').mockImplementation(() => {});
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Component Initialization', () => {
    it('should initialize with default values', () => {
      expect(component.quarterSummaryTotals()).toEqual(new SummaryTotals());
    });

    it('should set user properties from authUser service', () => {
      authUserSignal.update((prev) => ({
        ...prev,
        showCash: true,
        displayName: 'Test User',
      }));
      fixture.detectChanges();

      expect(component.showCash()).toBe(true);
    });

    it('should initialize with current date and quarter when no extras', () => {
      fixture.detectChanges();
      expect(component.getForm.date.value).toBeTruthy();
      expect(component.getForm.selectedQuarter.value).toBeTruthy();
    });

    it('should initialize with extras date and quarter when provided', () => {
      history.pushState(
        {
          year: 2024,
          quarter: 2,
        },
        '',
        '/...',
      );

      fixture = TestBed.createComponent(QuarterSummaryComponent);
      component = fixture.componentInstance;

      fixture.detectChanges();

      expect(component.year()).toBe(2024);
      expect(component.quarter()).toBe(2);
      expect(component.getForm.selectedQuarter.value).toBe(2);
    });

    it('should set up breakpoint observer for handset detection', () => {
      fixture.detectChanges();
      expect(component.isHandset()).toBe(false);
    });
  });

  describe('State Management', () => {
    it('should subscribe to dashboard state via pipe', () => {
      fixture.detectChanges();
      expect(dashboardStoreSpy.clean).toHaveBeenCalled();
    });

    it('should handle single room in quarterSummaryMap', () => {
      fixture.detectChanges();
      const map = createMockQuarterSummaryMap();
      dashboardStoreSpy.quarterSummaryMap.set(map);
      fixture.detectChanges();

      expect(component.getForm.selectedRoom.value).toEqual(mockRoom);
    });

    it('should select primary room when multiple rooms exist', () => {
      fixture.detectChanges();
      const map = new Map();
      map.set(mockRoom2, { monthSummaries: [mockMonthSummary] });
      map.set(mockRoom, { monthSummaries: [mockMonthSummary] });

      dashboardStoreSpy.quarterSummaryMap.set(map);
      fixture.detectChanges();

      expect(component.getForm.selectedRoom.value).toEqual(mockRoom);
    });

    it('should set primaryRoom when multiple rooms with same currency', () => {
      fixture.detectChanges();
      const map = new Map();
      map.set(mockRoom, { monthSummaries: [mockMonthSummary] });
      map.set(mockRoom2, { monthSummaries: [mockMonthSummary] });

      dashboardStoreSpy.quarterSummaryMap.set(map);
      fixture.detectChanges();

      expect(component.primaryRoom).toBeTruthy();
    });
  });

  describe('Form Controls and Value Changes', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should get summary when selectedQuarter changes', () => {
      dashboardStoreSpy.getQuarterSummary.mockClear();
      component.getForm.date.setValue(new Date(2024, 0, 1));
      component.getForm.selectedQuarter.setValue(2);
      fixture.detectChanges();

      expect(dashboardStoreSpy.getQuarterSummary).toHaveBeenCalledWith(2024, 2);
    });

    it('should not get summary when selectedQuarter is null', () => {
      component.getForm.date.setValue(new Date(2024, 0, 1));
      vi.spyOn<any, any>(component, 'getSummary').mockReturnValue(undefined);

      (component.getForm.selectedQuarter as any).setValue(undefined);

      expect(component['getSummary']).not.toHaveBeenCalled();
    });

    it('should not get summary when date is null', () => {
      component.getForm.selectedQuarter.setValue(2);
      vi.spyOn<any, any>(component, 'getSummary').mockReturnValue(undefined);

      (component.getForm.date as any).setValue(null);

      expect(component['getSummary']).not.toHaveBeenCalled();
    });
  });

  describe('setYear', () => {
    it('should set year and close datepicker', () => {
      const mockDatepicker = {
        close: vi.fn().mockName('MatDatepicker.close'),
      };
      const newDate = new Date(2024, 0, 1);
      component.getForm.date.setValue(new Date(2023, 5, 15));

      component.setYear(newDate, mockDatepicker);

      expect(component.getForm.date.value?.getFullYear()).toBe(2024);
      expect(mockDatepicker.close).toHaveBeenCalled();
    });
  });

  describe('createData', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should create data for single room', () => {
      const map = createMockQuarterSummaryMap();
      dashboardStoreSpy.quarterSummaryMap.set(map);
      component.getForm.selectedRoom.setValue(mockRoom);
      fixture.detectChanges();

      expect(component.monthSummaries()).toEqual([mockMonthSummary]);
      expect(component.currency).toEqual(mockCurrency);
    });

    it('should calculate totals correctly', () => {
      const map = createMockQuarterSummaryMap();
      dashboardStoreSpy.quarterSummaryMap.set(map);
      component.getForm.selectedRoom.setValue(mockRoom);
      fixture.detectChanges();

      expect(component.quarterSummaryTotals().income.gross).toBe(1000);
      expect(component.quarterSummaryTotals().income.net).toBe(850);
      expect(component.quarterSummaryTotals().income.btw).toBe(150);
      expect(component.quarterSummaryTotals().expense.gross).toBe(200);
      expect(component.quarterSummaryTotals().expense.net).toBe(170);
      expect(component.quarterSummaryTotals().expense.btw).toBe(30);
      expect(component.quarterSummaryTotals().cash.gross).toBe(100);
      expect(component.quarterSummaryTotals().cash.net).toBe(85);
      expect(component.quarterSummaryTotals().cash.btw).toBe(15);
    });

    it('should handle "All" rooms selection', () => {
      const monthSummary2 = new MonthSummary(1, [
        {
          ...mockSummaryTotal,
          type: 'INCOME',
          gross: 500,
          net: 425,
          btw: 75,
        },
      ]);

      const map = new Map();
      map.set(mockRoom, { monthSummaries: [mockMonthSummary] });
      map.set(mockRoom2, { monthSummaries: [monthSummary2] });

      dashboardStoreSpy.quarterSummaryMap.set(map);
      component.getForm.selectedRoom.setValue('All');
      fixture.detectChanges();

      expect(component.currency).toEqual(mockCurrency);
      expect(component.monthSummaries()).toBeTruthy();
    });

    it('should calculate combined totals for all rooms', () => {
      const monthSummary2 = new MonthSummary(1, [
        {
          ...mockSummaryTotal,
          type: 'INCOME',
          gross: 500,
          net: 425,
          btw: 75,
        },
      ]);

      const map = new Map();
      map.set(mockRoom, { monthSummaries: [mockMonthSummary] });
      map.set(mockRoom2, { monthSummaries: [monthSummary2] });

      dashboardStoreSpy.quarterSummaryMap.set(map);
      component.getForm.selectedRoom.setValue('All');
      fixture.detectChanges();

      expect(component.quarterSummaryTotals().totals.gross).toBeGreaterThan(0);
    });
  });

  describe('getAllMonthSummaries', () => {
    it('should merge month summaries correctly', () => {
      const monthSummaries1 = [
        new MonthSummary(1, [
          {
            ...mockSummaryTotal,
            type: 'INCOME',
            gross: 1000,
            net: 850,
            btw: 150,
          },
        ]),
      ];

      const monthSummaries2 = [
        new MonthSummary(1, [
          {
            ...mockSummaryTotal,
            type: 'INCOME',
            gross: 500,
            net: 425,
            btw: 75,
          },
        ]),
      ];

      const result = component['getAllMonthSummaries'](
        monthSummaries2,
        monthSummaries1,
      );

      expect(result).toBeTruthy();
      expect(result.length).toBe(1);
      expect(result[0].month).toBe(1);
      expect(result[0].total[0].gross).toBe(1500);
      expect(result[0].total[0].net).toBe(1275);
      expect(result[0].total[0].btw).toBe(225);
    });

    it('should handle missing totals in one of the summaries', () => {
      const monthSummaries1 = [
        new MonthSummary(1, [
          {
            ...mockSummaryTotal,
            type: 'INCOME',
            gross: 1000,
            net: 850,
            btw: 150,
          },
        ]),
      ];

      const monthSummaries2 = [
        new MonthSummary(1, [
          {
            ...mockSummaryTotal,
            type: 'EXPENSE',
            gross: 200,
            net: 170,
            btw: 30,
          },
        ]),
      ];

      const result = component['getAllMonthSummaries'](
        monthSummaries2,
        monthSummaries1,
      );

      expect(result).toBeTruthy();
      expect(result[0].total.length).toBe(1);
    });
  });

  describe('getSummary', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should dispatch getQuarterSummary action with correct parameters', () => {
      component['getSummary'](2024, 2);

      expect(dashboardStoreSpy.getQuarterSummary).toHaveBeenCalledWith(2024, 2);
    });

    it('should set year and quarter properties', () => {
      component['getSummary'](2024, 3);

      expect(component.year()).toBe(2024);
      expect(component.quarter()).toBe(3);
    });

    it('should reset data before getting new summary', () => {
      component.monthSummaries.set([mockMonthSummary]);
      component.quarterSummaryTotals.set(
        new SummaryTotals(
          new Total(100, 10, 90),
          new Total(),
          new Total(),
          new Total(),
          new Total(),
        ),
      );

      component['getSummary'](2024, 2);

      expect(component.monthSummaries()).toEqual([]);
      expect(component.quarterSummaryTotals()).toEqual(new SummaryTotals());
    });
  });

  describe('reset', () => {
    it('should reset monthSummaries to undefined', () => {
      component.monthSummaries.set([mockMonthSummary]);

      component['reset']();

      expect(component.monthSummaries()).toEqual([]);
    });

    it('should reset quarterSummaryTotals to new SummaryTotals', () => {
      component.quarterSummaryTotals.set(
        new SummaryTotals(
          new Total(100, 10, 90),
          new Total(),
          new Total(),
          new Total(),
          new Total(),
        ),
      );

      component['reset']();

      expect(component.quarterSummaryTotals()).toEqual(new SummaryTotals());
    });
  });

  describe('goBack', () => {
    it('should navigate to year summary page', () => {
      component.year.set(2024);
      fixture.detectChanges();

      component.goBack();

      expect(navigationServiceSpy.navigate).toHaveBeenCalledWith(
        ['dashboard', 'year', 'summary'],
        { state: { year: 2024 } },
      );
    });
  });

  describe('exportQuarterSummary', () => {
    beforeEach(() => {
      fixture.detectChanges();
      component.monthSummaries.set([mockMonthSummary]);
      component.quarterSummaryTotals.set(new SummaryTotals());
      component.year.set(2024);
      component.getForm.selectedQuarter.setValue(2);
    });

    it('should not export when monthSummaries is empty', async () => {
      component.monthSummaries.set([]);

      saveAsSpy.mockClear();
      component.exportQuarterSummary();
      await vi.waitFor(() => {
        expect(saveAsSpy).not.toHaveBeenCalled();
      });
    });

    it('should not export when monthSummaries is []', async () => {
      component.monthSummaries.set([]);

      saveAsSpy.mockClear();
      component.exportQuarterSummary();
      await vi.waitFor(() => {
        expect(saveAsSpy).not.toHaveBeenCalled();
      });
    });

    it('should use current date when year is not set', async () => {
      component.year.set(2025);

      saveAsSpy.mockClear();
      component.exportQuarterSummary();
      await vi.waitFor(() => {
        expect(saveAsSpy).toHaveBeenCalledTimes(1);
      });

      const lastCallArgs = vi.mocked(saveAsSpy).mock.lastCall;
      const fileName = lastCallArgs?.[1];
      expect(fileName).toBe('Report_Q2_2025.xlsx');

      const blob = lastCallArgs?.[0];
      expect(blob instanceof Blob).toBe(true);
      expect(blob.type).toBe(
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      );
    });
  });

  describe('Edge Cases', () => {
    it('should handle undefined quarterSummaryMap', () => {
      fixture.detectChanges();
      dashboardStoreSpy.quarterSummaryMap.set(undefined);

      expect(() =>
        component.getForm.selectedRoom.setValue(mockRoom),
      ).not.toThrow();
    });

    it('should handle empty quarterSummaryMap', () => {
      fixture.detectChanges();
      dashboardStoreSpy.quarterSummaryMap.set(new Map());

      expect(() =>
        component.getForm.selectedRoom.setValue(mockRoom),
      ).not.toThrow();
    });

    it('should handle multiple months in quarter summary', () => {
      const monthSummary1 = new MonthSummary(1, [mockSummaryTotal]);
      const monthSummary2 = new MonthSummary(2, [mockSummaryTotal]);
      const monthSummary3 = new MonthSummary(3, [mockSummaryTotal]);

      const map = new Map();
      map.set(mockRoom, {
        monthSummaries: [monthSummary1, monthSummary2, monthSummary3],
      });

      dashboardStoreSpy.quarterSummaryMap.set(map);
      component.getForm.selectedRoom.setValue(mockRoom);
      fixture.detectChanges();

      expect(component.monthSummaries()?.length).toBe(3);
    });
  });

  describe('Responsive Behavior', () => {
    it('should detect handset breakpoint', () => {
      breakpointObserverSpy.observe.mockReturnValue(
        of({ matches: true, breakpoints: { [Breakpoints.XSmall]: true } }),
      );

      const responsiveFixture = TestBed.createComponent(
        QuarterSummaryComponent,
      );
      const responsiveComponent = responsiveFixture.componentInstance;
      responsiveFixture.detectChanges();

      expect(responsiveComponent.isHandset()).toBe(true);
    });

    it('should observe multiple breakpoints', () => {
      fixture.detectChanges();

      expect(breakpointObserverSpy.observe).toHaveBeenCalledWith([
        Breakpoints.XSmall,
        Breakpoints.Small,
        Breakpoints.Medium,
      ]);
    });
  });
});
