import { ChangeDetectionStrategy, Component, effect, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { TranslateService } from '@ngx-translate/core';
import { AuthUserService } from '../services/auth-user.service';

enum ShortcutEnum {
  dashboard,
  calendar,
  reservation,
}

@Component({
  selector: 'app-shortcut',
  templateUrl: './shortcut.component.html',
  styleUrls: ['./shortcut.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ShortcutComponent {
  private readonly translate = inject(TranslateService);
  private readonly authUserService = inject(AuthUserService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  private readonly paramMapSignal = toSignal(this.route.paramMap);
  private readonly authUserSignal = this.authUserService.authUser;

  constructor() {
    effect(() => {
      const paramMap = this.paramMapSignal();
      const user = this.authUserSignal();

      if (!paramMap || !user) {
        return;
      }

      const key = paramMap.get('key') as keyof typeof ShortcutEnum;
      const shortcut = ShortcutEnum[key];

      let redirect: string[] = [];

      switch (shortcut) {
        case ShortcutEnum.calendar:
          if (user.isRoomAdmin) {
            redirect = ['dashboard', 'events'];
          } else if (user.isAdmin || user.isManager || user.isProfessional) {
            redirect = ['reservation', 'calendar'];
          } else {
            redirect = ['me', 'reservations'];
          }
          break;

        case ShortcutEnum.dashboard:
          if (user.isRoomAdmin) {
            redirect = ['dashboard', 'events'];
          } else if (user.isAdmin || user.isManager || user.isProfessional) {
            redirect = ['dashboard'];
          } else {
            redirect = ['me', 'overview'];
          }
          break;

        case ShortcutEnum.reservation:
          redirect = user.isCustomer
            ? ['me', 'reservation']
            : ['reservation'];
          break;
      }

      this.router.navigate([this.translate.getCurrentLang(), ...redirect]);
    });
  }
}
