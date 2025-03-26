import { Component } from '@angular/core';
import { ReactiveFormsModule, UntypedFormControl } from '@angular/forms';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatRadioModule } from "@angular/material/radio";
import { TranslateModule } from "@ngx-translate/core";
import { MatButton } from "@angular/material/button";

@Component({
  selector: 'app-calendar-dialog',
  templateUrl: './calendar-dialog.component.html',
  styleUrls: ['./calendar-dialog.component.scss'],
  standalone: true,
  imports: [MatRadioModule, MatDialogModule, ReactiveFormsModule, TranslateModule, MatButton]
})
export class CalendarDialogComponent {

  radio: UntypedFormControl = new UntypedFormControl('reservation');

  constructor(public dialogRef: MatDialogRef<CalendarDialogComponent>) {
  }

  get onNoClick(): void {
    return this.dialogRef.close();
  }
}
