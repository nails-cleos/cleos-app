import { DiscountType, IDiscount } from '../interfaces/discount';
import { IAuthority, IUser, IUserAll } from '../interfaces/user';
import { GroupService, IGroupService, IPrice, ITreatmentAll, ITreatmentGroup, Price } from '../interfaces/treatment';
import { IPayment } from '../interfaces/payment';
import { IReservationAll } from '../interfaces/reservation';
import { IAdditionalAll } from '../interfaces/additional';
import { TranslateService } from '@ngx-translate/core';
import { IRoom, IRoomAll, ServiceType } from '../interfaces/room';
import { IOffice } from '../interfaces/office';
import { ICurrency } from '../interfaces/currency';
import { IStep } from '../interfaces/step';
import { getTime, getTimeZone, localeTimeZoneDate } from './dates';
import { DialogComponent } from '../shared/dialog/dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { isSameDay } from 'date-fns';
import { Role } from '../interfaces/token';
import { TreatmentService } from "../services/treatment.service";

export const isRoomAdmin = (authorities?: IAuthority[]): boolean => !!authorities && authorities.length === 1 &&
  authorities.some(u => (u.authority === Role.roomAdmin));

export const snakeToCamel = (value: string = ''): string =>
  value.toLowerCase().replace(/([-_]\w)/g, (g: string) => g[1].toUpperCase());

export const getUserName = (user?: IUserAll | IUser): string => {
  if (!user) {
    return '';
  }
  let names: string[] = [];
  if (user.firstName) {
    names = [...names, user.firstName];
  }
  if (user.lastName) {
    names = [...names, user.lastName];
  }

  if (!names || !names.length) {
    return user.username ? user.username : '';
  }

  return names.join(' ');
};

export const getFullUserName = (user: IUserAll | IUser): string => {
  let names: string[] = [];
  if (user.firstName) {
    names = [...names, user.firstName];
  }
  if (user.lastName) {
    names = [...names, user.lastName];
  }

  if (user.username && (!names || !names.length)) {
    names = [user.username];
  }

  names = [...names, `(${ user.email })`];
  return names.join(' ');
};

export const getUserNameInitials = (user: IUserAll | undefined): string | undefined => {
  if (!user) {
    return undefined;
  }
  let names: string[] = [];
  if (user.firstName) {
    names = [...names, user.firstName];
  }
  if (user.lastName) {
    names = [...names, user.lastName];
  }

  if (!names || !names.length) {
    names = [...names, user.username];
  }

  let name = '';
  names.forEach(n => name = name + n.charAt(0));

  return name;
};

export const getUserImage = (user: IUser | IUserAll | undefined): string | undefined => {
  let image;
  if (user && user.imageUrl) {
    if (user.imageUrl.indexOf('http') >= 0) {
      image = user.imageUrl;
    } else if (user.image) {
      image = `data:image/jpg;base64,${ user.image }`;
    }
  }

  return image;
};

export const getLocale = (userLang: string): string => {
  const index = userLang.indexOf('_');
  return index === -1 ? userLang : userLang.substr(0, index);
};

export const round = (value: number): number => Math.round((value + Number.EPSILON) * 100) / 100;

export const getPrice = (reservation: IReservationAll, payments?: IPayment[] | undefined): IPrice => {
  const treatment = reservation.treatment;
  let total = treatment.price;
  let priceWithDiscount;
  let priceWithExtras = treatment.price;
  let priceWithAdditional = treatment.price;
  let discount;
  let extras;
  let additional;
  if (treatment.extras && treatment.extras.price) {
    extras = treatment.extras.price;
    total += extras;
    priceWithExtras += extras;
  }

  if (reservation.additional && reservation.additional.length) {
    additional = reservation.additional.map(a => a.price).reduce((p, c) => p + c);
    total += additional;
    priceWithAdditional += additional;
  }

  if (treatment.discount) {
    discount = getDiscount(treatment.discount, treatment.price);
    priceWithDiscount = treatment.price - discount;
    total = total - discount;
  }

  return new Price(treatment.price, discount, extras, additional, total, totalPaid(payments), priceWithDiscount,
    priceWithExtras, priceWithAdditional);
};

export const newPrice = (price: IPrice, amount: number): IPrice => {
  let total = amount;
  let priceWithDiscount;
  const discount = price.discount;
  const extras = price.extra;
  const additional = price.additional;
  const priceWithExtras = amount + extras;
  const priceWithAdditional = amount + additional;
  if (extras) {
    total += extras;
  }

  if (additional) {
    total += additional;
  }

  if (discount) {
    priceWithDiscount = amount - discount;
    total = total - discount;
  }

  return new Price(amount, discount, extras, additional, total, price.totalPaid, priceWithDiscount, priceWithExtras,
    priceWithAdditional);
};

export const newExtra = (price: IPrice, extras: number): IPrice => {
  const total = price.amount - price.discount + extras + price.additional;
  const priceWithExtras = price.amount + extras;

  return new Price(price.amount, price.discount, extras, price.additional, total, price.totalPaid,
    price.priceWithDiscount, priceWithExtras, price.priceWithAdditional);
};

export const newDiscount = (price: IPrice, treatmentDiscount: IDiscount): IPrice => {
  const discount = getDiscount(treatmentDiscount, price.amount);
  const total = price.amount - discount + price.extra + price.additional;
  const priceWithDiscount = price.amount - discount;

  return new Price(price.amount, discount, price.extra, price.additional, total, price.totalPaid, priceWithDiscount,
    price.priceWithExtras, price.priceWithAdditional);
};

export const newAdditional = (price: IPrice, additionalList: IAdditionalAll[]): IPrice => {
  let total = price.amount - price.discount + price.extra;
  let priceWithAdditional = price.amount;
  let additional;
  if (additionalList && additionalList.length) {
    additional = additionalList.map(a => a.price).reduce((p, c) => p + c);
    total += additional;
    priceWithAdditional += additional;
  }

  return new Price(price.amount, price.discount, price.extra, additional, total, price.totalPaid,
    price.priceWithDiscount, price.priceWithExtras, priceWithAdditional);
};

export const newPercentage = (price: IPrice, percentage: number): IPrice => {
  const toPaid = price.total * percentage / 100;

  return new Price(price.amount, price.discount, price.extra, price.additional, price.total, price.totalPaid,
    price.priceWithDiscount, price.priceWithExtras, price.priceWithAdditional, toPaid)
}

export const getTreatmentDurability = (min: number, max: number, translate: TranslateService): string | undefined => {
  if (!min && !max) {
    return undefined;
  }
  if (min !== max) {
    return translate.instant('COMMON.TREATMENT.DURABILITY.TITLE.DIFFERENT', { min, max });
  }
  return translate.instant('COMMON.TREATMENT.DURABILITY.TITLE.EQUAL', { value: min });
};

export const groupDurability = (group: ITreatmentGroup, translate: TranslateService): string => {
  const min = group.durabilityMin;
  const max = group.durabilityMax;
  let key = 'COMMON.TREATMENT.DURABILITY.EQUAL';
  if (!min && !max) {
    key = 'COMMON.TREATMENT.DURABILITY.NONE';
  } else if (min !== max) {
    key = 'COMMON.TREATMENT.DURABILITY.DIFFERENT';
  }

  return translate.instant(key, { min, max });
};

export const createTreatmentGroupService = (groups: Map<string, GroupService>, list: ITreatmentAll[], currency: string,
                                            isSelected: boolean = false): Map<string, GroupService> => {
  list.forEach((treatment: ITreatmentAll) => {
    const groupId = treatment.group.id;
    const mapGroup = groups.get(groupId);
    const keyGroup: IGroupService = mapGroup ? mapGroup : new GroupService(groupId, treatment.group.name);

    treatment = Object.assign({}, treatment, { currency, type: ServiceType.treatment });

    if (isSelected) {
      keyGroup.selectedTreatments = [...keyGroup.selectedTreatments, treatment];
    } else {
      keyGroup.treatments = [...keyGroup.treatments, treatment];
    }
    groups.set(groupId, keyGroup);
  });

  return groups;
};

export const createRoomOffice = (rooms: IRoom[] | undefined): Map<string, IOffice> | undefined =>
  rooms?.reduce((oMap: Map<string, IOffice>, room: IRoom) => {
    const officeId = room.office?.id;
    if (officeId) {
      let of = oMap.get(officeId);
      if (of && of.rooms) {
        of.rooms = [...of.rooms, room];
      } else if (room.office) {
        of = Object.assign({}, room.office, { rooms: [room] });
      } else {
        return oMap;
      }
      oMap.set(officeId, of);
    }
    return oMap;
  }, new Map<string, IOffice>());

export const roomName = (room: IRoom | IRoomAll): string => {
  const gmt = roomGMT(room);
  const currency = roomCurrency(room);
  return room.currency && room.office ?
    `${ room.office.name } - ${ currency }${ gmt }` : '';
};

export const roomDetail = (room: IRoom | IRoomAll): string => {
  const gmt = roomGMT(room);
  const currency = roomCurrency(room);
  return `${ currency }${ gmt }`;
};

export const roomCurrency = (room: IRoom | IRoomAll): string =>
  room.currency ? `${ room.currency.code } (${ currencySymbol(room.currency) })` : '';

export const roomGMT = (room: IRoom | IRoomAll): string => {
  const tz = getTimeZone(room.timeZone);
  return tz.gmt ? ` - (${ tz.gmt })` : '';
};

export const currencySymbol = (currency: ICurrency): string => {
  switch (currency.icon) {
    case 'euro':
      return '€';
    case 'currency_pound':
      return '£';
    default:
      return '$';
  }
};

export const getStep = (steps: IStep[], index: number): IStep | undefined => steps.find(s => s.order === index);

export const getBackIndex = (steps: IStep[], current: number): number => {
  let index = -1;
  for (const step of steps.slice(0, current).reverse()) {
    if (step.enable) {
      index = step.order;
      break;
    }
  }
  return index;
};

export const openDialog = (myRoom: IRoomAll, locale: string, translate: TranslateService,
                           dialog: MatDialog, time?: Date): void => {
  const room = roomName(myRoom);
  createDialog('ROOM_INFO', room, locale, translate, dialog, myRoom.timeZone, time);
};

export const createDialog = (key: string, value: string, locale: string, translate: TranslateService,
                             dialog: MatDialog, timeZone?: string, time?: Date): void => {
  const localDate = new Date(localeTimeZoneDate('en-US', time));
  const date = new Date(localeTimeZoneDate('en-US', time, timeZone));

  const localTime = getTime(localDate, locale);
  const timeZoneTime = getTime(date, locale);
  let arg = '';

  if (!isSameDay(localDate, date)) {
    if (localDate.getTime() > date.getTime()) {
      arg = ' <b><sup class="warning">-1D</sup></b>';
    } else {
      arg = ' <b><sup class="success">+1D</sup></b>';
    }
  }

  const title = translate.instant('COMMON.TIME_ZONE.TITLE');
  const content = translate.instant(`COMMON.TIME_ZONE.${ key }`, { localTime, timeZoneTime, value, arg });
  dialog.open(DialogComponent, {
    data: { title, content, hideNoButton: true, hideOkButton: true }
  });
};

export const isProfessional = (id: string, professionals?: IUser[]): boolean =>
  professionals ? professionals?.some(professional => professional.id === id) : false;

const totalPaid = (payments: IPayment[] | undefined): number => {
  let total = 0;
  payments?.forEach(payment => {
    if (payment.status === 'APPROVED' && payment.amount) {
      total += payment.amount;
    }
  });

  return total;
};

export const areEquals = (array1: any[], array2: any[]): boolean => (array1.length === array2.length &&
  array1.every((element_1) => array2.some((element_2) =>
      Object.keys(element_1).every((key) => element_1[key] === element_2[key])
    )
  )
);

const getDiscount = (discount: IDiscount, price: number): number => {
  let value = 0;
  if (discount.amount) {
    switch (discount.type) {
      case DiscountType.money: {
        value = discount.amount;
        break;
      }
      case DiscountType.percentage: {
        value = (price * discount.amount / 100);
      }
    }
  }
  return value;
};
