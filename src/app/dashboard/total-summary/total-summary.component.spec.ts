import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TotalSummaryComponent } from './total-summary.component';
import { By } from '@angular/platform-browser';
import { ISummaryTotals, Total } from '../dashboard';
import { ICurrencyAll } from '@app/currency/currency';
import { provideTranslateService } from "@ngx-translate/core";

describe('TotalSummaryComponent', () => {
  let component: TotalSummaryComponent;
  let fixture: ComponentFixture<TotalSummaryComponent>;

  const mockSummaryTotals: ISummaryTotals = {
    income: new Total(1000, 100, 900, 5),
    expense: new Total(500, 50, 450, 3),
    cash: new Total(200, 20, 180, 2),
    totalsWithoutCash: new Total(500, 50, 450, 3),
    totals: new Total(700, 70, 630, 5),
  };

  const mockCurrency: ICurrencyAll = {
    id: '1',
    name: 'Euro',
    code: 'EUR',
    icon: '€',
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TotalSummaryComponent],
      providers: [provideTranslateService()]
    }).compileComponents();

    fixture = TestBed.createComponent(TotalSummaryComponent);
    component = fixture.componentInstance;

    fixture.componentRef.setInput('summaryTotals', mockSummaryTotals);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize showCash to false', () => {
    expect(component.showCash()).toBeFalse();
  });

  it('should accept summaryTotals input', () => {
    expect(component.summaryTotals()).toBe(mockSummaryTotals);
  });

  it('should accept currency input', () => {
    fixture.componentRef.setInput('currency', mockCurrency);
    fixture.detectChanges();

    expect(component.currency()).toBe(mockCurrency);
  });

  it('should accept showCash input', () => {
    fixture.componentRef.setInput('showCash', true);
    fixture.detectChanges();

    expect(component.showCash()).toBeTrue();
  });

  describe('Template rendering', () => {
    beforeEach(() => {
      fixture.componentRef.setInput('currency', mockCurrency);
      fixture.detectChanges();
    });

    it('should render mat-card with outlined appearance', () => {
      const stack = fixture.debugElement.query(By.css('.app-crud-view-grid'));
      expect(stack).toBeTruthy();
    });

    it('should render three rows in main section', () => {
      const rows = fixture.debugElement.queryAll(By.css('.app-surface-item:first-child .total-summary-row'));
      expect(rows.length).toBe(3);
    });

    it('should not render cash section when showCash is false', () => {
      fixture.componentRef.setInput('showCash', false);
      fixture.detectChanges();

      const operations = fixture.debugElement.queryAll(By.css('.app-surface-item'));
      expect(operations.length).toBe(1);
    });

    it('should render cash section when showCash is true', () => {
      fixture.componentRef.setInput('showCash', true);
      fixture.detectChanges();

      const operations = fixture.debugElement.queryAll(By.css('.app-surface-item'));
      expect(operations.length).toBe(2);

      const cashRows = fixture.debugElement.queryAll(By.css('.app-surface-item:nth-child(2) .total-summary-row'));
      expect(cashRows.length).toBe(3);
    });

    it('should render only the primary operation when showCash is false', () => {
      fixture.componentRef.setInput('showCash', false);
      fixture.detectChanges();

      const operations = fixture.debugElement.queryAll(By.css('.app-surface-item'));
      expect(operations.length).toBe(1);
      expect(operations[0].nativeElement.textContent).toContain('SUMMARY.INCOME');
    });

    it('should render the cash operation when showCash is true', () => {
      fixture.componentRef.setInput('showCash', true);
      fixture.detectChanges();

      const operations = fixture.debugElement.queryAll(By.css('.app-surface-item'));
      expect(operations.length).toBe(2);
      expect(operations[1].nativeElement.textContent).toContain('SUMMARY.CASH');
    });
  });

  describe('Component behavior', () => {
    it('should toggle cash section visibility', () => {
      fixture.componentRef.setInput('showCash', false);
      fixture.detectChanges();

      let operations = fixture.debugElement.queryAll(By.css('.app-surface-item'));
      expect(operations.length).toBe(1);

      fixture.componentRef.setInput('showCash', true);
      fixture.detectChanges();

      operations = fixture.debugElement.queryAll(By.css('.app-surface-item'));
      expect(operations.length).toBe(2);
    });

    it('should work without currency input', () => {
      fixture.componentRef.setInput('currency', undefined);
      fixture.detectChanges();

      expect(component.currency()).toBeUndefined();
      expect(() => fixture.detectChanges()).not.toThrow();
    });

    it('should render with required summaryTotals input', () => {
      fixture.detectChanges();

      const stack = fixture.debugElement.query(By.css('.app-crud-view-grid'));
      expect(stack).toBeTruthy();
    });
  });
});
