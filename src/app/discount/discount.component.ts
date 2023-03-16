import { Component, OnDestroy, OnInit } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { Store } from '@ngrx/store';
import { AppState, selectDiscountState } from '../store/app.states';
import { Discount, DiscountType, IDiscount } from '../interfaces/discount';
import * as fromActionsDiscount from '../store/discount.actions';
import { Router } from '@angular/router';
import { ICurrency, ICurrencyAll } from '../interfaces/currency';
import { requireMatch } from '../util/validators';
import { map, startWith } from 'rxjs/operators';

@Component({
  selector: 'app-discount',
  templateUrl: './discount.component.html',
  styleUrls: ['./discount.component.scss']
})
export class DiscountComponent implements OnInit, OnDestroy {
  getState: Observable<any>;
  subscription?: Subscription;
  form!: UntypedFormGroup;
  errors: any = [];

  name: UntypedFormControl = new UntypedFormControl('', [
    Validators.required
  ]);
  amount: UntypedFormControl = new UntypedFormControl('', [
    Validators.required, Validators.min(1)
  ]);
  type: UntypedFormControl = new UntypedFormControl('', [
    Validators.required
  ]);

  currencies?: ICurrencyAll[];
  filteredCurrencyOptions?: Observable<ICurrency[] | undefined>;
  currency: UntypedFormControl = new UntypedFormControl('', [
    Validators.required, requireMatch
  ]);

  types = DiscountType;

  constructor(private store: Store<AppState>, private formBuilder: UntypedFormBuilder, private router: Router) {
    this.getState = this.store.select(selectDiscountState);
  }

  get create(): void {
    if (this.form.invalid) {
      return;
    }

    const discount: IDiscount = new Discount();
    discount.name = this.name.value;
    discount.description = this.form.value.description;
    discount.amount = this.amount.value;
    discount.type = this.type.value;
    discount.currencyId = this.currency.value.id;

    return this.store.dispatch(
      new fromActionsDiscount.DiscountSave(discount)
    );
  }

  get addCurrency(): void {
    this.router.navigate(['currency', 'add']);
    return;
  }

  ngOnInit(): void {
    this.createForm();
    this.clean();
    this.subscribe();
    this.getCurrencies();
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }

  displayCurrencyFn(currency: ICurrencyAll): string {
    return currency ? currency.code : '';
  }

  keyDownHandler(event: any, form: UntypedFormControl): void {
    if (event.code === 'Backspace') {
      form.setValue('');
    }
  }

  private createForm(): void {
    this.form = this.formBuilder.group({
      name: this.name,
      currency: this.currency,
      description: new UntypedFormControl(),
      amount: this.amount,
      type: this.type
    });
    this.filteredCurrencyOptions = this.currency.valueChanges.pipe(
      startWith(''),
      map(value => typeof value === 'string' ? value : value.code),
      map(name => name ? this.filterCurrency(name) : this.currencies ? this.currencies.slice() : this.currencies)
    );
  }

  private clean(): void {
    this.store.dispatch(
      new fromActionsDiscount.Clean()
    );
  }

  private subscribe(): void {
    this.subscription = this.getState.subscribe(state => {
      this.currencies = state.currencies;
      if (state.subErrors) {
        state.subErrors.forEach((value: any) => {
          this.errors[value.field] = value.message;
          this.form.controls[value.field].setErrors({incorrect: true});
        });
      } else if (state.message) {
        this.router.navigate(['discounts']);
      }
    });
  }

  private getCurrencies(): void {
    this.store.dispatch(
      new fromActionsDiscount.GetCurrencies()
    );
  }

  private filterCurrency(name: string): ICurrency[] | undefined {
    const filterValue = name.toLowerCase();

    return this.currencies?.filter(option => option.code?.toLowerCase().indexOf(filterValue) === 0);
  }
}
