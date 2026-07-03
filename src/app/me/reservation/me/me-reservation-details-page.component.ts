import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { MeReservationComponent } from './me-reservation.component';

@Component({
  selector: 'app-me-reservation-details-page',
  template: '<app-me-reservation [id]="id()" />',
  imports: [MeReservationComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MeReservationDetailsPageComponent {
  id = input.required<string>();
}
