import { ChangeDetectionStrategy, Component, computed, effect, inject } from '@angular/core';
import {
  DragDropSortingComponent,
  ISorted,
  ItemSorting,
} from '../../util/drag-drop-sorting/drag-drop-sorting.component';
import { Store } from '@ngrx/store';
import { getAllTreatmentsGroup, sortGroupTreatment } from '../../store/actions/treatment.actions';
import { ITreatmentGroupAll } from '../../interfaces/treatment';
import { getTreatmentGroupListPipe, getTreatmentResponsePipe } from '../../store/selectors/treatment.selectors';
import { toSignal } from '@angular/core/rxjs-interop';
import { TreatmentState } from '../../store/reducers/treatment.reducers';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-treatment-group-sorting',
  templateUrl: './treatment-sorting.component.html',
  styleUrls: ['./treatment-group-sorting.component.scss'],
  imports: [TranslatePipe, DragDropSortingComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TreatmentGroupSortingComponent {
  private readonly store: Store<TreatmentState> = inject(Store<TreatmentState>);

  private treatmentGroupList$ = this.store.pipe(getTreatmentGroupListPipe);
  private response$ = this.store.pipe(getTreatmentResponsePipe);

  private treatmentGroupListSignal = toSignal(this.treatmentGroupList$);
  private responseSignal = toSignal(this.response$);

  itemsSignal = computed(() => this.treatmentGroupListSignal()?.map(
    (group: ITreatmentGroupAll) => new ItemSorting(group.id, group.name, group.order)));

  constructor() {
    effect(() => {
      if (this.responseSignal()) {
        this.store.dispatch(getAllTreatmentsGroup());
      }
    });
  }

  sorted = (groups: ISorted[]): void => this.store.dispatch(sortGroupTreatment({ groups }));
}
