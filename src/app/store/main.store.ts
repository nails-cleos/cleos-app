import { inject } from '@angular/core';
import { signalStore } from '@ngrx/signals';
import { withCrudStoreMethods, withCrudStoreState } from './crud-signal-store';
import { MainService } from '../services/main.service';
import { ISendMessage } from '../../main';

export const MainStore = signalStore(
  { providedIn: 'root' },
  withCrudStoreState(),
  withCrudStoreMethods(() => {
    const mainService = inject(MainService);

    return {
      create: (sendMessage: ISendMessage) =>
        mainService.sendMessage(sendMessage),
      createResponse: () => ({
        messageKey: 'MAIN.CONTACT.SEND.MESSAGE',
      }),
    };
  }),
);
