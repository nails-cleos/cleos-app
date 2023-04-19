import { Component, OnDestroy, OnInit } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { Store } from '@ngrx/store';
import { AppState, selectReservationState } from '../../../store/app.states';
import { ActivatedRoute, Router } from '@angular/router';
import * as fromActionsReservation from '../../../store/reservation.actions';
import { IReservationAll } from '../../../interfaces/reservation';
import { IGroupService, IPrice, ITreatment, ITreatmentGroup, Price } from '../../../interfaces/treatment';
import { FormControl, UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { requireMatch, valueChange } from '../../../util/validators';
import { IPaymentAll, PaymentType } from '../../../interfaces/payment';
import {
  createTreatmentGroupService,
  getPrice,
  getTreatmentDurability,
  newAdditional,
  newExtra,
  newPrice
} from '../../../util/helper';
import { API_LOCALE, getNowTimeZone, getTime, getTimeNumber } from '../../../util/dates';
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
  treatments?: IService[];
  filteredTreatment?: Observable<IService[] | undefined>;
  treatment: UntypedFormControl = new UntypedFormControl('', [
    Validators.required, requireMatch
  ]);

  date: FormControl<Date> = new UntypedFormControl('', [
    Validators.required
  ]);

  time: UntypedFormControl = new UntypedFormControl('', [
    Validators.required
  ]);

  description: UntypedFormControl = new UntypedFormControl();
  extraPrice: UntypedFormControl = new UntypedFormControl();
  type: UntypedFormControl = new UntypedFormControl(PaymentType.transfer);
  transfer: UntypedFormControl = new UntypedFormControl();

  types: string[] = [PaymentType.cash, PaymentType.transfer];
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
    this.treatment.valueChanges.subscribe(value => {
      if (value) {
        this.price = newPrice(this.price, value.price, this.reservation?.treatment?.discount);
      }
    });
    this.extraPrice.valueChanges.subscribe(value => {
      this.price = newExtra(this.price, value ? value : 0, this.reservation?.treatment?.discount);
    });
    this.isDashboard = this.router.getCurrentNavigation()?.extras?.state?.data?.isDashboard;
  }

  get complete(): void {
    if (this.reservation) {
      const reservationId = this.reservation.id;
      const treatmentId = valueChange(this.treatment.value.id, this.reservation?.treatment.key);
      const description = this.description.value;
      const price = this.extraPrice.value;
      const paymentType = this.type.value;
      const additionalIds = this.additionalSelected.map(additional => additional.id);
      const transfer = this.transfer.value;
      const dateTime = this.date.value.toLocaleString(API_LOCALE);
      this.store.dispatch(
        new fromActionsReservation.Complete({
          reservationId,
          extras: { treatmentId, description, price, paymentType, additionalIds, transfer, dateTime },
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
      const dateTime = getNowTimeZone();
      this.date.setValue(dateTime);
      this.time.setValue(getTime(dateTime, this.translate.currentLang));
      this.getReservation();
      this.getTreatments();
    });
    this.createFilters();
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }

  displayFnGroup(group: ITreatmentGroup): string {
    return group ? `${ group.name }` : '';
  }

  displayFnTreatment(treatment: ITreatment): string {
    return treatment ? `${ treatment.name }` : '';
  }

  keyDownHandler(event: any, form: UntypedFormControl): void {
    if (event.code === 'Backspace') {
      form.setValue('');
    }
  }

  onChange(options: MatListOption[]): void {
    this.additionalSelected = options.map(o => o.value);
    this.price = newAdditional(this.price, this.additionalSelected, this.reservation?.treatment?.discount);
  }

  isSelected(it: IAdditionalAll): boolean {
    return this.additionalSelected.filter(el => el.id === it.id).length > 0;
  }

  timeChange($event: string): void {
    const time = getTimeNumber($event)!;
    this.date.value.setHours(time.hour, time.minute, 0);
  }

  private subscribe(): void {
    this.subscription = this.getState.subscribe(state => {
      this.payments = state.payments;
      this.reservation = state.selected;
      if (this.reservation) {
        this.price = getPrice(this.reservation, this.payments);
        this.treatment.setValue(this.reservation.treatment);
        this.additionalSelected = this.reservation.additional ? this.reservation.additional
          .map(ad => Object.assign({}, ad, { id: ad.key })) : [];
        this.types = [...this.reservation.room.paymentTypes, PaymentType.transfer];
      }
      if (state.treatmentDiscount) {
        this.additionalList = state.treatmentDiscount.additionalList;
        if (state.treatmentDiscount?.treatments && this.reservation) {
          const treatmentId = this.reservation.treatment.key;
          this.groups = Array.from(createTreatmentGroupService(new Map<string, IGroupService>(), state.treatmentDiscount.treatments,
            this.reservation.room.currency.code).values());
          this.group.setValue(this.groups?.find(group => {
            if (group.treatments?.find(treatment => treatment.id === treatmentId)) {
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
      treatment: this.treatment,
      description: this.description,
      extraPrice: this.extraPrice,
      type: this.type,
      transfer: this.transfer,
      date: this.date,
      time: this.time
    });
    this.valueChange();
  }

  private valueChange(): void {
    this.group.valueChanges.subscribe(value => {
      if (!value) {
        return;
      }
      this.treatments = value.treatments;
      const treatment = value.treatments?.find((p: ITreatmentGroup) => p.id === this.reservation?.treatment?.key);
      if (treatment) {
        this.treatments = value.treatments;
        this.treatment.setValue(treatment);
      } else {
        if (this.treatments?.length === 1) {
          this.treatment.setValue(this.treatments[0]);
        } else {
          this.treatment.setValue('');
        }
      }
      this.durability = getTreatmentDurability(value.durabilityMin, value.durabilityMax, this.translate);
    });
    this.treatment.valueChanges.subscribe(value => {
      if (value) {
        this.price = newPrice(this.price, value.price, this.reservation?.treatment?.discount);
      }
    });
  }

  private createFilters(): void {
    this.filteredGroup = this.group.valueChanges.pipe(
      startWith(''),
      map(value => typeof value === 'string' ? value : value.name),
      map(name => name ? this.filterGroup(name) : this.groups ? this.groups.slice() : this.groups)
    );
    this.filteredTreatment = this.treatment.valueChanges.pipe(
      startWith(''),
      map(value => typeof value === 'string' ? value : value.name),
      map(name => name ? this.filterTreatment(name) : this.treatments ? this.treatments.slice() : this.treatments)
    );
  }

  private getTreatments(): void {
    this.store.dispatch(
      new fromActionsReservation.GetAllServices({ roomId: this.roomId, customerId: this.customerId })
    );
  }

  private filterGroup(name: string): IGroupService[] | undefined {
    const filterValue = name.toLowerCase();

    return this.groups?.filter(option => option.name?.toLowerCase().indexOf(filterValue) === 0);
  }

  private filterTreatment(name: string): IService[] | undefined {
    const filterValue = name.toLowerCase();

    return this.treatments?.filter(option => option.name?.toLowerCase().indexOf(filterValue) === 0);
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
        new fromActionsReservation.ReservationFind({ id: this.reservationId })
      );
    }
  }
}
