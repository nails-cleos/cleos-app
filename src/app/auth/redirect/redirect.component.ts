import { Component } from '@angular/core';
import { IAuthority, IUserAll } from '../../interfaces/user';
import { Role } from '../../interfaces/token';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { AppState, selectAuthState } from '../../store/app.states';
import { TokenService } from '../../services/token.service';

@Component({
  selector: 'app-redirect',
  templateUrl: './redirect.component.html',
  styleUrls: ['./redirect.component.scss']
})
export class RedirectComponent {

  constructor(private router: Router, private store: Store<AppState>, private tokenService: TokenService) {
    this.store.select(selectAuthState).subscribe((state: any) => {
      if (state.redirect) {
        let redirectUrl = ['main'];
        if (state.isAuthenticated) {
          const user: IUserAll = state.user;
          this.tokenService.token = state.token;
          this.tokenService.user = state.user;
          if (RedirectComponent.hasRoomOrAdmin(user.authorities)) {
            redirectUrl = ['dashboard'];
          } else {
            redirectUrl = ['me', 'reservations'];
          }
        }
        this.router.navigate(redirectUrl);
      }
    });
  }

  private static hasRoomOrAdmin(authorities?: IAuthority[]): boolean {
    return !!authorities && authorities.length > 0 &&
      authorities.some(u => (u.authority === Role.professional || u.authority === Role.manager || u.authority === Role.admin));
  }
}
