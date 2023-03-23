import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import * as fromActionsPayment from "../../../../store/payment.actions";
import { ActivatedRoute } from "@angular/router";
import { Store } from "@ngrx/store";
import { AppState, selectPaymentState } from "../../../../store/app.states";
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators } from "@angular/forms";
import { Observable, Subscription } from "rxjs";
import { requireMatch } from "../../../../util/validators";
import { IBank } from "../../../../interfaces/bank";
import { map, startWith } from "rxjs/operators";
import { BreakpointObserver, Breakpoints } from "@angular/cdk/layout";
import { getBackIndex, getStep } from "../../../../util/helper";
import { IStep, Step } from "../../../../interfaces/step";
import { MatStepper } from "@angular/material/stepper";
import { IPaymentAll, PaymentType } from "../../../../interfaces/payment";

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

  bankList?: IBank[];
  filteredBank?: Observable<IBank[] | undefined>;
  bank: UntypedFormControl = new UntypedFormControl('');

  payment?: IPaymentAll;

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
    this.store.dispatch(
      new fromActionsPayment.PaymentCreate({
        reservationId: this.reservationId,
        type: this.type.value,
        percentage: 'TOTAL'
      })
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
    // console.log(1)
    // loadScript({
    //   'client-id': environment.paypalClientId,
    //   'components': 'buttons,payment-fields,marks,funding-eligibility',
    //   'enable-funding': 'ideal',
    //   'currency': "EUR"
    // }).then((paypal) => {
    //   if (paypal) {
    //     // @ts-ignore
    //     paypal.Marks({
    //       fundingSource: paypal?.FUNDING?.IDEAL
    //     }).render('#ideal-mark');
    //
    //     // @ts-ignore
    //     paypal.PaymentFields({
    //       fundingSource: paypal?.FUNDING?.IDEAL,
    //       style: {
    //         variables: {
    //           fontFamily: "'Helvetica Neue', Arial, sans-serif",
    //           fontSizeBase: "0.9375rem",
    //           fontSizeSm: "0.93rem",
    //           fontSizeM: "0.93rem",
    //           fontSizeLg: "1.0625rem",
    //           textColor: "#2c2e2f",
    //           colorTextPlaceholder: "#2c2e2f",
    //           colorBackground: "#fff",
    //           colorInfo: "#0dcaf0",
    //           colorDanger: "#d20000",
    //           borderRadius: "0.2rem",
    //           borderColor: "#dfe1e5",
    //           borderWidth: "1px",
    //           borderFocusColor: "black",
    //           spacingUnit: "10px",
    //         },
    //         rules: {
    //           ".Input": {},
    //           ".Input:hover": {},
    //           ".Input:focus": {
    //           },
    //           ".Input:active": {},
    //           ".Input--invalid": {},
    //           ".Label": {},
    //           ".Error": {
    //             marginTop: '2px',
    //           },
    //         },
    //       },
    //       fields: {
    //         name: {
    //           value: "",
    //         },
    //       },
    //     })
    //       .render("#ideal-fields");
    //
    //     // @ts-ignore
    //
    //     paypal.Buttons({
    //       fundingSource: paypal.FUNDING?.IDEAL,
    //       style: {
    //         label: "pay",
    //       },
    //       createOrder(data, actions) {
    //         const order = {
    //           purchase_units: [
    //             {
    //               amount: {
    //                 currency_code: "EUR",
    //                 value: "49.99",
    //               },
    //             },
    //           ],
    //         };
    //         return actions.order.create(order);
    //       },
    //       // @ts-ignore
    //       onApprove(data, actions) {
    //         fetch(`/capture/${data.orderID}`, {
    //           method: "post",
    //         })
    //           .then((res) => res.json())
    //           .then((data) => {
    //             console.log(data);
    //             // swal(
    //             //   "Order Captured!",
    //             //   `Id: ${data.id}, ${Object.keys(data.payment_source)[0]}, ${
    //             //     data.purchase_units[0].payments.captures[0].amount.currency_code
    //             //   } ${data.purchase_units[0].payments.captures[0].amount.value}`,
    //             //   "success"
    //             // );
    //           })
    //           .catch(console.error);
    //       },
    //       onCancel(data, actions) {
    //         console.log(data);
    //         // swal("Order Canceled", `ID: ${data.orderID}`, "warning");
    //       },
    //       onError(err) {
    //         console.error(err);
    //       },
    //     }).render("#ideal-btn");
    //   } else {
    //     console.error("PayPal is null")
    //   }
    // })
    //   .catch((err) => {
    //     console.error("failed to load the PayPal JS SDK script", err);
    //   });
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
    this.getBanks();
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
      console.log(state)
      this.bankList = state.banks
      this.payment = state.data;
    });
  }

  private createForm(): void {
    this.typeForm = this.formBuilder.group({
      type: this.type,
      bank: this.bank
    });

    this.typeForm.valueChanges.subscribe(value => {
      if (value?.type === 'IDEAL') {
        this.bank.setValidators([Validators.required, requireMatch])
      }
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

  private getBanks() {
    this.store.dispatch(
      new fromActionsPayment.PaymentBankList(PaymentType.ideal)
    )
  }

  private clean(): void {
    this.store.dispatch(
      new fromActionsPayment.Clean()
    );
  }
}
