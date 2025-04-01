import { IUser, IUserAll } from './user';
import { IPrice, ITreatment, ITreatmentAll } from './treatment';
import { IRoom, IRoomAll } from './room';
import { CalendarEvent } from 'angular-calendar';
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
  color?: 'primary' | 'accent' | 'warn' | 'blue' | 'gray'; // To add a new color need to create a new theme class for .mat-{colorName}
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
}

export interface ICustomerReservation {
  reservations: Pagination<IReservationAll>;
  upcoming: IUpcomingAll[];
  isFirstTime: boolean;
  phone?: string;
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
}

export interface IDataEvent {
  calendarEvents: CalendarEvent[];
  unavailableEventLength: number;
  index: number;
  viewDate: Date;
  process: boolean;
  room: IRoomAll;
  day?: IDay;

  addEvents(events: CalendarEvent[]): void;

  addEvent(event?: CalendarEvent): void;

  removeEvent(event: CalendarEvent, deleteCount?: number): void;

  filterEvent(event: CalendarEvent): void;

  updateLength(length: number): void;

  getOverlapEvent(eventStartDay: Date, eventEndDay: Date, professionalId?: string): CalendarEvent[]

  sameDayEvent(recurring: any, event: CalendarEvent): boolean;

  addClass(currentEvent: CalendarEvent, cssClass: string): void;
}

export class DataEvent implements IDataEvent {
  calendarEvents: CalendarEvent[];
  unavailableEventLength: number;
  index: number;
  viewDate: Date;
  process: boolean;
  room: IRoomAll;
  day?: IDay;

  constructor(events: CalendarEvent[], index: number, viewDate: Date, unavailableEventLength: number,
              room: IRoomAll, process: boolean = false, day?: IDay) {
    this.calendarEvents = events;
    this.unavailableEventLength = unavailableEventLength;
    this.index = index;
    this.viewDate = viewDate;
    this.room = room;
    this.process = process;
    this.day = day;
  }

  addEvents = (events: CalendarEvent[]): void => {
    events.forEach(event => this.addEvent(event));
  };

  addEvent = (event?: CalendarEvent): void => {
    if (event) {
      if (event.id === undefined || !this.calendarEvents.some(e => e.id === event.id))
        this.calendarEvents = [...this.calendarEvents, event];
    }
  };

  removeEvent = (event: CalendarEvent, deleteCount: number = 1): void => {
    const i = this.calendarEvents.indexOf(event);
    if (i === -1) {
      return;
    }
    this.calendarEvents = this.calendarEvents.slice(i, deleteCount);
  };

  filterEvent = (event: CalendarEvent): void => {
    this.calendarEvents = this.calendarEvents.filter(ev => ev !== event);
  };

  updateLength = (length: number): void => {
    this.unavailableEventLength = length;
  };

  getOverlapEvent = (
    eventStartDay: Date,
    eventEndDay: Date,
    professionalId?: string
  ): CalendarEvent[] => {
    const events = [...this.calendarEvents];
    if (professionalId) {
      return events.filter((eventA: CalendarEvent) => ((eventA.meta?.professionalId === professionalId) && (
        (eventStartDay > eventA.start && eventA.end && eventStartDay < eventA.end)
        || (eventEndDay > eventA.start && eventA.end && eventEndDay < eventA.end)
        || (eventStartDay <= eventA.start && eventA.end && eventEndDay >= eventA.end)
      )));
    }
    return events.filter(
      (eventA: CalendarEvent) => (eventStartDay > eventA.start && eventA.end && eventStartDay < eventA.end)
        || (eventEndDay > eventA.start && eventA.end && eventEndDay < eventA.end)
        || (eventStartDay <= eventA.start && eventA.end && eventEndDay >= eventA.end)
    );
  };

  sameDayEvent = (recurring: any, event: CalendarEvent): boolean => !this.calendarEvents
    .find(ce => ce.id === recurring.path && isSameDay(event.start, ce.start));

  addClass(currentEvent: CalendarEvent, cssClass: string): void {
    this.calendarEvents = this.calendarEvents.map(event => ({
      ...event,
      cssClass: event.id === currentEvent.id ? cssClass : ''
    }));
  }
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

  constructor(startDate: Date = createNewDate(getNowTimeZone(), 9), endDate: Date = createNewDate(getNowTimeZone(), 18),
              today: Date = getNowTimeZone(), excludeDays: number[] = [], plusHour: number = 0) {
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
  discount = 'DISCOUNT',
  chargeWithDiscount = 'CHARGE_WITH_DISCOUNT',
  chargeWithRefund = 'CHARGE_WITH_REFUND',
  charge = 'CHARGE',
  none = 'NONE'
}

export type StatesKey = keyof typeof States;

export const MAX_RESERVATION_MONTH = 12;
export const MAX_RESERVATION_CUSTOMER_MONTH = 2;
