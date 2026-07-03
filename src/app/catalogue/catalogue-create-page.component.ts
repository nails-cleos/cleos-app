import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CatalogueComponent } from './catalogue.component';
import { CatalogueStore } from '../store/catalogue.store';
import { ICatalogue } from './catalogue';
import { ICommon } from '../interfaces/common';

@Component({
  selector: 'app-catalogue-create-page',
  template: '<app-catalogue [config]="config" (submitData)="submit($event)" />',
  imports: [CatalogueComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CatalogueCreatePageComponent {
  private readonly catalogueStore = inject(CatalogueStore);
  config: ICommon = {
    title: 'CATALOGUE.TITLE',
    button: { icon: 'add', label: 'COMMON.BUTTON.CREATE' },
  };

  constructor() {
    this.catalogueStore.clean();
  }

  submit(data: { catalogue: ICatalogue, resizedImageDataUrl: string; }) {
    this.catalogueStore.create(data.catalogue, data.resizedImageDataUrl);
  }
}
