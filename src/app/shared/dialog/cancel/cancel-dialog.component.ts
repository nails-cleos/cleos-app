import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormControl, FormGroup, NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import {
  MAT_DIALOG_DATA,
  MatDialogActions,
  MatDialogContent,
  MatDialogRef,
  MatDialogTitle,
} from '@angular/material/dialog';
import { IPrice } from '../../../treatment/treatment';
import { ICurrency } from '../../../currency/currency';
import { IPaymentOption, PENALTY } from '../../../interfaces/payment';
import { PriceComponent } from '../../price/price.component';
import { TranslatePipe } from '@ngx-translate/core';
import { BankForm } from '../../bank/bank.component';
import { MatError, MatLabel } from '@angular/material/input';
import { MatIcon } from '@angular/material/icon';
import { MatButton } from '@angular/material/button';
import { MatRadioButton, MatRadioGroup } from '@angular/material/radio';

type CancelForm = {
  paymentCancellation: FormControl<any>,
}

type CancelDialogData = {
  options: string[],
  paymentOptions?: IPaymentOption[],
  price?: IPrice,
  currency: ICurrency,
  showPenalty?: boolean,
  small?: boolean,
}

@Component({
  selector: 'app-cancel-dialog',
  templateUrl: './cancel-dialog.component.html',
  styleUrls: ['./cancel-dialog.component.scss'],
  imports: [PriceComponent, MatLabel, MatIcon, MatButton, TranslatePipe, MatError, ReactiveFormsModule, MatDialogTitle,
    MatDialogContent, MatRadioGroup, MatRadioButton, MatDialogActions],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CancelDialogComponent {
  private readonly dialogRef = inject(MatDialogRef<CancelDialogComponent>);
  private readonly formBuilder: NonNullableFormBuilder = inject(NonNullableFormBuilder);
  readonly data = inject<CancelDialogData>(MAT_DIALOG_DATA);

  form: FormGroup<CancelForm> = this.formBuilder.group<CancelForm>({
    paymentCancellation: this.formBuilder.control(undefined, {
      validators: [Validators.required],
    }),
  });
  typeForm: FormGroup<BankForm> = this.formBuilder.group<BankForm>({
    option: this.formBuilder.control(undefined),
    percentage: this.formBuilder.control(undefined),
  });
  paymentOptions?: IPaymentOption[] = this.data.paymentOptions?.map(it => {
    it.hidePercentage = true;
    return it;
  });

  options: string[] = this.data.options;
  price?: IPrice = this.data.price;
  currency: ICurrency = this.data.currency;
  showPenalty: boolean = this.data.showPenalty || false;
  penalty = PENALTY;

  showBank = !!this.data.paymentOptions?.length;

  constructor() {
    if (this.options.length === 1) {
      this.getForm.paymentCancellation.setValue(this.options[0]);
    }
  }

  get getForm(): CancelForm {
    return this.form.controls;
  }

  get getTypeForm(): BankForm {
    return this.typeForm.controls;
  }

  onNoClick() {
    this.dialogRef.close();
  }

  doAction(): void {
    if (this.form.invalid || this.typeForm.invalid) {
      return;
    }
    const cancelOption = this.getForm.paymentCancellation.value;
    const option = this.getTypeForm.option.value;
    const type = option?.type;
    const cancelRequest = { cancelOption, type };
    this.dialogRef.close(cancelRequest);
    return;
  }
}
