import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  input,
} from '@angular/core';
import { AdditionalComponent } from './additional.component';
import { AdditionalStore } from '../store/additional.store';
import { IAdditional } from './additional';
import { ICommon } from '../interfaces/common';
import { SkeletonComponent } from '../shared/skeleton/skeleton.component';
import { formatDuration } from '../util/dates';

@Component({
  selector: 'app-additional-details-page',
  template: `
    @if (additional()) {
      <app-additional
        [additional]="additional()"
        [config]="config"
        (submitData)="submit($event)"
      />
    } @else {
      <app-skeleton />
    }
  `,
  imports: [AdditionalComponent, SkeletonComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdditionalDetailsPageComponent {
  id = input.required<string>();
  config: ICommon = {
    title: 'ADDITIONAL.DETAIL',
    button: { icon: 'published_with_changes', label: 'COMMON.BUTTON.UPDATE' },
  };

  private readonly additionalStore = inject(AdditionalStore);
  additional = computed(() => {
    const selected = this.additionalStore.selected();
    if (selected?.duration) {
      return {
        ...selected,
        duration: formatDuration(selected.duration),
      };
    }
    return selected;
  });

  constructor() {
    effect(() => {
      this.additionalStore.clean();
      this.additionalStore.loadById(this.id());
    });
  }

  submit(additional: IAdditional) {
    this.additionalStore.update(this.id(), additional);
  }
}
