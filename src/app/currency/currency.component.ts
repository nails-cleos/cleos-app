import { ChangeDetectionStrategy, Component, computed, effect, inject, signal } from '@angular/core';
import { NonNullableFormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Store } from '@ngrx/store';
import { Router } from '@angular/router';
import { Currency, ICurrency } from '../interfaces/currency';
import { createCurrency, getCurrency, updateCurrency } from '../store/currency.actions';
import { TranslateService } from '@ngx-translate/core';
import { fieldChange } from '../util/validators';
import { SharedModule } from '../shared/shared.module';
import { BackButtonDirective } from '../directives/back-button.directive';
import {
  getCurrentCurrencyIdPipe,
  getCurrencyResponsePipe,
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
  private readonly router: Router = inject(Router);
  private readonly translate: TranslateService = inject(TranslateService);

  private currencyId$ = this.store.pipe(getCurrentCurrencyIdPipe);
  private selectedCurrency$ = this.store.pipe(getSelectedCurrencyPipe);
  private subErrors$ = this.store.pipe(getSubErrorsPipe);
  private response$ = this.store.pipe(getCurrencyResponsePipe);

  private currencyIdSignal = toSignal(this.currencyId$);
  private selectedCurrencySignal = toSignal(this.selectedCurrency$);
  private subErrorsSignal = toSignal(this.subErrors$);
  private responseSignal = toSignal(this.response$);

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
  private readonly language: string = this.translate.currentLang;

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
      if (this.responseSignal()) {
        this.router.navigate([this.language, 'currency']);
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

    if (this.isAddModeSignal()) {
      this.store.dispatch(
        createCurrency({ currency }),
      );
    } else {
      const id = this.currencyId()!;
      this.store.dispatch(updateCurrency({ id, currency }));
    }
    return;
  }
}
