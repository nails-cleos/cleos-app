import { inject, Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  CanActivateFn,
  RouterStateSnapshot,
} from '@angular/router';
import { IUser } from '../user/user';
import { ToastService } from './toast.service';
import { AuthStore } from '../store/auth.store';
import { NavigationService } from './navigation.service';

@Injectable({
  providedIn: 'root',
})
export class PermissionsService {
  private readonly toastService: ToastService = inject(ToastService);
  private readonly authStore = inject(AuthStore);
  private readonly navigationService: NavigationService =
    inject(NavigationService);

  private currentUser = this.authStore.user;

  private readonly language = this.navigationService.language;

  private static hasRole = (
    route: ActivatedRouteSnapshot,
    user: IUser,
  ): boolean =>
    route.data.roles && user.authorities
      ? user.authorities.some((au) => route.data.roles.includes(au.authority))
      : false;

  canActivate = (
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot,
  ): boolean => {
    const user = this.currentUser();
    if (user) {
      if (PermissionsService.hasRole(route, user)) {
        return true;
      } else {
        let message;
        if (this.language.startsWith('es')) {
          message = 'El usuario no tiene los permisos necesarios';
        } else {
          message = 'User not have the necessary permissions';
        }
        this.toastService.show(message, 'info');
        this.authStore.authRedirect();
        return false;
      }
    }
    // not logged in so redirect to auth page with the return url and extra data
    const queryParams = btoa(
      JSON.stringify({ returnUrl: state.url, data: history.state }),
    );
    this.navigationService.navigate(['auth'], {
      queryParams: { state: queryParams },
    });

    return false;
  };
}

export const authGuard: CanActivateFn = (
  next: ActivatedRouteSnapshot,
  state: RouterStateSnapshot,
): boolean => inject(PermissionsService).canActivate(next, state);
