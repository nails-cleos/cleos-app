import { Pipe, PipeTransform } from '@angular/core';
import { API_LOCALE, formatDuration } from '../util/dates';

@Pipe({
  name: 'durationTime',
  standalone: true
})
export class DurationTimePipe implements PipeTransform {

  transform = (
    duration?: string,
    locale: string = API_LOCALE
  ): string => duration ? formatDuration(duration, locale) : '';
}
