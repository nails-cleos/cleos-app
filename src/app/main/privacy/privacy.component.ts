import { ChangeDetectionStrategy, Component, HostListener, inject } from '@angular/core';
import { MainContentService } from '../../services/main-content.service';
import { LegalPageBase } from '../legal-page-base';

@Component({
  selector: 'app-privacy',
  templateUrl: './privacy.component.html',
  styleUrls: ['./privacy.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PrivacyComponent extends LegalPageBase {
  private readonly mainContent: MainContentService = inject(MainContentService);
  privacyContent = this.legalContent;

  constructor() {
    super({
      routeSegment: 'privacy',
      unavailableHtml: '<h1>Privacy Policy</h1><p>Privacy policy content is unavailable.</p>',
      fileName: 'privacy',
    });
    this.mainContent.configure(false, 'open');
  }

  @HostListener('click', ['$event'])
  onHostClick(event: MouseEvent): void {
    this.handleHostClick(event);
  }
}
