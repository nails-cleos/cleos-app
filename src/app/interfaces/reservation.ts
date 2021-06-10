import { IUser, IUserAll } from './user';
import { IProduct, IProductAll } from './product';
import { IRoom, IRoomAll } from './room';
import { CalendarEvent } from 'angular-calendar';
import { ThemePalette } from '@angular/material/core';
import { IUnavailableAll } from './unavailable';
import { Pagination } from './pagination';

export interface IReservation {
  id?: string;
  customerId?: string;
  customer?: IUser;
  productId?: string;
  product?: IProduct;
  roomId?: string;
  room?: IRoom;
  start?: string;
  state?: string;
}

export interface IReservationAll {
  id: string;
  customer: IUserAll;
  product: IProductAll;
  room: IRoomAll;
  start: string;
  state: string;
  history?: IReservationAll[];
}

export interface IRoomReservation {
  room: IRoomAll;
  reservations: IReservationAll[];
  unavailableList: IUnavailableAll[];
}

export interface ICustomerReservation {
  reservations: Pagination<IReservationAll[]>;
  upcoming: IReservationAll;
}

export interface IAvailableDTO {
  start: string;
}

export interface IDay {
  dayStartHour: number;
  dayStartMinute: number;
  dayEndHour: number;
  dayEndMinute: number;
}

export interface ICalendar {
  room: IRoom;
  day?: IDay;
  events: CalendarEvent[];
}

export interface IReservationSummary {
  title: string;
  value?: number;
  isIncrease?: boolean;
  color?: ThemePalette;
  percentValue?: number;
  icon?: string;
  isCurrency?: boolean;
  error?: any;
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

  constructor(dayStartHour: number = 9, dayStartMinute: number = 0, dayEndHour: number = 18, dayEndMinute: number = 0) {
    this.dayStartHour = dayStartHour;
    this.dayStartMinute = dayStartMinute;
    this.dayEndHour = dayEndHour;
    this.dayEndMinute = dayEndMinute;
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

export const PAGE_SIZE = 10;
export const MOBILE_PAGE_SIZE = 5;
