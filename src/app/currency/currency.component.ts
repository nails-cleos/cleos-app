import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Observable, Subscription } from 'rxjs';
import { Store } from '@ngrx/store';
import { AppState, selectCurrencyState } from '../store/app.states';
import { Router } from '@angular/router';
import { Currency, ICurrency } from '../interfaces/currency';
import * as fromActionsCurrency from '../store/currency.actions';

@Component({
  selector: 'app-currency',
  templateUrl: './currency.component.html',
  styleUrls: ['./currency.component.scss']
})
export class CurrencyComponent implements OnInit, OnDestroy {
  form!: FormGroup;

  code: FormControl = new FormControl('', [
    Validators.required
  ]);
  name: FormControl = new FormControl('');
  icon: FormControl = new FormControl('');

  errors: any = [];
  icons = ['attach_money', 'euro', 'currency_pound'];

  private getState: Observable<any>;
  private subscription: Subscription | undefined;

  constructor(private store: Store<AppState>, private formBuilder: FormBuilder, private router: Router) {
    this.getState = this.store.select(selectCurrencyState);
  }

  ngOnInit(): void {
    this.createForm();
    this.clean();
    this.subscribe();
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }

  create(): void {
    if (this.form.invalid) {
      return;
    }

    const currency: ICurrency = new Currency();
    currency.name = this.name.value;
    currency.code = this.code.value;
    currency.icon = this.icon.value;

    this.store.dispatch(
      new fromActionsCurrency.CurrencySave(currency)
    );
  }

  private createForm(): void {
    this.form = this.formBuilder.group({
      name: this.name,
      code: this.code,
      icon: this.icon
    });
  }

  private clean(): void {
    this.store.dispatch(
      new fromActionsCurrency.Clean()
    );
  }

  private subscribe(): void {
    this.subscription = this.getState.subscribe(state => {
      if (state.subErrors) {
        state.subErrors.forEach((value: any) => {
          this.errors[value.field] = value.message;
          this.form.controls[value.field].setErrors({incorrect: true});
        });
      } else if (state.message) {
        this.router.navigate(['currency']);
      }
    });
  }
}
