export enum PaymentType {
  cash = 'CASH',
  ml = 'ML'
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
