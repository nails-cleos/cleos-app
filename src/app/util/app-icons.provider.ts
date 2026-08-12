import { inject, provideAppInitializer } from '@angular/core';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';

const SVG_ICONS = [
  ['CLEOS', 'assets/icons/safari-pinned-tab.svg'],
  ['CLEOS-COLOR', 'assets/icons/icon.svg'],
  ['MANICURE', 'assets/treatment.svg'],
  ['WHATSAPP', 'assets/whatsapp.svg'],
  ['WHATSAPP-NO-COLOR', 'assets/whatsapp-no-color.svg'],
  ['INSTAGRAM', 'assets/instagram.svg'],
  ['INSTAGRAM-NO-COLOR', 'assets/instagram-no-color.svg'],
  ['FACEBOOK', 'assets/facebook.svg'],
  ['FACEBOOK-NO-COLOR', 'assets/facebook-no-color.svg'],
  ['IDEAL', 'assets/payment_methods/ideal.svg'],
  ['PAYPAL', 'assets/payment_methods/paypal.svg'],
  ['MOLLIE', 'assets/payment_methods/mollie.svg'],
  ['PAY_NL', 'assets/payment_methods/paynl.svg'],
];

export const provideAppIcons = () =>
  provideAppInitializer(() => {
    const matIconRegistry = inject(MatIconRegistry);
    const domSanitizer = inject(DomSanitizer);

    for (const [name, path] of SVG_ICONS) {
      matIconRegistry.addSvgIcon(
        name,
        domSanitizer.bypassSecurityTrustResourceUrl(path),
      );
    }
  });
