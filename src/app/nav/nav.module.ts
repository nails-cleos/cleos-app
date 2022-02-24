import { NgModule } from '@angular/core';
import { TranslateLoader, TranslateModule, TranslateService } from '@ngx-translate/core';
import { HttpClient } from '@angular/common/http';
import { MatCarouselModule } from '@ngbmodule/material-carousel';
import { SharedModule } from '../shared/shared.module';
import { NavRoutingModule } from './nav-routing.module';

import { NavComponent } from './nav.component';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatBadgeModule } from '@angular/material/badge';
import { MatRippleModule } from '@angular/material/core';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { EffectsModule } from '@ngrx/effects';
import { LoginEffects } from '../store/effects/auth.effects';
import { NotificationEffects } from '../store/effects/notification.effects';
import { UserEffects } from '../store/effects/user.effects';
import { AuthService } from '../services/auth.service';
import { NotificationService } from '../services/notification.service';
import { UserService } from '../services/user.service';
import { TokenService } from '../services/token.service';
import { MatExpansionModule } from '@angular/material/expansion';

export const httpLoaderFactory = (http: HttpClient): TranslateHttpLoader =>
  new TranslateHttpLoader(http, './assets/i18n/dashboard/', '.json');

@NgModule({
  declarations: [
    NavComponent
  ],
  imports: [
    NavRoutingModule,
    SharedModule,
    MatCarouselModule.forRoot(),
    MatSidenavModule,
    MatToolbarModule,
    MatBadgeModule,
    MatRippleModule,
    MatSlideToggleModule,
    TranslateModule.forChild({
      loader: {provide: TranslateLoader, useFactory: httpLoaderFactory, deps: [HttpClient]},
      isolate: false,
      extend: true
    }),
    EffectsModule.forFeature([LoginEffects, NotificationEffects, UserEffects]),
    MatExpansionModule
  ],
  providers: [
    AuthService,
    NotificationService,
    UserService,
    TokenService
  ]
})
export class NavModule {
  constructor(protected translateService: TranslateService) {
    const currentLang = translateService.currentLang;
    translateService.currentLang = '';
    translateService.use(currentLang);
  }
}
