import { ChangeDetectionStrategy, Component, computed, effect, inject, input, signal } from '@angular/core';
import { MatButton } from '@angular/material/button';
import { MatChip, MatChipListbox } from '@angular/material/chips';
import { MatIcon } from '@angular/material/icon';
import { TranslatePipe } from '@ngx-translate/core';
import { BackButtonDirective } from '../../directives/back-button.directive';
import { DurationTimePipe } from '../../pipes/durationTime.pipe';
import { TreatmentStore } from '../../store/treatment.store';
import { SkeletonComponent } from '../../shared/skeleton/skeleton.component';
import { TableSkeletonColumn, TableSkeletonComponent } from '../../shared/skeleton/table-skeleton.component';
import { TreatmentTableComponent } from '../table/treatment-table.component';
import { NavigationService } from '../../services/navigation.service';

@Component({
  selector: 'app-treatment-view',
  templateUrl: './treatment-view.component.html',
  styleUrls: ['./treatment-view.component.scss'],
  imports: [TranslatePipe, BackButtonDirective, MatButton, MatIcon, MatChipListbox, MatChip, DurationTimePipe,
    TreatmentTableComponent, SkeletonComponent, TableSkeletonComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TreatmentViewComponent {
  id = input.required<string>();

  private readonly treatmentStore = inject(TreatmentStore);
  private readonly navigationService: NavigationService = inject(NavigationService);

  private selectedHistoryTreatmentId = signal<string | undefined>(undefined);
  readonly historyTableColumns: TableSkeletonColumn[] = [
    { key: 'date' },
    { key: 'price' },
    { key: 'duration', hideOnMobile: true },
  ];

  historyLoading = computed(() => !!this.selectedHistoryTreatmentId() && this.treatmentStore.isLoading());

  treatment = computed(() => {
    const group = this.treatmentStore.selected();
    const histories = this.treatmentStore.history();
    const selectedHistoryTreatmentId = this.selectedHistoryTreatmentId();

    if (!group) {
      return group;
    }

    return {
      ...group,
      treatments: group.treatments?.map(treatment => {
        if (treatment.id === selectedHistoryTreatmentId) {
          return { ...treatment, showHistory: true, history: histories };
        }
        return treatment;
      }),
    };
  });

  constructor() {
    effect(() => {
      this.treatmentStore.clean();
      this.treatmentStore.loadById(this.id());
    });
  }

  edit(): void {
    const id = this.treatment()?.id;
    if (!id) {
      return;
    }

    this.navigationService.navigate(['treatments', id, 'edit']);
  }

  getHistory(treatmentId: string): void {
    const id = this.id();

    this.selectedHistoryTreatmentId.set(treatmentId);
    this.treatmentStore.loadHistory(id, treatmentId);
  }
}
