import { IUser, IUserAll } from './user';
import { FrequencyEnum } from '../util/helper';

export interface IUnavailable {
  id?: string;
  description?: string;
  professionalId?: string;
  professional?: IUser;
  repeat?: FrequencyEnum;
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
  type?: string;
}

export interface IUnavailableAll {
  id: string;
  description?: string;
  start: string;
  timestamp: number;
  end: string;
  endString?: string;
  duration: string;
  professional: IUserAll;
  repeat: FrequencyEnum;
  allDay: boolean;
  type?: string;
  startDate?: Date;
  timeZone?: string;
}

export class Unavailable implements IUnavailable {
  constructor() {
  }
}
