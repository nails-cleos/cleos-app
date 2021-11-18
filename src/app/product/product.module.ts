import { NgModule } from '@angular/core';
import { TranslateLoader, TranslateModule, TranslateService } from '@ngx-translate/core';
import { HttpClient } from '@angular/common/http';
import { SharedModule } from '../shared/shared.module';
import { ProductRoutingModule } from './product-routing.module';

import { ProductComponent } from './product.component';
import { ProductsComponent } from './list/products.component';
import { ProductDetailComponent } from './detail/product-detail.component';
import { MatTabsModule } from '@angular/material/tabs';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { EffectsModule } from '@ngrx/effects';
import { ProductEffects } from '../store/effects/product.effects';
import { ProductService } from '../services/product.service';

export const httpLoaderFactory = (http: HttpClient): TranslateHttpLoader =>
  new TranslateHttpLoader(http, './assets/i18n/product/', '.json');

@NgModule({
  declarations: [
    ProductComponent,
    ProductsComponent,
    ProductDetailComponent
  ],
  imports: [
    ProductRoutingModule,
    SharedModule,
    MatTabsModule,
    TranslateModule.forChild({
      loader: {provide: TranslateLoader, useFactory: httpLoaderFactory, deps: [HttpClient]},
      isolate: false,
      extend: true
    }),
    EffectsModule.forFeature([ProductEffects])
  ],
  providers: [
    ProductService
  ]
})
export class ProductModule {
  constructor(protected translateService: TranslateService) {
    const currentLang = translateService.currentLang;
    translateService.currentLang = '';
    translateService.use(currentLang);
  }
}
