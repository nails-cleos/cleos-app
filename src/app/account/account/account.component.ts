import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  input,
  signal,
  Signal,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { combineLatestWith } from 'rxjs';
import { BalanceForm, IAccountAll, Transaction } from '../account';
import { ICurrency, ICurrencyAll } from '@app/currency/currency';
import { map, startWith } from 'rxjs/operators';
import {
  FormGroup,
  NonNullableFormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { requireMatch } from '@app/util/validators';
import { AuthUserService } from '@app/services/auth-user.service';
import { getLocale } from '@app/util/helper';
import { TranslatePipe } from '@ngx-translate/core';
import { BalanceComponent } from '../balance/balance.component';
import { BackButtonDirective } from '@app/directives/back-button.directive';
import { IError } from '@app/interfaces/common';
import { AccountStore } from '@app/store/account.store';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import {
  MatError,
  MatFormField,
  MatInput,
  MatLabel,
  MatPrefix,
} from '@angular/material/input';
import {
  MatAutocomplete,
  MatAutocompleteTrigger,
} from '@angular/material/autocomplete';
import { MatIcon } from '@angular/material/icon';
import { MatButton } from '@angular/material/button';
import { MatOption } from '@angular/material/core';
import { SkeletonComponent } from '@app/shared/skeleton/skeleton.component';
import { NavigationService } from '@app/services/navigation.service';

@Component({
  selector: 'app-account',
  templateUrl: './account.component.html',
  styleUrls: ['./account.component.scss'],
  imports: [
    MatFormField,
    MatLabel,
    MatInput,
    MatOption,
    MatIcon,
    MatButton,
    ReactiveFormsModule,
    TranslatePipe,
    RouterLink,
    MatAutocomplete,
    MatError,
    MatAutocompleteTrigger,
    MatPrefix,
    BalanceComponent,
    BackButtonDirective,
    SkeletonComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AccountComponent {
  customerId = input<string>();

  private readonly accountStore = inject(AccountStore);
  private readonly formBuilder: NonNullableFormBuilder = inject(
    NonNullableFormBuilder,
  );
  private readonly authUserService: AuthUserService = inject(AuthUserService);
  private readonly navigationService: NavigationService =
    inject(NavigationService);

  private authUserSignal = this.authUserService.authUser;
  private hasAdminRole = computed(
    () => this.authUserSignal()?.hasAdminRole ?? false,
  );

  form: FormGroup<BalanceForm> = this.formBuilder.group<BalanceForm>({
    currency: this.formBuilder.control(undefined, {
      validators: [Validators.required, requireMatch],
    }),
    gift: this.formBuilder.control(0, {
      validators: [Validators.required],
    }),
  });

  accountSignal = computed(() => {
    const account = this.accountStore.selected();
    if (account) {
      this.form.patchValue(account);
    }
    return account;
  });

  filteredCurrencyOptionsSignal: Signal<ICurrency[] | undefined> = toSignal(
    this.getForm.currency.valueChanges.pipe(
      startWith(''),
      map((value: any) =>
        !value || typeof value === 'string' ? value : value.code,
      ),
      combineLatestWith(toObservable(this.accountStore.selected)),
      map(([name, account]) => {
        if (name) {
          return this.filterCurrency(name, account);
        } else {
          return account?.currencies
            ? account.currencies.slice()
            : account?.currencies;
        }
      }),
    ),
  );
  userId = computed(() => this.authUserSignal()?.customerId);
  errors = signal<Record<string, unknown>>({});
  showAdd = computed(
    () => this.hasAdminRole() && this.customerId() !== this.userId(),
  );
  isLoading = computed(() => this.accountStore.isLoading());

  language: string = getLocale(this.navigationService.language).language;

  constructor() {
    effect(() => {
      const subErrors = this.accountStore.subErrors();
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
      if (this.accountStore.response()) {
        if (this.hasAdminRole()) {
          this.navigationService.navigate([
            'users',
            this.customerId(),
            'overview',
          ]);
        } else {
          this.navigationService.navigate(['me', 'overview']);
        }
      }
    });

    effect(() => {
      const customerId = this.customerId();
      if (customerId) {
        this.accountStore.clean();
        this.accountStore.loadAccountByCustomerId(customerId);
      }
    });
  }

  get getForm(): BalanceForm {
    return this.form.controls;
  }

  get navigation(): string[] {
    const account = this.accountSignal();
    if (account && this.userId() !== account.customer.id) {
      return ['/', this.language, 'users', account.customer.id, 'overview'];
    }
    return ['/', this.language, 'me', 'overview'];
  }

  submit(): void {
    const id = this.accountSignal()?.id;
    const customerId = this.customerId();
    if (this.form.invalid || !id || !customerId) {
      return;
    }
    this.accountStore.updateAccount(
      id,
      Transaction.fromForm(this.getForm, customerId, this.accountSignal()),
    );
  }

  displayCurrencyFn = (currency: ICurrencyAll): string =>
    currency ? currency.code : '';

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
  ): ICurrency[] | undefined =>
    account?.currencies?.filter(
      (option) => option.code?.toLowerCase().indexOf(name.toLowerCase()) === 0,
    );
}
