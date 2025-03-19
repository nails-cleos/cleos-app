import { Component, Inject } from '@angular/core';
import { IPrice } from '../../../interfaces/treatment';
import { ICurrencyAll } from '../../../interfaces/currency';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { PENALTY } from '../../../interfaces/payment';
import { SharedModule } from "../../shared.module";
import { PriceComponent } from "../../price/price.component";

@Component({
  selector: 'app-customer-edit-reservation-dialog',
  templateUrl: './customer-edit-dialog.component.html',
  styleUrls: ['./customer-edit-dialog.component.scss'],
  standalone: true,
  imports: [SharedModule, PriceComponent],
})
export class CustomerEditDialogComponent {
  price: IPrice;
  currency: ICurrencyAll;
  penalty = PENALTY;

  constructor(public dialogRef: MatDialogRef<CustomerEditDialogComponent>, @Inject(MAT_DIALOG_DATA) public data: any) {
    this.price = data.price;
    this.currency = data.currency;
  }

  get onNoClick(): void {
    return this.dialogRef.close();
  }

  get doAction(): void {
    return this.dialogRef.close(true);
  }
}
