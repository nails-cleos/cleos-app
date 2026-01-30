import { ChangeDetectionStrategy, Component, computed, effect, inject, signal } from '@angular/core';
import { FormControl, FormGroup, NonNullableFormBuilder, Validators } from '@angular/forms';
import { Store } from '@ngrx/store';
import { Currency, ICurrency } from '../interfaces/currency';
import { createCurrency, getCurrency, updateCurrency } from '../store/currency.actions';
import { fieldChange } from '../util/validators';
import { SharedModule } from '../shared/shared.module';
import { BackButtonDirective } from '../directives/back-button.directive';
import {
  getCurrentCurrencyIdPipe,
  getSelectedCurrencyPipe,
  getSubErrorsPipe,
} from '../store/selectors/currency.selectors';
import { toSignal } from '@angular/core/rxjs-interop';
import { IError } from '../interfaces/common';
import { CurrencyState } from '../store/reducers/currency.reducers';

type CurrencyForm = {
  code: FormControl<string>;
  name: FormControl<string | undefined>;
  icon: FormControl<string | undefined>;
}

@Component({
  selector: 'app-currency',
  templateUrl: './currency.component.html',
  styleUrls: ['./currency.component.scss'],
  imports: [SharedModule, BackButtonDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CurrencyComponent {
  private readonly store: Store<CurrencyState> = inject(Store<CurrencyState>);
  private readonly formBuilder: NonNullableFormBuilder = inject(NonNullableFormBuilder);

  private currencyId$ = this.store.pipe(getCurrentCurrencyIdPipe);
  private selectedCurrency$ = this.store.pipe(getSelectedCurrencyPipe);
  private subErrors$ = this.store.pipe(getSubErrorsPipe);

  private currencyIdSignal = toSignal(this.currencyId$);
  private selectedCurrencySignal = toSignal(this.selectedCurrency$);
  private subErrorsSignal = toSignal(this.subErrors$);

  private currencyId = computed(() => this.currencyIdSignal());

  currencySignal = computed(() => this.selectedCurrencySignal());

  isAddModeSignal = computed(() => !this.currencyId());
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
      const id = this.currencyId();
      if (id) {
        this.store.dispatch(getCurrency({ id }));
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

    const id = this.currencyId();
    if (!id) {
      this.store.dispatch(createCurrency({ currency }));
    } else {
      this.store.dispatch(updateCurrency({ id, currency }));
    }
    return;
  }
}
