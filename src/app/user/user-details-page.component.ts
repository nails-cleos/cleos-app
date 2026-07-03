import { ChangeDetectionStrategy, Component, effect, inject, input } from '@angular/core';
import { UserComponent } from './user.component';
import { Role } from '../interfaces/token';
import { IUser } from './user';
import { ICommon } from '../interfaces/common';
import { SkeletonComponent } from '../shared/skeleton/skeleton.component';
import { UserStore } from '../store/user.store';

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

  private readonly userStore = inject(UserStore);
  user = this.userStore.selected;

  constructor() {
    effect(() => {
      this.userStore.clean();
      this.userStore.loadById(this.id());
    });
  }

  submit(data: { user: IUser; role?: Role }) {
    this.userStore.save(data.user, this.id());
  }
}
