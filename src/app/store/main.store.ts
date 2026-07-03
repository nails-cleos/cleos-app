import { inject } from '@angular/core';
import { signalStore } from '@ngrx/signals';
import { TranslateService } from '@ngx-translate/core';
import { withCrudStoreMethods, withCrudStoreState } from './crud-signal-store';
import { MainService } from '../services/main.service';
import { ISendMessage } from '../../main';

export const MainStore = signalStore(
  withCrudStoreState(),
  withCrudStoreMethods(() => {
    const mainService = inject(MainService);
    const translateService = inject(TranslateService);

    return {
      create: (sendMessage: ISendMessage) => mainService.sendMessage(sendMessage),
      createResponse: () => ({
        message: translateService.instant('MAIN.CONTACT.SEND.MESSAGE'),
      }),
    };
  }),
);
