import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { MainContentService } from '../../services/main-content.service';
import { TranslateService } from '@ngx-translate/core';
import { IMainTreatment, sections } from '../../util/MainTreatment';
import { NgClass, NgOptimizedImage } from '@angular/common';
import { getCurrentTreatmentIdPipe } from '../../store/selectors/main.selectors';
import { Store } from '@ngrx/store';
import { toSignal } from '@angular/core/rxjs-interop';
import { AppMaterialModule } from '../../util/app-material.module';
import { MainState } from '../../store/reducers/main.reducers';

@Component({
  selector: 'app-main-treatment',
  templateUrl: './main-treatment.component.html',
  styleUrl: './main-treatment.component.scss',
  imports: [AppMaterialModule, NgOptimizedImage, NgClass],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MainTreatmentComponent {
  private readonly store: Store<MainState> = inject(Store<MainState>);
  private readonly mainContent: MainContentService = inject(MainContentService);
  private readonly translate: TranslateService = inject(TranslateService);

  private treatmentId$ = this.store.pipe(getCurrentTreatmentIdPipe);
  private treatments$ = this.translate.stream('TREATMENTS');

  private treatmentIdSignal = toSignal(this.treatmentId$);
  private treatmentsSignal = toSignal(this.treatments$, { initialValue: [] as IMainTreatment[] });

  sections = computed(() => {
    const treatmentId = this.treatmentIdSignal();
    const treatments = this.treatmentsSignal();
    if (!treatmentId || !Array.isArray(treatments)) {
      return undefined;
    }

    const translations = treatments.find((it: IMainTreatment) => it.id === treatmentId)?.translations;
    return translations ? sections(translations) : undefined;
  });

  constructor() {
    this.mainContent.configure(false, 'open');
  }
}
