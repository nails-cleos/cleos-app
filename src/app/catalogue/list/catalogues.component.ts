import { ChangeDetectionStrategy, Component, computed, effect, inject } from '@angular/core';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { Store } from '@ngrx/store';
import {
  catalogueSelected,
  cleanCatalogue,
  deleteCatalogue,
  getAllCatalogues,
  updateCatalogueOrder,
} from '../../store/catalogue.actions';
import { ICatalogueAll } from '../../interfaces/catalogue';
import { DialogComponent } from '../../shared/dialog/generic/dialog.component';
import { TranslateService } from '@ngx-translate/core';
import { MatDialog } from '@angular/material/dialog';
import { executeDialogNoWidth } from '../../util/helper';
import { SharedModule } from '../../shared/shared.module';
import { getCatalogueListPipe, getCatalogueResponsePipe } from '../../store/selectors/catalogue.selectors';
import { toSignal } from '@angular/core/rxjs-interop';
import { CatalogueState } from '../../store/reducers/catalogue.reducers';

@Component({
  selector: 'app-catalogue-list',
  templateUrl: './catalogues.component.html',
  styleUrls: ['./catalogues.component.scss'],
  imports: [SharedModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CataloguesComponent {
  private readonly translate: TranslateService = inject(TranslateService);
  private readonly dialog: MatDialog = inject(MatDialog);
  private readonly store: Store<CatalogueState> = inject(Store<CatalogueState>);

  private response$ = this.store.pipe(getCatalogueResponsePipe);
  private catalogues$ = this.store.pipe(getCatalogueListPipe);

  private responseSignal = toSignal(this.response$);
  private cataloguesSignal = toSignal(this.catalogues$);

  catalogues = computed(() => {
    const list = this.cataloguesSignal() || [];
    return list.filter(it => it?.id).map(it => it.blob ? { ...it, image: `data:image/jpeg;base64,${it.blob}` } : it);
  });

  language: string = this.translate.getCurrentLang();

  constructor() {
    effect(() => {
      if (this.responseSignal()) {
        this.store.dispatch(cleanCatalogue());
        this.store.dispatch(getAllCatalogues());
      }
    });
  }

  drop(event: CdkDragDrop<ICatalogueAll[]>): void {
    moveItemInArray(this.catalogues(), event.previousIndex, event.currentIndex);
  }

  finish(): void {
    this.store.dispatch(updateCatalogueOrder({ catalogues: this.catalogues() }));
  }

  edit(selected: ICatalogueAll): void {
    this.store.dispatch(catalogueSelected({ selected }));
  }

  delete(catalogue: ICatalogueAll): void {
    const title = this.translate.instant('CATALOGUE.DELETED.TITLE');
    const content = this.translate.instant('CATALOGUE.DELETED.CONTENT', { name: catalogue.name });
    executeDialogNoWidth(this.dialog, DialogComponent, { title, content, value: catalogue }, result => {
      if (result) {
        this.store.dispatch(deleteCatalogue({ id: result.id, name: result.name }));
      }
    });
  }
}
