import { ChangeDetectionStrategy, Component } from '@angular/core';
import { NoteComponent } from './note.component';

@Component({
  selector: 'app-note-create-page',
  template: '<app-note />',
  imports: [NoteComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NoteCreatePageComponent {}
