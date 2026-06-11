import { ChangeDetectionStrategy, Component, effect, inject, input } from '@angular/core';
import { UserComponent } from './user.component';
import { Role } from '../interfaces/token';
import { getUser, saveUser } from '../store/actions/user.actions';
import { Store } from '@ngrx/store';
import { UserState } from '../store/reducers/user.reducers';
import { toSignal } from '@angular/core/rxjs-interop';
import { getSelectedUserPipe } from '../store/selectors/user.selectors';
import { IUser } from './user';
import { ICommon } from '../interfaces/common';
import { SkeletonComponent } from '../shared/skeleton/skeleton.component';

@Component({
  selector: 'app-user-details-page',
  template: `
    @if (user(); as user) {
      <app-user [user]="user" [config]="config" (submitData)="submit($event)"/>
    } @else {
      <app-skeleton [lines]="5" [boxes]="1"/>
    }
  `,
  imports: [UserComponent, SkeletonComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserDetailsPageComponent {
  id = input.required<string>();
  config: ICommon = {
    title: 'USER.DETAIL',
    button: { icon: 'published_with_changes', label: 'COMMON.BUTTON.UPDATE' },
  };

  private readonly store: Store<UserState> = inject(Store<UserState>);
  private selectedUser$ = this.store.pipe(getSelectedUserPipe);

  user = toSignal(this.selectedUser$);

  constructor() {
    effect(() => {
      const id = this.id();
      this.store.dispatch(getUser({ id }));
    });
  }

  submit(data: { user: IUser; role?: Role }) {
    this.store.dispatch(saveUser({ id: this.id(), user: data.user }));
  }
}
