import { Pipe, PipeTransform } from '@angular/core';
import { newDateTimestamp } from '../util/dates';
import { IReservationAll } from '../interfaces/reservation';

@Pipe({
  name: 'timeDetail'
})
export class TimeDetailPipe implements PipeTransform {

  transform(reservation: IReservationAll, timeZone?: string): Date {
    return newDateTimestamp(reservation.timestamp, timeZone);
  }

}
