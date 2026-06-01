import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { NoteComponent } from './note.component';

@Component({
  selector: 'app-note-details-page',
  template: '<app-note [id]="id()" />',
  imports: [NoteComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NoteDetailsPageComponent {
  id = input<string>();
}
