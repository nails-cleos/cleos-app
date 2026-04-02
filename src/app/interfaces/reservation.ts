import { IUser, IUserAll } from './user';
import { IPrice, ITreatment, ITreatmentAll } from './treatment';
import { IRoom, IRoomAll } from './room';
import { ThemePalette } from '@angular/material/core';
import { IUnavailableAll } from './unavailable';
import { Pagination } from './pagination';
import { IPayment, PaymentPercentage, PaymentType } from './payment';
import { IReview } from './review';
import { IAdditionalAll } from './additional';
import { addHours, isSameDay } from 'date-fns';
import { createNewDate, getNowTimeZone } from '../util/dates';
import { INoteAll } from './note';

export interface IFabMenu {
  tooltip: string;
  icon: string;
  id: string;
  // To add a new color need to create a new theme class for .mat-{colorName}
  color?: 'primary' | 'accent' | 'warn' | 'blue' | 'gray';
}

export interface IExtras {
  price: number;
  description?: string;
  paymentType?: PaymentType;
  name?: string; // To make compatible with additional in price-extra
}

export interface IReservation {
  id?: string;
  customerId?: string;
  customer?: IUser;
  treatmentId?: string;
  discountId?: string;
  additionalIds?: string[];
  treatment?: ITreatment;
  roomId?: string;
  room?: IRoom;
  professionalId?: string;
  professional?: IUser;
  start?: string;
  moreStart?: string[];
  timestamp?: number;
  timeZone?: string;
  state?: string;
  review?: IReview;
  canCustomerChange?: boolean;
  reference?: string;
  note?: string;
  phone?: string | null;

  payment?: IReservationPayment;
  startedTimestamp?: number;
  paymentLink?: string;
}

export interface IReservationPayment {
  type: PaymentType;
  percentage: PaymentPercentage;
  bic?: string;
  paymentOptionId?: string;
  name?: string;
  countryCode?: string;
  amount?: number;
  transfer?: string;
}

export interface IReservationAll {
  id: string;
  customer: IUserAll;
  treatment: ITreatmentAll;
  room: IRoomAll;
  professional: IUserAll;
  start: Date;
  timestamp: number;
  state: string;
  review?: IReview;
  history?: IReservationAll[];
  additional?: IAdditionalAll[];
  extras?: IExtras[];
  configurationCanCustomerChange?: boolean;
  configurationReference?: string;
  note?: string;
  customerNote?: string;
  startedTimestamp?: number;
  paymentLink?: string;
  canEdit?: boolean;
  paymentRequired?: boolean;
  relatedReservationId?: string;
  balance?: number;
  showNotification?: boolean;
}

export interface IUpcomingAll extends IReservationAll {
  payments: IPayment[];
  price: IPrice;
  end: Date;
  rowSpan: number;
}

export interface IRoomReservation {
  room: IRoomAll;
  reservations: IReservationAll[];
  unavailableList: IUnavailableAll[];
  birthdays: IUserAll[];
  notes: INoteAll[];
  date: string;
}

export interface ICustomerReservation {
  reservations: Pagination<IReservationAll>;
  upcoming: IUpcomingAll[];
  isFirstTime: boolean;
  phone?: string;
  balance?: number;
}

export interface IAvailableDTO {
  dateTime: number;
}

export interface IDay {
  dayStartHour: number;
  dayStartMinute: number;
  dayEndHour: number;
  dayEndMinute: number;
  excludeDays: number[];
}

export interface IReservationSummary {
  title: string;
  value?: number | string;
  previousPeriodValue?: number | string;
  isIncrease?: boolean;
  isInfinity?: boolean;
  isProjection?: boolean;
  color?: ThemePalette;
  percentValue?: number;
  icon?: string;
  period?: string;
  previousPeriod?: string;
  isCurrency?: boolean;
  error?: any;
}

export interface IReservationOverview {
  title: string;
  primaryValue?: number | string;
  primaryId?: string;
  secondaryValue?: number | string;
  secondaryId?: string;
  color?: ThemePalette;
  icon?: string;
  split?: boolean;
  error?: any;
  link?: (reservationId?: string) => void;
}

export interface ITracking {
  reservation: IReservationAll;
  createdTimestamp?: number;
  editedTimestamp?: number;
  approvedTimestamp?: number;
  paidTimestamp?: number;
  startedTimestamp?: number;
  completedTimestamp?: number;
  cancelledTimestamp?: number;
  process?: boolean;
}

export interface ICustomerLastReservation {
  treatment: ITreatmentAll;
  days: number;
  professionalName: string;
  additionalIds: string[];
  roomId: string;
  professionalId: string;
}

export class Reservation implements IReservation {
  constructor() {
  }
}

export class Day implements IDay {
  dayStartHour: number;
  dayStartMinute: number;
  dayEndHour: number;
  dayEndMinute: number;
  excludeDays: number[];

  constructor(
    startDate: Date = createNewDate(getNowTimeZone(), 9),
    endDate: Date = createNewDate(getNowTimeZone(), 18),
    today: Date = getNowTimeZone(),
    excludeDays: number[] = [],
    plusHour: number = 0,
  ) {
    const startView = addHours(startDate, -plusHour);
    const endView = addHours(endDate, plusHour);
    this.dayStartHour = startView.getHours();
    this.dayStartMinute = startView.getMinutes();
    this.dayEndHour = endView.getHours();
    this.dayEndMinute = endView.getMinutes();
    if (!isSameDay(startView, endView)) {
      if (isSameDay(today, startView)) {
        this.dayEndHour = 23;
        this.dayEndMinute = 45;
      } else if (isSameDay(today, endView)) {
        this.dayStartHour = 0;
        this.dayStartMinute = 15;
      }
    }

    this.excludeDays = excludeDays;
  }
}

export enum States {
  created = 'CREATED',
  approved = 'APPROVED',
  partiallyPaid = 'PARTIALLY_PAID',
  paid = 'PAID',
  started = 'STARTED',
  completed = 'COMPLETED',
  partiallyCompleted = 'PARTIALLY_COMPLETED',
  cancelled = 'CANCELLED',
  cancelledPaymentRequired = 'CANCELLED_PAYMENT_REQUIRED'
}

export enum CancelOption {
  refund = 'REFUND',
  account = 'ACCOUNT',
  chargeAndAccount = 'CHARGE_AND_ACCOUNT',
  chargeAndRefund = 'CHARGE_AND_REFUND',
  none = 'NONE'
}

export const MAX_RESERVATION_MONTH = 12;
export const MAX_RESERVATION_CUSTOMER_MONTH = 2;
