import {
  ChangeDetectionStrategy,
  Component,
  effect,
  inject,
} from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AuthUserService } from './services/auth-user.service';
import { toSignal } from '@angular/core/rxjs-interop';
import { DEFAULT_LOCALE } from './util/dates';
import { NavigationService } from './services/navigation.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterOutlet],
})
export class AppComponent {
  private readonly authUserService = inject(AuthUserService);
  private readonly navigationService: NavigationService =
    inject(NavigationService);

  private readonly authUserSignal = this.authUserService.authUser;

  private readonly language = toSignal(this.navigationService.urlLanguage$, {
    initialValue: DEFAULT_LOCALE,
  });

  constructor() {
    effect(() => {
      const user = this.authUserSignal();
      if (!user || !user.isAuthenticated) {
        this.navigationService.resetConfig(this.language());
        return;
      }

      this.navigationService.resetConfig(user.locale, user.theme);
    });
  }
}
