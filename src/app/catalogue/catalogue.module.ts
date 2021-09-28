import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { AppMaterialModule } from '../util/app-material.module';
import { SharedModule } from '../shared/shared.module';
import { CatalogueRoutingModule } from './catalogue-routing.module';
import { DragDropDirective } from '../directives/drag-drop.directive';

import { CatalogueComponent } from './catalogue.component';
import { CataloguesComponent } from './list/catalogues.component';
import { CatalogueDetailComponent } from './detail/catalogue-detail.component';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { DragDropModule } from '@angular/cdk/drag-drop';

@NgModule({
  declarations: [
    CatalogueComponent,
    CataloguesComponent,
    CatalogueDetailComponent,
    DragDropDirective
  ],
  imports: [
    CatalogueRoutingModule,
    SharedModule,
    CommonModule,
    TranslateModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    AppMaterialModule,
    MatProgressBarModule,
    DragDropModule
  ]
})
export class CatalogueModule {
}
