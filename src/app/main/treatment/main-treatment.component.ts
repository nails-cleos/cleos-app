import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';
import { IMainTreatmentContent, IMainTreatmentContentFile, sections } from '../../util/MainTreatment';
import { NgClass, NgOptimizedImage } from '@angular/common';
import { getCurrentLangPipe } from '../../store/selectors/main.selectors';
import { Store } from '@ngrx/store';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { MainState } from '../../store/reducers/main.reducers';
import { combineLatest, map, of, switchMap } from 'rxjs';
import { TranslateLoaderFactory } from '../../shared/translate-loader.factory';
import { MatDivider, MatList } from '@angular/material/list';

@Component({
  selector: 'app-main-treatment',
  templateUrl: './main-treatment.component.html',
  styleUrl: './main-treatment.component.scss',
  imports: [MatList, NgOptimizedImage, NgClass, MatDivider],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MainTreatmentComponent {
  id = input<string>();

  private readonly store: Store<MainState> = inject(Store<MainState>);

  private lang$ = this.store.pipe(getCurrentLangPipe);

  private sections$ = combineLatest([toObservable(this.id), this.lang$]).pipe(
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

  private resolveTreatment(
    treatmentId: string,
    treatments: IMainTreatmentContent[],
  ): IMainTreatmentContent | undefined {
    return treatments.find((it: IMainTreatmentContent) => it.id === treatmentId);
  }
}
