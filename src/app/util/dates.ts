import { IAvailability } from '../interfaces/room';

export interface IDuration {
  hour: number;
  minute: number;
}

export class Duration implements IDuration {
  hour: number;
  minute: number;

  constructor(hour: number = 0, minute: number = 0) {
    this.hour = hour;
    this.minute = minute;
  }
}

export function ConvertDuration(duration: string): IDuration {
  const hIndex = duration.indexOf('H');
  const mIndex = duration.indexOf('M');
  const hour = hIndex > -1 ? Number(duration.slice(2, hIndex)) : 0;
  const minute = mIndex > -1 ? Number(duration.slice(hIndex > -1 ? hIndex + 1 : 2, mIndex)) : 0;

  return new Duration(hour, minute);
}

export function GetStartEndDay(week: IAvailability, saturday: IAvailability, sunday: IAvailability): any {
  const date: Date = new Date();
  const weekMinMax = GetMinAndMax(week, date);
  const saturdayMinMax = GetMinAndMax(saturday, date);
  const sundayMinMax = GetMinAndMax(sunday, date);

  let min: Date = weekMinMax.min;
  let max: Date = weekMinMax.max;

  if (!min || saturdayMinMax.min < min) {
    min = saturdayMinMax.min;
  }
  if (sundayMinMax.min < min) {
    min = sundayMinMax.min;
  }

  if (!max || saturdayMinMax.max > max) {
    max = saturdayMinMax.max;
  }
  if (sundayMinMax.max > max) {
    max = sundayMinMax.max;
  }

  return {min, max};
}

export function GetMinAndMax(availability: IAvailability, date: Date): any {
  let min;
  let max;
  if (availability) {
    if (availability.start) {
      const start = availability.start.split(':');
      min = new Date(date.setHours(Number(start[0]), Number(start[1])));
    }
    if (availability.end) {
      const end = availability.end.split(':');
      max = new Date(date.setHours(Number(end[0]), Number(end[1])));
    }
  }
  return {min, max};
}
