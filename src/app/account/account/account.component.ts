import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AppState, selectAccountState } from '../../store/app.states';
import { Store } from '@ngrx/store';
import { Observable, Subscription } from 'rxjs';
import * as fromActionsAccount from '../../store/account.actions';
import { IAccountAll, ITransaction, Transaction } from '../../interfaces/account';
import { ICurrency, ICurrencyAll } from '../../interfaces/currency';
import { map, startWith } from 'rxjs/operators';
import { FormBuilder, UntypedFormGroup, Validators, ɵTypedOrUntyped } from '@angular/forms';
import { requireMatch, valueChange } from '../../util/validators';
import { AuthUserService } from '../../services/auth-user.service';

@Component({
  selector: 'app-account',
  templateUrl: './account.component.html',
  styleUrls: ['./account.component.scss']
})
export class AccountComponent implements OnInit, OnDestroy {
  form!: UntypedFormGroup;

  account?: IAccountAll;
  filteredCurrencyOptions?: Observable<ICurrency[] | undefined>;

  errors: any = [];
  showAdd: boolean;

  private getState: Observable<any>;
  private subscription?: Subscription;
  private authUserServiceSubscription: Subscription;
  private customerId?: string;
  private hasAdminRole: boolean;
  private userId?: string;

  constructor(private route: ActivatedRoute, private store: Store<AppState>, private formBuilder: FormBuilder,
              private authUserService: AuthUserService, private router: Router) {
    this.showAdd = false;
    this.hasAdminRole = false;
    this.getState = this.store.select(selectAccountState);
    this.authUserServiceSubscription = this.authUserService.authUser.subscribe(value => {
      this.hasAdminRole = value.hasAdminRole;
      this.userId = value.customerId;
    });
  }

  get getForm(): ɵTypedOrUntyped<any, any, any> {
    return this.form.controls;
  }

  get submit(): void {
    if (this.form.invalid) {
      return;
    }

    const transaction: ITransaction = new Transaction();
    transaction.accountId = this.account?.id;
    transaction.customerId = this.customerId;
    transaction.currencyId = valueChange(this.getForm.currency.value, this.account?.currency)?.id;
    transaction.gift = this.getForm.gift.value;
    return this.store.dispatch(
      new fromActionsAccount.AccountUpdate(transaction)
    );
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('customerId');
    this.createForm();
    if (id) {
      this.customerId = id;
      this.showAdd = this.hasAdminRole && this.customerId !== this.userId;
      this.getAccount();
    }
    this.subscribe();
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
    this.authUserServiceSubscription.unsubscribe();
  }

  displayCurrencyFn(currency: ICurrencyAll): string {
    return currency ? currency.code : '';
  }

  keyDownHandler(event: any): void {
    if (event.code === 'Backspace') {
      this.getForm.currency.setValue('');
    }
  }

  keyDownNumberHandler(event: any): void {
    if (event.code !== 'Backspace' && !event.key.match(/\d+/)) {
      event.preventDefault();
    }
  }

  private getAccount(): void {
    this.store.dispatch(
      new fromActionsAccount.AccountFindByCustomer(this.customerId)
    );
  }

  private createForm(): void {
    this.form = this.formBuilder.group({
      currency: ['', [Validators.required, requireMatch]],
      gift: ['', Validators.required]
    });
    this.filteredCurrencyOptions = this.getForm.currency.valueChanges?.pipe(
      startWith(''),
      map((value: any) => typeof value === 'string' ? value : value.code),
      map((name: string) => name ? this.filterCurrency(name) :
        this.account?.currencies ? this.account?.currencies.slice() : this.account?.currencies)
    );
  }

  private filterCurrency(name: string): ICurrency[] | undefined {
    const filterValue = name.toLowerCase();

    return this.account?.currencies?.filter(option => option.code?.toLowerCase().indexOf(filterValue) === 0);
  }

  private subscribe(): void {
    this.subscription = this.getState.subscribe(state => {
      if (state.selected && !this.account) {
        this.account = state.selected;
        this.form.patchValue(state.selected);
      }
      if (state.subErrors) {
        state.subErrors.forEach((value: any) => {
          this.errors[value.field] = value.message;
          this.form.controls[value.field].setErrors({ incorrect: true });
        });
      } else if (state.message) {
        if (this.hasAdminRole) {
          this.router.navigate(['users', this.customerId, 'overview']);
        } else {
          this.router.navigate(['me', 'overview']);
        }
      }
    });
  }
}
