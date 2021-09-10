import { IUser, IUserAll } from './user';
import { IProduct, IProductAll } from './product';
import { IRoom, IRoomAll } from './room';
import { CalendarEvent } from 'angular-calendar';
import { ThemePalette } from '@angular/material/core';
import { IUnavailableAll } from './unavailable';
import { Pagination } from './pagination';
import { IPayment, IPaymentAll } from './payment';
import { IReview } from './review';

export interface IReservation {
  id?: string;
  customerId?: string;
  customer?: IUser;
  productId?: string;
  discountId?: string;
  product?: IProduct;
  roomId?: string;
  room?: IRoom;
  start?: string;
  state?: string;
  review?: IReview;
}

export interface IReservationAll {
  id: string;
  customer: IUserAll;
  product: IProductAll;
  room: IRoomAll;
  start: string;
  state: string;
  review?: IReview;
  history?: IReservationAll[];
}

export interface IPaymentReservation {
  reservation: IReservationAll;
  payments: IPaymentAll[];
}

export interface IRoomReservation {
  room: IRoomAll;
  reservations: IReservationAll[];
  unavailableList: IUnavailableAll[];
}

export interface ICustomerReservation {
  reservations: Pagination<IReservationAll>;
  upcoming: IReservationAll;
  currentReservationPayments: IPayment[];
}

export interface IAvailableDTO {
  start: string;
}

export interface IDay {
  dayStartHour: number;
  dayStartMinute: number;
  dayEndHour: number;
  dayEndMinute: number;
  excludeDays: number[];
}

export interface ICalendar {
  room: IRoom;
  day?: IDay;
  events: CalendarEvent[];
}

export interface IReservationSummary {
  title: string;
  value?: number;
  increase?: boolean;
  color?: ThemePalette;
  percentValue?: number;
  icon?: string;
  currency?: boolean;
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
  link?: (reservationId: string | undefined) => void;
}

export interface ITracking {
  reservation: IReservationAll;
  createdTime?: string;
  editedTime?: string;
  approvedTime?: string;
  paidTime?: string;
  startedTime?: string;
  completedTime?: string;
  cancelledTime?: string;
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

  constructor(dayStartHour: number = 9, dayStartMinute: number = 0, dayEndHour: number = 18, dayEndMinute: number = 0,
              excludeDays: number[] = []) {
    this.dayStartHour = dayStartHour;
    this.dayStartMinute = dayStartMinute;
    this.dayEndHour = dayEndHour;
    this.dayEndMinute = dayEndMinute;
    this.excludeDays = excludeDays;
  }
}

export class Calendar implements ICalendar {

  events: CalendarEvent[];
  room: IRoom;
  day: any;

  constructor(room: IRoom, events: CalendarEvent[]) {
    this.events = events;
    this.room = room;
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
  cancelled = 'CANCELLED'
}

export type StatesKey = keyof typeof States;

export const MAX_RESERVATION_MONTH = 3;
