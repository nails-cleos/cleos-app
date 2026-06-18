import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { AuthUserService } from '../../services/auth-user.service';
import { ICommon } from '../../interfaces/common';
import { IUnavailable } from '../unavailable';
import { UnavailableStore } from '../../store/unavailable.store';
import { BlockAgendaComponent } from './block-agenda.component';
import { getTimeNumber } from '../../util/dates';
import { closest } from '../../util/numbers';

@Component({
  selector: 'app-block-agenda-create-page',
  template: '<app-block-agenda [config]="config" [params]="params()" (submitData)="submit($event)" />',
  imports: [BlockAgendaComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BlockAgendaCreatePageComponent {
  private readonly unavailableStore = inject(UnavailableStore);
  private readonly authUserService = inject(AuthUserService);

  config: ICommon = {
    title: 'UNAVAILABLE.BLOCK_AGENDA.TITLE',
    button: { icon: 'calendar_lock', label: 'COMMON.BUTTON.CREATE' },
  };

  params = computed(() => {
    const navigationState = history.state;
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
    this.unavailableStore.createBlockAgenda(unavailable, this.authUserService.authUser()?.isRoomAdmin ?? false);
  }
}
