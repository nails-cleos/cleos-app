import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TimepickerComponent } from './timepicker.component';

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
    const openSpy = jasmine.createSpy('open');

    component.registerDirective({ open: openSpy } as any);
    component.open();

    expect(openSpy).toHaveBeenCalled();
  });

  it('should only unregister the matching directive', () => {
    const first = { open: jasmine.createSpy('open-first') };
    const second = { open: jasmine.createSpy('open-second') };

    component.registerDirective(first as any);
    component.unregisterDirective(second as any);
    component.open();

    expect(first.open).toHaveBeenCalledTimes(1);

    component.unregisterDirective(first as any);
    component.open();

    expect(first.open).toHaveBeenCalledTimes(1);
  });

  it('should emit selected time', () => {
    const emitSpy = spyOn(component.timeSet, 'emit');

    component.emitTimeSet('08:30');

    expect(emitSpy).toHaveBeenCalledWith('08:30');
  });
});
