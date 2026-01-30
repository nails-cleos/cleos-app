import { ChangeDetectionStrategy, Component, computed, effect, inject } from '@angular/core';
import { Store } from '@ngrx/store';
import { getAllTreatmentsHistory, getTreatmentGroup, treatmentSelected } from '../../store/treatment.actions';
import { SharedModule } from '../../shared/shared.module';
import { DurationTimePipe } from '../../pipes/durationTime.pipe';
import { TreatmentTableComponent } from '../table/treatment-table.component';
import { BackButtonDirective } from '../../directives/back-button.directive';
import { TreatmentState } from '../../store/reducers/treatment.reducers';
import {
  getCurrentTreatmentIdPipe,
  getHistoriesPipe,
  getSelectedTreatmentPipe,
} from '../../store/selectors/treatment.selectors';
import { toSignal } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-treatment-view',
  templateUrl: './treatment-view.component.html',
  styleUrls: ['./treatment-view.component.scss'],
  imports: [SharedModule, DurationTimePipe, TreatmentTableComponent, BackButtonDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TreatmentViewComponent {
  private readonly store: Store<TreatmentState> = inject(Store<TreatmentState>);

  private treatmentId$ = this.store.pipe(getCurrentTreatmentIdPipe);
  private treatmentGroup$ = this.store.pipe(getSelectedTreatmentPipe);
  private histories$ = this.store.pipe(getHistoriesPipe);

  private treatmentIdSignal = toSignal(this.treatmentId$);
  private treatmentGroupSignal = toSignal(this.treatmentGroup$);

  historiesSignal = toSignal(this.histories$);

  treatmentGroup = computed(() => {
    const group = this.treatmentGroupSignal();
    const histories = this.historiesSignal();
    if (!group) {
      return group;
    }
    const updatedGroup = { ...group };

    updatedGroup.treatments = group.treatments?.map(treatment => {
      if (treatment.id === this.treatmentId) {
        return { ...treatment, showHistory: true, history: histories };
      }
      return treatment;
    });

    return updatedGroup;
  });


  expandedPanelIndex: number = 0;

  private treatmentId?: string;

  constructor() {
    effect(() => {
      const id = this.treatmentIdSignal();
      if (id) {
        this.store.dispatch(getTreatmentGroup({ id, path: 'view' }));
      }
    });
  }

  edit() {
    this.store.dispatch(treatmentSelected({ selected: this.treatmentGroupSignal(), path: 'edit' }));
  }

  getHistory = (treatmentId?: string, index?: number): void => {
    const id = this.treatmentGroupSignal()?.id;
    if (!id) {
      return;
    }
    this.treatmentId = treatmentId;
    if (index !== undefined) {
      this.expandedPanelIndex = index;
    }
    this.store.dispatch(getAllTreatmentsHistory({ id: id, treatmentId: treatmentId! }));
  };
}

