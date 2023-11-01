import { AfterViewInit, Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable, Subscription } from 'rxjs';
import { AppState, selectPaymentState } from '../../../store/app.states';
import { Store } from '@ngrx/store';
import * as fromActionsPayment from '../../../store/payment.actions';
import { TranslateService } from '@ngx-translate/core';
import { PaymentStatus, PaymentType } from '../../../interfaces/payment';

@Component({
  selector: 'app-payment-complete',
  templateUrl: './payment-complete.component.html',
  styleUrls: ['./payment-complete.component.scss']
})
export class PaymentCompleteComponent implements OnInit, OnDestroy, AfterViewInit {
  private subscription?: Subscription;
  private getState: Observable<any>;

  private paymentId: any;
  private preferenceId: any;
  private id: any;
  private payerId: any;
  private token: any;
  private reason: any;
  private orderId: any;
  private orderStatusId: any;
  private paymentSessionId: any;
  private path: string | null = 'reservation';

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
      this.id = this.route.snapshot.paramMap.get('id');
      let status = this.route.snapshot.paramMap.get('status');
      this.path = this.route.snapshot.paramMap.get('path');
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
        // this.router.navigate(['me', this.path, this.id, 'payment']);
        return;
      }
      const paymentStatus = new PaymentStatus(this.paymentId, type, referenceId, this.reason);
      this.store.dispatch(
        new fromActionsPayment.PaymentSave({ id: this.id, path: this.path, status, paymentStatus })
      );
    }, 500);
  }

  private subscribe(): void {
    this.subscription = this.getState.subscribe(state => {
      if (state.paths) {
        this.router.navigate(state.paths);
      } else if (state.subErrors) {
        this.router.navigate(['me', this.path, this.id, 'payment']);
      }
    });
  }
}
