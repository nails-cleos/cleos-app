import { NgModule } from '@angular/core';
import { MissingTranslationHandler, TranslateLoader, TranslateModule, TranslateService } from '@ngx-translate/core';
import { SharedModule } from '../shared/shared.module';
import { RoomRoutingModule } from './room-routing.module';

import { RoomsComponent } from './list/rooms.component';
import { RoomComponent } from './room.component';
import { RoomMeComponent } from './me/room-me.component';
import { RoomDetailComponent } from './detail/room-detail.component';
import { AvailabilityComponent } from './availability/availability.component';
import { EffectsModule } from '@ngrx/effects';
import { RoomEffects } from '../store/effects/room.effects';
import { RoomService } from '../services/room.service';
import { UserService } from '../services/user.service';
import { AddServiceComponent, PriceDialogComponent } from './me/add-service/add-service.component';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { MissingTranslateHandler, TranslateLoaderFactory } from '../shared/translate-loader.factory';
import { ExpenseService } from '../services/expense.service';
import { ExpensesComponent } from './me/expense/list/expenses.component';
import { ExpenseComponent } from './me/expense/expense.component';
import { ExpenseEffects } from '../store/effects/expense.effects';

@NgModule({
  declarations: [
    RoomsComponent,
    RoomComponent,
    RoomMeComponent,
    RoomDetailComponent,
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
    EffectsModule.forFeature([RoomEffects, ExpenseEffects]),
    DragDropModule
  ],
  providers: [
    RoomService,
    UserService,
    ExpenseService
  ]
})
export class RoomModule {
  constructor(protected translateService: TranslateService) {
    const currentLang = translateService.currentLang;
    translateService.currentLang = '';
    translateService.use(currentLang);
  }
}
