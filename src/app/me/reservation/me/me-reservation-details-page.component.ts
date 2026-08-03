import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';
import { MeReservationComponent } from './me-reservation.component';
import { IReservation } from '../../../reservation/reservation';
import { Role } from '../../../interfaces/token';
import { ReservationStore } from '../../../store/reservation.store';

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
