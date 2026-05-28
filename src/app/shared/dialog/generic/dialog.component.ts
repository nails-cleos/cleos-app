import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import {
  MAT_DIALOG_DATA,
  MatDialogActions, MatDialogClose,
  MatDialogContent,
  MatDialogRef,
  MatDialogTitle,
} from '@angular/material/dialog';
import { IDialog } from '../../../interfaces/dialog';
import { TranslatePipe } from '@ngx-translate/core';
import { MatIcon } from '@angular/material/icon';
import { MatButton } from '@angular/material/button';

@Component({
  selector: 'app-dialog',
  templateUrl: './dialog.component.html',
  styleUrls: ['./dialog.component.scss'],
  imports: [MatIcon, MatButton, TranslatePipe, MatDialogTitle, MatDialogContent, MatDialogActions, MatDialogClose],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DialogComponent {
  readonly dialogRef = inject(MatDialogRef<DialogComponent>);
  readonly data = inject<IDialog>(MAT_DIALOG_DATA);

  get isWarning(): boolean {
    return this.data.variant === 'warning';
  }

  get icon(): string {
    return this.isWarning ? 'warning_amber' : 'info_outline';
  }

  get confirmColor(): string {
    return this.isWarning ? 'warn' : 'primary';
  }

  onNoClick() {
    this.dialogRef.close();
  }
}
