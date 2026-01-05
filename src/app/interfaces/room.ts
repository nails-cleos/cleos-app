import { IUser, IUserAll } from './user';
import { ICurrency, ICurrencyAll } from './currency';
import { ITreatmentAll } from './treatment';
import { IAdditionalAll } from './additional';
import { IOffice, IOfficeAll } from './office';
import { PaymentType } from './payment';

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
  primary?: boolean;
  closeDate?: string | Date;
  closeDateString?: string;
}

export interface IRoomService {
  currency: ICurrencyAll;
  treatments: ITreatmentAll[];
  selectedTreatments: ITreatmentAll[];
  additionalList: IAdditionalAll[];
  selectedAdditionalList: IAdditionalAll[];
}

export interface IRoomInfo {
  currencies: ICurrencyAll[];
  professionals: IUserAll[];
  offices: IOfficeAll[];
}

export interface IServicePrice {
  keyId: string;
  value: number;
  type: ServiceType;
}

export interface IService {
  duration: string;
  key: string;
  groupId?: string;
  id: string;
  name: string;
  currency?: string;
  price: number;
  type: ServiceType;
  description?: string;
  hour?: number;
  minute?: number;

  order?: number;
}

export enum ServiceType {
  treatment = 'TREATMENT',
  additional = 'ADDITIONAL'
}

export interface IRoomAll {
  id: string;
  professionalIds?: string[];
  professionals?: IUserAll[];
  availabilities: IAvailability[];
  address: IAddress;
  currency: ICurrencyAll;
  office: IOfficeAll;
  timeZone: string;
  paymentTypes: PaymentType[];
  primary: boolean;
  closeDate?: string | Date;
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
  id: number;
  name: string;
  description?: string;
  location: ILocation;
}

export interface ILocation {
  x: number;
  y: number;
}

export interface IRoomCustomer {
  customerId?: string,
  customerName?: string,
  reservationId?: string,
  days?: number,
  lastTime?: number
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
  constructor() {
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
