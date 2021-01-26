import { IUser } from './user';

export interface IRoom {
  id?: string;
  name?: string;
  professionalId?: string;
  professional?: IUser;
  description?: string;
  startDate?: Date;
  endDate?: Date;
  availability: IAvailability;
}

export interface IAvailability {
  start?: string;
  end?: string;
}

export class Availability implements IAvailability {
  constructor() {
  }
}

export class Room implements IRoom {
  availability: IAvailability;

  constructor() {
    this.availability = new Availability();
  }
}

export const PAGE_SIZE = 10;
