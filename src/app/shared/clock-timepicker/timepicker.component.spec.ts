import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TimepickerComponent } from './timepicker.component';
import { beforeEach, describe, expect, it, vi } from 'vitest';

describe('TimepickerComponent', () => {
  let component: TimepickerComponent;
  let fixture: ComponentFixture<TimepickerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TimepickerComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TimepickerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should use 1 as default minutes gap', () => {
    expect(component.minutesGap()).toBe(1);
  });

  it('should allow setting minutes gap via input', () => {
    fixture.componentRef.setInput('minutesGap', 15);
    fixture.detectChanges();

    expect(component.minutesGap()).toBe(15);
  });

  it('should forward open to registered directive', () => {
    const openSpy = vi.fn().mockName('open');

    component.registerDirective({ open: openSpy } as any);
    component.open();

    expect(openSpy).toHaveBeenCalled();
  });

  it('should only unregister the matching directive', () => {
    const first = { open: vi.fn().mockName('open-first') };
    const second = { open: vi.fn().mockName('open-second') };

    component.registerDirective(first as any);
    component.unregisterDirective(second as any);
    component.open();

    expect(first.open).toHaveBeenCalledTimes(1);

    component.unregisterDirective(first as any);
    component.open();

    expect(first.open).toHaveBeenCalledTimes(1);
  });

  it('should emit selected time', () => {
    const emitSpy = vi
      .spyOn(component.timeSet, 'emit')
      .mockReturnValue(undefined);

    component.emitTimeSet('08:30');

    expect(emitSpy).toHaveBeenCalledWith('08:30');
  });
});
