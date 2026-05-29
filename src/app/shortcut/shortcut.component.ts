import { ChangeDetectionStrategy, Component, effect, inject, input } from '@angular/core';
import { Router } from '@angular/router';
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
  key = input<keyof typeof ShortcutEnum>();

  private readonly translate = inject(TranslateService);
  private readonly authUserService = inject(AuthUserService);
  private readonly router = inject(Router);
  private readonly authUserSignal = this.authUserService.authUser;

  constructor() {
    effect(() => {
      const key = this.key();
      const user = this.authUserSignal();

      if (!key || !user) {
        return;
      }

      const shortcut = ShortcutEnum[key];
      if (shortcut === undefined) {
        return;
      }

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
