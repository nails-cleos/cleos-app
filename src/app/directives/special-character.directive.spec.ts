import { SpecialCharacterDirective } from './special-character.directive';
import { ElementRef } from '@angular/core';

export class MockElementRef extends ElementRef {
  constructor() {
    super(null);
  }
}

describe('SpecialCharacterDirectiveDirective', () => {
  it('should create an instance', () => {
    const directive = new SpecialCharacterDirective(new MockElementRef());
    expect(directive).toBeTruthy();
  });
});
