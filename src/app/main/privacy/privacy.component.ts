import {
  ChangeDetectionStrategy,
  Component,
  HostListener,
} from '@angular/core';
import { LegalPageBase } from '../legal-page-base';

@Component({
  selector: 'app-privacy',
  templateUrl: './privacy.component.html',
  styleUrls: ['./privacy.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PrivacyComponent extends LegalPageBase {
  privacyContent = this.legalContent;

  constructor() {
    super({
      routeSegment: 'privacy',
      unavailableHtml:
        '<h1>Privacy Policy</h1><p>Privacy policy content is unavailable.</p>',
      fileName: 'privacy',
    });
  }

  @HostListener('click', ['$event'])
  onHostClick(event: MouseEvent): void {
    this.handleHostClick(event);
  }
}
