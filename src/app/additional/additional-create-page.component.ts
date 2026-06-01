import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AdditionalComponent } from './additional.component';

@Component({
  selector: 'app-additional-create-page',
  template: '<app-additional />',
  imports: [AdditionalComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdditionalCreatePageComponent {}
