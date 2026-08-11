import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
} from '@angular/core';
import { UserComponent } from './user.component';
import { ICommon } from '../interfaces/common';
import { IUser } from './user';
import { Role } from '../interfaces/token';
import { UserStore } from '../store/user.store';

@Component({
  selector: 'app-user-create-page',
  template:
    '<app-user [config]="config" [role]="role()" (submitData)="submit($event)"/>',
  imports: [UserComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserCreatePageComponent {
  config: ICommon = {
    title: 'USER.TITLE',
    button: { icon: 'person_add', label: 'COMMON.BUTTON.CREATE' },
  };

  private readonly userStore = inject(UserStore);

  role = computed(() => history.state?.['role']);

  constructor() {
    this.userStore.clean();
  }

  submit(data: { user: IUser; role?: Role }) {
    this.userStore.save(data.user, undefined, data.role);
  }
}
