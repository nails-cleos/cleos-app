import { IReservationAll } from '../reservation/reservation';
import { ITransaction } from '../account/account';

export const PENALTY = 50;

export interface IPaymentOption {
  enabled: boolean;
  default: boolean;
  filter: boolean;
  defaultFilter: boolean;
  show: boolean;
  label: string;
  type: string;
  icon?: string;
  name?: string;
  enabledCustomer?: boolean;
  enabledProfessional?: boolean;
  hidePercentage?: boolean;
}

export enum PaymentPercentage {
  deposit_50 = 'DEPOSIT_50',
  total = 'TOTAL'
}

export interface IPaymentStatus {
  paymentId: string;
  paymentType: string;
  preferenceId: string;
  reason?: string;
}

export interface IPay {
  status: string;
  message: string;
  paths: string[];
}

export interface IPaymentRequest {
  paymentId: string;
  paymentType: string;
  amount: number;
  pointOfSale?: boolean;
}

export interface IPayment {
  id?: string;
  description?: string;
  amount?: number;
  transactionAmount?: number;
  status?: string;
  type?: string;
  paymentId?: string;
  preferenceId?: string;
  link?: string;
  paymentURL?: string;
  timestamp?: number;
  transactionId?: string;
  transaction?: ITransaction;
  reservationId?: string;
  reservation?: IReservationAll;
}

export interface IPaymentAll {
  id: string;
  description: string;
  amount: number;
  transactionAmount?: number;
  status: string;
  timestamp: number;
  type: string;
  paymentId: string;
  preferenceId: string;
  reservation?: IReservationAll;
  transaction?: ITransaction;
  link?: string;
  paymentURL?: string;
}

export class PaymentStatus implements IPaymentStatus {
  paymentId: string;
  paymentType: string;
  preferenceId: string;
  reason?: string;

  constructor(paymentId: string, type: string, referenceId: string, reason?: string) {
    this.paymentId = paymentId;
    this.paymentType = type;
    this.preferenceId = referenceId;
    this.reason = reason;
  }
}
