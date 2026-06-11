import { ChangeDetectionStrategy, Component, computed, effect, inject, input } from '@angular/core';
import { ReservationComponent } from './reservation.component';
import { Store } from '@ngrx/store';
import { ReservationState } from '../store/reducers/reservation.reducers';
import { PaymentState } from '../store/reducers/payment.reducers';
import { getSelectedReservationPipe } from '../store/selectors/reservation.selectors';
import { toSignal } from '@angular/core/rxjs-interop';
import {
  getAllRooms,
  getAllTreatments,
  getReservation,
  updateReservationById,
} from '../store/actions/reservation.actions';
import { IReservation } from './reservation';
import { Role } from '../interfaces/token';
import { AuthUserService } from '../services/auth-user.service';

@Component({
  selector: 'app-reservation-edit-page',
  template: '<app-reservation [reservation]="reservation()" [isEditing]="true" [isAdmin]="isAdmin()" (submitData)="submit($event)" />',
  imports: [ReservationComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReservationEditPageComponent {
  id = input.required<string>();

  private readonly store: Store<ReservationState | PaymentState> = inject(Store<ReservationState | PaymentState>);
  private readonly authUserService = inject(AuthUserService);

  private selectedReservation$ = this.store.pipe(getSelectedReservationPipe);
  private readonly authUserSignal = this.authUserService.authUser;
  readonly isAdmin = computed(() => this.authUserSignal().isAdmin);

  reservation = toSignal(this.selectedReservation$);

  constructor() {
    effect(() => {
      const id = this.id();
      this.store.dispatch(getReservation({ id }));
    });

    effect(() => {
      const reservation = this.reservation();
      if (!reservation) {
        return;
      }

      const customerId = reservation.customer.id;
      if (this.isAdmin()) {
        this.store.dispatch(getAllRooms({ customerId }));
      } else {
        this.store.dispatch(getAllTreatments({ roomId: reservation.room.id, customerId }));
      }
    });
  }

  submit(data: { reservation: IReservation; role: Role }) {
    this.store.dispatch(updateReservationById({ id: this.id(), reservation: data.reservation, role: data.role }));
  }
}
