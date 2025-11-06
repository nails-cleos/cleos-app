import { Pipe, PipeTransform } from '@angular/core';
import { ReservationIconKey, ReservationIconName } from '../util/icon';
import { snakeToCamel } from '../util/helper';

@Pipe({
  name: 'reservationIcon',
  standalone: true,
})
export class ReservationIconPipe implements PipeTransform {

  transform = (name?: string): any => name ? ReservationIconName[snakeToCamel(name) as ReservationIconKey] : '';

}
