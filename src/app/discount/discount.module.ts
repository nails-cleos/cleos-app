import { NgModule } from '@angular/core';
import { TranslateLoader, TranslateModule, TranslateService } from '@ngx-translate/core';
import { HttpClient } from '@angular/common/http';
import { SharedModule } from '../shared/shared.module';
import { DiscountRoutingModule } from './discount-routing.module';

import { DiscountComponent } from './discount.component';
import { DiscountDialogComponent, DiscountsComponent } from './list/discounts.component';
import { DiscountDetailComponent } from './detail/discount-detail.component';
import { MatChipsModule } from '@angular/material/chips';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { EffectsModule } from '@ngrx/effects';
import { DiscountEffects } from '../store/effects/discount.effects';
import { DiscountService } from '../services/discount.service';
import { UserEffects } from '../store/effects/user.effects';
import { UserService } from '../services/user.service';

export const httpLoaderFactory = (http: HttpClient): TranslateHttpLoader =>
  new TranslateHttpLoader(http, './assets/i18n/discount/', '.json');

@NgModule({
  declarations: [
    DiscountComponent,
    DiscountsComponent,
    DiscountDetailComponent,
    DiscountDialogComponent
  ],
  imports: [
    DiscountRoutingModule,
    SharedModule,
    MatChipsModule,
    TranslateModule.forChild({
      loader: {provide: TranslateLoader, useFactory: httpLoaderFactory, deps: [HttpClient]},
      isolate: false,
      extend: true
    }),
    EffectsModule.forFeature([DiscountEffects, UserEffects])
  ],
  providers: [
    DiscountService,
    UserService
  ]
})
export class DiscountModule {
  constructor(protected translateService: TranslateService) {
    const currentLang = translateService.currentLang;
    translateService.currentLang = '';
    translateService.use(currentLang);
  }
}
