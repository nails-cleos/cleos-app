import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import * as fromActionsPayment from '../../../store/payment.actions';
import { ActivatedRoute, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { AppState, selectPaymentState } from '../../../store/app.states';
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup } from '@angular/forms';
import { Observable, Subscription } from 'rxjs';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { getPrice, newPercentage } from '../../../util/helper';
import { completeAndNext, getBackIndex, getStepCall, getStepCompleted, getStepName } from '../../../util/step';
import { IStep, Step } from '../../../interfaces/step';
import { MatStepper } from '@angular/material/stepper';
import { getPaymentOptions, getPayNlOptions, IPaymentOption, PaymentType } from '../../../interfaces/payment';
import { IPrice, Price } from '../../../interfaces/treatment';
import { IReservationAll, IReservationPayment } from '../../../interfaces/reservation';
import * as fromActionsReservation from '../../../store/reservation.actions';
import { TranslateService } from '@ngx-translate/core';
import { StepperSelectionEvent } from '@angular/cdk/stepper';
import { SharedModule } from '../../../shared/shared.module';
import { BankComponent } from '../../../shared/bank/bank.component';
import { DurationTimePipe } from '../../../pipes/durationTime.pipe';
import { PaymentPreviewComponent } from '../../../shared/payment-preview/payment-preview.component';
import { BackButtonDirective } from '../../../directives/back-button.directive';

@Component({
  selector: 'app-option',
  templateUrl: './option.component.html',
  styleUrls: ['./option.component.scss'],
  imports: [SharedModule, BankComponent, DurationTimePipe, PaymentPreviewComponent, BackButtonDirective],
})
export class OptionComponent implements OnInit, OnDestroy {
  @ViewChild('stepper') myStepper!: MatStepper;

  errors: any = [];
  smallScreen?: boolean;

  typeForm: UntypedFormGroup;
  options?: IPaymentOption[];

  reservation?: IReservationAll;

  price: IPrice;

  first = true;

  private readonly steps: IStep[];

  private getState: Observable<any>;
  private subscription?: Subscription;
  private reservationId: any;
  private readonly language: string;

  constructor(private route: ActivatedRoute, private store: Store<AppState>, private formBuilder: UntypedFormBuilder,
    breakpointObserver: BreakpointObserver, private router: Router, private translate: TranslateService) {
    this.getState = this.store.select(selectPaymentState);
    breakpointObserver.observe([Breakpoints.XSmall, Breakpoints.Small])
      .subscribe(result => this.smallScreen = result.matches);
    const preview = new Step(1, 'preview', () => this.pay);
    const type = new Step(0, 'type', (goNext: boolean) => this.callStepTwo(goNext), preview);
    this.steps = [type, preview];
    this.typeForm = this.formBuilder.group({
      type: new UntypedFormControl(undefined),
      bank: new UntypedFormControl(''),
    });
    this.price = new Price();
    this.language = this.translate.currentLang;
  }

  get back(): void {
    this.myStepper.selectedIndex = getBackIndex(this.steps, this.myStepper.selectedIndex);
    return;
  }

  get pay(): void {
    const option: IPaymentOption = this.typeForm.get('type')?.value;
    const type = option.type;
    const paymentOptionId = option.bic;
    const percentage = this.typeForm.get('percentage')?.value || 'TOTAL';
    const payment: IReservationPayment = { type, paymentOptionId, percentage, bic: undefined };
    if (option.subTypes.length) {
      payment.bic = this.typeForm.get('bank')?.value?.bic;
    }
    return this.store.dispatch(
      new fromActionsPayment.CreatePaymentLinkByReservationId(this.reservationId, payment),
    );
  }

  get professionalName(): string {
    const displayName = this.reservation?.professional?.displayName;
    return displayName ? displayName : '';
  }

  ngOnInit(): void {
    this.subscribe();
    this.clean();
    this.route.params.subscribe(routeParams => {
      this.reservationId = routeParams.id;
      this.getPaymentFindByReservationId();
    });
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }

  triggerClick = (event: StepperSelectionEvent): void => getStepCall(this.steps, event.selectedIndex - 1);

  callStepTwo = (goNext: boolean): void => {
    if (this.typeForm.invalid) {
      return;
    }

    completeAndNext(this.steps, this.myStepper, goNext);
  };

  getStepName = (index: number): string => getStepName(this.steps, index);

  getStepCompleted = (index: number): boolean => getStepCompleted(this.steps, index);

  getPercentage = (percentage: number): void => {
    this.price = newPercentage(this.price, percentage);
  };

  private getPaymentFindByReservationId = (): void => {
    this.store.dispatch(
      new fromActionsPayment.GetPaymentByResourceId(this.reservationId, 'reservation'),
    );
    this.store.dispatch(
      new fromActionsReservation.GetReservation(this.reservationId),
    );
  };

  private getOptions = (): void => this.store.dispatch(new fromActionsPayment.PaymentOptions());

  private clean = (): void => this.store.dispatch(new fromActionsPayment.Clean());

  private subscribe = (): void => {
    this.subscription = this.getState.subscribe((state) => {
      if (state.selected) {
        const reservation = state.selected[0].reservation;
        if (reservation) {
          if ((!this.options || this.options.length === 0)) {
            const types = reservation.room.paymentTypes.filter(
              (p: PaymentType) => ![PaymentType.cash, PaymentType.transfer].includes(p));
            if (types?.includes(PaymentType.paynl)) {
              this.getOptions();
            } else {
              this.options = getPaymentOptions(this.translate, types);
            }
          }
          this.price = getPrice(reservation, state.selected);
          if (this.price.isPaid) {
            this.router.navigate(['/', this.language, 'reservation', reservation.id]);
          } else {
            if (reservation.state !== 'CANCELLED_PAYMENT_REQUIRED') {
              if (this.price?.totalPaid === 0) {
                this.typeForm = this.formBuilder.group({
                  bank: new UntypedFormControl(''),
                  percentage: new UntypedFormControl(undefined),
                  type: new UntypedFormControl(undefined),
                });
              }
              this.first = this.price.totalPaid === 0;
            } else {
              this.price = new Price(0, 0, 0, 0, 0, state.selected[state.selected.length - 1].amount);
            }
            this.reservation = reservation;
          }
        }
      }
      if (state.data) {
        this.options = getPayNlOptions(state.data);
      }
    });
  };
}
