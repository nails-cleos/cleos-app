import { ChangeDetectionStrategy, Component, computed, effect, inject, input } from '@angular/core';
import { OfficeComponent } from './office.component';
import { OfficeStore } from '../store/office.store';
import { IOffice } from './office';
import { ICommon } from '../interfaces/common';
import { SkeletonComponent } from '../shared/skeleton/skeleton.component';

@Component({
  selector: 'app-office-details-page',
  template: `
    @if (office(); as office) {
      <app-office [office]="office" [config]="config" (submitData)="submit($event)"/>
    } @else {
      <app-skeleton [lines]="5"/>
    }
  `,
  imports: [OfficeComponent, SkeletonComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OfficeDetailsPageComponent {
  id = input.required<string>();
  config: ICommon = {
    title: 'OFFICE.DETAIL',
    button: { icon: 'published_with_changes', label: 'COMMON.BUTTON.UPDATE' },
  };

  private readonly officeStore = inject(OfficeStore);
  office = computed(() => this.officeStore.selected());

  constructor() {
    effect(() => {
      this.officeStore.clean();
      this.officeStore.loadById(this.id());
    });
  }

  submit(office: IOffice) {
    this.officeStore.update(this.id(), office);
  }
}
