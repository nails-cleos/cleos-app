import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ChartsModule } from 'ng2-charts';

import { AppMaterialModule } from '../util/app-material.module';
import { SharedModule } from '../shared/shared.module';
import { UserRoutingModule } from './user-routing.module';

import { UserComponent } from './user.component';
import { UsersComponent } from './list/users.component';
import { UserDetailComponent } from './detail/user-detail.component';
import { OverviewComponent } from './overview/overview.component';
import { OverviewChartComponent } from './overview/chart/overview-chart/overview-chart.component';
import { NgxMatIntlTelInputModule } from 'ngx-mat-intl-tel-input';

@NgModule({
  declarations: [
    UserComponent,
    UsersComponent,
    UserDetailComponent,
    OverviewComponent,
    OverviewChartComponent
  ],
  imports: [
    UserRoutingModule,
    SharedModule,
    CommonModule,
    TranslateModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    AppMaterialModule,
    ChartsModule,
    NgxMatIntlTelInputModule
  ]
})
export class UserModule {
}
