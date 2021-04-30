import { Directive, HostListener, ElementRef, Input } from '@angular/core';

@Directive({
  selector: '[appSpecialIsAlphaNumeric]'
})
export class SpecialCharacterDirective {
  @Input() isAlphaNumeric: boolean | undefined;

  regexStr = '^[a-zA-Z0-9_]*$';

  constructor(private el: ElementRef) {
  }

  @HostListener('keypress', ['$event']) onKeyPress(event: any): boolean {
    return new RegExp(this.regexStr).test(event.key);
  }

  @HostListener('paste', ['$event']) blockPaste(event: KeyboardEvent): void {
    this.validateFields(event);
  }

  validateFields(event: any): void {
    setTimeout(() => {
      this.el.nativeElement.value = this.el.nativeElement.value.replace(/[^A-Za-z ]/g, '').replace(/\s/g, '');
      event.preventDefault();
    }, 10);
  }
}
