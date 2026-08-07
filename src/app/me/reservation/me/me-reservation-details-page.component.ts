import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';
import { MeReservationComponent } from './me-reservation.component';
import { IReservation } from '@app/reservation/reservation';
import { Role } from '@app/interfaces/token';
import { ReservationStore } from '@app/store/reservation.store';

@Component({
  selector: 'app-me-reservation-details-page',
  template: '<app-me-reservation [id]="id()" (submitData)="submit($event)" />',
  imports: [MeReservationComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MeReservationDetailsPageComponent {
  id = input.required<string>();

  reservationStore = inject(ReservationStore);

  submit(data: { reservation: IReservation; role: Role }) {
    this.reservationStore.updateById(this.id(), data.reservation, data.role);
  }


}
