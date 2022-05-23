import { IAvailability, IAvailabilityAll, IRoom } from '../interfaces/room';
import {
  addDays,
  addMonths,
  addWeeks,
  endOfDay,
  endOfMonth,
  endOfWeek,
  startOfDay,
  startOfMonth,
  startOfWeek,
  subDays,
  subMonths,
  subWeeks
} from 'date-fns';
import RRule, { Weekday } from 'rrule';
import { IReservationAll } from '../interfaces/reservation';
import { IProductAll } from '../interfaces/product';
import { IAdditionalAll } from '../interfaces/additional';
import { utcToZonedTime, zonedTimeToUtc } from 'date-fns-tz';

export const API_LOCALE = 'en-GB';

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

export interface ITimeZone {
  label: string;
  tzCode: string;
  gmt: string;
}

export class TimeZone implements ITimeZone {
  label: string;
  tzCode: string;
  gmt: string;

  constructor(label: string, tzCode: string, gmt: string = '') {
    this.label = label;
    this.tzCode = tzCode;
    this.gmt = gmt;
  }
}

export const getDuration = (allDay: boolean, duration?: string): IDuration =>
  allDay || !duration ? new Duration(23, 59) : convertDuration(duration);

export const reservationDuration = (reservation?: IReservationAll): IDuration => {
  let durations: IDuration[] = [];
  if (reservation) {
    if (reservation.additional && reservation.additional.length) {
      durations = reservation.additional.map(value => convertDuration(value.duration));
    }
    durations = [...durations, convertDuration(reservation.product.duration)];
  }

  return sumDurations(durations);
};

export const totalDuration = (product?: IProductAll, additional?: IAdditionalAll[]): IDuration => {
  let durations: IDuration[] = [];
  if (additional && additional.length) {
    durations = additional.map(value => convertDuration(value.duration));
  }
  if (product) {
    durations = [...durations, convertDuration(product.duration)];
  }

  return sumDurations(durations);
};

export const convertDuration = (duration: string): IDuration => {
  const hIndex = duration.indexOf('H');
  const mIndex = duration.indexOf('M');
  const hour = hIndex > -1 ? Number(duration.slice(2, hIndex)) : 0;
  const minute = mIndex > -1 ? Number(duration.slice(hIndex > -1 ? hIndex + 1 : 2, mIndex)) : 0;

  return new Duration(hour, minute);
};

export const sumDurations = (durations: IDuration[]): IDuration => {
  let hours = 0;
  let minutes = 0;
  durations.forEach(value => {
    hours += value.hour;
    minutes += value.minute;
  });

  return timeConvert(minutes, hours);
};

export const getEnd = (start: Date, strDuration?: string): Date => {
  if (strDuration) {
    const duration = convertDuration(strDuration);
    return createNewDate(start, start.getHours() + duration.hour, start.getMinutes() + duration.minute);
  }

  return createNewDate(start, 23, 59, 59, 99);
};

export const getStartEndDay = (week: IAvailability, saturday: IAvailability, sunday: IAvailability, timeZone: string): any => {
  const date: Date = new Date();
  const weekMinMax = getMinAndMax(week, date, timeZone);
  const saturdayMinMax = getMinAndMax(saturday, date, timeZone);
  const sundayMinMax = getMinAndMax(sunday, date, timeZone);

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

export const diffTime = (time: Date, maxHour = 24, diffMin = 0): IDuration => {
  const date = new Date();
  date.setHours(time.getHours(), time.getMinutes());

  const maxDate = new Date();
  maxDate.setHours(maxHour, diffMin);

  const diff = getMinutesBetweenTimes(maxDate, date);
  return timeConvert(diff);
};

export const getDiffTime = (maxDate: Date, minDate: Date): string => {
  const diff = getMinutesBetweenTimes(maxDate, minDate);

  const hours = (diff / 60);
  const diffHour = Math.floor(hours);
  const minutes = (hours - diffHour) * 60;
  const diffMinute = Math.round(minutes);

  const hour = `0${diffHour}`.slice(-2);
  const minute = `0${diffMinute}`.slice(-2);

  return `${hour}:${minute}`;
};

export const getAvailability = (room: IRoom): any => {
  const week: IAvailability = room.availabilities.filter((el: IAvailability) => el.day === 'WEEK')[0];
  const saturday: IAvailability = room.availabilities.filter((el: IAvailability) => el.day === 'SATURDAY')[0];
  const sunday: IAvailability = room.availabilities.filter((el: IAvailability) => el.day === 'SUNDAY')[0];
  let exclude: number[] = [];
  if (!week) {
    exclude = [1, 2, 3, 4, 5];
  }
  if (!saturday) {
    exclude = [...exclude, 6];
  }
  if (!sunday) {
    exclude = [...exclude, 0];
  }
  return {week, saturday, sunday, exclude};
};

export const getMinMaxDate = (day: number, date: any, room: IRoom): any => {
  let av: IAvailabilityAll;
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
  const avStart = av.start.split(':');
  const minDate = new Date(new Date(date).setHours(Number(avStart[0]), Number(avStart[1])));

  const avEnd = av.end.split(':');
  const maxDate = new Date(new Date(date).setHours(Number(avEnd[0]), Number(avEnd[1])));

  return {minDate, maxDate};
};

export const getTime = (date: Date, locale: string): string => date.toLocaleTimeString(locale, {
  hour: '2-digit', minute: '2-digit'
});

export const formatFullDateTime = (date: Date, locale: string): string => date.toLocaleDateString(locale, {
  day: 'numeric', month: 'long', weekday: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit'
});

export const formatFullDate = (date: Date, locale: string): string => date.toLocaleDateString(locale, {
  day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'
});

export const formatDateTime = (date: Date, locale: string): string => {
  const result = date.toLocaleDateString(locale, {
    day: 'numeric', month: 'long', weekday: 'long', hour: '2-digit', minute: '2-digit'
  });

  return result.charAt(0).toUpperCase() + result.slice(1);
};

export const formatDateName = (date: Date, locale: string, measure: any): string => date.toLocaleDateString(locale, {
  day: 'numeric', month: measure, weekday: measure, year: 'numeric'
});

export const localeTimeZoneDate = (locale: string, date?: Date | string, timeZone: string = getCurrentTimeZone()): string =>
  date ? reservationDateTime(newDate(date), locale, timeZone) : '';

export const reservationDateTime = (date: Date, locale: string, timeZone: string = getCurrentTimeZone()): string =>
  date.toLocaleDateString(locale, {
    day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit', timeZone
  });

export const formatDateNameKey = (date: Date, locale: string, measure: any): string => date.toLocaleDateString(locale, {
  day: 'numeric', month: measure, hour: '2-digit', minute: '2-digit'
}).replace(/(?:^|\s|-)+\S/g, (c) => c.toUpperCase());

export const monthViewTitle = (date: Date, locale: string = 'en'): string => date.toLocaleDateString(locale, {
  year: 'numeric', month: 'long'
}).replace(/^\w/, (c) => c.toUpperCase());

export const columnHeader = (date: Date, locale: string = 'en'): string => date.toLocaleDateString(locale, {
  weekday: 'long'
}).replace(/^\w/, (c) => c.toUpperCase());

export const dayViewTitle = (date: Date, locale: string = 'en'): string => date.toLocaleDateString(locale, {
  day: 'numeric', month: 'long', weekday: 'long', year: 'numeric'
}).replace(/^\w/, (c) => c.toUpperCase());

export const formatDateMonth = (date: Date, locale: string = 'en'): string => date.toLocaleTimeString(locale, {
  hour: '2-digit', minute: '2-digit'
}).replace(/^\w/, (c) => c.toUpperCase());

export const formatDateTwoDigit = (date: Date, locale: string): string => date.toLocaleDateString(locale, {
  day: '2-digit', month: '2-digit', year: '2-digit'
});

export const formatDuration = (duration: string, locale: string): string => {
  const d: IDuration = convertDuration(duration);
  return formatTime(d, locale);
};

export const formatTime = (duration: IDuration, locale: string): string =>
  getTime(createDate(duration.hour, duration.minute), locale);

export const getNow = (): Date => new Date();

export const createDateFromString = (stringDate: string): Date => {
  const date = stringDate.split('-');
  return new Date(Number(date[0]), Number(date[1]) - 1, Number(date[2]));
};

export const createDate = (hour: number = 0, minute: number = 0, second: number = 0,
                           mili: number = 0): Date => createNewDate(new Date(), hour, minute, second, mili);

export const createEndDate = (stringDate: string): Date => {
  const d = stringDate.split('-');
  return new Date(Number(d[0]), Number(d[1]) - 1, Number(d[2]), 23, 59, 59, 99);
};

export const createFullDate = (selectDate: Date): Date => {
  const date = new Date();
  date.setFullYear(selectDate.getFullYear(), selectDate.getMonth(), selectDate.getDate());

  return date;
};

// TODO fine
export const newDateTimestamp = (value: number, timeZone: string = getCurrentTimeZone()): Date => {
  const date = new Date(value * 1000);
  return utcToZonedTime(date, timeZone);
};

export const dateToUTC = (date: Date, timeZone: string = getCurrentTimeZone()): Date => zonedTimeToUtc(date, timeZone);

export const createNewDate = (date: Date, hour: number = 0, minute: number = 0, second: number = 0, mili: number = 0): Date => {
  const d = new Date(date);
  d.setHours(hour, minute, second, mili);

  return d;
};

export const dateToTimestamp = (date: Date = new Date()): number => parseInt(`${date.getTime() / 1000}`, 10);

export const stringDateUTCToTimeZone = (date: string): Date => new Date(`${date}.000z`);

export const isSameTimeZone = (timeZone: string = getCurrentTimeZone()): boolean => timeZone === getCurrentTimeZone();

export const newDate = (value: number | string | Date): Date => new Date(value);

export const plusMonthDate = (date: Date, plus: number, day: number): Date => {
  const d = addMonths(new Date(date), plus);
  d.setMonth(d.getMonth(), day);

  return d;
};

export const greaterOrEqualsThan = (date1: Date, date2: Date): boolean => date1 >= date2;

export const greaterOrEqualsThanToday = (date: Date): boolean => date >= createDate();

export const isBetween = (min: Date, max: Date, date: Date): boolean =>
  date >= createNewDate(min) && date <= createNewDate(max, 23, 59, 59, 99);

export type CalendarPeriod = 'day' | 'week' | 'month';

export const addPeriod = (period: CalendarPeriod, date: Date, amount: number): Date => (
  {day: addDays, week: addWeeks, month: addMonths}[period](date, amount)
);

export const subPeriod = (period: CalendarPeriod, date: Date, amount: number): Date => (
  {day: subDays, week: subWeeks, month: subMonths}[period](date, amount)
);

export const startOfPeriod = (period: CalendarPeriod, date: Date): Date => (
  {day: startOfDay, week: startOfWeek, month: startOfMonth}[period](date)
);

export const endOfPeriod = (period: CalendarPeriod, date: Date): Date => (
  {day: endOfDay, week: endOfWeek, month: endOfMonth}[period](date)
);

export const getWeekDay = (day: number): Weekday => {
  const days = [RRule.SU, RRule.MO, RRule.TU, RRule.WE, RRule.TH, RRule.FR, RRule.SA];
  return days[day];
};

export const filterDateRoom = (d: Date | null, room?: IRoom): boolean => {
  const now = createDate();
  const date = (d || now);
  return filterDate(date >= now, date, room);
};

export const filterDate = (result: boolean, date: Date | null, room?: IRoom): boolean => {
  date = date ? date : getNow();
  if (room) {
    const day = date.getDay();
    const {week, saturday, sunday} = getAvailability(room);
    if (!week) {
      result = result && (day === 0 || day === 6);
    }
    if (!sunday) {
      result = result && day !== 0;
    }
    if (!saturday) {
      result = result && day !== 6;
    }
  }
  return result;
};

export const getTimeZoneFromDate = (date: Date, timezone?: string): ITimeZone => {
  const currentTimeZone: string = getCurrentTimeZone();
  const currentGMT = getGMT(currentTimeZone, date);

  if (timezone) {
    const gmt = getGMT(timezone, date);
    return new TimeZone(`${timezone} (${gmt})`, timezone, gmt !== currentGMT ? gmt : '');
  }

  return new TimeZone(`${currentTimeZone} (${currentGMT})`, currentTimeZone);
};

export const getTimeZone = (timezone?: string): ITimeZone => {
  const date = new Date();
  return getTimeZoneFromDate(date, timezone);
};

const getMinAndMax = (availability: IAvailability, date: Date, timeZone: string): any => {
  let min;
  let max;
  if (availability) {
    if (availability.start) {
      const start = availability.start.split(':');
      min = dateToUTC(createNewDate(date, Number(start[0]), Number(start[1])), timeZone);
    }
    if (availability.end) {
      const end = availability.end.split(':');
      max = dateToUTC(createNewDate(date, Number(end[0]), Number(end[1])), timeZone);
    }
  }
  return {min, max};
};

const getMinutesBetweenTimes = (date1: Date, date2: Date): number =>
  Math.abs(Math.round((date1.getTime() - date2.getTime()) / (1000 * 60)));

const timeConvert = (time: number, hour: number = 0) => {
  const hours = (time / 60);
  const diffHour = Math.floor(hours);
  const minutes = (hours - diffHour) * 60;
  const diffMinute = Math.round(minutes);

  return new Duration(diffHour + hour, diffMinute);
};

const getGMT = (timeZone: string, date: Date): string => {
  let gmt = date.toLocaleTimeString('en-US', {timeZone, timeZoneName: 'short'}).split(' ')[2];
  if (gmt.indexOf(':') === -1) {
    gmt = `${gmt}:00`;
  }

  if (gmt.length === 8) {
    gmt = gmt.slice(0, 4) + '0' + gmt.slice(4);
  }

  return gmt;
};

const getUTC = (timeZone: string, date: Date): string => getGMT(timeZone, date).replace('GMT', '');

export const timestamp = (date: Date, timeZone: string = getCurrentTimeZone()): Date =>
  new Date(`${date.toISOString().split('T')[0]}T${getTime(date, API_LOCALE)}:00.000${getUTC(timeZone, date)}`);

export const getCurrentTimeZone = (): string => Intl.DateTimeFormat().resolvedOptions().timeZone;
