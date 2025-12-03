import { ChangeDetectionStrategy, Component, computed, effect, inject, signal, viewChild } from '@angular/core';
import {
  createPaymentLinkByReservationId,
  getPaymentByResourceId,
  paymentOptions,
} from '../../../store/payment.actions';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { FormGroup, NonNullableFormBuilder } from '@angular/forms';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { getPrice, newPercentage } from '../../../util/helper';
import { completeAndNext, getBackIndex, getStepCall, getStepCompleted, getStepName } from '../../../util/step';
import { IStep, Step } from '../../../interfaces/step';
import { MatStepper } from '@angular/material/stepper';
import {
  getPaymentOptions,
  getPayNlOptions,
  IPaymentOption,
  PaymentPercentage,
  PaymentType,
} from '../../../interfaces/payment';
import { IPrice, Price } from '../../../interfaces/treatment';
import { IReservationAll, IReservationPayment } from '../../../interfaces/reservation';
import { TranslateService } from '@ngx-translate/core';
import { StepperSelectionEvent } from '@angular/cdk/stepper';
import { SharedModule } from '../../../shared/shared.module';
import { BankComponent, BankForm } from '../../../shared/bank/bank.component';
import { DurationTimePipe } from '../../../pipes/durationTime.pipe';
import { PaymentPreviewComponent } from '../../../shared/payment-preview/payment-preview.component';
import { BackButtonDirective } from '../../../directives/back-button.directive';
import { PaymentState } from '../../../store/reducers/payment.reducers';
import { ReservationState } from '../../../store/reducers/reservation.reducers';
import { getCurrentReservationIdPipe } from '../../../store/selectors/reservation.selectors';
import { toSignal } from '@angular/core/rxjs-interop';
import { getPaymentOptionsPipe, getPaymentsPipe } from '../../../store/selectors/payment.selectors';

@Component({
  selector: 'app-option',
  templateUrl: './option.component.html',
  styleUrls: ['./option.component.scss'],
  imports: [SharedModule, BankComponent, DurationTimePipe, PaymentPreviewComponent, BackButtonDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OptionComponent {
  private readonly store: Store<PaymentState | ReservationState> = inject(Store<PaymentState | ReservationState>);
  private readonly formBuilder: NonNullableFormBuilder = inject(NonNullableFormBuilder);
  private readonly breakpointObserver: BreakpointObserver = inject(BreakpointObserver);
  private readonly router: Router = inject(Router);
  private readonly translate: TranslateService = inject(TranslateService);

  private reservationId$ = this.store.pipe(getCurrentReservationIdPipe);
  private paymentOptions$ = this.store.pipe(getPaymentOptionsPipe);
  private payments$ = this.store.pipe(getPaymentsPipe);
  private breakpointObserver$ = this.breakpointObserver.observe([Breakpoints.XSmall, Breakpoints.Small]);

  private reservationIdSignal = toSignal(this.reservationId$);
  private paymentOptionsSignal = toSignal(this.paymentOptions$);
  private breakpointsSignal = toSignal(
    this.breakpointObserver$, {
      initialValue: {
        matches: false,
        breakpoints: {
          [Breakpoints.XSmall]: false,
          [Breakpoints.Small]: false,
        },
      },
    },
  );
  private paymentsSignal = toSignal(this.payments$);

  private stepper = viewChild.required(MatStepper);

  form: FormGroup<BankForm> = this.formBuilder.group<BankForm>({
    type: this.formBuilder.control(undefined),
    bank: this.formBuilder.control(undefined),
    percentage: this.formBuilder.control(undefined),
  });

  options = signal<IPaymentOption[] | undefined>(undefined);

  smallScreen = computed(() => this.breakpointsSignal()?.matches);

  reservation = signal<IReservationAll | undefined>(undefined);
  price = signal<IPrice>(new Price());
  first = true;

  private readonly steps: IStep[];

  private reservationId?: string;
  private readonly language: string = this.translate.currentLang;

  constructor() {
    const preview = new Step(1, 'preview', () => this.pay());
    const type = new Step(0, 'type', (goNext: boolean) => this.callStepTwo(goNext), preview);
    this.steps = [type, preview];
    effect(() => {
      const id = this.reservationIdSignal();
      if (id) {
        this.store.dispatch(getPaymentByResourceId({ id, path: 'reservation' }));
        this.reservationId = id;
      }
    });

    effect(() => {
      const payments = this.paymentsSignal();
      if (payments) {
        const reservation = payments[0]?.reservation;
        if (reservation) {
          const types = reservation.room.paymentTypes.filter(
            (p: PaymentType) => ![PaymentType.cash, PaymentType.transfer].includes(p));
          if (types?.includes(PaymentType.paynl)) {
            this.store.dispatch(paymentOptions());
          } else {
            this.options.set(getPaymentOptions(this.translate, types));
          }
          const price = getPrice(reservation, payments);
          this.price.set(price);
          if (price.isPaid) {
            this.router.navigate(['/', this.language, 'reservation', reservation.id]);
          } else {
            if (reservation.state !== 'CANCELLED_PAYMENT_REQUIRED') {
              this.first = price.totalPaid === 0;
            } else {
              this.price.set(new Price(0, 0, 0, 0, 0, payments[payments.length - 1].amount));
            }
            this.reservation.set(reservation);
          }
        }
      }
    });

    effect(() => {
      const options = this.paymentOptionsSignal();
      if (options) {
        this.options.set(getPayNlOptions(options));
      }
    });
  }

  get getForm(): BankForm {
    return this.form.controls;
  }

  get professionalName(): string {
    const displayName = this.reservation()?.professional?.displayName;
    return displayName ? displayName : '';
  }

  private get myStepper() {
    return this.stepper();
  }

  back() {
    this.myStepper.selectedIndex = getBackIndex(this.steps, this.myStepper.selectedIndex);
  }

  pay() {
    const option = this.getForm.type?.value;
    if (!option) {
      return;
    }
    const type = option.type;
    const paymentOptionId = option.bic;
    const percentage = this.getForm.percentage?.value || PaymentPercentage.total;
    const payment: IReservationPayment = { type, paymentOptionId, percentage, bic: undefined };
    if (option.subTypes.length) {
      payment.bic = this.getForm.bank?.value?.bic;
    }
    const reservationId = this.reservationId!;
    this.store.dispatch(createPaymentLinkByReservationId({ reservationId, payment }));
  }

  triggerClick = (event: StepperSelectionEvent): void => getStepCall(this.steps, event.selectedIndex - 1);

  callStepTwo = (goNext: boolean): void => {
    if (this.form.invalid) {
      return;
    }

    completeAndNext(this.steps, this.myStepper, goNext);
  };

  getStepName = (index: number): string => getStepName(this.steps, index);

  getStepCompleted = (index: number): boolean => getStepCompleted(this.steps, index);

  getPercentage = (percentage: number): void => {
    this.price.set(newPercentage(this.price(), percentage));
  };
}
