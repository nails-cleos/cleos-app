import { Injectable } from '@angular/core';
import { IUserAll } from '../interfaces/user';
import { isDarkMode, Theme } from '../util/theme';
import { getUserName, isRoomAdmin } from '../util/helper';
import { Role } from '../interfaces/token';
import { BehaviorSubject } from 'rxjs';

export interface IAuthUser {
  isDarkMode: boolean;
  isAdmin: boolean;
  isManager: boolean;
  isRoomAdmin: boolean;
  isProfessional: boolean;
  isCustomer: boolean;
  isAuthenticated: boolean;
  locale: string;
  referralMax: number;
  email?: string;
  username?: string;
  professionalId?: string;
  customerId?: string;
  userId?: string;
  theme?: Theme;
}

const initialAuthUser: IAuthUser = {
  isDarkMode: false,
  isAdmin: false,
  isManager: false,
  isRoomAdmin: false,
  isProfessional: false,
  isCustomer: false,
  isAuthenticated: false,
  locale: navigator.language,
  referralMax: 5,
  email: undefined,
  username: undefined,
  professionalId: undefined,
  customerId: undefined,
  userId: undefined,
  theme: undefined
};

@Injectable()
export class AuthUserService {

  public authUser: BehaviorSubject<IAuthUser> = new BehaviorSubject<IAuthUser>(initialAuthUser);

  constructor() {
  }

  reloadUser(user?: IUserAll): IAuthUser {
    let authUser = initialAuthUser;
    if (user) {
      const isProfessional = user.authorities.some(u => u.authority === Role.professional);
      const isCustomer = user.authorities.some(u => u.authority === Role.customer);
      authUser = {
        ...initialAuthUser,
        isDarkMode: isDarkMode(user.theme),
        isAdmin: user.authorities.some(u => u.authority === Role.admin),
        isManager: user.authorities.some(u => u.authority === Role.manager),
        isRoomAdmin: isRoomAdmin(user.authorities),
        isProfessional,
        isCustomer,
        isAuthenticated: true,
        locale: user.locale || initialAuthUser.locale,
        referralMax: user.referralMax || initialAuthUser.referralMax,
        email: user.email,
        username: getUserName(user),
        professionalId: isProfessional ? user.id : undefined,
        customerId: isCustomer ? user.id : undefined,
        userId: user.id,
        theme: user.theme
      };
    }
    this.authUser.next(authUser);
    return authUser;
  }
}
