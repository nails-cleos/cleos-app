import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { UnavailableComponent } from './unavailable.component';

@Component({
  selector: 'app-unavailable-details-page',
  template: '<app-unavailable [id]="id()" />',
  imports: [UnavailableComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UnavailableDetailsPageComponent {
  id = input<string>();
}
