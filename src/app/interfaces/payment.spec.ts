import { TranslateService } from '@ngx-translate/core';

import {
  accountCredit,
  filterPaymentOptions,
  getPaymentOptions,
  paymentOptions,
  PaymentPercentage,
  PaymentStatus,
  PaymentType,
} from './payment';

describe('Payment helpers', () => {
  const translate = {
    instant: (key: string) => key,
  } as TranslateService;

  it('should map payment types to icons and flags', () => {
    const options = getPaymentOptions(translate, [
      PaymentType.ideal,
      PaymentType.paypal,
      PaymentType.mollie,
      PaymentType.paynl,
      PaymentType.cash,
      PaymentType.transfer,
    ], true);

    expect(options).toEqual([
      jasmine.objectContaining({ type: PaymentType.ideal, svgIcon: 'IDEAL', hidePercentage: true }),
      jasmine.objectContaining({ type: PaymentType.paypal, svgIcon: 'PAYPAL', hidePercentage: true }),
      jasmine.objectContaining({ type: PaymentType.mollie, svgIcon: 'MOLLIE', hidePercentage: true }),
      jasmine.objectContaining({ type: PaymentType.paynl, svgIcon: 'PAY_NL', hidePercentage: true }),
      jasmine.objectContaining({ type: PaymentType.cash, icon: 'universal_currency', hidePercentage: true }),
      jasmine.objectContaining({ type: PaymentType.transfer, icon: 'send_money', hidePercentage: true }),
    ]);
  });

  it('should return empty options when types are missing', () => {
    expect(getPaymentOptions(translate, undefined)).toEqual([]);
  });

  it('should filter payment options by allowed types', () => {
    const options = getPaymentOptions(translate, [PaymentType.cash, PaymentType.mollie, PaymentType.paypal]);

    expect(filterPaymentOptions(options, [PaymentType.mollie, PaymentType.paypal]).map(option => option.type)).toEqual([
      PaymentType.mollie,
      PaymentType.paypal,
    ]);
  });

  it('should return all options when allowed types are not provided', () => {
    const options = getPaymentOptions(translate, [PaymentType.cash, PaymentType.transfer]);

    expect(filterPaymentOptions(options).map(option => option.type)).toEqual([PaymentType.cash, PaymentType.transfer]);
    expect(filterPaymentOptions(undefined, [PaymentType.cash])).toEqual([]);
  });

  it('should create account credit option', () => {
    expect(accountCredit('Account Credit')).toEqual([{
      type: PaymentType.account,
      name: 'Account Credit',
      icon: 'account_balance',
      hidePercentage: true,
      svgIcon: 'account_balance',
    }]);
  });

  it('should expose room payment options including deprecated flags', () => {
    const options = paymentOptions();

    expect(options.find(option => option.name === PaymentType.cash)?.deprecated).toBeFalse();
    expect(options.find(option => option.name === PaymentType.paypal)?.deprecated).toBeTrue();
    expect(options.find(option => option.name === PaymentType.mollie)?.deprecated).toBeFalse();
  });

  it('should create payment status', () => {
    const status = new PaymentStatus('payment-1', PaymentType.mollie, 'pref-1', PaymentPercentage.total);

    expect(status.paymentId).toBe('payment-1');
    expect(status.paymentType).toBe(PaymentType.mollie);
    expect(status.preferenceId).toBe('pref-1');
    expect(status.reason).toBe(PaymentPercentage.total);
  });
});
