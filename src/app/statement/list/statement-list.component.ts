import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { DocumentListComponent } from '@app/document/list/document-list.component';
import { DocumentTypeEnum, IDocument } from '@app/document/document';
import { executeDialogNoWidth } from '@app/util/helper';
import { DialogComponent } from '@app/shared/dialog/generic/dialog.component';
import { TranslateService } from '@ngx-translate/core';
import { MatDialog } from '@angular/material/dialog';
import { DocumentStore } from '@app/store/document.store';
import { NavigationService } from '@app/services/navigation.service';

@Component({
  selector: 'app-statement-list',
  imports: [DocumentListComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-document-list [showDateFilter]="false" [navigationButtons]="true" (deleteOutput)="delete($event)"
                       (editOutput)="edit($event)" (addOutput)="add()" [types]="types"></app-document-list>`,
})
export class StatementListComponent {

  private readonly translateService = inject(TranslateService);
  private readonly dialog = inject(MatDialog);
  private readonly documentStore = inject(DocumentStore);
  private readonly navigationService = inject(NavigationService);

  readonly types = [DocumentTypeEnum.statement];

  add = (): void => {
    this.navigationService.navigate(['statements', 'add']);
  };

  edit = (document: IDocument): void => {
    this.navigationService.navigate(['statements', document.id]);
  };

  delete = (document: IDocument): void => {
    const title = this.translateService.instant('DOCUMENT.DELETED.TITLE');
    const content = this.translateService.instant('DOCUMENT.DELETED.CONTENT', { name: document.name });

    executeDialogNoWidth(this.dialog, DialogComponent, { title, content, value: document, variant: 'warning' },
      result => {
        if (result) {
          this.documentStore.delete(result.id, result.name);
        }
      });
  };
}
