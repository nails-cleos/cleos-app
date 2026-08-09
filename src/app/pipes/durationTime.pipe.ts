import { Pipe, PipeTransform } from '@angular/core';
import { DEFAULT_LOCALE, formatDuration } from '../util/dates';

@Pipe({
  name: 'durationTime',
})
export class DurationTimePipe implements PipeTransform {
  transform = (duration?: string, locale: string = DEFAULT_LOCALE): string =>
    duration ? formatDuration(duration, locale) : '';
}
