import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { UserComponent } from './user.component';
import { ICommon } from '../interfaces/common';
import { IUser } from './user';
import { Role } from '../interfaces/token';
import { saveUser } from '../store/actions/user.actions';
import { Store } from '@ngrx/store';
import { UserState } from '../store/reducers/user.reducers';

@Component({
  selector: 'app-user-create-page',
  template: '<app-user [config]="config" (submitData)="submit($event)"/>',
  imports: [UserComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserCreatePageComponent {
  config: ICommon = {
    title: 'USER.TITLE',
    button: { icon: 'person_add', label: 'COMMON.BUTTON.CREATE' },
  };

  private readonly store: Store<UserState> = inject(Store<UserState>);

  submit(data: { user: IUser; role?: Role }) {
    this.store.dispatch(saveUser(data));
  }
}
