import { IReservationOverview } from './reservation';
import { Theme } from '../util/theme';
import { IChart } from './dashboard';
import { IAddress } from './room';

export interface IUser {
  id?: string;
  uuid?: string;
  displayName?: string;
  phone?: string;
  dob?: string;
  enabled?: boolean;
  verified?: boolean;
  deleted?: boolean;
  lang?: string;
  locale?: string;
  email?: string;
  authorities?: IAuthority[];
  imageUrl?: string;
  image?: any;
  code?: string | null;
  referralMax?: number;
  completed?: boolean;
  theme?: Theme;
  timeZone?: string;
  lightColor?: string;
  darkColor?: string;
  address?: IAddress;
  showCash?: boolean;
}

export interface IUserAll {
  id: string;
  uid?: string;
  displayName: string;
  email: string;
  authorities: IAuthority[];
  imageUrl?: string;
  image?: any;
  lang?: string;
  locale: string;
  phone?: string;
  dob?: string;
  referralMax?: number;
  theme?: Theme;
  timeZone: string;
  lightColor?: string;
  darkColor?: string;
  address?: IAddress;
  showCash?: boolean;
}

export interface IAuthority {
  authority: string;
}

export interface IMenu {
  name: string;
  path: string;
  icon: string;
  subMenus: IMenu[];
  tooltip?: string;
}

export interface IOverview {
  customer: IUserAll;
  miniCardOverview: IReservationOverview[];
  chartOverview: IChart[];
}

export class User implements IUser {
  constructor() {
  }
}
