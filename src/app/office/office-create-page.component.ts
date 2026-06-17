import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { OfficeComponent } from './office.component';
import { OfficeStore } from '../store/office.store';
import { IOffice } from './office';
import { ICommon } from '../interfaces/common';
import { UserStore } from '../store/user.store';

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
  private readonly userStore = inject(UserStore);
  managers = computed(() => this.userStore.managers());

  constructor() {
    this.officeStore.clean();
    this.userStore.loadManagers();
  }

  submit(office: IOffice) {
    this.officeStore.create(office);
  }
}
