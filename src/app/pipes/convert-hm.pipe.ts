import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'convertHM'
})
export class ConvertHMPipe implements PipeTransform {

  transform(sec: number = 0): string {
    const hours = Math.floor(sec / 3600);
    const minutes = Math.floor((sec - (hours * 3600)) / 60);

    return `${`0${hours}`.slice(-2)}:${`0${minutes}`.slice(-2)}`;
  }
}
