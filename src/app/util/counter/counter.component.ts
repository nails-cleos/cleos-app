import { Component, ElementRef, EventEmitter, NgZone, Output, Renderer2, ViewChild } from '@angular/core';
import { getNowTimeZone } from '../dates';
import { SharedModule } from '../../shared/shared.module';

@Component({
  selector: 'app-counter',
  templateUrl: 'counter.component.html',
  imports: [SharedModule],
})
export class CounterComponent {

  @ViewChild('counter')
  public myCounter?: ElementRef;

  @Output() refreshViewDate = new EventEmitter<Date>();

  constructor(private zone: NgZone, private renderer: Renderer2) {
    this.zone.runOutsideAngular(() => {
      setInterval(() => {
        const now = getNowTimeZone();
        this.refreshViewDate.emit(now);
        const hours = `0${ now.getHours() }`.slice(-2);
        const minutes = `0${ now.getMinutes() }`.slice(-2);
        const seconds = `0${ now.getSeconds() }`.slice(-2);
        this.renderer.setProperty(this.myCounter?.nativeElement, 'textContent',
          `${ hours }:${ minutes }:${ seconds }`);
      }, 1000);
    });
  }
}
