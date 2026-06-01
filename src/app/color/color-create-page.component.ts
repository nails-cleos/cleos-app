import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ColorComponent } from './color.component';

@Component({
  selector: 'app-color-create-page',
  template: '<app-color />',
  imports: [ColorComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ColorCreatePageComponent {}
