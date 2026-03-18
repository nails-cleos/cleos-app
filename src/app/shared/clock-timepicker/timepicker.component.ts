import { Component, input, output } from '@angular/core';
import type { TimepickerDirective } from './timepicker.directive';

@Component({
  selector: 'app-timepicker',
  template: '',
})
export class TimepickerComponent {
  minutesGap = input(1);

  timeSet = output<string>();

  private attachedDirective?: TimepickerDirective;

  registerDirective = (directive: TimepickerDirective): void => {
    this.attachedDirective = directive;
  };

  unregisterDirective = (directive: TimepickerDirective): void => {
    if (this.attachedDirective === directive) {
      this.attachedDirective = undefined;
    }
  };

  open = (): void => {
    this.attachedDirective?.open();
  };

  emitTimeSet = (time: string): void => {
    this.timeSet.emit(time);
  };
}
