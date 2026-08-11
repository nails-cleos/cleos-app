import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
} from '@angular/core';
import {
  CdkDrag,
  CdkDragDrop,
  CdkDragHandle,
  CdkDragPreview,
  CdkDropList,
  moveItemInArray,
} from '@angular/cdk/drag-drop';
import { ICatalogueAll } from '../catalogue';
import { DialogComponent } from '@app/shared/dialog/generic/dialog.component';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { MatDialog } from '@angular/material/dialog';
import { executeDialogNoWidth } from '@app/util/helper';
import { MatIcon } from '@angular/material/icon';
import { MatButton } from '@angular/material/button';
import { RouterLink } from '@angular/router';
import { CatalogueStore } from '@app/store/catalogue.store';
import { CardListSkeletonComponent } from '@app/shared/skeleton/card-list-skeleton.component';
import { NavigationService } from '@app/services/navigation.service';

@Component({
  selector: 'app-catalogue-list',
  templateUrl: './catalogue-list.component.html',
  styleUrls: ['./catalogue-list.component.scss'],
  imports: [
    MatIcon,
    MatButton,
    TranslatePipe,
    RouterLink,
    CdkDropList,
    CdkDrag,
    CdkDragHandle,
    CdkDragPreview,
    CardListSkeletonComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CatalogueListComponent {
  private readonly translateService: TranslateService =
    inject(TranslateService);
  private readonly navigationService: NavigationService =
    inject(NavigationService);
  private readonly dialog: MatDialog = inject(MatDialog);
  private readonly catalogueStore = inject(CatalogueStore);
  private readonly responseSignal = this.catalogueStore.response;
  private readonly cataloguesSignal = this.catalogueStore.data;
  private readonly isLoadingSignal = this.catalogueStore.isLoading;

  catalogues = computed(() => {
    const list = this.cataloguesSignal() || [];
    return list.map((it) =>
      it.blob ? { ...it, image: `data:image/jpeg;base64,${it.blob}` } : it,
    );
  });
  isLoading = computed(() => this.isLoadingSignal());

  readonly language: string = this.navigationService.language;

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
    this.navigationService.navigate(['catalogues', selected.id]);
  }

  delete(catalogue: ICatalogueAll): void {
    const title = this.translateService.instant('CATALOGUE.DELETED.TITLE');
    const content = this.translateService.instant('CATALOGUE.DELETED.CONTENT', {
      name: catalogue.name,
    });
    executeDialogNoWidth(
      this.dialog,
      DialogComponent,
      { title, content, value: catalogue, variant: 'warning' },
      (result) => {
        if (result) {
          this.catalogueStore.delete(result.id, result.name);
        }
      },
    );
  }
}
