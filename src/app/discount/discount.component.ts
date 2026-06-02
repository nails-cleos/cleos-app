import { ChangeDetectionStrategy, Component, computed, effect, inject, input, signal } from '@angular/core';
import { combineLatestWith } from 'rxjs';
import { FormControl, FormGroup, NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Discount, DiscountType, IDiscount } from '../interfaces/discount';
import { Router } from '@angular/router';
import { ICurrency } from '../interfaces/currency';
import { fieldChange, requireMatch, valueChange } from '../util/validators';
import { map, startWith } from 'rxjs/operators';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { BackButtonDirective } from '../directives/back-button.directive';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { IError } from '../interfaces/common';
import { MatError, MatFormField, MatHint, MatInput, MatLabel } from '@angular/material/input';
import { MatSelect } from '@angular/material/select';
import { MatOption } from '@angular/material/core';
import { MatIcon } from '@angular/material/icon';
import { MatButton } from '@angular/material/button';
import { KeyValuePipe } from '@angular/common';
import { MatAutocomplete, MatAutocompleteTrigger } from '@angular/material/autocomplete';
import { DiscountStore } from '../store/discount.store';

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
  imports: [MatFormField, MatLabel, MatInput, MatSelect, MatOption, MatIcon, MatButton, ReactiveFormsModule,
    TranslatePipe, KeyValuePipe, BackButtonDirective, MatError, MatAutocomplete, MatAutocompleteTrigger, MatHint],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DiscountComponent {
  id = input<string>();

  private readonly discountStore = inject(DiscountStore);
  private readonly formBuilder: NonNullableFormBuilder = inject(NonNullableFormBuilder);
  private readonly router: Router = inject(Router);
  private readonly translate: TranslateService = inject(TranslateService);

  private selectedDiscountSignal = this.discountStore.selected;
  private subErrorsSignal = this.discountStore.subErrors;
  private allCurrenciesSignal = this.discountStore.currencies;

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
      combineLatestWith(toObservable(this.allCurrenciesSignal)),
      map(([name, currencies]) => {
        const allCurrencies = currencies ?? [];
        if (name) {
          return this.filterCurrency(name, allCurrencies);
        } else {
          return allCurrencies.slice();
        }
      }),
    ),
  );

  isAddModeSignal = computed(() => !this.id());
  errors = signal<Record<string, unknown>>({});

  private readonly language: string = this.translate.getCurrentLang();

  types = DiscountType;

  constructor() {
    this.discountStore.clean();
    this.discountStore.loadCurrencies();

    effect(() => {
      const selected = this.selectedDiscountSignal();
      if (selected?.id) {
        this.form.patchValue({
          name: selected.name,
          description: selected.description,
          amount: selected.amount,
          type: selected.type as DiscountType | undefined,
          currency: selected.currency,
        });
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
      const id = this.id();
      if (id) {
        this.discountStore.loadById(id);
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

    const id = this.id();
    if (!id) {
      discount.currencyId = this.getForm.currency.value?.id;
      this.discountStore.create(discount);
    } else {
      this.discountStore.update(id, discount);
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
