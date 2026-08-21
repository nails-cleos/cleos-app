import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { of, Subject } from 'rxjs';

import { ClockTimepickerDialogComponent } from './clock-timepicker-dialog.component';
import { TimepickerComponent } from './timepicker.component';
import { TimepickerDirective } from './timepicker.directive';

@Component({
  template: `
    <input
      [formControl]="control"
      [format]="format"
      [max]="max"
      [min]="min"
      [timepicker]="picker"
    />
    <app-timepicker
      #picker
      [minutesGap]="minutesGap"
      (timeSet)="lastTimeSet = $event"
    ></app-timepicker>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, TimepickerDirective, TimepickerComponent],
})
class HostComponent {
  control = new FormControl('09:00');
  format = 24;
  min = '';
  max = '';
  minutesGap = 15;
  lastTimeSet?: string;
}

describe('TimepickerDirective', () => {
  let fixture: ComponentFixture<HostComponent>;
  let host: HostComponent;
  let directive: TimepickerDirective;
  let picker: TimepickerComponent;
  let inputElement: HTMLInputElement;
  let dialogRefSpy: Pick<
    MatDialogRef<ClockTimepickerDialogComponent>,
    'afterClosed'
  > & {
    afterClosed: ReturnType<typeof vi.fn>;
  };
  let matDialogSpy: Pick<MatDialog, 'open'> & {
    open: ReturnType<typeof vi.fn>;
  };

  beforeEach(async () => {
    dialogRefSpy = {
      afterClosed: vi.fn().mockName('MatDialogRef.afterClosed'),
    };
    dialogRefSpy.afterClosed.mockReturnValue(of(undefined));

    matDialogSpy = {
      open: vi.fn().mockName('MatDialog.open'),
    };
    matDialogSpy.open.mockReturnValue(dialogRefSpy);

    await TestBed.configureTestingModule({
      imports: [HostComponent],
      providers: [{ provide: MatDialog, useValue: matDialogSpy }],
      teardown: {
        destroyAfterEach: true,
      },
    }).compileComponents();

    fixture = TestBed.createComponent(HostComponent);
    host = fixture.componentInstance;
    fixture.detectChanges();

    const inputDebug = fixture.debugElement.query(
      By.directive(TimepickerDirective),
    );
    directive = inputDebug.injector.get(TimepickerDirective);
    inputElement = inputDebug.nativeElement as HTMLInputElement;

    const pickerDebug = fixture.debugElement.query(
      By.directive(TimepickerComponent),
    );
    picker = pickerDebug.componentInstance;
  });

  it('should create', () => {
    expect(directive).toBeTruthy();
  });

  it('should open dialog with mapped config and data', () => {
    fixture = TestBed.createComponent(HostComponent);
    host = fixture.componentInstance;

    // ✅ SET BEFORE FIRST DETECT CHANGES
    host.format = 12;
    host.minutesGap = 20;
    host.min = '07:00';
    host.max = '18:00';
    host.control.setValue('08:15');

    fixture.detectChanges();

    const inputDebug = fixture.debugElement.query(
      By.directive(TimepickerDirective),
    );
    directive = inputDebug.injector.get(TimepickerDirective);

    directive.open();

    expect(matDialogSpy.open).toHaveBeenCalled();
    const [componentType, config] = vi.mocked(matDialogSpy.open).mock
      .lastCall as [unknown, any];

    expect(componentType).toBe(ClockTimepickerDialogComponent);
    expect(config.data).toEqual(
      expect.objectContaining({
        format: 12,
        initialTime: '08:15',
        min: '07:00',
        max: '18:00',
        minutesGap: 20,
      }),
    );
  });

  it('should apply selected time to input and form control and emit timeSet', () => {
    dialogRefSpy.afterClosed.mockReturnValue(of('11:45'));
    const dispatchSpy = vi.spyOn(inputElement, 'dispatchEvent');

    directive.open();

    expect(inputElement.value).toBe('11:45');
    expect(host.control.value).toBe('11:45');
    expect(host.control.dirty).toBe(true);
    expect(host.control.touched).toBe(true);
    expect(host.lastTimeSet).toBe('11:45');

    const emittedEventTypes = vi
      .mocked(dispatchSpy)
      .mock.calls.map(([event]) => (event as Event).type);
    expect(emittedEventTypes).toEqual(['input', 'change']);
  });

  it('should ignore dialog close when no time was selected', () => {
    host.control.setValue('09:00');
    dialogRefSpy.afterClosed.mockReturnValue(of(undefined));

    directive.open();

    expect(host.control.value).toBe('09:00');
    expect(host.lastTimeSet).toBeUndefined();
  });

  it('should not open when input is disabled', () => {
    inputElement.disabled = true;

    directive.open();

    expect(matDialogSpy.open).not.toHaveBeenCalled();
  });

  it('should not open a second dialog while one is still active', () => {
    const close$ = new Subject<string | undefined>();
    dialogRefSpy.afterClosed.mockReturnValue(close$.asObservable());

    directive.open();
    directive.open();

    expect(matDialogSpy.open).toHaveBeenCalledTimes(1);

    close$.next(undefined);
    close$.complete();

    directive.open();
    expect(matDialogSpy.open).toHaveBeenCalledTimes(2);
  });

  it('should open from app-timepicker.open()', () => {
    picker.open();

    expect(matDialogSpy.open).toHaveBeenCalled();
  });

  it('should prevent default and open on Enter key', () => {
    const event: Event = new KeyboardEvent('keydown', { key: 'Enter' });
    vi.spyOn(event, 'preventDefault').mockReturnValue(undefined);
    const openSpy = vi.spyOn(directive, 'open').mockReturnValue(undefined);

    directive.onEnter(event);

    expect(event.preventDefault).toHaveBeenCalled();
    expect(openSpy).toHaveBeenCalled();
  });

  it('should prevent default and open on Space key', () => {
    const event: Event = new KeyboardEvent('keydown', { key: ' ' });
    vi.spyOn(event, 'preventDefault').mockReturnValue(undefined);
    const openSpy = vi.spyOn(directive, 'open').mockReturnValue(undefined);

    directive.onSpace(event);

    expect(event.preventDefault).toHaveBeenCalled();
    expect(openSpy).toHaveBeenCalled();
  });

  it('should unregister itself from picker on destroy', () => {
    directive.ngOnDestroy();

    picker.open();

    expect(matDialogSpy.open).not.toHaveBeenCalled();
  });
});
