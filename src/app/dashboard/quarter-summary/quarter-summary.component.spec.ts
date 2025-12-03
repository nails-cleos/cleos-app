/* eslint-disable @typescript-eslint/no-unused-vars */
import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { QuarterSummaryComponent } from './quarter-summary.component';
import { BehaviorSubject, of } from 'rxjs';
import { Store } from '@ngrx/store';
import { AuthUserService, IAuthUser, initialAuthUser } from '../../services/auth-user.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { MatDatepicker } from '@angular/material/datepicker';
import { getQuarterSummary } from '../../store/dashboard.actions';
import {
  IMonthSummary,
  ISummaryRoom,
  ISummaryTotal,
  MonthSummary,
  SummaryTotals,
  Total,
} from '../../interfaces/dashboard';
import { ICurrencyAll } from '../../interfaces/currency';
import fs from 'file-saver';
import { signal } from '@angular/core';

describe('QuarterSummaryComponent', () => {
  let component: QuarterSummaryComponent;
  let fixture: ComponentFixture<QuarterSummaryComponent>;

  let quarterSummaryMap$: BehaviorSubject<any>;
  let navigationParams$: BehaviorSubject<any>;
  const authUserSignal = signal<IAuthUser>(initialAuthUser);

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
    quarterSummaryMap$ = new BehaviorSubject<any>(undefined);
    navigationParams$ = new BehaviorSubject<any>(undefined);

    const paramMapSpy = jasmine.createSpyObj<ParamMap>('ParamMap', ['get']);
    storeSpy = jasmine.createSpyObj('Store', ['select', 'dispatch', 'pipe']);
    routerSpy = jasmine.createSpyObj('Router', ['navigate', 'getCurrentNavigation']);
    breakpointObserverSpy = jasmine.createSpyObj('BreakpointObserver', ['observe']);
    authUserServiceSpy = jasmine.createSpyObj('AuthUserService', ['getUser', 'logout'], {
      authUser: authUserSignal.asReadonly(),
    });
    activatedRouteSpy = jasmine.createSpyObj('ActivatedRoute', [], {
      snapshot: {
        paramMap: paramMapSpy,
      },
    });

    let pipeCallIndex = 0;
    storeSpy.pipe.and.callFake(() => {
      pipeCallIndex++;
      switch (pipeCallIndex) {
        case 1:
          return quarterSummaryMap$.asObservable();
        case 2:
          return navigationParams$.asObservable();
        default:
          return new BehaviorSubject(undefined).asObservable();
      }
    });
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

    const translate = TestBed.inject(TranslateService);
    translate.setDefaultLang('en-GB');
    translate.use('en-GB');
    component = fixture.componentInstance;
  });

  beforeEach(() => {
    saveAsSpy = spyOn(fs as any, 'saveAs').and.callFake((blob: Blob, filename?: string) => {
      // no-op
    });
  });

  afterEach(() => {
    quarterSummaryMap$.complete();
    navigationParams$.complete();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Component Initialization', () => {
    it('should initialize with default values', () => {
      expect(component.isLoading()).toBeFalse();
      expect(component.quarterSummaryTotals()).toEqual(new SummaryTotals());
    });

    it('should set user properties from authUser service', () => {
      authUserSignal.update(prev => ({
        ...prev,
        showCash: true,
        displayName: 'Test User',
      }));
      fixture.detectChanges();

      expect(component.showCash()).toBeTrue();
    });

    it('should initialize with current date and quarter when no extras', () => {
      fixture.detectChanges();
      expect(component.getForm.date.value).toBeTruthy();
      expect(component.getForm.selectedQuarter.value).toBeTruthy();
    });

    it('should initialize with extras date and quarter when provided', () => {
      navigationParams$.next({ year: 2024, quarter: 2 });
      fixture.detectChanges();

      expect(component.year()).toBe(2024);
      expect(component.quarter()).toBe(2);
      expect(component.getForm.selectedQuarter.value).toBe(2);
    });

    it('should set up breakpoint observer for handset detection', () => {
      fixture.detectChanges();
      expect(component.isHandset()).toBeFalse();
    });
  });

  describe('State Management', () => {
    it('should subscribe to dashboard state via pipe', () => {
      fixture.detectChanges();
      expect(storeSpy.pipe).toHaveBeenCalled();
    });

    it('should handle single room in quarterSummaryMap', () => {
      fixture.detectChanges();
      const map = createMockQuarterSummaryMap();
      quarterSummaryMap$.next(map);
      fixture.detectChanges();

      expect(component.getForm.selectedRoom.value).toEqual(mockRoom);
      expect(component.isLoading()).toBeFalse();
    });

    it('should select primary room when multiple rooms exist', () => {
      fixture.detectChanges();
      const map = new Map();
      map.set(mockRoom2, { monthSummaries: [mockMonthSummary] });
      map.set(mockRoom, { monthSummaries: [mockMonthSummary] });

      quarterSummaryMap$.next(map);
      fixture.detectChanges();

      expect(component.getForm.selectedRoom.value).toEqual(mockRoom);
    });

    it('should set primaryRoom when multiple rooms with same currency', () => {
      fixture.detectChanges();
      const map = new Map();
      map.set(mockRoom, { monthSummaries: [mockMonthSummary] });
      map.set(mockRoom2, { monthSummaries: [mockMonthSummary] });

      quarterSummaryMap$.next(map);
      fixture.detectChanges();

      expect(component.primaryRoom).toBeTruthy();
    });
  });

  describe('Form Controls and Value Changes', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should get summary when selectedQuarter changes', () => {
      component.getForm.date.setValue(new Date(2024, 0, 1));
      component.getForm.selectedQuarter.setValue(2);
      fixture.detectChanges();

      const dispatched = storeSpy.dispatch.calls.mostRecent().args[0];
      expect(dispatched).toEqual(jasmine.objectContaining({
        year: 2024,
        quarter: 2,
        type: '[Dash] Get quarter summary',
      }));
    });

    it('should not get summary when selectedQuarter is null', () => {
      component.getForm.date.setValue(new Date(2024, 0, 1));
      spyOn<any>(component, 'getSummary');

      (component.getForm.selectedQuarter as any).setValue(undefined);

      expect(component['getSummary']).not.toHaveBeenCalled();
    });

    it('should not get summary when date is null', () => {
      component.getForm.selectedQuarter.setValue(2);
      spyOn<any>(component, 'getSummary');

      (component.getForm.date as any).setValue(null);

      expect(component['getSummary']).not.toHaveBeenCalled();
    });
  });

  describe('setYear', () => {
    it('should set year and close datepicker', () => {
      const mockDatepicker = jasmine.createSpyObj<MatDatepicker<Date>>('MatDatepicker', ['close']);
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
      quarterSummaryMap$.next(map);
      component.getForm.selectedRoom.setValue(mockRoom);
      fixture.detectChanges();

      expect(component.monthSummaries()).toEqual([mockMonthSummary]);
      expect(component.currency).toEqual(mockCurrency);
    });

    it('should calculate totals correctly', () => {
      const map = createMockQuarterSummaryMap();
      quarterSummaryMap$.next(map);
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

      quarterSummaryMap$.next(map);
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

      quarterSummaryMap$.next(map);
      component.getForm.selectedRoom.setValue('All');
      fixture.detectChanges();

      expect(component.quarterSummaryTotals().totals.gross).toBeGreaterThan(0);
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

      const result = component['getAllMonthSummaries'](monthSummaries2, monthSummaries1);

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

      const result = component['getAllMonthSummaries'](monthSummaries2, monthSummaries1);

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

      expect(storeSpy.dispatch).toHaveBeenCalledWith(
        getQuarterSummary({ year: 2024, quarter: 2 }),
      );
    });

    it('should set year and quarter properties', () => {
      component['getSummary'](2024, 3);

      expect(component.year()).toBe(2024);
      expect(component.quarter()).toBe(3);
    });

    it('should set isLoading to true', () => {
      component['getSummary'](2024, 1);

      expect(component.isLoading()).toBeTrue();
    });

    it('should reset data before getting new summary', () => {
      component.monthSummaries.set([mockMonthSummary]);
      component.quarterSummaryTotals.set(new SummaryTotals(
        new Total(100, 10, 90),
        new Total(),
        new Total(),
        new Total(),
        new Total(),
      ));

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
      component.quarterSummaryTotals.set(new SummaryTotals(
        new Total(100, 10, 90),
        new Total(),
        new Total(),
        new Total(),
        new Total(),
      ));

      component['reset']();

      expect(component.quarterSummaryTotals()).toEqual(new SummaryTotals());
    });
  });

  describe('goBack', () => {
    it('should navigate to year summary page', () => {
      component.year.set(2024);
      fixture.detectChanges();

      component.goBack();

      expect(routerSpy.navigate).toHaveBeenCalledWith(
        [component.language, 'dashboard', 'year', 'summary'],
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

    it('should not export when monthSummaries is empty', () => {
      component.monthSummaries.set([]);

      component.exportQuarterSummary();

      expect(saveAsSpy).not.toHaveBeenCalled();
    });

    it('should not export when monthSummaries is []', () => {
      component.monthSummaries.set([]);

      component.exportQuarterSummary();

      expect(saveAsSpy).not.toHaveBeenCalled();
    });

    it('should use current date when year is not set', fakeAsync(() => {
      component.year.set(2025);

      component.exportQuarterSummary();
      tick();

      expect(saveAsSpy).toHaveBeenCalledTimes(1);

      const lastCallArgs = saveAsSpy.calls.mostRecent().args;
      const fileName = lastCallArgs[1];
      expect(fileName).toBe('Report_Q2_2025.xlsx');

      const blob = lastCallArgs[0];
      expect(blob instanceof Blob).toBeTrue();
      expect(blob.type).toBe('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    }));
  });

  describe('Edge Cases', () => {
    it('should handle undefined quarterSummaryMap', () => {
      fixture.detectChanges();
      quarterSummaryMap$.next(undefined);

      expect(() => component.getForm.selectedRoom.setValue(mockRoom)).not.toThrow();
    });

    it('should handle empty quarterSummaryMap', () => {
      fixture.detectChanges();
      quarterSummaryMap$.next(new Map());

      expect(() => component.getForm.selectedRoom.setValue(mockRoom)).not.toThrow();
    });

    it('should handle multiple months in quarter summary', () => {
      const monthSummary1 = new MonthSummary(1, [mockSummaryTotal]);
      const monthSummary2 = new MonthSummary(2, [mockSummaryTotal]);
      const monthSummary3 = new MonthSummary(3, [mockSummaryTotal]);

      const map = new Map();
      map.set(mockRoom, { monthSummaries: [monthSummary1, monthSummary2, monthSummary3] });

      quarterSummaryMap$.next(map);
      component.getForm.selectedRoom.setValue(mockRoom);
      fixture.detectChanges();

      expect(component.monthSummaries()?.length).toBe(3);
    });

  });

  describe('Responsive Behavior', () => {
    it('should detect handset breakpoint', () => {
      breakpointObserverSpy.observe.and.returnValue(
        of({ matches: true, breakpoints: { [Breakpoints.XSmall]: true } }),
      );

      const responsiveFixture = TestBed.createComponent(QuarterSummaryComponent);
      const responsiveComponent = responsiveFixture.componentInstance;
      responsiveFixture.detectChanges();

      expect(responsiveComponent.isHandset()).toBeTrue();
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
