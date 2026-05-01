import { PaymentPercentage, PaymentStatus } from './payment';

describe('Payment helpers', () => {
  it('should create payment status', () => {
    const status = new PaymentStatus('payment-1', 'MOLLIE', 'pref-1', PaymentPercentage.total);

    expect(status.paymentId).toBe('payment-1');
    expect(status.paymentType).toBe('MOLLIE');
    expect(status.preferenceId).toBe('pref-1');
    expect(status.reason).toBe(PaymentPercentage.total);
  });
});
