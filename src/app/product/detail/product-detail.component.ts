import { AfterViewInit, Component, ElementRef, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { Observable, Subscription } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { AppState, selectProductState } from '../../store/app.states';
import * as fromActionsProduct from '../../store/product.actions';
import { fieldChange, valueChange } from '../../util/validators';
import { IProduct, IProductGroup, Product, ProductGroup } from '../../interfaces/product';
import { createNewDate, formatDuration, getNow, getTime } from '../../util/dates';
import { DurationTimePipe } from "../../pipes/durationTime.pipe";

@Component({
  selector: 'app-product-detail',
  templateUrl: './product-detail.component.html',
  styleUrls: ['./product-detail.component.scss']
})
export class ProductDetailComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('inputName') inputName?: ElementRef<HTMLInputElement>;
  @Input() group?: IProductGroup;

  form!: UntypedFormGroup;

  name: UntypedFormControl = new UntypedFormControl('', [
    Validators.required
  ]);
  selected = new UntypedFormControl(0);
  products: IProduct[] = [];

  errors: any = [];

  private subscription?: Subscription;
  private getState: Observable<any>;

  constructor(private route: ActivatedRoute, private store: Store<AppState>, private formBuilder: UntypedFormBuilder,
              private router: Router) {
    this.getState = this.store.select(selectProductState);
  }

  get update(): void {
    if (this.form.invalid) {
      return;
    }
    let hasError = false;
    this.products = this.products.map((tab: IProduct) => {
      const errors: any = {};
      if (!tab.name || tab.name.trim().length === 0) {
        errors.name = 'REQUIRED';
        hasError = true;
      }
      if (!tab.time || tab.time.trim().length === 0) {
        errors.time = 'REQUIRED';
        hasError = true;
      }
      return Object.assign({}, tab, { errors });
    });

    if (hasError) {
      return;
    }

    const group: IProductGroup = new ProductGroup();
    group.id = this.group?.id;
    group.name = fieldChange(this.name, this.group?.name);
    group.description = valueChange(this.form.value?.description, this.group?.description);
    group.durabilityMin = valueChange(this.form.value?.durabilityMin, this.group?.durabilityMin);
    group.durabilityMax = valueChange(this.form.value?.durabilityMax, this.group?.durabilityMax);
    group.products = this.products;

    return this.store.dispatch(new fromActionsProduct.ProductUpdate(group));
  }

  get addTab(): void {
    if (this.inputName) {
      const product: IProduct = new Product(this.inputName.nativeElement.value);
      this.inputName.nativeElement.value = '';

      this.products.push(product);
      this.selected.setValue(this.products.length - 1);
    }
    return;
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
    product.time = getTime(date);
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
      description: new UntypedFormControl(),
      durabilityMin: new UntypedFormControl(),
      durabilityMax: new UntypedFormControl()
    });
  }

  private subscribe(): void {
    this.subscription = this.getState.subscribe(state => {
      if (state.selected) {
        this.group = {
          id: state.selected.id,
          name: state.selected.name,
          description: state.selected.description,
          durabilityMin: state.selected.durabilityMin,
          durabilityMax: state.selected.durabilityMax
        } as IProductGroup;
        this.form.patchValue(this.group);

        this.products = [...state.selected.products?.map(
          (p: IProduct) => Object.assign({}, p, { time: formatDuration(p.duration!!), errors: {} }))];
      }
      if (state.subErrors) {
        state.subErrors.forEach((value: any) => {
          this.errors[value.field] = value.message;
          this.form.controls[value.field].setErrors({ incorrect: true });
        });
      }
      else if (state.message) {
        this.router.navigate(['products']);
      }
    });
  }

  private getProduct(): void {
    if (!this.group) {
      const id = this.route.snapshot.paramMap.get('id');
      this.store.dispatch(
        new fromActionsProduct.ProductFind({ id, path: 'edit' })
      );
    }
  }
}
