import { Component } from '@angular/core';
import { IAuthority, IUserAll } from '../../interfaces/user';
import { Role } from '../../interfaces/token';
import { Store } from '@ngrx/store';
import { AppState, selectAuthState } from '../../store/app.states';
import { TokenService } from '../../services/token.service';
import { getLocale, hasRoomAdmin } from '../../util/helper';
import { NavigationService } from '../../services/navigation.service';
import { TranslateService } from '@ngx-translate/core';
import { SharedModule } from "../../shared/shared.module";

@Component({
  selector: 'app-redirect',
  templateUrl: './redirect.component.html',
  styleUrls: ['./redirect.component.scss'],
  standalone: true,
  imports: [SharedModule],
})
export class RedirectComponent {

  constructor(private store: Store<AppState>, private tokenService: TokenService,
              private navigateService: NavigationService, translate: TranslateService) {
    this.store.select(selectAuthState).subscribe((state: any) => {
      const lang = getLocale(translate.currentLang).language;
      let redirectUrl = ['/', lang];
      if (state.redirect) {
        if (state.isAuthenticated) {
          const user: IUserAll = state.user;
          this.tokenService.token = state.token;
          this.tokenService.user = state.user;
          if (RedirectComponent.hasRoomOrAdmin(user.authorities)) {
            redirectUrl = [lang, 'dashboard'];
          } else if (hasRoomAdmin(user.authorities)) {
            redirectUrl = [lang, 'events'];
          } else {
            redirectUrl = [lang, 'me', 'reservations'];
          }
        }
        this.navigateService.reload(redirectUrl);
      }
    });
  }

  private static hasRoomOrAdmin = (authorities?: IAuthority[]): boolean =>
    !!authorities && authorities.length > 0 && authorities.some(
      u => (u.authority === Role.professional || u.authority === Role.manager || u.authority === Role.admin)
    )
}
