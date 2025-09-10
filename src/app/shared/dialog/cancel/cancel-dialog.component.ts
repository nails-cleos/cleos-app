import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  ReactiveFormsModule,
  UntypedFormControl,
  UntypedFormGroup,
  Validators,
} from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { IPrice } from '../../../interfaces/treatment';
import { ICurrency } from '../../../interfaces/currency';
import { IPaymentOption, PENALTY } from '../../../interfaces/payment';
import { PriceComponent } from '../../price/price.component';
import { AppMaterialModule } from '../../../util/app-material.module';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-cancel-dialog',
  templateUrl: './cancel-dialog.component.html',
  styleUrls: ['./cancel-dialog.component.scss'],
  imports: [PriceComponent, AppMaterialModule, ReactiveFormsModule, TranslatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CancelDialogComponent implements OnInit {
  readonly dialogRef = inject(MatDialogRef<CancelDialogComponent>);
  readonly data = inject<any>(MAT_DIALOG_DATA);
  private formBuilder: FormBuilder = inject(FormBuilder);

  cancelForm!: UntypedFormGroup;
  typeForm!: UntypedFormGroup;
  paymentOptions: IPaymentOption[] = this.data.paymentOptions;

  paymentCancellation: FormControl = new UntypedFormControl('', [
    Validators.required,
  ]);

  options: string[] = this.data.options;
  price?: IPrice = this.data.price;
  currency: ICurrency = this.data.currency;
  showPenalty: boolean = this.data.showPenalty || false;
  penalty = PENALTY;

  constructor() {
    if (this.options.length === 1) {
      this.paymentCancellation.setValue(this.options[0]);
    }

    this.typeForm = this.formBuilder.group({
      type: new UntypedFormControl(undefined),
      bank: new UntypedFormControl(undefined),
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
    const cancelRequest = { cancelOption, type, paymentOptionId, bic: undefined };
    if (option?.subTypes?.length) {
      cancelRequest.bic = this.typeForm.get('bank')?.value?.bic;
    }
    this.dialogRef.close(cancelRequest);
    return;
  }

  ngOnInit(): void {
    this.createForm();
  }

  private createForm = (): void => {
    this.cancelForm = this.formBuilder.group({
      paymentCancellation: this.paymentCancellation,
    });
  };
}
