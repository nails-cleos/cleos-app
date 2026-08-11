import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ResultSummaryComponent } from './result-summary.component';
import { ICurrencyAll } from '@app/currency/currency';
import { ISummaryTotals } from '../dashboard';
import { provideTranslateService } from '@ngx-translate/core';
import { beforeEach, describe, expect, it } from 'vitest';

describe('ResultSummaryComponent', () => {
  let component: ResultSummaryComponent;
  let fixture: ComponentFixture<ResultSummaryComponent>;

  const mockSummaryTotals: ISummaryTotals = {
    income: { gross: 1000, btw: 100, net: 900, size: 1 },
    expense: { gross: 500, btw: 50, net: 450, size: 1 },
    totalsWithoutCash: { gross: 1500, btw: 150, net: 1350, size: 2 },
    cash: { gross: 200, btw: 0, net: 200, size: 1 },
    totals: { gross: 1700, btw: 150, net: 1530, size: 3 },
  };

  const mockCurrency: ICurrencyAll = {
    id: '1',
    code: 'EUR',
    name: 'Euro',
    icon: '€',
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ResultSummaryComponent],
      providers: [provideTranslateService()],
    }).compileComponents();

    fixture = TestBed.createComponent(ResultSummaryComponent);
    component = fixture.componentInstance;

    fixture.componentRef.setInput('summaryTotals', mockSummaryTotals);
    fixture.componentRef.setInput('title', 'Test Title');
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();

    expect(component.title()).toBe('Test Title');
    expect(component.summaryTotals()).toBe(mockSummaryTotals);
    expect(component.currency()).toBeUndefined();
  });

  describe('calculateAmount', () => {
    it('should calculate difference between income and expense when summaryType is not set', () => {
      fixture.componentRef.setInput('summaryType', undefined);

      expect(component.calculateAmount('gross')).toBe(500);
      expect(component.calculateAmount('btw')).toBe(50);
      expect(component.calculateAmount('net')).toBe(450);
    });

    it('should return totals amount when summaryType is "totals"', () => {
      fixture.componentRef.setInput('summaryType', 'totals');

      expect(component.calculateAmount('gross')).toBe(1700);
      expect(component.calculateAmount('btw')).toBe(150);
      expect(component.calculateAmount('net')).toBe(1530);
    });

    it('should return income amount when summaryType is "income"', () => {
      fixture.componentRef.setInput('summaryType', 'income');

      expect(component.summaryType()).toBe('income');
      expect(component.calculateAmount('gross')).toBe(1000);
      expect(component.calculateAmount('btw')).toBe(100);
      expect(component.calculateAmount('net')).toBe(900);
    });

    it('should return expense amount when summaryType is "expense"', () => {
      fixture.componentRef.setInput('summaryType', 'expense');

      expect(component.calculateAmount('gross')).toBe(500);
      expect(component.calculateAmount('btw')).toBe(50);
      expect(component.calculateAmount('net')).toBe(450);
    });

    it('should return cash amount when summaryType is "cash"', () => {
      fixture.componentRef.setInput('summaryType', 'cash');

      expect(component.calculateAmount('gross')).toBe(200);
      expect(component.calculateAmount('btw')).toBe(0);
      expect(component.calculateAmount('net')).toBe(200);
    });

    it('should accept summaryTotals input', () => {
      fixture.componentRef.setInput('currency', mockCurrency);
      expect(component.currency()).toBe(mockCurrency);
    });
  });
});
