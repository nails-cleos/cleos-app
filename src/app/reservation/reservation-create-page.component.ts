import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
} from '@angular/core';
import { ReservationComponent } from './reservation.component';
import { IReservation } from './reservation';
import { Role } from '../interfaces/token';
import { AuthUserService } from '../services/auth-user.service';
import { UserStore } from '../store/user.store';
import { ReservationStore } from '../store/reservation.store';

@Component({
  selector: 'app-reservation-create-page',
  template:
    '<app-reservation [isAdmin]="isAdmin()" [customers]="customers()" (submitData)="submit($event)"/>',
  imports: [ReservationComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReservationCreatePageComponent {
  private readonly userStore = inject(UserStore);
  private readonly reservationStore = inject(ReservationStore);
  private readonly authUserService = inject(AuthUserService);
  readonly isAdmin = computed(() => this.authUserService.authUser().isAdmin);
  readonly customers = computed(() => this.userStore.customers());

  constructor() {
    this.userStore.loadCustomers();
  }

  submit(data: { reservation: IReservation; role: Role }) {
    this.reservationStore.create(data.reservation, data.role);
  }
}
