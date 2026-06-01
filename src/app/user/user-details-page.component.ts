import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { UserComponent } from './user.component';

@Component({
  selector: 'app-user-details-page',
  template: '<app-user [id]="id()" />',
  imports: [UserComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserDetailsPageComponent {
  id = input<string>();
}
