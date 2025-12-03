import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { environment } from '../../../environments/environment';
import { MainContentService } from '../../services/main-content.service';
import { TranslateService } from '@ngx-translate/core';
import { SeoService } from '../../services/seo.service';

@Component({
  selector: 'app-terms-and-conditions',
  templateUrl: './terms-and-conditions.component.html',
  styleUrls: ['./terms-and-conditions.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TermsAndConditionsComponent implements OnInit {
  private readonly mainContent: MainContentService = inject(MainContentService);
  private readonly translate: TranslateService = inject(TranslateService);
  private readonly seoService: SeoService = inject(SeoService);

  url = environment.appServer;

  constructor() {
    this.mainContent.configure(false, 'open');
  }

  ngOnInit(): void {
    const meta = this.translate.instant('META');

    this.seoService.setMetaDescription(meta.CONTENT);
    this.seoService.setMetaTitle(meta.TITLE);
  }
}
