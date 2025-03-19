import { Directive, ElementRef, HostListener } from '@angular/core';

@Directive({
  selector: '[appHideMissing]',
  standalone: true,
})
export class HideMissingDirective {

  constructor(private el: ElementRef) {
  }

  @HostListener('error')
  onError = (): void => {
    this.el.nativeElement.style.display = 'none';
  }
}
