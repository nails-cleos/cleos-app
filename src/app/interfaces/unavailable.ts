import { IUser } from './user';

export enum UnavailableRepeatType {
  none = 'NONE',
  onceAWeek = 'ONCE_A_WEEK',
  everyDay = 'EVERY_DAY'
}

export interface IUnavailable {
  id?: string;
  description?: string;
  professionalId?: string;
  professional?: IUser;
  repeat?: string;
  start?: string;
  end?: string;
  duration?: string;
  startDate?: Date;
  endDate?: Date;
  startTime?: string;
  allDay?: boolean;
  timeZone?: string;
}

export interface IUnavailableAll {
  id: string;
  description?: string;
  start: string;
  timestamp: number;
  end: string;
  duration: string;
  professional: IUser;
  repeat: string;
  allDay: boolean;
}

export class Unavailable implements IUnavailable {
  constructor() {
  }
}
