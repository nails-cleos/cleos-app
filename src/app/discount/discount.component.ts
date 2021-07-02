import { Component, OnDestroy, OnInit } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Store } from '@ngrx/store';
import { AppState, selectDiscountState } from '../store/app.states';
import { Discount, DiscountType, IDiscount } from '../interfaces/discount';
import * as fromActionsDiscount from '../store/discount.actions';
import { Router } from '@angular/router';

@Component({
  selector: 'app-discount',
  templateUrl: './discount.component.html',
  styleUrls: ['./discount.component.scss']
})
export class DiscountComponent implements OnInit, OnDestroy {
  getState: Observable<any>;
  subscription: Subscription | undefined;
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

  types = DiscountType;

  constructor(private store: Store<AppState>, private formBuilder: FormBuilder, private router: Router) {
    this.getState = this.store.select(selectDiscountState);
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

    const discount: IDiscount = new Discount();
    discount.name = this.name.value;
    discount.description = this.form.value.description;
    discount.amount = this.amount.value;
    discount.type = this.type.value;

    this.store.dispatch(
      new fromActionsDiscount.DiscountSave(discount)
    );
  }

  private createForm(): void {
    this.form = this.formBuilder.group({
      name: this.name,
      description: new FormControl(),
      amount: this.amount,
      type: this.type
    });
  }

  private clean(): void {
    this.store.dispatch(
      new fromActionsDiscount.Clean()
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
        this.router.navigate(['discounts']);
      }
    });
  }
}
