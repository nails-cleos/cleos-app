import { Component, OnDestroy, OnInit } from '@angular/core';
import * as fromActionsAccount from '../../store/account.actions';
import { FormBuilder, UntypedFormGroup, Validators, ɵTypedOrUntyped } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { AppState, selectAccountState } from '../../store/app.states';
import { AuthUserService } from '../../services/auth-user.service';
import { Observable, Subscription } from 'rxjs';
import { IAccountAll } from '../../interfaces/account';
import { getPayNlOptions, IPaymentOption, PaymentOption, PaymentType } from '../../interfaces/payment';
import { currencySymbol } from '../../util/helper';
import { TranslateService } from '@ngx-translate/core';
import { SharedModule } from '../../shared/shared.module';
import { BalanceComponent } from '../balance/balance.component';
import { BackButtonDirective } from '../../directives/back-button.directive';
import { BankComponent } from '../../shared/bank/bank.component';

@Component({
  selector: 'app-transaction',
  templateUrl: './transaction.component.html',
  styleUrls: ['./transaction.component.scss'],
  imports: [SharedModule, BalanceComponent, BackButtonDirective, BankComponent]
})
export class TransactionComponent implements OnInit, OnDestroy {
  form!: UntypedFormGroup;
  hasAdminRole: boolean;
  account?: IAccountAll;

  types: string[] = [PaymentType.cash, PaymentType.transfer];
  options?: IPaymentOption[];
  amountMin: number;
  language: string;

  errors: any = [];

  private subscription?: Subscription;
  private authUserServiceSubscription: Subscription;
  private getState: Observable<any>;
  private accountId?: string;

  constructor(private route: ActivatedRoute, private store: Store<AppState>, private formBuilder: FormBuilder,
              private authUserService: AuthUserService, private router: Router, private translate: TranslateService) {
    this.getState = this.store.select(selectAccountState);
    this.hasAdminRole = false;
    this.amountMin = 100;
    this.language = this.translate.currentLang;
    this.authUserServiceSubscription = this.authUserService.authUser.subscribe(value => {
      this.hasAdminRole = value.hasAdminRole;
      if (!value.hasAdminRole) {
        // TODO if payment option change this must to be changed
        this.getOptions();
      }
    });
  }

  get getForm(): ɵTypedOrUntyped<any, any, any> {
    return this.form.controls;
  }

  get currencyIcon(): string {
    return currencySymbol(this.account?.currency);
  }

  get submit(): void {
    if (this.form.invalid) {
      return;
    }

    const option = this.getForm.type?.value;
    const customerId = this.account?.customer?.id;
    const amount = this.getForm.amount.value;
    let type;
    let paymentOptionId;
    let bic;
    if (option instanceof PaymentOption) {
      type = option.type;
      paymentOptionId = option.bic;
      if (option.subTypes.length) {
        bic = this.getForm.bank?.value?.bic;
      }
    } else {
      type = option;
    }
    const transfer = this.getForm.transfer.value;
    const payload = {
      customerId,
      amount,
      paymentRequest: { type, paymentOptionId, transfer, bic }
    };
    return this.store.dispatch(
      new fromActionsAccount.AccountSave({
        transaction: payload, accountId: this.accountId, hasAdminRole: this.hasAdminRole
      })
    );
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    this.createForm();
    this.subscribe();
    if (id) {
      this.accountId = id;
      this.getAccount();
    }
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
    this.authUserServiceSubscription.unsubscribe();
  }

  private createForm = (): void => {
    this.form = this.formBuilder.group({
      amount: ['', [Validators.required, Validators.min(this.amountMin)]],
      type: ['', Validators.required],
      transfer: [''],
      bank: ['']
    });
  }

  private getAccount = (): void => {
    if (!this.account) {
      this.store.dispatch(
        new fromActionsAccount.AccountFind(this.accountId)
      );
    }
  }

  private getOptions = (): void => this.store.dispatch(new fromActionsAccount.PaymentOptions());

  private subscribe = (): void => {
    this.subscription = this.getState.subscribe(state => {
      if (state.selected) {
        this.account = state.selected;
      }
      if (state.paymentOptions) {
        this.options = getPayNlOptions(state.paymentOptions);
      }
      if (state.subErrors) {
        state.subErrors.forEach((value: any) => {
          this.errors[value.field] = value.message;
          this.form.controls[value.field].setErrors({ incorrect: true });
        });
      } else if (state.message) {
        if (this.hasAdminRole) {
          this.router.navigate([this.language, 'users', this.account?.customer?.id, 'overview']);
        } else {
          this.router.navigate([this.language, 'me', 'overview']);
        }
      }
    });
  }
}
