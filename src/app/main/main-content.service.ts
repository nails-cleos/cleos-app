import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MainContentService {
  data = new BehaviorSubject(true);
  data$ = this.data.asObservable();

  showPreload(data: boolean): void {
    this.data.next(data);
  }
}
