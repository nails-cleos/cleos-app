import { Pipe, PipeTransform } from '@angular/core';
import { DiscountType } from '../discount/discount';
import { currencySymbol } from '../util/helper';
import { ICurrency } from '../currency/currency';

@Pipe({
  name: 'discount',
})
export class DiscountPipe implements PipeTransform {

  transform = (type?: DiscountType, value?: number, currency?: string | ICurrency): string => {
    switch (type) {
      case DiscountType.percentage:
        return `${ value }%`;
      case DiscountType.money:
        return `${ currencySymbol(currency) } ${ value }`;
    }
    return value ? `${ value }` : '';
  };
}
