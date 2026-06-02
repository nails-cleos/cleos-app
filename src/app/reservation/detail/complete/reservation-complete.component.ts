import { ChangeDetectionStrategy, Component, computed, effect, inject, input, signal, WritableSignal } from '@angular/core';
import { combineLatestWith } from 'rxjs';
import { Store } from '@ngrx/store';
import {
  completeReservation,
  getAllAdditionalByGroupId,
  getAllTreatments,
  getReservation,
  reservationFindPayments,
} from '../../../store/actions/reservation.actions';
import { IExtras } from '../../../interfaces/reservation';
import { IGroupService, IPrice, ITreatment, ITreatmentGroup, Price } from '../../../interfaces/treatment';
import { FormControl, FormGroup, NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { requireMatch, valueChange } from '../../../util/validators';
import { IPaymentOption } from '../../../interfaces/payment';
import {
  addPayment,
  createTreatmentGroupService,
  getList,
  getPrice,
  newAdditional,
  newExtra,
  newPrice,
} from '../../../util/helper';
import { API_LOCALE, getDiffTime, getNowTimeZone, getTime, getTimeNumber, newDateTimestamp } from '../../../util/dates';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { map, startWith } from 'rxjs/operators';
import { IAdditionalAll } from '../../../interfaces/additional';
import { MatListOption, MatSelectionList } from '@angular/material/list';
import { IService } from '../../../interfaces/room';
import { IColorAll } from '../../../interfaces/color';
import { DialogComponent } from '../../../shared/dialog/generic/dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { TimeDetailPipe } from '../../../pipes/time-detail.pipe';
import { CurrencySymbolPipe } from '../../../pipes/currency-symbol.pipe';
import { DurationTimePipe } from '../../../pipes/durationTime.pipe';
import { FormFieldAdderComponent } from '../../../shared/form-field-adder/form-field-adder.component';
import { PaymentOptionSelectComponent } from '../../../shared/payment-option-select/payment-option-select.component';
import { PricePreviewComponent } from '../../../shared/price-preview/price-preview.component';
import { BackButtonDirective } from '../../../directives/back-button.directive';
import { ReservationState } from '../../../store/reducers/reservation.reducers';
import {
  getAdditionalListPipe, getNavigationParamsPipe,
  getPaymentsPipe,
  getSelectedReservationPipe,
  getTreatmentDiscountPipe,
} from '../../../store/selectors/reservation.selectors';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { PaymentState } from '../../../store/reducers/payment.reducers';
import { getPaymentOptionsPipe } from '../../../store/selectors/payment.selectors';
import { MatError, MatFormField, MatInput, MatLabel, MatPrefix } from '@angular/material/input';
import { MatSuffix } from '@angular/material/form-field';
import { MatOption } from '@angular/material/core';
import { MatIcon } from '@angular/material/icon';
import { MatButton } from '@angular/material/button';
import { DatePipe, DecimalPipe, NgClass } from '@angular/common';
import { MatAutocomplete, MatAutocompleteTrigger } from '@angular/material/autocomplete';
import { TimepickerDirective } from '../../../shared/clock-timepicker/timepicker.directive';
import { TimepickerComponent } from '../../../shared/clock-timepicker/timepicker.component';
import { MatCheckbox } from '@angular/material/checkbox';

type ReservationCompleteForm = {
  group: FormControl<IGroupService | undefined>;
  treatment: FormControl<IService | undefined>;
  type: FormControl<string | undefined>;
  transfer: FormControl<string | undefined>;
  startTime: FormControl<string>;
  endTime: FormControl<string>;
  color: FormControl<IColorAll | undefined>;
}

@Component({
  selector: 'app-reservation-complete',
  templateUrl: './reservation-complete.component.html',
  styleUrls: ['./reservation-complete.component.scss'],
  imports: [TimeDetailPipe, MatFormField, MatLabel, MatInput, MatOption, MatIcon, MatButton, ReactiveFormsModule,
    TranslatePipe, DecimalPipe, NgClass, DatePipe, MatAutocomplete, MatError, MatAutocompleteTrigger, MatPrefix,
    BackButtonDirective, CurrencySymbolPipe, TimeDetailPipe, CurrencySymbolPipe, DurationTimePipe,
    FormFieldAdderComponent, PaymentOptionSelectComponent, PricePreviewComponent, BackButtonDirective,
    TimepickerDirective, TimepickerComponent, MatSelectionList, MatListOption, MatCheckbox, MatSuffix],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReservationCompleteComponent {
  id = input<string>();
  roomId = input<string>();
  customerId = input<string>();

  private readonly dialog: MatDialog = inject(MatDialog);
  private readonly store: Store<ReservationState | PaymentState> = inject(Store<ReservationState | PaymentState>);
  private readonly translate: TranslateService = inject(TranslateService);
  private readonly formBuilder: NonNullableFormBuilder = inject(NonNullableFormBuilder);

  private reservationParams$ = this.store.pipe(getNavigationParamsPipe);
  private selectedReservation$ = this.store.pipe(getSelectedReservationPipe);
  private treatmentDiscount$ = this.store.pipe(getTreatmentDiscountPipe);
  private additionalList$ = this.store.pipe(getAdditionalListPipe);
  private payments$ = this.store.pipe(getPaymentsPipe);
  private paymentOptions$ = this.store.pipe(getPaymentOptionsPipe);

  private readonly reservationParamsSignal = toSignal(this.reservationParams$);
  private readonly treatmentDiscountSignal = toSignal(this.treatmentDiscount$);
  private readonly paymentsSignal = toSignal(this.payments$);
  private readonly paymentOptionsSignal = toSignal(this.paymentOptions$, { initialValue: [] });

  readonly selectedReservationSignal = toSignal(this.selectedReservation$);
  readonly additionalListSignal = toSignal(this.additionalList$);

  private readonly isDashboard = computed(() => this.reservationParamsSignal()?.isDashboard ?? false);

  startDate: Date = getNowTimeZone();
  endDate: Date = getNowTimeZone();

  form: FormGroup<ReservationCompleteForm> = this.formBuilder.group<ReservationCompleteForm>({
    group: this.formBuilder.control(undefined, {
      validators: [Validators.required, requireMatch],
    }),
    treatment: this.formBuilder.control(undefined, {
      validators: [Validators.required, requireMatch],
    }),
    type: this.formBuilder.control(undefined),
    transfer: this.formBuilder.control(undefined),
    startTime: this.formBuilder.control('', {
      validators: [Validators.required],
    }),
    endTime: this.formBuilder.control(getTime(this.endDate, this.translate.getCurrentLang()), {
      validators: [Validators.required],
    }),
    color: this.formBuilder.control(undefined, {
      validators: [requireMatch],
    }),
  });

  private readonly selectGroupSignal = toSignal(this.getForm.group.valueChanges);
  private readonly selectTreatmentSignal = toSignal(this.getForm.treatment.valueChanges);

  private readonly payments = computed(() => this.paymentsSignal());
  private readonly additionalList = computed(() => this.additionalListSignal());
  private additionalSelected = signal<IAdditionalAll[]>([]);

  groups = signal<IGroupService[] | undefined>(undefined);
  readonly filteredGroupSignal = toSignal(
    this.getForm.group.valueChanges.pipe(
      startWith(''),
      map(value => typeof value === 'string' ? value : value?.name),
      combineLatestWith(toObservable(this.groups)),
      map(([name, groups]) => {
        if (name) {
          return this.filterGroup(name, groups);
        } else {
          return groups ? groups.slice() : groups;
        }
      }),
    ),
  );

  treatmentList = signal<IService[] | undefined>(undefined);
  readonly filteredTreatmentSignal = toSignal(
    this.getForm.treatment.valueChanges.pipe(
      startWith(''),
      map(value => typeof value === 'string' ? value : value?.name),
      combineLatestWith(toObservable(this.treatmentList)),
      map(([name, treatmentList]) => {
        if (name) {
          return this.filterTreatment(name, treatmentList);
        } else {
          return treatmentList ? treatmentList.slice() : treatmentList;
        }
      }),
    ),
  );

  colors = signal<IColorAll[] | undefined>(undefined);
  readonly filteredColorSignal = toSignal(
    this.getForm.color.valueChanges.pipe(
      startWith(''),
      map(value => typeof value === 'string' ? value : value?.name),
      combineLatestWith(toObservable(this.colors)),
      map(([name, colorList]) => {
        if (name) {
          return this.filterColor(name, colorList);
        } else {
          return colorList ? colorList.slice() : colorList;
        }
      }),
    ),
  );

  private readonly paymentOptions = computed(() => this.paymentOptionsSignal().filter(
    option => option.enabled && option.show,
  ));
  options = signal<IPaymentOption[]>([]);
  price: WritableSignal<IPrice> = signal(new Price());
  totalTime = signal('');
  readonly isValidTime = computed(() => {
    const time = this.totalTime();
    return !!time && !time.includes('-');
  });

  dateFormat: string = this.translate.getCurrentLang();
  split: boolean = false;
  isValid: boolean = true;
  isValidSplit = signal(true);

  private currentExtraData?: IExtras[];
  private currentSplitData?: IExtras[];

  constructor() {
    effect(() => {
      const reservation = this.selectedReservationSignal();
      if (reservation) {
        this.startDate = newDateTimestamp(reservation.startedTimestamp, reservation.room.timeZone);
        this.getForm.startTime.setValue(getTime(this.startDate, this.translate.getCurrentLang()));
        const endDate = newDateTimestamp(reservation.timestamp, reservation.room.timeZone);
        this.endDate.setFullYear(endDate.getFullYear(), endDate.getMonth(), endDate.getDate());
        this.price.set(getPrice(reservation, this.payments()));
        this.getForm.treatment.setValue(reservation.treatment);
        const additionalSelected = reservation.additional?.map(ad => Object.assign({}, ad, { id: ad.key }));
        if (additionalSelected) {
          this.additionalSelected.set(additionalSelected);
        }
        const options = this.paymentOptions();
        this.options.set(options.filter(option => reservation.room.paymentTypes?.includes(option.type)));
        this.setAppointmentDuration();
      }
    });

    effect(() => {
      const id = this.id();
      if (!id) {
        return;
      }
      this.store.dispatch(reservationFindPayments({ id }));
      this.store.dispatch(getReservation({ id }));
    });

    effect(() => {
      const roomId = this.roomId();
      const customerId = this.customerId();
      if (roomId) {
        this.store.dispatch(getAllTreatments({ roomId, customerId }));
      }
    });

    effect(() => {
      const group = this.selectGroupSignal();
      if (!group) {
        return;
      }
      const reservation = this.selectedReservationSignal();
      this.treatmentList.set(group.treatments);
      const treatment = getList(group.treatments, reservation?.treatment?.key);
      this.getForm.treatment.setValue(treatment);
      this.colors.set(group.colors);
      this.getForm.color.setValue(undefined);
      const roomId = this.roomId();
      if (!roomId) {
        return;
      }
      this.store.dispatch(getAllAdditionalByGroupId({ roomId, groupId: group.id }));
    });

    effect(() => {
      const treatment = this.selectTreatmentSignal();
      if (!treatment) {
        return;
      }
      const reservation = this.selectedReservationSignal();
      this.price.update(price => newPrice(price, treatment.price, reservation?.treatment?.discountCustomer));
    });

    effect(() => {
      const additionalList = this.additionalList();
      const additionalSelected = this.additionalSelected();
      if (additionalSelected?.length && additionalList?.length) {
        const selectIds = additionalSelected?.map(value => value.id);
        const newList = additionalList.filter(al => selectIds.includes(al.id));
        if (newList.length !== additionalSelected.length) {
          this.additionalSelected.set(newList);
          const reservation = this.selectedReservationSignal();
          this.price.update(price => newAdditional(price, newList, reservation?.treatment?.discountCustomer));
        }
      }
    });

    effect(() => {
      const payments = this.payments();
      this.price.update(price => addPayment(price, payments));
    });

    effect(() => {
      const treatmentDiscount = this.treatmentDiscountSignal();
      if (treatmentDiscount) {
        const reservation = this.selectedReservationSignal();
        if (treatmentDiscount.treatments && reservation) {
          const treatmentId = reservation.treatment.key;
          this.groups.set(Array.from(
            createTreatmentGroupService(
              new Map<string, IGroupService>(), treatmentDiscount.treatments, reservation.room.currency.code,
            ).values(),
          ));
          this.getForm.group.setValue(this.groups()?.find(group => getList(group.treatments, treatmentId)));
        }
      }
    });

    effect(() => {
      const isPaid = this.price().isPaid;
      if (isPaid) {
        this.getForm.type.setValue(undefined);
      } else {
        this.getForm.type.setValue('MOLLIE');
      }
    });
  }

  get getForm(): ReservationCompleteForm {
    return this.form.controls;
  }

  get balance(): number {
    const reservation = this.selectedReservationSignal();
    return reservation?.balance ?? 0;
  }

  complete(): void {
    if (!this.isValid) {
      const title = this.translate.instant('COMMON.COMPLETE.TITLE');
      const content = this.translate.instant('COMMON.COMPLETE.CONTENT');
      const dialogRef = this.dialog.open(DialogComponent, {
        data: { title, content, value: this.selectedReservationSignal() },
      });

      dialogRef.afterClosed().subscribe(event => {
        if (event) {
          this.completeReservation();
        }
      });
    } else {
      this.completeReservation();
    }
    return;
  }

  displayFnGroup = (group: ITreatmentGroup): string => group ? `${ group.name }` : '';

  displayFnTreatment = (treatment: ITreatment): string => treatment ? `${ treatment.name }` : '';

  displayFnColor = (color?: IColorAll): string => color ? `${ color.name }` : '';

  keyDownHandler = (event: KeyboardEvent, form: FormControl): void => {
    if (event.code === 'Backspace') {
      form.setValue('');
    }
  };

  onChange = (options: MatListOption[]): void => {
    this.additionalSelected.set(options.map(o => o.value));
    this.price.update(price => newAdditional(price, this.additionalSelected(),
      this.selectedReservationSignal()?.treatment?.discountCustomer));
  };

  isSelected = (it: IAdditionalAll): boolean => this.additionalSelected().filter(el => el.id === it.id).length > 0;

  timeChange = ($event: string, date: Date): void => {
    const time = getTimeNumber($event);
    date.setHours(time?.hour || 0, time?.minute || 0, 0);
    this.setAppointmentDuration();
  };

  onExtrasChanges = (extras: IExtras[]): void => {
    this.currentExtraData = extras;
    let extrasTotal = 0;
    if (extras.length) {
      extrasTotal = extras.map(a => a.price).reduce((p, c) => p + c);
    }
    this.price.update(
      price => newExtra(price, extrasTotal, this.selectedReservationSignal()?.treatment?.discountCustomer));
  };

  onSplitChanges = (split: IExtras[]): void => {
    this.currentSplitData = split;
  };

  splitChange = () => {
    this.split = !this.split;
    if (!this.split) {
      this.isValidSplit.set(true);
      return;
    }

    const totalSplit = this.currentSplitData?.map(t => t.price).reduce((acc, value) => acc + value, 0) || 0;
    this.isValidSplit.set(totalSplit === this.price().toPaid);
    if (!this.currentSplitData?.length) {
      this.isValidSplit.set(false);
    }
  };

  private setAppointmentDuration = (): void => {
    if (this.startDate && this.endDate) {
      this.totalTime.set(getDiffTime(newDateTimestamp(this.endDate), newDateTimestamp(this.startDate)));
    }
  };

  private filterGroup = (name: string, groups?: IGroupService[]): IGroupService[] | undefined => groups?.filter(
    option => option.name?.toLowerCase().indexOf(name.toLowerCase()) === 0);

  private filterTreatment = (name: string, treatments?: IService[]): IService[] | undefined => treatments?.filter(
    option => option.name?.toLowerCase().indexOf(name.toLowerCase()) === 0);

  private filterColor = (name: string, colors?: IColorAll[]): IColorAll[] | undefined => colors?.filter(
    option => option?.name?.toLowerCase().indexOf(name.toLowerCase()) === 0);

  private completeReservation = (): void => {
    const reservation = this.selectedReservationSignal();
    if (!reservation) {
      return;
    }
    let splitData = this.currentSplitData;
    if (this.balance && this.currentSplitData) {
      splitData = [
        { description: 'Balance', price: this.balance, paymentType: 'ACCOUNT' },
        ...this.currentSplitData,
      ];
    }
    this.store.dispatch(
      completeReservation(
        reservation.id,
        {
          treatmentId: valueChange(this.getForm.treatment.value?.key, reservation?.treatment.key),
          paymentType: splitData ? undefined : this.getForm.type.value,
          additionalIds: this.additionalSelected().map(additional => additional.id),
          transfer: this.getForm.transfer.value,
          color: this.getForm.color.value?.id,
          startDateTime: this.startDate.toLocaleString(API_LOCALE),
          endDateTime: this.endDate.toLocaleString(API_LOCALE),
          extras: this.currentExtraData,
          split: splitData,
          pointOfSale: true,
        },
        this.isDashboard(),
        this.startDate,
      ),
    );
  };
}
