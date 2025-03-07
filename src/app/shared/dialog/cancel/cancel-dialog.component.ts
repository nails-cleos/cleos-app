import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormControl, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { IPrice } from '../../../interfaces/treatment';
import { ICurrency } from '../../../interfaces/currency';
import { IPaymentOption, PENALTY } from '../../../interfaces/payment';

@Component({
  selector: 'app-cancel-dialog',
  templateUrl: './cancel-dialog.component.html',
  styleUrls: ['./cancel-dialog.component.scss']
})
export class CancelDialogComponent implements OnInit {
  cancelForm!: UntypedFormGroup;
  typeForm!: UntypedFormGroup;
  paymentOptions: IPaymentOption[];

  paymentCancellation: FormControl = new UntypedFormControl('', [
    Validators.required
  ]);

  options: string[];
  price?: IPrice;
  currency: ICurrency;
  showPenalty: boolean;
  penalty = PENALTY;

  constructor(public dialogRef: MatDialogRef<CancelDialogComponent>, @Inject(MAT_DIALOG_DATA) public data: any,
              private formBuilder: FormBuilder) {
    this.options = data.options;
    this.price = data.price;
    this.paymentOptions = data.paymentOptions;
    this.currency = data.currency;
    this.showPenalty = data.showPenalty || false;

    if (this.options.length === 1) {
      this.paymentCancellation.setValue(this.options[0]);
    }

    this.typeForm = this.formBuilder.group({
      type: new UntypedFormControl(undefined),
      bank: new UntypedFormControl(undefined)
    });
  }

  get onNoClick(): void {
    return this.dialogRef.close();
  }

  get doAction(): void {
    if (this.cancelForm.invalid || this.typeForm.invalid) {
      return;
    }
    // if we want to only charge, it is the same use CHARGE_WITH_DISCOUNT or CHARGE_WITH_REFUND
    const cancelOption = this.paymentCancellation.value === 'CHARGE' ? 'CHARGE_WITH_DISCOUNT' :
      this.paymentCancellation.value;
    const option: IPaymentOption = this.typeForm.get('type')?.value;
    const type = option?.type;
    const paymentOptionId = option?.bic;
    const payload = { cancelOption, type, paymentOptionId, bic: undefined };
    if (option?.subTypes?.length) {
      payload.bic = this.typeForm.get('bank')?.value?.bic;
    }
    return this.dialogRef.close(payload);
  }

  ngOnInit(): void {
    this.createForm();
  }

  private createForm = (): void => {
    this.cancelForm = this.formBuilder.group({
      paymentCancellation: this.paymentCancellation
    });
  }
}
