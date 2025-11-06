import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ResultSummaryComponent } from './result-summary.component';
import { TranslateModule } from '@ngx-translate/core';
import { ICurrencyAll } from '../../interfaces/currency';

describe('ResultSummaryComponent', () => {
  let component: ResultSummaryComponent;
  let fixture: ComponentFixture<ResultSummaryComponent>;

  const mockSummaryTotals = {
    income: { gross: 1000, btw: 100, net: 900 },
    expense: { gross: 500, btw: 50, net: 450 },
    totals: { gross: 1500, btw: 150, net: 1350 },
    cash: { gross: 200, btw: 20, net: 180 },
  };

  const mockCurrency: ICurrencyAll = {
    id: '1',
    code: 'EUR',
    name: 'Euro',
    icon: '€',
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ResultSummaryComponent, TranslateModule.forRoot()],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ResultSummaryComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('calculateAmount', () => {
    beforeEach(() => {
      component.summaryTotals = mockSummaryTotals;
    });

    it('should calculate difference between income and expense when summaryType is not set', () => {
      component.summaryType = undefined;
      
      expect(component.calculateAmount('gross')).toBe(500);
      expect(component.calculateAmount('btw')).toBe(50);
      expect(component.calculateAmount('net')).toBe(450);
    });

    it('should return totals amount when summaryType is "totals"', () => {
      component.summaryType = 'totals';
      
      expect(component.calculateAmount('gross')).toBe(1500);
      expect(component.calculateAmount('btw')).toBe(150);
      expect(component.calculateAmount('net')).toBe(1350);
    });

    it('should return income amount when summaryType is "income"', () => {
      component.summaryType = 'income';
      
      expect(component.calculateAmount('gross')).toBe(1000);
      expect(component.calculateAmount('btw')).toBe(100);
      expect(component.calculateAmount('net')).toBe(900);
    });

    it('should return expense amount when summaryType is "expense"', () => {
      component.summaryType = 'expense';
      
      expect(component.calculateAmount('gross')).toBe(500);
      expect(component.calculateAmount('btw')).toBe(50);
      expect(component.calculateAmount('net')).toBe(450);
    });

    it('should return cash amount when summaryType is "cash"', () => {
      component.summaryType = 'cash';
      
      expect(component.calculateAmount('gross')).toBe(200);
      expect(component.calculateAmount('btw')).toBe(20);
      expect(component.calculateAmount('net')).toBe(180);
    });
  });

  describe('input properties', () => {
    it('should accept summaryTotals input', () => {
      component.summaryTotals = mockSummaryTotals;
      expect(component.summaryTotals).toBe(mockSummaryTotals);
    });

    it('should accept summaryType input', () => {
      component.summaryType = 'income';
      expect(component.summaryType).toBe('income');
    });

    it('should accept title input', () => {
      component.title = 'Test Title';
      expect(component.title).toBe('Test Title');
    });

    it('should accept currency input', () => {
      component.currency = mockCurrency;
      expect(component.currency).toBe(mockCurrency);
    });
  });
});
