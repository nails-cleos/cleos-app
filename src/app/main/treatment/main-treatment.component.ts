import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';
import { IMainTreatmentContent, IMainTreatmentContentFile, sections } from '@app/util/MainTreatment';
import { NgClass, NgOptimizedImage } from '@angular/common';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { combineLatest, map, of, switchMap } from 'rxjs';
import { TranslateLoaderFactory } from '@app/shared/translate-loader.factory';
import { MatDivider, MatList } from '@angular/material/list';
import { MainContentService } from '@app/services/main-content.service';
import { NavigationService } from '@app/services/navigation.service';

@Component({
  selector: 'app-main-treatment',
  templateUrl: './main-treatment.component.html',
  styleUrl: './main-treatment.component.scss',
  imports: [MatList, NgOptimizedImage, NgClass, MatDivider],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MainTreatmentComponent {
  id = input<string>();

  private readonly mainContent = inject(MainContentService);
  private readonly navigationService: NavigationService = inject(NavigationService);

  private sections$ = combineLatest([toObservable(this.id), toObservable(this.navigationService.language$)]).pipe(
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
