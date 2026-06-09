import { ChangeDetectionStrategy, Component, computed, effect, inject, input, signal } from '@angular/core';
import { Router } from '@angular/router';
import { MatButton } from '@angular/material/button';
import { MatChip, MatChipListbox } from '@angular/material/chips';
import { MatIcon } from '@angular/material/icon';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { BackButtonDirective } from '../../directives/back-button.directive';
import { DurationTimePipe } from '../../pipes/durationTime.pipe';
import { TreatmentStore } from '../../store/treatment.store';
import { SkeletonComponent } from '../../shared/skeleton.component';
import { TreatmentTableComponent } from '../table/treatment-table.component';

@Component({
  selector: 'app-treatment-view',
  templateUrl: './treatment-view.component.html',
  styleUrls: ['./treatment-view.component.scss'],
  imports: [TranslatePipe, BackButtonDirective, MatButton, MatIcon, MatChipListbox, MatChip, DurationTimePipe,
    TreatmentTableComponent, SkeletonComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TreatmentViewComponent {
  id = input.required<string>();

  private readonly treatmentStore = inject(TreatmentStore);
  private readonly translate = inject(TranslateService);
  private readonly router = inject(Router);

  private selectedHistoryTreatmentId = signal<string | undefined>(undefined);

  language: string = this.translate.getCurrentLang();

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

    this.router.navigate([this.language, 'treatments', id, 'edit']);
  }

  getHistory(treatmentId: string): void {
    const id = this.id();

    this.selectedHistoryTreatmentId.set(treatmentId);
    this.treatmentStore.loadHistory(id, treatmentId);
  }
}
