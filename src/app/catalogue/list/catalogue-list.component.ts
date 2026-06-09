import { ChangeDetectionStrategy, Component, computed, effect, inject } from '@angular/core';
import {
  CdkDrag,
  CdkDragDrop,
  CdkDragHandle,
  CdkDragPreview,
  CdkDropList,
  moveItemInArray,
} from '@angular/cdk/drag-drop';
import { ICatalogueAll } from '../catalogue';
import { DialogComponent } from '../../shared/dialog/generic/dialog.component';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { MatDialog } from '@angular/material/dialog';
import { executeDialogNoWidth } from '../../util/helper';
import { MatIcon } from '@angular/material/icon';
import { MatButton } from '@angular/material/button';
import { Router, RouterLink } from '@angular/router';
import { CatalogueStore } from '../../store/catalogue.store';

@Component({
  selector: 'app-catalogue-list',
  templateUrl: './catalogue-list.component.html',
  styleUrls: ['./catalogue-list.component.scss'],
  imports: [MatIcon, MatButton, TranslatePipe, RouterLink, CdkDropList, CdkDrag, CdkDragHandle, CdkDragPreview],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CatalogueListComponent {
  private readonly translate: TranslateService = inject(TranslateService);
  private readonly dialog: MatDialog = inject(MatDialog);
  private readonly router: Router = inject(Router);
  private readonly catalogueStore = inject(CatalogueStore);
  private readonly responseSignal = this.catalogueStore.response;
  private readonly cataloguesSignal = this.catalogueStore.data;

  catalogues = computed(() => {
    const list = this.cataloguesSignal() || [];
    return list.filter(it => it?.id).map(it => it.blob ? { ...it, image: `data:image/jpeg;base64,${it.blob}` } : it);
  });

  language: string = this.translate.getCurrentLang();

  constructor() {
    this.catalogueStore.clean();
    this.catalogueStore.loadAllCatalogues();

    effect(() => {
      if (this.responseSignal()) {
        this.catalogueStore.clearResponse();
        this.catalogueStore.loadAllCatalogues();
      }
    });
  }

  drop(event: CdkDragDrop<ICatalogueAll[]>): void {
    moveItemInArray(this.catalogues(), event.previousIndex, event.currentIndex);
  }

  finish(): void {
    this.catalogueStore.sort(this.catalogues());
  }

  edit(selected: ICatalogueAll): void {
    void this.router.navigate([this.language, 'catalogues', selected.id]);
  }

  delete(catalogue: ICatalogueAll): void {
    const title = this.translate.instant('CATALOGUE.DELETED.TITLE');
    const content = this.translate.instant('CATALOGUE.DELETED.CONTENT', { name: catalogue.name });
    executeDialogNoWidth(this.dialog, DialogComponent, { title, content, value: catalogue, variant: 'warning' }, result => {
      if (result) {
        this.catalogueStore.delete(result.id, result.name);
      }
    });
  }
}
