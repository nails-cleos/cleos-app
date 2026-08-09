import {
  ChangeDetectionStrategy,
  Component,
  effect,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { combineLatestWith } from 'rxjs';
import {
  FormGroup,
  NonNullableFormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import {
  Discount,
  DiscountForm,
  DiscountType,
  IDiscount,
  IDiscountAll,
} from './discount';
import { ICurrency } from '../currency/currency';
import { requireMatch } from '../util/validators';
import { map, startWith } from 'rxjs/operators';
import { TranslatePipe } from '@ngx-translate/core';
import { BackButtonDirective } from '../directives/back-button.directive';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { ICommon, IError } from '../interfaces/common';
import {
  MatError,
  MatFormField,
  MatHint,
  MatInput,
  MatLabel,
} from '@angular/material/input';
import { MatSelect } from '@angular/material/select';
import { MatOption } from '@angular/material/core';
import { MatIcon } from '@angular/material/icon';
import { MatButton } from '@angular/material/button';
import { KeyValuePipe } from '@angular/common';
import {
  MatAutocomplete,
  MatAutocompleteTrigger,
} from '@angular/material/autocomplete';
import { DiscountStore } from '../store/discount.store';
import { NavigationService } from '../services/navigation.service';

@Component({
  selector: 'app-discount',
  templateUrl: './discount.component.html',
  styleUrls: ['./discount.component.scss'],
  imports: [
    MatFormField,
    MatLabel,
    MatInput,
    MatSelect,
    MatOption,
    MatIcon,
    MatButton,
    ReactiveFormsModule,
    TranslatePipe,
    KeyValuePipe,
    BackButtonDirective,
    MatError,
    MatAutocomplete,
    MatAutocompleteTrigger,
    MatHint,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DiscountComponent {
  config = input.required<ICommon>();
  discount = input<IDiscountAll | undefined>();
  currencies = input<ICurrency[] | undefined>();

  submitData = output<IDiscount>();

  private readonly discountStore = inject(DiscountStore);
  private readonly formBuilder: NonNullableFormBuilder = inject(
    NonNullableFormBuilder,
  );
  private readonly navigationService: NavigationService =
    inject(NavigationService);

  private subErrorsSignal = this.discountStore.subErrors;

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

  filteredCurrencySignal = toSignal(
    this.getForm.currency.valueChanges.pipe(
      startWith(''),
      map((value: any) =>
        !value || typeof value === 'string' ? value : value.code,
      ),
      combineLatestWith(toObservable(this.currencies)),
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

  errors = signal<Record<string, unknown>>({});

  types = DiscountType;

  constructor() {
    effect(() => {
      const selected = this.discount();
      if (selected) {
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
  }

  get getConfig(): ICommon {
    return this.config();
  }

  get getForm(): DiscountForm {
    return this.form.controls;
  }

  submit(): void {
    if (this.form.invalid) {
      return;
    }

    this.submitData.emit(Discount.fromForm(this.getForm, this.discount()));
  }

  addCurrency(): void {
    this.navigationService.navigate(['currency', 'add']);
  }

  displayCurrencyFn = (currency: ICurrency): string =>
    currency?.code ? currency.code : '';

  keyDownHandler = (event: KeyboardEvent): void => {
    if (event.code === 'Backspace') {
      this.getForm.currency.setValue(undefined);
    }
  };

  private filterCurrency = (
    name: string,
    currencies: ICurrency[],
  ): ICurrency[] | undefined =>
    currencies?.filter(
      (option) => option.code?.toLowerCase().indexOf(name.toLowerCase()) === 0,
    );
}
