import { IPaymentReservation } from './reservation';
import { Theme } from '../util/theme';

export interface IUser {
  id?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  dob?: string;
  enabled?: boolean;
  deleted?: boolean;
  provider?: string;
  lang?: string;
  locale?: string;
  username?: string;
  email?: string;
  password?: string;
  authorities?: IAuthority[];
  imageUrl?: string;
  image?: any;
  code?: string | null;
  referralMax?: number;
  completed?: boolean;
  theme?: Theme;
}

export interface IUserAll {
  id: string;
  firstName?: string;
  lastName?: string;
  provider: string;
  username: string;
  email: string;
  authorities: IAuthority[];
  imageUrl?: string;
  image?: any;
  locale: string;
  phone?: string;
  dob?: string;
  referralMax?: number;
  theme?: Theme;
}

export interface IAuthority {
  authority: string;
}

export interface IMenu {
  name: string;
  path: string;
  icon: string;
}

export interface IOverview {
  customer: IUserAll;
  reservations: IPaymentReservation[];
}

export class User implements IUser {
  constructor() {
  }
}
