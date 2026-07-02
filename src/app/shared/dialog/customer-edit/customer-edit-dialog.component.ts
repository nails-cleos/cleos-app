import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { IPrice } from '../../../treatment/treatment';
import { ICurrencyAll } from '../../../currency/currency';
import {
  MAT_DIALOG_DATA,
  MatDialogActions,
  MatDialogContent,
  MatDialogRef,
  MatDialogTitle,
} from '@angular/material/dialog';
import { PENALTY } from '../../../interfaces/payment';
import { TranslatePipe } from '@ngx-translate/core';
import { MatIcon } from '@angular/material/icon';
import { MatButton } from '@angular/material/button';

type CustomerEditData = {
  price: IPrice;
  currency: ICurrencyAll;
  small: boolean;
};

@Component({
  selector: 'app-customer-edit-reservation-dialog',
  templateUrl: './customer-edit-dialog.component.html',
  styleUrls: ['./customer-edit-dialog.component.scss'],
  imports: [MatIcon, MatButton, TranslatePipe, MatDialogTitle, MatDialogContent, MatDialogActions],
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
