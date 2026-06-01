import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { TreatmentComponent } from './treatment.component';

@Component({
  selector: 'app-treatment-edit-page',
  template: '<app-treatment [id]="id()" mode="edit" />',
  imports: [TreatmentComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TreatmentEditPageComponent {
  id = input<string>();
}
