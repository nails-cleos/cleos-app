/* eslint-disable @typescript-eslint/no-unused-vars */
import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { YearSummaryComponent } from './year-summary.component';
import { Subject } from 'rxjs';
import { Store } from '@ngrx/store';
import { AuthUserService, IAuthUser, initialAuthUser } from '../../services/auth-user.service';
import { TranslateModule } from '@ngx-translate/core';
import { ActivatedRoute } from '@angular/router';
import { IMonthlyExport, IMonthlySummaryExpense, IMonthlySummarySale, ISummaryTotal } from '../../interfaces/dashboard';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import fs from 'file-saver';
import { DashboardState } from '../../store/reducers/dashboard.reducers';
import { signal } from '@angular/core';

describe('YearSummaryComponent', () => {
  let component: YearSummaryComponent;
  let fixture: ComponentFixture<YearSummaryComponent>;

  const authUserSignal = signal<IAuthUser>(initialAuthUser);

  let storeSpy: jasmine.SpyObj<Store<DashboardState>>;
  let authUserServiceSpy: jasmine.SpyObj<AuthUserService>;
  let activatedRouteSpy: jasmine.SpyObj<ActivatedRoute>;
  let saveAsSpy: jasmine.Spy;

  beforeEach(async () => {

    storeSpy = jasmine.createSpyObj('Store', ['select', 'dispatch', 'pipe']);
    activatedRouteSpy = jasmine.createSpyObj('ActivatedRoute', [], {
      snapshot: {
        paramMap: jasmine.createSpyObj('ParamMap', ['get']),
      },
    });
    authUserServiceSpy = jasmine.createSpyObj('AuthUserService', ['getUser', 'logout'], {
      authUser: authUserSignal.asReadonly(),
    });

    storeSpy.pipe.and.returnValue(new Subject().asObservable());

    await TestBed.configureTestingModule({
      imports: [YearSummaryComponent, TranslateModule.forRoot()],
      providers: [
        provideNoopAnimations(),
        { provide: Store, useValue: storeSpy },
        { provide: AuthUserService, useValue: authUserServiceSpy },
        { provide: ActivatedRoute, useValue: activatedRouteSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(YearSummaryComponent);
    component = fixture.componentInstance;

    saveAsSpy = spyOn(fs as any, 'saveAs').and.callFake((blob: Blob, filename?: string) => {
    });
  });

  afterEach(() => {
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

      component['sheetDataSignal'].set([mockMonthlyExport]);
      component.getForm.date.setValue(new Date(2024, 0, 1));

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

      component['sheetDataSignal'].set([mockMonthlyExport]);
      component.getForm.date.setValue(new Date(2024, 0, 1));
      fixture.detectChanges();

      component['exportToExcel']();

      const sheetData = component.sheetData;
      expect(sheetData[0].saleSummary[0].timestamp).toBe(200);
      expect(sheetData[0].saleSummary[1].timestamp).toBe(100);
      expect(sheetData[0].expenseSummary[0].timestamp).toBe(400);
      expect(sheetData[0].expenseSummary[1].timestamp).toBe(300);
    });

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
});
