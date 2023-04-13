import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import * as fromActionsPayment from "../../../../store/payment.actions";
import { ActivatedRoute } from "@angular/router";
import { Store } from "@ngrx/store";
import { AppState, selectPaymentState } from "../../../../store/app.states";
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators } from "@angular/forms";
import { Observable, Subscription } from "rxjs";
import { requireMatch } from "../../../../util/validators";
import { banks, IBank } from "../../../../interfaces/bank";
import { map, startWith } from "rxjs/operators";
import { BreakpointObserver, Breakpoints } from "@angular/cdk/layout";
import { getBackIndex, getPrice, getStep } from "../../../../util/helper";
import { IStep, Step } from "../../../../interfaces/step";
import { MatStepper } from "@angular/material/stepper";
import { IPaymentAll } from "../../../../interfaces/payment";
import { IPrice } from "../../../../interfaces/treatment";

@Component({
  selector: 'app-option',
  templateUrl: './option.component.html',
  styleUrls: ['./option.component.scss']
})
export class OptionComponent implements OnInit, OnDestroy {
  @ViewChild('stepper') myStepper!: MatStepper;

  errors: any = [];
  smallScreen?: boolean;

  typeForm!: UntypedFormGroup;
  types?: string[]
  type: UntypedFormControl = new UntypedFormControl('', [
    Validators.required
  ]);

  bankList?: IBank[] = banks();
  filteredBank?: Observable<IBank[] | undefined>;
  bank: UntypedFormControl = new UntypedFormControl('');
  percentage: UntypedFormControl = new UntypedFormControl('');

  payment?: IPaymentAll;

  price?: IPrice;

  private readonly steps: IStep[];

  private getState: Observable<any>;
  private subscription?: Subscription;
  private reservationId: any;

  private static goNext(step: IStep): void {
    const nextStep = step.next;
    if (nextStep && !nextStep.enable) {
      nextStep.call();
    }
    return;
  }

  get pay(): void {
    if (this.payment?.link) {
      this.store.dispatch(
        new fromActionsPayment.PaymentSend(this.payment.link)
      );
    }
    return;
  }

  get back(): void {
    this.myStepper.selectedIndex = getBackIndex(this.steps, this.myStepper.selectedIndex);
    return;
  }

  get callStepTwo(): void {
    if (this.typeForm.invalid) {
      return;
    }

    const payload = {
      reservationId: this.reservationId,
      payment : {
        type: this.type.value,
        percentage: this.percentage.value,
        bic: this.bank.value.bic
      }
    }
    this.store.dispatch(
      new fromActionsPayment.PaymentCreate(payload)
    );
    return this.completeAndNext();
  }

  constructor(private route: ActivatedRoute, private store: Store<AppState>, private formBuilder: UntypedFormBuilder,
              private breakpointObserver: BreakpointObserver) {
    this.getState = this.store.select(selectPaymentState);
    breakpointObserver.observe([Breakpoints.XSmall, Breakpoints.Small])
      .subscribe(result => this.smallScreen = result.matches);
    const preview = new Step(1, 'preview', () => this.pay);
    const type = new Step(0, 'type', () => this.callStepTwo, preview);
    this.steps = [type, preview];
  }

  ngOnInit(): void {
    this.route.queryParamMap.subscribe(routeQuery => {
      this.types = routeQuery.getAll('types');
    })
    this.route.params.subscribe(routeParams => {
      this.reservationId = routeParams.id;
    });
    this.createForm();
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

  displayFnBank(bank: IBank): string {
    return bank ? `${ bank.name }` : '';
  }

  getStepCompleted(index: number): boolean {
    const step = getStep(this.steps, index);
    return !!step?.completed;
  }

  getStepName(index: number): string {
    const step = getStep(this.steps, index);
    return step ? step.name : '';
  }

  private subscribe() {
    this.subscription = this.getState.subscribe(state => {
      if (state.selected && state.selected[0].reservation) {
        this.price = getPrice(state.selected[0].reservation, state.selected);
        if (this.price?.totalPaid > 0) {
          this.percentage.setValue('TOTAL');
        }
      }
      this.payment = state.data;
    });
  }

  private createForm(): void {
    this.typeForm = this.formBuilder.group({
      type: this.type,
      bank: this.bank,
      percentage: this.percentage
    });

    this.typeForm.valueChanges.subscribe(value => {
      if (value?.type === 'IDEAL') {
        this.bank.setValidators([Validators.required, requireMatch]);
      }
      this.percentage.setValidators([Validators.required]);
    })

    this.filteredBank = this.bank.valueChanges.pipe(startWith(''),
      map(value => typeof value === 'string' ? value : value.name),
      map(name => name ? this.filterBank(name) : this.bankList ? this.bankList.slice() : this.bankList));
  }

  private filterBank(name: string): IBank[] | undefined {
    const filterValue = name.toLowerCase();

    return this.bankList?.filter(option => option.name?.toLowerCase().indexOf(filterValue) === 0);
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

  private getPaymentFindByReservationId() {
    this.store.dispatch(
      new fromActionsPayment.PaymentFindByReservationId({ reservationId: this.reservationId })
    )
  }

  private clean(): void {
    this.store.dispatch(
      new fromActionsPayment.Clean()
    );
  }
}
