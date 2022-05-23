import { IUser, IUserAll } from './user';
import { IPrice, IProduct, IProductAll } from './product';
import { IRoom, IRoomAll } from './room';
import { CalendarEvent } from 'angular-calendar';
import { ThemePalette } from '@angular/material/core';
import { IUnavailableAll } from './unavailable';
import { Pagination } from './pagination';
import { IPayment } from './payment';
import { IReview } from './review';
import { IAdditionalAll } from './additional';
import { addHours, isSameDay } from 'date-fns';
import { createNewDate, getNow } from '../util/dates';

export interface IReservation {
  id?: string;
  customerId?: string;
  customer?: IUser;
  productId?: string;
  discountId?: string;
  additionalIds?: string[];
  product?: IProduct;
  roomId?: string;
  room?: IRoom;
  start?: string;
  timestamp?: number;
  timeZone?: string;
  state?: string;
  review?: IReview;
  canCustomerChange?: boolean;
  reference?: string;
}

export interface IReservationAll {
  id: string;
  customer: IUserAll;
  product: IProductAll;
  room: IRoomAll;
  start: Date;
  timestamp: number;
  state: string;
  review?: IReview;
  history?: IReservationAll[];
  additional?: IAdditionalAll[];
  configuration?: IConfigurationReservation;
}

export interface IConfigurationReservation {
  canCustomerChange: boolean;
  reference: string;
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
}

export interface ICustomerReservation {
  reservations: Pagination<IReservationAll>;
  upcoming: IUpcomingAll[];
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
  room: IRoomAll;
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
  link?: (reservationId?: string) => void;
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

export interface ICustomerLastReservation {
  product: IProductAll;
  days: number;
  professionalName: string;
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

  constructor(startDate: Date = createNewDate(getNow(), 9), endDate: Date = createNewDate(getNow(), 18),
              today: Date = getNow(), excludeDays: number[] = []) {
    const startView = addHours(startDate, -1);
    const endView = addHours(endDate, 1);
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

export class Calendar implements ICalendar {

  events: CalendarEvent[];
  room: IRoomAll;
  day: any;

  constructor(room: IRoomAll, events: CalendarEvent[]) {
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
