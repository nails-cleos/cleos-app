import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AppMaterialModule } from '../util/app-material.module';
import { TranslateModule } from '@ngx-translate/core';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FlexLayoutModule } from '@angular/flex-layout';
import { SharedModule } from '../util/SharedModule';
import { MainRoutingModule } from './main-routing.module';
import { MatPasswordStrengthModule } from '@angular-material-extensions/password-strength';
import { MainComponent } from './main.component';
import { MainContentComponent } from './main-content/main-content.component';
import { CatalogComponent } from '../catalog/catalog.component';
import { PrivacyComponent } from '../privacy/privacy.component';
import { MatCarouselModule } from '@ngbmodule/material-carousel';
import { ImageViewerComponent } from '../image-viewer/image-viewer.component';
import { TermsAndConditionsComponent } from '../terms-and-conditions/terms-and-conditions.component';

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
    FlexLayoutModule,
    ReactiveFormsModule,
    MatPasswordStrengthModule.forRoot(),
    AppMaterialModule,
    MatCarouselModule.forRoot()
  ]
})
export class MainModule {
}
