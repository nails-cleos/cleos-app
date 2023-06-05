import { NgModule } from '@angular/core';
import { TranslateLoader, TranslateModule, TranslateService } from '@ngx-translate/core';
import { SharedModule } from '../shared/shared.module';
import { NavRoutingModule } from './nav-routing.module';

import { NavComponent } from './nav.component';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatBadgeModule } from '@angular/material/badge';
import { MatRippleModule } from '@angular/material/core';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { EffectsModule } from '@ngrx/effects';
import { LoginEffects } from '../store/effects/auth.effects';
import { NotificationEffects } from '../store/effects/notification.effects';
import { UserEffects } from '../store/effects/user.effects';
import { AuthService } from '../services/auth.service';
import { NotificationService } from '../services/notification.service';
import { UserService } from '../services/user.service';
import { TokenService } from '../services/token.service';
import { MenuItemComponent } from './menu-item/menu-item.component';
import { TranslateLoaderFactory } from '../shared/translate-loader.factory';

@NgModule({
  declarations: [
    NavComponent,
    MenuItemComponent
  ],
  imports: [
    NavRoutingModule,
    SharedModule,
    MatToolbarModule,
    MatBadgeModule,
    MatRippleModule,
    MatSlideToggleModule,
    TranslateModule.forChild({
      loader: {
        provide: TranslateLoader,
        useClass: TranslateLoaderFactory.forModule('dashboard')
      },
      isolate: false,
      extend: true
    }),
    EffectsModule.forFeature([LoginEffects, NotificationEffects, UserEffects]),
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
