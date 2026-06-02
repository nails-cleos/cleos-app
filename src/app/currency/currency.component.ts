import { ChangeDetectionStrategy, Component, computed, effect, inject, input, signal } from '@angular/core';
import { FormControl, FormGroup, NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Currency, ICurrency } from '../interfaces/currency';
import { fieldChange } from '../util/validators';
import { BackButtonDirective } from '../directives/back-button.directive';
import { IError } from '../interfaces/common';
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
  id = input<string>();

  private readonly currencyStore = inject(CurrencyStore);
  private readonly formBuilder: NonNullableFormBuilder = inject(NonNullableFormBuilder);

  private selectedCurrencySignal = this.currencyStore.selected;
  private subErrorsSignal = this.currencyStore.subErrors;

  currencySignal = computed(() => this.selectedCurrencySignal());

  isAddModeSignal = computed(() => !this.id());
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
      const selected = this.selectedCurrencySignal();
      if (selected?.id) {
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

    effect(() => {
      const id = this.id();
      if (id) {
        this.currencyStore.loadById(id);
      } else {
        this.currencyStore.clean();
      }
    });
  }

  get getForm(): CurrencyForm {
    return this.form.controls;
  }

  submit(): void {
    if (this.form.invalid) {
      return;
    }

    const currencySignal = this.currencySignal();
    const currency: ICurrency = new Currency();
    currency.code = fieldChange(this.getForm.code, currencySignal?.code);
    currency.name = fieldChange(this.getForm.name, currencySignal?.name);
    currency.icon = fieldChange(this.getForm.icon, currencySignal?.icon);

    const id = this.id();
    if (!id) {
      this.currencyStore.create(currency);
    } else {
      this.currencyStore.update(id, currency);
    }
    return;
  }
}
