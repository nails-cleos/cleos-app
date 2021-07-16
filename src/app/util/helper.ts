import { DiscountType, IDiscount } from '../interfaces/discount';
import { IUser, IUserAll } from '../interfaces/user';
import { IProductAll } from '../interfaces/product';
import { IPayment } from '../interfaces/payment';

export const snakeToCamel = (value: string): string =>
  value.toLowerCase().replace(/([-_]\w)/g, (g: string) => g[1].toUpperCase());

export const round = (value: number): number => Math.round((value + Number.EPSILON) * 100) / 100;

export const getPriceDiscount = (discount: IDiscount | undefined, price: number): number | undefined => {
  if (discount && discount.amount) {
    let value;
    switch (discount.type) {
      case DiscountType.money: {
        value = discount.amount;
        break;
      }
      case DiscountType.percentage: {
        value = (price * discount.amount / 100);
      }
    }
    if (value) {
      return price - value;
    }
  }
  return undefined;
};

export const priceWithExtras = (product: IProductAll): number => {
  let price = product.price;
  if (product.extras && product.extras.price) {
    price += product.extras.price;
  }

  return price;
};

export const totalPrice = (product: IProductAll): number => {
  let price = product.price;
  if (product.discount) {
    const priceDiscount = getPriceDiscount(product.discount, price);
    price = priceDiscount ? priceDiscount : price;
  }
  if (product.extras && product.extras.price) {
    price += product.extras.price;
  }

  return price;
};

export const totalPaid = (payments: IPayment[] | undefined): number => {
  let total = 0;
  payments?.forEach(payment => {
    if (payment.status === 'approved' && payment.amount) {
      total += payment.amount;
    }
  });

  return total;
};

export const getUserName = (user: IUserAll | IUser): string => {
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

export const getUserNameInitials = (user: IUserAll): string => {
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

export const getUserImage = (user: IUser): string | undefined => {
  let image;
  if (user.imageUrl) {
    if (user.imageUrl.indexOf('http') >= 0) {
      image = user.imageUrl;
    } else if (user.image) {
      image = `data:image/jpg;base64,${user.image}`;
    }
  }

  return image;
};
