import { Component, OnDestroy, OnInit } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { Store } from '@ngrx/store';
import { AppState, selectReservationState } from '../../../store/app.states';
import { ActivatedRoute, Router } from '@angular/router';
import * as fromActionsReservation from '../../../store/reservation.actions';
import { IReservationAll } from '../../../interfaces/reservation';
import { IGroupService, IPrice, IProduct, IProductGroup, Price } from '../../../interfaces/product';
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { requireMatch, valueChange } from '../../../util/validators';
import { IPaymentAll, PaymentType } from '../../../interfaces/payment';
import { createProductGroupService, getPrice, getProductDurability, newAdditional, newExtra, newPrice } from '../../../util/helper';
import { formatTime, totalDuration } from '../../../util/dates';
import { TranslateService } from '@ngx-translate/core';
import { map, startWith } from 'rxjs/operators';
import { transitionAnimation } from '../../../util/animation';
import { IAdditionalAll } from '../../../interfaces/additional';
import { MatListOption } from '@angular/material/list';
import { IService } from '../../../interfaces/room';

@Component({
  selector: 'app-reservation-complete',
  templateUrl: './reservation-complete.component.html',
  styleUrls: ['./reservation-complete.component.scss'],
  animations: [transitionAnimation]
})
export class ReservationCompleteComponent implements OnInit, OnDestroy {
  reservation?: IReservationAll;
  payments?: IPaymentAll[];
  additionalList?: IAdditionalAll[];
  additionalSelected: IAdditionalAll[] = [];

  form!: UntypedFormGroup;
  groups?: IGroupService[];
  filteredGroup?: Observable<IGroupService[] | undefined>;
  group: UntypedFormControl = new UntypedFormControl('', [
    Validators.required, requireMatch
  ]);
  products?: IService[];
  filteredProduct?: Observable<IService[] | undefined>;
  product: UntypedFormControl = new UntypedFormControl('', [
    Validators.required, requireMatch
  ]);

  description: UntypedFormControl = new UntypedFormControl();
  extraPrice: UntypedFormControl = new UntypedFormControl();
  type: UntypedFormControl = new UntypedFormControl(PaymentType.cash);

  types: string[] = Object.values(PaymentType);
  price: IPrice;

  durability?: string;

  private reservationId: any;
  private roomId: any;
  private customerId: any;
  private getState: Observable<any>;
  private subscription?: Subscription;
  private readonly isDashboard = false;

  constructor(private store: Store<AppState>, private route: ActivatedRoute, private formBuilder: UntypedFormBuilder,
              private readonly translate: TranslateService, private router: Router) {
    this.getState = this.store.select(selectReservationState);
    this.price = new Price();
    this.product.valueChanges.subscribe(value => {
      if (value) {
        this.price = newPrice(this.price, value.price);
      }
    });
    this.extraPrice.valueChanges.subscribe(value => {
      this.price = newExtra(this.price, value ? value : 0);
    });
    this.isDashboard = this.router.getCurrentNavigation()?.extras?.state?.data?.isDashboard;
  }

  get durationTime(): string {
    if (this.reservation) {
      const duration = totalDuration(this.product.value, this.reservation.additional);
      return formatTime(duration, this.translate.currentLang);
    }
    return '';
  }

  get complete(): void {
    if (this.reservation) {
      const reservationId = this.reservation.id;
      const productId = valueChange(this.product.value.id, this.reservation?.product.key);
      const description = this.description.value;
      const price = this.extraPrice.value;
      const paymentType = this.type.value;
      const additionalIds = this.additionalSelected.map(additional => additional.id);
      this.store.dispatch(
        new fromActionsReservation.Complete({
          reservationId,
          extras: {productId, description, price, paymentType, additionalIds},
          isDashboard: this.isDashboard
        })
      );
    }
    return;
  }

  ngOnInit(): void {
    this.createForm();
    this.subscribe();
    this.route.params.subscribe(routeParams => {
      this.reservationId = routeParams.id;
      this.roomId = routeParams.roomId;
      this.customerId = routeParams.customerId;
      this.getReservation();
      this.getProducts();
    });
    this.createFilters();
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }

  displayFnGroup(group: IProductGroup): string {
    return group ? `${group.name}` : '';
  }

  displayFnProduct(product: IProduct): string {
    return product ? `${product.name}` : '';
  }

  keyDownHandler(event: any, form: UntypedFormControl): void {
    if (event.code === 'Backspace') {
      form.setValue('');
    }
  }

  onChange(options: MatListOption[]): void {
    this.additionalSelected = options.map(o => o.value);
    this.price = newAdditional(this.price, this.additionalSelected);
  }

  isSelected(it: IAdditionalAll): boolean {
    return this.additionalSelected.filter(el => el.id === it.id).length > 0;
  }

  private subscribe(): void {
    this.subscription = this.getState.subscribe(state => {
      this.payments = state.payments;
      this.reservation = state.selected;
      if (this.reservation) {
        this.price = getPrice(this.reservation, this.payments);
        this.product.setValue(this.reservation.product);
        this.additionalSelected = this.reservation.additional ? this.reservation.additional
          .map(ad => Object.assign({}, ad, { id: ad.key })) : [];
        this.types = this.reservation.room.paymentTypes;
      }
      if (state.productDiscount) {
        this.additionalList = state.productDiscount.additionalList;
        if (state.productDiscount?.products && this.reservation) {
          const productId = this.reservation.product.key;
          this.groups = Array.from(createProductGroupService(new Map<string, IGroupService>(), state.productDiscount.products,
            this.reservation.room.currency.code).values());
          this.group.setValue(this.groups?.find(group => {
            if (group.products?.find(product => product.id === productId)) {
              return group;
            }
            return undefined;
          }));
        }
      }
    });
  }

  private createForm(): void {
    this.form = this.formBuilder.group({
      group: this.group,
      product: this.product,
      description: this.description,
      extraPrice: this.extraPrice,
      type: this.type
    });
    this.valueChange();
  }

  private valueChange(): void {
    this.group.valueChanges.subscribe(value => {
      if (!value) {
        return;
      }
      this.products = value.products;
      const product = value.products?.find((p: IProductGroup) => p.id === this.reservation?.product?.key);
      if (product) {
        this.products = value.products;
        this.product.setValue(product);
      } else {
        if (this.products?.length === 1) {
          this.product.setValue(this.products[0]);
        } else {
          this.product.setValue('');
        }
      }
      this.durability = getProductDurability(value.durabilityMin, value.durabilityMax, this.translate);
    });
    this.product.valueChanges.subscribe(value => {
      if (value) {
        this.price = newPrice(this.price, value.price);
      }
    });
  }

  private createFilters(): void {
    this.filteredGroup = this.group.valueChanges.pipe(
      startWith(''),
      map(value => typeof value === 'string' ? value : value.name),
      map(name => name ? this.filterGroup(name) : this.groups ? this.groups.slice() : this.groups)
    );
    this.filteredProduct = this.product.valueChanges.pipe(
      startWith(''),
      map(value => typeof value === 'string' ? value : value.name),
      map(name => name ? this.filterProduct(name) : this.products ? this.products.slice() : this.products)
    );
  }

  private getProducts(): void {
    this.store.dispatch(
      new fromActionsReservation.GetAllServices({roomId: this.roomId, customerId: this.customerId})
    );
  }

  private filterGroup(name: string): IGroupService[] | undefined {
    const filterValue = name.toLowerCase();

    return this.groups?.filter(option => option.name?.toLowerCase().indexOf(filterValue) === 0);
  }

  private filterProduct(name: string): IService[] | undefined {
    const filterValue = name.toLowerCase();

    return this.products?.filter(option => option.name?.toLowerCase().indexOf(filterValue) === 0);
  }

  private getReservation(): void {
    if (!this.payments) {
      this.payments = undefined;
      this.store.dispatch(
        new fromActionsReservation.ReservationFindPayments(this.reservationId)
      );
    }
    if (!this.reservation) {
      this.reservation = undefined;
      this.store.dispatch(
        new fromActionsReservation.ReservationFind({id: this.reservationId})
      );
    }
  }
}
