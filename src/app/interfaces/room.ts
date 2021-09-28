import { IUser } from './user';

export interface IRoom {
  id?: string;
  name?: string;
  professionalId?: string;
  professional?: IUser;
  availabilities: IAvailability[];
  address?: IAddress;
}

export interface IRoomAll {
  id: string;
  name: string;
  professional: IUser;
  availabilities: IAvailability[];
  address: IAddress;
}

export interface IAvailability {
  day: string;
  start?: string;
  end?: string;
  startLunch?: string;
  endLunch?: string;
}

export interface IAvailabilityAll {
  day: string;
  start: string;
  end: string;
  startLunch?: string;
  endLunch?: string;
}

export interface IAvailabilityDate {
  startDate?: Date;
  endDate?: Date;
  startLunchDate?: Date;
  endLunchDate?: Date;
}

export interface IAddress {
  name: string;
  description?: string;
  location: ILocation;
}

export interface ILocation {
  x: number;
  y: number;
}

export class Availability implements IAvailability {
  day = '';
  constructor() {
  }
}

export class AvailabilityDate implements IAvailabilityDate {
  constructor() {
  }
}

export class Room implements IRoom {
  availabilities: IAvailability[];

  constructor() {
    this.availabilities = [];
  }
}
