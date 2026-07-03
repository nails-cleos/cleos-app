import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ColorComponent } from './color.component';
import { ColorStore } from '../store/color.store';
import { IColor } from './color';
import { ICommon } from '../interfaces/common';

@Component({
  selector: 'app-color-create-page',
  template: '<app-color [config]="config" (submitData)="submit($event)"/>',
  imports: [ColorComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ColorCreatePageComponent {
  private readonly colorStore = inject(ColorStore);
  config: ICommon = {
    title: 'COLOR.TITLE',
    button: { icon: 'add', label: 'COMMON.BUTTON.CREATE' },
  };

  constructor() {
    this.colorStore.clean();
  }

  submit(color: IColor) {
    this.colorStore.create(color);
  }
}
