import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { AppMaterialModule } from '../../util/app-material.module';
import { IPaymentOption } from '../../interfaces/payment';

@Component({
  selector: 'app-payment-option-select',
  templateUrl: './payment-option-select.component.html',
  styleUrls: ['./payment-option-select.component.scss'],
  imports: [AppMaterialModule, ReactiveFormsModule, TranslateModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PaymentOptionSelectComponent {
  control = input.required<FormControl>();
  options = input.required<IPaymentOption[] | undefined>();
  required = input<boolean>(false);
  defaultIcon = input<string>('account_balance');
  valueMode = input<'object' | 'type'>('object');
  allowedValues = input<string[] | undefined>();
  variant = input<'field' | 'list-item'>('field');

  filteredOptions = computed(() => {
    const options = this.options() || [];
    const allowedValues = this.allowedValues() || [];

    if (!allowedValues.length) {
      return options;
    }

    const allowedTypes = new Set(allowedValues);
    return options.filter(option => allowedTypes.has(option.type));
  });

  getSelectedOption(): IPaymentOption | undefined {
    const value = this.control().value;
    const options = this.options() || [];

    if (!value) {
      return undefined;
    }

    if (this.valueMode() === 'type') {
      return options.find(option => option.type === value);
    }

    return value as IPaymentOption;
  }

  getSelectedType(): string | undefined {
    return this.getSelectedOption()?.type || this.control().value;
  }

  getSelectedLabel(): string | undefined {
    const option = this.getSelectedOption();
    return option?.label || option?.name || undefined;
  }
}
