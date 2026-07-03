import { effect, inject, Injectable } from '@angular/core';

import { AuthStore } from '../store/auth.store';
import { NavigationService } from '../services/navigation.service';
import { getLocale, hasRoomAdmin } from '../util/helper';
import { IAuthority } from '../user/user';
import { Role } from '../interfaces/token';

@Injectable({ providedIn: 'root' })
export class AuthRedirectEffect {
  private readonly authStore = inject(AuthStore);
  private readonly navigationService = inject(NavigationService);

  constructor() {
    effect(() => {
      const trigger = this.authStore.authReadyTrigger();
      const user = this.authStore.user();
      const isAuth = this.authStore.isAuthenticated();
      const queryParams = this.authStore.queryParams();

      if (!trigger || !isAuth || !user) {
        return;
      }

      const lang = getLocale(this.navigationService.language).language;

      const result = this.resolveRedirect(queryParams, lang, user.authorities);

      this.navigationService.reload(result.url, result.data, result.queryParams);
    });
  }

  private resolveRedirect(
    queryParams: any,
    lang: string,
    authorities?: IAuthority[],
  ): {
    url: string[];
    data?: any;
    queryParams?: any;
    lang?: string;
  } {
    let redirectUrl: string[] = ['/', lang];

    if (queryParams && Object.keys(queryParams).length) {
      const state = JSON.parse(atob(queryParams.state));
      const decodedURI = state.returnUrl;

      const paramsIndex = decodedURI.indexOf('?');

      if (paramsIndex > -1) {
        const queryString = decodedURI.slice(paramsIndex + 1);

        const parsedQueryParams = Object.fromEntries(
          new URLSearchParams(queryString).entries(),
        );

        return {
          url: decodedURI.slice(0, paramsIndex).split('/'),
          data: state.data,
          queryParams: parsedQueryParams,
          lang: state.lang,
        };
      }

      if (decodedURI) {
        const [, ...rest] = decodedURI.split('/');
        redirectUrl = ['/', ...rest];
      }

      return {
        url: redirectUrl,
        data: state.data,
        lang: state.lang,
      };
    }

    if (this.hasRoomOrAdmin(authorities)) {
      redirectUrl = [lang, 'dashboard'];
    } else if (hasRoomAdmin(authorities)) {
      redirectUrl = [lang, 'dashboard', 'events'];
    } else {
      redirectUrl = [lang, 'me', 'reservations'];
    }

    return { url: redirectUrl };
  }

  private hasRoomOrAdmin(authorities?: IAuthority[]): boolean {
    return !!authorities && authorities.some(
      u =>
        u.authority === Role.professional ||
        u.authority === Role.manager ||
        u.authority === Role.admin,
    );
  }
}
