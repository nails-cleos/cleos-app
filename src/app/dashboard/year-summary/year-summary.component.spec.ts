/* eslint-disable @typescript-eslint/no-unused-vars */
import { ComponentFixture, fakeAsync, flushMicrotasks, TestBed, tick } from '@angular/core/testing';
import { YearSummaryComponent } from './year-summary.component';
import { BehaviorSubject } from 'rxjs';
import { AuthUserService, IAuthUser, initialAuthUser } from '@app/services/auth-user.service';
import { ActivatedRoute } from '@angular/router';
import { IMonthlyExport, IMonthlySummaryExpense, IMonthlySummarySale, ISummaryTotal } from '../dashboard';
import fs from 'file-saver';
import { signal } from '@angular/core';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { By } from '@angular/platform-browser';
import { YearComponent } from './year/year.component';
import { DashboardStore } from '@app/store/dashboard.store';
import { DEFAULT_LOCALE } from '@app/util/dates';
import { NavigationService } from '@app/services/navigation.service';
import { provideTranslateService } from '@ngx-translate/core';

describe('YearSummaryComponent', () => {
  let component: YearSummaryComponent;
  let fixture: ComponentFixture<YearSummaryComponent>;
  let navigationServiceSpy: jasmine.SpyObj<NavigationService>;

  const authUserSignal = signal<IAuthUser>(initialAuthUser);

  let dashboardStoreSpy: {
    yearSummaryMap: ReturnType<typeof signal>;
    yearExport: ReturnType<typeof signal>;
    getYearSummary: jasmine.Spy;
    exportYearSummary: jasmine.Spy;
    clean: jasmine.Spy;
  };
  let authUserServiceSpy: jasmine.SpyObj<AuthUserService>;
  let activatedRouteSpy: jasmine.SpyObj<ActivatedRoute>;
  let breakpointObserverSpy: jasmine.SpyObj<BreakpointObserver>;
  let saveAsSpy: jasmine.Spy;
  let breakpoint$: BehaviorSubject<any>;

  beforeEach(async () => {
    navigationServiceSpy = jasmine.createSpyObj('NavigationService', ['navigate'],
      { language: DEFAULT_LOCALE },
    );
    dashboardStoreSpy = {
      yearSummaryMap: signal<any>(undefined),
      yearExport: signal<any>(undefined),
      getYearSummary: jasmine.createSpy('getYearSummary'),
      exportYearSummary: jasmine.createSpy('exportYearSummary'),
      clean: jasmine.createSpy('clean'),
    };
    breakpoint$ = new BehaviorSubject({
      matches: false,
      breakpoints: {
        [Breakpoints.XSmall]: false,
        [Breakpoints.Small]: false,
        [Breakpoints.Medium]: false,
      },
    });

    activatedRouteSpy = jasmine.createSpyObj('ActivatedRoute', [], {
      snapshot: {
        paramMap: jasmine.createSpyObj('ParamMap', ['get']),
      },
    });
    breakpointObserverSpy = jasmine.createSpyObj('BreakpointObserver', ['observe']);
    authUserServiceSpy = jasmine.createSpyObj('AuthUserService', ['getUser', 'logout'], {
      authUser: authUserSignal.asReadonly(),
    });

    breakpointObserverSpy.observe.and.returnValue(breakpoint$.asObservable());

    await TestBed.configureTestingModule({
      imports: [YearSummaryComponent],
      providers: [
        provideTranslateService(),
        { provide: NavigationService, useValue: navigationServiceSpy },
        { provide: DashboardStore, useValue: dashboardStoreSpy },
        { provide: AuthUserService, useValue: authUserServiceSpy },
        { provide: ActivatedRoute, useValue: activatedRouteSpy },
        { provide: BreakpointObserver, useValue: breakpointObserverSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(YearSummaryComponent);
    component = fixture.componentInstance;

    saveAsSpy = spyOn(fs as any, 'saveAs').and.callFake((blob: Blob, filename?: string) => {
      // no-op
    });
  });

  afterEach(() => breakpoint$.complete());

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('exportToExcel method', () => {
    it('should export to Excel with valid data', fakeAsync(() => {
      const mockMonthlyExport: IMonthlyExport = {
        month: 1,
        saleSummary: [],
        expenseSummary: [],
        cashSummary: [],
      };

      component['sheetDataSignal'].set([mockMonthlyExport]);
      component.getForm.date.setValue(new Date(2024, 0, 1));

      component['exportToExcel']();
      tick();
      flushMicrotasks();

      expect(component.sheetData.length).toBeGreaterThan(0);
      expect(saveAsSpy).toHaveBeenCalled();
    }));

    it('should sort summaries by timestamp before export', fakeAsync(() => {
      const mockMonthlyExport: IMonthlyExport = {
        month: 1,
        saleSummary: [
          {
            timestamp: 200, id: 'sale-2', paths: ['path', 'to', 'sale-2'], total: {
              payments: [
                { gross: 121, net: 100, btw: 21 } as ISummaryTotal,
              ],
            },
          } as IMonthlySummarySale,
          {
            timestamp: 100, id: 'sale-1', paths: ['path', 'to', 'sale-1'], total: {
              payments: [
                { gross: 242, net: 200, btw: 21 } as ISummaryTotal,
              ],
            },
          } as IMonthlySummarySale,
        ],
        expenseSummary: [
          {
            timestamp: 400, id: 'expense-2', paths: ['path', 'to', 'expense-2'], total: {
              payments: [
                { gross: 60.5, net: 50, btw: 21 } as ISummaryTotal,
              ],
            },
          } as IMonthlySummaryExpense,
          {
            timestamp: 300, id: 'expense-1', paths: ['path', 'to', 'expense-1'], total: {
              payments: [
                { gross: 10.9, net: 10, btw: 9 } as ISummaryTotal,
              ],
            },
          } as IMonthlySummaryExpense,
        ],
        cashSummary: [
          {
            timestamp: 600, id: 'cash-2', paths: ['path', 'to', 'cash-2'], total: {
              payments: [
                { gross: 242, net: 242, btw: 0 } as ISummaryTotal,
              ],
            },
          } as IMonthlySummarySale,
          {
            timestamp: 500, id: 'cash-1', paths: ['path', 'to', 'cash-1'], total: {
              payments: [
                { gross: 121, net: 121, btw: 0 } as ISummaryTotal,
              ],
            },
          } as IMonthlySummarySale,
        ],
      };

      component['sheetDataSignal'].set([mockMonthlyExport]);
      component.getForm.date.setValue(new Date(2024, 0, 1));
      fixture.detectChanges();

      component['exportToExcel']();
      tick();
      flushMicrotasks();

      const sheetData = component.sheetData;
      expect(sheetData[0].saleSummary[0].timestamp).toBe(200);
      expect(sheetData[0].saleSummary[1].timestamp).toBe(100);
      expect(sheetData[0].expenseSummary[0].timestamp).toBe(400);
      expect(sheetData[0].expenseSummary[1].timestamp).toBe(300);
      expect(saveAsSpy).toHaveBeenCalled();
    }));

    it('should not export when sheetData is empty', () => {
      component['sheetDataSignal'].set([]);
      component.getForm.date.setValue(new Date(2024, 0, 1));

      component['exportToExcel']();

      expect(component.sheetData.length).toBe(0);
      expect(saveAsSpy).not.toHaveBeenCalled();
    });

    it('should call saveAs when exporting to excel', fakeAsync(() => {
      const mockMonthlyExport = {
        month: 1,
        saleSummary: [],
        expenseSummary: [],
        cashSummary: [],
      };

      component['sheetDataSignal'].set([mockMonthlyExport]);
      const date = new Date(2024, 0, 1);
      component.getForm.date.setValue(date);

      component['exportToExcel']();
      tick();
      flushMicrotasks();

      expect(saveAsSpy).toHaveBeenCalledTimes(1);

      const lastCallArgs = saveAsSpy.calls.mostRecent().args;
      const fileName = lastCallArgs[1];
      expect(fileName).toBe('Report_2024.xlsx');

      const blob = lastCallArgs[0];
      expect(blob instanceof Blob).toBeTrue();
      expect(blob.type).toBe('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    }));
  });

  describe('exportAction', () => {
    it('should call exportToExcel when export is true', () => {
      component.getForm.date.setValue(new Date(2024, 0, 1));
      component['exportSignal'].set(true);

      spyOn<any>(component, 'exportToExcel');

      component.exportAction();

      expect(component['exportToExcel']).toHaveBeenCalled();
    });

    it('should call getExportData when export is false', () => {
      component['exportSignal'].set(false);
      component.getForm.date.setValue(new Date(2024, 0, 1));

      spyOn<any>(component, 'getExportData');

      component.exportAction();

      expect(component['getExportData']).toHaveBeenCalledWith(2024);
    });

    it('should not call any method when date is null', () => {
      component.getForm.date.setValue(null as any);

      spyOn<any>(component, 'exportToExcel');
      spyOn<any>(component, 'getExportData');

      component.exportAction();

      expect(component['exportToExcel']).not.toHaveBeenCalled();
      expect(component['getExportData']).not.toHaveBeenCalled();
    });
  });

  describe('setYear', () => {
    it('should update only the year and close datepicker', () => {
      const date = new Date(2020, 5, 10);
      component.getForm.date.setValue(date);

      const datepickerSpy = jasmine.createSpyObj('MatDatepicker', ['close']);

      component.setYear(new Date(2024, 0, 1), datepickerSpy);

      expect(component.getForm.date.value.getFullYear()).toBe(2024);
      expect(component.getForm.date.value.getMonth()).toBe(5);
      expect(datepickerSpy.close).toHaveBeenCalled();
    });
  });

  describe('createExportData', () => {
    it('should merge monthly data when room is "All"', () => {
      component.getForm.selectedRoom.setValue('All');

      const mockExport = new Map<any, any>([
        ['room1', {
          monthlyExport: [
            { month: 1, saleSummary: [1], expenseSummary: [], cashSummary: [] },
          ],
        }],
        ['room2', {
          monthlyExport: [
            { month: 1, saleSummary: [2], expenseSummary: [], cashSummary: [] },
          ],
        }],
      ]);

      component['createExportData'](mockExport as any);

      const result = component.sheetData;
      expect(result.length).toBe(1);
      expect(result[0].saleSummary.length).toBe(2);
    });

    it('should set data for selected room only', () => {
      const room = { roomId: '1' } as any;
      component.getForm.selectedRoom.setValue(room);

      const mockExport = new Map<any, any>([
        [{ roomId: '1' }, { monthlyExport: [{ month: 1, saleSummary: [], expenseSummary: [], cashSummary: [] }] }],
        [{ roomId: '2' }, { monthlyExport: [{ month: 2, saleSummary: [], expenseSummary: [], cashSummary: [] }] }],
      ]);

      component['createExportData'](mockExport as any);

      expect(component.sheetData.length).toBe(1);
      expect(component.sheetData[0].month).toBe(1);
    });
  });

  describe('getAllQuarterSummaries', () => {
    it('should merge quarter summaries correctly', () => {
      const base = [
        {
          quarter: 1,
          monthSummaries: [
            {
              month: 1,
              total: [{ type: 'INCOME', net: 10, btw: 2, gross: 12 }],
            },
          ],
        },
      ];

      const incoming = [
        {
          quarter: 1,
          monthSummaries: [
            {
              month: 1,
              total: [{ type: 'INCOME', net: 5, btw: 1, gross: 6 }],
            },
          ],
        },
      ];

      const result = component['getAllQuarterSummaries'](incoming as any, base as any);

      expect(result[0].monthSummaries[0].total[0].net).toBe(15);
      expect(result[0].monthSummaries[0].total[0].btw).toBe(3);
      expect(result[0].monthSummaries[0].total[0].gross).toBe(18);
    });
  });

  describe('computed signals', () => {
    it('should return false for showCash by default', () => {
      expect(component.showCash()).toBeFalse();
    });

    it('should return userName from authUserSignal', () => {
      authUserSignal.set({ ...initialAuthUser, displayName: 'Lucas' });

      expect(component['userName']()).toBe('Lucas');
    });

    it('should pass short measure to year view on handset breakpoints', () => {
      const room = {
        roomId: 'room-1',
        roomName: 'Main room',
        primary: true,
        currency: { code: 'EUR', icon: 'EUR' },
        timeZone: 'Europe/Amsterdam',
      };
      const quarterSummaries = [{
        quarter: 1,
        monthSummaries: [{ month: 1, total: [] }],
      }];

      dashboardStoreSpy.yearSummaryMap.set(new Map([
        [room, { quarterSummaries }],
      ]));
      fixture.detectChanges();
      TestBed.flushEffects();
      fixture.detectChanges();

      let yearComponent = fixture.debugElement.query(By.directive(YearComponent)).componentInstance as YearComponent;
      expect(component.isHandset()).toBeFalse();
      expect(yearComponent.measure()).toBe('long');

      breakpoint$.next({
        matches: true,
        breakpoints: {
          [Breakpoints.XSmall]: true,
          [Breakpoints.Small]: false,
          [Breakpoints.Medium]: false,
        },
      });
      fixture.detectChanges();
      TestBed.flushEffects();
      fixture.detectChanges();

      yearComponent = fixture.debugElement.query(By.directive(YearComponent)).componentInstance as YearComponent;
      expect(component.isHandset()).toBeTrue();
      expect(yearComponent.measure()).toBe('short');
    });
  });
});
