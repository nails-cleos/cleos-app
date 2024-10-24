import { Component, Input, AfterViewInit } from '@angular/core';
import { SharedModule } from '../../shared/shared.module';
import { MainContentService } from '../main-content.service';
import { TranslateService } from '@ngx-translate/core';
import { RouterLink } from '@angular/router';

interface IFAQs {
  question: string,
  answer: string
}

@Component({
  selector: 'app-faq',
  standalone: true,
  imports: [SharedModule, RouterLink],
  templateUrl: './faq.component.html',
  styleUrl: './faq.component.scss'
})
export class FaqComponent implements AfterViewInit {

  @Input() limit: number;

  faqs: IFAQs[] = [];

  constructor(private mainContent: MainContentService, private translate: TranslateService) {
    this.mainContent.configure(false, 'open');
    this.limit = 0;
  }

  ngAfterViewInit(): void {
    this.loadFAQs();
    this.translate.onLangChange.subscribe(() => this.loadFAQs());
  }

  private loadFAQs() {
    const faqs = this.translate.instant('FAQS');
    if (this.limit) {
      this.faqs = faqs.slice(0, 3);
    } else {
      this.faqs = faqs;
    }
  }
}
