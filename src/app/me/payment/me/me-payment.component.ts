import { ChangeDetectionStrategy, Component, computed, effect, inject, input, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule } from '@angular/forms';
import { Store } from '@ngrx/store';
import { getPayment, updatePaymentById } from '../../../store/payment.actions';
import { IPaymentOption, PaymentPercentage } from '../../../interfaces/payment';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { BankComponent, BankForm } from '../../../shared/bank/bank.component';
import { BackButtonDirective } from '../../../directives/back-button.directive';
import { CurrencySymbolPipe } from '../../../pipes/currency-symbol.pipe';
import { IReservationPayment } from '../../../interfaces/reservation';
import { PaymentState } from '../../../store/reducers/payment.reducers';
import { getPaymentOptionsPipe, getSelectedPaymentPipe } from '../../../store/selectors/payment.selectors';
import { toSignal } from '@angular/core/rxjs-interop';
import { FirebaseService } from '../../../services/firebase.service';
import { MatIcon } from '@angular/material/icon';
import { MatButton, MatIconButton } from '@angular/material/button';
import { DecimalPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import {
  MatCard,
  MatCardActions,
  MatCardContent,
  MatCardHeader,
  MatCardSubtitle,
  MatCardTitle,
} from '@angular/material/card';

@Component({
  selector: 'app-me-payment',
  templateUrl: './me-payment.component.html',
  styleUrls: ['./me-payment.component.scss'],
  imports: [MatIcon, MatIconButton, MatButton, ReactiveFormsModule,
    TranslatePipe, DecimalPipe, RouterLink, BankComponent, BackButtonDirective, CurrencySymbolPipe, MatCard,
    MatCardHeader, MatCardTitle, MatCardSubtitle,
    MatCardContent, MatCardActions],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MePaymentComponent {
  id = input<string>();

  private readonly store: Store<PaymentState> = inject(Store<PaymentState>);
  private readonly formBuilder: NonNullableFormBuilder = inject(NonNullableFormBuilder);
  private readonly translate: TranslateService = inject(TranslateService);
  private readonly firebaseService = inject(FirebaseService);

  private payment$ = this.store.pipe(getSelectedPaymentPipe);
  private paymentOptions$ = this.store.pipe(getPaymentOptionsPipe);

  private paymentOptionsSignal = toSignal(this.paymentOptions$, { initialValue: [] });
  paymentSignal = toSignal(this.payment$);

  form = this.formBuilder.group<BankForm>({
    option: this.formBuilder.control(undefined),
    percentage: this.formBuilder.control(undefined),
  });

  options = signal<IPaymentOption[] | undefined>(undefined);
  private readonly paymentOptions = computed(
    () => this.paymentOptionsSignal().filter(option => option.enabled && option.enabledCustomer),
  );

  language: string = this.translate.getCurrentLang();

  constructor() {
    effect(() => {
      const id = this.id();
      if (id) {
        this.firebaseService.logEvent('screen_view', {
          // eslint-disable-next-line camelcase
          firebase_screen: `Customer missing payment ${ id }`,
          // eslint-disable-next-line camelcase
          firebase_screen_class: 'MePaymentComponent',
        });
        this.store.dispatch(getPayment({ id }));
      }
    });

    effect(() => {
      const payment = this.paymentSignal();
      if (payment) {
        const options = this.paymentOptions();
        const types = payment?.reservation?.room?.paymentTypes.filter(
          p => !['cash', 'transfer'].includes(p.toLowerCase()));
        this.options.set(options.filter(option => types?.includes(option.type)));
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

    const option = this.getForm.option?.value;
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
