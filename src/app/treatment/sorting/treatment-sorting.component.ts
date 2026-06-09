import { ChangeDetectionStrategy, Component, computed, effect, inject, input } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { ITreatmentAll } from '../../interfaces/treatment';
import { TreatmentStore } from '../../store/treatment.store';
import {
  DragDropSortingComponent,
  ISorted,
  ItemSorting,
} from '../../util/drag-drop-sorting/drag-drop-sorting.component';

@Component({
  selector: 'app-treatment-sorting',
  templateUrl: './treatment-sorting.component.html',
  styleUrls: ['./treatment-sorting.component.scss'],
  imports: [TranslatePipe, DragDropSortingComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TreatmentSortingComponent {
  id = input.required<string>();

  private readonly treatmentStore = inject(TreatmentStore);

  itemsSignal = computed(() => this.treatmentStore.selected()?.treatments?.map(
    (treatment: ITreatmentAll) => new ItemSorting(treatment.id, treatment.name, treatment.order)));

  constructor() {
    this.treatmentStore.clean();

    effect(() => {
      this.treatmentStore.response();
      this.treatmentStore.loadById(this.id());
    });
  }

  sorted = (treatments: ISorted[]): void => this.treatmentStore.sortTreatments(treatments);
}
