import {
  ChangeDetectionStrategy,
  Component,
  HostListener,
} from '@angular/core';
import { LegalPageBase } from '../legal-page-base';

@Component({
  selector: 'app-terms-and-conditions',
  templateUrl: './terms-and-conditions.component.html',
  styleUrls: ['./terms-and-conditions.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TermsAndConditionsComponent extends LegalPageBase {
  termsContent = this.legalContent;

  constructor() {
    super({
      routeSegment: 'term-and-conditions',
      unavailableHtml:
        '<h1>Terms and Conditions</h1><p>Terms and conditions content is unavailable.</p>',
      fileName: 'terms',
    });
  }

  @HostListener('click', ['$event'])
  onHostClick(event: MouseEvent): void {
    this.handleHostClick(event);
  }
}
