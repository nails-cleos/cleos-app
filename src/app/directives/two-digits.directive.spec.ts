import { TwoDigitsDirective } from './two-digits.directive';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { beforeEach, describe, expect, it, vi } from 'vitest';

@Component({
  template: '<input appTwoDigits [allowNegatives]="allowNegatives" />',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TwoDigitsDirective],
})
class HostComponent {
  allowNegatives = false;
}

describe('TwoDigitsDirective', () => {
  let fixture: ComponentFixture<HostComponent>;
  let hostComp: HostComponent;
  let directive: TwoDigitsDirective;
  let inputElement: HTMLInputElement;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HostComponent],
    });

    fixture = TestBed.createComponent(HostComponent);
    hostComp = fixture.componentInstance;
    fixture.detectChanges();

    const debugEl = fixture.debugElement.query(
      By.directive(TwoDigitsDirective),
    );
    directive = debugEl.injector.get(TwoDigitsDirective);
    inputElement = debugEl.nativeElement as HTMLInputElement;
  });

  it('should create an instance', () => {
    expect(directive).toBeTruthy();
  });

  it('should initialize with default values', () => {
    expect(directive.allowNegatives()).toBe(false);
  });

  it('should allow special keys', () => {
    const specialKeys = [
      'Backspace',
      'Tab',
      'End',
      'Home',
      'ArrowLeft',
      'ArrowRight',
      'Del',
      'Delete',
    ];

    specialKeys.forEach((key) => {
      const event = new KeyboardEvent('keydown', { key });
      vi.spyOn(event, 'preventDefault').mockReturnValue(undefined);

      directive.onKeyDown(event);

      expect(event.preventDefault).not.toHaveBeenCalled();
    });
  });

  it('should allow valid numeric input', () => {
    const validInputs = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'];

    validInputs.forEach((key) => {
      inputElement.value = '';
      inputElement.selectionStart = 0;

      const event = new KeyboardEvent('keydown', { key });
      vi.spyOn(event, 'preventDefault').mockReturnValue(undefined);

      directive.onKeyDown(event);

      expect(event.preventDefault).not.toHaveBeenCalled();
    });
  });

  it('should allow decimal point', () => {
    inputElement.value = '12';
    inputElement.selectionStart = 2;

    const event = new KeyboardEvent('keydown', { key: '.' });
    vi.spyOn(event, 'preventDefault').mockReturnValue(undefined);

    directive.onKeyDown(event);

    expect(event.preventDefault).not.toHaveBeenCalled();
  });

  it('should handle Decimal key as decimal point', () => {
    inputElement.value = '12';
    inputElement.selectionStart = 2;

    const event = new KeyboardEvent('keydown', { key: 'Decimal' });
    vi.spyOn(event, 'preventDefault').mockReturnValue(undefined);

    directive.onKeyDown(event);

    expect(event.preventDefault).not.toHaveBeenCalled();
  });

  it('should allow up to 2 decimal places', () => {
    inputElement.value = '12.3';
    inputElement.selectionStart = 4;

    const event = new KeyboardEvent('keydown', { key: '4' });
    vi.spyOn(event, 'preventDefault').mockReturnValue(undefined);

    directive.onKeyDown(event);

    expect(event.preventDefault).not.toHaveBeenCalled();
  });

  it('should prevent more than 2 decimal places', () => {
    inputElement.value = '12.34';
    inputElement.selectionStart = 5;

    const event = new KeyboardEvent('keydown', { key: '5' });
    vi.spyOn(event, 'preventDefault').mockReturnValue(undefined);

    directive.onKeyDown(event);

    expect(event.preventDefault).toHaveBeenCalled();
  });

  it('should prevent multiple decimal points', () => {
    inputElement.value = '12.34';
    inputElement.selectionStart = 5;

    const event = new KeyboardEvent('keydown', { key: '.' });
    vi.spyOn(event, 'preventDefault').mockReturnValue(undefined);

    directive.onKeyDown(event);

    expect(event.preventDefault).toHaveBeenCalled();
  });

  it('should prevent leading zeros followed by digits', () => {
    inputElement.value = '0';
    inputElement.selectionStart = 1;

    const event = new KeyboardEvent('keydown', { key: '1' });
    vi.spyOn(event, 'preventDefault').mockReturnValue(undefined);

    directive.onKeyDown(event);

    expect(event.preventDefault).toHaveBeenCalled();
  });

  it('should allow leading zero followed by decimal', () => {
    inputElement.value = '0';
    inputElement.selectionStart = 1;

    const event = new KeyboardEvent('keydown', { key: '.' });
    vi.spyOn(event, 'preventDefault').mockReturnValue(undefined);

    directive.onKeyDown(event);

    expect(event.preventDefault).not.toHaveBeenCalled();
  });

  it('should prevent non-numeric characters', () => {
    const invalidKeys = ['a', 'b', 'c', '!', '@', '#', '$', '%'];

    invalidKeys.forEach((key) => {
      inputElement.value = '12';
      inputElement.selectionStart = 2;

      const event = new KeyboardEvent('keydown', { key });
      vi.spyOn(event, 'preventDefault').mockReturnValue(undefined);

      directive.onKeyDown(event);

      expect(event.preventDefault).toHaveBeenCalled();
    });
  });

  describe('with allowNegatives enabled', () => {
    beforeEach(() => {
      fixture = TestBed.createComponent(HostComponent);
      hostComp = fixture.componentInstance;

      hostComp.allowNegatives = true;

      fixture.detectChanges();

      // re-query directive and input element
      const debugEl = fixture.debugElement.query(
        By.directive(TwoDigitsDirective),
      );
      directive = debugEl.injector.get(TwoDigitsDirective);
      inputElement = debugEl.nativeElement as HTMLInputElement;
    });

    it('should allow negative numbers when allowNegatives is true', () => {
      inputElement.value = '';
      inputElement.selectionStart = 0;

      const event = new KeyboardEvent('keydown', { key: '-' });
      vi.spyOn(event, 'preventDefault').mockReturnValue(undefined);

      directive.onKeyDown(event);

      expect(event.preventDefault).not.toHaveBeenCalled();
    });

    it('should allow digits after negative sign', () => {
      inputElement.value = '-';
      inputElement.selectionStart = 1;

      const event = new KeyboardEvent('keydown', { key: '5' });
      vi.spyOn(event, 'preventDefault').mockReturnValue(undefined);

      directive.onKeyDown(event);

      expect(event.preventDefault).not.toHaveBeenCalled();
    });

    it('should allow negative decimal numbers', () => {
      inputElement.value = '-12';
      inputElement.selectionStart = 3;

      const event = new KeyboardEvent('keydown', { key: '.' });
      vi.spyOn(event, 'preventDefault').mockReturnValue(undefined);

      directive.onKeyDown(event);

      expect(event.preventDefault).not.toHaveBeenCalled();
    });
  });
});
