import {
  ChangeDetectionStrategy,
  Component,
  effect,
  inject,
  input,
} from '@angular/core';
import { AuthUserService } from '../services/auth-user.service';
import { NavigationService } from '../services/navigation.service';

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

  private readonly authUserService = inject(AuthUserService);
  private readonly navigationService: NavigationService =
    inject(NavigationService);
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
          redirect = user.isCustomer ? ['me', 'reservation'] : ['reservation'];
          break;
      }

      this.navigationService.navigate(redirect);
    });
  }
}
