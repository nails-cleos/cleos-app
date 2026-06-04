import { ChangeDetectionStrategy, Component, effect, inject, input, output, signal } from '@angular/core';
import { FormControl, FormGroup, NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Currency, ICurrency, ICurrencyAll } from '../interfaces/currency';
import { fieldChange } from '../util/validators';
import { BackButtonDirective } from '../directives/back-button.directive';
import { ICommon, IError } from '../interfaces/common';
import { MatError, MatFormField, MatInput, MatLabel } from '@angular/material/input';
import { MatIcon } from '@angular/material/icon';
import { MatButton } from '@angular/material/button';
import { MatSelect, MatSelectTrigger } from '@angular/material/select';
import { TranslatePipe } from '@ngx-translate/core';
import { MatOption } from '@angular/material/core';
import { CurrencyStore } from '../store/currency.store';

type CurrencyForm = {
  code: FormControl<string>;
  name: FormControl<string | undefined>;
  icon: FormControl<string | undefined>;
}

@Component({
  selector: 'app-currency',
  templateUrl: './currency.component.html',
  styleUrls: ['./currency.component.scss'],
  imports: [MatFormField, MatLabel, MatInput, MatSelect, MatOption, MatIcon, MatButton, ReactiveFormsModule,
    TranslatePipe, MatError, BackButtonDirective, BackButtonDirective, MatSelectTrigger],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CurrencyComponent {
  config = input.required<ICommon>();
  currency = input<ICurrencyAll | undefined>();

  submitData = output<ICurrency>();

  private readonly currencyStore = inject(CurrencyStore);
  private readonly formBuilder: NonNullableFormBuilder = inject(NonNullableFormBuilder);

  private subErrorsSignal = this.currencyStore.subErrors;

  errors = signal<Record<string, unknown>>({});

  form: FormGroup<CurrencyForm> = this.formBuilder.group<CurrencyForm>({
    code: this.formBuilder.control('', {
      validators: [Validators.required],
    }),
    name: this.formBuilder.control(undefined),
    icon: this.formBuilder.control(undefined),
  });

  icons = ['attach_money', 'euro', 'currency_pound'];

  constructor() {
    effect(() => {
      const selected = this.currency();
      if (selected) {
        this.form.patchValue(selected);
      }
    });


    effect(() => {
      const subErrors = this.subErrorsSignal();
      if (subErrors) {
        const errorMap: Record<string, unknown> = {};
        subErrors.forEach((error: IError) => {
          const field = error.field as keyof CurrencyForm | undefined;

          if (field && field in this.form.controls) {
            errorMap[field] = error.message;
            this.form.controls[field].setErrors({ incorrect: true });
          }
        });
        this.errors.set(errorMap);
      }
    });
  }

  get getConfig(): ICommon {
    return this.config();
  }

  get getForm(): CurrencyForm {
    return this.form.controls;
  }

  submit(): void {
    if (this.form.invalid) {
      return;
    }

    const currencySignal = this.currency();
    const currency: ICurrency = new Currency();
    currency.code = fieldChange(this.getForm.code, currencySignal?.code);
    currency.name = fieldChange(this.getForm.name, currencySignal?.name);
    currency.icon = fieldChange(this.getForm.icon, currencySignal?.icon);

    this.submitData.emit(currency);
  }
}
