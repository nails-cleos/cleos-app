import { IReservationOverview } from './reservation';
import { Theme } from '../util/theme';
import { IChart } from './dashboard';

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
  timeZone?: string;
  lightColor?: string;
  darkColor?: string;
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
  lang?: string;
  locale: string;
  phone?: string;
  dob?: string;
  oldPhone?: string;
  oldDob?: string;
  referralMax?: number;
  theme?: Theme;
  changePassword: boolean;
  timeZone: string;
  lightColor?: string;
  darkColor?: string;
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
