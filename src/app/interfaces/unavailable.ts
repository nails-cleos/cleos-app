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
  duration?: string;
  startDate?: Date;
  startTime?: string;
}

export interface IUnavailableAll {
  id: string;
  description?: string;
  start: string;
  duration: string;
  professional: IUser;
  repeat: string;
}

export class Unavailable implements IUnavailable {
  constructor() {
  }
}
