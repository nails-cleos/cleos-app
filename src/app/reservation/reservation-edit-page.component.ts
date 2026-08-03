import { ChangeDetectionStrategy, Component, computed, effect, inject, input } from '@angular/core';
import { ReservationComponent } from './reservation.component';
import { IReservation } from './reservation';
import { Role } from '../interfaces/token';
import { AuthUserService } from '../services/auth-user.service';
import { TreatmentStore } from '../store/treatment.store';
import { RoomStore } from '../store/room.store';
import { ReservationStore } from '../store/reservation.store';

@Component({
  selector: 'app-reservation-edit-page',
  template: '<app-reservation [reservation]="reservation()" [isEditing]="true" [isAdmin]="isAdmin()" (submitData)="submit($event)" />',
  imports: [ReservationComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReservationEditPageComponent {
  id = input.required<string>();

  private readonly reservationStore = inject(ReservationStore);
  private readonly treatmentStore = inject(TreatmentStore);
  private readonly roomStore = inject(RoomStore);
  private readonly authUserService = inject(AuthUserService);

  private readonly authUserSignal = this.authUserService.authUser;
  readonly isAdmin = computed(() => this.authUserSignal().isAdmin);

  reservation = this.reservationStore.selected;

  constructor() {
    effect(() => {
      const id = this.id();
      this.reservationStore.loadById(id);
    });

    effect(() => {
      const reservation = this.reservation();
      if (!reservation) {
        return;
      }

      const customerId = reservation.customer.id;
      if (this.isAdmin()) {
        this.roomStore.loadAll(customerId);
      } else {
        this.treatmentStore.getAllTreatments(reservation.room.id, customerId);
      }
    });
  }

  submit(data: { reservation: IReservation; role: Role }) {
    this.reservationStore.updateById(this.id(), data.reservation, data.role);
  }
}
