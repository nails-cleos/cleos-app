import { ChangeDetectionStrategy, Component, computed, effect, inject, input, signal } from '@angular/core';
import { createTransaction, getAccount } from '../../store/account.actions';
import { FormControl, FormGroup, NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { AuthUserService } from '../../services/auth-user.service';
import { ITransaction } from '../../interfaces/account';
import { currencySymbol } from '../../util/helper';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { BalanceComponent } from '../balance/balance.component';
import { BackButtonDirective } from '../../directives/back-button.directive';
import { BankComponent, BankForm } from '../../shared/bank/bank.component';
import { IError } from '../../interfaces/common';
import { toSignal } from '@angular/core/rxjs-interop';
import {
  getAccountResponsePipe,
  getSelectedAccountPipe,
  getSubErrorsPipe,
} from '../../store/selectors/account.selectors';
import { AccountState } from '../../store/reducers/account.reducers';
import { PaymentState } from '../../store/reducers/payment.reducers';
import { getPaymentOptionsPipe } from '../../store/selectors/payment.selectors';
import { PaymentOptionSelectComponent } from '../../shared/payment-option-select/payment-option-select.component';
import { MatError, MatFormField, MatInput, MatLabel, MatPrefix } from '@angular/material/input';
import { MatIcon } from '@angular/material/icon';
import { MatButton } from '@angular/material/button';

export type TransactionForm = {
  amount: FormControl<number>;
  transfer: FormControl<string | undefined>;
  bankForm: FormGroup<BankForm>;
};

@Component({
  selector: 'app-transaction',
  templateUrl: './transaction.component.html',
  styleUrls: ['./transaction.component.scss'],
  imports: [MatFormField, MatLabel, MatInput, MatIcon, MatButton, ReactiveFormsModule, TranslatePipe, MatError,
    MatPrefix, BankComponent, BackButtonDirective, BalanceComponent, BackButtonDirective, BankComponent,
    PaymentOptionSelectComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TransactionComponent {
  id = input<string>();

  private readonly store: Store<AccountState | PaymentState> = inject(Store<AccountState | PaymentState>);
  private readonly formBuilder: NonNullableFormBuilder = inject(NonNullableFormBuilder);
  private readonly authUserService: AuthUserService = inject(AuthUserService);
  private readonly router: Router = inject(Router);
  private readonly translate: TranslateService = inject(TranslateService);

  private readonly selectedAccount$ = this.store.pipe(getSelectedAccountPipe);
  private readonly subErrors$ = this.store.pipe(getSubErrorsPipe);
  private readonly response$ = this.store.pipe(getAccountResponsePipe);
  private readonly paymentOptions$ = this.store.pipe(getPaymentOptionsPipe);

  private selectedAccountSignal = toSignal(this.selectedAccount$);
  private subErrorsSignal = toSignal(this.subErrors$);
  private responseSignal = toSignal(this.response$);
  private authUserSignal = this.authUserService.authUser;
  private accountId = computed(() => this.id());
  private paymentOptionsSignal = toSignal(this.paymentOptions$, { initialValue: [] });

  errors = signal<Record<string, unknown>>({});
  accountSignal = computed(() => this.selectedAccountSignal());
  types = computed(() => this.paymentOptionsSignal()
    .filter(option => option.enabled)
    .filter(option => ['cash', 'transfer'].includes(option.type.toLowerCase())));
  optionsSignal = computed(() => {
    if (!this.hasAdminRole()) {
      return this.paymentOptionsSignal()
        .filter(option => option.enabled)
        .map(option => ({ ...option, hidePercentage: true }));
    }
    return this.types();
  });
  hasAdminRole = computed(() => this.authUserSignal().hasAdminRole);
  amountMin: number = 100;
  language: string = this.translate.getCurrentLang();

  bankForm = this.formBuilder.group<BankForm>({
    percentage: this.formBuilder.control(undefined),
    option: this.formBuilder.control(undefined, {
      validators: [Validators.required],
    }),
  });

  form: FormGroup<TransactionForm> = this.formBuilder.group<TransactionForm>({
    amount: this.formBuilder.control(0, {
      validators: [Validators.required, Validators.min(this.amountMin)],
    }),
    transfer: this.formBuilder.control(undefined),
    bankForm: this.bankForm,
  });

  constructor() {
    effect(() => {
      const subErrors = this.subErrorsSignal();
      if (subErrors) {
        const errorMap: Record<string, unknown> = {};
        subErrors.forEach((error: IError) => {
          const field = error.field as keyof TransactionForm | undefined;

          if (field && field in this.form.controls) {
            errorMap[field] = error.message;
            this.form.controls[field].setErrors({ incorrect: true });
          }
          const bankField = error.field as keyof BankForm | undefined;

          if (bankField && bankField in this.bankForm.controls) {
            errorMap[bankField] = error.message;
            this.bankForm.controls[bankField].setErrors({ incorrect: true });
          }
        });
        this.errors.set(errorMap);
      }
    });

    effect(() => {
      if (this.responseSignal()) {
        if (this.hasAdminRole()) {
          this.router.navigate([this.language, 'users', this.accountSignal()?.customer?.id, 'overview']);
        } else {
          this.router.navigate([this.language, 'me', 'overview']);
        }
      }
    });

    effect(() => {
      const id = this.accountId();
      if (id) {
        this.store.dispatch(getAccount({ id }));
      }
    });
  }

  get getForm() {
    return this.form.controls;
  }

  get getBankForm() {
    return this.getForm.bankForm.controls;
  }

  get currencyIcon(): string {
    return currencySymbol(this.accountSignal()?.currency);
  }

  submit(): void {
    if (this.form.invalid) {
      return;
    }

    const option = this.getBankForm.option?.value;
    const customerId = this.accountSignal()?.customer?.id;
    const amount = this.getForm.amount.value;
    let type;
    if (option) {
      type = option.type;
    }
    const transfer = this.getForm.transfer.value;
    const transaction: ITransaction = {
      customerId,
      amount,
      paymentRequest: { type, transfer },
    };
    const id = this.id()!;
    this.store.dispatch(createTransaction({ id, transaction }));
    return;
  }
}
