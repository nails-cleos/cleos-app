import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { ReservationComponent } from './reservation.component';
import { IReservation } from './reservation';
import { Role } from '../interfaces/token';
import { createReservation } from '../store/actions/reservation.actions';
import { Store } from '@ngrx/store';
import { ReservationState } from '../store/reducers/reservation.reducers';
import { AuthUserService } from '../services/auth-user.service';

@Component({
  selector: 'app-reservation-create-page',
  template: '<app-reservation [isAdmin]="isAdmin()" (submitData)="submit($event)"/>',
  imports: [ReservationComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReservationCreatePageComponent {

  private readonly store: Store<ReservationState> = inject(Store<ReservationState>);
  private readonly authUserService = inject(AuthUserService);
  readonly isAdmin = computed(() => this.authUserService.authUser().isAdmin);

  submit(data: { reservation: IReservation; role: Role }) {
    this.store.dispatch(createReservation({ reservation: data.reservation, role: data.role }));
  }}
