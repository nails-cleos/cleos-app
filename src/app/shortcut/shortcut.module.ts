import { NgModule } from '@angular/core';
import { ShortcutComponent } from './shortcut.component';
import { ShortcutRoutingModule } from './shortcut-routing.module';

@NgModule({
  imports: [
    ShortcutComponent,
    ShortcutRoutingModule,
  ]
})
export class ShortcutModule {
}
