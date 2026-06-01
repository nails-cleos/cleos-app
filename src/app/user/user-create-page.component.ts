import { ChangeDetectionStrategy, Component } from '@angular/core';
import { UserComponent } from './user.component';

@Component({
  selector: 'app-user-create-page',
  template: '<app-user />',
  imports: [UserComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserCreatePageComponent {}
