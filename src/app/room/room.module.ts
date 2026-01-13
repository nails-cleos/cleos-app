import { NgModule } from '@angular/core';
import { MissingTranslationHandler, TranslateLoader, TranslateModule, TranslateService } from '@ngx-translate/core';
import { RoomRoutingModule } from './room-routing.module';

import { RoomsComponent } from './list/rooms.component';
import { RoomComponent } from './room.component';
import { AvailabilityComponent } from './availability/availability.component';
import { provideEffects } from '@ngrx/effects';
import { RoomEffects } from '../store/effects/room.effects';
import { RoomService } from '../services/room.service';
import { UserService } from '../services/user.service';
import { AddServiceComponent } from './me/add-service/add-service.component';
import { MissingTranslateHandler, TranslateLoaderFactory } from '../shared/translate-loader.factory';
import { ExpenseService } from '../services/expense.service';
import { ExpensesComponent } from './me/expense/list/expenses.component';
import { ExpenseComponent } from './me/expense/expense.component';
import { ExpenseEffects } from '../store/effects/expense.effects';
import { provideState, Store } from '@ngrx/store';
import { PriceDialogComponent } from './me/add-service/price-dialog.component';
import { ROOM_FEATURE_KEY, roomReducer } from '../store/reducers/room.reducers';
import { RoomNavigationEffects } from './room-navigation.effects';
import { I18NState } from '../store/reducers/i18n.reducers';
import { getI18NLanguagePipe } from '../store/selectors/i18n.selectors';
import { TokenService } from '../services/token.service';
import { AwsLambdaService } from '../services/aws-lambda.service';
import { AWS_FEATURE_KEY, awsReducer } from '../store/reducers/aws.reducers';
import { AwsEffects } from '../store/effects/aws.effects';

@NgModule({
  imports: [
    RoomsComponent,
    RoomComponent,
    AvailabilityComponent,
    AddServiceComponent,
    PriceDialogComponent,
    ExpensesComponent,
    ExpenseComponent,
    RoomRoutingModule,
    TranslateModule.forChild({
      loader: {
        provide: TranslateLoader,
        useClass: TranslateLoaderFactory.forModule('room'),
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
    RoomService,
    UserService,
    ExpenseService,
    TokenService,
    AwsLambdaService,
    provideState(ROOM_FEATURE_KEY, roomReducer),
    provideState(AWS_FEATURE_KEY, awsReducer),
    provideEffects(RoomEffects, ExpenseEffects, AwsEffects, RoomNavigationEffects),
  ],
})
export class RoomModule {
  constructor(private readonly store: Store<I18NState>, protected translateService: TranslateService) {
    this.store.pipe(getI18NLanguagePipe).subscribe((language) => {
      this.translateService.use(language);
    });
  }
}
