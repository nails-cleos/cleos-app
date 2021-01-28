import { AfterViewInit, Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Store } from '@ngrx/store';
import { AppState, selectProductState } from '../../store/app.states';
import * as fromActionsProduct from '../../store/product.actions';
import { FieldChange } from '../../util/validators';
import { IProduct, Product } from '../../interfaces/product';

@Component({
  selector: 'app-product-detail',
  templateUrl: './product-detail.component.html',
  styleUrls: ['./product-detail.component.scss']
})
export class ProductDetailComponent implements OnInit, AfterViewInit {

  @Input() product: IProduct | undefined;
  form!: FormGroup;
  getState: Observable<any>;
  errors: any = [];

  name: FormControl = new FormControl('', [
    Validators.required
  ]);
  price: FormControl = new FormControl('', [
    Validators.required, Validators.min(1)
  ]);
  durationDate: FormControl = new FormControl('', [
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

  ngAfterViewInit(): void {
    this.getUser();
  }

  createForm(): void {
    this.form = this.formBuilder.group({
      name: this.name,
      description: new FormControl(),
      price: this.price,
      durationDate: this.durationDate
    });
  }

  subscribe(): void {
    this.getState.subscribe(state => {
      if (state.selected) {
        this.product = {
          id: state.selected.id,
          name: state.selected.name,
          description: state.selected.description,
          price: state.selected.price
        } as IProduct;
        const time = state.selected.duration.split(':');
        this.product.durationDate = new Date(new Date().setHours(time[0], time[1]));
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
      }
    });
  }

  getUser(): void {
    if (!this.product) {
      const id = this.route.snapshot.paramMap.get('id');
      this.store.dispatch(
        new fromActionsProduct.ProductFind(id)
      );
    }
  }

  update(): void {
    if (this.form.invalid) {
      return;
    }
    const product: IProduct = new Product();
    product.id = this.product?.id;
    product.name = FieldChange(this.name, this.product?.name);
    product.description = FieldChange(this.form.value.description, this.product?.description);
    product.price = FieldChange(this.price, this.product?.price);

    const durationTime = this.durationDate.value;
    const durationHours = `0${durationTime.getHours()}`.slice(-2);
    const durationMinutes = `0${durationTime.getMinutes()}`.slice(-2);
    product.duration = `${durationHours}:${durationMinutes}`;

    this.store.dispatch(new fromActionsProduct.ProductUpdate(product));
  }
}
