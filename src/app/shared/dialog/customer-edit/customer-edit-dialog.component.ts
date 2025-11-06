import { Component, Inject } from '@angular/core';
import { IPrice } from '../../../interfaces/treatment';
import { ICurrencyAll } from '../../../interfaces/currency';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { PENALTY } from '../../../interfaces/payment';
import { PriceComponent } from '../../price/price.component';
import { TranslatePipe } from '@ngx-translate/core';
import { AppMaterialModule } from '../../../util/app-material.module';

@Component({
  selector: 'app-customer-edit-reservation-dialog',
  templateUrl: './customer-edit-dialog.component.html',
  styleUrls: ['./customer-edit-dialog.component.scss'],
  imports: [PriceComponent, AppMaterialModule, TranslatePipe],
})
export class CustomerEditDialogComponent {
  price: IPrice;
  currency: ICurrencyAll;
  penalty = PENALTY;

  constructor(public dialogRef: MatDialogRef<CustomerEditDialogComponent>, @Inject(MAT_DIALOG_DATA) public data: any) {
    this.price = data.price;
    this.currency = data.currency;
  }

  onNoClick(): void {
    return this.dialogRef.close();
  }

  doAction(): void {
    return this.dialogRef.close(true);
  }
}
