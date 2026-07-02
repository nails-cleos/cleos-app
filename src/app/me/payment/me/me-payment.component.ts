import { ChangeDetectionStrategy, Component, computed, effect, inject, input, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule } from '@angular/forms';
import { IPaymentOption, PaymentPercentage } from '../../../interfaces/payment';
import { TranslatePipe } from '@ngx-translate/core';
import { BankComponent, BankForm } from '../../../shared/bank/bank.component';
import { BackButtonDirective } from '../../../directives/back-button.directive';
import { CurrencySymbolPipe } from '../../../pipes/currency-symbol.pipe';
import { IReservationPayment } from '../../../reservation/reservation';
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
import { NavigationService } from '../../../services/navigation.service';
import { PaymentStore } from '../../../store/payment.store';

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

  private readonly paymentStore = inject(PaymentStore);
  private readonly navigationService: NavigationService = inject(NavigationService);
  private readonly formBuilder: NonNullableFormBuilder = inject(NonNullableFormBuilder);
  private readonly firebaseService = inject(FirebaseService);

  private paymentOptionsSignal = this.paymentStore.options;
  readonly paymentSignal = this.paymentStore.selected;

  form = this.formBuilder.group<BankForm>({
    option: this.formBuilder.control(undefined),
    percentage: this.formBuilder.control(undefined),
  });

  options = signal<IPaymentOption[] | undefined>(undefined);
  private readonly paymentOptions = computed(
    () => this.paymentOptionsSignal().filter(option => option.enabled && option.enabledCustomer),
  );

  readonly language = this.navigationService.language;

  constructor() {
    this.paymentStore.clean();
    this.paymentStore.getOptions();
    effect(() => {
      const id = this.id();
      if (id) {
        this.firebaseService.logEvent('screen_view', {
          // eslint-disable-next-line camelcase
          firebase_screen: `Customer missing payment ${ id }`,
          // eslint-disable-next-line camelcase
          firebase_screen_class: 'MePaymentComponent',
        });
        this.paymentStore.getPayment(id);
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
    this.paymentStore.updatePaymentById(id!, payment);
  }
}
