import { inject, Injectable } from '@angular/core';
import { PaymentStatus } from '@app/interfaces/payment';
import { PaymentStore } from '@app/store/payment.store';

/**
 * Centralised logic for handling Mollie redirect query parameters.
 * Used by PaymentRedirectGuard (and can be reused by any resolver/component).
 */
@Injectable({
  providedIn: 'root',
})
export class PaymentRedirectService {
  private readonly paymentStore = inject(PaymentStore);

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

      this.paymentStore.create(id, path, query.status ?? 'CREATED', paymentStatus);
      return;
    }

    // Generic Mollie redirect that only carries the payment_type flag.
    // The dedicated payment page will handle fetching the correct state.
    if (query.payment_type) {
      this.paymentStore.notify(query.payment_id, path, id, query.reference_id, query.payment_type);
      return;
    }

    // Anything else is considered an error / incomplete payment.
    const reason = query.reason ?? 'missing required data';
    this.paymentStore.notComplete(reason);
  }
}
