import { AfterViewInit, Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable, Subscription } from 'rxjs';
import { AppState, selectPaymentState } from '../../../store/app.states';
import { Store } from '@ngrx/store';
import * as fromActionsPayment from '../../../store/payment.actions';
import { TranslateService } from '@ngx-translate/core';

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

  constructor(private route: ActivatedRoute, private router: Router, private store: Store<AppState>,
              private translate: TranslateService) {
    this.getState = this.store.select(selectPaymentState);
    this.route.queryParams.subscribe(params => {
      this.paymentId = params.payment_id;
      this.preferenceId = params.preference_id;
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
      const status = this.route.snapshot.paramMap.get('status');
      if (this.paymentId && this.paymentId !== 'null' && this.preferenceId && this.preferenceId !== 'null') {
        this.store.dispatch(
          new fromActionsPayment.PaymentSave({
            reservationId: this.reservationId,
            status,
            preferenceId: this.preferenceId,
            mlPaymentId: this.paymentId
          })
        );
      } else {
        const message = this.translate.instant('PAYMENT.ADD.ERROR', {reason: 'incomplete'});
        this.store.dispatch(
          new fromActionsPayment.PaymentNotComplete({message})
        );
        this.router.navigate(['me', 'reservation', this.reservationId, 'payment']);
      }
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
