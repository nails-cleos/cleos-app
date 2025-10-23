import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { AppState, selectPaymentState } from '../../store/app.states';
import { Observable, Subject } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { IPayment, IPaymentAll } from '../../interfaces/payment';
import { clean, getPaymentByResourceId, notifyPayment, paymentSend } from '../../store/payment.actions';
import { MatTableDataSource } from '@angular/material/table';
import { Pagination } from '../../interfaces/pagination';
import { TranslateService } from '@ngx-translate/core';
import { SharedModule } from '../../shared/shared.module';
import { BackButtonDirective } from '../../directives/back-button.directive';
import { takeUntil } from 'rxjs/operators';

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
  language!: string;

  private readonly route: ActivatedRoute = inject(ActivatedRoute);
  private readonly store: Store<AppState> = inject(Store<AppState>);
  private readonly router: Router = inject(Router);
  private readonly translate: TranslateService = inject(TranslateService);

  private getState: Observable<any> = this.store.select(selectPaymentState);
  private id: any;
  private path: any;
  private destroy$ = new Subject<void>();

  ngOnInit(): void {
    this.language = this.translate.currentLang;
    this.subscribe();
    this.route.params.subscribe(routeParams => {
      this.id = routeParams.id;
      this.path = routeParams.path;
      this.getPayments();
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  close(): void {
    this.showError = false;
  }

  pay = (payment: IPaymentAll): void => {
    const link = payment.link || payment.paymentURL;
    if (link) {
      this.store.dispatch(paymentSend({ link }));
    }
  };

  notify = (payment: IPayment): void => {
    this.store.dispatch(
      notifyPayment({
        id: payment.id!,
        path: this.path,
        resourceId: this.id,
        preferenceId: payment.preferenceId!,
        paymentType: payment.type!,
      }),
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
      this.store.dispatch(getPaymentByResourceId({ id: this.id, path: this.path, redirect: true }));
    }
  };

  private clean = (): void => this.store.dispatch(clean());

  private subscribe = (): void => {
    this.getState.pipe(takeUntil(this.destroy$)).subscribe((state) => {
      this.dataSource = state.selected;
      const path = state.response?.path;
      const errorMessage = state.subErrors?.[0]?.message;
      if (path) {
        this.clean();
        this.router.navigate([`${this.language}/${path}`]);
      } else if (errorMessage) {
        this.showError = true;
        this.errorMessage = errorMessage;
      }
    });
  };
}
