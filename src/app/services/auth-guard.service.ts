import { inject, Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivateFn, Router, RouterStateSnapshot } from '@angular/router';
import { IUser } from '../interfaces/user';
import { Store } from '@ngrx/store';
import { AppState, selectAuthState } from '../store/app.states';
import { Observable } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import * as fromActionsLogin from '../store/auth.actions';
import { ToastService } from './toast.service';

@Injectable({
  providedIn: 'root',
})
export class PermissionsService {
  private toastService: ToastService = inject(ToastService);
  private router: Router = inject(Router);
  private store: Store<AppState> = inject(Store<AppState>);
  private translate: TranslateService = inject(TranslateService);

  getState: Observable<any> = this.store.select(selectAuthState);
  currentUser?: IUser;
  token!: string;

  private readonly data: any = this.router.getCurrentNavigation()?.extras?.state;

  constructor() {
    this.getState.subscribe((state) => this.currentUser = state.user);
  }

  private static hasRole = (route: ActivatedRouteSnapshot, user: IUser): boolean => route.data.roles &&
  user.authorities ? user.authorities.some(au => route.data.roles.includes(au.authority)) : false;

  canActivate = (route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean => {
    if (this.currentUser) {
      if (PermissionsService.hasRole(route, this.currentUser)) {
        return true;
      } else {
        let message;
        if (this.translate.currentLang.startsWith('es')) {
          message = 'El usuario no tiene los permisos necesarios';
        } else {
          message = 'User not have the necessary permissions';
        }
        this.toastService.info(message);
        this.store.dispatch(new fromActionsLogin.Redirect());
        return false;
      }
    }
    // not logged in so redirect to auth page with the return url and extra data
    const queryParams = btoa(JSON.stringify({ returnUrl: state.url, data: this.data }));
    this.router.navigate([this.translate.currentLang, 'auth'], { queryParams: { state: queryParams } });

    return false;
  };
}

export const authGuard: CanActivateFn = (next: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean =>
  inject(PermissionsService).canActivate(next, state);
