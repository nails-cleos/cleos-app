import { DiscountType, IDiscount } from '../interfaces/discount';
import { IAuthority, IUser, IUserAll } from '../interfaces/user';
import { GroupService, IGroupService, IPrice, ITreatmentAll, Price } from '../interfaces/treatment';
import { IPayment, IPaymentOption } from '../interfaces/payment';
import { IReservationAll } from '../interfaces/reservation';
import { IAdditionalAll } from '../interfaces/additional';
import { TranslateService } from '@ngx-translate/core';
import { IAddress, ILocation, IRoom, IRoomAll, ServiceType } from '../interfaces/room';
import { IOffice } from '../interfaces/office';
import { ICurrency, ICurrencyAll } from '../interfaces/currency';
import { getTime, getTimeZone, localeTimeZoneDate } from './dates';
import { DialogComponent } from '../shared/dialog/generic/dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { isSameDay } from 'date-fns';
import { Role } from '../interfaces/token';
import { CancelDialogComponent } from '../shared/dialog/cancel/cancel-dialog.component';
import { Router } from '@angular/router';
import { CustomerEditDialogComponent } from '../shared/dialog/customer-edit/customer-edit-dialog.component';

export const VERIFICATION_EMAIL = 'verification_email';
export const hasRoomAdmin = (authorities?: IAuthority[]): boolean => !!authorities && authorities.length === 1 &&
  authorities.some(u => (u.authority === Role.roomAdmin));

export const snakeToCamel = (value: string = ''): string =>
  value.toLowerCase().replace(/([-_]\w)/g, (g: string) => g[1].toUpperCase());

export const getDisplayNameInitials = (user: IUserAll | undefined): string | undefined => {
  if (!user) {
    return undefined;
  }
  const names = user.displayName?.split(' ');

  return names?.length ? names.reduce((p, c) => p + c.charAt(0), '') : undefined;
};

export const getUserImage = (user: IUser | IUserAll | undefined): string | undefined => {
  let image;
  if (user && user.imageUrl) {
    if (user.imageUrl.indexOf('http') >= 0) {
      image = user.imageUrl;
    } else if (user.image) {
      image = `data:image/jpeg;base64,${ user.image }`;
    }
  }

  return image;
};

export interface ILocale {
  language: string;
  flag: string;
  i18n: string;
}

export class Locale implements ILocale {
  language: string;
  flag: string;
  i18n: string;

  constructor(language: string = 'en-NL', flag: string = 'en_NL', i18n: string = 'en') {
    this.language = language;
    this.flag = flag;
    this.i18n = i18n;
  }
}

export const getLocale = (userLang?: string | null): ILocale => {
  let locale = 'en-NL';
  let flag;
  const lang = userLang?.replace('_', '-');
  if (lang?.startsWith('es')) {
    locale = 'es';
    flag = locale;
  } else if (lang?.startsWith('en')) {
    locale = 'en-GB';
    flag = 'en-GB';
    // } else if (userLang?.startsWith('nl')) {
    //   locale = 'nl';
    //   flag = 'nl';
  }

  const match = locale?.match(/([-_])/);
  const i18n = !match ? locale : locale.substring(0, match.index);

  return new Locale(locale, flag?.replace('-', '_'), i18n);
};

export const round = (value: number): number => Math.round((value + Number.EPSILON) * 100) / 100;

export const getPrice = (reservation: IReservationAll, payments?: IPayment[]): IPrice => {
  const treatment = reservation.treatment;
  let total = treatment.price;
  let priceWithDiscount;
  let priceWithExtras = treatment.price;
  let priceWithAdditional = treatment.price;
  let discount;
  let extras;
  let additional;
  if (reservation.extras && reservation.extras.length) {
    extras = reservation.extras.map(a => a.price).reduce((p, c) => p + c);
    total += extras;
    priceWithExtras += extras;
  }

  if (reservation.additional && reservation.additional.length) {
    additional = reservation.additional.map(a => a.price).reduce((p, c) => p + c);
    total += additional;
    priceWithAdditional += additional;
  }

  const totalWithoutDiscount = total;
  if (treatment.discountCustomer) {
    discount = getDiscount(treatment.discountCustomer, total);
    priceWithDiscount = treatment.price - discount;
    total = total - discount;
  }

  return new Price(treatment.price, discount, extras, additional, total, totalPaid(payments), totalWithoutDiscount, priceWithDiscount,
    priceWithExtras, priceWithAdditional, 100, reservation.balance);
};

export const addPayment = (price: IPrice, payments?: IPayment[]): IPrice => price.withTotalPaid(totalPaid(payments));

export const newPrice = (price: IPrice, amount: number, discount?: IDiscount): IPrice => {
  let total = amount;
  let priceWithDiscount = price.priceWithDiscount;
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

  const priceDiscount = discount ? getDiscount(discount, total) : price.discount;

  const totalWithoutDiscount = total;
  if (priceDiscount) {
    priceWithDiscount = amount - priceDiscount;
    total = total - priceDiscount;
  }

  return new Price(amount, priceDiscount, extras, additional, total, price.totalPaid, totalWithoutDiscount, priceWithDiscount,
    priceWithExtras, priceWithAdditional, price.percentageToPaid, price.balance);
};

export const newExtra = (price: IPrice, extras: number, discount?: IDiscount): IPrice => {
  let total = price.amount + extras + price.additional;
  let priceWithDiscount = price.priceWithDiscount;
  const priceWithExtras = price.amount + extras;

  const priceDiscount = discount ? getDiscount(discount, total) : price.discount;

  const totalWithoutDiscount = total;
  if (priceDiscount) {
    priceWithDiscount = price.amount - priceDiscount;
    total = total - priceDiscount;
  }

  return new Price(price.amount, priceDiscount, extras, price.additional, total, price.totalPaid, totalWithoutDiscount,
    priceWithDiscount, priceWithExtras, price.priceWithAdditional, price.percentageToPaid, price.balance);
};

export const removeDiscount = (price: IPrice): IPrice => {
  const total = price.amount + price.extra + price.additional;
  return new Price(price.amount, 0, price.extra, price.additional, total, price.totalPaid, total, 0, price.priceWithExtras,
    price.priceWithAdditional, price.percentageToPaid, price.balance);
};

export const newDiscount = (price: IPrice, treatmentDiscount: IDiscount): IPrice => {
  const discount = getDiscount(treatmentDiscount, price.amount);
  const totalWithoutDiscount = price.amount + price.extra + price.additional;
  const priceWithDiscount = price.amount - discount;
  const total = totalWithoutDiscount - discount;

  return new Price(price.amount, discount, price.extra, price.additional, total, price.totalPaid, totalWithoutDiscount, priceWithDiscount,
    price.priceWithExtras, price.priceWithAdditional, price.percentageToPaid, price.balance);
};

export const newAdditional = (price: IPrice, additionalList: IAdditionalAll[], discount?: IDiscount): IPrice => {
  let total = price.amount + price.extra;
  let additional;
  let priceWithDiscount = price.priceWithDiscount;
  let priceWithAdditional = price.amount; // Added after
  if (additionalList && additionalList.length) {
    additional = additionalList.map(a => a.price).reduce((p, c) => p + c);
    total += additional;
    priceWithAdditional += additional;
  }

  const totalWithoutDiscount = total;
  const priceDiscount = discount ? getDiscount(discount, total) : price.discount;
  if (priceDiscount) {
    priceWithDiscount = price.amount - priceDiscount;
    total = total - priceDiscount;
  }

  return new Price(price.amount, priceDiscount, price.extra, additional, total, price.totalPaid, totalWithoutDiscount, priceWithDiscount,
    price.priceWithExtras, priceWithAdditional, price.percentageToPaid, price.balance);
};

export const newPercentage = (price: IPrice, percentage: number): IPrice => new Price(price.amount, price.discount, price.extra,
  price.additional, price.total, price.totalPaid, price.totalWithoutDiscount, price.priceWithDiscount, price.priceWithExtras,
  price.priceWithAdditional, percentage, price.balance);

export const createTreatmentGroupService = (groups: Map<string, GroupService>, list: ITreatmentAll[], currency: string,
                                            isSelected: boolean = false): Map<string, GroupService> => {
  list.forEach((treatment: ITreatmentAll) => {
    const groupId = treatment.group.id;
    const mapGroup = groups.get(groupId);
    const keyGroup: IGroupService = mapGroup ? mapGroup : new GroupService(groupId, treatment.group.name, treatment.group.colors);

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

export const currencySymbol = (currency?: ICurrency | string): string => {
  if (!currency) {
    return '';
  }
  if (typeof currency !== 'string') {
    if (currency.icon) {
      switch (currency.icon) {
        case 'euro':
          return '€';
        case 'currency_pound':
          return '£';
        default:
          return '$';
      }
    } else {
      currency = currency.code;
    }
  }

  switch (currency) {
    case 'EUR':
    case 'euro':
      return '€';
    case 'GBP':
    case 'currency_pound':
      return '£';
    default:
      return '$';
  }
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

export const totalPaid = (payments: IPayment[] | undefined): number => payments?.filter(
  (p: IPayment) => p.status && ['APPROVED', 'APPROVED_REFUND', 'REFUND_FAILURE', 'REFUND'].includes(p.status))?.map((p: IPayment) =>
  p.transactionAmount).reduce((acc: number, value: number | undefined) => acc + (value ? value : 0), 0) || 0;

export const areEquals = (array1: any[], array2: any[]): boolean => (array1.length === array2.length &&
  array1.every((element1) => array2.some((element2) =>
      Object.keys(element1).every((key) => element1[key] === element2[key])
    )
  )
);

export const allElementsHaveSameKeyFilterValue = (map: Map<any, any>, filter: string[]): boolean => {
  let firstValue: string | undefined;

  for (const [key] of map.entries()) {
    let keyFilter;
    for (const field of filter) {
      if (!keyFilter) {
        keyFilter = key[field];
      } else {
        keyFilter = keyFilter[field];
      }
    }
    if (!firstValue) {
      firstValue = keyFilter;
    } else if (keyFilter !== firstValue) {
      return false;
    }
  }

  return true;
};

export const titleCase = (text: string) => text.split(' ').map((l: string) => l[0].toUpperCase() + l.substring(1)).join(' ');
export const openCancel = (dialog: MatDialog, room: IRoomAll, small: boolean, options: string[], afterClose: (result: any) => void,
                           showPenalty?: boolean, price?: IPrice, paymentOptions?: IPaymentOption[]): void => {
  const currency = room.currency;
  const data = {
    small,
    options,
    price,
    paymentOptions,
    currency,
    showPenalty
  };

  executeDialog(dialog, CancelDialogComponent, data, afterClose, true);
};

export const customerEditDialog = (dialog: MatDialog, router: Router, reservationId: string, currency: ICurrencyAll, small: boolean,
                                   language: string, price?: IPrice): void => {
  const data = {
    small,
    price,
    currency
  };
  executeDialog(dialog, CustomerEditDialogComponent, data, result => {
    if (result) {
      router.navigate([language, 'me', 'reservation', reservationId]);
    }
  }, true);
};

export const executeDialogNoWidth = (dialog: MatDialog, dialogComponent: any, data: any, afterClose: (result: any) => void,
                                     disableClose: boolean = false): void => {
  const dialogRef = dialog.open(dialogComponent, {
    disableClose,
    data
  });

  dialogRef.afterClosed().subscribe(afterClose);
};
export const executeDialog = (dialog: MatDialog, dialogComponent: any, data: any, afterClose: (result: any) => void,
                              disableClose: boolean = false): void => {
  const dialogRef = dialog.open(dialogComponent, {
    width: '70vw',
    disableClose,
    data
  });

  dialogRef.afterClosed().subscribe(afterClose);
};

const getDiscount = (discount: IDiscount, price: number): number => {
  let value = 0;
  if (discount?.amount) {
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

export const isMobile = (): boolean => {
  const regex = /Mobi|Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i;
  return regex.test(navigator.userAgent);
};

export const isIPhone = (): boolean => (/iPad|iPhone|iPod/.test(navigator.userAgent))
  || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);

export enum FrequencyEnum {
  none = 'NONE',
  everyDay = 'EVERY_DAY',
  onceAWeek = 'ONCE_A_WEEK',
  onceAMonth = 'ONCE_A_MONTH',
  onceAYear = 'ONCE_A_YEAR',
}

export const createAddress = (formattedAddress?: string, location?: google.maps.LatLng,
                              address?: IAddress, description?: string): IAddress | undefined => {
  if (location || address) {
    return {
      id: address?.id,
      name: formattedAddress || address?.name,
      description: description || address?.description,
      location: {
        x: location?.lng() || address?.location?.x,
        y: location?.lat() || address?.location?.y
      } as ILocation
    } as IAddress;
  }
  return undefined;
};
