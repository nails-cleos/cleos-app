import { ChangeDetectionStrategy, Component, computed, effect, input, output, signal } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { requireMatch } from '../../util/validators';
import { IPaymentOption, PaymentPercentage } from '../../interfaces/payment';
import { AppMaterialModule } from '../../util/app-material.module';
import { TranslateModule } from '@ngx-translate/core';
import { CommonModule } from '@angular/common';
import { map, startWith } from 'rxjs/operators';

export type BankForm = {
  type: FormControl<IPaymentOption | undefined>;
  bank: FormControl<IPaymentOption | undefined>;
  percentage: FormControl<PaymentPercentage | undefined>;
};

@Component({
  selector: 'app-bank',
  templateUrl: './bank.component.html',
  styleUrls: ['./bank.component.scss'],
  imports: [CommonModule, AppMaterialModule, TranslateModule, ReactiveFormsModule, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BankComponent {
  form = input.required<FormGroup<BankForm>>();
  options = input<IPaymentOption[]>();
  professionalName = input<string>();
  firstTime = input<boolean>(false);
  percentageEmitter = output<number>();

  bankList: IPaymentOption[] = [];
  filteredBankSignal = signal<IPaymentOption[] | undefined>(undefined);
  private selectedType = signal<IPaymentOption | undefined>(undefined);
  private selectedPercentage = signal<PaymentPercentage | undefined>(undefined);

  type = computed(() => {
    const form = this.form();
    return form?.controls.type.value;
  });

  constructor() {
    // Subscribe to form valueChanges once form is available
    effect(() => {
      const form = this.form();
      if (!form) {
        return;
      }

      // Subscribe to type changes
      form.controls.type.valueChanges.subscribe(value => {
        this.selectedType.set(value);
      });

      // Subscribe to percentage changes
      form.controls.percentage.valueChanges.subscribe(value => {
        this.selectedPercentage.set(value);
      });

      // Subscribe to bank changes for filtering
      form.controls.bank.valueChanges.pipe(
        startWith(''),
        map(value => typeof value === 'string' ? value : value?.name),
        map(name => name ? this.filterBank(name) : this.bankList ? this.bankList.slice() : this.bankList),
      ).subscribe(filtered => {
        this.filteredBankSignal.set(filtered);
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
        this.getForm.type.setValidators([Validators.required]);
        this.getForm.type.updateValueAndValidity();
        this.getForm.percentage.setValidators([Validators.required]);
        this.getForm.percentage.updateValueAndValidity();

        const options = this.options();
        if (options?.length === 1) {
          this.getForm.type.setValue(options[0]);
        }
      }
    });

    effect(() => {
      const form = this.form();
      if (!form) {
        return;
      }

      const type = this.selectedType();
      if (type) {
        if (type.subTypes?.length) {
          this.bankList = type.subTypes;
          this.getForm.bank.setValidators([Validators.required, requireMatch]);
        } else {
          this.getForm.bank.setValidators([]);
          this.bankList = [];
        }
        if (type.hidePercentage) {
          this.getForm.percentage.setValidators([]);
        } else {
          this.getForm.percentage.setValidators([Validators.required]);
        }
      } else {
        this.getForm.bank.setValidators([]);
        this.getForm.percentage.setValidators([]);
        this.bankList = [];
      }
      this.getForm.percentage.updateValueAndValidity();
      this.getForm.bank.updateValueAndValidity();
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

  displayFnBank = (bank: IPaymentOption): string => bank ? `${bank.name}` : '';

  keyDownHandler = (event: KeyboardEvent): void => {
    if (event.code === 'Backspace') {
      this.getForm.bank.setValue(undefined);
    }
  };

  private filterBank = (name: string): IPaymentOption[] | undefined => this.bankList?.filter(
    option => option.name?.toLowerCase().indexOf(name.toLowerCase()) === 0);
}
