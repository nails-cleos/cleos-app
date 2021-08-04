import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FlexLayoutModule } from '@angular/flex-layout';

import { AppMaterialModule } from '../util/app-material.module';
import { SharedModule } from '../shared/shared.module';
import { UnavailableRoutingModule } from './unavailable-routing.module';

import { UnavailableComponent } from './unavailable.component';
import { UnavailableDetailComponent } from './detail/unavailable-detail.component';
import { UnavailableListComponent } from './list/unavailable-list.component';

@NgModule({
  declarations: [
    UnavailableComponent,
    UnavailableListComponent,
    UnavailableDetailComponent
  ],
  imports: [
    UnavailableRoutingModule,
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
export class UnavailableModule {
}
