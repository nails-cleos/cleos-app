import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AppMaterialModule } from '../util/app-material.module';
import { TranslateModule } from '@ngx-translate/core';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FlexLayoutModule } from '@angular/flex-layout';
import { SharedModule } from '../util/SharedModule';
import { UserComponent } from './user.component';
import { UsersComponent } from './list/users.component';
import { UserDetailComponent } from './detail/user-detail.component';
import { UserRoutingModule } from './user-routing.module';

@NgModule({
  declarations: [
    UserComponent,
    UsersComponent,
    UserDetailComponent
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
    AppMaterialModule
  ]
})
export class UserModule {
}
