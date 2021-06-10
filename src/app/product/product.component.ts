import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import * as fromActionsProduct from '../store/product.actions';
import { AppState, selectProductState } from '../store/app.states';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Store } from '@ngrx/store';
import { Observable, Subscription } from 'rxjs';
import { IProduct, Product } from '../interfaces/product';
import { timeTheme } from '../util/theme';
import { createDate, getTime } from '../util/dates';

@Component({
  selector: 'app-product',
  templateUrl: './product.component.html',
  styleUrls: ['./product.component.scss']
})
export class ProductComponent implements OnInit, OnDestroy {
  getState: Observable<any>;
  subscription: Subscription | undefined;
  form!: FormGroup;
  errors: any = [];
  theme = timeTheme();

  name: FormControl = new FormControl('', [
    Validators.required
  ]);
  price: FormControl = new FormControl('', [
    Validators.required, Validators.min(1)
  ]);
  duration: FormControl;

  constructor(private snackBar: MatSnackBar, private store: Store<AppState>, private formBuilder: FormBuilder) {
    this.getState = this.store.select(selectProductState);
    const d = getTime(createDate());

    this.duration = new FormControl(d, [
      Validators.required
    ]);
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

    const product: IProduct = new Product();
    product.name = this.name.value;
    product.description = this.form.value.description;
    product.price = this.price.value;
    product.duration = this.duration.value;
    product.durability = this.form.value.durability;

    this.store.dispatch(
      new fromActionsProduct.ProductSave(product)
    );
  }

  private createForm(): void {
    this.form = this.formBuilder.group({
      name: this.name,
      description: new FormControl(),
      durability: new FormControl(),
      price: this.price,
      duration: this.duration
    });
  }

  private clean(): void {
    this.store.dispatch(
      new fromActionsProduct.Clean()
    );
  }

  private subscribe(): void {
    this.subscription = this.getState.subscribe(state => {
      if (state.subErrors) {
        state.subErrors.forEach((value: any) => {
          this.errors[value.field] = value.message;
          this.form.controls[value.field].setErrors({incorrect: true});
        });
      } else if (state.errorMessage) {
        this.snackBar.open(state.errorMessage, 'OK', {
          duration: 5000
        });
      }
    });
  }
}
