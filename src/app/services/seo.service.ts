import { Injectable } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';

@Injectable({
  providedIn: 'root'
})
export class SeoService {

  constructor(private meta: Meta, private titleService: Title) {
  }

  public setMetaDescription(content: string): void {
    this.meta.updateTag({ name: 'description' });
  }

  public setMetaTitle(title: string): void {
    this.titleService.setTitle(title);
  }
}
