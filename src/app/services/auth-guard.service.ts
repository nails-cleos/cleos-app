import { Injectable } from '@angular/core';
import { Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { IUser } from '../interfaces/user';
import { Store } from '@ngrx/store';
import { AppState, selectAuthState } from '../store/app.states';
import { Observable } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslateService } from '@ngx-translate/core';

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

  public canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    if (this.currentUser) {
      if (this.hasRole(route, this.currentUser)) {
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
        this.router.navigate(['main']);
        return false;
      }
    }
    // not logged in so redirect to auth page with the return url
    this.router.navigate(['auth'], {queryParams: {returnUrl: state.url}});

    return false;
  }

  private hasRole(route: ActivatedRouteSnapshot, user: IUser): boolean {
    if (route.data.roles && user.authorities) {
      return user.authorities.some(au => route.data.roles.includes(au.authority));
    }

    return false;
  }
}
