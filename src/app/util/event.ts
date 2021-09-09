import { IAvailability } from '../interfaces/room';
import { CalendarEvent } from 'angular-calendar';
import { createDate, createNewDate, getNow, greaterOrEqualsThanToday, IDuration } from './dates';
import { findStateColor } from './theme';
import RRule from 'rrule';
import { isToday } from 'date-fns';

export interface IMeta {
  time?: boolean;
  state?: string;
}

export class Meta implements IMeta {
  time?: boolean;
  state?: string;

  constructor(time?: boolean, state?: string) {
    this.time = time;
    this.state = state;
  }
}

export const fillNotAvailable = (unavailable: string, lunch: string, notWorking: string,
                                 selectDate: Date, sunday: IAvailability, saturday: IAvailability, week: IAvailability,
                                 isDark: boolean = false, addToday: boolean = false, maxDate: Date): CalendarEvent[] => {
  let events: CalendarEvent[] = [];
  if (addToday && isToday(selectDate)) {
    const now = getNow();
    const event = newEvent(notWorking, findStateColor('DEFAULT', isDark), createDate(),
      createDate(now.getHours(), now.getMinutes()));
    if (event) {
      events = [...events, event];
    }
  }

  const recurring = [{
    availability: week,
    rule: new RRule({
      freq: RRule.WEEKLY,
      byweekday: [RRule.MO, RRule.TU, RRule.WE, RRule.TH, RRule.FR],
      dtstart: selectDate,
      until: maxDate
    })
  },
    {
      availability: saturday,
      rule: new RRule({
        freq: RRule.WEEKLY,
        byweekday: [RRule.SA],
        dtstart: selectDate,
        until: maxDate
      })
    },
    {
      availability: sunday,
      rule: new RRule({
        freq: RRule.WEEKLY,
        byweekday: [RRule.SU],
        dtstart: selectDate,
        until: maxDate
      })
    }];

  return events.concat(recurringEvent(recurring, notWorking, unavailable, lunch, isDark));
};

const recurringEvent = (recurring: any[], notWorking: string, unavailable: string, lunch: string,
                        isDark: boolean): CalendarEvent[] => {
  let events: CalendarEvent[] = [];

  recurring.forEach(r =>
    r.rule.all().forEach((date: Date) => {
      const event = createEvent(r.availability, date, notWorking, unavailable, lunch, isDark);
      if (event) {
        events = events.concat(event);
      }
    }));

  return events;
};

export const newEvent = (title: string, color: string, start: Date, end?: Date, primary?: string,
                         id?: string, meta: IMeta = new Meta()): CalendarEvent | undefined => {
  if (greaterOrEqualsThanToday(start)) {
    return {
      id,
      start,
      end,
      title,
      color: {
        primary,
        secondary: color
      },
      meta
    } as unknown as CalendarEvent;
  }
  return undefined;
};

export const monthEvent = (title: string, start: Date, end: Date, id: string,
                           color?: string, meta: Meta = new Meta(true)): CalendarEvent | undefined => ({
  id,
  start,
  title,
  end,
  color: {
    primary: color,
    secondary: '#000'
  },
  meta
} as unknown as CalendarEvent);

export const getOverlapEvent = (events: any[], eventStartDay: Date, eventEndDay: Date): CalendarEvent[] =>
  events.filter((eventA: CalendarEvent) => (eventStartDay > eventA.start && eventA.end && eventStartDay < eventA.end)
    || (eventEndDay > eventA.start && eventA.end && eventEndDay < eventA.end)
    || (eventStartDay <= eventA.start && eventA.end && eventEndDay >= eventA.end)
  );

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

const createEvent = (it: IAvailability, date: Date, notWorking: string, unavailable: string,
                     lunch: string, isDarkMode: boolean): CalendarEvent[] => {
  let events: CalendarEvent[] = [];
  if (!it) {
    const event = newEvent(notWorking, findStateColor('DEFAULT', isDarkMode), createNewDate(date),
      createNewDate(date, 23, 59), undefined, 'NOT_WORKING_ALL_DAY');
    if (event) {
      events = [...events, event];
    }
  } else {
    const now = getNow();
    const nowTime = now.toLocaleTimeString('en-GB').split(':');
    const hour = Number(nowTime[0]);
    const minute = Number(nowTime[1]);
    if (it.start) {
      const start = it.start.split(':');
      const endHour = Number(start[0]);
      const endMinute = Number(start[1]);
      let startHour: number | null = 0;
      let startMinute: number | null = 0;
      if (isToday(date)) {
        if (hour < endHour || (hour === endHour && minute < endMinute)) {
          startHour = hour;
          startMinute = minute;
        } else {
          startHour = null;
          startMinute = null;
        }
      }
      if ((startHour || startHour === 0) && (startMinute || startMinute === 0)) {
        const eventBefore = newEvent(notWorking, findStateColor('DEFAULT', isDarkMode),
          createNewDate(date, startHour, startMinute), createNewDate(date, endHour, endMinute));
        if (eventBefore) {
          events = [...events, eventBefore];
        }
      }
    }
    if (it.end) {
      const end = it.end.split(':');
      const endHour = Number(end[0]);
      const endMinute = Number(end[1]);
      let startHour = endHour;
      let startMinute = endMinute;
      if (isToday(date) && (hour > endHour || (hour === endHour && minute > endMinute))) {
        startHour = hour;
        startMinute = minute;
      }
      const eventAfter = newEvent(notWorking, findStateColor('DEFAULT', isDarkMode),
        createNewDate(date, startHour, startMinute), createNewDate(date, 23, 59));
      if (eventAfter) {
        events = [...events, eventAfter];
      }
    }
    const ev = createLunchEvent(it, date, unavailable, lunch, isDarkMode);
    if (ev) {
      events = [...events, ev];
    }
  }

  return events;
};

const createLunchEvent = (it: IAvailability, date: Date, unavailable: string, lunch: string,
                          isDarkMode: boolean): CalendarEvent | undefined => {
  const now = getNow();
  const nowTime = now.toLocaleTimeString('en-GB').split(':');
  let hour = Number(nowTime[0]);
  let minute = Number(nowTime[1]);

  if (it.startLunch && it.endLunch) {
    const lunchStart = it.startLunch.split(':');
    const lunchEnd = it.endLunch.split(':');
    const lunchEndHour = Number(lunchEnd[0]);
    const lunchEndMinute = Number(lunchEnd[1]);
    const lunchStartHour = Number(lunchStart[0]);
    const lunchStartMinute = Number(lunchStart[1]);

    if (isToday(date)) {
      if (hour > 23) {
        hour = 23;
        minute = 59;
      } else {
        return lunchEvent(hour, lunchStartHour, minute, lunchStartMinute, lunchEndHour, lunchEndMinute, date, lunch,
          isDarkMode);
      }
      const start = createDate();
      const end = createDate(hour, minute);
      return newEvent(unavailable, findStateColor('DEFAULT', isDarkMode), start, end);
    } else {
      const start = createNewDate(date, lunchStartHour, lunchStartMinute);
      const end = createNewDate(date, lunchEndHour, lunchEndMinute);
      return newEvent(lunch, findStateColor('DEFAULT', isDarkMode), start, end);
    }
  } else if (isToday(date)) {
    if (hour > 23) {
      hour = 23;
      minute = 59;
    }
    const start = createNewDate(date);
    const end = createNewDate(date, hour, minute);
    return newEvent(lunch, findStateColor('DEFAULT', isDarkMode), start, end);
  }

  return undefined;
};

const lunchEvent = (hour: number, lunchStartHour: number, minute: number, lunchStartMinute: number, lunchEndHour: number,
                    lunchEndMinute: number, date: Date, lunch: string, isDarkMode: boolean): CalendarEvent | undefined => {
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
    const start = createNewDate(date, lunchHour, lunchMinute);
    const end = createNewDate(date, lunchEndHour, lunchEndMinute);
    return newEvent(lunch, findStateColor('DEFAULT', isDarkMode), start, end, undefined, 'LUNCH');
  }

  return undefined;
};
