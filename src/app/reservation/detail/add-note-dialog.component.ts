import { Component, Inject, OnInit } from '@angular/core';
import { FormControl, ReactiveFormsModule, UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { AppMaterialModule } from '../../util/app-material.module';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-add-note-dialog-component',
  templateUrl: './add-note-dialog.component.html',
  imports: [AppMaterialModule, ReactiveFormsModule, TranslatePipe]
})
export class AddNoteDialogComponent implements OnInit {
  noteForm!: UntypedFormGroup;
  note: FormControl<string | null> = new FormControl();
  customerNote: FormControl<string | null> = new FormControl();

  constructor(public dialogRef: MatDialogRef<AddNoteDialogComponent>, @Inject(MAT_DIALOG_DATA) public data: any,
              private formBuilder: UntypedFormBuilder) {
    if (!data.isCustomer) {
      this.note.setValue(data.note);
    }
    this.customerNote.setValue(data.customerNote);
  }

  get onNoClick(): void {
    return this.dialogRef.close();
  }

  get doAction(): void {
    return this.dialogRef.close({
      note: this.getNoteValue(this.note.value), customerNote: this.getNoteValue(this.customerNote.value)
    });
  }

  ngOnInit(): void {
    this.createForm();
  }

  private createForm = (): void => {
    this.noteForm = this.formBuilder.group({
      note: this.note,
      customerNote: this.customerNote
    });
  };

  private getNoteValue = (note: string | null): string | null => note === null || note.length === 0 ? null : note;
}
