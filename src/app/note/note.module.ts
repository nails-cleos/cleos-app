import { NgModule } from '@angular/core';
import { NoteComponent } from './note.component';
import { MissingTranslationHandler, TranslateLoader, TranslateModule, TranslateService } from '@ngx-translate/core';
import { MissingTranslateHandler, TranslateLoaderFactory } from '../shared/translate-loader.factory';
import { provideEffects } from '@ngrx/effects';
import { NoteRoutingModule } from './note-routing.module';
import { NoteService } from '../services/note.service';
import { NoteEffects } from '../store/effects/note.effects';
import { UserService } from '../services/user.service';
import { provideState, Store } from '@ngrx/store';
import { NOTE_FEATURE_KEY, noteReducer } from '../store/reducers/note.reducers';
import { NoteNavigationEffects } from './note-navigation.effects';
import { I18NState } from '../store/reducers/i18n.reducers';
import { getI18NLanguagePipe } from '../store/selectors/i18n.selectors';

@NgModule({
  imports: [
    NoteComponent,
    NoteRoutingModule,
    TranslateModule.forChild({
      loader: {
        provide: TranslateLoader,
        useClass: TranslateLoaderFactory.forModule('note'),
      },
      missingTranslationHandler: {
        provide: MissingTranslationHandler,
        useClass: MissingTranslateHandler,
      },
      isolate: false,
      extend: true,
    }),
  ],
  providers: [
    NoteService,
    UserService,
    provideState(NOTE_FEATURE_KEY, noteReducer),
    provideEffects(NoteEffects, NoteNavigationEffects),
  ],
})
export class NoteModule {
  constructor(private readonly store: Store<I18NState>, protected translateService: TranslateService) {
    this.store.pipe(getI18NLanguagePipe).subscribe((language) => {
      this.translateService.use(language);
    });
  }
}
