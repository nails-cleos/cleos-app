import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { ReservationComponent } from './reservation.component';

@Component({
  selector: 'app-reservation-edit-page',
  template: '<app-reservation [id]="id()" />',
  imports: [ReservationComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReservationEditPageComponent {
  id = input<string>();
}
