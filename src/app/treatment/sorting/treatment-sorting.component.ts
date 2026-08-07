import { ChangeDetectionStrategy, Component, computed, effect, inject, input } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { ITreatmentAll } from '../treatment';
import { TreatmentStore } from '@app/store/treatment.store';
import {
  DragDropSortingComponent,
  ISorted,
  ItemSorting,
} from '@app/util/drag-drop-sorting/drag-drop-sorting.component';
import { CardListSkeletonComponent } from '@app/shared/skeleton/card-list-skeleton.component';

@Component({
  selector: 'app-treatment-sorting',
  templateUrl: './treatment-sorting.component.html',
  styleUrls: ['./treatment-sorting.component.scss'],
  imports: [TranslatePipe, DragDropSortingComponent, CardListSkeletonComponent],
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
