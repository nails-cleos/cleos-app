import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { AdditionalComponent } from './additional.component';

@Component({
  selector: 'app-additional-details-page',
  template: '<app-additional [id]="id()" />',
  imports: [AdditionalComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdditionalDetailsPageComponent {
  id = input<string>();
}
