import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { NoteComponent } from './note.component';
import { NoteStore } from '../store/note.store';
import { INote } from './note';
import { ICommon } from '../interfaces/common';

@Component({
  selector: 'app-note-create-page',
  template: '<app-note [config]="config" [params]="params()" (submitData)="submit($event)"/>',
  imports: [NoteComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NoteCreatePageComponent {
  config: ICommon = {
    title: 'NOTE.TITLE',
    button: { icon: 'note_add', label: 'COMMON.BUTTON.CREATE' },
  };

  private readonly noteStore = inject(NoteStore);

  params = computed(() => {
    const navigationState = history.state;
    if (navigationState) {
      return { professional: navigationState['professional'], date: navigationState['date'] };
    }
    return undefined;
  });

  constructor() {
    this.noteStore.clean();
  }

  submit(note: INote) {
    this.noteStore.create(note);
  }
}
