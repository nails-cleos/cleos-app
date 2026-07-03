import { ChangeDetectionStrategy, Component, computed, effect, inject } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { ITreatmentGroupAll } from '../treatment';
import { TreatmentStore } from '../../store/treatment.store';
import {
  DragDropSortingComponent,
  ISorted,
  ItemSorting,
} from '../../util/drag-drop-sorting/drag-drop-sorting.component';
import { CardListSkeletonComponent } from '../../shared/skeleton/card-list-skeleton.component';

@Component({
  selector: 'app-treatment-group-sorting',
  templateUrl: './treatment-sorting.component.html',
  styleUrls: ['./treatment-group-sorting.component.scss'],
  imports: [TranslatePipe, DragDropSortingComponent, CardListSkeletonComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TreatmentGroupSortingComponent {
  private readonly treatmentStore = inject(TreatmentStore);

  itemsSignal = computed(() => {
    const data = this.treatmentStore.data();
    return data?.kind === 'list'
      ? data.value.map((group: ITreatmentGroupAll) => new ItemSorting(group.id, group.name, group.order))
      : undefined;
  });

  constructor() {
    this.treatmentStore.clean();
    this.treatmentStore.loadAllGroups();

    effect(() => {
      if (this.treatmentStore.response()) {
        this.treatmentStore.loadAllGroups();
      }
    });
  }

  sorted = (groups: ISorted[]): void => this.treatmentStore.sortGroups(groups);
}
