import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import * as fromActionsPayment from '../../../../store/payment.actions';
import { ActivatedRoute, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { AppState, selectPaymentState } from '../../../../store/app.states';
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup } from '@angular/forms';
import { Observable, Subscription } from 'rxjs';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { getBackIndex, getPrice, getStep, getUserName, newPercentage } from '../../../../util/helper';
import { IStep, Step } from '../../../../interfaces/step';
import { MatStepper } from '@angular/material/stepper';
import { getPaymentOptions, getPayNlOptions, IPaymentOption, PaymentType } from '../../../../interfaces/payment';
import { IPrice, Price } from '../../../../interfaces/treatment';
import { IReservationAll } from '../../../../interfaces/reservation';
import * as fromActionsReservation from '../../../../store/reservation.actions';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-option',
  templateUrl: './option.component.html',
  styleUrls: ['./option.component.scss']
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

  constructor(private route: ActivatedRoute, private store: Store<AppState>, private formBuilder: UntypedFormBuilder,
              private breakpointObserver: BreakpointObserver, private router: Router, private translate: TranslateService) {
    this.getState = this.store.select(selectPaymentState);
    breakpointObserver.observe([Breakpoints.XSmall, Breakpoints.Small])
      .subscribe(result => this.smallScreen = result.matches);
    const preview = new Step(1, 'preview', () => this.pay);
    const type = new Step(0, 'type', () => this.callStepTwo, preview);
    this.steps = [type, preview];
    this.typeForm = this.formBuilder.group({
      type: new UntypedFormControl(undefined),
      bank: new UntypedFormControl('')
    });
    this.price = new Price();
  }

  get back(): void {
    this.myStepper.selectedIndex = getBackIndex(this.steps, this.myStepper.selectedIndex);
    return;
  }

  get callStepTwo(): void {
    if (this.typeForm.invalid) {
      return;
    }

    return this.completeAndNext();
  }

  get pay(): void {
    const option: IPaymentOption = this.typeForm.get('type')?.value;
    const type = option.type;
    const paymentOptionId = option.paymentId;
    const percentage = this.typeForm.get('percentage')?.value || 'TOTAL';
    const payload = {
      reservationId: this.reservationId,
      payment: { type, paymentOptionId, percentage, bic: undefined }
    };
    if (option.subTypes.length) {
      payload.payment.bic = this.typeForm.get('bank')?.value?.paymentId;
    }
    return this.store.dispatch(
      new fromActionsPayment.PaymentCreate(payload)
    );
  }

  get professionalName(): string {
    return getUserName(this.reservation?.professional);
  }

  private static goNext(step: IStep): void {
    const nextStep = step.next;
    if (nextStep && !nextStep.enable) {
      nextStep.call();
    }
    return;
  }

  ngOnInit(): void {
    this.route.params.subscribe(routeParams => {
      this.reservationId = routeParams.id;
    });
    this.subscribe();
    this.clean();
    this.getPaymentFindByReservationId();
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }

  keyDownHandler(event: any, form: UntypedFormControl): void {
    if (event.code === 'Backspace') {
      form.setValue('');
    }
  }

  getStepCompleted(index: number): boolean {
    const step = getStep(this.steps, index);
    return !!step?.completed;
  }

  getStepName(index: number): string {
    const step = getStep(this.steps, index);
    return step ? step.name : '';
  }

  getPercentage(percentage: number): void {
    this.price = newPercentage(this.price, percentage);
  }

  private subscribe(): void {
    this.subscription = this.getState.subscribe(state => {
      if (state.selected && (!this.options || this.options.length === 0)) {
        const reservation = state.selected[0].reservation;
        if (reservation) {
          const types = reservation.room.paymentTypes.filter((p: PaymentType) => ![PaymentType.cash, PaymentType.transfer].includes(p));
          if (types?.includes(PaymentType.paynl)) {
            this.getOptions();
          } else {
            this.options = getPaymentOptions(this.translate, types);
          }
          this.price = getPrice(reservation, state.selected);
          if (this.price.toPaid === 0) {
            this.router.navigate(['/reservation', reservation.id]);
          } else {
            if (reservation.state !== 'CANCELLED_PAYMENT_REQUIRED') {
              if (this.price?.totalPaid === 0) {
                this.typeForm = this.formBuilder.group({
                  bank: new UntypedFormControl(''),
                  percentage: new UntypedFormControl(undefined),
                  type: new UntypedFormControl(undefined)
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
  }

  private completeStep(step: IStep): void {
    this.myStepper.next();
    step.completed = true;
    this.steps[step.order] = step;
  }

  private completeAndNext(): void {
    setTimeout(() => {
      const step = getStep(this.steps, this.myStepper.selectedIndex);
      if (step) {
        this.completeStep(step);
        OptionComponent.goNext(step);
      }
    }, 100);
  }

  private getPaymentFindByReservationId(): void {
    this.store.dispatch(
      new fromActionsPayment.PaymentFindByReservationId({ reservationId: this.reservationId })
    );
    this.store.dispatch(
      new fromActionsReservation.ReservationFind({ id: this.reservationId })
    );
  }

  private getOptions(): void {
    this.store.dispatch(
      new fromActionsPayment.PaymentOptions()
    );
  }

  private clean(): void {
    this.store.dispatch(
      new fromActionsPayment.Clean()
    );
  }
}
