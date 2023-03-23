import { IUser } from './user';
import { ICurrency, ICurrencyAll } from './currency';
import { IProduct } from './product';
import { IAdditional } from './additional';
import { IOffice } from './office';

export interface IRoom {
  id?: string;
  professionalIds?: string[];
  professionals?: IUser[];
  currencyId?: string;
  currency?: ICurrency;
  officeId?: string;
  office?: IOffice;
  timeZone?: string;
  availabilities?: IAvailability[];
  address?: IAddress;
  paymentTypes?: string[];
}

export interface IRoomService {
  currency: ICurrency;
  products: IProduct[];
  selectedProducts: IProduct[];
  additionalList: IAdditional[];
  selectedAdditionalList: IAdditional[];
}

export interface IRoomInfo {
  currencies: ICurrency[];
  professionals: IUser[];
  offices: IOffice[];
}

export interface IServicePrice {
  keyId: string;
  value: number;
  type: ServiceType;
}

export interface IService {
  key: string;
  id: string;
  name: string;
  currency?: string;
  price: number;
  type: ServiceType;
}

export enum ServiceType {
  product = 'PRODUCT',
  additional = 'ADDITIONAL'
}

export interface IRoomAll {
  id: string;
  professionalIds?: string[];
  professionals?: IUser[];
  availabilities: IAvailability[];
  address: IAddress;
  currency: ICurrencyAll;
  office: IOffice;
  timeZone: string;
  paymentTypes: string[];
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

export class ServicePrice implements IServicePrice {
  keyId: string;
  type: ServiceType;
  value: number;

  constructor(keyId: string, value: number, type: ServiceType) {
    this.keyId = keyId;
    this.value = value;
    this.type = type;
  }
}
