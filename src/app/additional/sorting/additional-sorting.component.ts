import { ChangeDetectionStrategy, Component, computed, effect, inject } from '@angular/core';
import {
  DragDropSortingComponent,
  ISorted,
  ItemSorting,
} from '../../util/drag-drop-sorting/drag-drop-sorting.component';
import { IAdditionalAll } from '../../interfaces/additional';
import { TranslatePipe } from '@ngx-translate/core';
import { AdditionalStore } from '../../store/additional.store';

@Component({
  selector: 'app-sorting',
  templateUrl: './additional-sorting.component.html',
  styleUrls: ['./additional-sorting.component.scss'],
  imports: [DragDropSortingComponent, TranslatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdditionalSortingComponent {
  private readonly additionalStore = inject(AdditionalStore);

  private additionalListSignal = computed(() => {
    const data = this.additionalStore.data();
    return data?.kind === 'list' ? data.value : undefined;
  });
  private responseSignal = this.additionalStore.response;

  itemsSignal = computed(() => this.additionalListSignal()?.map(
    (iAdditionalAll: IAdditionalAll) => new ItemSorting(iAdditionalAll.id, iAdditionalAll.name, iAdditionalAll.order)));

  constructor() {
    this.additionalStore.clean();
    this.additionalStore.loadList();
    effect(() => {
      if (this.responseSignal()) {
        this.additionalStore.clearResponse();
        this.additionalStore.loadList();
      }
    });
  }

  sorted = (additionalList: ISorted[]): void => this.additionalStore.sort(additionalList);
}
