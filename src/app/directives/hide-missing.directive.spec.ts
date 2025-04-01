import { HideMissingDirective } from './hide-missing.directive';
import { ElementRef } from '@angular/core';

describe('HideMissingDirective', () => {
  it('should create an instance', () => {
    const directive = new HideMissingDirective(new ElementRef(null));
    expect(directive).toBeTruthy();
  });

  it('should hide the element on error', () => {
    const element = document.createElement('img');
    const directive = new HideMissingDirective(new ElementRef(element));
    directive.onError();
    expect(element.style.display).toBe('none');
  });
});
