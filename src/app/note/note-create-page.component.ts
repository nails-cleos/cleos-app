import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { NoteComponent } from './note.component';
import { NoteStore } from '../store/note.store';
import { INote } from '../interfaces/note';
import { ICommon } from '../interfaces/common';

@Component({
  selector: 'app-note-create-page',
  template: '<app-note [config]="config" (submitData)="submit($event)"/>',
  imports: [NoteComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NoteCreatePageComponent {
  private readonly noteStore = inject(NoteStore);
  config: ICommon = {
    title: 'NOTE.TITLE',
    button: { icon: 'note_add', label: 'COMMON.BUTTON.CREATE' },
  };

  constructor() {
    this.noteStore.clean();
  }

  submit(note: INote) {
    this.noteStore.create(note);
  }
}
