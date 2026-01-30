import { ChangeDetectionStrategy, Component, computed, effect, inject } from '@angular/core';
import {
  DragDropSortingComponent,
  ISorted,
  ItemSorting,
} from '../../util/drag-drop-sorting/drag-drop-sorting.component';
import { Store } from '@ngrx/store';
import { IAdditionalAll } from '../../interfaces/additional';
import { SharedModule } from '../../shared/shared.module';
import { getAdditionalList, sortAdditional } from '../../store/additional.actions';
import { getAdditionalListPipe, getAdditionalResponsePipe } from '../../store/selectors/additional.selectors';
import { toSignal } from '@angular/core/rxjs-interop';
import { AdditionalState } from '../../store/reducers/additional.reducers';

@Component({
  selector: 'app-sorting',
  templateUrl: './additional-sorting.component.html',
  styleUrls: ['./additional-sorting.component.scss'],
  imports: [SharedModule, DragDropSortingComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdditionalSortingComponent {
  private readonly store: Store<AdditionalState> = inject(Store<AdditionalState>);

  private additionalList$ = this.store.pipe(getAdditionalListPipe);
  private response$ = this.store.pipe(getAdditionalResponsePipe);

  private additionalListSignal = toSignal(this.additionalList$);
  private responseSignal = toSignal(this.response$);

  itemsSignal = computed(() => this.additionalListSignal()?.map(
    (iAdditionalAll: IAdditionalAll) => new ItemSorting(iAdditionalAll.id, iAdditionalAll.name, iAdditionalAll.order)));

  constructor() {
    effect(() => {
      if (this.responseSignal()) {
        this.store.dispatch(getAdditionalList());
      }
    });
  }

  sorted = (additionalList: ISorted[]): void => this.store.dispatch(sortAdditional({ additionalList }));
}
