import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { AdditionalComponent } from './additional.component';
import { IAdditional } from './additional';
import { AdditionalStore } from '../store/additional.store';
import { ICommon } from '../interfaces/common';

@Component({
  selector: 'app-additional-create-page',
  template: '<app-additional [config]="config" (submitData)="submit($event)" />',
  imports: [AdditionalComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdditionalCreatePageComponent {
  private readonly additionalStore = inject(AdditionalStore);
  config: ICommon = {
    title: 'ADDITIONAL.TITLE',
    button: { icon: 'add', label: 'COMMON.BUTTON.CREATE' },
  };

  submit(additional: IAdditional) {
    this.additionalStore.create(additional);
  }
}
