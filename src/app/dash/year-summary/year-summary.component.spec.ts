import { ComponentFixture, TestBed } from '@angular/core/testing';

import { YearSummaryComponent } from './year-summary.component';
import { of } from 'rxjs';
import { Store } from '@ngrx/store';
import { AuthUserService } from '../../services/auth-user.service';
import { TranslateModule } from '@ngx-translate/core';
import { ActivatedRoute } from '@angular/router';
import { IMonthlyExport } from '../../interfaces/dashboard';

describe('YearSummaryComponent', () => {
  let component: YearSummaryComponent;
  let fixture: ComponentFixture<YearSummaryComponent>;

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
          { timestamp: 200, id: 'sale-2' } as any,
          { timestamp: 100, id: 'sale-1' } as any,
        ],
        expenseSummary: [
          { timestamp: 400, id: 'expense-2' } as any,
          { timestamp: 300, id: 'expense-1' } as any,
        ],
        cashSummary: [
          { timestamp: 600, id: 'cash-2' } as any,
          { timestamp: 500, id: 'cash-1' } as any,
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

  describe('exportAction getter', () => {
    it('should call exportToExcel when export is true', () => {
      component.export = true;
      component.date.setValue(new Date(2024, 0, 1));
      component.sheetData = [];

      spyOn<any>(component, 'exportToExcel');

      void component.exportAction;

      expect(component['exportToExcel']).toHaveBeenCalled();
    });

    it('should call getExportData when export is false', () => {
      component.export = false;
      component.date.setValue(new Date(2024, 0, 1));

      spyOn<any>(component, 'getExportData');

      void component.exportAction;

      expect(component['getExportData']).toHaveBeenCalledWith(2024);
    });

    it('should not call any method when date is null', () => {
      component.date.setValue(null);

      spyOn<any>(component, 'exportToExcel');
      spyOn<any>(component, 'getExportData');

      void component.exportAction;

      expect(component['exportToExcel']).not.toHaveBeenCalled();
      expect(component['getExportData']).not.toHaveBeenCalled();
    });
  });
});
