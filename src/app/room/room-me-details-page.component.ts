import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RoomComponent } from './room.component';

@Component({
  selector: 'app-room-me-details-page',
  template: '<app-room [id]="id()" />',
  imports: [RoomComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RoomMeDetailsPageComponent {
  id = input<string>();
}
