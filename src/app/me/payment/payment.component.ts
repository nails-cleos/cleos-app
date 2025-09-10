import { Component, OnDestroy, OnInit } from '@angular/core';
import { AppState, selectPaymentState } from '../../store/app.states';
import { Observable, Subscription } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { IPayment, IPaymentAll } from '../../interfaces/payment';
import * as fromActionsPayment from '../../store/payment.actions';
import { MatTableDataSource } from '@angular/material/table';
import { Pagination } from '../../interfaces/pagination';
import { TranslateService } from '@ngx-translate/core';
import { SharedModule } from '../../shared/shared.module';
import { BackButtonDirective } from '../../directives/back-button.directive';

@Component({
  selector: 'app-payment',
  templateUrl: './payment.component.html',
  styleUrls: ['./payment.component.scss'],
  imports: [SharedModule, BackButtonDirective],
})
export class PaymentComponent implements OnInit, OnDestroy {
  displayedColumns: string[] = ['position', 'description', 'type', 'amount', 'status', 'actions'];
  dataSource: any = new MatTableDataSource<Pagination<IPayment>>();

  errorMessage?: string;
  showError = false;
  language: string;

  private getState: Observable<any>;
  private subscription?: Subscription;
  private id: any;
  private path: any;

  constructor(private route: ActivatedRoute, private store: Store<AppState>, private router: Router,
    translate: TranslateService) {
    this.getState = this.store.select(selectPaymentState);
    this.language = translate.currentLang;
  }

  get close(): void {
    this.showError = false;
    return;
  }

  ngOnInit(): void {
    this.subscribe();
    this.route.params.subscribe(routeParams => {
      this.id = routeParams.id;
      this.path = routeParams.path;
      this.getPayments();
    });
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }

  pay = (payment: IPaymentAll): void => {
    if (payment.link || payment.paymentURL) {
      this.store.dispatch(
        new fromActionsPayment.PaymentSend(payment.link || payment.paymentURL),
      );
    }
  };

  notify = (payment: IPayment): void => {
    this.store.dispatch(
      new fromActionsPayment.NotifyPayment(payment.id!, this.path, this.id, payment.preferenceId!, payment.type!),
    );
  };

  getCurrency = (payment: IPaymentAll): string => {
    let icon = 'euro';
    if (payment.reservation) {
      icon = payment.reservation.room.currency.icon;
    } else if (payment.transaction && payment.transaction.account) {
      icon = payment.transaction.account.currency.icon;
    }
    return icon;
  };

  private getPayments = (): void => {
    if (!this.dataSource) {
      this.store.dispatch(
        new fromActionsPayment.GetPaymentByResourceId(this.id, this.path, true),
      );
    }
  };

  private clean = (): void => this.store.dispatch(new fromActionsPayment.Clean());

  private subscribe = (): void => {
    this.subscription = this.getState.subscribe((state) => {
      this.dataSource = state.selected;
      const path = state.response?.path;
      const errorMessage = state.subErrors?.[0]?.message;
      if (path) {
        this.clean();
        this.router.navigate([`${ this.language }/${ path }`]);
      } else if (errorMessage) {
        this.showError = true;
        this.errorMessage = errorMessage;
      }
    });
  };
}
