import { IUser } from './user';

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

export const PAGE_SIZE = 10;
