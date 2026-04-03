import { Directive, effect, ElementRef, HostListener, inject, input, OnDestroy } from '@angular/core';
import { NgControl } from '@angular/forms';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { take } from 'rxjs/operators';

import { ClockTimepickerDialogComponent, ClockTimepickerDialogData } from './clock-timepicker-dialog.component';
import { TimepickerComponent } from './timepicker.component';

@Directive({
  // eslint-disable-next-line @angular-eslint/directive-selector
  selector: 'input[timepicker]',
  standalone: true,
})
export class TimepickerDirective implements OnDestroy {
  private readonly elementRef = inject<ElementRef<HTMLInputElement>>(ElementRef);
  private readonly dialog = inject(MatDialog);
  private readonly ngControl = inject(NgControl, { optional: true, self: true });

  private picker?: TimepickerComponent;
  private activeDialogRef?: MatDialogRef<ClockTimepickerDialogComponent>;

  format = input(24);
  timepicker = input<TimepickerComponent | undefined>();

  constructor() {
    effect(() => {
      const value = this.timepicker();

      if (this.picker === value) {
        return;
      }

      this.picker?.unregisterDirective(this);
      this.picker = value;
      this.picker?.registerDirective(this);
    });
  }

  ngOnDestroy(): void {
    this.picker?.unregisterDirective(this);
  }

  @HostListener('click')
  onClick(): void {
    this.open();
  }

  @HostListener('keydown.enter', ['$event'])
  onEnter(event: Event): void {
    event.preventDefault();
    this.open();
  }

  @HostListener('keydown.space', ['$event'])
  onSpace(event: Event): void {
    event.preventDefault();
    this.open();
  }

  open = (): void => {
    const picker = this.picker;
    const nativeInput = this.elementRef.nativeElement;
    if (!picker || nativeInput.disabled || this.activeDialogRef) {
      return;
    }

    const data: ClockTimepickerDialogData = {
      format: this.format() === 24 ? 24 : 12,
      initialTime: nativeInput.value,
      max: nativeInput.max || undefined,
      min: nativeInput.min || undefined,
      minutesGap: picker.minutesGap(),
    };

    this.activeDialogRef = this.dialog.open(ClockTimepickerDialogComponent, {
      autoFocus: false,
      data,
      disableClose: true,
      panelClass: 'clock-timepicker-panel',
      restoreFocus: false,
      width: '340px',
    });

    this.activeDialogRef.afterClosed().pipe(take(1)).subscribe((selectedTime?: string) => {
      this.activeDialogRef = undefined;
      if (!selectedTime) {
        return;
      }
      this.setValue(selectedTime);
      picker.emitTimeSet(selectedTime);
    });
  };

  private setValue = (selectedTime: string): void => {
    const nativeInput = this.elementRef.nativeElement;
    nativeInput.value = selectedTime;

    const control = this.ngControl?.control;
    if (control) {
      control.setValue(selectedTime);
      control.markAsDirty();
      control.markAsTouched();
      control.updateValueAndValidity();
    }

    nativeInput.dispatchEvent(new Event('input', { bubbles: true }));
    nativeInput.dispatchEvent(new Event('change', { bubbles: true }));
  };
}
