import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CatalogueComponent } from './catalogue.component';

@Component({
  selector: 'app-catalogue-create-page',
  template: '<app-catalogue />',
  imports: [CatalogueComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CatalogueCreatePageComponent {}
