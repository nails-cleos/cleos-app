import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { IPrice } from '../../../interfaces/treatment';
import { ICurrencyAll } from '../../../interfaces/currency';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { PENALTY } from '../../../interfaces/payment';
import { TranslatePipe } from '@ngx-translate/core';
import { AppMaterialModule } from '../../../util/app-material.module';

type CustomerEditData = {
  price: IPrice;
  currency: ICurrencyAll;
  small: boolean;
};

@Component({
  selector: 'app-customer-edit-reservation-dialog',
  templateUrl: './customer-edit-dialog.component.html',
  styleUrls: ['./customer-edit-dialog.component.scss'],
  imports: [AppMaterialModule, TranslatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CustomerEditDialogComponent {
  private readonly data = inject<CustomerEditData>(MAT_DIALOG_DATA);
  private readonly dialogRef: MatDialogRef<CustomerEditDialogComponent> = inject(
    MatDialogRef<CustomerEditDialogComponent>);

  price: IPrice = this.data.price;
  currency: ICurrencyAll = this.data.currency;
  penalty = PENALTY;
  small: boolean = this.data.small;

  onNoClick() {
    this.dialogRef.close();
  }

  doAction() {
    this.dialogRef.close(true);
  }
}
