import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { BlockAgendaComponent } from './block-agenda.component';

@Component({
  selector: 'app-block-agenda-details-page',
  template: '<app-block-agenda [id]="id()" />',
  imports: [BlockAgendaComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BlockAgendaDetailsPageComponent {
  id = input<string>();
}
