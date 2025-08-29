import { IReservationAll } from './reservation';
import { TranslateService } from '@ngx-translate/core';
import { ITransaction } from './account';

export const PENALTY = 50;

export interface IPaymentType {
  name: string;
  disabled: boolean;
  checked: boolean;
}

export enum PaymentType {
  cash = 'CASH',
  ml = 'ML',
  paypal = 'PAYPAL',
  ideal = 'IDEAL',
  transfer = 'TRANSFER',
  paynl = 'PAY_NL',
  account = 'ACCOUNT'
}

export type PaymentTypeKey = keyof typeof PaymentType;

export interface IPaymentOption {
  name: string;
  subTypes: IPaymentOption[];
  svgIcon: string;
  type: PaymentType;
  bic?: string;
  hidePercentage?: boolean;
  icon?: string;
}

export class PaymentOption implements IPaymentOption {
  name: string;
  subTypes: IPaymentOption[];
  type: PaymentType;
  bic?: string;
  svgIcon: string;
  hidePercentage?: boolean;
  icon?: string;

  constructor(name: string, type: PaymentType, svgIcon: string, icon?: string, bic?: string,
    subTypes?: IPaymentOption[], hidePercentage: boolean = false) {
    this.name = name;
    this.type = type;
    this.svgIcon = svgIcon;
    this.icon = icon;
    this.bic = bic;
    this.subTypes = subTypes || [];
    this.hidePercentage = hidePercentage;
  }
}

export const getPaymentOptions = (
  translate: TranslateService,
  types?: PaymentType[],
): IPaymentOption[] => types?.map((it: any) => {
  let subTypes: IPaymentOption[] = [];
  if (it === PaymentType.ideal) {
    subTypes = iDealBanks();
  }
  const name = translate.instant(`COMMON.PAYMENT.TYPE.${ it }`);
  let svgIcon = '';
  switch (it) {
    case PaymentType.ideal:
      svgIcon = '/payment_methods/1.svg';
      break;
    case PaymentType.paypal:
      svgIcon = '/payment_methods/21.svg';
      break;
  }

  return new PaymentOption(name, it, svgIcon, undefined, undefined, subTypes);
}) || [];

export const getPayNlOptions = (
  options?: IPaymentOption[],
): PaymentOption[] => options?.map((it: any) => new PaymentOption(
  it.name, PaymentType.paynl, it.image, it.image, it.id,
  it.paymentOptionSubList?.map((sub: any) => new PaymentOption(sub.name, PaymentType.paynl, sub.image,
    sub.image, sub.id, []))),
) || [];

export const iDealBanks = (): IPaymentOption[] => [
  { subTypes: [], type: PaymentType.ideal, name: 'ABN AMRO', bic: 'ABNANL2A', svgIcon: '/issuers/1.svg' },
  { subTypes: [], type: PaymentType.ideal, name: 'Rabobank', bic: 'RABONL2U', svgIcon: '/issuers/2.svg' },
  { subTypes: [], type: PaymentType.ideal, name: 'ING Bank', bic: 'INGBNL2A', svgIcon: '/issuers/4.svg' },
  { subTypes: [], type: PaymentType.ideal, name: 'SNS Bank', bic: 'SNSBNL2A', svgIcon: '/issuers/5.svg' },
  { subTypes: [], type: PaymentType.ideal, name: 'ASN', bic: 'ASNBNL21', svgIcon: '/issuers/8.svg' },
  { subTypes: [], type: PaymentType.ideal, name: 'Regio Bank', bic: 'RBRBNL21', svgIcon: '/issuers/9.svg' },
  { subTypes: [], type: PaymentType.ideal, name: 'Triodos Bank', bic: 'TRIONL2U', svgIcon: '/issuers/10.svg' },
  { subTypes: [], type: PaymentType.ideal, name: 'Van Lanschot Bankiers', bic: 'FVLBNL22', svgIcon: '/issuers/11.svg' },
  { subTypes: [], type: PaymentType.ideal, name: 'Knab', bic: 'KNABNL2H', svgIcon: '/issuers/12.svg' },
  { subTypes: [], type: PaymentType.ideal, name: 'Bunq', bic: 'BUNQNL2A', svgIcon: '/issuers/5080.svg' },
  { subTypes: [], type: PaymentType.ideal, name: 'Moneyou', bic: 'MOYONL21', svgIcon: 'MOYONL21' },
];

export const accountCredit = (name: string): IPaymentOption[] => [
  {
    subTypes: [],
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
}, {
  name: PaymentType.ml,
  disabled: false,
  checked: false,
}, {
  name: PaymentType.paypal,
  disabled: false,
  checked: false,
}, {
  name: PaymentType.ideal,
  disabled: false,
  checked: false,
}, {
  name: PaymentType.paynl,
  disabled: false,
  checked: false,
}];

export interface IPaymentStatus {
  paymentId: string;
  paymentType: string;
  preferenceId: string;
  reason?: string;
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
}

export interface IPaymentAll {
  id: string;
  description: string;
  amount: number;
  transactionAmount?: number;
  status: string;
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
