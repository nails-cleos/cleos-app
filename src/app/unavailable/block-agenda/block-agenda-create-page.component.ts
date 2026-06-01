import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BlockAgendaComponent } from './block-agenda.component';

@Component({
  selector: 'app-block-agenda-create-page',
  template: '<app-block-agenda />',
  imports: [BlockAgendaComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BlockAgendaCreatePageComponent {}
