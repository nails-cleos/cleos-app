import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import * as fromActionsProduct from '../store/product.actions';
import { AppState, selectProductState } from '../store/app.states';
import { Store } from '@ngrx/store';
import { Observable, Subscription } from 'rxjs';
import { IProduct, IProductGroup, Product, ProductGroup } from '../interfaces/product';
import { API_LOCALE, createNewDate, getNow, getTime } from '../util/dates';
import { Router } from '@angular/router';

@Component({
  selector: 'app-product',
  templateUrl: './product.component.html',
  styleUrls: ['./product.component.scss']
})
export class ProductComponent implements OnInit, OnDestroy {
  @ViewChild('inputName') inputName: ElementRef<HTMLInputElement> | undefined;

  form!: FormGroup;
  name: FormControl = new FormControl('', [
    Validators.required
  ]);
  selected = new FormControl(0);
  products: IProduct[] = [];

  errors: any = [];

  private getState: Observable<any>;
  private subscription: Subscription | undefined;

  constructor(private store: Store<AppState>, private formBuilder: FormBuilder, private router: Router) {
    this.getState = this.store.select(selectProductState);
  }

  get create(): void {
    let hasError = false;
    if (!this.products.length) {
      hasError = true;
      this.errors.products = 'REQUIRED';
    }
    this.products = this.products.map((tab: IProduct) => {
      const errors: any = {};
      if (!tab.name || tab.name.trim().length === 0) {
        errors.name = 'REQUIRED';
        hasError = true;
      }
      if (!tab.duration || tab.duration.trim().length === 0) {
        errors.duration = 'REQUIRED';
        hasError = true;
      }
      return Object.assign({}, tab, {errors});
    });

    if (hasError || this.form.invalid) {
      return;
    }

    const group: IProductGroup = new ProductGroup();
    group.name = this.name.value;
    group.description = this.form.value.description;
    group.durabilityMin = this.form.value.durabilityMin;
    group.durabilityMax = this.form.value.durabilityMax;
    group.products = this.products;

    return this.store.dispatch(
      new fromActionsProduct.ProductSave(group)
    );
  }

  get addTab(): void {
    if (this.inputName) {
      const product: IProduct = new Product(this.inputName.nativeElement.value, !this.products.length);
      this.inputName.nativeElement.value = '';

      this.products.push(product);
      this.selected.setValue(this.products.length - 1);
    }
    return;
  }

  ngOnInit(): void {
    this.createForm();
    this.clean();
    this.subscribe();
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }

  removeTab(index: number): void {
    this.products.splice(index, 1);
  }

  setValue(product: IProduct, attribute: string, $event: any): void {
    // @ts-ignore
    product[attribute] = $event.target.value;
  }

  setTime(product: IProduct, $event: any): void {
    const time = $event.split(':');
    const date = createNewDate(getNow(), time[0], time[1]);
    product.duration = getTime(date, API_LOCALE);
  }

  setPrimary(tab: IProduct): void {
    this.products = this.products.map(t => {
      t.primary = false;
      return t;
    });

    tab.primary = true;
  }

  private createForm(): void {
    this.form = this.formBuilder.group({
      name: this.name,
      description: new FormControl(),
      durabilityMin: new FormControl(),
      durabilityMax: new FormControl()
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
      } else if (state.message) {
        this.router.navigate(['products']);
      }
    });
  }
}
