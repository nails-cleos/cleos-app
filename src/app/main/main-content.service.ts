import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MainContentService {
  data = new BehaviorSubject<{ showPreload: boolean; navigationHeader: 'open' | 'close'; showArrow: boolean }>({
    showPreload: true,
    navigationHeader: 'close',
    showArrow: false
  });
  data$ = this.data.asObservable();

  configure = (
    showPreload: boolean,
    navigationHeader: 'open' | 'close',
    showArrow: boolean = false
  ): void => this.data.next({ showPreload, navigationHeader, showArrow });
}
