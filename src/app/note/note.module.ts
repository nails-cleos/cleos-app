import { NgModule } from '@angular/core';
import { NoteComponent } from './note.component';
import { SharedModule } from '../shared/shared.module';
import { MissingTranslationHandler, TranslateLoader, TranslateModule, TranslateService } from '@ngx-translate/core';
import { MissingTranslateHandler, TranslateLoaderFactory } from '../shared/translate-loader.factory';
import { EffectsModule } from '@ngrx/effects';
import { NoteRoutingModule } from './note-routing.module';
import { NoteService } from '../services/note.service';
import { NoteEffects } from '../store/effects/note.effects';
import { UserService } from '../services/user.service';

@NgModule({
  declarations: [
    NoteComponent
  ],
  imports: [
    NoteRoutingModule,
    SharedModule,
    TranslateModule.forChild({
      loader: {
        provide: TranslateLoader,
        useClass: TranslateLoaderFactory.forModule('note')
      },
      missingTranslationHandler: {
        provide: MissingTranslationHandler,
        useClass: MissingTranslateHandler,
      },
      isolate: false,
      extend: true
    }),
    EffectsModule.forFeature([NoteEffects])
  ],
  providers: [
    NoteService,
    UserService
  ]
})
export class NoteModule {
  constructor(protected translateService: TranslateService) {
    const currentLang = translateService.currentLang;
    translateService.currentLang = '';
    translateService.use(currentLang);
  }
}
