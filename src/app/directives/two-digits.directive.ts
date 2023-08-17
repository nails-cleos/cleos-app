import { Directive, ElementRef, HostListener, Input } from '@angular/core';

@Directive({
  selector: '[appTwoDigits]'
})
export class TwoDigitsDirective {
  @Input() allowNegatives: boolean;

  private regex: RegExp;
  // Allow key codes for special events. Reflect :
  // Backspace, tab, end, home
  private specialKeys: Array<string> = ['Backspace', 'Tab', 'End', 'Home', 'ArrowLeft', 'ArrowRight', 'Del', 'Delete'];

  constructor(private el: ElementRef) {
    this.allowNegatives = false;
    this.regex = new RegExp(/^\d*\.?\d{0,2}$/g);
  }

  @HostListener('keydown', ['$event'])
  onKeyDown(event: KeyboardEvent): void {
    // Allow Backspace, tab, end, and home keys
    if (this.specialKeys.indexOf(event.key) !== -1) {
      return;
    }

    if (this.allowNegatives) {
      this.regex = new RegExp(/(?!^-)\d*\.?\d{0,2}$/g);
    }

    const current: string = this.el.nativeElement.value;
    const position = this.el.nativeElement.selectionStart;
    const next: string = [current.slice(0, position), event.key === 'Decimal' ? '.' : event.key, current.slice(position)].join('');
    if (next && !String(next).match(this.regex) || String(next).match(new RegExp(/^0[0-9]$/g))) {
      event.preventDefault();
    }
  }
}
