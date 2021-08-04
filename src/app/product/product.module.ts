import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FlexLayoutModule } from '@angular/flex-layout';

import { AppMaterialModule } from '../util/app-material.module';
import { SharedModule } from '../shared/shared.module';
import { ProductRoutingModule } from './product-routing.module';

import { ProductComponent } from './product.component';
import { ProductsComponent } from './list/products.component';
import { ProductDetailComponent } from './detail/product-detail.component';

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
