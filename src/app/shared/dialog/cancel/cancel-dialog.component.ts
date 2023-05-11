import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormControl, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { IPrice } from '../../../interfaces/treatment';
import { ICurrency } from '../../../interfaces/currency';

@Component({
  selector: 'app-cancel-dialog',
  templateUrl: './cancel-dialog.component.html',
  styleUrls: ['./cancel-dialog.component.scss']
})
export class CancelDialogComponent implements OnInit {
  cancelForm!: UntypedFormGroup;
  typeForm!: UntypedFormGroup;
  types: string[];

  paymentCancellation: FormControl = new UntypedFormControl('', [
    Validators.required
  ]);

  options: string[];
  price?: IPrice;
  currency: ICurrency;
  showPenalty: boolean;

  constructor(public dialogRef: MatDialogRef<CancelDialogComponent>, @Inject(MAT_DIALOG_DATA) public data: any,
              private formBuilder: FormBuilder) {
    this.options = data.options;
    this.price = data.price;
    this.types = data.types;
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
    const cancelOption = this.paymentCancellation.value === 'CHARGE' ? 'CHARGE_WITH_DISCOUNT' : this.paymentCancellation.value;
    const type = this.typeForm.get('type')?.value;
    const bic = this.typeForm.get('bank')?.value?.bic;
    return this.dialogRef.close({ cancelOption, type, bic });
  }

  ngOnInit(): void {
    this.createForm();
  }

  private createForm(): void {
    this.cancelForm = this.formBuilder.group({
      paymentCancellation: this.paymentCancellation
    });
  }
}
