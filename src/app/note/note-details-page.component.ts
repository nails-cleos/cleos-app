import { ChangeDetectionStrategy, Component, computed, effect, inject, input } from '@angular/core';
import { NoteComponent } from './note.component';
import { NoteStore } from '../store/note.store';
import { INote } from './note';
import { ICommon } from '../interfaces/common';
import { SkeletonComponent } from '../shared/skeleton/skeleton.component';
import { executeDialogNoWidth } from '../util/helper';
import { DialogComponent } from '../shared/dialog/generic/dialog.component';
import { TranslateService } from '@ngx-translate/core';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-note-details-page',
  template: `
    @if (note(); as note) {
      <app-note [note]="note" [config]="config" (submitData)="submit($event)" (deleteData)="delete()"/>
    } @else {
      <app-skeleton [buttons]="3"/>
    }
  `,
  imports: [NoteComponent, SkeletonComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NoteDetailsPageComponent {
  id = input.required<string>();
  config: ICommon = {
    title: 'NOTE.DETAIL',
    button: { icon: 'published_with_changes', label: 'COMMON.BUTTON.UPDATE', showDelete: true },
  };

  private readonly translateService: TranslateService = inject(TranslateService);
  private readonly dialog: MatDialog = inject(MatDialog);
  private readonly noteStore = inject(NoteStore);
  note = computed(() => this.noteStore.selected());

  constructor() {
    effect(() => {
      this.noteStore.clean();
      this.noteStore.loadById(this.id());
    });
  }

  submit(note: INote) {
    this.noteStore.update(this.id(), note);
  }

  delete() {
    const note = this.note();
    if (!note) {
      return;
    }
    const title = this.translateService.instant('NOTE.DELETED.TITLE');
    const description = note.description;
    const content = this.translateService.instant('NOTE.DELETED.CONTENT', { description });

    executeDialogNoWidth(this.dialog, DialogComponent, { title, content, value: note, variant: 'warning' }, result => {
      if (result) {
        this.noteStore.delete(result.id, result.description);
      }
    });
  }
}
