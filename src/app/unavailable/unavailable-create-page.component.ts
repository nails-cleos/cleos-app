import { ChangeDetectionStrategy, Component } from '@angular/core';
import { UnavailableComponent } from './unavailable.component';

@Component({
  selector: 'app-unavailable-create-page',
  template: '<app-unavailable />',
  imports: [UnavailableComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UnavailableCreatePageComponent {}
