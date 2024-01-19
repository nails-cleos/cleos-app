import { IAvailability, IAvailabilityAll, IRoom, IRoomAll } from '../interfaces/room';
import {
  addDays, addMinutes,
  addMonths,
  addWeeks,
  endOfDay,
  endOfMonth,
  endOfWeek,
  getQuarter,
  isSameDay,
  startOfDay,
  startOfMonth,
  startOfWeek,
  subDays,
  subMonths,
  subWeeks
} from 'date-fns';
import { RRule, Weekday } from 'rrule';
import { IReservation, IReservationAll } from '../interfaces/reservation';
import { ITreatmentAll } from '../interfaces/treatment';
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

export const daysOfWeek: string[] = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];

export const findDayOfWeek = (day: string): number => daysOfWeek.findIndex(x => x === day);


export const getDuration = (allDay: boolean, duration?: string): IDuration =>
  allDay || !duration ? new Duration(23, 59) : convertDuration(duration);

export const reservationDuration = (reservation?: IReservationAll): IDuration => {
  let durations: IDuration[] = [];
  if (reservation) {
    if (reservation.additional && reservation.additional.length) {
      durations = reservation.additional.map(value => convertDuration(value.duration));
    }
    durations = [...durations, convertDuration(reservation.treatment.duration)];
  }

  return sumDurations(durations);
};

export const totalDuration = (treatment: ITreatmentAll, additional?: IAdditionalAll[]) => {
  let additionalDuration: IDuration = new Duration();
  if (additional && additional.length) {
    additionalDuration = sumDurations(additional.map(value => convertDuration(value.duration)));
  }
  const treatmentDuration = convertDuration(treatment.duration);
  const duration = sumDurations([treatmentDuration, additionalDuration]);

  return { additionalDuration, duration };
};

export const getDurationOrUndefined = (duration?: string): IDuration | undefined => duration ? convertDuration(duration) : undefined;

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

export const getEnd = (start: Date, strDuration?: string): Date => getEndWithDuration(start,
  strDuration ? convertDuration(strDuration) : undefined);

export const getEndWithDuration = (start: Date, duration?: IDuration): Date => {
  if (duration) {
    return createNewDate(start, start.getHours() + duration.hour, start.getMinutes() + duration.minute);
  }
  return createNewDate(start, 23, 59, 59, 99);
};

export const getRoomStartEndDay = (availability: IAvailability, timeZone: string,
                                   viewDate: Date = getNow()): { min: Date; max: Date } => {
  const availabilityMinMax = getMinAndMax(availability, viewDate, timeZone);

  const min: Date = availabilityMinMax.min;
  const max: Date = availabilityMinMax.max;

  return min && max ? formatMinMax(min, max) : { min, max };
};

export const getStartEndDay = (monday: IAvailability, tuesday: IAvailability, wednesday: IAvailability,
                               thursday: IAvailability, friday: IAvailability, saturday: IAvailability,
                               sunday: IAvailability, timeZone: string): any => {
  const date: Date = new Date();
  const mondayMinMax = getMinAndMax(monday, date, timeZone);
  const tuesdayMinMax = getMinAndMax(tuesday, date, timeZone);
  const wednesdayMinMax = getMinAndMax(wednesday, date, timeZone);
  const thursdayMinMax = getMinAndMax(thursday, date, timeZone);
  const fridayMinMax = getMinAndMax(friday, date, timeZone);
  const saturdayMinMax = getMinAndMax(saturday, date, timeZone);
  const sundayMinMax = getMinAndMax(sunday, date, timeZone);

  let min: Date = mondayMinMax.min;
  let max: Date = mondayMinMax.max;

  if (!min || tuesdayMinMax.min < min) {
    min = tuesdayMinMax.min;
  }
  if (!max || wednesdayMinMax.min < min) {
    min = wednesdayMinMax.min;
  }
  if (!max || thursdayMinMax.min < min) {
    min = thursdayMinMax.min;
  }
  if (!max || fridayMinMax.min < min) {
    min = fridayMinMax.min;
  }
  if (!min || saturdayMinMax.min < min) {
    min = saturdayMinMax.min;
  }
  if (sundayMinMax.min < min) {
    min = sundayMinMax.min;
  }

  if (!max || tuesdayMinMax.max > max) {
    max = tuesdayMinMax.max;
  }
  if (wednesdayMinMax.max > max) {
    max = wednesdayMinMax.max;
  }
  if (!max || thursdayMinMax.max > max) {
    max = thursdayMinMax.max;
  }
  if (fridayMinMax.max > max) {
    max = fridayMinMax.max;
  }
  if (!max || saturdayMinMax.max > max) {
    max = saturdayMinMax.max;
  }
  if (sundayMinMax.max > max) {
    max = sundayMinMax.max;
  }

  return formatMinMax(min, max);
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

  const hour = `0${ diffHour }`.slice(-2);
  const minute = `0${ diffMinute }`.slice(-2);

  return `${ hour }:${ minute }`;
};

export const getAvailability = (room: IRoom): any => {
  if (room.availabilities) {
    const monday: IAvailability = room.availabilities.filter((el: IAvailability) => el.day === 'MONDAY')[0];
    const tuesday: IAvailability = room.availabilities.filter((el: IAvailability) => el.day === 'TUESDAY')[0];
    const wednesday: IAvailability = room.availabilities.filter((el: IAvailability) => el.day === 'WEDNESDAY')[0];
    const thursday: IAvailability = room.availabilities.filter((el: IAvailability) => el.day === 'THURSDAY')[0];
    const friday: IAvailability = room.availabilities.filter((el: IAvailability) => el.day === 'FRIDAY')[0];
    const saturday: IAvailability = room.availabilities.filter((el: IAvailability) => el.day === 'SATURDAY')[0];
    const sunday: IAvailability = room.availabilities.filter((el: IAvailability) => el.day === 'SUNDAY')[0];
    let exclude: number[] = [];
    if (!monday) {
      exclude = [...exclude, 1];
    }
    if (!tuesday) {
      exclude = [...exclude, 2];
    }
    if (!wednesday) {
      exclude = [...exclude, 3];
    }
    if (!thursday) {
      exclude = [...exclude, 4];
    }
    if (!friday) {
      exclude = [...exclude, 5];
    }
    if (!saturday) {
      exclude = [...exclude, 6];
    }
    if (!sunday) {
      exclude = [...exclude, 0];
    }
    return { monday, tuesday, wednesday, thursday, friday, saturday, sunday, exclude };
  }
};

export const getMinMaxDate = (day: number, date: any, rooms: IRoomAll[]): any => {
  let minDate: Date | undefined;
  let maxDate: Date | undefined;

  let mondayAv: any;
  let tuesdayAv: any;
  let wednesdayAv: any;
  let thursdayAv: any;
  let fridayAv: any;
  let saturdayAv: any;
  let sundayAv: any;

  rooms.forEach(room => {
    let av: IAvailabilityAll;
    const { monday, tuesday, wednesday, thursday, friday, saturday, sunday } = getAvailability(room);

    mondayAv = mondayAv ?? monday;
    tuesdayAv = tuesdayAv ?? tuesday;
    wednesdayAv = wednesdayAv ?? wednesday;
    thursdayAv = thursdayAv ?? thursday;
    fridayAv = fridayAv ?? friday;
    saturdayAv = saturdayAv ?? saturday;
    sundayAv = sundayAv ?? sunday;

    switch (day) {
      case 0:
        av = sunday;
        break;
      case 1:
        av = monday;
        break;
      case 2:
        av = tuesday;
        break;
      case 3:
        av = wednesday;
        break;
      case 4:
        av = thursday;
        break;
      case 5:
        av = friday;
        break;
      default:
        av = saturday;
        break;
    }
    const { min, max } = getMinAndMax(av, date, room.timeZone);

    if (!minDate || min.getTime() < minDate.getTime()) {
      minDate = min;
    }

    if (!maxDate || max.getTime() > maxDate.getTime()) {
      maxDate = max;
    }
  });

  const roomAvailability = {
    availabilities: [mondayAv, tuesdayAv, wednesdayAv, thursdayAv, fridayAv, saturdayAv, sundayAv].filter(
      av => av !== undefined)
  } as IRoom;

  minDate = minDate ?? createNewDate(date);
  maxDate = maxDate ?? createNewDate(date, 23, 59);

  if (isSameDay(minDate, date) && isSameDay(maxDate, date)) {
    return { minDate, maxDate, roomAvailability };
  }

  if (isSameDay(minDate, date)) {
    return { minDate, maxDate: createNewDate(date, 23, 59), roomAvailability };
  }

  return { minDate: createNewDate(date), maxDate, roomAvailability };
};

export const getTime = (date: Date, locale: string = API_LOCALE): string => date.toLocaleTimeString(locale, {
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

export const localeTimeZoneDate = (locale: string, date?: Date | string,
                                   timeZone: string = getCurrentTimeZone()): string =>
  date ? reservationDateTime(newDate(date), locale, timeZone) : '';

export const reservationDateTime = (date: Date, locale: string, timeZone: string = getCurrentTimeZone()): string =>
  date.toLocaleDateString(locale, {
    day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit', timeZone
  });

export const monthViewTitle = (date: Date, locale: string = 'en'): string => date.toLocaleDateString(locale, {
  year: 'numeric', month: 'long'
}).replace(/^\w/, (c) => c.toUpperCase());

export const monthTitle = (date: Date, locale: string, measure: 'long' | 'short'): string => date.toLocaleDateString(locale, {
  month: measure
}).replace(/^\w/, (c) => c.toUpperCase());

export const invoiceTitle = (date: Date): string => date.toLocaleDateString(API_LOCALE, {
  year: 'numeric', month: '2-digit'
});

export const columnHeader = (date: Date, locale: string = 'en'): string => date.toLocaleDateString(locale, {
  weekday: 'long'
}).replace(/^\w/, (c) => c.toUpperCase());

export const dayViewTitle = (date: Date, locale: string = 'en'): string => date.toLocaleDateString(locale, {
  day: 'numeric', month: 'long', weekday: 'long', year: 'numeric'
}).replace(/^\w/, (c) => c.toUpperCase());

export const formatDateHourMinute = (date: Date, locale: string = 'en'): string => date.toLocaleTimeString(locale, {
  hour: '2-digit', minute: '2-digit'
}).replace(/^\w/, (c) => c.toUpperCase());

export const formatDateTwoDigit = (date: Date, locale: string): string => date.toLocaleDateString(locale, {
  day: '2-digit', month: '2-digit', year: '2-digit'
});

export const backendFormatDate = (date?: Date): string | undefined => date?.toLocaleDateString(API_LOCALE, {
  day: '2-digit', month: '2-digit', year: 'numeric'
})?.replace(/\//g, '-');

export const formatDuration = (duration: string, locale: string = API_LOCALE): string => {
  const d: IDuration = convertDuration(duration);
  return formatTime(d, locale);
};

export const formatTime = (duration: IDuration, locale: string = API_LOCALE): string =>
  getTime(createDate(duration.hour, duration.minute), locale);

export const getNow = (): Date => new Date();

export const getNowTimeZone = (timeZone: string = getCurrentTimeZone()): Date => newDateTimestamp(new Date(), timeZone);

export const createDateFromString = (stringDate: string): Date => {
  const date = stringDate.split('-');
  return new Date(Number(date[0]), Number(date[1]) - 1, Number(date[2]));
};

export const createDate = (hour: number = 0, minute: number = 0, second: number = 0,
                           milli: number = 0): Date => createNewDate(new Date(), hour, minute, second, milli);

export const createEndDate = (stringDate: string): Date => {
  const d = stringDate.split('-');
  return new Date(Number(d[0]), Number(d[1]) - 1, Number(d[2]), 23, 59, 59, 99);
};

export const createFullDate = (selectDate: Date): Date => {
  const date = new Date();
  date.setFullYear(selectDate.getFullYear(), selectDate.getMonth(), selectDate.getDate());

  return date;
};

export const newDateTimestamp = (date: string | Date | number = new Date(), timeZone: string = getCurrentTimeZone()): Date => {
  if (typeof date === 'string') {
    return utcToZonedTime(new Date(date), timeZone);
  } else if (date instanceof Date) {
    return utcToZonedTime(date, timeZone);
  }

  return utcToZonedTime(date * 1000, timeZone);
};

export const zoneDateToDate = (value: number = 0, timeZone: string = getCurrentTimeZone()): Date => zonedTimeToUtc(value * 1000, timeZone);

export const dateToUTC = (date: Date, timeZone: string = getCurrentTimeZone()): Date => zonedTimeToUtc(date, timeZone);

export const createNewDate = (date: Date, hour: number = 0, minute: number = 0, second: number = 0,
                              milli: number = 0): Date => {
  const d = new Date(date);
  d.setHours(hour, minute, second, milli);

  return d;
};

export const dateMonthYear = (month: number | string, year: number | string): Date => new Date(Number(year), Number(month), 1);

export const getDateQuarter = (date: Date): number => getQuarter(date);

export const getTimeNumber = (date: any) => {
  if (date instanceof Date) {
    const time = getTime(date).split(':');

    return { hour: Number(time[0]), minute: Number(time[1]) };
  } else if (date) {
    const time = date.split(':');
    let hour = Number(time[0]);
    if (isNaN(time[1])) {
      const format = time[1].slice(2).trim();
      if (format.toLowerCase() === 'pm' || format.toLowerCase() === 'p.m.') {
        hour += 12;
      }
      return { hour, minute: Number(time[1].slice(0, 2)) };
    }
    return { hour, minute: Number(time[1]) };
  }

  return undefined;
};

export const dateToTimestamp = (date: Date = getNow()): number => parseInt(`${ date.getTime() / 1000 }`, 10);

export const isSameTimeZone = (timeZone: string = getCurrentTimeZone()): boolean => {
  if (getCurrentTimeZone() === timeZone) {
    return true;
  }
  const date = new Date();
  return getGMT(timeZone, date) === getGMT(getCurrentTimeZone(), date);
};

export const newDate = (value: number | string | Date): Date => new Date(value);

export const plusMonthDate = (date: Date, plus: number, day: number): Date => {
  const d = addMonths(new Date(date), plus);
  d.setMonth(d.getMonth(), day);

  return d;
};

export const plusDays = (date: Date, plus: number): Date => addDays(new Date(date), plus);
export const plusMinutes = (date: Date, plus: number): Date => addMinutes(date, plus);

export const greaterOrEqualsThan = (date1: Date, date2: Date): boolean => date1 >= date2;

export const greaterOrEqualsThanToday = (date: Date): boolean => date >= createDate();

export const isBetween = (min: Date, max: Date, date: Date): boolean =>
  date >= createNewDate(min) && date <= createNewDate(max, 23, 59, 59, 99);

export type CalendarPeriod = 'day' | 'week' | 'month';

export const addPeriod = (period: CalendarPeriod, date: Date, amount: number): Date => (
  { day: addDays, week: addWeeks, month: addMonths }[period](date, amount)
);

export const subPeriod = (period: CalendarPeriod, date: Date, amount: number): Date => (
  { day: subDays, week: subWeeks, month: subMonths }[period](date, amount)
);

export const startOfPeriod = (period: CalendarPeriod, date: Date): Date => (
  { day: startOfDay, week: startOfWeek, month: startOfMonth }[period](date)
);

export const endOfPeriod = (period: CalendarPeriod, date: Date): Date => (
  { day: endOfDay, week: endOfWeek, month: endOfMonth }[period](date)
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
    const { monday, tuesday, wednesday, thursday, friday, saturday, sunday } = getAvailability(room);
    if (!monday) {
      result = result && day !== 1;
    }
    if (!tuesday) {
      result = result && day !== 2;
    }
    if (!wednesday) {
      result = result && day !== 3;
    }
    if (!thursday) {
      result = result && day !== 4;
    }
    if (!friday) {
      result = result && day !== 5;
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
    return new TimeZone(`${ timezone } (${ gmt })`, timezone, gmt !== currentGMT ? gmt : '');
  }

  return new TimeZone(`${ currentTimeZone } (${ currentGMT })`, currentTimeZone);
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
      const start = getTimeNumber(availability.start);
      min = dateToUTC(createNewDate(date, start?.hour, start?.minute), timeZone);
    }
    if (availability.end) {
      const end = getTimeNumber(availability.end);
      max = dateToUTC(createNewDate(date, end?.hour, end?.minute), timeZone);
    }
  }
  return { min, max };
};

export const getMinutesBetweenTimes = (date1: Date, date2: Date): number =>
  Math.abs(Math.round((date1.getTime() - date2.getTime()) / (1000 * 60)));

export const getReservationGMT = (reservation?: IReservationAll | IReservation): string => {
  let timeZone;
  if (reservation?.room?.timeZone) {
    timeZone = reservation.room.timeZone;
  } else {
    timeZone = getCurrentTimeZone();
  }

  const date = newDateTimestamp(reservation?.timestamp);

  return getUTC(timeZone, date);
};

const timeConvert = (time: number, hour: number = 0) => {
  const hours = (time / 60);
  const diffHour = Math.floor(hours);
  const minutes = (hours - diffHour) * 60;
  const diffMinute = Math.round(minutes);

  return new Duration(diffHour + hour, diffMinute);
};

const getGMT = (timeZone: string, date: Date): string => {
  let gmt = date.toLocaleTimeString('en-US', { timeZone, timeZoneName: 'short' }).split(' ')[2];
  if (gmt.indexOf(':') === -1) {
    gmt = `${ gmt }:00`;
  }

  if (gmt.length === 8) {
    gmt = gmt.slice(0, 4) + '0' + gmt.slice(4);
  }

  return gmt;
};

const getUTC = (timeZone: string, date: Date): string => getGMT(timeZone, date).replace('GMT', '');

export const timestamp = (date: Date, timeZone: string = getCurrentTimeZone()): Date =>
  new Date(`${ date.toISOString().split('T')[0] }T${ getTime(date, API_LOCALE) }:00.000${ getUTC(timeZone, date) }`);

export const getCurrentTimeZone = (): string => Intl.DateTimeFormat().resolvedOptions().timeZone;

const formatMinMax = (min: Date, max: Date): { min: Date; max: Date } => {
  if ([15, 45].indexOf(min.getMinutes()) > 0 || [15, 45].indexOf(max.getMinutes()) > 0) {
    min.setHours(min.getHours() + 1, 0);
  } else {
    min.setHours(min.getHours(), 0);
  }

  return { min, max };
};

export const getWeeksInMonth = (currentDate: Date): { start: any; end: any; dates: any }[] => {
  const weeks: any[] = [];
  const firstDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
  const lastDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
  const numDays = lastDate.getDate();

  let dayOfWeekCounter = firstDate.getDay();

  for (let date = 1; date <= numDays; date++) {
    if (dayOfWeekCounter === 0 || weeks.length === 0) {
      weeks.push([]);
    }
    weeks[weeks.length - 1].push(date);
    dayOfWeekCounter = (dayOfWeekCounter + 1) % 7;
  }

  return weeks
    .filter((w) => !!w.length)
    .map((w) => ({
      start: w[0],
      end: w[w.length - 1],
      dates: w,
    }));
};

export const getDateFormat = (date?: Date | null): string => {
  if (!date) {
    return '';
  }
  const month = (`0${ (date.getMonth()) + 1 }`).slice(-2);
  const year = date.getFullYear();

  return `${ month }-${ year }`;
};
