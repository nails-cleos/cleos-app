import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TotalSummaryComponent } from './total-summary.component';
import { TranslateModule } from '@ngx-translate/core';
import { By } from '@angular/platform-browser';
import { ISummaryTotals, Total } from '../../interfaces/dashboard';
import { ICurrencyAll } from '../../interfaces/currency';

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
      imports: [TotalSummaryComponent, TranslateModule.forRoot()],
    }).compileComponents();

    fixture = TestBed.createComponent(TotalSummaryComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize showCash to false', () => {
    expect(component.showCash).toBeFalsy();
  });

  it('should accept summaryTotals input', () => {
    component.summaryTotals = mockSummaryTotals;
    expect(component.summaryTotals).toBe(mockSummaryTotals);
  });

  it('should accept currency input', () => {
    component.currency = mockCurrency;
    expect(component.currency).toBe(mockCurrency);
  });

  it('should accept showCash input', () => {
    component.showCash = true;
    expect(component.showCash).toBe(true);
  });

  describe('Template rendering', () => {
    beforeEach(() => {
      component.summaryTotals = mockSummaryTotals;
      component.currency = mockCurrency;
      fixture.detectChanges();
    });

    it('should render mat-card with outlined appearance', () => {
      const matCard = fixture.debugElement.query(By.css('mat-card[appearance="outlined"]'));
      expect(matCard).toBeTruthy();
    });

    it('should render three result summary components in main section', () => {
      const resultSummaries = fixture.debugElement.queryAll(By.css('mat-card-content app-result-summary'));
      expect(resultSummaries.length).toBe(3);
    });

    it('should not render cash section when showCash is false', () => {
      component.showCash = false;
      fixture.detectChanges();

      const matCardFooter = fixture.debugElement.query(By.css('mat-card-footer'));
      expect(matCardFooter).toBeFalsy();
    });

    it('should render cash section when showCash is true', () => {
      component.showCash = true;
      fixture.detectChanges();

      const matCardFooter = fixture.debugElement.query(By.css('mat-card-footer'));
      expect(matCardFooter).toBeTruthy();

      const matDivider = fixture.debugElement.query(By.css('mat-divider.top'));
      expect(matDivider).toBeTruthy();

      const cashResultSummaries = fixture.debugElement.queryAll(By.css('mat-card-footer app-result-summary'));
      expect(cashResultSummaries.length).toBe(2);
    });

    it('should apply correct CSS classes when showCash is false', () => {
      component.showCash = false;
      fixture.detectChanges();

      const contentDivs = fixture.debugElement.queryAll(By.css('.bottom'));
      expect(contentDivs[0].nativeElement.classList.contains('year-content')).toBe(true);
      expect(contentDivs[0].nativeElement.classList.contains('year-cash-content')).toBe(false);
      expect(contentDivs[1].nativeElement.classList.contains('year-content')).toBe(true);
      expect(contentDivs[1].nativeElement.classList.contains('year-cash-content')).toBe(false);
    });

    it('should apply correct CSS classes when showCash is true', () => {
      component.showCash = true;
      fixture.detectChanges();

      const contentDivs = fixture.debugElement.queryAll(By.css('.bottom'));
      expect(contentDivs[0].nativeElement.classList.contains('year-cash-content')).toBe(true);
      expect(contentDivs[0].nativeElement.classList.contains('year-content')).toBe(false);
      expect(contentDivs[1].nativeElement.classList.contains('year-cash-content')).toBe(true);
      expect(contentDivs[1].nativeElement.classList.contains('year-content')).toBe(false);
    });
  });

  describe('Component behavior', () => {
    it('should toggle cash section visibility', () => {
      component.summaryTotals = mockSummaryTotals;
      component.showCash = false;
      fixture.detectChanges();

      let matCardFooter = fixture.debugElement.query(By.css('mat-card-footer'));
      expect(matCardFooter).toBeFalsy();

      component.showCash = true;
      fixture.detectChanges();

      matCardFooter = fixture.debugElement.query(By.css('mat-card-footer'));
      expect(matCardFooter).toBeTruthy();
    });

    it('should work without currency input', () => {
      component.summaryTotals = mockSummaryTotals;
      component.currency = undefined;
      fixture.detectChanges();

      expect(component.currency).toBeUndefined();
      expect(() => fixture.detectChanges()).not.toThrow();
    });

    it('should render with required summaryTotals input', () => {
      component.summaryTotals = mockSummaryTotals;
      fixture.detectChanges();

      const matCard = fixture.debugElement.query(By.css('mat-card'));
      expect(matCard).toBeTruthy();
    });
  });
});
