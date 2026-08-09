import { inject, Injectable, signal } from '@angular/core';
import { IUserAll } from '../user/user';
import { isDarkMode, Theme } from '../util/theme';
import { hasRoomAdmin } from '../util/helper';
import { Role } from '../interfaces/token';
import { TranslateService } from '@ngx-translate/core';
import { NgcContentOptions, NgcCookieConsentService } from 'ngx-cookieconsent';

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
  displayName?: string;
  professionalId?: string;
  customerId?: string;
  userId?: string;
  theme?: Theme;
}

export const initialAuthUser: IAuthUser = {
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
  displayName: undefined,
  professionalId: undefined,
  customerId: undefined,
  userId: undefined,
  theme: undefined,
};

@Injectable({
  providedIn: 'root',
})
export class AuthUserService {
  private cookieConsentService: NgcCookieConsentService = inject(
    NgcCookieConsentService,
  );
  private _authUser = signal<IAuthUser>(initialAuthUser);
  authUser = this._authUser.asReadonly();

  reloadUser(user?: IUserAll): IAuthUser {
    let authUser = initialAuthUser;

    if (user) {
      const isProfessional = user.authorities.some(
        (u) => u.authority === Role.professional,
      );
      const isCustomer = user.authorities.some(
        (u) => u.authority === Role.customer,
      );
      const isAdmin = user.authorities.some((u) => u.authority === Role.admin);
      const isManager = user.authorities.some(
        (u) => u.authority === Role.manager,
      );
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
        displayName: user.displayName,
        professionalId: isProfessional ? user.id : undefined,
        customerId: isCustomer ? user.id : undefined,
        userId: user.id,
        theme: user.theme,
      };
    }

    this._authUser.set(authUser);
    return authUser;
  }

  updateMode(isDark: boolean): IAuthUser {
    const current = this._authUser();
    if (current.isDarkMode === isDark) {
      return current;
    }

    const updated = { ...current, isDarkMode: isDark };
    this._authUser.set(updated);
    return updated;
  }

  cookieConsent = (translate: TranslateService): void => {
    const data = translate.instant('COOKIE');
    const content =
      this.cookieConsentService.getConfig().content ||
      ({} as NgcContentOptions);
    content.header = data.HEADER;
    content.message = data.MESSAGE;
    content.dismiss = data.DISMISS;
    content.allow = data.ALLOW;
    content.deny = data.DENY;
    content.link = data.LINK;
    content.policy = data.POLICY;

    this.cookieConsentService.getConfig().content = content;
    this.cookieConsentService.destroy();
    this.cookieConsentService.init(this.cookieConsentService.getConfig());
  };
}
