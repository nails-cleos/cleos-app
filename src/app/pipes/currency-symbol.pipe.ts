import { Pipe, PipeTransform } from '@angular/core';
import { IRoom, IRoomAll } from '../interfaces/room';
import { currencySymbol } from '../util/helper';
import { ICurrency, ICurrencyAll } from "../interfaces/currency";

@Pipe({
  name: 'currencySymbol'
})
export class CurrencySymbolPipe implements PipeTransform {

  transform(currency?: ICurrency | ICurrencyAll): unknown {
    return currency ? currencySymbol(currency) : '';
  }
}
