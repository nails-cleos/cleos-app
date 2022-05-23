import { Pipe, PipeTransform } from '@angular/core';
import { newDateTimestamp } from '../util/dates';
import { IReservationAll } from '../interfaces/reservation';
import { IUnavailableAll } from '../interfaces/unavailable';

@Pipe({
  name: 'timeDetail'
})
export class TimeDetailPipe implements PipeTransform {

  transform(reservation: IReservationAll | IUnavailableAll, timeZone?: string): Date {
    return newDateTimestamp(reservation.timestamp, timeZone);
  }

}
