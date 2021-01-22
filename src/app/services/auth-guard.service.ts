import { Injectable } from '@angular/core';
import { Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { IUser } from '../interfaces/user';
import { Store } from '@ngrx/store';
import { AppState, selectAuthState } from '../store/app.states';
import * as fromActionsLogin from '../store/auth.actions';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthGuardService implements CanActivate {

  getState: Observable<any>;
  currentUser!: IUser;
  token!: string;

  constructor(private router: Router, private store: Store<AppState>) {
    this.getState = this.store.select(selectAuthState);
    this.getState.subscribe((state) => {
      this.currentUser = state.user;
    });
  }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    if (this.currentUser && this.hasRole(route, this.currentUser)) {
      return true;
    }

    // not logged in so redirect to auth page with the return url
    this.router.navigate(['auth'], {queryParams: {returnUrl: state.url}});

    // this.store.dispatch(
    //   new fromActionsLogin.LogOut()
    // );
    return false;
  }

  private hasRole(route: ActivatedRouteSnapshot, user: IUser): boolean {
    if (route.data.roles && user.authorities) {
      return user.authorities.some(au => route.data.roles.includes(au.authority));
    }

    return false;
  }
}
