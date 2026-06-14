import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { paymentSave, paymentNotComplete } from '../../store/actions/payment.actions';
import { PaymentState } from '../../store/reducers/payment.reducers';
import { PaymentStatus } from '../../interfaces/payment';

/**
 * Centralised logic for handling Mollie redirect query parameters.
 * Used by PaymentRedirectGuard (and can be reused by any resolver/component).
 */
@Injectable({ providedIn: 'root' })
export class PaymentRedirectService {
  constructor(private store: Store<PaymentState>) {}

  /**
   * Dispatches the appropriate store actions based on the query parameters.
   *
   * @param path  "reservation" | "transaction"
   * @param id    reservation‑ or transaction‑id
   * @param query Query parameters parsed from the Mollie redirect URL.
   */
  handleRedirect(
    path: 'reservation' | 'transaction',
    id: string,
    query: { [key: string]: any },
  ): void {
    // Full payment payload – we have everything needed to store a successful payment.
    if (query.payment_type && query.payment_id && query.type && query.reference_id) {
      const paymentStatus = new PaymentStatus(
        query.payment_id,
        query.type,
        query.reference_id,
        query.reason ?? '',
      );

      this.store.dispatch(
        paymentSave({
          id,
          path,
          status: query.status ?? 'CREATED',
          paymentStatus,
        }),
      );
      return;
    }

    // Generic Mollie redirect that only carries the payment_type flag.
    // The dedicated payment page will handle fetching the correct state.
    if (query.payment_type) {
      // No store update required – the PaymentComponent will load its own data.
      return;
    }

    // Anything else is considered an error / incomplete payment.
    const message = 'Payment incomplete – missing required data';
    this.store.dispatch(paymentNotComplete({ subError: [{ message }] }));
  }
}
