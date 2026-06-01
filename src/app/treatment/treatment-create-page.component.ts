import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TreatmentComponent } from './treatment.component';

@Component({
  selector: 'app-treatment-create-page',
  template: '<app-treatment mode="add" />',
  imports: [TreatmentComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TreatmentCreatePageComponent {}
