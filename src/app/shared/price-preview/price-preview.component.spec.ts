import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PricePreviewComponent } from './price-preview.component';
import { Price } from '@app/treatment/treatment';
import { provideTranslateService } from '@ngx-translate/core';
import { beforeEach, describe, expect, it } from 'vitest';

describe('PricePreviewComponent', () => {
  let component: PricePreviewComponent;
  let fixture: ComponentFixture<PricePreviewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PricePreviewComponent],
      providers: [provideTranslateService()],
      teardown: {
        destroyAfterEach: true,
      },
    }).compileComponents();

    fixture = TestBed.createComponent(PricePreviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should return zeros when there is no price and no explicit summary data', () => {
    expect(component.resultAmount).toBe(0);
    expect(component.accountCreditAmount).toBe(0);
    expect(component.accountBalanceUsed).toBe(0);
    expect(component.hasBalanceSummary).toBe(false);
  });

  it('should prefer toPaid when it is positive', () => {
    fixture.componentRef.setInput('toPaid', 52.5);
    fixture.detectChanges();

    expect(component.resultAmount).toBe(52.5);
  });

  it('should return account credit amount when explicit account credit is provided', () => {
    fixture.componentRef.setInput('accountCredit', 15);
    fixture.detectChanges();

    expect(component.accountCreditAmount).toBe(15);
    expect(component.resultAmount).toBe(15);
  });

  it('should return zero result when explicit summary inputs are present but no payment or credit remains', () => {
    fixture.componentRef.setInput('toPaid', 0);
    fixture.componentRef.setInput('penalty', 20);
    fixture.componentRef.setInput('accountCredit', 0);
    fixture.detectChanges();

    expect(component.resultAmount).toBe(0);
  });

  it('should derive current total and paid total from explicit inputs', () => {
    fixture.componentRef.setInput('updatedTotal', 70);
    fixture.componentRef.setInput('paidTotal', 5);
    fixture.componentRef.setInput('penalty', 2.5);
    fixture.detectChanges();

    expect(component.currentTotal).toBe(70);
    expect(component.currentPaidTotal).toBe(5);
    expect(component.targetAmount).toBe(72.5);
  });

  it('should use provided account balance used before deriving it', () => {
    fixture.componentRef.setInput('accountBalanceUsedInput', 17.5);
    fixture.detectChanges();

    expect(component.accountBalanceUsed).toBe(17.5);
  });

  it('should derive account balance used from price when no explicit value is provided', () => {
    const price = new Price(0, 0, 0, 0, 70, 0, 70, 0, 0, 0, 100, 20);
    fixture.componentRef.setInput('price', price);
    fixture.componentRef.setInput('updatedTotal', 70);
    fixture.detectChanges();

    expect(component.accountBalanceUsed).toBe(20);
    expect(component.hasBalanceSummary).toBe(true);
  });

  it('should derive account credit from price and penalty when explicit credit is absent', () => {
    const price = new Price(0, 0, 0, 0, 5, 10, 5, 0, 0, 0, 100, 2.5);
    fixture.componentRef.setInput('price', price);
    fixture.componentRef.setInput('penalty', 2.5);
    fixture.detectChanges();

    expect(component.accountCreditAmount).toBe(5);
    expect(component.resultAmount).toBe(5);
  });

  it('should fall back to price totals when explicit totals are absent', () => {
    const price = new Price(0, 0, 0, 0, 30, 12, 30, 0, 0, 0, 100, 0);
    fixture.componentRef.setInput('price', price);
    fixture.detectChanges();

    expect(component.currentTotal).toBe(30);
    expect(component.currentPaidTotal).toBe(12);
  });

  it('should fall back to price.toPaid when no explicit summary inputs are present', () => {
    const price = new Price(0, 0, 0, 0, 70, 0, 70, 0, 0, 0, 100, 0);
    fixture.componentRef.setInput('price', price);
    fixture.detectChanges();

    expect(component.resultAmount).toBe(70);
  });
});
