import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { CatalogueComponent } from './catalogue.component';

@Component({
  selector: 'app-catalogue-details-page',
  template: '<app-catalogue [id]="id()" />',
  imports: [CatalogueComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CatalogueDetailsPageComponent {
  id = input<string>();
}
