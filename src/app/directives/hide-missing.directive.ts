import { Directive, ElementRef, HostListener, inject } from '@angular/core';

@Directive({
  selector: '[appHideMissing]',
})
export class HideMissingDirective {

  private el = inject(ElementRef);

  @HostListener('error') onError = (): void => {
    this.el.nativeElement.style.display = 'none';
  };
}
