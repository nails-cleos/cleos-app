import { ChangeDetectionStrategy, Component, ElementRef, NgZone, output, Renderer2, viewChild } from '@angular/core';
import { getNowTimeZone } from '../dates';

@Component({
  selector: 'app-counter',
  templateUrl: 'counter.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CounterComponent {
  counter = viewChild<ElementRef>('counter');
  refreshViewDate = output<Date>();

  constructor(private zone: NgZone, private renderer: Renderer2) {
    this.zone.runOutsideAngular(() => {
      setInterval(() => {
        const now = getNowTimeZone();
        this.refreshViewDate.emit(now);
        const hours = `0${now.getHours()}`.slice(-2);
        const minutes = `0${now.getMinutes()}`.slice(-2);
        const seconds = `0${now.getSeconds()}`.slice(-2);
        this.renderer.setProperty(this.myCounter?.nativeElement, 'textContent',
          `${hours}:${minutes}:${seconds}`);
      }, 1000);
    });
  }

  get myCounter(): ElementRef | undefined {
    return this.counter();
  }
}
