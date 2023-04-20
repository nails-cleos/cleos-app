import { Pipe, PipeTransform } from '@angular/core';
import { newDateTimestamp } from '../util/dates';

@Pipe({
  name: 'timeDetail'
})
export class TimeDetailPipe implements PipeTransform {

  transform(timestamp?: string | Date | number, timeZone?: string): Date {
    return newDateTimestamp(timestamp, timeZone);
  }
}
