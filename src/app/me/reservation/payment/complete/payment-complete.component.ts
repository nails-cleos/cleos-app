import { AfterViewInit, Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable, Subscription } from 'rxjs';
import { AppState, selectPaymentState } from '../../../../store/app.states';
import { Store } from '@ngrx/store';
import * as fromActionsPayment from '../../../../store/payment.actions';
import { TranslateService } from '@ngx-translate/core';
import { PaymentStatus, PaymentType } from '../../../../interfaces/payment';

@Component({
  selector: 'app-payment-complete',
  templateUrl: './payment-complete.component.html',
  styleUrls: ['./payment-complete.component.scss']
})
export class PaymentCompleteComponent implements OnInit, OnDestroy, AfterViewInit {
  subscription: Subscription | undefined;
  getState: Observable<any>;

  paymentId: any;
  preferenceId: any;
  reservationId: any;
  payerId: any;
  token: any;
  reason: any;
  private orderId: any;
  private orderStatusId: any;
  private paymentSessionId: any;

  constructor(private route: ActivatedRoute, private router: Router, private store: Store<AppState>,
              private translate: TranslateService) {
    this.getState = this.store.select(selectPaymentState);
    this.route.queryParams.subscribe(params => {
      this.paymentId = params.payment_id || params.paymentId;
      this.preferenceId = params.preference_id;
      this.payerId = params.PayerID;
      this.token = params.token;
      this.reason = params.reason || params.errorcode;
      this.orderId = params.orderId;
      this.orderStatusId = params.orderStatusId;
      this.paymentSessionId = params.paymentSessionId;
    });
  }

  ngOnInit(): void {
    this.subscribe();
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.reservationId = this.route.snapshot.paramMap.get('id');
      let status = this.route.snapshot.paramMap.get('status');
      // TODO analytic payment option
      let type;
      let referenceId;
      if (this.paymentId && this.paymentId !== 'null') {
        if (this.preferenceId && this.preferenceId !== 'null') {
          type = PaymentType.ml;
          referenceId = this.preferenceId;
        } else if (this.payerId && this.paymentId !== 'null') {
          type = PaymentType.paypal;
          referenceId = this.payerId;
        }
      } else if (this.token) {
        type = PaymentType.ideal;
        referenceId = this.token;
      } else if (status === 'status') {
        if (this.orderStatusId === '100') {
          status = 'approved';
        } else if (this.orderStatusId > 0) {
          status = 'pending';
        } else {
          status = 'cancelled';
        }
        type = PaymentType.paynl;
        referenceId = this.orderId;
      }
      if (!type || !referenceId) {
        const message = this.translate.instant('ME.PAYMENT.ERROR', { reason: 'incomplete' });
        this.store.dispatch(
          new fromActionsPayment.PaymentNotComplete({ message })
        );
        this.router.navigate(['me', 'reservation', this.reservationId, 'payment']);
        return;
      }
      const paymentStatus = new PaymentStatus(this.paymentId, type, referenceId, this.reason);
      this.store.dispatch(
        new fromActionsPayment.PaymentSave({ reservationId: this.reservationId, status, paymentStatus })
      );
    }, 500);
  }

  private subscribe(): void {
    this.subscription = this.getState.subscribe(state => {
      if (state.message) {
        this.router.navigate(['reservation', this.reservationId]);
      } else if (state.subErrors) {
        this.router.navigate(['me', 'reservation', this.reservationId, 'payment']);
      }
    });
  }
}
