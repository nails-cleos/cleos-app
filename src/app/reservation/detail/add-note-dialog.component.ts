import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import {
  FormControl,
  FormGroup,
  NonNullableFormBuilder,
  ReactiveFormsModule,
} from '@angular/forms';
import {
  MAT_DIALOG_DATA,
  MatDialogActions,
  MatDialogContent,
  MatDialogRef,
  MatDialogTitle,
} from '@angular/material/dialog';
import { TranslatePipe } from '@ngx-translate/core';
import {
  MatFormField,
  MatHint,
  MatInput,
  MatLabel,
} from '@angular/material/input';
import { MatIcon } from '@angular/material/icon';
import { MatButton } from '@angular/material/button';

type NoteForm = {
  note: FormControl<string | undefined>;
  customerNote: FormControl<string | undefined>;
};

type NoteDialogData = {
  isCustomer: boolean;
  note?: string;
  customerNote?: string;
};

@Component({
  selector: 'app-add-note-dialog-component',
  templateUrl: './add-note-dialog.component.html',
  styleUrls: ['./add-note-dialog.component.scss'],
  imports: [
    MatFormField,
    MatLabel,
    MatInput,
    MatIcon,
    MatButton,
    TranslatePipe,
    ReactiveFormsModule,
    MatDialogTitle,
    MatDialogContent,
    MatHint,
    MatDialogActions,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AddNoteDialogComponent {
  private readonly formBuilder: NonNullableFormBuilder = inject(
    NonNullableFormBuilder,
  );
  private readonly dialogRef: MatDialogRef<AddNoteDialogComponent> = inject(
    MatDialogRef<AddNoteDialogComponent>,
  );
  readonly data = inject<NoteDialogData>(MAT_DIALOG_DATA);

  form: FormGroup<NoteForm> = this.formBuilder.group<NoteForm>({
    note: this.formBuilder.control(
      !this.data.isCustomer ? this.data.note : undefined,
    ),
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

  private getNoteValue = (note?: string): string | undefined =>
    note?.length === 0 ? undefined : note;
}
