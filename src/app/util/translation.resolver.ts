import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Resolve } from '@angular/router';
import { take } from 'rxjs';
import { Store } from '@ngrx/store';
import { I18NState } from '../store/reducers/i18n.reducers';
import { getI18NLanguagePipe } from '../store/selectors/i18n.selectors';

@Injectable({ providedIn: 'root' })
export class TranslationLoaderResolver implements Resolve<void> {
  constructor(private translate: TranslateService, private store: Store<I18NState>) {
  }

  resolve(): void {
    this.store.pipe(getI18NLanguagePipe).pipe(take(1)).subscribe(lang => {
      if (lang && this.translate.currentLang !== lang) {
        this.translate.use(lang);
      }
    });
  }
}
