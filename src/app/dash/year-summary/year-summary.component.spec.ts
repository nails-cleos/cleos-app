import { ComponentFixture, TestBed } from '@angular/core/testing';

import { YearSummaryComponent } from './year-summary.component';
import { of, Subject } from 'rxjs';
import { Store } from '@ngrx/store';
import { AuthUserService } from '../../services/auth-user.service';
import { TranslateModule } from '@ngx-translate/core';
import { ActivatedRoute } from '@angular/router';
import { IMonthlyExport, IMonthlySummaryExpense, IMonthlySummarySale, ISummaryTotal } from '../../interfaces/dashboard';

describe('YearSummaryComponent', () => {
  let component: YearSummaryComponent;
  let fixture: ComponentFixture<YearSummaryComponent>;
  let stateSubject: Subject<any>;

  const mockCurrency = {
    id: 'eur',
    name: 'Euro',
    code: 'EUR',
    icon: '€',
  };

  const mockStore = {
    select: jasmine.createSpy('select').and.returnValue(of({})),
    dispatch: jasmine.createSpy('dispatch'),
  };

  const mockAuthUserService = {
    authUser: of({
      displayName: 'Test User',
      showCash: true,
    }),
  };

  const mockActivatedRoute = {
    snapshot: {
      paramMap: {
        get: jasmine.createSpy('get').and.returnValue('calendar'),
      },
    },
  };

  beforeEach(async () => {
    stateSubject = new Subject();

    mockStore.select.and.returnValue(stateSubject.asObservable());

    await TestBed.configureTestingModule({
      imports: [YearSummaryComponent, TranslateModule.forRoot()],
      providers: [
        { provide: Store, useValue: mockStore },
        { provide: AuthUserService, useValue: mockAuthUserService },
        { provide: ActivatedRoute, useValue: mockActivatedRoute },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(YearSummaryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('exportToExcel method', () => {
    it('should export to Excel with valid data', () => {
      const mockMonthlyExport: IMonthlyExport = {
        month: 1,
        saleSummary: [],
        expenseSummary: [],
        cashSummary: [],
      };

      component.sheetData = [mockMonthlyExport];
      component.date.setValue(new Date(2024, 0, 1));
      component.currency = mockCurrency;
      component.timeZone = 'Europe/Amsterdam';

      component['exportToExcel']();

      expect(component.sheetData.length).toBeGreaterThan(0);
    });

    it('should sort summaries by timestamp before export', () => {
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

      component.sheetData = [mockMonthlyExport];
      component.date.setValue(new Date(2024, 0, 1));
      component.currency = mockCurrency;
      component.timeZone = 'Europe/Amsterdam';

      component['exportToExcel']();

      expect(component.sheetData[0].saleSummary[0].timestamp).toBe(100);
      expect(component.sheetData[0].saleSummary[1].timestamp).toBe(200);
      expect(component.sheetData[0].expenseSummary[0].timestamp).toBe(300);
      expect(component.sheetData[0].expenseSummary[1].timestamp).toBe(400);
    });

    it('should not export when sheetData is empty', () => {
      component.sheetData = [];
      component.date.setValue(new Date(2024, 0, 1));

      component['exportToExcel']();

      expect(component.sheetData.length).toBe(0);
    });

    it('should set workbook creator and created date', () => {
      const mockMonthlyExport: IMonthlyExport = {
        month: 1,
        saleSummary: [],
        expenseSummary: [],
        cashSummary: [],
      };

      component.sheetData = [mockMonthlyExport];
      component.date.setValue(new Date(2024, 0, 1));
      component.currency = mockCurrency;
      component.timeZone = 'Europe/Amsterdam';

      component['exportToExcel']();

      expect(component.currency).toBeDefined();
    });
  });

  describe('exportAction', () => {
    let saveAsSpy: jasmine.Spy;

    beforeEach(() => {
      saveAsSpy = jasmine.createSpy('saveAs');
      (window as any).saveAs = saveAsSpy;
    });

    afterEach(() => {
      delete (window as any).saveAs;
    });

    it('should call exportToExcel when export is true', () => {
      component.date.setValue(new Date(2024, 0, 1));

      stateSubject.next({
        yearExport: {  },
      });

      spyOn<any>(component, 'exportToExcel');

      component.exportAction();

      expect(component['exportToExcel']).toHaveBeenCalled();
    });

    it('should call getExportData when export is false', () => {
      component.export = false;
      component.date.setValue(new Date(2024, 0, 1));

      spyOn<any>(component, 'getExportData');

      component.exportAction();

      expect(component['getExportData']).toHaveBeenCalledWith(2024);
    });

    it('should not call any method when date is null', () => {
      component.date.setValue(null);

      spyOn<any>(component, 'exportToExcel');
      spyOn<any>(component, 'getExportData');

      component.exportAction();

      expect(component['exportToExcel']).not.toHaveBeenCalled();
      expect(component['getExportData']).not.toHaveBeenCalled();
    });
  });
});
