import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { MeReservationComponent } from './me-reservation.component';
import { RoomStore } from '../../../store/room.store';

@Component({
  selector: 'app-me-reservation-create-page',
  template: '<app-me-reservation [rooms]="rooms()" />',
  imports: [MeReservationComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MeReservationCreatePageComponent {
  private readonly roomStore = inject(RoomStore);

  rooms = computed(() => {
    const data = this.roomStore.data();
    return data?.kind === 'list' ? data.value : undefined;
  });

  constructor() {
    this.roomStore.loadAll();
  }
}
