import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { TreatmentComponent } from './treatment.component';

@Component({
  selector: 'app-treatment-view-page',
  template: '<app-treatment [id]="id()" mode="view" />',
  imports: [TreatmentComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TreatmentViewPageComponent {
  id = input<string>();
}
