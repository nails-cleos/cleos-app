import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AppMaterialModule } from '../util/app-material.module';
import { TranslateModule } from '@ngx-translate/core';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FlexLayoutModule } from '@angular/flex-layout';
import { SharedModule } from '../util/SharedModule';
import { DiscountComponent } from './discount.component';
import { DiscountDialogComponent, DiscountsComponent } from './list/discounts.component';
import { DiscountDetailComponent } from './detail/discount-detail.component';
import { DiscountRoutingModule } from './discount-routing.module';

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
    CommonModule,
    TranslateModule,
    HttpClientModule,
    FormsModule,
    FlexLayoutModule,
    ReactiveFormsModule,
    AppMaterialModule
  ]
})
export class DiscountModule {
}
