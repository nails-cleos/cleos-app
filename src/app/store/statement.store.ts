import { inject } from '@angular/core';
import { signalStore, withMethods } from '@ngrx/signals';
import { TranslateService } from '@ngx-translate/core';
import { StatementService } from '../services/statement.service';
import { withCrudStoreMethods, withCrudStoreState } from './crud-signal-store';

export type StatementUploadRequest = {
  officeId: string;
  blob: Blob;
  fileName: string;
};

export const StatementStore = signalStore(
  withCrudStoreState<StatementUploadRequest>(),
  withCrudStoreMethods<StatementUploadRequest, void, never, never>(() => {
    const statementService = inject(StatementService);
    const translateService = inject(TranslateService);

    return {
      create: ({ officeId, blob, fileName }) => statementService.uploadStatement(officeId, blob, fileName),
      createResponse: (_response, entity) => ({
        message: translateService.instant('STATEMENT.UPLOAD_SUCCESS', { fileName: entity.fileName }),
      }),
    };
  }),
  withMethods((store) => ({
    upload(officeId: string, blob: Blob, fileName: string): void {
      store.create({ officeId, blob, fileName });
    },
  })),
);
