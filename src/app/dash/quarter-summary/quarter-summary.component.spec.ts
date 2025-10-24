import { ComponentFixture, TestBed } from '@angular/core/testing';
import { QuarterSummaryComponent } from './quarter-summary.component';
import { of, Subject } from 'rxjs';
import { Store } from '@ngrx/store';
import { AuthUserService } from '../../services/auth-user.service';
import { TranslateModule } from '@ngx-translate/core';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { MatDatepicker } from '@angular/material/datepicker';
import { clean, getQuarterSummary } from '../../store/dashboard.actions';
import {
  IMonthSummary,
  ISummaryRoom,
  ISummaryTotal,
  MonthSummary,
  SummaryTotals,
  Total,
} from '../../interfaces/dashboard';
import { ICurrencyAll } from '../../interfaces/currency';

describe('QuarterSummaryComponent', () => {
  let component: QuarterSummaryComponent;
  let fixture: ComponentFixture<QuarterSummaryComponent>;

  let state$: Subject<any>;
  let authUser$: Subject<any>;

  let storeSpy: jasmine.SpyObj<Store>;
  let routerSpy: jasmine.SpyObj<Router>;
  let breakpointObserverSpy: jasmine.SpyObj<BreakpointObserver>;
  let authUserServiceSpy: jasmine.SpyObj<AuthUserService>;
  let activatedRouteSpy: jasmine.SpyObj<ActivatedRoute>;
  let saveAsSpy: jasmine.Spy;

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

  const createMockQuarterSummaryMap = (): Map<ISummaryRoom, { monthSummaries: IMonthSummary[] }> => {
    const map = new Map();
    map.set(mockRoom, { monthSummaries: [mockMonthSummary] });
    return map;
  };

  beforeEach(async () => {
    state$ = new Subject<any>();
    authUser$ = new Subject<any>();

    const paramMapSpy = jasmine.createSpyObj<ParamMap>('ParamMap', ['get']);
    storeSpy = jasmine.createSpyObj('Store', ['select', 'dispatch']);
    routerSpy = jasmine.createSpyObj('Router', ['navigate', 'getCurrentNavigation']);
    breakpointObserverSpy = jasmine.createSpyObj('BreakpointObserver', ['observe']);
    authUserServiceSpy = jasmine.createSpyObj('AuthUserService', ['getUser', 'logout'], {
      authUser: authUser$.asObservable(),
    });
    activatedRouteSpy = jasmine.createSpyObj('ActivatedRoute', [], {
      snapshot: {
        paramMap: paramMapSpy,
      },
    });

    storeSpy.select.and.returnValue(state$.asObservable());
    routerSpy.getCurrentNavigation.and.returnValue(null);
    breakpointObserverSpy.observe.and.returnValue(of({ matches: false, breakpoints: {} }));

    paramMapSpy.get.and.returnValue('test');

    await TestBed.configureTestingModule({
      imports: [QuarterSummaryComponent, TranslateModule.forRoot()],
      providers: [
        { provide: Store, useValue: storeSpy },
        { provide: AuthUserService, useValue: authUserServiceSpy },
        { provide: Router, useValue: routerSpy },
        { provide: BreakpointObserver, useValue: breakpointObserverSpy },
        { provide: ActivatedRoute, useValue: activatedRouteSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(QuarterSummaryComponent);
    component = fixture.componentInstance;
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

  describe('Component Initialization', () => {
    it('should initialize with default values', () => {
      expect(component.isLoading).toBeFalse();
      expect(component.quarterSummaryTotals).toEqual(new SummaryTotals());
    });

    it('should dispatch clean action on init', () => {
      fixture.detectChanges();
      expect(storeSpy.dispatch).toHaveBeenCalledWith(clean());
    });

    it('should set user properties from authUser service', () => {
      authUser$.next({
        showCash: true,
        displayName: 'Test User',
      });

      expect(component.showCash).toBeTrue();
    });

    it('should initialize with current date and quarter when no extras', () => {
      fixture.detectChanges();
      expect(component.date.value).toBeTruthy();
      expect(component.selectedQuarter.value).toBeTruthy();
    });

    it('should initialize with extras date and quarter when provided', () => {
      const mockExtras = { year: 2024, quarter: 2 };
      routerSpy.getCurrentNavigation.and.returnValue({
        extras: { state: mockExtras },
      } as any);

      const newFixture = TestBed.createComponent(QuarterSummaryComponent);
      const newComponent = newFixture.componentInstance;
      newFixture.detectChanges();

      expect(newComponent.year).toBe(2024);
      expect(newComponent.quarter).toBe(2);
      expect(newComponent.selectedQuarter.value).toBe(2);
    });

    it('should set up breakpoint observer for handset detection', (done) => {
      fixture.detectChanges();
      component.isHandset$.subscribe((isHandset) => {
        expect(isHandset).toBeFalse();
        done();
      });
    });
  });

  describe('State Management', () => {
    it('should subscribe to dashboard state', () => {
      fixture.detectChanges();
      expect(storeSpy.select).toHaveBeenCalled();
    });

    it('should handle single room in quarterSummaryMap', () => {
      fixture.detectChanges();
      const map = createMockQuarterSummaryMap();
      state$.next({ quarterSummaryMap: map });

      expect(component.selectedRoom.value).toEqual(mockRoom);
      expect(component.isLoading).toBeFalse();
    });

    it('should select primary room when multiple rooms exist', () => {
      fixture.detectChanges();
      const map = new Map();
      map.set(mockRoom2, { monthSummaries: [mockMonthSummary] });
      map.set(mockRoom, { monthSummaries: [mockMonthSummary] });

      state$.next({ quarterSummaryMap: map });

      expect(component.selectedRoom.value).toEqual(mockRoom);
    });

    it('should set primaryRoom when multiple rooms with same currency', () => {
      fixture.detectChanges();
      const map = new Map();
      map.set(mockRoom, { monthSummaries: [mockMonthSummary] });
      map.set(mockRoom2, { monthSummaries: [mockMonthSummary] });

      state$.next({ quarterSummaryMap: map });

      expect(component.primaryRoom).toBeTruthy();
    });

    it('should unsubscribe on destroy', () => {
      fixture.detectChanges();
      const subscription = (component as any).subscription;
      spyOn(subscription, 'unsubscribe');

      component.ngOnDestroy();

      expect(subscription.unsubscribe).toHaveBeenCalled();
    });
  });

  describe('Form Controls and Value Changes', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should create data when selectedRoom changes', () => {
      component.quarterSummaryMap = createMockQuarterSummaryMap();
      spyOn<any>(component, 'createData');

      component.selectedRoom.setValue(mockRoom);

      expect((component as any).createData).toHaveBeenCalled();
    });

    it('should get summary when selectedQuarter changes', () => {
      component.date.setValue(new Date(2024, 0, 1));
      spyOn<any>(component, 'getSummary');

      component.selectedQuarter.setValue(2);

      expect((component as any).getSummary).toHaveBeenCalledWith(2024, 2);
    });

    it('should get summary when date changes', () => {
      component.selectedQuarter.setValue(3);
      spyOn<any>(component, 'getSummary');

      component.date.setValue(new Date(2024, 5, 1));

      expect((component as any).getSummary).toHaveBeenCalledWith(2024, 3);
    });

    it('should not get summary when selectedQuarter is null', () => {
      component.date.setValue(new Date(2024, 0, 1));
      spyOn<any>(component, 'getSummary');

      component.selectedQuarter.setValue(null);

      expect((component as any).getSummary).not.toHaveBeenCalled();
    });

    it('should not get summary when date is null', () => {
      component.selectedQuarter.setValue(2);
      spyOn<any>(component, 'getSummary');

      component.date.setValue(null);

      expect((component as any).getSummary).not.toHaveBeenCalled();
    });
  });

  describe('setYear', () => {
    it('should set year and close datepicker', () => {
      const mockDatepicker = jasmine.createSpyObj<MatDatepicker<Date>>('MatDatepicker', ['close']);
      const newDate = new Date(2024, 0, 1);
      component.date.setValue(new Date(2023, 5, 15));

      component.setYear(newDate, mockDatepicker);

      expect(component.date.value?.getFullYear()).toBe(2024);
      expect(mockDatepicker.close).toHaveBeenCalled();
    });
  });

  describe('createData', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should create data for single room', () => {
      const map = createMockQuarterSummaryMap();
      component.quarterSummaryMap = map;
      component.selectedRoom.setValue(mockRoom);

      (component as any).createData();

      expect(component.monthSummaries).toEqual([mockMonthSummary]);
      expect(component.currency).toEqual(mockCurrency);
    });

    it('should calculate totals correctly', () => {
      const map = createMockQuarterSummaryMap();
      component.quarterSummaryMap = map;
      component.selectedRoom.setValue(mockRoom);

      (component as any).createData();

      expect(component.quarterSummaryTotals.income.gross).toBe(1000);
      expect(component.quarterSummaryTotals.income.net).toBe(850);
      expect(component.quarterSummaryTotals.income.btw).toBe(150);
      expect(component.quarterSummaryTotals.expense.gross).toBe(200);
      expect(component.quarterSummaryTotals.expense.net).toBe(170);
      expect(component.quarterSummaryTotals.expense.btw).toBe(30);
      expect(component.quarterSummaryTotals.cash.gross).toBe(100);
      expect(component.quarterSummaryTotals.cash.net).toBe(85);
      expect(component.quarterSummaryTotals.cash.btw).toBe(15);
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

      component.quarterSummaryMap = map;
      component.selectedRoom.setValue(mockRoom);
      component.primaryRoom = mockRoom;
      component.selectedRoom.setValue('All');

      (component as any).createData();

      expect(component.currency).toEqual(mockCurrency);
      expect(component.monthSummaries).toBeTruthy();
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

      component.quarterSummaryMap = map;
      component.selectedRoom.setValue(mockRoom);
      component.primaryRoom = mockRoom;
      component.selectedRoom.setValue('All');

      (component as any).createData();

      expect(component.quarterSummaryTotals.totals.gross).toBeGreaterThan(0);
    });
  });

  describe('getAllMonthSummaries', () => {
    it('should merge month summaries correctly', () => {
      const monthSummaries1 = [
        new MonthSummary(1, [
          { ...mockSummaryTotal, type: 'INCOME', gross: 1000, net: 850, btw: 150 },
        ]),
      ];

      const monthSummaries2 = [
        new MonthSummary(1, [
          { ...mockSummaryTotal, type: 'INCOME', gross: 500, net: 425, btw: 75 },
        ]),
      ];

      const result = (component as any).getAllMonthSummaries(monthSummaries2, monthSummaries1);

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
          { ...mockSummaryTotal, type: 'INCOME', gross: 1000, net: 850, btw: 150 },
        ]),
      ];

      const monthSummaries2 = [
        new MonthSummary(1, [
          { ...mockSummaryTotal, type: 'EXPENSE', gross: 200, net: 170, btw: 30 },
        ]),
      ];

      const result = (component as any).getAllMonthSummaries(monthSummaries2, monthSummaries1);

      expect(result).toBeTruthy();
      expect(result[0].total.length).toBe(1);
    });
  });

  describe('getSummary', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should dispatch getQuarterSummary action with correct parameters', () => {
      (component as any).getSummary(2024, 2);

      expect(storeSpy.dispatch).toHaveBeenCalledWith(
        getQuarterSummary({ year: 2024, quarter: 2 }),
      );
    });

    it('should set year and quarter properties', () => {
      (component as any).getSummary(2024, 3);

      expect(component.year).toBe(2024);
      expect(component.quarter).toBe(3);
    });

    it('should set isLoading to true', () => {
      (component as any).getSummary(2024, 1);

      expect(component.isLoading).toBeTrue();
    });

    it('should reset data before getting new summary', () => {
      component.monthSummaries = [mockMonthSummary];
      component.quarterSummaryTotals = new SummaryTotals(
        new Total(100, 10, 90),
        new Total(),
        new Total(),
        new Total(),
        new Total(),
      );

      (component as any).getSummary(2024, 2);

      expect(component.monthSummaries).toBeUndefined();
      expect(component.quarterSummaryTotals).toEqual(new SummaryTotals());
    });
  });

  describe('reset', () => {
    it('should reset monthSummaries to undefined', () => {
      component.monthSummaries = [mockMonthSummary];

      (component as any).reset();

      expect(component.monthSummaries).toBeUndefined();
    });

    it('should reset quarterSummaryTotals to new SummaryTotals', () => {
      component.quarterSummaryTotals = new SummaryTotals(
        new Total(100, 10, 90),
        new Total(),
        new Total(),
        new Total(),
        new Total(),
      );

      (component as any).reset();

      expect(component.quarterSummaryTotals).toEqual(new SummaryTotals());
    });
  });

  describe('goBack', () => {
    it('should navigate to year summary page', () => {
      component.year = 2024;
      component.language = 'en';

      component.goBack();

      expect(routerSpy.navigate).toHaveBeenCalledWith(
        ['en', 'dashboard', 'year', 'summary'],
        { state: { year: 2024 } },
      );
    });
  });

  describe('exportQuarterSummary', () => {
    beforeEach(() => {
      fixture.detectChanges();
      component.monthSummaries = [mockMonthSummary];
      component.quarterSummaryTotals = new SummaryTotals();
      component.currency = mockCurrency;
      component.year = 2024;
      component.selectedQuarter.setValue(2);
    });

    it('should not export when monthSummaries is empty', () => {
      component.monthSummaries = [];
      spyOn(window as any, 'Blob');

      component.exportQuarterSummary();

      expect((window as any).Blob).not.toHaveBeenCalled();
    });

    it('should not export when monthSummaries is undefined', () => {
      component.monthSummaries = undefined;
      spyOn(window as any, 'Blob');

      component.exportQuarterSummary();

      expect((window as any).Blob).not.toHaveBeenCalled();
    });

    it('should use current date when year is not set', () => {
      component.year = undefined;

      // We can't fully test the export without mocking the workbook creation
      // but we can verify the method executes without errors
      expect(() => component.exportQuarterSummary()).not.toThrow();
    });
  });

  describe('Edge Cases', () => {
    it('should handle undefined quarterSummaryMap', () => {
      fixture.detectChanges();
      component.quarterSummaryMap = undefined;

      expect(() => (component as any).createData()).not.toThrow();
    });

    it('should handle empty quarterSummaryMap', () => {
      fixture.detectChanges();
      component.quarterSummaryMap = new Map();

      expect(() => (component as any).createData()).not.toThrow();
    });

    it('should handle room selection when quarterSummaryMap is undefined', () => {
      fixture.detectChanges();
      component.quarterSummaryMap = undefined;
      component.selectedRoom.setValue(mockRoom);

      expect(() => (component as any).createData()).not.toThrow();
    });

    it('should handle multiple months in quarter summary', () => {
      const monthSummary1 = new MonthSummary(1, [mockSummaryTotal]);
      const monthSummary2 = new MonthSummary(2, [mockSummaryTotal]);
      const monthSummary3 = new MonthSummary(3, [mockSummaryTotal]);

      const map = new Map();
      map.set(mockRoom, { monthSummaries: [monthSummary1, monthSummary2, monthSummary3] });

      component.quarterSummaryMap = map;
      component.selectedRoom.setValue(mockRoom);

      (component as any).createData();

      expect(component.monthSummaries?.length).toBe(3);
    });

  });

  describe('Responsive Behavior', () => {
    it('should detect handset breakpoint', (done) => {
      breakpointObserverSpy.observe.and.returnValue(
        of({ matches: true, breakpoints: { [Breakpoints.XSmall]: true } }),
      );

      const responsiveFixture = TestBed.createComponent(QuarterSummaryComponent);
      const responsiveComponent = responsiveFixture.componentInstance;

      responsiveComponent.isHandset$.subscribe((isHandset) => {
        expect(isHandset).toBeTrue();
        done();
      });
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