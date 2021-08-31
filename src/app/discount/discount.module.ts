import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { AppMaterialModule } from '../util/app-material.module';
import { SharedModule } from '../shared/shared.module';
import { DiscountRoutingModule } from './discount-routing.module';

import { DiscountComponent } from './discount.component';
import { DiscountDialogComponent, DiscountsComponent } from './list/discounts.component';
import { DiscountDetailComponent } from './detail/discount-detail.component';

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
    ReactiveFormsModule,
    AppMaterialModule
  ]
})
export class DiscountModule {
}
