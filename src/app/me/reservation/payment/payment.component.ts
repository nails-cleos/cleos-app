import { Component, OnDestroy, OnInit } from '@angular/core';
import { AppState, selectPaymentState } from '../../../store/app.states';
import { Observable, Subscription } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { IPayment } from '../../../interfaces/payment';
import * as fromActionsPayment from '../../../store/payment.actions';
import { MatTableDataSource } from '@angular/material/table';
import { Pagination } from '../../../interfaces/pagination';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-payment',
  templateUrl: './payment.component.html',
  styleUrls: ['./payment.component.scss']
})
export class PaymentComponent implements OnInit, OnDestroy {
  displayedColumns: string[] = ['position', 'description', 'amount', 'status', 'actions'];
  dataSource: any = new MatTableDataSource<Pagination<IPayment>>();

  errorMessage: string | undefined;
  showError = false;

  private getState: Observable<any>;
  private subscription: Subscription | undefined;
  private reservationId: any;

  constructor(private route: ActivatedRoute, private store: Store<AppState>, private router: Router) {
    this.getState = this.store.select(selectPaymentState);
  }

  ngOnInit(): void {
    this.subscribe();
    this.route.params.subscribe(routeParams => {
      this.reservationId = routeParams.id;
      this.getPayments();
    });
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }

  pay(payment: IPayment): void {
    this.store.dispatch(
      new fromActionsPayment.PaymentSend(`${environment.mlUrl}?pref_id=${payment.preferenceId}`)
    );
  }

  notify(payment: IPayment): void {
    this.store.dispatch(
      new fromActionsPayment.PaymentNotify({
        id: payment.id, reservationId: this.reservationId,
        preferenceId: payment.preferenceId
      })
    );
  }

  close(): void {
    this.showError = false;
  }

  private subscribe(): void {
    this.subscription = this.getState.subscribe(state => {
      this.dataSource = state.selected;
      if (state.message) {
        this.clean();
        this.router.navigate(['reservation', this.reservationId]);
      } else if (state.subErrors) {
        this.showError = true;
        this.errorMessage = state.subErrors;
      }
    });
  }

  private getPayments(): void {
    if (!this.dataSource) {
      this.store.dispatch(
        new fromActionsPayment.PaymentFindByReservationId(this.reservationId)
      );
    }
  }

  private clean(): void {
    this.store.dispatch(
      new fromActionsPayment.Clean()
    );
  }
}
