import { ChangeDetectionStrategy, Component, computed, effect, input, output, signal } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { IPaymentOption, PaymentPercentage } from '../../interfaces/payment';
import { AppMaterialModule } from '../../util/app-material.module';
import { TranslateModule } from '@ngx-translate/core';
import { PaymentOptionSelectComponent } from '../payment-option-select/payment-option-select.component';

export type BankForm = {
  option: FormControl<IPaymentOption | undefined>;
  percentage: FormControl<PaymentPercentage | undefined>;
};

@Component({
  selector: 'app-bank',
  templateUrl: './bank.component.html',
  styleUrls: ['./bank.component.scss'],
  imports: [AppMaterialModule, TranslateModule, ReactiveFormsModule, FormsModule, PaymentOptionSelectComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BankComponent {
  form = input.required<FormGroup<BankForm>>();
  options = input<IPaymentOption[]>();
  professionalName = input<string>();
  firstTime = input<boolean>(false);
  showPaymentMessage = input<boolean>(true);
  percentageEmitter = output<number>();

  private selectedOption = signal<IPaymentOption | undefined>(undefined);
  private selectedPercentage = signal<PaymentPercentage | undefined>(undefined);

  option = computed(() => this.selectedOption() ?? this.form().controls.option.value);

  constructor() {
    // Subscribe to form valueChanges once form is available
    effect(() => {
      const form = this.form();
      if (!form) {
        return;
      }

      // Subscribe to type changes
      this.selectedOption.set(form.controls.option.value);
      form.controls.option.valueChanges.subscribe(value => {
        this.selectedOption.set(value);
      });

      // Subscribe to percentage changes
      this.selectedPercentage.set(form.controls.percentage.value);
      form.controls.percentage.valueChanges.subscribe(value => {
        this.selectedPercentage.set(value);
      });
    });

    effect(() => {
      const form = this.form();
      if (!form) {
        return;
      }

      const firstTime = this.firstTime();
      this.getForm.percentage.setValue(PaymentPercentage.total);
      if (firstTime) {
        this.getForm.option.setValidators([Validators.required]);
        this.getForm.option.updateValueAndValidity();
        this.getForm.percentage.setValidators([Validators.required]);
        this.getForm.percentage.updateValueAndValidity();

        const options = this.options();
        if (options?.length === 1) {
          this.getForm.option.setValue(options[0]);
        }
      }
    });

    effect(() => {
      const form = this.form();
      if (!form) {
        return;
      }

      const type = this.selectedOption();
      if (type) {
        if (type.hidePercentage) {
          this.getForm.percentage.setValidators([]);
        } else {
          this.getForm.percentage.setValidators([Validators.required]);
        }
      } else {
        this.getForm.percentage.setValidators([]);
      }
      this.getForm.percentage.updateValueAndValidity();
    });

    effect(() => {
      const form = this.form();
      if (!form) {
        return;
      }

      const value = this.selectedPercentage();
      let percentage;
      switch (value) {
        case 'TOTAL':
          percentage = 100;
          break;
        case 'DEPOSIT_50':
          percentage = 50;
          break;
        default:
          percentage = 0;
      }
      this.percentageEmitter.emit(percentage);
    });
  }

  get getForm(): BankForm {
    return this.form().controls;
  }
}
