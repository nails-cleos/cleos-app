import { Pipe, PipeTransform } from '@angular/core';
import { IRoom, IRoomAll } from '../interfaces/room';
import { currencySymbol } from '../util/helper';

@Pipe({
  name: 'currencySymbol'
})
export class CurrencySymbolPipe implements PipeTransform {

  transform(room?: IRoom | IRoomAll): unknown {
    return room && room.currency ? currencySymbol(room.currency) : '';
  }
}
