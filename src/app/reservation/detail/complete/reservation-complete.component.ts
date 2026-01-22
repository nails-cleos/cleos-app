import { ChangeDetectionStrategy, Component, computed, effect, inject, signal, WritableSignal } from '@angular/core';
import { combineLatestWith } from 'rxjs';
import { Store } from '@ngrx/store';
import {
  completeReservation,
  getAllAdditionalByGroupId,
  getAllTreatments,
  getReservation,
  reservationFindPayments,
} from '../../../store/reservation.actions';
import { IExtras } from '../../../interfaces/reservation';
import { IGroupService, IPrice, ITreatment, ITreatmentGroup, Price } from '../../../interfaces/treatment';
import { FormControl, FormGroup, NonNullableFormBuilder, Validators } from '@angular/forms';
import { requireMatch, valueChange } from '../../../util/validators';
import { PaymentType } from '../../../interfaces/payment';
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
import { TranslateService } from '@ngx-translate/core';
import { map, startWith } from 'rxjs/operators';
import { transitionAnimation } from '../../../util/animation';
import { IAdditionalAll } from '../../../interfaces/additional';
import { MatListOption } from '@angular/material/list';
import { IService } from '../../../interfaces/room';
import { IColorAll } from '../../../interfaces/color';
import { DialogComponent } from '../../../shared/dialog/generic/dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { SharedModule } from '../../../shared/shared.module';
import { TimeDetailPipe } from '../../../pipes/time-detail.pipe';
import { CurrencySymbolPipe } from '../../../pipes/currency-symbol.pipe';
import { DurationTimePipe } from '../../../pipes/durationTime.pipe';
import { FormFieldAdderComponent } from '../../../shared/form-field-adder/form-field-adder.component';
import { PricePreviewComponent } from '../../../shared/price-preview/price-preview.component';
import { BackButtonDirective } from '../../../directives/back-button.directive';
import { ReservationState } from '../../../store/reducers/reservation.reducers';
import {
  getAdditionalListPipe,
  getCurrentCompleteReservationPipe,
  getPaymentsPipe,
  getSelectedReservationPipe,
  getTreatmentDiscountPipe,
} from '../../../store/selectors/reservation.selectors';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';

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
  animations: [transitionAnimation],
  imports: [SharedModule, TimeDetailPipe, CurrencySymbolPipe, DurationTimePipe, FormFieldAdderComponent,
    PricePreviewComponent, BackButtonDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReservationCompleteComponent {
  private readonly dialog: MatDialog = inject(MatDialog);
  private readonly store: Store<ReservationState> = inject(Store<ReservationState>);
  private readonly translate: TranslateService = inject(TranslateService);
  private readonly formBuilder: NonNullableFormBuilder = inject(NonNullableFormBuilder);

  private completeReservation$ = this.store.pipe(getCurrentCompleteReservationPipe);
  private selectedReservation$ = this.store.pipe(getSelectedReservationPipe);
  private treatmentDiscount$ = this.store.pipe(getTreatmentDiscountPipe);
  private additionalList$ = this.store.pipe(getAdditionalListPipe);
  private payments$ = this.store.pipe(getPaymentsPipe);

  private readonly completeReservationSignal = toSignal(this.completeReservation$);
  private readonly treatmentDiscountSignal = toSignal(this.treatmentDiscount$);
  private readonly paymentsSignal = toSignal(this.payments$);

  readonly selectedReservationSignal = toSignal(this.selectedReservation$);
  readonly additionalListSignal = toSignal(this.additionalList$);

  private readonly isDashboard = computed(() => this.completeReservationSignal()?.isDashboard ?? false);
  private readonly reservationId = computed(() => this.completeReservationSignal()?.reservationId);
  private readonly roomId = computed(() => this.completeReservationSignal()?.roomId);
  private readonly customerId = computed(() => this.completeReservationSignal()?.customerId);

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

  types: string[] = [PaymentType.cash, PaymentType.transfer];
  price: WritableSignal<IPrice> = signal(new Price());
  totalTime = signal('');
  readonly isValidTime = computed(() => {
    const time = this.totalTime();
    return !!time && !time.includes('-');
  });

  dateFormat: string = this.translate.getCurrentLang();
  split: boolean = false;
  isValid: boolean = true;
  isValidSplit: boolean = true;

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
        this.types = [...reservation.room.paymentTypes, PaymentType.transfer];
        this.setAppointmentDuration();
      }
    });

    effect(() => {
      const id = this.reservationId();
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
        this.getForm.type.setValue(PaymentType.transfer);
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

  displayFnGroup = (group: ITreatmentGroup): string => group ? `${group.name}` : '';

  displayFnTreatment = (treatment: ITreatment): string => treatment ? `${treatment.name}` : '';

  displayFnColor = (color?: IColorAll): string => color ? `${color.name}` : '';

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
    if (this.split) {
      const totalSplit = this.currentSplitData?.map(t => t.price).reduce((acc, value) => acc + value, 0) || 0;
      if (totalSplit !== this.price().toPaid) {
        this.isValidSplit = false;
      }
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
        { description: 'Balance', price: this.balance, paymentType: PaymentType.account },
        ...this.currentSplitData,
      ];
    }
    this.store.dispatch(
      completeReservation(
        reservation.id,
        {
          treatmentId: valueChange(this.getForm.treatment.value?.key, reservation?.treatment.key),
          paymentType: this.getForm.type.value || PaymentType.account,
          additionalIds: this.additionalSelected().map(additional => additional.id),
          transfer: this.getForm.transfer.value,
          color: this.getForm.color.value?.id,
          startDateTime: this.startDate.toLocaleString(API_LOCALE),
          endDateTime: this.endDate.toLocaleString(API_LOCALE),
          extras: this.currentExtraData,
          split: splitData,
        },
        this.isDashboard(),
      ),
    );
  };
}
