import { Pipe, PipeTransform } from '@angular/core';
import { API_LOCALE, formatDuration } from '../util/dates';

@Pipe({
  name: 'durationTime'
})
export class DurationTimePipe implements PipeTransform {

  transform(duration?: string, locale: string = API_LOCALE): string {
    return duration ? formatDuration(duration, locale) : '';
  }

}
