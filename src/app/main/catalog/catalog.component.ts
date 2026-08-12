import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
} from '@angular/core';
import { ICatalogueAll } from '@app/catalogue/catalogue';
import { getImage } from '@app/util/file';
import { TranslatePipe } from '@ngx-translate/core';
import { MatIcon } from '@angular/material/icon';
import {
  MatCard,
  MatCardActions,
  MatCardContent,
  MatCardHeader,
  MatCardMdImage,
  MatCardSubtitle,
  MatCardTitle,
} from '@angular/material/card';
import { CatalogueStore } from '@app/store/catalogue.store';
import { MainContentService } from '@app/services/main-content.service';

@Component({
  selector: 'app-catalog',
  templateUrl: './catalog.component.html',
  styleUrls: ['./catalog.component.scss'],
  imports: [
    MatIcon,
    TranslatePipe,
    MatCard,
    MatCardHeader,
    MatCardTitle,
    MatCardSubtitle,
    MatCardContent,
    MatCardActions,
    MatCardMdImage,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CatalogComponent {
  private readonly catalogueStore = inject(CatalogueStore);
  private readonly mainContent = inject(MainContentService);
  private readonly cataloguesSignal = this.catalogueStore.data;

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
    this.mainContent.configure(false, 'open');
    this.catalogueStore.clean();
    this.catalogueStore.loadCatalogs();
  }
}
