import { ChangeDetectionStrategy, Component, computed, effect, inject } from '@angular/core';
import { ICatalogueAll } from '../../interfaces/catalogue';
import { Store } from '@ngrx/store';
import { MainContentService } from '../../services/main-content.service';
import { getImage } from '../../util/file';
import { getCatalogueListPipe } from '../../store/selectors/catalogue.selectors';
import { toSignal } from '@angular/core/rxjs-interop';
import { AppMaterialModule } from '../../util/app-material.module';
import { TranslatePipe } from '@ngx-translate/core';
import { CatalogueState } from '../../store/reducers/catalogue.reducers';

@Component({
  selector: 'app-catalog',
  templateUrl: './catalog.component.html',
  styleUrls: ['./catalog.component.scss'],
  imports: [AppMaterialModule, TranslatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CatalogComponent {
  private readonly store: Store<CatalogueState> = inject(Store<CatalogueState>);
  private readonly mainContent: MainContentService = inject(MainContentService);

  private catalogues$ = this.store.pipe(getCatalogueListPipe);

  private cataloguesSignal = toSignal(this.catalogues$);

  catalogues = computed(() => {
    const catalogues: ICatalogueAll[] = [];
    this.cataloguesSignal()?.forEach((it?: ICatalogueAll) => {
      if (it?.blob) {
        const image = getImage(it.blob, it.contentType);
        catalogues.push({ ...it, image });
      }
    });

    return catalogues;
  });

  constructor() {
    effect(() => {
      if (this.catalogues().length) {
        this.mainContent.configure(false, 'open');
      }
    });
  }
}

