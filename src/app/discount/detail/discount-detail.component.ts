import { AfterViewInit, Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Discount, DiscountType, IDiscount, IDiscountAll } from '../../interfaces/discount';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Observable, Subscription } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { AppState, selectDiscountState } from '../../store/app.states';
import { fieldChange, valueChange } from '../../util/validators';
import * as fromActionsDiscount from '../../store/discount.actions';

@Component({
  selector: 'app-discount-detail',
  templateUrl: './discount-detail.component.html',
  styleUrls: ['./discount-detail.component.scss']
})
export class DiscountDetailComponent implements OnInit, AfterViewInit, OnDestroy {
  @Input() discount?: IDiscountAll;

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

  private subscription?: Subscription;
  private getState: Observable<any>;

  constructor(private route: ActivatedRoute, private store: Store<AppState>, private formBuilder: FormBuilder,
              private router: Router) {
    this.getState = this.store.select(selectDiscountState);
  }

  ngOnInit(): void {
    this.createForm();
    this.subscribe();
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }

  ngAfterViewInit(): void {
    this.getDiscount();
  }

  update(): void {
    if (this.form.invalid) {
      return;
    }
    const discount: IDiscount = new Discount();
    discount.id = this.discount?.id;
    discount.name = fieldChange(this.name, this.discount?.name);
    discount.description = valueChange(this.form.value?.description, this.discount?.description);
    discount.type = fieldChange(this.type, this.discount?.type);
    discount.amount = fieldChange(this.amount, this.discount?.amount);

    this.store.dispatch(new fromActionsDiscount.DiscountUpdate(discount));
  }

  private createForm(): void {
    this.form = this.formBuilder.group({
      name: this.name,
      description: new FormControl(),
      amount: this.amount,
      type: this.type
    });
  }

  private subscribe(): void {
    this.subscription = this.getState.subscribe(state => {
      if (state.selected) {
        this.discount = {
          id: state.selected.id,
          name: state.selected.name,
          description: state.selected.description,
          amount: state.selected.amount,
          type: state.selected.type,
          currency: state.selected.currency
        } as IDiscountAll;

        this.form.patchValue(this.discount);
      }
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

  private getDiscount(): void {
    if (!this.discount) {
      const id = this.route.snapshot.paramMap.get('id');
      this.store.dispatch(
        new fromActionsDiscount.DiscountFind(id)
      );
    }
  }
}
