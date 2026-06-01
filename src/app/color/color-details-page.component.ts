import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { ColorComponent } from './color.component';

@Component({
  selector: 'app-color-details-page',
  template: '<app-color [id]="id()" />',
  imports: [ColorComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ColorDetailsPageComponent {
  id = input<string>();
}
