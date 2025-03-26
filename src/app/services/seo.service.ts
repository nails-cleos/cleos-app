import { inject, Injectable } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';

@Injectable({
  providedIn: 'root'
})
export class SeoService {
  private meta: Meta = inject(Meta);
  private titleService: Title = inject(Title);

  setMetaDescription = (content: string): void => {
    this.meta.updateTag({ name: 'description', content });
    this.meta.updateTag({ property: 'og:description', content });
  }

  setMetaTitle = (title: string): void => {
    this.titleService.setTitle(title);
    this.meta.updateTag({ property: 'og:title', content: title });
  }
}
