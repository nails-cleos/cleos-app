import { effect, inject, Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { toSignal } from '@angular/core/rxjs-interop';
import { TranslateService } from '@ngx-translate/core';
import { getI18NLanguagePipe } from '../store/selectors/i18n.selectors';

@Injectable({ providedIn: 'root' })
export class I18nBridgeService {
  private readonly store = inject(Store);
  private readonly translate = inject(TranslateService);

  private readonly languageSignal = toSignal(this.store.pipe(getI18NLanguagePipe),
    { initialValue: this.translate.getCurrentLang() });

  constructor() {
    effect(() => {
      const lang = this.languageSignal();
      if (!lang || this.translate.getCurrentLang() === lang) {
        return;
      }

      this.translate.use(lang);
    });
  }
}
