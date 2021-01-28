import { IUser } from './user';
import { IProduct } from './product';
import { IRoom } from './room';

export interface IReservation {
  id?: string;
  customerId?: string;
  customer?: IUser;
  productId?: string;
  product?: IProduct;
  roomId?: string;
  room?: IRoom;
  start?: Date;
}

export class Reservation implements IReservation {
  constructor() {
  }
}

export const PAGE_SIZE = 10;
