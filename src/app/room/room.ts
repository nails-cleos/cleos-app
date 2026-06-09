import { IUser, IUserAll } from '../user/user';
import { ICurrency, ICurrencyAll } from '../currency/currency';
import { ITreatmentAll } from '../treatment/treatment';
import { IAdditionalAll } from '../additional/additional';
import { IOffice, IOfficeAll } from '../office/office';
import { AvailabilityForm, RoomForm } from './room-form.types';
import { createDate, createNewDate, getTimeNumber, API_LOCALE } from '../util/dates';
import { createAddress, areEquals } from '../util/helper';
import { isString } from '../interfaces/common';
import { valueChange } from '../util/validators';

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
  paymentTypes: string[];
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

export class Availability {
  static fromForm(
    availabilityForm: AvailabilityForm,
    day: string,
    checked: boolean,
  ): IAvailability {
    return {
      day,
      start: availabilityForm.start.value,
      end: availabilityForm.end.value,
      ...(checked && {
        startLunch: availabilityForm.startLunch.value,
        endLunch: availabilityForm.endLunch.value,
      }),
    };
  }
}

export class AvailabilityDate {
  static fromAvailability(
    availability: IAvailability,
    timeZone?: string,
  ): IAvailabilityDate {
    return {
      startDate: this.createDateFromAvailability(availability.start, timeZone),
      endDate: this.createDateFromAvailability(availability.end, timeZone),
      startLunchDate: this.createDateFromAvailability(availability.startLunch, timeZone),
      endLunchDate: this.createDateFromAvailability(availability.endLunch, timeZone),
    };
  }

  private static createDateFromAvailability(
    date?: string,
    timeZone?: string,
  ): Date | undefined {
    if (!date) {
      return undefined;
    }

    const time = getTimeNumber(date);
    return createDate(timeZone, time?.hour, time?.minute);
  }
}

export class Room {
  static fromForm(
    roomForm: RoomForm,
    primary: boolean,
    selectedProfessionals: IUserAll[],
    paymentTypes: string[],
    availabilities: IAvailability[],
    currentProfessionalIds: string[],
    currentAvailabilities: IAvailability[],
    currentRoom?: IRoomAll,
    formattedAddress?: string,
    location?: google.maps.LatLng,
  ): IRoom {
    const room: IRoom = {
      officeId: valueChange(roomForm.office.value, currentRoom?.office)?.id,
      currencyId: valueChange(roomForm.currency.value, currentRoom?.currency)?.id,
      timeZone: roomForm.timeZone.value?.tzCode,
      primary,
      address: createAddress(
        formattedAddress,
        location,
        currentRoom?.address,
        roomForm.addressForm.controls.addressDescription.value,
      ),
      ...(roomForm.closeDate.value && {
        closeDateString: createNewDate(roomForm.closeDate.value).toLocaleString(API_LOCALE),
      }),
    };

    const newProfessionalIds = selectedProfessionals.map(({ id }) => id).filter(isString);
    if (!areEquals(newProfessionalIds, currentProfessionalIds)) {
      room.professionalIds = newProfessionalIds;
    }

    if (paymentTypes !== currentRoom?.paymentTypes) {
      room.paymentTypes = paymentTypes;
    }

    if (!areEquals(availabilities, currentAvailabilities)) {
      room.availabilities = availabilities;
    }

    return room;
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
