import { IUser, IUserAll } from './user';

export interface IUnavailable {
  id?: string;
  description?: string;
  professionalId?: string;
  professional?: IUser;
  repeat?: string;
  start?: string;
  end?: string;
  endString?: string;
  duration?: string;
  time?: string;
  startDate?: Date;
  endDate?: Date;
  startTime?: string | Date;
  allDay?: boolean;
  timeZone?: string;
  timestamp?: number;
}

export interface IUnavailableAll {
  id: string;
  description?: string;
  start: string;
  timestamp: number;
  end: string;
  duration: string;
  professional: IUserAll;
  repeat: string;
  allDay: boolean;
  type?: string;
}

export class Unavailable implements IUnavailable {
  constructor() {
  }
}
