import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

type Meridiem = 'AM' | 'PM';
type TimepickerView = 'hour' | 'minute';
type TimepickerFormat = 12 | 24;

type DialOption = {
  value: number;
  label: string;
  displayLabel: string;
  top: number;
  left: number;
  active: boolean;
  disabled: boolean;
};

export type ClockTimepickerDialogData = {
  format: TimepickerFormat;
  initialTime?: string;
  max?: string;
  min?: string;
  minutesGap?: number;
};

@Component({
  selector: 'app-clock-timepicker-dialog',
  imports: [MatButtonModule],
  templateUrl: './clock-timepicker-dialog.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrls: ['./clock-timepicker-dialog.component.scss'],
})
export class ClockTimepickerDialogComponent {
  private readonly dialogRef = inject(
    MatDialogRef<ClockTimepickerDialogComponent>,
  );
  private readonly data = inject<ClockTimepickerDialogData>(MAT_DIALOG_DATA);

  readonly format: TimepickerFormat = this.data.format;

  view: TimepickerView = 'hour';
  meridiem: Meridiem = 'AM';
  hour: number = 0;
  minute: number = 0;

  dialOptions: DialOption[] = [];

  private readonly minutesGap: number;
  private readonly min?: number;
  private readonly max?: number;

  constructor() {
    this.minutesGap = this.normalizeMinutesGap(this.data.minutesGap);
    this.min = this.parseTotalMinutes(this.data.min);
    this.max = this.parseTotalMinutes(this.data.max);

    const initial = this.parseTime(this.data.initialTime) || this.nowTime();
    const validTime = this.nearestValidTime(initial.hour, initial.minute);
    this.hour = validTime.hour;
    this.minute = validTime.minute;
    this.meridiem = this.hour >= 12 ? 'PM' : 'AM';
    this.refreshDial();
  }

  get displayHour(): string {
    if (this.format === 24) {
      return this.pad(this.hour);
    }
    const normalizedHour = this.hour % 12 || 12;
    return this.pad(normalizedHour);
  }

  get displayMinute(): string {
    return this.pad(this.minute);
  }

  get handAngle(): number {
    if (this.view === 'minute') {
      return this.minute * 6;
    }

    if (this.format === 24) {
      return (this.hour % 12) * 30;
    }

    const hour12 = this.hour % 12 || 12;
    return (hour12 % 12) * 30;
  }

  get handLength(): number {
    if (this.view === 'minute') {
      return 40;
    }
    if (this.format === 24 && !this.isOuterHour(this.hour)) {
      return 28;
    }
    return 40;
  }

  get isConfirmDisabled(): boolean {
    return !this.isSelectable(this.hour, this.minute);
  }

  setView = (view: TimepickerView): void => {
    if (this.view === view) {
      return;
    }
    this.view = view;
    this.refreshDial();
  };

  setMeridiem = (value: Meridiem): void => {
    if (this.format !== 12 || this.meridiem === value) {
      return;
    }

    if (value === 'AM' && this.hour >= 12) {
      this.hour -= 12;
    } else if (value === 'PM' && this.hour < 12) {
      this.hour += 12;
    }

    this.meridiem = value;
    const validTime = this.nearestValidTime(this.hour, this.minute);
    this.hour = validTime.hour;
    this.minute = validTime.minute;
    this.refreshDial();
  };

  selectDialOption = (option: DialOption): void => {
    if (option.disabled) {
      return;
    }

    if (this.view === 'hour') {
      this.hour = option.value;
      const nextMinute = this.nearestMinuteForHour(this.hour, this.minute);
      if (nextMinute !== undefined) {
        this.minute = nextMinute;
      }
      this.view = 'minute';
      this.refreshDial();
      return;
    }

    this.minute = option.value;
    this.refreshDial();
  };

  cancel = (): void => {
    this.dialogRef.close();
  };

  confirm = (): void => {
    if (this.isConfirmDisabled) {
      return;
    }
    this.dialogRef.close(this.formatTime());
  };

  private refreshDial = (): void => {
    this.dialOptions =
      this.view === 'hour' ? this.buildHourDial() : this.buildMinuteDial();
  };

  private buildHourDial = (): DialOption[] => {
    if (this.format === 24) {
      const outerHours = [0, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23];
      const innerHours = [12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];

      return [
        ...outerHours.map((hour, index) =>
          this.createDialOption(
            hour,
            this.pad(hour),
            index * 30,
            40,
            this.hour === hour,
            !this.hasSelectableMinute(hour),
          ),
        ),
        ...innerHours.map((hour, index) =>
          this.createDialOption(
            hour,
            this.pad(hour),
            index * 30,
            28,
            this.hour === hour,
            !this.hasSelectableMinute(hour),
          ),
        ),
      ];
    }

    const values = [12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
    return values.map((hour12, index) => {
      const hour24 = this.to24Hour(hour12, this.meridiem);
      return this.createDialOption(
        hour24,
        this.pad(hour12),
        index * 30,
        40,
        this.hour === hour24,
        !this.hasSelectableMinute(hour24),
      );
    });
  };

  private buildMinuteDial = (): DialOption[] => {
    const options: DialOption[] = [];
    for (let minute = 0; minute < 60; minute += this.minutesGap) {
      options.push(
        this.createDialOption(
          minute,
          this.pad(minute),
          minute * 6,
          40,
          this.minute === minute,
          !this.isSelectable(this.hour, minute),
          minute % 15 === 0 ? this.pad(minute) : '',
        ),
      );
    }
    return options;
  };

  private createDialOption = (
    value: number,
    label: string,
    angle: number,
    radius: number,
    active: boolean,
    disabled: boolean,
    displayLabel: string = label,
  ): DialOption => ({
    value,
    label,
    displayLabel,
    left: 50 + Math.sin(this.toRadians(angle)) * radius,
    top: 50 - Math.cos(this.toRadians(angle)) * radius,
    active,
    disabled,
  });

  private normalizeMinutesGap = (value?: number): number => {
    if (!value || Number.isNaN(value) || value < 1) {
      return 1;
    }
    return Math.min(Math.floor(value), 30);
  };

  private nearestValidTime = (
    hour: number,
    minute: number,
  ): { hour: number; minute: number } => {
    const roundedMinute = this.roundToGap(minute);
    const target = hour * 60 + roundedMinute;

    let resultHour = hour;
    let resultMinute = roundedMinute;

    if (this.isSelectable(resultHour, resultMinute)) {
      return { hour: resultHour, minute: resultMinute };
    }

    let nearest: { hour: number; minute: number; diff: number } | undefined;

    for (let h = 0; h < 24; h++) {
      for (let m = 0; m < 60; m += this.minutesGap) {
        if (!this.isSelectable(h, m)) {
          continue;
        }
        const diff = Math.abs(h * 60 + m - target);
        if (!nearest || diff < nearest.diff) {
          nearest = { hour: h, minute: m, diff };
        }
      }
    }

    if (nearest) {
      resultHour = nearest.hour;
      resultMinute = nearest.minute;
    }

    return { hour: resultHour, minute: resultMinute };
  };

  private nearestMinuteForHour = (
    hour: number,
    targetMinute: number,
  ): number | undefined => {
    let nearest: { minute: number; diff: number } | undefined;

    for (let minute = 0; minute < 60; minute += this.minutesGap) {
      if (!this.isSelectable(hour, minute)) {
        continue;
      }
      const diff = Math.abs(minute - targetMinute);
      if (!nearest || diff < nearest.diff) {
        nearest = { minute, diff };
      }
    }

    return nearest?.minute;
  };

  private hasSelectableMinute = (hour: number): boolean =>
    this.nearestMinuteForHour(hour, this.minute) !== undefined;

  private isSelectable = (hour: number, minute: number): boolean => {
    const total = hour * 60 + minute;
    if (this.min !== undefined && total < this.min) {
      return false;
    }
    return !(this.max !== undefined && total > this.max);
  };

  private parseTime = (
    value?: string,
  ): { hour: number; minute: number } | undefined => {
    if (!value) {
      return undefined;
    }

    const match = value
      .trim()
      .match(/^(\d{1,2}):(\d{2})(?:\s*([aApP]\.?[mM]\.?))?$/);
    if (!match) {
      return undefined;
    }

    let hour = Number(match[1]);
    const minute = Number(match[2]);
    if (
      Number.isNaN(hour) ||
      Number.isNaN(minute) ||
      minute < 0 ||
      minute > 59
    ) {
      return undefined;
    }

    const meridiem = match[3]?.toLowerCase();
    if (meridiem) {
      if (meridiem.startsWith('p') && hour < 12) {
        hour += 12;
      }
      if (meridiem.startsWith('a') && hour === 12) {
        hour = 0;
      }
    }

    if (hour < 0 || hour > 23) {
      return undefined;
    }

    return { hour, minute };
  };

  private parseTotalMinutes = (value?: string): number | undefined => {
    const parsed = this.parseTime(value);
    if (!parsed) {
      return undefined;
    }
    return parsed.hour * 60 + parsed.minute;
  };

  private formatTime = (): string => {
    if (this.format === 24) {
      return `${this.pad(this.hour)}:${this.pad(this.minute)}`;
    }
    const hour12 = this.hour % 12 || 12;
    return `${this.pad(hour12)}:${this.pad(this.minute)} ${this.meridiem}`;
  };

  private roundToGap = (minute: number): number => {
    const snapped = Math.round(minute / this.minutesGap) * this.minutesGap;
    return snapped >= 60 ? 0 : snapped;
  };

  private nowTime = (): { hour: number; minute: number } => {
    const now = new Date();
    return { hour: now.getHours(), minute: now.getMinutes() };
  };

  private to24Hour = (hour12: number, meridiem: Meridiem): number => {
    if (meridiem === 'AM') {
      return hour12 === 12 ? 0 : hour12;
    }
    return hour12 === 12 ? 12 : hour12 + 12;
  };

  private isOuterHour = (hour: number): boolean => hour === 0 || hour >= 13;

  private toRadians = (degrees: number): number => (degrees * Math.PI) / 180;

  private pad = (value: number): string => `${value}`.padStart(2, '0');
}
