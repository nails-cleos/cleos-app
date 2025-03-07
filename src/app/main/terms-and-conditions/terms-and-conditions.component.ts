import { Component, OnInit } from '@angular/core';
import { environment } from '../../../environments/environment';
import { MainContentService } from '../main-content.service';
import { TranslateService } from '@ngx-translate/core';
import { SeoService } from '../../services/seo.service';

@Component({
  selector: 'app-terms-and-conditions',
  templateUrl: './terms-and-conditions.component.html',
  styleUrls: ['./terms-and-conditions.component.scss']
})
export class TermsAndConditionsComponent implements OnInit {
  url = environment.appServer;

  constructor(private mainContent: MainContentService, private translate: TranslateService,
              private seoService: SeoService) {
    this.mainContent.configure(false, 'open');
  }

  ngOnInit(): void {
    const meta = this.translate.instant('META');

    this.seoService.setMetaDescription(meta.CONTENT);
    this.seoService.setMetaTitle(meta.TITLE);
  }
}
