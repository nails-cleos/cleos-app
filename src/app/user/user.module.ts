import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FlexLayoutModule } from '@angular/flex-layout';
import { ChartsModule } from 'ng2-charts';

import { AppMaterialModule } from '../util/app-material.module';
import { SharedModule } from '../shared/shared.module';
import { UserRoutingModule } from './user-routing.module';

import { UserComponent } from './user.component';
import { UsersComponent } from './list/users.component';
import { UserDetailComponent } from './detail/user-detail.component';
import { OverviewComponent } from './overview/overview.component';
import { ProductsChartComponent } from './overview/chart/products-chart/products-chart.component';
import { PaymentsChartComponent } from './overview/chart/payments-chart/payments-chart.component';

@NgModule({
  declarations: [
    UserComponent,
    UsersComponent,
    UserDetailComponent,
    OverviewComponent,
    ProductsChartComponent,
    PaymentsChartComponent
  ],
  imports: [
    UserRoutingModule,
    SharedModule,
    CommonModule,
    TranslateModule,
    HttpClientModule,
    FormsModule,
    FlexLayoutModule,
    ReactiveFormsModule,
    AppMaterialModule,
    ChartsModule
  ]
})
export class UserModule {
}
