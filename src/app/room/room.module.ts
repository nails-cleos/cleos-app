import { NgModule } from '@angular/core';
import { MissingTranslationHandler, TranslateLoader, TranslateModule, TranslateService } from '@ngx-translate/core';
import { SharedModule } from '../shared/shared.module';
import { RoomRoutingModule } from './room-routing.module';

import { RoomsComponent } from './list/rooms.component';
import { RoomComponent } from './room.component';
import { AvailabilityComponent } from './availability/availability.component';
import { EffectsModule } from '@ngrx/effects';
import { RoomEffects } from '../store/effects/room.effects';
import { RoomService } from '../services/room.service';
import { UserService } from '../services/user.service';
import { AddServiceComponent, PriceDialogComponent } from './me/add-service/add-service.component';
import { MissingTranslateHandler, TranslateLoaderFactory } from '../shared/translate-loader.factory';
import { ExpenseService } from '../services/expense.service';
import { ExpensesComponent } from './me/expense/list/expenses.component';
import { ExpenseComponent } from './me/expense/expense.component';
import { ExpenseEffects } from '../store/effects/expense.effects';
import { Store } from '@ngrx/store';
import { AppState, selectI18nState } from '../store/app.states';
import { Observable } from 'rxjs';

@NgModule({
  declarations: [
    RoomsComponent,
    RoomComponent,
    AvailabilityComponent,
    AddServiceComponent,
    PriceDialogComponent,
    ExpensesComponent,
    ExpenseComponent
  ],
  imports: [
    RoomRoutingModule,
    SharedModule,
    TranslateModule.forChild({
      loader: {
        provide: TranslateLoader,
        useClass: TranslateLoaderFactory.forModule('room')
      },
      missingTranslationHandler: {
        provide: MissingTranslationHandler,
        useClass: MissingTranslateHandler,
      },
      isolate: false,
      extend: true
    }),
    EffectsModule.forFeature([RoomEffects, ExpenseEffects])
  ],
  providers: [
    RoomService,
    UserService,
    ExpenseService
  ]
})
export class RoomModule {
  constructor(private readonly store: Store<AppState>, protected translateService: TranslateService) {
    const getI18nState: Observable<any> = this.store.select(selectI18nState);
    getI18nState.subscribe(state => {
      translateService.currentLang = '';
      this.translateService.use(state.data);
    });
  }
}
