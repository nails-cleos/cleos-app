import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ReservationComponent } from './reservation.component';

@Component({
  selector: 'app-reservation-create-page',
  template: '<app-reservation />',
  imports: [ReservationComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReservationCreatePageComponent {}
