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
  start?: string;
}

export interface IReservationAll {
  id: string;
  customer: IUser;
  product: IProduct;
  room: IRoom;
  start: string;
}

export class Reservation implements IReservation {
  constructor() {
  }
}

export const PAGE_SIZE = 10;
