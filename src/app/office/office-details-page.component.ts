import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { OfficeComponent } from './office.component';

@Component({
  selector: 'app-office-details-page',
  template: '<app-office [id]="id()" />',
  imports: [OfficeComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OfficeDetailsPageComponent {
  id = input<string>();
}
