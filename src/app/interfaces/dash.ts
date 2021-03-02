import { IReservation, IReservationAll } from './reservation';
import { Pagination } from './pagination';

export interface IDash {
  data?: IReservationAll[] | null;
  page?: Pagination<IReservation> | null;
}
