import { ChangeDetectionStrategy, Component, computed, effect, inject, input } from '@angular/core';
import { ColorComponent } from './color.component';
import { ColorStore } from '../store/color.store';
import { IColor } from './color';
import { ICommon } from '../interfaces/common';
import { SkeletonComponent } from '../shared/skeleton.component';

@Component({
  selector: 'app-color-details-page',
  template: `
    @if (color(); as color) {
      <app-color [color]="color" [config]="config" (submitData)="submit($event)"/>
    } @else {
      <app-skeleton/>
    }
  `,
  imports: [ColorComponent, SkeletonComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ColorDetailsPageComponent {
  id = input.required<string>();
  config: ICommon = {
    title: 'COLOR.DETAIL',
    button: { icon: 'published_with_changes', label: 'COMMON.BUTTON.UPDATE' },
  };

  private readonly colorStore = inject(ColorStore);
  color = computed(() => this.colorStore.selected());

  constructor() {
    effect(() => {
      this.colorStore.clean();
      this.colorStore.loadById(this.id());
    });
  }

  submit(color: IColor) {
    this.colorStore.update(this.id(), color);
  }
}
