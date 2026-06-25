import {
  ChangeDetectionStrategy,
  Component,
  HostListener,
  OnInit,
  inject,
} from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { SeoService } from '../../services/seo.service';
import { LegalPageBase } from '../legal-page-base';

@Component({
  selector: 'app-terms-and-conditions',
  templateUrl: './terms-and-conditions.component.html',
  styleUrls: ['./terms-and-conditions.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TermsAndConditionsComponent extends LegalPageBase implements OnInit {
  private readonly translateService: TranslateService = inject(TranslateService);
  private readonly seoService: SeoService = inject(SeoService);
  termsContent = this.legalContent;

  constructor() {
    super({
      routeSegment: 'term-and-conditions',
      unavailableHtml: '<h1>Terms and Conditions</h1><p>Terms and conditions content is unavailable.</p>',
      fileName: 'terms',
    });
  }

  ngOnInit(): void {
    const meta = this.translateService.instant('META');

    this.seoService.setMetaDescription(meta.CONTENT);
    this.seoService.setMetaTitle(meta.TITLE);
  }

  @HostListener('click', ['$event'])
  onHostClick(event: MouseEvent): void {
    this.handleHostClick(event);
  }
}
