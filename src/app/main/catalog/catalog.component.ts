import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { ICatalogueAll } from '../../interfaces/catalogue';
import { Store } from '@ngrx/store';
import { getImage } from '../../util/file';
import { getCatalogueListPipe } from '../../store/selectors/catalogue.selectors';
import { toSignal } from '@angular/core/rxjs-interop';
import { TranslatePipe } from '@ngx-translate/core';
import { CatalogueState } from '../../store/reducers/catalogue.reducers';
import { MatIcon } from '@angular/material/icon';
import {
  MatCard,
  MatCardActions,
  MatCardContent,
  MatCardHeader, MatCardMdImage,
  MatCardSubtitle,
  MatCardTitle,
} from '@angular/material/card';

@Component({
  selector: 'app-catalog',
  templateUrl: './catalog.component.html',
  styleUrls: ['./catalog.component.scss'],
  imports: [MatIcon, TranslatePipe, MatCard, MatCardHeader, MatCardTitle, MatCardSubtitle, MatCardContent,
    MatCardActions, MatCardMdImage],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CatalogComponent {
  private readonly store: Store<CatalogueState> = inject(Store<CatalogueState>);

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
}
