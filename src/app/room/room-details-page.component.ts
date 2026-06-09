import { ChangeDetectionStrategy, Component, effect, inject, input } from '@angular/core';
import { RoomComponent } from './room.component';
import { Store } from '@ngrx/store';
import { RoomState } from '../store/reducers/room.reducers';
import { ICommon } from '../interfaces/common';
import { getSelectedRoomPipe } from '../store/selectors/room.selectors';
import { toSignal } from '@angular/core/rxjs-interop';
import { cleanRoom, getRoom, updateRoom } from '../store/actions/room.actions';
import { SkeletonComponent } from '../shared/skeleton.component';
import { IRoom } from '../interfaces/room';

@Component({
  selector: 'app-room-details-page',
  template: `
    @if (room(); as room) {
      <app-room [room]="room" [config]="config" (submitData)="submit($event)"/>
    } @else {
      <app-skeleton/>
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

  private readonly store: Store<RoomState> = inject(Store<RoomState>);

  room = toSignal(this.store.pipe(getSelectedRoomPipe));

  constructor() {
    this.store.dispatch(cleanRoom());

    effect(() => {
      const id = this.id();
      this.store.dispatch(getRoom({ id, redirect: true }));
    });
  }

  submit(room: IRoom) {
    const id = this.id();
    this.store.dispatch(updateRoom({ id, room }));
  }
}
