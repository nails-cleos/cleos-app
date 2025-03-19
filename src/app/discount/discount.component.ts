import { ChangeDetectorRef, Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import {
  AbstractControl,
  UntypedFormBuilder,
  UntypedFormControl,
  UntypedFormGroup,
  Validators,
  ɵTypedOrUntyped
} from '@angular/forms';
import { Store } from '@ngrx/store';
import { AppState, selectDiscountState } from '../store/app.states';
import { Discount, DiscountType, IDiscount, IDiscountAll } from '../interfaces/discount';
import * as fromActionsDiscount from '../store/discount.actions';
import { ActivatedRoute, Router } from '@angular/router';
import { ICurrency, ICurrencyAll } from '../interfaces/currency';
import { fieldChange, valueChange } from '../util/validators';
import { map, startWith } from 'rxjs/operators';
import { TranslateService } from '@ngx-translate/core';
import { SharedModule } from "../shared/shared.module";
import { BackButtonDirective } from "../directives/back-button.directive";

@Component({
  selector: 'app-discount',
  templateUrl: './discount.component.html',
  styleUrls: ['./discount.component.scss'],
  standalone: true,
  imports: [SharedModule, BackButtonDirective],
})
export class DiscountComponent implements OnInit, OnDestroy {
  @Input() discount?: IDiscountAll;

  id?: string;
  isAddMode: boolean;
  form!: UntypedFormGroup;
  errors: any = [];

  currencies?: ICurrencyAll[];
  filteredCurrencyOptions?: Observable<ICurrency[] | undefined>;

  types = DiscountType;
  private getState: Observable<any>;
  private subscription?: Subscription;
  private readonly language: string;

  constructor(private readonly translate: TranslateService, private store: Store<AppState>,
              private formBuilder: UntypedFormBuilder,
              private router: Router, private route: ActivatedRoute, private cdRef: ChangeDetectorRef) {
    this.isAddMode = true;
    this.getState = this.store.select(selectDiscountState);
    this.language = this.translate.currentLang;
  }

  get getForm(): ɵTypedOrUntyped<any, any, { [p: string]: AbstractControl<any> }> {
    return this.form.controls;
  }

  get submit(): void {
    if (this.form.invalid) {
      return;
    }

    const discount: IDiscount = new Discount();
    discount.name = fieldChange(this.getForm.name as UntypedFormControl, this.discount?.name);
    discount.description = valueChange(this.getForm.description.value, this.discount?.description);
    discount.type = fieldChange(this.getForm.type as UntypedFormControl, this.discount?.type);
    discount.amount = fieldChange(this.getForm.amount as UntypedFormControl, this.discount?.amount);

    if (this.isAddMode) {
      discount.currencyId = this.getForm.currency.value.id;
      return this.store.dispatch(new fromActionsDiscount.DiscountSave(discount));
    } else {
      discount.id = this.id;
      this.discount = undefined;
      return this.store.dispatch(new fromActionsDiscount.DiscountUpdate(discount));
    }
  }

  get addCurrency(): void {
    this.router.navigate([this.language, 'currency', 'add']);
    return;
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.id = id;
    }
    this.createForm();
    this.clean();
    this.subscribe();
    this.isAddMode = !this.id;
    if (!this.isAddMode) {
      this.getDiscount();
    } else {
      this.getCurrencies();
    }
    this.cdRef.detectChanges();
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }

  displayCurrencyFn = (currency: ICurrencyAll): string => currency ? currency.code : ''

  keyDownHandler = (event: any, form: AbstractControl): void => {
    if (event.code === 'Backspace') {
      form.setValue('');
    }
  }

  private createForm = (): void => {
    this.form = this.formBuilder.group({
      name: ['', [Validators.required]],
      currency: ['', [Validators.required]],
      description: [''],
      amount: ['', [Validators.required, Validators.min(1)]],
      type: ['', [Validators.required]]
    });
    this.filteredCurrencyOptions = this.getForm.currency.valueChanges.pipe(
      startWith(''),
      map(value => typeof value === 'string' ? value : value.code),
      map(name => name ? this.filterCurrency(name) : this.currencies ? this.currencies.slice() : this.currencies)
    );
  }

  private filterCurrency = (name: string): ICurrency[] | undefined => this.currencies?.filter(
    option => option.code?.toLowerCase().indexOf(name.toLowerCase()) === 0)

  private clean = (): void => this.store.dispatch(new fromActionsDiscount.Clean());

  private getDiscount = (): void => {
    if (!this.discount) {
      const id = this.route.snapshot.paramMap.get('id');
      this.store.dispatch(
        new fromActionsDiscount.DiscountFind(id)
      );
    }
  }

  private getCurrencies = (): void => this.store.dispatch(new fromActionsDiscount.GetCurrencies());

  private subscribe = (): void => {
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
        this.getForm.type.setValue(state.selected.type);
      }
      this.currencies = state.currencies;
      if (state.subErrors) {
        state.subErrors.forEach((value: any) => {
          this.errors[value.field] = value.message;
          this.form.controls[value.field].setErrors({ incorrect: true });
        });
      } else if (state.message) {
        this.router.navigate([this.language, 'discounts']);
      }
    });
  }
}
