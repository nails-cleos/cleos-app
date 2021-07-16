import { IAvailability } from '../interfaces/room';
import { CalendarEvent } from 'angular-calendar';
import { findStateColor } from './flags';
import { createDate, createFullDate, createNewDate, getNow, greaterOrEqualsThanToday, isToday } from './dates';

export const fillNotAvailable = (unavailable: string, lunch: string, notWorking: string, daysInWeek: number,
                                 selectDate: Date, sunday: IAvailability, saturday: IAvailability, week: IAvailability,
                                 addToday: boolean = false): CalendarEvent[] => {
  let events: CalendarEvent[] = [];
  const date = createFullDate(selectDate);
  const now = getNow();
  for (let i = 0; i < daysInWeek; i++) {
    const day = date.getDay();
    if (addToday && isToday(date)) {
      const event = newEvent(notWorking, findStateColor('DEFAULT'), createDate(),
        createDate(now.getHours(), now.getMinutes()));
      if (event) {
        events = [...events, event];
      }
    }
    if (day === 0) {
      events = events.concat(createEvent(sunday, date, notWorking, unavailable, lunch));
    } else if (day === 6) {
      events = events.concat(createEvent(saturday, date, notWorking, unavailable, lunch));
    } else {
      events = events.concat(createEvent(week, date, notWorking, unavailable, lunch));
    }
    date.setDate(date.getDate() + 1);
  }

  return events;
};

export const newEvent = (title: string, color: string, start: Date, end?: Date, primary?: string,
                         id?: string): CalendarEvent | undefined => {
  if (greaterOrEqualsThanToday(start)) {
    return {
      id,
      start,
      end,
      title,
      color: {
        primary,
        secondary: color
      }
    } as unknown as CalendarEvent;
  }
  return undefined;
};

export const getOverlapEvent = (events: any[], eventStartDay: Date, eventEndDay: Date): CalendarEvent[] =>
  events.filter((eventA: CalendarEvent) => (eventStartDay > eventA.start && eventA.end && eventStartDay < eventA.end)
    || (eventEndDay > eventA.start && eventA.end && eventEndDay < eventA.end)
    || (eventStartDay <= eventA.start && eventA.end && eventEndDay >= eventA.end)
  );

// private isAnOverlapEvent(eventStartDay: Date, eventEndDay: Date): CalendarEvent | undefined {
//   return this.events.find((eventA: CalendarEvent) => {
//     if (eventStartDay > eventA.start && eventA.end && eventStartDay < eventA.end) {
//       console.log('start-time in between any of the events');
//       return eventA;
//     }
//     if (eventEndDay > eventA.start && eventA.end && eventEndDay < eventA.end) {
//       console.log('end-time in between any of the events');
//       return eventA;
//     }
//     if (eventStartDay <= eventA.start && eventA.end && eventEndDay >= eventA.end) {
//       console.log('any of the events in between/on the start-time and end-time');
//       return eventA;
//     }
//     return null;
//   });
// }

const createEvent = (it: IAvailability, date: Date, notWorking: string, unavailable: string,
                     lunch: string): CalendarEvent[] => {
  let events: CalendarEvent[] = [];
  if (!it) {
    const event = newEvent(notWorking, findStateColor('DEFAULT'), createNewDate(date),
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
        const eventBefore = newEvent(notWorking, findStateColor('DEFAULT'), createNewDate(date, startHour, startMinute),
          createNewDate(date, endHour, endMinute));
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
      const eventAfter = newEvent(notWorking, findStateColor('DEFAULT'), createNewDate(date, startHour, startMinute),
        createNewDate(date, 23, 59));
      if (eventAfter) {
        events = [...events, eventAfter];
      }
    }
    const ev = createLunchEvent(it, date, unavailable, lunch);
    if (ev) {
      events = [...events, ev];
    }
  }

  return events;
};

const createLunchEvent = (it: IAvailability, date: Date, unavailable: string,
                          lunch: string): CalendarEvent | undefined => {
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
        return lunchEvent(hour, lunchStartHour, minute, lunchStartMinute, lunchEndHour, lunchEndMinute, date, lunch);
      }
      const start = createDate();
      const end = createDate(hour, minute);
      return newEvent(unavailable, findStateColor('DEFAULT'), start, end);
    } else {
      const start = createNewDate(date, lunchStartHour, lunchStartMinute);
      const end = createNewDate(date, lunchEndHour, lunchEndMinute);
      return newEvent(lunch, findStateColor('DEFAULT'), start, end);
    }
  } else if (isToday(date)) {
    if (hour > 23) {
      hour = 23;
      minute = 59;
    }
    const start = createNewDate(date);
    const end = createNewDate(date, hour, minute);
    return newEvent(lunch, findStateColor('DEFAULT'), start, end);
  }

  return undefined;
};

const lunchEvent = (hour: number, lunchStartHour: number, minute: number, lunchStartMinute: number, lunchEndHour: number,
                    lunchEndMinute: number, date: Date, lunch: string): CalendarEvent | undefined => {
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
    return newEvent(lunch, findStateColor('DEFAULT'), start, end, undefined, 'LUNCH');
  }

  return undefined;
};
