import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RoomComponent } from './room.component';

@Component({
  selector: 'app-room-details-page',
  template: '<app-room [id]="id()" />',
  imports: [RoomComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RoomDetailsPageComponent {
  id = input<string>();
}
