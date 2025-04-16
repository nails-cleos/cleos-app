import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, UntypedFormControl, UntypedFormGroup } from '@angular/forms';
import { AppState, selectPaymentState } from '../../../store/app.states';
import { Observable, Subscription } from 'rxjs';
import { Store } from '@ngrx/store';
import { ActivatedRoute } from '@angular/router';
import * as fromActionsPayment from '../../../store/payment.actions';
import {
  getPaymentOptions,
  getPayNlOptions,
  IPaymentAll,
  IPaymentOption,
  PaymentType,
} from '../../../interfaces/payment';
import { Analytics, logEvent } from '@angular/fire/analytics';
import { TranslateService } from '@ngx-translate/core';
import { SharedModule } from '../../../shared/shared.module';
import { BankComponent } from '../../../shared/bank/bank.component';
import { BackButtonDirective } from '../../../directives/back-button.directive';
import { CurrencySymbolPipe } from '../../../pipes/currency-symbol.pipe';

@Component({
  selector: 'app-me-payment',
  templateUrl: './me-payment.component.html',
  styleUrls: ['./me-payment.component.scss'],
  imports: [SharedModule, BankComponent, BackButtonDirective, CurrencySymbolPipe],
})
export class MePaymentComponent implements OnInit, OnDestroy {

  typeForm: UntypedFormGroup;
  options?: IPaymentOption[];

  payment?: IPaymentAll;
  language: string;

  private getState: Observable<any>;
  private subscription?: Subscription;

  constructor(private store: Store<AppState>, private formBuilder: FormBuilder, private route: ActivatedRoute,
              private analytic: Analytics, private translate: TranslateService) {
    this.getState = this.store.select(selectPaymentState);
    this.typeForm = this.formBuilder.group({
      type: new UntypedFormControl(undefined),
      bank: new UntypedFormControl(''),
    });
    this.language = this.translate.currentLang;
  }

  get update(): void {
    if (this.typeForm.invalid) {
      return;
    }

    const option: IPaymentOption = this.typeForm.get('type')?.value;
    const type = option.type;
    const paymentOptionId = option.bic;
    const payload = {
      id: this.payment?.id,
      payment: { type, paymentOptionId, bic: undefined },
    };
    if (option.subTypes.length) {
      payload.payment.bic = this.typeForm.get('bank')?.value?.bic;
    }

    this.store.dispatch(
      new fromActionsPayment.PaymentUpdateLink(payload),
    );
    return;
  }

  ngOnInit(): void {
    this.subscribe();
    this.clean();
    this.route.params.subscribe(routeParams => {
      const paymentId = routeParams.id;
      if (paymentId) {
        logEvent(this.analytic, 'screen_view', {
          // eslint-disable-next-line camelcase
          firebase_screen: `Customer missing payment ${ paymentId }`,
          // eslint-disable-next-line camelcase
          firebase_screen_class: 'MePaymentComponent',
        });
        this.getPayment(paymentId);
      }
    });
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }

  private getPayment = (paymentId: string): void => this.store.dispatch(new fromActionsPayment.PaymentFind(paymentId));

  private getOptions = (): void => this.store.dispatch(new fromActionsPayment.PaymentOptions());

  private clean = (): void => this.store.dispatch(new fromActionsPayment.Clean());

  private subscribe = (): void => {
    this.subscription = this.getState.subscribe(state => {
      if (state.selected) {
        this.payment = state.selected;
        const reservation = this.payment?.reservation;
        const types = reservation?.room?.paymentTypes.filter(
          p => ![PaymentType.cash, PaymentType.transfer].includes(p));
        if (types?.includes(PaymentType.paynl)) {
          this.getOptions();
        } else {
          this.options = getPaymentOptions(this.translate, types);
        }
      }
      if (state.data) {
        this.options = getPayNlOptions(state.data);
      }
    });
  };
}
