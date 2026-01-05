import { Directive, ElementRef, HostListener, inject, input } from '@angular/core';

@Directive({
  selector: '[appTwoDigits]',
})
export class TwoDigitsDirective {
  allowNegatives = input<boolean>(false);

  private el: ElementRef = inject(ElementRef);

  private regex: RegExp = new RegExp(/^\d*\.?\d{0,2}$/g);
  // Allow key codes for special events. Reflect :
  // Backspace, tab, end, home
  private specialKeys: Array<string> = ['Backspace', 'Tab', 'End', 'Home', 'ArrowLeft', 'ArrowRight', 'Del', 'Delete'];

  @HostListener('keydown', ['$event']) onKeyDown = (event: KeyboardEvent): void => {
    // Allow Backspace, tab, end, and home keys
    if (this.specialKeys.indexOf(event.key) !== -1) {
      return;
    }

    if (this.allowNegatives()) {
      this.regex = new RegExp(/(?!^-)\d*\.?\d{0,2}$/g);
    }

    const current: string = this.el.nativeElement.value;
    const position = this.el.nativeElement.selectionStart;
    const next: string = [current.slice(0, position), event.key === 'Decimal' ? '.' : event.key,
      current.slice(position)].join('');
    if (next && !String(next).match(this.regex) || String(next).match(new RegExp(/^0[0-9]$/g))) {
      event.preventDefault();
    }
  };
}
