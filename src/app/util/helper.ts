import { DiscountType, IDiscount } from '../interfaces/discount';
import { IUser, IUserAll } from '../interfaces/user';
import { IPrice, Price } from '../interfaces/product';
import { IPayment } from '../interfaces/payment';
import { IReservationAll } from '../interfaces/reservation';
import { IAdditionalAll } from '../interfaces/additional';

export const snakeToCamel = (value: string = ''): string =>
  value.toLowerCase().replace(/([-_]\w)/g, (g: string) => g[1].toUpperCase());

export const getUserName = (user: IUserAll | IUser | undefined): string => {
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

  names = [...names, `(${user.email})`];

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
      image = `data:image/jpg;base64,${user.image}`;
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
  const product = reservation.product;
  let total = product.price;
  let priceWithDiscount;
  let priceWithExtras = product.price;
  let priceWithAdditional = product.price;
  let discount;
  let extras;
  let additional;
  if (product.extras && product.extras.price) {
    extras = product.extras.price;
    total += extras;
    priceWithExtras += extras;
  }

  if (reservation.additional && reservation.additional.length) {
    additional = reservation.additional.map(a => a.price).reduce((p, c) => p + c);
    total += additional;
    priceWithAdditional += additional;
  }

  if (product.discount) {
    discount = getDiscount(product.discount, product.price);
    priceWithDiscount = product.price - discount;
    total = total - discount;
  }

  return new Price(product.price, discount, extras, additional, total, totalPaid(payments), priceWithDiscount,
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

export const newDiscount = (price: IPrice, productDiscount: IDiscount): IPrice => {
  const discount = getDiscount(productDiscount, price.amount);
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

const totalPaid = (payments: IPayment[] | undefined): number => {
  let total = 0;
  payments?.forEach(payment => {
    if (payment.status === 'approved' && payment.amount) {
      total += payment.amount;
    }
  });

  return total;
};

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
