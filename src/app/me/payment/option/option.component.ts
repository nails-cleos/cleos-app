import { ChangeDetectionStrategy, Component, computed, effect, inject, input, signal } from '@angular/core';
import { FormGroup, NonNullableFormBuilder, ReactiveFormsModule } from '@angular/forms';
import { getPrice, newPercentage } from '../../../util/helper';
import { IPaymentOption, PaymentPercentage } from '../../../interfaces/payment';
import { IPrice, Price } from '../../../treatment/treatment';
import { IReservationAll, IReservationPayment } from '../../../reservation/reservation';
import { TranslatePipe } from '@ngx-translate/core';
import { BankComponent, BankForm } from '../../../shared/bank/bank.component';
import { PaymentPreviewComponent } from '../../../shared/payment-preview/payment-preview.component';
import { BackButtonDirective } from '../../../directives/back-button.directive';
import { CurrencySymbolPipe } from '../../../pipes/currency-symbol.pipe';
import { MatIcon } from '@angular/material/icon';
import { MatButton } from '@angular/material/button';
import { DecimalPipe, NgTemplateOutlet } from '@angular/common';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { NavigationService } from '../../../services/navigation.service';
import { PaymentStore } from '../../../store/payment.store';

@Component({
  selector: 'app-option',
  templateUrl: './option.component.html',
  styleUrls: ['./option.component.scss'],
  imports: [MatIcon, MatButton, ReactiveFormsModule, TranslatePipe, DecimalPipe, NgTemplateOutlet, BankComponent,
    BackButtonDirective, CurrencySymbolPipe, BankComponent, PaymentPreviewComponent, BackButtonDirective,
    CurrencySymbolPipe, MatProgressSpinner],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OptionComponent {
  id = input<string>();

  private readonly paymentStore = inject(PaymentStore);
  private readonly formBuilder: NonNullableFormBuilder = inject(NonNullableFormBuilder);
  private readonly navigationService: NavigationService = inject(NavigationService);

  private readonly paymentOptionsSignal = this.paymentStore.options;
  private paymentsSignal = this.paymentStore.data;

  form: FormGroup<BankForm> = this.formBuilder.group<BankForm>({
    option: this.formBuilder.control(undefined),
    percentage: this.formBuilder.control(undefined),
  });

  options = signal<IPaymentOption[] | undefined>(undefined);
  private readonly paymentOptions = computed(
    () => this.paymentOptionsSignal().filter(option => option.enabled && option.enabledCustomer),
  );

  reservation = signal<IReservationAll | undefined>(undefined);
  price = signal<IPrice>(new Price());
  professionalName = computed(() => this.reservation()?.professional?.displayName ?? '');
  first = true;
  currentStepIndex = signal(0);

  constructor() {
    this.paymentStore.clean();
    this.paymentStore.getOptions();
    effect(() => {
      const id = this.id();
      if (id) {
        this.paymentStore.getPaymentByResourceId(id, 'reservation');
      }
    });

    effect(() => {
      const payments = this.paymentsSignal();
      if (payments) {
        const reservation = payments[0]?.reservation;
        if (reservation) {
          const options = this.paymentOptions();
          const types = reservation.room.paymentTypes.filter(
            p => !['cash', 'transfer'].includes(p.toLowerCase()));
          this.options.set(options.filter(option => types?.includes(option.type)));
          const price = getPrice(reservation, payments);
          this.price.set(price);
          if (price.isPaid) {
            this.navigationService.navigate(['reservation', reservation.id]);
          } else {
            if (reservation.state !== 'CANCELLED_PAYMENT_REQUIRED') {
              this.first = price.totalPaid === 0;
            } else {
              this.price.set(new Price(0, 0, 0, 0, 0, payments[payments.length - 1].amount));
            }
            this.reservation.set(reservation);
          }
        }
      }
    });

  }

  get getForm(): BankForm {
    return this.form.controls;
  }

  back() {
    this.currentStepIndex.update(index => Math.max(index - 1, 0));
  }

  pay() {
    const option = this.getForm.option?.value;
    if (!option) {
      return;
    }
    const type = option.type;
    const percentage = this.getForm.percentage?.value || PaymentPercentage.total;
    const payment: IReservationPayment = { type, percentage };
    const reservationId = this.id();
    if (!reservationId) {
      return;
    }
    this.paymentStore.createPaymentLinkByReservationId(reservationId, payment);
  }

  callStepTwo = (goNext: boolean): void => {
    if (this.form.invalid) {
      return;
    }
    if (goNext) {
      this.currentStepIndex.set(1);
    }
  };

  getPercentage = (percentage: number): void => {
    this.price.set(newPercentage(this.price(), percentage));
  };
}
