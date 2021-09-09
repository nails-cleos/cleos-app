import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatCarouselModule } from '@ngbmodule/material-carousel';

import { AppMaterialModule } from '../util/app-material.module';
import { SharedModule } from '../shared/shared.module';
import { MainRoutingModule } from './main-routing.module';

import { MainComponent } from './main.component';
import { MainContentComponent } from './main-content/main-content.component';
import { CatalogComponent } from './catalog/catalog.component';
import { PrivacyComponent } from './privacy/privacy.component';
import { ImageViewerComponent } from './image-viewer/image-viewer.component';
import { TermsAndConditionsComponent } from './terms-and-conditions/terms-and-conditions.component';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';

@NgModule({
  declarations: [
    ImageViewerComponent,
    MainComponent,
    MainContentComponent,
    CatalogComponent,
    PrivacyComponent,
    TermsAndConditionsComponent
  ],
  imports: [
    MainRoutingModule,
    SharedModule,
    CommonModule,
    TranslateModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    AppMaterialModule,
    MatCarouselModule.forRoot(),
    MatToolbarModule,
    MatSlideToggleModule
  ]
})
export class MainModule {
}
