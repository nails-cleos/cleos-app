import { Injectable } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';

@Injectable({
  providedIn: 'root'
})
export class SeoService {

  constructor(private meta: Meta, private titleService: Title) {
  }

  public setMetaDescription(content: string): void {
    this.meta.updateTag({ name: 'description', content });
    this.meta.updateTag({ property: 'og:description', content });
  }

  public setMetaTitle(title: string): void {
    this.titleService.setTitle(title);
    this.meta.updateTag({ property: 'og:title', content: title });
  }
}
