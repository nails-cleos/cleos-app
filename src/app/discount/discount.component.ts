import { Component, OnDestroy, OnInit } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
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
  form!: FormGroup;
  errors: any = [];

  name: FormControl = new FormControl('', [
    Validators.required
  ]);
  amount: FormControl = new FormControl('', [
    Validators.required, Validators.min(1)
  ]);
  type: FormControl = new FormControl('', [
    Validators.required
  ]);

  currencies?: ICurrencyAll[];
  filteredCurrencyOptions?: Observable<ICurrency[] | undefined>;
  currency: FormControl = new FormControl('', [
    Validators.required, requireMatch
  ]);

  types = DiscountType;

  constructor(private store: Store<AppState>, private formBuilder: FormBuilder, private router: Router) {
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

  keyDownHandler(event: any, form: FormControl): void {
    if (event.code === 'Backspace') {
      form.setValue('');
    }
  }

  private createForm(): void {
    this.form = this.formBuilder.group({
      name: this.name,
      currency: this.currency,
      description: new FormControl(),
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
