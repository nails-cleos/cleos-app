import { ChangeDetectionStrategy, Component, computed, effect, inject } from '@angular/core';
import { Store } from '@ngrx/store';
import { ITreatmentAll } from '../../interfaces/treatment';
import { getTreatmentGroup, sortTreatment } from '../../store/treatment.actions';
import {
  DragDropSortingComponent,
  ISorted,
  ItemSorting,
} from '../../util/drag-drop-sorting/drag-drop-sorting.component';
import { SharedModule } from '../../shared/shared.module';
import { TreatmentState } from '../../store/reducers/treatment.reducers';
import {
  getCurrentTreatmentIdPipe,
  getTreatmentResponsePipe,
  getSelectedTreatmentPipe,
} from '../../store/selectors/treatment.selectors';
import { toSignal } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-treatment-sorting',
  templateUrl: './treatment-sorting.component.html',
  styleUrls: ['./treatment-sorting.component.scss'],
  imports: [SharedModule, DragDropSortingComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TreatmentSortingComponent {
  private readonly store: Store<TreatmentState> = inject(Store<TreatmentState>);

  private treatmentId$ = this.store.pipe(getCurrentTreatmentIdPipe);
  private treatmentGroup$ = this.store.pipe(getSelectedTreatmentPipe);
  private response$ = this.store.pipe(getTreatmentResponsePipe);

  private treatmentIdSignal = toSignal(this.treatmentId$);
  private treatmentGroupSignal = toSignal(this.treatmentGroup$);
  private responseSignal = toSignal(this.response$);

  itemsSignal = computed(() => this.treatmentGroupSignal()?.treatments?.map(
    (treatment: ITreatmentAll) => new ItemSorting(treatment.id, treatment.name, treatment.order)));

  constructor() {
    effect(() => {
      const id = this.treatmentIdSignal();
      this.responseSignal();
      if (id) {
        this.store.dispatch(getTreatmentGroup({ id, path: 'sorting' }));
      }
    });
  }

  sorted = (treatments: ISorted[]): void => {
    this.store.dispatch(sortTreatment({ treatments }));
  };

}
