import { ChangeDetectionStrategy, Component, computed, effect, inject, signal, Signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { Store } from '@ngrx/store';
import { combineLatestWith } from 'rxjs';
import { getAccountByCustomerId, updateAccount } from '../../store/account.actions';
import { IAccountAll, ITransaction, Transaction } from '../../interfaces/account';
import { ICurrency, ICurrencyAll } from '../../interfaces/currency';
import { map, startWith } from 'rxjs/operators';
import { FormControl, FormGroup, NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { requireMatch, valueChange } from '../../util/validators';
import { AuthUserService } from '../../services/auth-user.service';
import { getLocale } from '../../util/helper';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { BalanceComponent } from '../balance/balance.component';
import { BackButtonDirective } from '../../directives/back-button.directive';
import {
  getAccountResponsePipe,
  getCurrentCustomerIdPipe,
  getSelectedAccountPipe,
  getSubErrorsPipe,
} from '../../store/selectors/account.selectors';
import { toSignal } from '@angular/core/rxjs-interop';
import { IError } from '../../interfaces/common';
import { AccountState } from '../../store/reducers/account.reducers';
import { MatError, MatFormField, MatInput, MatLabel, MatPrefix } from '@angular/material/input';
import { MatAutocomplete, MatAutocompleteTrigger } from '@angular/material/autocomplete';
import { MatIcon } from '@angular/material/icon';
import { MatButton } from '@angular/material/button';
import { MatOption } from '@angular/material/core';

type BalanceForm = {
  currency: FormControl<ICurrencyAll | undefined>;
  gift: FormControl<number>;
};

@Component({
  selector: 'app-account',
  templateUrl: './account.component.html',
  styleUrls: ['./account.component.scss'],
  imports: [MatFormField, MatLabel, MatInput, MatOption, MatIcon, MatButton, ReactiveFormsModule, TranslatePipe,
    RouterLink, MatAutocomplete, MatError, MatAutocompleteTrigger, MatPrefix, BackButtonDirective, BalanceComponent,
    BackButtonDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AccountComponent {
  private readonly store: Store<AccountState> = inject(Store<AccountState>);
  private readonly formBuilder: NonNullableFormBuilder = inject(NonNullableFormBuilder);
  private readonly authUserService: AuthUserService = inject(AuthUserService);
  private readonly router: Router = inject(Router);
  private readonly translate: TranslateService = inject(TranslateService);

  private customerId$ = this.store.pipe(getCurrentCustomerIdPipe);
  private selectedAccount$ = this.store.pipe(getSelectedAccountPipe);
  private subErrors$ = this.store.pipe(getSubErrorsPipe);
  private response$ = this.store.pipe(getAccountResponsePipe);

  private customerIdSignal = toSignal(this.customerId$);
  private selectedAccountSignal = toSignal(this.selectedAccount$);
  private subErrorsSignal = toSignal(this.subErrors$);
  private responseSignal = toSignal(this.response$);
  private authUserSignal = this.authUserService.authUser;
  private hasAdminRole = computed(() => this.authUserSignal()?.hasAdminRole ?? false);

  form: FormGroup<BalanceForm> = this.formBuilder.group<BalanceForm>({
    currency: this.formBuilder.control(undefined, {
      validators: [Validators.required, requireMatch],
    }),
    gift: this.formBuilder.control(0, {
      validators: [Validators.required],
    }),
  });

  accountSignal = computed(() => {
    const account = this.selectedAccountSignal();
    if (account) {
      this.form.patchValue(account);
    }
    return account;
  });

  filteredCurrencyOptionsSignal: Signal<ICurrency[] | undefined> = toSignal(
    this.getForm.currency.valueChanges.pipe(
      startWith(''),
      map((value: any) => !value || typeof value === 'string' ? value : value.code),
      combineLatestWith(this.selectedAccount$),
      map(([name, account]) => {
        if (name) {
          return this.filterCurrency(name, account);
        } else {
          return account?.currencies ? account.currencies.slice() : account?.currencies;
        }
      }),
    ),
  );
  userId = computed(() => this.authUserSignal()?.customerId);
  errors = signal<Record<string, unknown>>({});
  showAdd = computed(() => this.hasAdminRole() && this.customerIdSignal() !== this.userId());

  language: string = getLocale(this.translate.getCurrentLang()).language;

  constructor() {
    effect(() => {
      const subErrors = this.subErrorsSignal();
      if (subErrors) {
        const errorMap: Record<string, unknown> = {};
        subErrors.forEach((error: IError) => {
          const field = error.field as keyof BalanceForm | undefined;

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
        if (this.hasAdminRole()) {
          this.router.navigate([this.language, 'users', this.customerIdSignal(), 'overview']);
        } else {
          this.router.navigate([this.language, 'me', 'overview']);
        }
      }
    });

    effect(() => {
      const customerId = this.customerIdSignal();
      if (customerId) {
        this.store.dispatch(getAccountByCustomerId({ customerId }));
      }
    });
  }

  get getForm(): BalanceForm {
    return this.form.controls;
  }

  submit(): void {
    const id = this.accountSignal()?.id;
    const customerId = this.customerIdSignal();
    if (this.form.invalid || !id || !customerId) {
      return;
    }
    const transaction: ITransaction = new Transaction();
    transaction.customerId = customerId;
    transaction.currencyId = valueChange(this.getForm.currency.value, this.accountSignal()?.currency)?.id;
    transaction.gift = this.getForm.gift.value;
    this.store.dispatch(updateAccount({ id, transaction, customerId }));
    return;
  }

  displayCurrencyFn = (currency: ICurrencyAll): string => currency ? currency.code : '';

  keyDownHandler = (event: KeyboardEvent): void => {
    if (event.code === 'Backspace') {
      this.getForm.currency.setValue(undefined);
    }
  };

  keyDownNumberHandler = (event: any): void => {
    if (event.code !== 'Backspace' && !event.key.match(/\d+/)) {
      event.preventDefault();
    }
  };

  private filterCurrency = (
    name: string,
    account?: IAccountAll,
  ): ICurrency[] | undefined => account?.currencies?.filter(
    option => option.code?.toLowerCase().indexOf(name.toLowerCase()) === 0,
  );
}
