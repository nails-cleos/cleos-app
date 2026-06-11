import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { NoteComponent } from './note.component';
import { NoteStore } from '../store/note.store';
import { INote } from './note';
import { ICommon } from '../interfaces/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-note-create-page',
  template: '<app-note [config]="config" (submitData)="submit($event)"/>',
  imports: [NoteComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NoteCreatePageComponent {
  config: ICommon = {
    title: 'NOTE.TITLE',
    button: { icon: 'note_add', label: 'COMMON.BUTTON.CREATE' },
  };

  private readonly noteStore = inject(NoteStore);
  private readonly router: Router = inject(Router);

  constructor() {
    this.noteStore.clean();
    const navigation = this.router.currentNavigation();
    const navigationState = navigation?.extras.state;
    this.noteStore.setNavigationParams(navigationState ? {
      professional: navigationState['professional'],
      date: navigationState['date'],
    } : undefined);
  }

  submit(note: INote) {
    this.noteStore.create(note);
  }
}
