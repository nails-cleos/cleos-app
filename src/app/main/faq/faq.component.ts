import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { MainContentService } from '../../services/main-content.service';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { RouterLink } from '@angular/router';
import { AppMaterialModule } from '../../util/app-material.module';
import { NgClass } from '@angular/common';

interface IFAQs {
  question: string,
  answer: string
}

@Component({
  selector: 'app-faq',
  templateUrl: './faq.component.html',
  styleUrl: './faq.component.scss',
  imports: [AppMaterialModule, RouterLink, NgClass, TranslatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FaqComponent {
  limit = input<number>(0);

  private readonly mainContent: MainContentService = inject(MainContentService);
  private readonly translate: TranslateService = inject(TranslateService);

  faqs = computed(() => {
    const faqs: IFAQs[] = this.translate.instant('FAQS');
    const limit = this.limit();
    if (limit) {
      return faqs.slice(0, limit);
    }
    return faqs;
  });

  constructor() {
    this.mainContent.configure(false, 'open');
  }
}
