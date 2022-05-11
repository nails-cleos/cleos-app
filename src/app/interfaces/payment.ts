export interface IPaymentType {
  name: string;
  disabled: boolean;
  checked: boolean;
}

export enum PaymentType {
  cash = 'CASH',
  ml = 'ML',
  paypal = 'PAYPAL'
}

export const paymentOptions = (): IPaymentType[] => [{
  name: PaymentType.cash,
  disabled: true,
  checked: true
}, {
  name: PaymentType.ml,
  disabled: false,
  checked: false
}, {
  name: PaymentType.paypal,
  disabled: false,
  checked: false
}];

export interface IPaymentStatus {
  paymentId: string;
  paymentType: string;
  preferenceId: string;
}

export interface IPayment {
  id?: string;
  description?: string;
  amount?: number;
  status?: string;
  type?: string;
  paymentId?: string;
  preferenceId?: string;
}

export interface IPaymentAll {
  id: string;
  description: string;
  amount: number;
  status: string;
  type: string;
  paymentId: string;
  preferenceId: string;
}

export class Payment implements IPayment {
  constructor() {
  }
}

export class PaymentStatus implements IPaymentStatus {
  paymentId: string;
  paymentType: string;
  preferenceId: string;

  constructor(paymentId: string, type: string, referenceId: string) {
    this.paymentId = paymentId;
    this.paymentType = type;
    this.preferenceId = referenceId;
  }
}
