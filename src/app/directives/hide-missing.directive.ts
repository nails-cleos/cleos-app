import { Directive, ElementRef, HostListener } from '@angular/core';

@Directive({
  selector: '[appHideMissing]'
})
export class HideMissingDirective {

  constructor(private el: ElementRef) {
  }

  @HostListener('error')
  private onError(): void {
    this.el.nativeElement.style.display = 'none';
  }
}
