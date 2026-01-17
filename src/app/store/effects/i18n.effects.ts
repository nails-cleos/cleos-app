import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { tap } from 'rxjs/operators';
import { TranslateService } from '@ngx-translate/core';
import { setLanguage } from '../i18n.actions';

@Injectable()
export class I18NEffects {
  private readonly translate: TranslateService = inject(TranslateService);
  private readonly actions: Actions = inject(Actions);

  setLanguage$ = createEffect(() => this.actions.pipe(
    ofType(setLanguage),
    tap(({ language }) => this.translate.use(language)),
  ), { dispatch: false });
}
