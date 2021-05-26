import { AfterViewInit, Component, Input, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Observable, Subscription } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Store } from '@ngrx/store';
import { AppState, selectProductState } from '../../store/app.states';
import * as fromActionsProduct from '../../store/product.actions';
import { fieldChange } from '../../util/validators';
import { IProduct, Product } from '../../interfaces/product';
import { timeTheme } from '../../util/theme';
import { convertDuration, getTime } from '../../util/dates';

@Component({
  selector: 'app-product-detail',
  templateUrl: './product-detail.component.html',
  styleUrls: ['./product-detail.component.scss']
})
export class ProductDetailComponent implements OnInit, AfterViewInit, OnDestroy {

  @Input() product: IProduct | undefined;
  form!: FormGroup;
  subscription: Subscription | undefined;
  getState: Observable<any>;
  errors: any = [];
  error: any;
  theme = timeTheme();

  name: FormControl = new FormControl('', [
    Validators.required
  ]);
  price: FormControl = new FormControl('', [
    Validators.required, Validators.min(1)
  ]);
  duration: FormControl = new FormControl('', [
    Validators.required
  ]);

  constructor(private route: ActivatedRoute, private snackBar: MatSnackBar, private store: Store<AppState>,
              private formBuilder: FormBuilder) {
    this.getState = this.store.select(selectProductState);
  }

  ngOnInit(): void {
    this.createForm();
    this.subscribe();
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }

  ngAfterViewInit(): void {
    this.getProduct();
  }

  update(): void {
    if (this.form.invalid) {
      return;
    }
    const product: IProduct = new Product();
    product.id = this.product?.id;
    product.name = fieldChange(this.name, this.product?.name);
    product.description = fieldChange(this.form.value?.description, this.product?.description);
    product.price = fieldChange(this.price, this.product?.price);
    product.duration = fieldChange(this.duration, this.product?.duration);

    this.store.dispatch(new fromActionsProduct.ProductUpdate(product));
  }

  private createForm(): void {
    this.form = this.formBuilder.group({
      name: this.name,
      description: new FormControl(),
      price: this.price,
      duration: this.duration
    });
  }

  private subscribe(): void {
    this.subscription = this.getState.subscribe(state => {
      if (state.selected) {
        this.product = {
          id: state.selected.id,
          name: state.selected.name,
          description: state.selected.description,
          price: state.selected.price
        } as IProduct;

        const duration = convertDuration(state.selected.duration);
        this.product.duration = getTime(new Date(new Date().setHours(duration.hour, duration.minute)));
        this.form.patchValue(this.product);
      }
      if (state.subErrors) {
        state.subErrors.forEach((value: any) => {
          this.errors[value.field] = value.message;
          this.form.controls[value.field].setErrors({incorrect: true});
        });
      } else if (state.errorMessage) {
        this.snackBar.open(state.errorMessage, 'OK', {
          duration: 5000
        });
        this.error = state.error;
      }
    });
  }

  private getProduct(): void {
    if (!this.product) {
      const id = this.route.snapshot.paramMap.get('id');
      this.store.dispatch(
        new fromActionsProduct.ProductFind(id)
      );
    }
  }
}
