import { Pipe, PipeTransform } from '@angular/core';
import { currencySymbol } from '../util/helper';
import { ICurrency, ICurrencyAll } from '../interfaces/currency';

@Pipe({
  name: 'currencySymbol'
})
export class CurrencySymbolPipe implements PipeTransform {

  transform(currency?: ICurrency | ICurrencyAll | string): unknown {
    return currency ? currencySymbol(currency) : '';
  }
}
