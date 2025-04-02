import { Pipe, PipeTransform } from '@angular/core';
import { newDateTimestamp } from '../util/dates';

@Pipe({
  name: 'timeDetail',
  standalone: true
})
export class TimeDetailPipe implements PipeTransform {

  transform = (timestamp?: string | Date | number, timeZone?: string): Date => newDateTimestamp(timestamp, timeZone);
}
