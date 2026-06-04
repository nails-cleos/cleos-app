import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { OfficeComponent } from './office.component';
import { OfficeStore } from '../store/office.store';
import { IOffice } from '../interfaces/office';
import { ICommon } from '../interfaces/common';

@Component({
  selector: 'app-office-create-page',
  template: '<app-office [config]="config" [managers]="managers()" (submitData)="submit($event)"/>',
  imports: [OfficeComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OfficeCreatePageComponent {
  config: ICommon = {
    title: 'OFFICE.TITLE',
    button: { icon: 'add_business', label: 'COMMON.BUTTON.CREATE' },
  };

  private readonly officeStore = inject(OfficeStore);
  managers = computed(() => this.officeStore.managers());

  constructor() {
    this.officeStore.clean();
    this.officeStore.loadManagers();
  }

  submit(office: IOffice) {
    this.officeStore.create(office);
  }
}
