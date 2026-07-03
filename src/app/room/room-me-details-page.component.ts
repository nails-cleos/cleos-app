import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RoomDetailsPageComponent } from './room-details-page.component';

@Component({
  selector: 'app-room-me-details-page',
  template: '<app-room-details-page [id]="id()" />',
  imports: [RoomDetailsPageComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RoomMeDetailsPageComponent {
  id = input.required<string>();
}
