import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { DocumentListComponent } from '../../document/list/document-list.component';
import { DocumentTypeEnum, IDocument } from '../../document/document';
import { executeDialogNoWidth } from '../../util/helper';
import { DialogComponent } from '../../shared/dialog/generic/dialog.component';
import { TranslateService } from '@ngx-translate/core';
import { MatDialog } from '@angular/material/dialog';
import { DocumentStore } from '../../store/document.store';
import { NavigationService } from '../../services/navigation.service';

@Component({
  selector: 'app-statement-list',
  imports: [DocumentListComponent],
  changeDetection: ChangeDetectionStrategy.Eager,
  template: `
    <app-document-list [showDateFilter]="false" [navigationButtons]="true" (onDelete)="delete($event)"
                       (onEdit)="edit($event)" (onAdd)="add()" [types]="types"></app-document-list>`,
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
