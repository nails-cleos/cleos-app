import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { MeReservationComponent } from './me-reservation.component';
import { RoomStore } from '@app/store/room.store';
import { IReservation } from '@app/reservation/reservation';
import { Role } from '@app/interfaces/token';
import { ReservationStore } from '@app/store/reservation.store';

@Component({
  selector: 'app-me-reservation-create-page',
  template: '<app-me-reservation [rooms]="rooms()" [params]="params()" (submitData)="submit($event)" />',
  imports: [MeReservationComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MeReservationCreatePageComponent {
  private readonly reservationStore = inject(ReservationStore);
  private readonly roomStore = inject(RoomStore);

  rooms = computed(() => {
    const data = this.roomStore.data();
    return data?.kind === 'list' ? data.value : undefined;
  });

  params = computed(() => {
    const navigationState = history.state;
    if (navigationState) {
      return {
        treatmentId: navigationState['treatmentId'],
        roomId: navigationState['roomId'],
        professionalId: navigationState['professionalId'],
        date: navigationState['date'],
        discountId: navigationState['discountId'],
      };
    }
    return undefined;
  });

  constructor() {
    this.roomStore.loadAll();
  }

  submit(data: { reservation: IReservation; role: Role }) {
    this.reservationStore.create(data.reservation, data.role);
  }
}
