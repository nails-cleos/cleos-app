import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot, UrlTree } from '@angular/router';
import { PaymentRedirectService } from './payment-redirect.service';
import { DEFAULT_LOCALE } from '@app/util/dates';

@Injectable({
  providedIn: 'root',
})
export class PaymentRedirectGuard implements CanActivate {
  constructor(
    private router: Router,
    private paymentRedirect: PaymentRedirectService,
  ) {}

  canActivate(route: ActivatedRouteSnapshot): UrlTree {
    const lang = route.paramMap.get('lang') ?? DEFAULT_LOCALE;
    const path = route.paramMap.get('path') as 'reservation' | 'transaction';
    const id = route.paramMap.get('id')!;
    const query = route.queryParams;
    const paymentType = query.payment_type;

    // Update store / handle payment data
    this.paymentRedirect.handleRedirect(path, id, query);

    // If the URL contains a generic payment_type, keep user on the generic payment page
    if (paymentType) {
      return this.router.createUrlTree([lang, 'me', path, id, 'payment']);
    }

    // Otherwise send them to the detail view
    return this.router.createUrlTree([lang, 'me', path, id, 'detail']);
  }
}
