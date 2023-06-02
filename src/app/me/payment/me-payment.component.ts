import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, UntypedFormControl, UntypedFormGroup } from '@angular/forms';
import { AppState, selectPaymentState } from '../../store/app.states';
import { Observable, Subscription } from 'rxjs';
import { Store } from '@ngrx/store';
import { ActivatedRoute } from '@angular/router';
import { AngularFireAnalytics } from '@angular/fire/compat/analytics';
import * as fromActionsPayment from '../../store/payment.actions';
import { IPaymentAll } from '../../interfaces/payment';

@Component({
  selector: 'app-me-payment',
  templateUrl: './me-payment.component.html',
  styleUrls: ['./me-payment.component.scss']
})
export class MePaymentComponent implements OnInit, OnDestroy {

  typeForm: UntypedFormGroup;
  types?: string[];

  payment?: IPaymentAll;

  private getState: Observable<any>;
  private subscription?: Subscription;

  constructor(private store: Store<AppState>, private formBuilder: FormBuilder, private route: ActivatedRoute,
              private analytic: AngularFireAnalytics) {
    this.getState = this.store.select(selectPaymentState);
    this.typeForm = this.formBuilder.group({
      type: new UntypedFormControl(undefined),
      bank: new UntypedFormControl(''),
    });
  }

  get update(): void {
    if (this.typeForm.invalid) {
      return;
    }

    const type = this.typeForm.get('type')?.value;
    const payload = {
      id: this.payment?.id,
      payment: {
        type,
        bic: this.typeForm.get('bank')?.value?.id
      }
    };

    return this.store.dispatch(
      new fromActionsPayment.PaymentUpdateLink(payload)
    );
  }

  ngOnInit(): void {
    this.subscribe();
    this.clean();
    this.route.params.subscribe(routeParams => {
      const paymentId = routeParams.id;
      if (paymentId) {
        this.analytic.logEvent('screen_view', {
          // eslint-disable-next-line @typescript-eslint/naming-convention
          firebase_screen: `Customer missing payment ${ paymentId }`,
          // eslint-disable-next-line @typescript-eslint/naming-convention
          firebase_screen_class: 'MePaymentComponent'
        });
        this.getPayment(paymentId);
      }
    });
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }

  private subscribe(): void {
    this.subscription = this.getState.subscribe(state => {
      this.payment = state.selected;
      const reservation = this.payment?.reservation;
      this.types = reservation?.room?.paymentTypes?.filter((p) => !['CASH', 'TRANSFER'].includes(p));
    });
  }

  private getPayment(paymentId: string): void {
    this.store.dispatch(
      new fromActionsPayment.PaymentFind(paymentId)
    );
  }

  private clean(): void {
    this.store.dispatch(
      new fromActionsPayment.Clean()
    );
  }
}
