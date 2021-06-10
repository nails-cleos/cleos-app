import { Component } from '@angular/core';
import { IAuthority, IUserAll } from '../interfaces/user';
import { Role } from '../interfaces/token';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { AppState, selectAuthState } from '../store/app.states';

@Component({
  selector: 'app-redirect',
  templateUrl: './redirect.component.html',
  styleUrls: ['./redirect.component.scss']
})
export class RedirectComponent {

  constructor(private router: Router, private store: Store<AppState>) {
    this.store.select(selectAuthState).subscribe((state: any) => {
      let redirectUrl = ['main'];
      if (state.isAuthenticated) {
        const user: IUserAll = state.user;
        if (RedirectComponent.isProfessionalOrAdmin(user.authorities)) {
          redirectUrl = ['dashboard'];
        } else {
          redirectUrl = ['me', 'reservations'];
        }
      }
      this.router.navigate(redirectUrl);
    });
  }

  private static isProfessionalOrAdmin(authorities: IAuthority[] | undefined): boolean {
    return !!authorities && authorities.length > 0 &&
      authorities.some(u => (u.authority === Role.professional || u.authority === Role.admin));
  }
}
