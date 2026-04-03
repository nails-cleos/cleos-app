import { IReservationAll } from './reservation';
import { TranslateService } from '@ngx-translate/core';
import { ITransaction } from './account';

export const PENALTY = 50;

export interface IPaymentType {
  name: string;
  disabled: boolean;
  checked: boolean;
  deprecated: boolean;
}

export enum PaymentType {
  cash = 'CASH',
  ml = 'ML',
  paypal = 'PAYPAL',
  ideal = 'IDEAL',
  transfer = 'TRANSFER',
  paynl = 'PAY_NL',
  account = 'ACCOUNT',
  mollie = 'MOLLIE',
}

export type PaymentTypeKey = keyof typeof PaymentType;

export interface IPaymentOption {
  name: string;
  svgIcon: string;
  type: PaymentType;
  hidePercentage?: boolean;
  icon?: string;
}

export class PaymentOption implements IPaymentOption {
  name: string;
  type: PaymentType;
  svgIcon: string;
  hidePercentage?: boolean;
  icon?: string;

  constructor(
    name: string,
    type: PaymentType,
    svgIcon: string,
    icon?: string,
    hidePercentage: boolean = false,
  ) {
    this.name = name;
    this.type = type;
    this.svgIcon = svgIcon;
    this.icon = icon;
    this.hidePercentage = hidePercentage;
  }
}

export const getPaymentOptions = (
  translate: TranslateService,
  types?: PaymentType[],
  hidePercentage: boolean = false,
): IPaymentOption[] => types?.map((it: any) => {
  const name = translate.instant(`COMMON.PAYMENT.TYPE.${it}`);
  let svgIcon = '';
  let icon;
  switch (it) {
    case PaymentType.ideal:
      svgIcon = 'IDEAL';
      break;
    case PaymentType.paypal:
      svgIcon = 'PAYPAL';
      break;
    case PaymentType.mollie:
      svgIcon = 'MOLLIE';
      break;
    case PaymentType.paynl:
      svgIcon = 'PAY_NL';
      break;
    case PaymentType.cash:
      icon = 'universal_currency';
      break;
    case PaymentType.transfer:
      icon = 'send_money';
      break;
  }

  return new PaymentOption(name, it, svgIcon, icon, hidePercentage);
}) || [];

export const filterPaymentOptions = (
  options?: IPaymentOption[],
  allowedTypes?: PaymentType[],
): IPaymentOption[] => {
  if (!options?.length) {
    return [];
  }
  if (!allowedTypes?.length) {
    return options;
  }

  return options
    .filter(option => allowedTypes.includes(option.type));
};

export const accountCredit = (name: string): IPaymentOption[] => [
  {
    type: PaymentType.account,
    name,
    icon: 'account_balance',
    hidePercentage: true,
    svgIcon: 'account_balance',
  },
];

export enum PaymentPercentage {
  deposit_50 = 'DEPOSIT_50',
  total = 'TOTAL'
}

export const paymentOptions = (): IPaymentType[] => [{
  name: PaymentType.cash,
  disabled: true,
  checked: true,
  deprecated: false,
}, {
  name: PaymentType.ml,
  disabled: false,
  checked: false,
  deprecated: true,
}, {
  name: PaymentType.paypal,
  disabled: false,
  checked: false,
  deprecated: true,
}, {
  name: PaymentType.ideal,
  disabled: false,
  checked: false,
  deprecated: true,
}, {
  name: PaymentType.paynl,
  disabled: false,
  checked: false,
  deprecated: true,
}, {
  name: PaymentType.mollie,
  disabled: false,
  checked: false,
  deprecated: false,
}];

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
  paymentType: PaymentType;
  amount: number;
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
  type: PaymentType;
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
