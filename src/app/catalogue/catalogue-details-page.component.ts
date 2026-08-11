import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  input,
} from '@angular/core';
import { CatalogueComponent } from './catalogue.component';
import { CatalogueStore } from '../store/catalogue.store';
import { ICatalogue } from './catalogue';
import { ICommon } from '../interfaces/common';
import { SkeletonComponent } from '../shared/skeleton/skeleton.component';

@Component({
  selector: 'app-catalogue-details-page',
  template: `
    @if (catalogue(); as catalogue) {
      <app-catalogue
        [undoImage]="true"
        [catalogue]="catalogue"
        [config]="config"
        (submitData)="submit($event)"
      />
    } @else {
      <app-skeleton />
    }
  `,
  imports: [CatalogueComponent, SkeletonComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CatalogueDetailsPageComponent {
  id = input.required<string>();
  config: ICommon = {
    title: 'CATALOGUE.DETAIL',
    button: { icon: 'published_with_changes', label: 'COMMON.BUTTON.UPDATE' },
  };

  private readonly catalogueStore = inject(CatalogueStore);
  catalogue = computed(() => this.catalogueStore.selected());

  constructor() {
    effect(() => {
      this.catalogueStore.clean();
      this.catalogueStore.loadById(this.id());
    });
  }

  submit(data: { catalogue: ICatalogue; resizedImageDataUrl: string }) {
    this.catalogueStore.update(
      this.id(),
      data.catalogue,
      data.resizedImageDataUrl,
    );
  }
}
