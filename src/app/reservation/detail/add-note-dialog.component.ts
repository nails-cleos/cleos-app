import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormControl, FormGroup, NonNullableFormBuilder, ReactiveFormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { AppMaterialModule } from '../../util/app-material.module';
import { TranslatePipe } from '@ngx-translate/core';

type NoteForm = {
  note: FormControl<string | undefined>,
  customerNote: FormControl<string | undefined>,
}

type NoteDialogData = {
  isCustomer: boolean,
  note?: string,
  customerNote?: string,
}

@Component({
  selector: 'app-add-note-dialog-component',
  templateUrl: './add-note-dialog.component.html',
  imports: [AppMaterialModule, ReactiveFormsModule, TranslatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AddNoteDialogComponent {
  private readonly formBuilder: NonNullableFormBuilder = inject(NonNullableFormBuilder);
  private readonly dialogRef: MatDialogRef<AddNoteDialogComponent> = inject(
    MatDialogRef<AddNoteDialogComponent>);
  readonly data = inject<NoteDialogData>(MAT_DIALOG_DATA);

  form: FormGroup<NoteForm> = this.formBuilder.group<NoteForm>({
    note: this.formBuilder.control(!this.data.isCustomer ? this.data.note : undefined),
    customerNote: this.formBuilder.control(this.data.customerNote),
  });

  get getForm(): NoteForm {
    return this.form.controls;
  }

  onNoClick() {
    this.dialogRef.close();
  }

  doAction() {
    this.dialogRef.close({
      note: this.getNoteValue(this.getForm.note.value),
      customerNote: this.getNoteValue(this.getForm.customerNote.value),
    });
  }

  private getNoteValue = (note?: string): string | undefined => note?.length === 0 ? undefined : note;
}
