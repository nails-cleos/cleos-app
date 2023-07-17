import { Component, Inject, OnInit } from '@angular/core';
import { FormControl, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-add-note-dialog-component',
  templateUrl: './add-note-dialog.component.html'
})
export class AddNoteDialogComponent implements OnInit {
  noteForm!: UntypedFormGroup;
  note: FormControl<string | null> = new FormControl('', [
    Validators.required
  ]);

  constructor(public dialogRef: MatDialogRef<AddNoteDialogComponent>, @Inject(MAT_DIALOG_DATA) public data: any,
              private formBuilder: UntypedFormBuilder) {
    this.note.setValue(data.note || '');
  }

  get onNoClick(): void {
    return this.dialogRef.close();
  }

  get doAction(): void {
    return this.dialogRef.close({ note: this.note.value });
  }

  ngOnInit(): void {
    this.createForm();
  }

  private createForm(): void {
    this.noteForm = this.formBuilder.group({
      note: this.note
    });
  }
}
