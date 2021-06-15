import { DiscountType, IDiscount } from '../interfaces/discount';

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
        value = (price / discount.amount);
      }
    }
    if (value) {
      return price - value;
    }
  }
  return undefined;
};
