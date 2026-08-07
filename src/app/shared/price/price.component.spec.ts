import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, FormGroup } from '@angular/forms';

import { PriceComponent } from './price.component';
import { ICurrency } from '@app/currency/currency';
import { Price } from '@app/treatment/treatment';
import { BankForm } from '../bank/bank.component';
import { provideTranslateService } from '@ngx-translate/core';

describe('PriceComponent', () => {
  let component: PriceComponent;
  let fixture: ComponentFixture<PriceComponent>;

  const mockCurrency: ICurrency = {
    code: 'USD',
    name: 'US Dollar',
    icon: '$',
  };

  const typeForm = new FormGroup<BankForm>({
    option: new FormControl(undefined as any),
    percentage: new FormControl(undefined as any),
  });

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PriceComponent],
      providers: [provideTranslateService()],
    }).compileComponents();

    fixture = TestBed.createComponent(PriceComponent);
    component = fixture.componentInstance;

    fixture.componentRef.setInput('typeForm', typeForm);
    fixture.componentRef.setInput('currency', mockCurrency);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should use payment price as summary price when original price is missing', () => {
    const paymentPrice = new Price(0, 0, 0, 0, 70, 10, 70, 0, 0, 0, 100, 15);
    fixture.componentRef.setInput('paymentPrice', paymentPrice);
    fixture.detectChanges();

    expect(component.summaryPrice).toBe(paymentPrice);
  });

  it('should return undefined summary price when no price inputs are provided', () => {
    expect(component.summaryPrice).toBeUndefined();
    expect(component.targetAmount).toBe(0);
  });

  it('should return provided account balance used before deriving from price balance', () => {
    const price = new Price(0, 0, 0, 0, 70, 10, 70, 0, 0, 0, 100, 50);
    fixture.componentRef.setInput('price', price);
    fixture.componentRef.setInput('accountBalanceUsed', 17.5);
    fixture.detectChanges();

    expect(component.appliedBalance).toBe(17.5);
  });

  it('should ignore balance when includeBalance is false', () => {
    const price = new Price(0, 0, 0, 0, 70, 10, 70, 0, 0, 0, 100, 50);
    fixture.componentRef.setInput('price', price);
    fixture.componentRef.setInput('includeBalance', false);
    fixture.detectChanges();

    expect(component.appliedBalance).toBe(0);
  });

  it('should derive applied balance from current price when no explicit value is provided', () => {
    const price = new Price(0, 0, 0, 0, 70, 10, 70, 0, 0, 0, 100, 50);
    fixture.componentRef.setInput('price', price);
    fixture.detectChanges();

    expect(component.appliedBalance).toBe(50);
  });

  it('should include payment price and penalty in target amount when editing changed reservation', () => {
    const oldPrice = new Price(0, 0, 0, 0, 40, 10, 40, 0, 0, 0, 100, 0);
    oldPrice.setPenalty(20);
    const paymentPrice = new Price(0, 0, 0, 0, 70, 10, 70, 0, 0, 0, 100, 0);
    fixture.componentRef.setInput('price', oldPrice);
    fixture.componentRef.setInput('paymentPrice', paymentPrice);
    fixture.componentRef.setInput('hasChanges', true);
    fixture.componentRef.setInput('showPenalty', true);
    fixture.detectChanges();

    expect(component.targetAmount).toBe(90);
  });

  it('should return only penalty as target amount when showing penalty without payment changes', () => {
    const oldPrice = new Price(0, 0, 0, 0, 40, 10, 40, 0, 0, 0, 100, 0);
    oldPrice.setPenalty(20);
    fixture.componentRef.setInput('price', oldPrice);
    fixture.componentRef.setInput('showPenalty', true);
    fixture.detectChanges();

    expect(component.targetAmount).toBe(20);
  });

  it('should return payment price total when penalty is not shown', () => {
    const oldPrice = new Price(0, 0, 0, 0, 40, 10, 40, 0, 0, 0, 100, 0);
    const paymentPrice = new Price(0, 0, 0, 0, 70, 10, 70, 0, 0, 0, 100, 0);
    fixture.componentRef.setInput('price', oldPrice);
    fixture.componentRef.setInput('paymentPrice', paymentPrice);
    fixture.detectChanges();

    expect(component.targetAmount).toBe(70);
  });

  it('should calculate adjusted amount to pay using applied balance', () => {
    const oldPrice = new Price(0, 0, 0, 0, 40, 10, 40, 0, 0, 0, 100, 0);
    oldPrice.setPenalty(20);
    const paymentPrice = new Price(0, 0, 0, 0, 70, 10, 70, 0, 0, 0, 100, 0);
    fixture.componentRef.setInput('price', oldPrice);
    fixture.componentRef.setInput('paymentPrice', paymentPrice);
    fixture.componentRef.setInput('hasChanges', true);
    fixture.componentRef.setInput('showPenalty', true);
    fixture.componentRef.setInput('accountBalanceUsed', 17.5);
    fixture.detectChanges();

    expect(component.adjustedAmountToPay).toBe(62.5);
    expect(component.shouldShowBankForm).toBeFalse();
  });

  it('should show bank form only when enabled and there is money left to pay', () => {
    const price = new Price(0, 0, 0, 0, 70, 0, 70, 0, 0, 0, 100, 0);
    fixture.componentRef.setInput('price', price);
    fixture.componentRef.setInput('showBank', true);
    fixture.detectChanges();

    expect(component.shouldShowBankForm).toBeTrue();
  });

  it('should calculate adjusted credit when covered amount is greater than target', () => {
    const price = new Price(0, 0, 0, 0, 5, 5, 5, 0, 0, 0, 100, 0);
    price.setPenalty(2.5);
    fixture.componentRef.setInput('price', price);
    fixture.componentRef.setInput('showPenalty', true);
    fixture.componentRef.setInput('accountBalanceUsed', 2.5);
    fixture.detectChanges();

    expect(component.adjustedCredit).toBe(5);
  });
});
