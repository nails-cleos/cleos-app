import { Pipe, PipeTransform } from '@angular/core';
import { secondsToHHMM } from '../util/dates';

@Pipe({
  name: 'convertHM',
})
export class ConvertHMPipe implements PipeTransform {
  transform = (sec: number = 0): string => secondsToHHMM(sec);
}
