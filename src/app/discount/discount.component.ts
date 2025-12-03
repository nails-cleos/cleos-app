import { ChangeDetectionStrategy, Component, computed, effect, inject, signal } from '@angular/core';
import { combineLatestWith } from 'rxjs';
import { NonNullableFormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Store } from '@ngrx/store';
import { Discount, DiscountType, IDiscount } from '../interfaces/discount';
import { createDiscount, getDiscount, updateDiscount } from '../store/discount.actions';
import { Router } from '@angular/router';
import { ICurrency } from '../interfaces/currency';
import { fieldChange, requireMatch, valueChange } from '../util/validators';
import { map, startWith } from 'rxjs/operators';
import { TranslateService } from '@ngx-translate/core';
import { SharedModule } from '../shared/shared.module';
import { BackButtonDirective } from '../directives/back-button.directive';
import {
  getCurrenciesPipe,
  getCurrentDiscountIdPipe,
  getDiscountResponsePipe,
  getSelectedDiscountPipe,
  getSubErrorsPipe,
} from '../store/selectors/discount.selectors';
import { toSignal } from '@angular/core/rxjs-interop';
import { IError } from '../interfaces/common';
import { DiscountState } from '../store/reducers/discount.reducers';

type DiscountForm = {
  name: FormControl<string>;
  description: FormControl<string | undefined>;
  amount: FormControl<number>;
  type: FormControl<DiscountType | undefined>;
  currency: FormControl<ICurrency | undefined>;
}

@Component({
  selector: 'app-discount',
  templateUrl: './discount.component.html',
  styleUrls: ['./discount.component.scss'],
  imports: [SharedModule, BackButtonDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DiscountComponent {
  private readonly store: Store<DiscountState> = inject(Store<DiscountState>);
  private readonly formBuilder: NonNullableFormBuilder = inject(NonNullableFormBuilder);
  private readonly router: Router = inject(Router);
  private readonly translate: TranslateService = inject(TranslateService);

  private discountId$ = this.store.pipe(getCurrentDiscountIdPipe);
  private selectedDiscount$ = this.store.pipe(getSelectedDiscountPipe);
  private allCurrencies$ = this.store.pipe(getCurrenciesPipe);
  private subErrors$ = this.store.pipe(getSubErrorsPipe);
  private response$ = this.store.pipe(getDiscountResponsePipe);

  private discountIdSignal = toSignal(this.discountId$, { initialValue: null });
  private selectedDiscountSignal = toSignal(this.selectedDiscount$);
  private subErrorsSignal = toSignal(this.subErrors$);
  private responseSignal = toSignal(this.response$);

  form: FormGroup<DiscountForm> = this.formBuilder.group<DiscountForm>({
    name: this.formBuilder.control('', {
      validators: [Validators.required],
    }),
    description: this.formBuilder.control(undefined),
    currency: this.formBuilder.control(undefined, {
      validators: [Validators.required, requireMatch],
    }),
    amount: this.formBuilder.control(0, {
      validators: [Validators.required, Validators.min(1)],
    }),
    type: this.formBuilder.control(undefined, {
      validators: [Validators.required],
    }),
  });

  discountSignal = computed(() => this.selectedDiscountSignal());
  filteredCurrencySignal = toSignal(
    this.getForm.currency.valueChanges.pipe(
      startWith(''),
      map((value: any) => !value || typeof value === 'string' ? value : value.code),
      combineLatestWith(this.allCurrencies$),
      map(([name, currencies]) => {
        if (name) {
          return this.filterCurrency(name, currencies);
        } else {
          return currencies ? currencies.slice() : currencies;
        }
      }),
    ),
  );

  isAddModeSignal = computed(() => !this.discountIdSignal());
  errors = signal<Record<string, unknown>>({});

  private readonly language: string = this.translate.currentLang;

  types = DiscountType;

  constructor() {
    effect(() => {
      const selected = this.selectedDiscountSignal();
      if (selected?.id) {
        this.form.patchValue(selected);
      }
    });

    effect(() => {
      const subErrors = this.subErrorsSignal();
      if (subErrors) {
        const errorMap: Record<string, unknown> = {};
        subErrors.forEach((error: IError) => {
          const field = error.field as keyof DiscountForm | undefined;

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
        this.router.navigate([this.language, 'discounts']);
      }
    });

    effect(() => {
      const id = this.discountIdSignal();
      if (id) {
        this.store.dispatch(getDiscount({ id }));
      }
    });
  }

  get getForm(): DiscountForm {
    return this.form.controls;
  }

  submit(): void {
    if (this.form.invalid) {
      return;
    }

    const discountSignal = this.discountSignal();
    const discount: IDiscount = new Discount();
    discount.name = fieldChange(this.getForm.name, discountSignal?.name);
    discount.description = valueChange(this.getForm.description.value, discountSignal?.description);
    discount.type = fieldChange(this.getForm.type, discountSignal?.type);
    discount.amount = fieldChange(this.getForm.amount, discountSignal?.amount);

    if (this.isAddModeSignal()) {
      discount.currencyId = this.getForm.currency.value?.id;
      this.store.dispatch(createDiscount({ discount }));
    } else {
      const id = this.discountIdSignal()!;
      this.store.dispatch(updateDiscount({ id, discount }));
    }
  }

  addCurrency(): void {
    this.router.navigate([this.language, 'currency', 'add']);
  }

  displayCurrencyFn = (currency: ICurrency): string => currency?.code ? currency.code : '';

  keyDownHandler = (event: KeyboardEvent): void => {
    if (event.code === 'Backspace') {
      this.getForm.currency.setValue(undefined);
    }
  };

  private filterCurrency = (name: string, currencies: ICurrency[]): ICurrency[] | undefined => currencies?.filter(
    option => option.code?.toLowerCase().indexOf(name.toLowerCase()) === 0);
}
