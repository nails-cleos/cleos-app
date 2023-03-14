import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot } from '@angular/router';
import { IUser } from '../interfaces/user';
import { Store } from '@ngrx/store';
import { AppState, selectAuthState } from '../store/app.states';
import { Observable } from 'rxjs';
import { MatLegacySnackBar as MatSnackBar } from '@angular/material/legacy-snack-bar';
import { TranslateService } from '@ngx-translate/core';
import * as fromActionsLogin from '../store/auth.actions';

@Injectable({
  providedIn: 'root'
})
export class AuthGuardService implements CanActivate {

  getState: Observable<any>;
  currentUser!: IUser;
  token!: string;

  constructor(private snackBar: MatSnackBar, private router: Router, private store: Store<AppState>, private translate: TranslateService) {
    this.getState = this.store.select(selectAuthState);
    this.getState.subscribe((state) => {
      this.currentUser = state.user;
    });
  }

  private static hasRole(route: ActivatedRouteSnapshot, user: IUser): boolean {
    if (route.data.roles && user.authorities) {
      return user.authorities.some(au => route.data.roles.includes(au.authority));
    }

    return false;
  }

  public canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    if (this.currentUser) {
      if (AuthGuardService.hasRole(route, this.currentUser)) {
        return true;
      } else {
        let message;
        if (this.translate.currentLang.startsWith('es')) {
          message = 'El usuario no tiene los permisos necesarios';
        } else {
          message = 'User not have the necessary permissions';
        }
        this.snackBar.open(message, 'OK', {
          duration: 5000
        });
        this.store.dispatch(
          new fromActionsLogin.Redirect()
        );
        return false;
      }
    }
    // not logged in so redirect to auth page with the return url and extra data
    const currentNavigation = this.router.getCurrentNavigation();
    if (currentNavigation && currentNavigation.extras) {
      this.router.navigate(['auth'], {
        queryParams: {returnUrl: state.url}, state: currentNavigation.extras.state
      });
    } else {
      this.router.navigate(['auth'], {queryParams: {returnUrl: state.url}});
    }

    return false;
  }
}
