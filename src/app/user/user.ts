import { IReservationOverview } from '../reservation/reservation';
import { Theme } from '../util/theme';
import { IChart } from '../dashboard/dashboard';
import { IAddress } from '../room/room';
import { IAccountAll } from '../account/account';
import { createAddress } from '../util/helper';
import { backendFormatDate, newDate } from '../util/dates';
import { fieldChange, valueChange } from '../util/validators';
import { ProfileForm, UserForm } from './user-form.types';

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
  enabled?: boolean;
  verified?: boolean;
  referralMax?: number;
  theme?: Theme;
  timeZone: string;
  lightColor?: string;
  darkColor?: string;
  address?: IAddress;
  showCash?: boolean;
  completed?: boolean;
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
  subName?: string;
}

export interface IOverview {
  miniCardOverview: IReservationOverview[];
  chartOverview: IChart[];
  account: IAccountAll;
  upcomingList?: number[];
}

export class User {
  static fromForm(
    userForm: UserForm,
    currentUser?: IUserAll,
    currentLang?: string,
    isProfessionalOrManager: boolean = false,
    formattedAddress?: string,
    location?: google.maps.LatLng,
  ): IUser {
    const dob = fieldChange(userForm.dob, currentUser?.dob);

    return {
      locale: valueChange(userForm.lang.value, currentUser?.locale) || currentLang,
      email: fieldChange(userForm.email, currentUser?.email),
      displayName: fieldChange(userForm.displayName, currentUser?.displayName),
      phone: fieldChange(userForm.phone, currentUser?.phone),
      dob: dob ? backendFormatDate(newDate(dob)) : dob,
      ...(isProfessionalOrManager && userForm.lightColor.value && {
        lightColor: userForm.lightColor.value,
      }),
      ...(isProfessionalOrManager && userForm.darkColor.value && {
        darkColor: userForm.darkColor.value,
      }),
      address: createAddress(
        formattedAddress,
        location,
        currentUser?.address,
      ),
    };
  }

  static fromProfileForm(
    profileForm: ProfileForm,
    showCash: boolean,
    currentUser?: IUserAll,
    currentLang?: string,
    formattedAddress?: string,
    location?: google.maps.LatLng,
  ): IUser {
    const dob = fieldChange(profileForm.dob, currentUser?.dob);

    return {
      locale: valueChange(profileForm.lang.value, currentUser?.locale) || currentLang,
      displayName: fieldChange(profileForm.displayName, currentUser?.displayName),
      phone: fieldChange(profileForm.phone, currentUser?.phone),
      dob: dob ? backendFormatDate(newDate(dob)) : dob,
      showCash,
      ...(profileForm.lightColor.value && {
        lightColor: profileForm.lightColor.value,
      }),
      ...(profileForm.darkColor.value && {
        darkColor: profileForm.darkColor.value,
      }),
      address: createAddress(
        formattedAddress,
        location,
        currentUser?.address,
      ),
    };
  }
}
