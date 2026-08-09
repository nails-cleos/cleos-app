import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RoomComponent } from './room.component';
import { ICommon } from '../interfaces/common';
import { IRoom } from './room';
import { RoomStore } from '../store/room.store';

@Component({
  selector: 'app-room-create-page',
  template:
    '<app-room [config]="config" [currencies]="currencies()" [offices]="offices()" (submitData)="submit($event)" />',
  imports: [RoomComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RoomCreatePageComponent {
  config: ICommon = {
    title: 'ROOM.TITLE',
    button: { icon: 'add', label: 'COMMON.BUTTON.CREATE' },
  };

  private readonly roomStore = inject(RoomStore);

  currencies = this.roomStore.currencies;
  offices = this.roomStore.offices;

  constructor() {
    this.roomStore.clean();
  }

  submit(room: IRoom) {
    this.roomStore.create(room);
  }
}
