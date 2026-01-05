import { ChangeDetectionStrategy, Component, computed, effect, inject, signal } from '@angular/core';
import { createTransaction, getAccount, paymentOptions } from '../../store/account.actions';
import { FormControl, FormGroup, NonNullableFormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { AuthUserService } from '../../services/auth-user.service';
import { ITransaction } from '../../interfaces/account';
import { getPayNlOptions, PaymentType } from '../../interfaces/payment';
import { currencySymbol } from '../../util/helper';
import { TranslateService } from '@ngx-translate/core';
import { SharedModule } from '../../shared/shared.module';
import { BalanceComponent } from '../balance/balance.component';
import { BackButtonDirective } from '../../directives/back-button.directive';
import { BankComponent, BankForm } from '../../shared/bank/bank.component';
import { IError } from '../../interfaces/common';
import { toSignal } from '@angular/core/rxjs-interop';
import {
  getCurrentAccountIdPipe,
  getAccountResponsePipe,
  getSelectedAccountPipe,
  getSelectPaymentOptionsPipe,
  getSubErrorsPipe,
} from '../../store/selectors/account.selectors';
import { AccountState } from '../../store/reducers/account.reducers';

export type TransactionForm = {
  amount: FormControl<number>;
  transfer: FormControl<string | undefined>;
  bankForm: FormGroup<BankForm>;
};

@Component({
  selector: 'app-transaction',
  templateUrl: './transaction.component.html',
  styleUrls: ['./transaction.component.scss'],
  imports: [SharedModule, BalanceComponent, BackButtonDirective, BankComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TransactionComponent {
  private readonly store: Store<AccountState> = inject(Store<AccountState>);
  private readonly formBuilder: NonNullableFormBuilder = inject(NonNullableFormBuilder);
  private readonly authUserService: AuthUserService = inject(AuthUserService);
  private readonly router: Router = inject(Router);
  private readonly translate: TranslateService = inject(TranslateService);

  private accountId$ = this.store.pipe(getCurrentAccountIdPipe);
  private selectedAccount$ = this.store.pipe(getSelectedAccountPipe);
  private paymentOptions$ = this.store.pipe(getSelectPaymentOptionsPipe);
  private subErrors$ = this.store.pipe(getSubErrorsPipe);
  private response$ = this.store.pipe(getAccountResponsePipe);

  private accountIdSignal = toSignal(this.accountId$, { initialValue: null });
  private selectedAccountSignal = toSignal(this.selectedAccount$);
  private paymentOptionsSignal = toSignal(this.paymentOptions$);
  private subErrorsSignal = toSignal(this.subErrors$);
  private responseSignal = toSignal(this.response$);
  private authUserSignal = this.authUserService.authUser;
  private accountId = computed(() => this.accountIdSignal());

  errors = signal<Record<string, unknown>>({});
  accountSignal = computed(() => this.selectedAccountSignal());
  optionsSignal = computed(() =>
    this.paymentOptionsSignal() ? getPayNlOptions(this.paymentOptionsSignal()!) : undefined);
  hasAdminRole = computed(() => {
    const hasAdmin = this.authUserSignal().hasAdminRole;
    if (!hasAdmin) {
      this.store.dispatch(paymentOptions());
    }
    return hasAdmin;
  });

  types: string[] = [PaymentType.cash, PaymentType.transfer];
  amountMin: number = 100;
  language: string = this.translate.currentLang;

  bankForm = this.formBuilder.group<BankForm>({
    bank: this.formBuilder.control(undefined),
    percentage: this.formBuilder.control(undefined),
    type: this.formBuilder.control(undefined, {
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

  transfer = PaymentType.transfer;

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

    const option = this.getBankForm.type?.value;
    const customerId = this.accountSignal()?.customer?.id;
    const amount = this.getForm.amount.value;
    let type;
    let paymentOptionId;
    let bic;
    if (option) {
      type = option.type;
      paymentOptionId = option.bic;
      if (option.subTypes?.length) {
        bic = this.getBankForm.bank?.value?.bic;
      }
    }
    const transfer = this.getForm.transfer.value;
    const transaction: ITransaction = {
      customerId,
      amount,
      paymentRequest: { type, paymentOptionId, transfer, bic },
    };
    const id = this.accountIdSignal()!;
    this.store.dispatch(createTransaction({ id, transaction }));
    return;
  }
}
