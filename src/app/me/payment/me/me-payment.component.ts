import { ChangeDetectionStrategy, Component, effect, inject, signal } from '@angular/core';
import { NonNullableFormBuilder } from '@angular/forms';
import { Store } from '@ngrx/store';
import { getPayment, updatePaymentById } from '../../../store/payment.actions';
import {
  getPaymentOptions,
  IPaymentOption,
  PaymentPercentage,
  PaymentType,
} from '../../../interfaces/payment';
import { TranslateService } from '@ngx-translate/core';
import { SharedModule } from '../../../shared/shared.module';
import { BankComponent, BankForm } from '../../../shared/bank/bank.component';
import { BackButtonDirective } from '../../../directives/back-button.directive';
import { CurrencySymbolPipe } from '../../../pipes/currency-symbol.pipe';
import { IReservationPayment } from '../../../interfaces/reservation';
import { PaymentState } from '../../../store/reducers/payment.reducers';
import {
  getCurrentPaymentIdPipe,
  getSelectedPaymentPipe,
} from '../../../store/selectors/payment.selectors';
import { toSignal } from '@angular/core/rxjs-interop';
import { FirebaseService } from '../../../services/firebase.service';

@Component({
  selector: 'app-me-payment',
  templateUrl: './me-payment.component.html',
  styleUrls: ['./me-payment.component.scss'],
  imports: [SharedModule, BankComponent, BackButtonDirective, CurrencySymbolPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MePaymentComponent {
  private readonly store: Store<PaymentState> = inject(Store<PaymentState>);
  private readonly formBuilder: NonNullableFormBuilder = inject(NonNullableFormBuilder);
  private readonly translate: TranslateService = inject(TranslateService);
  private readonly firebaseService = inject(FirebaseService);

  private paymentId$ = this.store.pipe(getCurrentPaymentIdPipe);
  private payment$ = this.store.pipe(getSelectedPaymentPipe);

  private paymentIdSignal = toSignal(this.paymentId$);
  paymentSignal = toSignal(this.payment$);

  form = this.formBuilder.group<BankForm>({
    type: this.formBuilder.control(undefined),
    percentage: this.formBuilder.control(undefined),
  });

  options = signal<IPaymentOption[] | undefined>(undefined);
  paymentTypes = signal<PaymentType[] | undefined>(undefined);

  language: string = this.translate.getCurrentLang();

  constructor() {
    effect(() => {
      const id = this.paymentIdSignal();
      if (id) {
        this.firebaseService.logEvent('screen_view', {
          // eslint-disable-next-line camelcase
          firebase_screen: `Customer missing payment ${id}`,
          // eslint-disable-next-line camelcase
          firebase_screen_class: 'MePaymentComponent',
        });
        this.store.dispatch(getPayment({ id }));
      }
    });

    effect(() => {
      const payment = this.paymentSignal();
      if (payment) {
        const reservation = payment?.reservation;
        const types = reservation?.room?.paymentTypes.filter(
          p => ![PaymentType.cash, PaymentType.transfer].includes(p));
        this.paymentTypes.set(types);
        this.options.set(getPaymentOptions(this.translate, types));
      }
    });
  }

  get getForm(): BankForm {
    return this.form.controls;
  }

  update(): void {
    if (this.form.invalid) {
      return;
    }

    const option = this.getForm.type?.value;
    if (!option) {
      return;
    }
    const type = option.type;
    const percentage = PaymentPercentage.total;
    const payment: IReservationPayment = { type, percentage };

    const id = this.paymentSignal()?.id;
    this.store.dispatch(updatePaymentById({ id: id!, payment }));
  }
}
