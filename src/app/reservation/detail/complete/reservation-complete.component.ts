import { Component, OnDestroy, OnInit } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { Store } from '@ngrx/store';
import { AppState, selectReservationState } from '../../../store/app.states';
import { ActivatedRoute, Router } from '@angular/router';
import * as fromActionsReservation from '../../../store/reservation.actions';
import { IExtras, IReservationAll } from '../../../interfaces/reservation';
import { IGroupService, IPrice, ITreatment, ITreatmentGroup, Price } from '../../../interfaces/treatment';
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { requireMatch, valueChange } from '../../../util/validators';
import { IPaymentAll, PaymentType } from '../../../interfaces/payment';
import {
  addPayment,
  createTreatmentGroupService,
  getPrice,
  newAdditional,
  newExtra,
  newPrice
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
import { SharedModule } from "../../../shared/shared.module";
import { TimeDetailPipe } from "../../../pipes/time-detail.pipe";
import { CurrencySymbolPipe } from "../../../pipes/currency-symbol.pipe";
import { DurationTimePipe } from "../../../pipes/durationTime.pipe";
import { FormFieldAdderComponent } from "../../../shared/form-field-adder/form-field-adder.component";
import { PricePreviewComponent } from "../../../shared/price-preview/price-preview.component";
import { BackButtonDirective } from "../../../directives/back-button.directive";

@Component({
  selector: 'app-reservation-complete',
  templateUrl: './reservation-complete.component.html',
  styleUrls: ['./reservation-complete.component.scss'],
  animations: [transitionAnimation],
  standalone: true,
  imports: [SharedModule, TimeDetailPipe, CurrencySymbolPipe, DurationTimePipe, FormFieldAdderComponent,
    PricePreviewComponent, BackButtonDirective],
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

  startDate: Date;

  startTime: UntypedFormControl = new UntypedFormControl('', [
    Validators.required
  ]);

  endDate: Date;

  endTime: UntypedFormControl = new UntypedFormControl('', [
    Validators.required
  ]);

  type: UntypedFormControl = new UntypedFormControl();
  transfer: UntypedFormControl = new UntypedFormControl();

  types: string[] = [PaymentType.cash, PaymentType.transfer];
  price: IPrice;

  filteredColor?: Observable<IColorAll[] | undefined>;
  color: UntypedFormControl = new UntypedFormControl('', [requireMatch]);
  colors?: IColorAll[];

  dateFormat: string;
  split: boolean = false;
  isValid: boolean = true;
  isValidSplit: boolean = true;
  totalTime?: string;

  private reservationId: any;
  private roomId: any;
  private groupId: any;
  private customerId: any;
  private getState: Observable<any>;
  private subscription?: Subscription;
  private readonly isDashboard = false;
  private currentExtraData?: IExtras[];
  private currentSplitData?: IExtras[];

  constructor(public dialog: MatDialog, private store: Store<AppState>, private route: ActivatedRoute,
              private formBuilder: UntypedFormBuilder, private readonly translate: TranslateService,
              private router: Router) {
    this.getState = this.store.select(selectReservationState);
    this.dateFormat = this.translate.currentLang;
    this.endDate = getNowTimeZone();
    this.startDate = getNowTimeZone();
    this.endTime.setValue(getTime(this.endDate, this.translate.currentLang));
    this.price = new Price();
    this.treatment.valueChanges.subscribe(value => {
      if (value) {
        this.price = newPrice(this.price, value.price, this.reservation?.treatment?.discountCustomer);
      }
    });
    this.isDashboard = this.router.getCurrentNavigation()?.extras?.state?.data?.isDashboard;
  }

  get complete(): void {
    if (!this.isValid) {
      const title = this.translate.instant('COMMON.COMPLETE.TITLE');
      const content = this.translate.instant('COMMON.COMPLETE.CONTENT');
      const dialogRef = this.dialog.open(DialogComponent, {
        data: { title, content, value: this.reservation }
      });

      dialogRef.afterClosed().subscribe(event => {
        if (event) {
          this.completeReservation();
        }
      });
      return;
    } else {
      return this.completeReservation();
    }
  }

  ngOnInit(): void {
    this.createForm();
    this.subscribe();
    this.route.params.subscribe(routeParams => {
      this.reservationId = routeParams.id;
      this.roomId = routeParams.roomId;
      this.customerId = routeParams.customerId;
      this.getReservation();
      this.getTreatments();
    });
    this.createFilters();
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }

  displayFnGroup = (group: ITreatmentGroup): string => group ? `${ group.name }` : ''

  displayFnTreatment = (treatment: ITreatment): string => treatment ? `${ treatment.name }` : '';

  displayFnColor = (color?: IColorAll): string => color ? `${ color.name }` : '';

  keyDownHandler = (event: any, form: UntypedFormControl): void => {
    if (event.code === 'Backspace') {
      form.setValue('');
    }
  }

  onChange = (options: MatListOption[]): void => {
    this.additionalSelected = options.map(o => o.value);
    this.price = newAdditional(this.price, this.additionalSelected, this.reservation?.treatment?.discountCustomer);
    this.setPaymentType();
  }

  isSelected = (it: IAdditionalAll): boolean => this.additionalSelected.filter(el => el.id === it.id).length > 0

  timeChange = ($event: string, date: Date): void => {
    const time = getTimeNumber($event);
    date.setHours(time?.hour || 0, time?.minute || 0, 0);
    this.setAppointmentDuration();
  }

  onExtrasChanges = (extras: IExtras[]): void => {
    this.currentExtraData = extras;
    let extrasTotal = 0;
    if (extras.length) {
      extrasTotal = extras.map(a => a.price).reduce((p, c) => p + c);
    }
    this.price = newExtra(this.price, extrasTotal, this.reservation?.treatment?.discountCustomer);
  }

  onSplitChanges = (split: IExtras[]): void => {
    this.currentSplitData = split;
  }

  splitChange = () => {
    this.split = !this.split;
    if (this.split) {
      const totalSplit = this.currentSplitData?.map(t => t.price).reduce((acc, value) => acc + value, 0) || 0;
      if (totalSplit !== this.price.toPaid) {
        this.isValidSplit = false;
      }
    }
  }

  private setAppointmentDuration = (): void => {
    if (this.startDate && this.endDate) {
      this.totalTime = getDiffTime(newDateTimestamp(this.endDate), newDateTimestamp(this.startDate));
    }
  }

  private createForm = (): void => {
    this.form = this.formBuilder.group({
      group: this.group,
      treatment: this.treatment,
      type: this.type,
      transfer: this.transfer,
      startTime: this.startTime,
      endTime: this.endTime,
      formFields: this.formBuilder.array([])
    });
    this.valueChange();
  }

  private valueChange = (): void => {
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
      this.colors = value.colors;
      this.color.setValue(null);
      this.getAdditionalList(value.id);
    });
    this.treatment.valueChanges.subscribe(value => {
      if (value) {
        this.price = newPrice(this.price, value.price, this.reservation?.treatment?.discountCustomer);
        this.setPaymentType();
      }
    });
  }

  private createFilters = (): void => {
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
    this.filteredColor = this.color.valueChanges.pipe(
      startWith(''),
      map(value => typeof value === 'string' ? value : value ? value.name : ''),
      map(
        name => name ? this.filterColor(name) : (this.colors ? this.colors.slice() : this.colors))
    );
  }

  private getTreatments = (): void => {
    if (this.roomId) {
      this.store.dispatch(
        new fromActionsReservation.GetAllTreatments({ roomId: this.roomId, customerId: this.customerId })
      );
    }
  }

  private getAdditionalList = (groupId: string): void => {
    if (this.groupId !== groupId && this.roomId) {
      this.groupId = groupId;
      this.store.dispatch(
        new fromActionsReservation.GetAllAdditional({ roomId: this.roomId, groupId })
      );
    }
  }

  private filterGroup = (name: string): IGroupService[] | undefined => this.groups?.filter(
    option => option.name?.toLowerCase().indexOf(name.toLowerCase()) === 0);

  private filterTreatment = (name: string): IService[] | undefined => this.treatments?.filter(
    option => option.name?.toLowerCase().indexOf(name.toLowerCase()) === 0);

  private filterColor = (name: string): IColorAll[] | undefined => this.colors?.filter(
    option => option?.name?.toLowerCase().indexOf(name.toLowerCase()) === 0);

  private completeReservation = (): void => {
    if (this.reservation) {
      this.store.dispatch(
        new fromActionsReservation.Complete({
          reservationId: this.reservation.id,
          complete: {
            treatmentId: valueChange(this.treatment.value.id, this.reservation?.treatment.key),
            paymentType: this.type.value || PaymentType.account,
            additionalIds: this.additionalSelected.map(additional => additional.id),
            transfer: this.transfer.value,
            color: this.color.value?.id,
            startDateTime: this.startDate.toLocaleString(API_LOCALE),
            endDateTime: this.endDate.toLocaleString(API_LOCALE),
            extras: this.currentExtraData,
            split: this.currentSplitData
          },
          isDashboard: this.isDashboard
        })
      );
    }
  }

  private getReservation = (): void => {
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

  private setPaymentType = (): void => {
    if (this.price.isPaid) {
      this.type.setValue(undefined);
    } else {
      this.type.setValue(PaymentType.transfer);
    }
  }

  private subscribe = (): void => {
    this.subscription = this.getState.subscribe(state => {
      this.payments = state.payments;
      if (!this.reservation && state.selected) {
        const reservation: IReservationAll = state.selected;
        this.startDate = newDateTimestamp(reservation.startedTimestamp, reservation.room.timeZone);
        this.startTime.setValue(getTime(this.startDate, this.translate.currentLang));
        const endDate = newDateTimestamp(reservation.timestamp, reservation.room.timeZone);
        this.endDate.setFullYear(endDate.getFullYear(), endDate.getMonth(), endDate.getDate());
        this.price = getPrice(reservation, this.payments);
        this.treatment.setValue(reservation.treatment);
        this.additionalSelected = reservation.additional?.map(ad => Object.assign({}, ad, { id: ad.key })) || [];
        this.types = [...reservation.room.paymentTypes, PaymentType.transfer];
        this.reservation = reservation;
        this.setAppointmentDuration();
      }
      this.price = addPayment(this.price, this.payments);
      this.additionalList = state.additional;
      if (this.additionalSelected?.length && this.additionalList?.length) {
        const selectIds = this.additionalSelected?.map(value => value.id);
        const newList = this.additionalList.filter(al => selectIds.includes(al.id));
        if (newList.length !== this.additionalSelected.length) {
          this.additionalSelected = newList;
          this.price = newAdditional(
            this.price, this.additionalSelected, this.reservation?.treatment?.discountCustomer
          );
        }
      }
      if (state.treatmentDiscount && !this.groupId) {
        if (state.treatmentDiscount.treatments && this.reservation) {
          const treatmentId = this.reservation.treatment.key;
          this.groups = Array.from(
            createTreatmentGroupService(
              new Map<string, IGroupService>(), state.treatmentDiscount.treatments, this.reservation.room.currency.code
            ).values()
          );
          this.group.setValue(this.groups?.find(group => {
            if (group.treatments?.find(treatment => treatment.id === treatmentId)) {
              return group;
            }
            return undefined;
          }));
        }
      }
      this.setPaymentType();
    });
  }
}
