import { IAvailability, IRoom } from '../interfaces/room';

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

export const convertDuration = (duration: string): IDuration => {
  const hIndex = duration.indexOf('H');
  const mIndex = duration.indexOf('M');
  const hour = hIndex > -1 ? Number(duration.slice(2, hIndex)) : 0;
  const minute = mIndex > -1 ? Number(duration.slice(hIndex > -1 ? hIndex + 1 : 2, mIndex)) : 0;

  return new Duration(hour, minute);
};

export const getStartEndDay = (week: IAvailability, saturday: IAvailability, sunday: IAvailability): any => {
  const date: Date = new Date();
  const weekMinMax = cetMinAndMax(week, date);
  const saturdayMinMax = cetMinAndMax(saturday, date);
  const sundayMinMax = cetMinAndMax(sunday, date);

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

  if ([15, 45].indexOf(min.getMinutes()) > 0 || [15, 45].indexOf(max.getMinutes()) > 0) {
    min.setHours(min.getHours() + 1, 0);
  } else {
    min.setHours(min.getHours(), 0);
  }

  return {min, max};
};

export const cetMinAndMax = (availability: IAvailability, date: Date): any => {
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
};

export const diffTime = (time: Date, maxHour = 24, diffMin = 0): any => {
  const date = new Date();
  date.setHours(time.getHours(), time.getMinutes());

  const maxDate = new Date();
  maxDate.setHours(maxHour, diffMin);

  const diff = Math.abs(Math.round((maxDate.getTime() - date.getTime()) / (1000 * 60)));

  const hours = (diff / 60);
  const diffHour = Math.floor(hours);
  const minutes = (hours - diffHour) * 60;
  const diffMinute = Math.round(minutes);

  return {diffHour, diffMinute};
};

export const getAvailability = (room: IRoom): any => {
  const week: IAvailability = room.availabilities.filter((el: IAvailability) => el.day === 'WEEK')[0];
  const saturday: IAvailability = room.availabilities.filter((el: IAvailability) => el.day === 'SATURDAY')[0];
  const sunday: IAvailability = room.availabilities.filter((el: IAvailability) => el.day === 'SUNDAY')[0];
  return {week, saturday, sunday};
};

export const getMinMaxDate = (day: number, date: any, room: IRoom): any => {
  let minDate;
  let maxDate;
  let av: IAvailability;
  const {week, saturday, sunday} = getAvailability(room);
  switch (day) {
    case 0:
      av = sunday;
      break;
    case 6:
      av = saturday;
      break;
    default:
      av = week;
      break;
  }
  if (av.start) {
    const avStart = av.start.split(':');
    minDate = new Date(new Date(date).setHours(Number(avStart[0]), Number(avStart[1])));
  }

  if (av.end) {
    const avEnd = av.end.split(':');
    maxDate = new Date(new Date(date).setHours(Number(avEnd[0]), Number(avEnd[1])));
  }

  return {minDate, maxDate};
};

export const getTime = (time: Date): string => {
  const hours = `0${time.getHours()}`.slice(-2);
  const minutes = `0${time.getMinutes()}`.slice(-2);

  return `${hours}:${minutes}`;
};
