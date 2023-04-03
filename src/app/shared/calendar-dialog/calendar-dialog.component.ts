import { Component } from '@angular/core';
import { UntypedFormControl } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-calendar-dialog',
  templateUrl: './calendar-dialog.component.html',
  styleUrls: ['./calendar-dialog.component.scss']
})
export class CalendarDialogComponent {

  radio: UntypedFormControl = new UntypedFormControl('reservation');

  constructor(public dialogRef: MatDialogRef<CalendarDialogComponent>) {
  }

  get onNoClick(): void {
    return this.dialogRef.close();
  }
}
