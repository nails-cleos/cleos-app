import { ChangeDetectionStrategy, Component, effect, inject } from '@angular/core';
import { IAuthority } from '../../interfaces/user';
import { Role } from '../../interfaces/token';
import { Store } from '@ngrx/store';
import { TokenService } from '../../services/token.service';
import { getLocale, hasRoomAdmin } from '../../util/helper';
import { NavigationService } from '../../services/navigation.service';
import { TranslateService } from '@ngx-translate/core';
import { getIsAuthenticatedPipe, getRedirectPipe, getUserPipe } from '../../store/selectors/auth.selectors';
import { toSignal } from '@angular/core/rxjs-interop';
import { AuthState } from '../../store/reducers/auth.reducers';

@Component({
  selector: 'app-redirect',
  template: '',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RedirectComponent {
  private readonly store: Store<AuthState> = inject(Store<AuthState>);
  private readonly tokenService: TokenService = inject(TokenService);
  private readonly navigateService: NavigationService = inject(NavigationService);
  private readonly translate: TranslateService = inject(TranslateService);

  private redirect$ = this.store.pipe(getRedirectPipe);
  private isAuthenticated$ = this.store.pipe(getIsAuthenticatedPipe);
  private user$ = this.store.pipe(getUserPipe);

  private redirectSignal = toSignal(this.redirect$);
  private isAuthenticatedSignal = toSignal(this.isAuthenticated$);
  private userSignal = toSignal(this.user$);

  constructor() {
    effect(() => {
      const lang = getLocale(this.translate.getCurrentLang()).language;
      let redirectUrl = ['/', lang];
      if (this.redirectSignal()) {
        const user = this.userSignal();
        if (this.isAuthenticatedSignal() && user) {
          this.tokenService.setUser = user;
          if (RedirectComponent.hasRoomOrAdmin(user.authorities)) {
            redirectUrl = [lang, 'dashboard'];
          } else if (hasRoomAdmin(user.authorities)) {
            redirectUrl = [lang, 'dashboard', 'events'];
          } else {
            redirectUrl = [lang, 'me', 'reservations'];
          }
        } else {
          redirectUrl = [lang, 'home'];
        }
        this.navigateService.reload(redirectUrl);
      }
    });
  }

  private static hasRoomOrAdmin = (authorities?: IAuthority[]): boolean =>
    !!authorities && authorities.length > 0 && authorities.some(
      u => (u.authority === Role.professional || u.authority === Role.manager || u.authority === Role.admin),
    );
}
