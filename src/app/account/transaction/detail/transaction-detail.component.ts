import { Component, OnDestroy, OnInit } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { AppState, selectAccountState } from '../../../store/app.states';
import { Store } from '@ngrx/store';
import { ActivatedRoute, Router } from '@angular/router';
import { ITransaction } from '../../../interfaces/account';
import * as fromActionsAccount from '../../../store/account.actions';
import { TranslateService } from '@ngx-translate/core';
import * as fromActionsPayment from '../../../store/payment.actions';
import { newDateTimestamp } from '../../../util/dates';

@Component({
  selector: 'app-transaction-detail',
  templateUrl: './transaction-detail.component.html',
  styleUrls: ['./transaction-detail.component.scss']
})
export class TransactionDetailComponent implements OnInit, OnDestroy {

  transaction?: ITransaction;
  dateFormat: string;
  step?: number;
  language: string;

  private getState: Observable<any>;
  private subscription?: Subscription;
  private id: string | null = null;
  private transactionId: string | null = null;

  constructor(private store: Store<AppState>, private route: ActivatedRoute, private translate: TranslateService,
              private router: Router) {
    this.getState = this.store.select(selectAccountState);
    this.dateFormat = this.translate.currentLang;
    this.step = this.router.getCurrentNavigation()?.extras.state?.step;
    this.language = this.translate.currentLang;
  }

  get pay(): void {
    return this.store.dispatch(
      new fromActionsPayment.PaymentSend(this.transaction?.payment?.paymentURL)
    );
  }

  get notify(): void {
    return this.store.dispatch(
      new fromActionsPayment.PaymentNotify({
        id: this.transaction?.payment?.id,
        resourceId: this.transaction?.id,
        path: 'transaction',
        preferenceId: this.transaction?.payment?.preferenceId,
        type: this.transaction?.payment?.type
      })
    );
  }

  ngOnInit(): void {
    this.id = this.route.snapshot.paramMap.get('id');
    this.transactionId = this.route.snapshot.paramMap.get('transactionId');
    this.getTransaction();
    this.subscribe();
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }

  private getTransaction = (): void => this.store.dispatch(
    new fromActionsAccount.TransactionDetail({ id: this.id, transactionId: this.transactionId })
  );

  private subscribe = (): void => {
    this.subscription = this.getState.subscribe(state => {
      if (state.selected) {
        this.transaction = Object.assign(
          {}, state.selected, { date: newDateTimestamp(state.selected.payment.timestamp) }
        );
      }
      if (state.paths) {
        this.router.navigate([this.language].concat(state.paths));
      } else if (state.subErrors) {
        this.router.navigate([this.language, 'me', 'transaction', this.id, 'payment']);
      }
    });
  }
}
