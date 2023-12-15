import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MainContentService {
  data = new BehaviorSubject<{ showPreload: boolean; navigationHeader: 'open' | 'close' }>({
    showPreload: true,
    navigationHeader: 'close'
  });
  data$ = this.data.asObservable();

  configure(showPreload: boolean, navigationHeader: 'open' | 'close'): void {
    this.data.next({ showPreload, navigationHeader });
  }
}
