import { Pipe, PipeTransform } from '@angular/core';
import { IRoom, IRoomAll } from '../room/room';
import { roomCurrency, roomGMT } from '../util/helper';

@Pipe({
  name: 'roomName',
})
export class RoomNamePipe implements PipeTransform {
  transform = (
    room?: IRoom | IRoomAll,
    showCurrency: boolean = true,
    showGMT: boolean = false,
  ): string => {
    if (!room) {
      return '';
    }
    const gmt = showGMT ? roomGMT(room) : '';
    const currency =
      showCurrency && room.currency ? ` - ${roomCurrency(room)}` : '';
    return room.office ? `${room.office.name}${currency}${gmt}` : '';
  };
}
