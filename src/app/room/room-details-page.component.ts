import { ChangeDetectionStrategy, Component, effect, inject, input } from '@angular/core';
import { RoomComponent } from './room.component';
import { ICommon } from '../interfaces/common';
import { SkeletonComponent } from '../shared/skeleton/skeleton.component';
import { IRoom } from './room';
import { RoomStore } from '../store/room.store';

@Component({
  selector: 'app-room-details-page',
  template: `
    @if (room(); as room) {
      <app-room [room]="room" [config]="config" [currencies]="currencies()" [offices]="offices()" (submitData)="submit($event)"/>
    } @else {
      <app-skeleton [lines]="0" [boxes]="3"/>
    }
  `,
  imports: [RoomComponent, SkeletonComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RoomDetailsPageComponent {
  id = input.required<string>();

  config: ICommon = {
    title: 'ROOM.DETAIL',
    button: { icon: 'published_with_changes', label: 'COMMON.BUTTON.UPDATE' },
  };

  private readonly roomStore = inject(RoomStore);

  room = this.roomStore.selected;
  currencies = this.roomStore.currencies;
  offices = this.roomStore.offices;

  constructor() {
    this.roomStore.clean();

    effect(() => {
      const id = this.id();
      this.roomStore.loadById(id);
    });
  }

  submit(room: IRoom) {
    const id = this.id();
    this.roomStore.update(id, room);
  }
}
