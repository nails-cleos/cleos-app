import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MainContentService } from '../../services/main-content.service';
import { IMainTreatmentContent, IMainTreatmentContentFile, sections } from '../../util/MainTreatment';
import { NgClass, NgOptimizedImage } from '@angular/common';
import { getCurrentLangPipe, getCurrentTreatmentIdPipe } from '../../store/selectors/main.selectors';
import { Store } from '@ngrx/store';
import { toSignal } from '@angular/core/rxjs-interop';
import { AppMaterialModule } from '../../util/app-material.module';
import { MainState } from '../../store/reducers/main.reducers';
import { combineLatest, map, of, switchMap } from 'rxjs';
import { TranslateLoaderFactory } from '../../shared/translate-loader.factory';

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

  private treatmentId$ = this.store.pipe(getCurrentTreatmentIdPipe);
  private lang$ = this.store.pipe(getCurrentLangPipe);

  private sections$ = combineLatest([this.treatmentId$, this.lang$]).pipe(
    switchMap(([treatmentId, lang]) => {
      if (!treatmentId) {
        return of(undefined);
      }

      return TranslateLoaderFactory.loadJson<{ default?: IMainTreatmentContentFile } & IMainTreatmentContentFile>(
        'treatment/main',
        lang,
      ).pipe(
        map((content) => (content.default ?? content).treatments ?? []),
        map((treatments: IMainTreatmentContent[]) => this.resolveTreatment(treatmentId, treatments)?.translations),
        map((translations) => translations ? sections(translations) : undefined),
      );
    }),
  );

  sections = toSignal(this.sections$, { initialValue: undefined });

  constructor() {
    this.mainContent.configure(false, 'open');
  }

  private resolveTreatment(
    treatmentId: string,
    treatments: IMainTreatmentContent[],
  ): IMainTreatmentContent | undefined {
    return treatments.find((it: IMainTreatmentContent) => it.id === treatmentId);
  }
}
