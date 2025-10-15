import { TwoDigitsDirective } from './two-digits.directive';
import { ElementRef } from '@angular/core';
import { TestBed } from '@angular/core/testing';

describe('TwoDigitsDirective', () => {
  let directive: TwoDigitsDirective;
  let mockElementRef: ElementRef;
  let mockInputElement: HTMLInputElement;

  beforeEach(() => {
    mockInputElement = document.createElement('input');
    mockElementRef = new ElementRef(mockInputElement);

    TestBed.configureTestingModule({
      providers: [
        TwoDigitsDirective,
        { provide: ElementRef, useValue: mockElementRef },
      ],
    });

    directive = TestBed.inject(TwoDigitsDirective);
  });

  it('should create an instance', () => {
    expect(directive).toBeTruthy();
  });

  it('should initialize with default values', () => {
    expect(directive.allowNegatives).toBeFalse();
  });

  it('should allow special keys', () => {
    const specialKeys = ['Backspace', 'Tab', 'End', 'Home', 'ArrowLeft', 'ArrowRight', 'Del', 'Delete'];
    
    specialKeys.forEach(key => {
      const event = new KeyboardEvent('keydown', { key });
      spyOn(event, 'preventDefault');
      
      directive.onKeyDown(event);
      
      expect(event.preventDefault).not.toHaveBeenCalled();
    });
  });

  it('should allow valid numeric input', () => {
    const validInputs = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'];
    
    validInputs.forEach(key => {
      mockInputElement.value = '';
      mockInputElement.selectionStart = 0;
      
      const event = new KeyboardEvent('keydown', { key });
      spyOn(event, 'preventDefault');
      
      directive.onKeyDown(event);
      
      expect(event.preventDefault).not.toHaveBeenCalled();
    });
  });

  it('should allow decimal point', () => {
    mockInputElement.value = '12';
    mockInputElement.selectionStart = 2;
    
    const event = new KeyboardEvent('keydown', { key: '.' });
    spyOn(event, 'preventDefault');
    
    directive.onKeyDown(event);
    
    expect(event.preventDefault).not.toHaveBeenCalled();
  });

  it('should handle Decimal key as decimal point', () => {
    mockInputElement.value = '12';
    mockInputElement.selectionStart = 2;
    
    const event = new KeyboardEvent('keydown', { key: 'Decimal' });
    spyOn(event, 'preventDefault');
    
    directive.onKeyDown(event);
    
    expect(event.preventDefault).not.toHaveBeenCalled();
  });

  it('should allow up to 2 decimal places', () => {
    mockInputElement.value = '12.3';
    mockInputElement.selectionStart = 4;
    
    const event = new KeyboardEvent('keydown', { key: '4' });
    spyOn(event, 'preventDefault');
    
    directive.onKeyDown(event);
    
    expect(event.preventDefault).not.toHaveBeenCalled();
  });

  it('should prevent more than 2 decimal places', () => {
    mockInputElement.value = '12.34';
    mockInputElement.selectionStart = 5;
    
    const event = new KeyboardEvent('keydown', { key: '5' });
    spyOn(event, 'preventDefault');
    
    directive.onKeyDown(event);
    
    expect(event.preventDefault).toHaveBeenCalled();
  });

  it('should prevent multiple decimal points', () => {
    mockInputElement.value = '12.34';
    mockInputElement.selectionStart = 5;
    
    const event = new KeyboardEvent('keydown', { key: '.' });
    spyOn(event, 'preventDefault');
    
    directive.onKeyDown(event);
    
    expect(event.preventDefault).toHaveBeenCalled();
  });

  it('should prevent leading zeros followed by digits', () => {
    mockInputElement.value = '0';
    mockInputElement.selectionStart = 1;
    
    const event = new KeyboardEvent('keydown', { key: '1' });
    spyOn(event, 'preventDefault');
    
    directive.onKeyDown(event);
    
    expect(event.preventDefault).toHaveBeenCalled();
  });

  it('should allow leading zero followed by decimal', () => {
    mockInputElement.value = '0';
    mockInputElement.selectionStart = 1;
    
    const event = new KeyboardEvent('keydown', { key: '.' });
    spyOn(event, 'preventDefault');
    
    directive.onKeyDown(event);
    
    expect(event.preventDefault).not.toHaveBeenCalled();
  });

  it('should prevent non-numeric characters', () => {
    const invalidKeys = ['a', 'b', 'c', '!', '@', '#', '$', '%'];
    
    invalidKeys.forEach(key => {
      mockInputElement.value = '12';
      mockInputElement.selectionStart = 2;
      
      const event = new KeyboardEvent('keydown', { key });
      spyOn(event, 'preventDefault');
      
      directive.onKeyDown(event);
      
      expect(event.preventDefault).toHaveBeenCalled();
    });
  });

  describe('with allowNegatives enabled', () => {
    beforeEach(() => {
      directive.allowNegatives = true;
    });

    it('should allow negative numbers when allowNegatives is true', () => {
      mockInputElement.value = '';
      mockInputElement.selectionStart = 0;
      
      const event = new KeyboardEvent('keydown', { key: '-' });
      spyOn(event, 'preventDefault');
      
      directive.onKeyDown(event);
      
      expect(event.preventDefault).not.toHaveBeenCalled();
    });

    it('should allow digits after negative sign', () => {
      mockInputElement.value = '-';
      mockInputElement.selectionStart = 1;
      
      const event = new KeyboardEvent('keydown', { key: '5' });
      spyOn(event, 'preventDefault');
      
      directive.onKeyDown(event);
      
      expect(event.preventDefault).not.toHaveBeenCalled();
    });

    it('should allow negative decimal numbers', () => {
      mockInputElement.value = '-12';
      mockInputElement.selectionStart = 3;
      
      const event = new KeyboardEvent('keydown', { key: '.' });
      spyOn(event, 'preventDefault');
      
      directive.onKeyDown(event);
      
      expect(event.preventDefault).not.toHaveBeenCalled();
    });
  });
});
