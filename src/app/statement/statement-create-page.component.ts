import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ICommon } from '../interfaces/common';
import { DocumentStore } from '../store/document.store';
import { StatementComponent } from './statement.component';

@Component({
  selector: 'app-statement-create-page',
  template: '<app-statement [config]="config" (submitData)="submit($event)"/>',
  imports: [StatementComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StatementCreatePageComponent {
  private readonly documentStore = inject(DocumentStore);
  config: ICommon = {
    title: 'DOCUMENT.STATEMENT.TITLE',
    button: { icon: 'upload_file', label: 'COMMON.BUTTON.CREATE' },
  };

  constructor() {
    this.documentStore.clean();
  }

  submit(data: { officeId: string; blob: Blob, fileName: string }) {
    this.documentStore.uploadStatement(data.officeId, data.blob, data.fileName);
  }
}
