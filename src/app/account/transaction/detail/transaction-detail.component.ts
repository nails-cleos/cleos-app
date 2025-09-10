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
import { SharedModule } from '../../../shared/shared.module';
import { BackButtonDirective } from '../../../directives/back-button.directive';

@Component({
  selector: 'app-transaction-detail',
  templateUrl: './transaction-detail.component.html',
  styleUrls: ['./transaction-detail.component.scss'],
  imports: [SharedModule, BackButtonDirective],
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
      new fromActionsPayment.PaymentSend(this.transaction?.payment?.paymentURL),
    );
  }

  get notify(): void {
    const transaction = this.transaction!;
    return this.store.dispatch(
      new fromActionsPayment.NotifyPayment(transaction.payment!.id!, 'transaction', transaction.id!,
        transaction.payment!.preferenceId!, transaction.payment!.type!),
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
    new fromActionsAccount.GetTransaction(this.id!, this.transactionId!),
  );

  private subscribe = (): void => {
    this.subscription = this.getState.subscribe((state) => {
      if (state.selected) {
        this.transaction = Object.assign(
          {}, state.selected, { date: newDateTimestamp(state.selected.payment.timestamp) },
        );
      }
      const path = state.response?.path;
      if (path) {
        this.router.navigate([`${ this.language }/${ path }`]);
      } else if (state.subErrors?.[0]?.message) {
        this.router.navigate([this.language, 'me', 'transaction', this.id, 'payment']);
      }
    });
  };
}
