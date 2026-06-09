import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ICommon } from '../interfaces/common';
import { ITreatmentGroup } from './treatment';
import { TreatmentStore } from '../store/treatment.store';
import { TreatmentComponent } from './treatment.component';

@Component({
  selector: 'app-treatment-create-page',
  template: '<app-treatment [config]="config" (submitData)="submit($event)" />',
  imports: [TreatmentComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TreatmentCreatePageComponent {
  config: ICommon = {
    title: 'TREATMENT.TITLE',
    button: { icon: 'add', label: 'COMMON.BUTTON.CREATE' },
  };

  private readonly treatmentStore = inject(TreatmentStore);

  constructor() {
    this.treatmentStore.clean();
  }

  submit(treatmentGroup: ITreatmentGroup): void {
    this.treatmentStore.create(treatmentGroup);
  }
}
