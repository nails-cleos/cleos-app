import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ProductRoutingModule } from './product-routing.module';
import { AppMaterialModule } from '../util/app-material.module';
import { TranslateModule } from '@ngx-translate/core';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FlexLayoutModule } from '@angular/flex-layout';
import { ProductComponent } from './product.component';
import { ProductsComponent } from './list/products.component';
import { ProductDetailComponent } from './detail/product-detail.component';
import { SharedModule } from '../util/SharedModule';

@NgModule({
  declarations: [
    ProductComponent,
    ProductsComponent,
    ProductDetailComponent
  ],
  imports: [
    ProductRoutingModule,
    SharedModule,
    CommonModule,
    TranslateModule,
    HttpClientModule,
    FormsModule,
    FlexLayoutModule,
    ReactiveFormsModule,
    AppMaterialModule
  ]
})
export class ProductModule {
}
