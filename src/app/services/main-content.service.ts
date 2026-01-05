import { Injectable, signal } from '@angular/core';

export interface MainContentState {
  showPreload: boolean;
  navigationHeader: 'open' | 'close';
  showArrow: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class MainContentService {
  private data = signal<MainContentState>({
    showPreload: true,
    navigationHeader: 'close',
    showArrow: false,
  });

  get value(): MainContentState {
    return this.data();
  }

  configure = (
    showPreload: boolean,
    navigationHeader: 'open' | 'close',
    showArrow: boolean = false,
  ): void => this.data.set({ showPreload, navigationHeader, showArrow });
}
