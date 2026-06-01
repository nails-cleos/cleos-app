import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RoomComponent } from './room.component';

@Component({
  selector: 'app-room-create-page',
  template: '<app-room />',
  imports: [RoomComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RoomCreatePageComponent {}
