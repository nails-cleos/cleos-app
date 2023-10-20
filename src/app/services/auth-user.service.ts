import { Injectable } from '@angular/core';
import { IUserAll } from '../interfaces/user';
import { isDarkMode, Theme } from '../util/theme';
import { getUserName, hasRoomAdmin } from '../util/helper';
import { Role } from '../interfaces/token';
import { BehaviorSubject } from 'rxjs';

export interface IAuthUser {
  isDarkMode: boolean;
  isAdmin: boolean;
  isManager: boolean;
  isRoomAdmin: boolean;
  isProfessional: boolean;
  isCustomer: boolean;
  hasAdminRole: boolean;
  isAuthenticated: boolean;
  showCash: boolean;
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
  hasAdminRole: false,
  isCustomer: false,
  isAuthenticated: false,
  showCash: false,
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
      const isAdmin = user.authorities.some(u => u.authority === Role.admin);
      const isManager = user.authorities.some(u => u.authority === Role.manager);
      const isRoomAdmin = hasRoomAdmin(user.authorities);
      authUser = {
        ...initialAuthUser,
        isDarkMode: isDarkMode(user.theme),
        isAdmin,
        isManager,
        isRoomAdmin,
        isProfessional,
        isCustomer,
        hasAdminRole: isProfessional || isAdmin || isManager || isRoomAdmin,
        isAuthenticated: true,
        showCash: user.showCash || false,
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
