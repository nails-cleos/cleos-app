import { IAvailability } from '../interfaces/room';
import { CalendarEvent } from 'angular-calendar';
import {
  createDate,
  createEndDate,
  createNewDate,
  dateToUTC,
  daysOfWeek,
  getCurrentTimeZone,
  getNow,
  getTimeNumber,
  getWeekDay,
  greaterOrEqualsThan,
  greaterOrEqualsThanToday,
  IDuration,
  plusDays
} from './dates';
import { findStateColor } from './theme';
import { ByWeekday, Frequency, RRule } from 'rrule';
import { isToday } from 'date-fns';
import { createEventColor } from './color';
import { FrequencyEnum } from './helper';

export interface IMeta {
  time?: boolean;
  timeZone?: string;
  state?: string;
  route?: string[];
}

export class Meta implements IMeta {
  time?: boolean;
  timeZone?: string;
  state?: string;
  route?: string[];
  professionalId?: string;
  total?: number;
  id?: string;
  customer?: string;

  constructor(time?: boolean, timeZone?: string, state?: string, route?: string[], professionalId?: string, total?: number, id?: string) {
    this.time = time;
    this.timeZone = timeZone;
    this.state = state;
    this.route = route;
    this.professionalId = professionalId;
    this.total = total;
    this.id = id;
  }
}

export const getFrequency = (repeat: string, start: Date, id: any, title: string, daysInWeek: number, state: string, path: string,
                             endDate?: string, duration?: IDuration, allDay: boolean = false, professionalId?: string, calendarStart?: Date): any => {
  let calendarEnd = plusDays(calendarStart ?? start, daysInWeek);
  if (endDate) {
    const end = createEndDate(endDate);
    if (greaterOrEqualsThan(calendarEnd, end)) {
      calendarEnd = end;
    }
  }
  return {
    id,
    title,
    duration,
    state,
    path,
    allDay,
    professionalId,
    rule: createRule(repeat, start, calendarEnd, start.getDate(), getWeekDay(start.getDay()))
  };
};

export const fillNotAvailable = (unavailable: string, lunch: string, notWorking: string,
                                 selectDate: Date, sunday: IAvailability, saturday: IAvailability,
                                 friday: IAvailability, thursday: IAvailability, wednesday: IAvailability,
                                 tuesday: IAvailability, monday: IAvailability, isDark: boolean = false, maxDate: Date,
                                 timeZone: string = getCurrentTimeZone()): CalendarEvent[] => {
  const recurring = [{
    availabilityList: [monday, tuesday, wednesday, thursday, friday, saturday, sunday],
    rule: new RRule({
      freq: RRule.WEEKLY,
      byweekday: [RRule.SU, RRule.MO, RRule.TU, RRule.WE, RRule.TH, RRule.FR, RRule.SA],
      dtstart: selectDate,
      until: maxDate
    })
  }];
  return recurringEvent(recurring, notWorking, unavailable, lunch, isDark, timeZone);
};

export const newEvent = (title: string, color: string, start: Date, isDarkMode: boolean, end?: Date,
                         id?: string, meta: IMeta = new Meta(),
                         draggable: boolean = false): CalendarEvent | undefined => {
  if (greaterOrEqualsThanToday(start)) {
    return {
      id,
      start,
      end,
      title,
      draggable,
      color: createEventColor(color, isDarkMode),
      meta
    } as unknown as CalendarEvent;
  }
  return undefined;
};

export const calendarEvent = (title: string, color: string, start: Date, isDarkMode: boolean, end?: Date,
                              id?: string, meta: IMeta = new Meta(), draggable: boolean = false): CalendarEvent => ({
  id,
  start,
  end,
  title,
  draggable,
  color: createEventColor(color, isDarkMode),
  meta
} as unknown as CalendarEvent);

export const allDayEvent = (title: string, color: string, start: Date, isDarkMode: boolean, id?: string,
                            meta: IMeta = new Meta()): CalendarEvent => ({
  id,
  start,
  title,
  color: createEventColor(color, isDarkMode),
  meta,
  allDay: true
} as unknown as CalendarEvent);

export const monthEvent = (title: string, start: Date, end: Date | null, id: string, color: string, meta: Meta, isDarkMode: boolean,
                           allDay: boolean = false, draggable: boolean = false): CalendarEvent | undefined => ({
  id,
  start,
  title,
  end,
  color: createEventColor(color, isDarkMode),
  meta,
  draggable,
  allDay
} as unknown as CalendarEvent);

export const getOverlapEvent = (events: any[], eventStartDay: Date, eventEndDay: Date,
                                professionalId?: string): CalendarEvent[] => {
  if (professionalId) {
    return events.filter((eventA: CalendarEvent) => ((eventA.meta?.professionalId === professionalId) && (
      (eventStartDay > eventA.start && eventA.end && eventStartDay < eventA.end)
      || (eventEndDay > eventA.start && eventA.end && eventEndDay < eventA.end)
      || (eventStartDay <= eventA.start && eventA.end && eventEndDay >= eventA.end)
    )));
  }
  return events.filter(
    (eventA: CalendarEvent) => (eventStartDay > eventA.start && eventA.end && eventStartDay < eventA.end)
      || (eventEndDay > eventA.start && eventA.end && eventEndDay < eventA.end)
      || (eventStartDay <= eventA.start && eventA.end && eventEndDay >= eventA.end)
  );
};

// private isAnOverlapEvent(eventStartDay: Date, eventEndDay: Date): CalendarEvent | undefined {
//   return this.events.find((eventA: CalendarEvent) => {
//     if (eventStartDay > eventA.start && eventA.end && eventStartDay < eventA.end) {
//       console.info('start-time in between any of the events');
//       return eventA;
//     }
//     if (eventEndDay > eventA.start && eventA.end && eventEndDay < eventA.end) {
//       console.info('end-time in between any of the events');
//       return eventA;
//     }
//     if (eventStartDay <= eventA.start && eventA.end && eventEndDay >= eventA.end) {
//       console.info('any of the events in between/on the start-time and end-time');
//       return eventA;
//     }
//     return null;
//   });
// }

const recurringEvent = (recurring: any[], notWorking: string, unavailable: string, lunch: string,
                        isDark: boolean, timeZone: string): CalendarEvent[] => {
  let events: CalendarEvent[] = [];

  recurring.forEach(r =>
    r.rule.all().forEach((date: Date) => {
      const availability = r.availabilityList.find((a: IAvailability) => a?.day === daysOfWeek[date.getDay()]);
      const event = createEvent(date, notWorking, unavailable, lunch, isDark, timeZone, availability);
      if (event) {
        events = events.concat(event);
      }
    }));

  return events;
};

const createEvent = (date: Date, notWorking: string, unavailable: string,
                     lunch: string, isDarkMode: boolean, timeZone: string, it?: IAvailability): CalendarEvent[] => {
  let events: CalendarEvent[] = [];
  const newDate = dateToUTC(createNewDate(date), timeZone);
  if (!it) {
    const event = calendarEvent(notWorking, findStateColor('DEFAULT', isDarkMode), newDate,
      isDarkMode, createNewDate(date, 23, 59), 'NOT_WORKING_ALL_DAY');
    events = [...events, event];
  } else {
    const now = getNow();
    const nowTime = getTimeNumber(now)!;
    const hour = nowTime.hour;
    const minute = nowTime.minute;
    if (it.start) {
      const start = getTimeNumber(it.start);
      const endHour = start?.hour;
      const endMinute = start?.minute;
      const eventBefore = calendarEvent(notWorking, findStateColor('DEFAULT', isDarkMode),
        newDate, isDarkMode, dateToUTC(createNewDate(date, endHour, endMinute), timeZone));
      events = [...events, eventBefore];
    }
    if (it.end) {
      const end = getTimeNumber(it.end)!;
      const endHour = end.hour;
      const endMinute = end.minute;
      let startHour = endHour;
      let startMinute = endMinute;
      if (isToday(date) && (hour > endHour || (hour === endHour && minute > endMinute))) {
        startHour = hour;
        startMinute = minute;
      }
      const eventAfter = calendarEvent(notWorking, findStateColor('DEFAULT', isDarkMode),
        dateToUTC(createNewDate(date, startHour, startMinute), timeZone), isDarkMode,
        dateToUTC(createNewDate(date, 23, 59), timeZone));
      events = [...events, eventAfter];
    }
    const ev = createLunchEvent(it, date, unavailable, lunch, isDarkMode, timeZone);
    if (ev) {
      events = [...events, ev];
    }
  }

  return events;
};

const createLunchEvent = (it: IAvailability, date: Date, unavailable: string, lunch: string,
                          isDarkMode: boolean, timeZone: string): CalendarEvent | undefined => {
  const now = getNow();
  const nowTime = getTimeNumber(now)!;
  let hour = nowTime.hour;
  let minute = nowTime.minute;

  if (it.startLunch && it.endLunch) {
    const lunchStart = getTimeNumber(it.startLunch)!;
    const lunchEnd = getTimeNumber(it.endLunch)!;
    const lunchEndHour = lunchEnd.hour;
    const lunchEndMinute = lunchEnd.minute;
    const lunchStartHour = lunchStart.hour;
    const lunchStartMinute = lunchStart.minute;

    if (isToday(date)) {
      if (hour > 23) {
        hour = 23;
        minute = 59;
      } else {
        return lunchEvent(hour, lunchStartHour, minute, lunchStartMinute, lunchEndHour, lunchEndMinute, date, lunch,
          isDarkMode, timeZone);
      }
      const start = dateToUTC(createDate(), timeZone);
      const end = dateToUTC(createDate(hour, minute), timeZone);
      return newEvent(unavailable, findStateColor('DEFAULT', isDarkMode), start, isDarkMode, end);
    } else {
      const start = dateToUTC(createNewDate(date, lunchStartHour, lunchStartMinute), timeZone);
      const end = dateToUTC(createNewDate(date, lunchEndHour, lunchEndMinute), timeZone);
      return newEvent(lunch, findStateColor('DEFAULT', isDarkMode), start, isDarkMode, end);
    }
  }

  return undefined;
};

const lunchEvent = (hour: number, lunchStartHour: number, minute: number, lunchStartMinute: number,
                    lunchEndHour: number,
                    lunchEndMinute: number, date: Date, lunch: string, isDarkMode: boolean,
                    timeZone: string): CalendarEvent | undefined => {
  let lunchHour;
  let lunchMinute;
  if (hour < lunchStartHour || (hour === lunchStartHour && minute < lunchStartMinute)) {
    lunchHour = lunchStartHour;
    lunchMinute = lunchStartMinute;
  } else if ((hour > lunchStartHour || (hour === lunchStartHour && minute > lunchStartMinute))
    && (hour < lunchEndHour || (hour === lunchEndHour && minute < lunchEndMinute))) {
    lunchHour = hour;
    lunchMinute = minute;
  }
  if ((lunchHour || lunchHour === 0) && (lunchMinute || lunchMinute === 0)) {
    const start = dateToUTC(createNewDate(date, lunchHour, lunchMinute), timeZone);
    const end = dateToUTC(createNewDate(date, lunchEndHour, lunchEndMinute), timeZone);
    return newEvent(lunch, findStateColor('DEFAULT', isDarkMode), start, isDarkMode, end);
  }

  return undefined;
};

const createRule = (repeat: string, dtstart: Date, until: Date, monthDay: number, weekDay: ByWeekday): RRule => {
  let freq: Frequency | undefined;
  let byweekday: ByWeekday | undefined;
  let bymonthday: number | undefined;
  switch (repeat) {
    case FrequencyEnum.onceAYear:
      freq = RRule.YEARLY;
      break;
    case FrequencyEnum.onceAMonth:
      freq = RRule.MONTHLY;
      bymonthday = monthDay;
      break;
    case FrequencyEnum.onceAWeek:
      freq = RRule.WEEKLY;
      byweekday = weekDay;
      break;
    case FrequencyEnum.everyDay:
      freq = RRule.DAILY;
      break;
  }

  return new RRule({
    freq,
    bymonthday,
    byweekday,
    dtstart,
    until
  });
};

export const createBullet = (name: string): string => `<div class='detail'>\uD83D\uDC85\uD83C\uDFFB&nbsp;${ name }</div>`;
