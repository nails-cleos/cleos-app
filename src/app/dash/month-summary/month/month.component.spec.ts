import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MonthComponent } from './month.component';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { IMonthSummary, ISummaryTotal } from '../../../interfaces/dashboard';
import { Router } from '@angular/router';

describe('MonthComponent', () => {
  let component: MonthComponent;
  let fixture: ComponentFixture<MonthComponent>;
  let mockRouter: jasmine.SpyObj<Router>;
  let mockTranslate: jasmine.SpyObj<TranslateService>;

  const monthSummary: IMonthSummary = {
    month: 1,
    total: [
      { type: 'INCOME', gross: 60, net: 50, btw: 10 } as ISummaryTotal,
      { type: 'EXPENSE', gross: 61, net: 50, btw: 11 } as ISummaryTotal,
      { type: 'CASH', gross: 1, net: 0, btw: 1 } as ISummaryTotal,
    ],
    totalGross: 121,
    totalNet: 100,
    totalBTW: 21,
    totalWithoutGross: 100,
    totalWithoutNet: 100,
    totalWithoutBTW: 100,
  };

  beforeEach(async () => {
    mockRouter = jasmine.createSpyObj('Router', ['navigate']);
    mockTranslate = jasmine.createSpyObj('TranslateService', [], { currentLang: 'en' });

    await TestBed.configureTestingModule({
      imports: [MonthComponent, TranslateModule.forRoot()],
      providers: [
        { provide: Router, useValue: mockRouter },
        { provide: TranslateService, useValue: mockTranslate },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(MonthComponent);
    component = fixture.componentInstance;
    component.month = monthSummary;
    component.year = 2025;
  });

  it('should create component', () => {
    expect(component).toBeTruthy();
  });

  it('should calculate income and expense totals correctly (showCash = false)', () => {
    component.showCash = false;
    component.ngAfterViewInit();

    expect(component.income?.gross).toBe(60);
    expect(component.income?.net).toBe(50);
    expect(component.income?.btw).toBe(10);

    expect(component.expense?.gross).toBe(61);
    expect(component.expense?.net).toBe(50);
    expect(component.expense?.btw).toBe(11);

    // Cash should be ignored when showCash = false
    expect(component.cash?.gross).toBe(0);
    expect(component.cash?.btw).toBe(0);
    expect(component.cash?.net).toBe(0);
  });

  it('should include cash totals when showCash = true', () => {
    component.showCash = true;
    component.ngAfterViewInit();

    expect(component.cash?.gross).toBe(1);
    expect(component.cash?.btw).toBe(1);
    expect(component.cash?.net).toBe(0);
  });

  describe('goToMonth', () => {
    it('should navigate with step 0 for INCOME', () => {
      component.goToMonth(5, 'INCOME');

      expect(mockRouter.navigate).toHaveBeenCalledWith(
        ['en', 'dashboard', 'monthly', 'summary'],
        { state: { date: '5-2025', step: 0 } },
      );
    });

    it('should navigate with step 1 for EXPENSE', () => {
      component.goToMonth(5, 'EXPENSE');

      expect(mockRouter.navigate).toHaveBeenCalledWith(
        ['en', 'dashboard', 'monthly', 'summary'],
        { state: { date: '5-2025', step: 1 } },
      );
    });

    it('should navigate with step 2 for CASH', () => {
      component.goToMonth(5, 'CASH');

      expect(mockRouter.navigate).toHaveBeenCalledWith(
        ['en', 'dashboard', 'monthly', 'summary'],
        { state: { date: '5-2025', step: 2 } },
      );
    });

    it('should navigate with step 0 when type is undefined', () => {
      component.goToMonth(7);

      expect(mockRouter.navigate).toHaveBeenCalledWith(
        ['en', 'dashboard', 'monthly', 'summary'],
        { state: { date: '7-2025', step: 0 } },
      );
    });
  });
});
