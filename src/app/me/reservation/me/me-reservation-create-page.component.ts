import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MeReservationComponent } from './me-reservation.component';

@Component({
  selector: 'app-me-reservation-create-page',
  template: '<app-me-reservation />',
  imports: [MeReservationComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MeReservationCreatePageComponent {}
