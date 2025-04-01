import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { IDialog } from '../../../interfaces/dialog';
import { TranslatePipe } from '@ngx-translate/core';
import { AppMaterialModule } from '../../../util/app-material.module';

@Component({
  selector: 'app-dialog',
  templateUrl: './dialog.component.html',
  styleUrls: ['./dialog.component.scss'],
  imports: [AppMaterialModule, TranslatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DialogComponent {
  readonly dialogRef = inject(MatDialogRef<DialogComponent>);
  readonly data = inject<IDialog>(MAT_DIALOG_DATA);

  get onNoClick(): void {
    return this.dialogRef.close();
  }
}
