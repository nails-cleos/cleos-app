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
import { ProductViewComponent } from './view/product-view.component';
import { MatExpansionModule } from '@angular/material/expansion';
import { ProductTableComponent } from './table/product-table.component';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';

export const httpLoaderFactory = (http: HttpClient): TranslateHttpLoader =>
  new TranslateHttpLoader(http, './assets/i18n/product/', '.json');

@NgModule({
  declarations: [
    ProductComponent,
    ProductsComponent,
    ProductDetailComponent,
    ProductViewComponent,
    ProductTableComponent
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
    EffectsModule.forFeature([ProductEffects]),
    MatExpansionModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule
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
