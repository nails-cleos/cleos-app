import { NgModule } from '@angular/core';
import { ShortcutComponent } from './shortcut.component';
import { SharedModule } from '../shared/shared.module';
import { ShortcutRoutingModule } from './shortcut-routing.module';


@NgModule({
  declarations: [
    ShortcutComponent
  ],
  imports: [
    ShortcutRoutingModule,
    SharedModule
  ]
})
export class ShortcutModule {
}
