import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { Router } from '@angular/router';
import { ICommon } from '../interfaces/common';
import { IUnavailable } from '../interfaces/unavailable';
import { UnavailableStore } from '../store/unavailable.store';
import { UnavailableComponent } from './unavailable.component';
import { AuthUserService } from '../services/auth-user.service';
import { getTimeNumber } from '../util/dates';
import { closest } from '../util/numbers';

@Component({
  selector: 'app-unavailable-create-page',
  template: '<app-unavailable [config]="config" [params]="params()" (submitData)="submit($event)" />',
  imports: [UnavailableComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UnavailableCreatePageComponent {
  private readonly unavailableStore = inject(UnavailableStore);
  private readonly authUserService = inject(AuthUserService);
  private readonly router = inject(Router);

  config: ICommon = {
    title: 'UNAVAILABLE.TITLE',
    button: { icon: 'calendar_lock', label: 'COMMON.BUTTON.CREATE' },
  };

  params = computed(() => {
    const navigationState = this.router.currentNavigation()?.extras.state;
    if (navigationState) {
      let startTime;
      let showDuration = false;
      const room = navigationState['room'];
      const date = navigationState['date'];
      if (room) {
        showDuration = true;
        const time = getTimeNumber(date);
        const hour = time ? `${ time.hour }`.padStart(2, '0') : '12';
        const minute = time ? `${ closest(time.minute) }`.padStart(2, '0') : '00';
        startTime = `${ hour }:${ minute }`;
      }
      return {
        date, startTime, showDuration, room,
      };
    }
    return undefined;
  });

  constructor() {
    this.unavailableStore.clean();
  }

  submit(unavailable: IUnavailable) {
    this.unavailableStore.create(unavailable, this.authUserService.authUser()?.isRoomAdmin ?? false);
  }
}
