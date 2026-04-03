import {
  allElementsHaveSameKeyFilterValue, areEquals,
  createDialog,
  createRoomOffice,
  createTreatmentGroupService,
  currencySymbol,
  getDisplayNameInitials,
  getLocale,
  getPrice,
  getUserImage,
  hasRoomAdmin, isProfessional,
  newAdditional,
  newDiscount,
  newExtra,
  newPercentage,
  newPrice,
  openDialog,
  removeDiscount,
  roomDetail,
  round,
  snakeToCamel,
} from './helper';
import { Role } from '../interfaces/token';
import { IUser, IUserAll } from '../interfaces/user';
import { IAddress, IRoomAll, ServiceType } from '../interfaces/room';
import { ICurrency, ICurrencyAll } from '../interfaces/currency';
import { GroupService, IPrice, ITreatmentAll, Price } from '../interfaces/treatment';
import { IExtras, IReservationAll } from '../interfaces/reservation';
import { getCurrentTimeZone } from './dates';
import { IPayment, PaymentType } from '../interfaces/payment';
import { DiscountType, IDiscount } from '../interfaces/discount';
import { IAdditionalAll } from '../interfaces/additional';
import { MatDialog } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import { DialogComponent } from '../shared/dialog/generic/dialog.component';
import { IOffice } from '../interfaces/office';
import { IColorAll } from '../interfaces/color';

describe('Helper Utils', () => {
  const userAll: IUserAll = {
    id: 'user-123',
    displayName: 'John Doe',
    email: 'john@example.com',
    locale: 'en-US',
    timeZone: 'UTC',
    authorities: [
      { authority: Role.professional },
    ],
    theme: 'light-theme',
    showCash: true,
    referralMax: 10,
    imageUrl: 'http://example.com/image.jpg',
  };
  const user: IUser = {
    id: 'user-123',
    image: 'test',
    imageUrl: 'test',
  };

  const room: IRoomAll = {
    id: 'room-id',
    availabilities: [{ day: 'MONDAY', start: '09:00', end: '17:00' }],
    address: {
      id: 1,
      name: 'Main Location',
      location: { x: 0, y: 0 },
    },
    currency: {
      id: 'currency-id',
      code: 'EUR',
      icon: 'euro',
      name: 'Euro',
    },
    office: {
      id: 'office-id',
      name: 'office-name',
      manager: {
        id: 'manager-id',
      },
    },
    timeZone: getCurrentTimeZone(),
    paymentTypes: [PaymentType.transfer],
    primary: true,
  };

  describe('hasRoomAdmin', () => {
    it('should return true if user has room admin role', () => {
      expect(hasRoomAdmin([{ authority: Role.roomAdmin }])).toBeTrue();
    });

    it('should return false if user does not have room admin role', () => {
      expect(hasRoomAdmin([{ authority: Role.admin }])).toBeFalse();
    });
  });

  describe('snakeToCamel', () => {
    it('should convert snake_case to camelCase', () => {
      expect(snakeToCamel('snake_case')).toEqual('snakeCase');
    });
  });

  describe('getDisplayNameInitials', () => {
    it('should return initials for single name', () => {
      expect(getDisplayNameInitials(userAll)).toEqual('JD');
    });

    it('should return undefined when user does not exist', () => {
      expect(getDisplayNameInitials()).toBeUndefined();
    });

    it('should return undefined when user does not have displayName', () => {
      expect(getDisplayNameInitials(user)).toBeUndefined();
    });
  });

  describe('getUserImage', () => {
    it('should return imageUrl if available', () => {
      expect(getUserImage(userAll)).toEqual(userAll.imageUrl);
    });

    it('should return image if imageUrl is not available', () => {
      expect(getUserImage(user)).toEqual(`data:image/jpeg;base64,${user.image}`);
    });

    it('should return undefined when user doesnt exist', () => {
      expect(getUserImage()).toBeUndefined();
    });

    it('should return undefined when user has no image or imageUrl', () => {
      expect(getUserImage({} as IUser)).toBeUndefined();
    });
  });

  describe('getLocale', () => {
    it('should return locale object for valid locale string', () => {
      const locale = getLocale('es-AR');
      expect(locale.language).toEqual('es');
      expect(locale.flag).toEqual('es');
      expect(locale.i18n).toEqual('es');
    });

    it('should return default locale object for invalid locale string', () => {
      const locale = getLocale('invalid-locale');
      expect(locale.language).toEqual('en-GB');
      expect(locale.flag).toEqual('en_GB');
      expect(locale.i18n).toEqual('en');
    });

    it('should return default locale object for invalid locale string', () => {
      const locale = getLocale('en-US');
      expect(locale.language).toEqual('en-GB');
      expect(locale.flag).toEqual('en_GB');
      expect(locale.i18n).toEqual('en');
    });

    it('should return dutch locale object for nl values', () => {
      const locale = getLocale('nl');
      expect(locale.language).toEqual('nl');
      expect(locale.flag).toEqual('nl');
      expect(locale.i18n).toEqual('nl');
    });

    it('should return dutch locale object for nl values', () => {
      const locale = getLocale('nl-NL');
      expect(locale.language).toEqual('nl');
      expect(locale.flag).toEqual('nl');
      expect(locale.i18n).toEqual('nl');
    });

    it('should return default locale object when no locale string is provided', () => {
      const locale = getLocale();
      expect(locale.language).toEqual('en-GB');
      expect(locale.flag).toEqual('en_GB');
      expect(locale.i18n).toEqual('en');
    });

    it('should return default locale object when locale is null', () => {
      const locale = getLocale(null);
      expect(locale.language).toEqual('en-GB');
      expect(locale.flag).toEqual('en_GB');
      expect(locale.i18n).toEqual('en');
    });
  });

  describe('round', () => {
    it('should round to two decimal places by default', () => {
      expect(round(2.3456)).toEqual(2.35);
    });
  });

  describe('getPrice', () => {
    let customer: IUserAll;
    let address: IAddress;
    let currency: ICurrencyAll;
    let room: IRoomAll;
    let treatment: ITreatmentAll;
    let reservation: IReservationAll;

    beforeEach(() => {
      customer = {
        id: 'customer-id',
        displayName: 'John Doe',
        email: 'user@test.com',
        authorities: [{ authority: 'ROLE_CUSTOMER' }],
        locale: 'en',
        timeZone: 'UTC',
      } as IUserAll;

      address = { id: 1, name: 'Main Location' } as IAddress;
      currency = { id: 'currency-id', code: 'EUR', icon: 'EUR', name: 'Euro' } as ICurrencyAll;

      room = {
        id: 'room-id',
        availabilities: [{ day: 'MONDAY', start: '09:00', end: '17:00' }],
        address,
        currency,
        office: {},
        timeZone: getCurrentTimeZone(),
        paymentTypes: ['CASH'],
        primary: true,
      } as IRoomAll;

      treatment = {
        duration: 'PT1H',
        price: 20,
      } as ITreatmentAll;

      reservation = {
        id: 'reservation-id',
        customer,
        timestamp: Date.now(),
        room,
        treatment,
        start: new Date(),
        balance: 0,
      } as IReservationAll;
    });

    it('should return correct price with no extras, additional, or discount', () => {
      const result = getPrice(reservation);

      expect(result).toBeInstanceOf(Price);
      expect(result.total).toBe(20);
      expect(result.discount).toBe(0);
      expect(result.extra).toBe(0);
      expect(result.additional).toBe(0);
      expect(result.totalWithoutDiscount).toBe(20);
    });

    it('should calculate total including extras', () => {
      reservation.extras = [{ price: 5 }, { price: 10 }] as any;

      const result = getPrice(reservation);

      expect(result.total).toBe(35); // 20 + 5 + 10
      expect(result.priceWithExtras).toBe(35);
      expect(result.extra).toBe(15);
    });

    it('should calculate total including additional', () => {
      reservation.additional = [{ price: 3 }, { price: 7 }] as any;

      const result = getPrice(reservation);

      expect(result.total).toBe(30); // 20 + 3 + 7
      expect(result.priceWithAdditional).toBe(30);
      expect(result.additional).toBe(10);
    });

    it('should apply percentage discount correctly (10%)', () => {
      reservation.treatment.discountCustomer = { type: DiscountType.money, amount: 2 } as IDiscount;

      const result = getPrice(reservation);

      expect(result.discount).toBeCloseTo(2, 1); // 10% de 20
      expect(result.total).toBeCloseTo(18, 1);
      expect(result.priceWithDiscount).toBeCloseTo(18, 1);
    });

    it('should include extras, additional, and discount together', () => {
      reservation.extras = [{ price: 5 }] as IExtras[];
      reservation.additional = [{ price: 10 }] as IAdditionalAll[];
      reservation.treatment.discountCustomer = { type: DiscountType.percentage, amount: 20 } as IDiscount;

      const payments: IPayment[] = [{ transactionAmount: 10, status: 'APPROVED' } as IPayment];

      const result = getPrice(reservation, payments);

      expect(result.totalWithoutDiscount).toBe(35);
      expect(result.discount).toBeCloseTo(7, 1);
      expect(result.total).toBeCloseTo(28, 1);
      expect(result.totalPaid).toBe(10);
      expect(result.extra).toBe(5);
      expect(result.additional).toBe(10);
    });
  });

  describe('currencySymbol', () => {
    it('should return empty string when no currency is provided', () => {
      expect(currencySymbol()).toBe('');
    });

    it('should return correct symbol for string currencies', () => {
      expect(currencySymbol('EUR')).toBe('€');
      expect(currencySymbol('euro')).toBe('€');
      expect(currencySymbol('GBP')).toBe('£');
      expect(currencySymbol('currency_pound')).toBe('£');
      expect(currencySymbol('USD')).toBe('$');
      expect(currencySymbol('anything_else')).toBe('$');
    });

    it('should return correct symbol for currency object with icon', () => {
      const euroCurrency = { icon: 'euro' } as ICurrency;
      const poundCurrency = { icon: 'currency_pound' } as ICurrency;
      const unknownCurrency = { icon: 'yen' } as ICurrency;

      expect(currencySymbol(euroCurrency)).toBe('€');
      expect(currencySymbol(poundCurrency)).toBe('£');
      expect(currencySymbol(unknownCurrency)).toBe('$');
    });

    it('should return correct symbol for currency object without icon but with code', () => {
      const euroCode = { code: 'EUR' } as ICurrency;
      const poundCode = { code: 'GBP' } as ICurrency;
      const dollarCode = { code: 'USD' } as ICurrency;

      expect(currencySymbol(euroCode)).toBe('€');
      expect(currencySymbol(poundCode)).toBe('£');
      expect(currencySymbol(dollarCode)).toBe('$');
    });
  });

  describe('openDialog & createDialog', () => {
    let dialog: jasmine.SpyObj<MatDialog>;
    let translate: jasmine.SpyObj<TranslateService>;
    let myRoom: IRoomAll;

    beforeEach(() => {
      dialog = jasmine.createSpyObj('MatDialog', ['open']);
      translate = jasmine.createSpyObj('TranslateService', ['instant']);
      translate.instant.and.callFake((key: string) => key);

      myRoom = {
        id: 'room-1',
        name: 'Main Room',
        timeZone: 'Europe/Amsterdam',
      } as unknown as IRoomAll;
    });

    it('openDialog should call createDialog and open dialog', () => {
      const time = new Date('2024-10-01T10:00:00Z');

      openDialog(myRoom, 'en', translate, dialog, time);

      expect(dialog.open).toHaveBeenCalledWith(DialogComponent, jasmine.any(Object));
      const dataArg = dialog.open.calls.mostRecent().args[1]?.data;

      expect(dataArg).toEqual(
        jasmine.objectContaining({
          hideNoButton: true,
          hideOkButton: true,
          title: 'COMMON.TIME_ZONE.TITLE',
        }),
      );
    });

    it('createDialog should open dialog with correct translation keys', () => {
      const time = new Date('2024-10-01T10:00:00Z');

      createDialog('ROOM_INFO', 'Main Room', 'en', translate, dialog, 'Europe/Amsterdam', time);

      expect(translate.instant).toHaveBeenCalledWith('COMMON.TIME_ZONE.TITLE');
      expect(translate.instant).toHaveBeenCalledWith(
        'COMMON.TIME_ZONE.ROOM_INFO',
        jasmine.objectContaining({
          localTime: jasmine.any(String),
          timeZoneTime: jasmine.any(String),
          value: 'Main Room',
          arg: jasmine.any(String),
        }),
      );

      expect(dialog.open).toHaveBeenCalledWith(DialogComponent, {
        data: jasmine.objectContaining({
          title: 'COMMON.TIME_ZONE.TITLE',
          content: 'COMMON.TIME_ZONE.ROOM_INFO',
          hideNoButton: true,
          hideOkButton: true,
        }),
      });
    });

    it('createDialog should add +1D when localDate is earlier', () => {
      translate.instant.and.callFake((key: string, params?: any) => {
        if (params?.arg) {
          expect(params.arg).toContain('+1D');
        }
        return key;
      });

      const now = new Date();
      const pastDate = new Date(now.getTime() - 86400000); // 1 día antes

      createDialog('ROOM_INFO', 'Test Room', 'en', translate, dialog, undefined, pastDate);

      expect(dialog.open).toHaveBeenCalled();
    });

    it('createDialog should add -1D when localDate is later', () => {
      translate.instant.and.callFake((key: string, params?: any) => {
        if (params?.arg) {
          expect(params.arg).toContain('-1D');
        }
        return key;
      });

      const now = new Date();
      const futureDate = new Date(now.getTime() + 86400000); // 1 día después

      createDialog('ROOM_INFO', 'Test Room', 'en', translate, dialog, undefined, futureDate);

      expect(dialog.open).toHaveBeenCalled();
    });
  });

  describe('Price', () => {
    let basePrice: IPrice;
    let additionalList: IAdditionalAll[];

    beforeEach(() => {
      basePrice = new Price(100, 0, 10, 5, 115, 0, 115, 100, 110, 105, 100, 0);
      additionalList = [
        { id: 1, name: 'Extra Cleaning', price: 10 } as any,
        { id: 2, name: 'Consultation Fee', price: 15 } as any,
      ];
    });

    it('should create a new Price instance', () => {
      const result = newPrice(basePrice, 100);
      expect(result instanceof Price).toBeTrue();
    });

    it('should correctly calculate totals without discount', () => {
      const result = newPrice(basePrice, 100);
      // amount = 100, extras = 10, additional = 5
      expect(result.total).toBe(115);
      expect(result.priceWithExtras).toBe(110);
      expect(result.priceWithAdditional).toBe(105);
      expect(result.discount).toBe(basePrice.discount);
    });

    it('should apply fixed discount (money type)', () => {
      const discount: IDiscount = { type: DiscountType.money, amount: 20 } as any;
      const result = newPrice(basePrice, 100, discount);

      // base total = 115; discount = 20
      expect(result.discount).toBe(20);
      expect(result.total).toBe(95);
      expect(result.priceWithDiscount).toBe(80); // amount - discount
    });

    it('should apply percentage discount', () => {
      const discount: IDiscount = { type: DiscountType.percentage, amount: 10 } as any;
      const result = newPrice(basePrice, 100, discount);

      // base total = 115; discount = 11.5 (10%)
      expect(result.discount).toBeCloseTo(11.5, 2);
      expect(result.total).toBeCloseTo(103.5, 2);
      expect(result.priceWithDiscount).toBeCloseTo(88.5, 2); // amount - discount
    });

    it('should handle no extras/additional gracefully', () => {
      const price = new Price(100, 0, 0, 0, 100, 0, 100, 100, 100, 100, 100, 0);
      const result = newPrice(price, 100);

      expect(result.total).toBe(100);
      expect(result.priceWithExtras).toBe(100);
      expect(result.priceWithAdditional).toBe(100);
    });

    it('should keep same discount when none provided', () => {
      const price = new Price(100, 15, 0, 0, 100, 0, 100, 85, 100, 100, 100, 0);
      const result = newPrice(price, 100);
      expect(result.discount).toBe(15);
      expect(result.priceWithDiscount).toBe(85);
    });

    it('should return a Price instance', () => {
      const result = newExtra(basePrice, 20);
      expect(result instanceof Price).toBeTrue();
    });

    it('should correctly calculate total with new extras', () => {
      const result = newExtra(basePrice, 20);
      // amount = 100, extras = 20, additional = 5
      expect(result.extra).toBe(20);
      expect(result.total).toBe(125);
      expect(result.priceWithExtras).toBe(120);
      expect(result.priceWithAdditional).toBe(basePrice.priceWithAdditional);
    });

    it('should apply fixed (money) discount', () => {
      const discount: IDiscount = { type: DiscountType.money, amount: 15 } as any;
      const result = newExtra(basePrice, 20, discount);

      // total before discount = 100 + 20 + 5 = 125
      // total after discount = 125 - 15 = 110
      expect(result.discount).toBe(15);
      expect(result.total).toBe(110);
      expect(result.priceWithDiscount).toBe(85); // amount - discount
    });

    it('should apply percentage discount', () => {
      const discount: IDiscount = { type: DiscountType.percentage, amount: 10 } as any;
      const result = newExtra(basePrice, 20, discount);

      // total before discount = 125, discount = 12.5
      expect(result.discount).toBeCloseTo(12.5, 2);
      expect(result.total).toBeCloseTo(112.5, 2);
      expect(result.priceWithDiscount).toBeCloseTo(87.5, 2);
    });

    it('should handle when no discount is provided', () => {
      const result = newExtra(basePrice, 20);
      expect(result.discount).toBe(basePrice.discount);
      expect(result.total).toBe(125);
      expect(result.priceWithDiscount).toBe(basePrice.priceWithDiscount);
    });

    it('should handle when extras are zero', () => {
      const result = newExtra(basePrice, 0);
      expect(result.extra).toBe(0);
      expect(result.total).toBe(basePrice.amount + basePrice.additional);
    });

    it('should not apply discount if amount is 0 in discount object', () => {
      const discount: IDiscount = { type: DiscountType.money, amount: 0 } as any;
      const result = newExtra(basePrice, 20, discount);
      expect(result.discount).toBe(0);
      expect(result.total).toBe(125); // unchanged
    });

    it('should remove the discount and recalculate total', () => {
      const result = removeDiscount(basePrice);
      // total = amount + extra + additional = 115
      expect(result.discount).toBe(0);
      expect(result.total).toBe(115);
      expect(result.totalWithoutDiscount).toBe(115);
      expect(result.priceWithDiscount).toBe(0);
    });

    it('should preserve extras, additional list, and balance', () => {
      const result = removeDiscount(basePrice);
      expect(result.extra).toBe(basePrice.extra);
      expect(result.additional).toBe(basePrice.additional);
      expect(result.balance).toBe(basePrice.balance);
    });

    it('should apply a fixed (money) discount', () => {
      const discount: IDiscount = { type: DiscountType.money, amount: 20 } as any;
      const result = newDiscount(basePrice, discount);

      // amount = 100, extras = 10, additional = 5
      // totalWithoutDiscount = 115
      // discount = 20
      // total = 95, priceWithDiscount = 80
      expect(result.discount).toBe(20);
      expect(result.total).toBe(95);
      expect(result.totalWithoutDiscount).toBe(115);
      expect(result.priceWithDiscount).toBe(80);
    });

    it('should apply a percentage discount', () => {
      const discount: IDiscount = { type: DiscountType.percentage, amount: 10 } as any;
      const result = newDiscount(basePrice, discount);

      // discount = 10% of 100 = 10
      expect(result.discount).toBe(10);
      expect(result.total).toBe(105); // 115 - 10
      expect(result.priceWithDiscount).toBe(90); // 100 - 10
    });

    it('should handle a 0 discount amount', () => {
      const discount: IDiscount = { type: DiscountType.money, amount: 0 } as any;
      const result = newDiscount(basePrice, discount);

      expect(result.discount).toBe(0);
      expect(result.total).toBe(115);
      expect(result.priceWithDiscount).toBe(100);
    });

    it('should preserve extras/additional values', () => {
      const discount: IDiscount = { type: DiscountType.money, amount: 10 } as any;
      const result = newDiscount(basePrice, discount);

      expect(result.extra).toBe(basePrice.extra);
      expect(result.additional).toBe(basePrice.additional);
    });

    it('should handle when extras and additional are 0', () => {
      const price = new Price(100, 0, 0, 0, 100, 0, 100, 100, 100, 100, 100, 0);
      const discount: IDiscount = { type: DiscountType.money, amount: 10 } as any;
      const result = newDiscount(price, discount);

      expect(result.total).toBe(90);
      expect(result.totalWithoutDiscount).toBe(100);
    });

    it('should return a Price instance', () => {
      const result = newAdditional(basePrice, additionalList);
      expect(result instanceof Price).toBeTrue();
    });

    it('should correctly sum additionals and update totals', () => {
      const result = newAdditional(basePrice, additionalList);
      // additionals = 10 + 15 = 25
      // total = amount + extra + additionals = 100 + 10 + 25 = 135
      expect(result.additional).toBe(25);
      expect(result.total).toBe(135);
      expect(result.totalWithoutDiscount).toBe(135);
      expect(result.priceWithAdditional).toBe(125); // amount + additional
    });

    it('should handle empty additionalList gracefully', () => {
      const result = newAdditional(basePrice, []);
      // total = amount + extra = 110
      expect(result.additional).toBe(0);
      expect(result.total).toBe(110);
      expect(result.totalWithoutDiscount).toBe(110);
    });

    it('should apply fixed (money) discount', () => {
      const discount: IDiscount = { type: DiscountType.money, amount: 20 } as any;
      const result = newAdditional(basePrice, additionalList, discount);

      // base total = 135; discount = 20
      expect(result.discount).toBe(20);
      expect(result.total).toBe(115);
      expect(result.priceWithDiscount).toBe(80); // amount - discount
    });

    it('should apply percentage discount', () => {
      const discount: IDiscount = { type: DiscountType.percentage, amount: 10 } as any;
      const result = newAdditional(basePrice, additionalList, discount);

      // total = 135; discount = 13.5
      expect(result.discount).toBeCloseTo(13.5, 2);
      expect(result.total).toBeCloseTo(121.5, 2);
      expect(result.priceWithDiscount).toBeCloseTo(86.5, 2);
    });

    it('should not apply discount if not provided', () => {
      const result = newAdditional(basePrice, additionalList);
      expect(result.discount).toBe(basePrice.discount);
      expect(result.total).toBe(135);
    });

    it('should handle 0-value additionals', () => {
      const result = newAdditional(basePrice, [{ id: 1, name: 'Free', price: 0 }] as any);
      expect(result.additional).toBe(0);
      expect(result.total).toBe(110); // amount + extra
    });

    it('should return a new Price instance', () => {
      const result = newPercentage(basePrice, 75);
      expect(result instanceof Price).toBeTrue();
    });

    it('should update only the percentageToPaid value', () => {
      const result = newPercentage(basePrice, 80);
      expect(result.percentageToPaid).toBe(80);

      // Ensure everything else is identical
      expect(result.amount).toBe(basePrice.amount);
      expect(result.discount).toBe(basePrice.discount);
      expect(result.extra).toBe(basePrice.extra);
      expect(result.additional).toBe(basePrice.additional);
      expect(result.total).toBe(basePrice.total);
      expect(result.totalPaid).toBe(basePrice.totalPaid);
      expect(result.totalWithoutDiscount).toBe(basePrice.totalWithoutDiscount);
      expect(result.priceWithDiscount).toBe(basePrice.priceWithDiscount);
      expect(result.priceWithExtras).toBe(basePrice.priceWithExtras);
      expect(result.priceWithAdditional).toBe(basePrice.priceWithAdditional);
      expect(result.balance).toBe(basePrice.balance);
    });

    it('should handle 0 percentage', () => {
      const result = newPercentage(basePrice, 0);
      expect(result.percentageToPaid).toBe(0);
    });

    it('should handle 100 percentage', () => {
      const result = newPercentage(basePrice, 100);
      expect(result.percentageToPaid).toBe(100);
    });
  });

  describe('roomDetail', () => {
    it('should get room detail', () => {
      const result = roomDetail(room);
      expect(result).toBe('EUR (€)');
    });

    it('should get room detail for ARG', () => {
      const roomArg: IRoomAll = {
        ...room,
        currency: { id: 'currency-id', code: 'ARS', icon: '$', name: 'Peso Argentino' },
        timeZone: 'America/Argentina/Cordoba',
      };
      const result = roomDetail(roomArg);
      expect(result).toBe('ARS ($) - (GMT-03:00)');
    });
  });

  describe('createRoomOffice', () => {
    const makeOffice = (id: string, name = 'Office'): IOffice => ({
      id,
      name,
    } as IOffice);

    const makeRoom = (id: string, office?: IOffice): IRoomAll => ({
      id,
      office,
    } as IRoomAll);

    it('should return undefined if rooms is undefined', () => {
      const result = createRoomOffice();
      expect(result).toBeUndefined();
    });

    it('should return an empty Map if rooms is an empty array', () => {
      const result = createRoomOffice([]);
      expect(result instanceof Map).toBeTrue();
      expect(result?.size).toBe(0);
    });

    it('should group rooms by office id', () => {
      const officeA = makeOffice('A', 'Office A');
      const officeB = makeOffice('B', 'Office B');
      const rooms: IRoomAll[] = [
        makeRoom('1', officeA),
        makeRoom('2', officeA),
        makeRoom('3', officeB),
      ];

      const result = createRoomOffice(rooms);

      expect(result).toBeDefined();
      expect(result?.size).toBe(2);

      const officeAGroup = result?.get('A');
      const officeBGroup = result?.get('B');

      expect(officeAGroup?.id).toBe('A');
      expect(officeAGroup?.rooms?.length).toBe(2);
      expect(officeAGroup?.rooms?.map(r => r.id)).toEqual(['1', '2']);

      expect(officeBGroup?.id).toBe('B');
      expect(officeBGroup?.rooms?.length).toBe(1);
      expect(officeBGroup?.rooms?.[0].id).toBe('3');
    });

    it('should ignore rooms without office or office id', () => {
      const rooms: IRoomAll[] = [
        makeRoom('1', makeOffice('A')),
        makeRoom('2', undefined), // no office
        makeRoom('3', { id: '', name: 'Invalid Office' } as IOffice), // no id
      ];

      const result = createRoomOffice(rooms);

      expect(result?.size).toBe(1);
      const office = result?.get('A');
      expect(office?.rooms?.length).toBe(1);
      expect(office?.rooms?.[0].id).toBe('1');
    });

    it('should add room to existing office entry', () => {
      const office = makeOffice('A');
      const rooms = [makeRoom('1', office), makeRoom('2', office)];
      const result = createRoomOffice(rooms);

      expect(result?.get('A')?.rooms?.length).toBe(2);
    });
  });

  describe('createTreatmentGroupService', () => {
    let groups: Map<string, GroupService>;
    let treatments: ITreatmentAll[];

    const makeColor = (id: string, name = 'Color', description?: string, deleted?: boolean): IColorAll => ({
      id,
      name,
      description,
      deleted,
    });

    const makeTreatment = (id: string, groupId: string, name = 'Treatment'): ITreatmentAll => ({
      id,
      name,
      group: { id: groupId, name: `Group ${groupId}` },
      type: ServiceType.treatment,
      currency: 'USD',
    } as ITreatmentAll);

    beforeEach(() => {
      groups = new Map<string, GroupService>();
      treatments = [
        makeTreatment('t1', 'G1'),
        makeTreatment('t2', 'G1'),
        makeTreatment('t3', 'G2'),
      ];
    });

    it('should return a Map with the correct group services', () => {
      const result = createTreatmentGroupService(groups, treatments, 'USD');

      expect(result instanceof Map).toBeTrue();
      expect(result.size).toBe(2);

      const g1 = result.get('G1');
      const g2 = result.get('G2');

      expect(g1?.treatments.length).toBe(2);
      expect(g1?.treatments.map(t => t.id)).toEqual(['t1', 't2']);
      expect(g1?.selectedTreatments.length).toBe(0);

      expect(g2?.treatments.length).toBe(1);
      expect(g2?.treatments[0].id).toBe('t3');
      expect(g2?.selectedTreatments.length).toBe(0);
    });

    it('should add treatments to selectedTreatments if isSelected is true', () => {
      const result = createTreatmentGroupService(groups, treatments, 'USD', true);

      const g1 = result.get('G1');
      const g2 = result.get('G2');

      expect(g1?.selectedTreatments.length).toBe(2);
      expect(g1?.treatments.length).toBe(0);
      expect(g2?.selectedTreatments.length).toBe(1);
    });

    it('should add currency and type to each treatment', () => {
      const result = createTreatmentGroupService(groups, treatments, 'EUR');

      const g1 = result.get('G1')!;
      g1.treatments.forEach(t => {
        expect(t.currency).toBe('EUR');
        expect(t.type).toBe(ServiceType.treatment);
      });
    });

    it('should append to existing group if already present in the Map', () => {
      const existingGroup = new GroupService('G1', 'Existing Group', [makeColor('C3', 'Green')]);
      existingGroup.treatments.push(makeTreatment('t0', 'G1'));
      groups.set('G1', existingGroup);

      const result = createTreatmentGroupService(groups, treatments, 'USD');

      const g1 = result.get('G1');
      expect(g1?.treatments.length).toBe(3);
      expect(g1?.treatments.map(t => t.id)).toEqual(['t0', 't1', 't2']);
    });

    it('should handle empty treatment list gracefully', () => {
      const result = createTreatmentGroupService(groups, [], 'USD');
      expect(result.size).toBe(0);
    });
  });

  describe('allElementsHaveSameKeyFilterValue', () => {

    it('should return true if all keys have the same top-level property value', () => {
      const map = new Map<any, any>([
        [{ id: 1, group: 'A' }, 'value1'],
        [{ id: 2, group: 'A' }, 'value2'],
        [{ id: 3, group: 'A' }, 'value3'],
      ]);

      const result = allElementsHaveSameKeyFilterValue(map, ['group']);
      expect(result).toBeTrue();
    });

    it('should return false if keys have different top-level property values', () => {
      const map = new Map<any, any>([
        [{ id: 1, group: 'A' }, 'value1'],
        [{ id: 2, group: 'B' }, 'value2'],
      ]);

      const result = allElementsHaveSameKeyFilterValue(map, ['group']);
      expect(result).toBeFalse();
    });

    it('should return true if all nested property values are equal', () => {
      const map = new Map<any, any>([
        [{ id: 1, group: { name: 'Group1' } }, 'value1'],
        [{ id: 2, group: { name: 'Group1' } }, 'value2'],
      ]);

      const result = allElementsHaveSameKeyFilterValue(map, ['group', 'name']);
      expect(result).toBeTrue();
    });

    it('should return false if nested property values differ', () => {
      const map = new Map<any, any>([
        [{ id: 1, group: { name: 'Group1' } }, 'value1'],
        [{ id: 2, group: { name: 'Group2' } }, 'value2'],
      ]);

      const result = allElementsHaveSameKeyFilterValue(map, ['group', 'name']);
      expect(result).toBeFalse();
    });

    it('should return true for an empty map', () => {
      const map = new Map();
      const result = allElementsHaveSameKeyFilterValue(map, ['group']);
      expect(result).toBeTrue();
    });

    it('should handle missing nested properties gracefully', () => {
      const map = new Map<any, any>([
        [{ id: 1, group: { name: 'Group1' } }, 'value1'],
        [{ id: 2, group: {} }, 'value2'], // missing nested property
      ]);

      const result = allElementsHaveSameKeyFilterValue(map, ['group', 'name']);
      expect(result).toBeFalse();
    });

    it('should return true when all keys resolve to undefined (same value)', () => {
      const map = new Map<any, any>([
        [{ id: 1 }, 'value1'],
        [{ id: 2 }, 'value2'],
      ]);

      const result = allElementsHaveSameKeyFilterValue(map, ['nonexistent']);
      expect(result).toBeTrue();
    });
  });

  describe('areEquals', () => {
    it('should return true for two identical arrays of simple objects', () => {
      const arr1 = [{ id: 1, name: 'Alice' }, { id: 2, name: 'Bob' }];
      const arr2 = [{ id: 2, name: 'Bob' }, { id: 1, name: 'Alice' }];

      expect(areEquals(arr1, arr2)).toBeTrue();
    });

    it('should return false if one object differs by one property', () => {
      const arr1 = [{ id: 1, name: 'Alice' }];
      const arr2 = [{ id: 1, name: 'Bob' }];

      expect(areEquals(arr1, arr2)).toBeFalse();
    });

    it('should return false if array lengths differ', () => {
      const arr1 = [{ id: 1 }];
      const arr2 = [{ id: 1 }, { id: 2 }];

      expect(areEquals(arr1, arr2)).toBeFalse();
    });

    it('should return true for empty arrays', () => {
      expect(areEquals([], [])).toBeTrue();
    });

    it('should return true if arrays have same values as primitives instead of objects', () => {
      const arr1 = [1, 2, 3];
      const arr2 = [1, 2, 3];

      expect(areEquals(arr1, arr2)).toBeTrue();
    });

    it('should return false when object has an extra key not in other array', () => {
      const arr1 = [{ id: 1, name: 'Alice' }];
      const arr2 = [{ id: 1 }];

      expect(areEquals(arr1, arr2)).toBeFalse();
    });

    it('should handle numeric and string key comparisons correctly', () => {
      const arr1 = [{ id: 1 }];
      const arr2 = [{ id: '1' }]; // string vs number

      expect(areEquals(arr1, arr2)).toBeFalse();
    });

    it('should return true when order differs but all objects are identical', () => {
      const arr1 = [{ id: 1, x: 2 }, { id: 2, x: 4 }];
      const arr2 = [{ id: 2, x: 4 }, { id: 1, x: 2 }];

      expect(areEquals(arr1, arr2)).toBeTrue();
    });

    it('should return false when nested object references differ even with same structure', () => {
      const arr1 = [{ user: { id: 1, name: 'A' } }];
      const arr2 = [{ user: { id: 1, name: 'A' } }];

      expect(areEquals(arr1, arr2)).toBeFalse();
    });
  });

  describe('isProfessional', () => {
    const professionals: IUser[] = [{
      id: 'professional-123',
    }, {
      id: 'pro-456',
    }];
    it('should return true for id that include the professional', () => {
      const id = 'professional-123';
      expect(isProfessional(id, professionals)).toBeTrue();
    });

    it('should return false for id that does not include the professional', () => {
      const id = 'customer-789';
      expect(isProfessional(id, professionals)).toBeFalse();
    });

    it('should return false when professionals list is empty', () => {
      const id = 'professional-123';
      expect(isProfessional(id, [])).toBeFalse();
    });

    it('should return false when professionals list is undefined', () => {
      const id = 'professional-123';
      expect(isProfessional(id)).toBeFalse();
    });
  });
});
