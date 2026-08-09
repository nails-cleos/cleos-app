import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  input,
} from '@angular/core';
import { ICommon } from '../interfaces/common';
import { ITreatmentGroup } from './treatment';
import { TreatmentStore } from '../store/treatment.store';
import { SkeletonComponent } from '../shared/skeleton/skeleton.component';
import { TreatmentComponent } from './treatment.component';

@Component({
  selector: 'app-treatment-edit-page',
  template: `
    @if (treatment(); as treatment) {
      <app-treatment
        [config]="config"
        [treatment]="treatment"
        (submitData)="submit($event)"
      />
    } @else {
      <app-skeleton [boxes]="1" />
    }
  `,
  imports: [TreatmentComponent, SkeletonComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TreatmentEditPageComponent {
  id = input.required<string>();
  config: ICommon = {
    title: 'TREATMENT.DETAIL',
    button: { icon: 'published_with_changes', label: 'COMMON.BUTTON.UPDATE' },
  };

  private readonly treatmentStore = inject(TreatmentStore);
  treatment = computed(() => this.treatmentStore.selected());

  constructor() {
    effect(() => {
      this.treatmentStore.clean();
      this.treatmentStore.loadById(this.id());
    });
  }

  submit(treatmentGroup: ITreatmentGroup): void {
    this.treatmentStore.update(this.id(), treatmentGroup);
  }
}
