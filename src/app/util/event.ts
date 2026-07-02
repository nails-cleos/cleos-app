import { IAvailability, IRoomAll } from '../room/room';
import { CalendarEvent } from 'angular-calendar';
import {
  createDate,
  createNewDate,
  dateToUTC,
  daysOfWeek,
  getCurrentTimeZone,
  getNowTimeZone,
  getTimeNumber,
  getWeekDay,
  greaterOrEqualsThanToday,
  IDuration,
} from './dates';
import { findStateColor } from './theme';
import { ByWeekday, Frequency, RRule } from 'rrule';
import { isSameDay, isToday } from 'date-fns';
import { createEventColor } from './color';
import { FrequencyEnum } from './helper';
import { IDay } from '../reservation/reservation';

export const LUNCH = 'LUNCH';
export const OUT_OF_WORK = 'OUT_OF_WORK';
export const OUT_OF_WORK_ALL_DAY = 'OUT_OF_WORK_ALL_DAY';

export interface IMeta {
  time?: boolean;
  timeZone?: string;
  state?: string;
  route?: string[];
  treatmentName?: string;
  additionalNames?: string[];
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
  professionalName?: string;
  isReservation?: boolean;
  treatmentName?: string;
  additionalNames?: string[];

  constructor(
    time?: boolean,
    timeZone?: string,
    state?: string,
    route?: string[],
    professionalId?: string,
    total?: number,
    id?: string,
  ) {
    this.time = time;
    this.timeZone = timeZone;
    this.state = state;
    this.route = route;
    this.professionalId = professionalId;
    this.total = total;
    this.id = id;
  }
}

export interface IDataEvent {
  calendarEvents: CalendarEvent[];
  unavailableEventLength: number;
  index: number;
  viewDate: Date;
  process: boolean;
  day?: IDay;
  calendarEnd?: Date;
  calendarStart?: Date;
  recurringEvent?: RecurringEvent;
  room?: IRoomAll;

  addEvents(events: CalendarEvent[]): void;

  addEvent(event?: CalendarEvent): void;

  removeEvent(event: CalendarEvent, deleteCount?: number): void;

  filterEvent(event: CalendarEvent): void;

  updateLength(length: number): void;

  getOverlapEvent(eventStartDay: Date, eventEndDay: Date, professionalId?: string): CalendarEvent[] | undefined;

  sameDayEvent(recurring: any, event: CalendarEvent): boolean;

  sortEvents(): void;

  resetEvents(): void;

  refresh(): void;

  createRecurring(): void;
}

export class DataEvent implements IDataEvent {
  calendarEvents: CalendarEvent[];
  unavailableEventLength: number;
  index: number;
  viewDate: Date;
  process: boolean;
  day?: IDay;
  calendarEnd?: Date;
  calendarStart?: Date;
  recurringEvent?: RecurringEvent;

  constructor(
    events: CalendarEvent[],
    index: number,
    viewDate: Date,
    unavailableEventLength: number,
    process: boolean = false,
    day?: IDay,
  ) {
    this.calendarEvents = events;
    this.unavailableEventLength = unavailableEventLength;
    this.index = index;
    this.viewDate = viewDate;
    this.process = process;
    this.day = day;
  }

  addEvents = (events: CalendarEvent[]): void => {
    events.forEach(event => this.addEvent(event));
  };

  addEvent = (event?: CalendarEvent): void => {
    if (event) {
      if (!((this.calendarEnd && event.end && event.end > this.calendarEnd) ||
        (this.calendarStart && event.start < this.calendarStart))) {
        const overlap = this.getOverlap(event);
        if (!event.meta.isReservation && overlap && overlap?.length > 0) {
          this.validateEvent(event, overlap);
        } else {
          this.createEvent(event);
        }
      }
    }
  };

  removeEvent = (event: CalendarEvent, deleteCount: number = 1): void => {
    const i = this.calendarEvents.indexOf(event);
    if (i !== -1) {
      this.calendarEvents.splice(i, deleteCount);
    }
  };

  filterEvent = (event: CalendarEvent): void => {
    this.calendarEvents = this.calendarEvents.filter(ev => ev !== event);
  };

  updateLength = (length: number): void => {
    this.unavailableEventLength = length;
  };

  getOverlapEvent = (
    eventStartDay: Date,
    eventEndDay?: Date,
    professionalId?: string,
  ): CalendarEvent[] | undefined => {
    let overlapEvents;
    if (eventEndDay) {
      if (professionalId) {
        overlapEvents = this.calendarEvents.filter(
          (eventA: CalendarEvent) => ((eventA.meta?.professionalId === professionalId) && (
            (eventStartDay > eventA.start && eventA.end && eventStartDay < eventA.end)
            || (eventEndDay > eventA.start && eventA.end && eventEndDay < eventA.end)
            || (eventStartDay <= eventA.start && eventA.end && eventEndDay >= eventA.end)
          )));
      } else {
        overlapEvents = this.calendarEvents.filter(
          (eventA: CalendarEvent) => (eventStartDay > eventA.start && eventA.end && eventStartDay < eventA.end)
            || (eventEndDay > eventA.start && eventA.end && eventEndDay < eventA.end)
            || (eventStartDay <= eventA.start && eventA.end && eventEndDay >= eventA.end),
        );
      }
    }
    return overlapEvents;
  };

  sameDayEvent = (recurring: any, event: CalendarEvent): boolean => !this.calendarEvents
    .find(ce => ce.id === recurring.path && isSameDay(event.start, ce.start));

  resetEvents(): void {
    this.calendarEvents = [];
  }

  sortEvents(): void {
    this.calendarEvents = this.calendarEvents.slice().sort((a, b) => a.start.getTime() - b.start.getTime());
  }

  refresh(): void {
    this.calendarEvents = [...this.calendarEvents];
  }

  createRecurring(): void {
    this.recurringEvent = new RecurringEvent(this.calendarEnd!, this.calendarStart);
  }

  private eventNotExists = (event: CalendarEvent): boolean =>
    event.id === undefined ||
    !this.calendarEvents.some(e => e.id === event.id && e.start.getTime() === event.start.getTime());

  private getOverlap = (event: CalendarEvent): CalendarEvent[] | undefined => {
    const end = event.end;
    let overlapEvents;
    if (end) {
      const start = event.start;
      overlapEvents = this.getOverlapEvent(start, end);
    }
    return overlapEvents;
  };

  private validateEvent = (
    event: CalendarEvent,
    overlapEvent: CalendarEvent[],
  ): void => {
    const start = event.start;
    const end = event.end!;
    let newEvent = undefined;
    const hasReservationOverlap = overlapEvent.some(value => value.meta.isReservation);
    overlapEvent.forEach(value => {
      if (value.meta.isReservation) {
        newEvent = event;
      } else {
        if ([OUT_OF_WORK_ALL_DAY, OUT_OF_WORK, LUNCH].includes(`${event.id}`)) {
          if (value.end) {
            if (start < value.start && end < value.end) {
              value.start = end;
              newEvent = value;
            } else if (start > value.start && end > value.end) {
              value.end = start;
              newEvent = value;
            } else if (start < value.start && end > value.end) {
              if (!hasReservationOverlap) {
                this.filterEvent(value);
              }
              newEvent = event;
            } else if (start > value.start && end < value.end) {
              newEvent = undefined;
            }
          }
        }
      }
    });
    if (newEvent) {
      this.createEvent(newEvent);
    }
  };

  private createEvent = (event: CalendarEvent): void => {
    if (this.eventNotExists(event)) {
      this.calendarEvents = [...this.calendarEvents, event];
    }
  };
}

class RecurringEvent {
  recurring: any[] = [];
  calendarEnd: Date;
  calendarStart?: Date;

  constructor(calendarEnd: Date, calendarStart?: Date) {
    this.calendarEnd = calendarEnd;
    this.calendarStart = calendarStart;
  }

  addFrequency = (
    repeat: string,
    start: Date,
    id: any,
    title: string,
    state: string,
    path: string,
    onEachDate: (date: Date, recurring: any) => void,
    duration?: IDuration,
    professionalId?: string,
    allDay: boolean = false,
  ) => {
    this.recurring = [...this.recurring, {
      id: id,
      title: title,
      duration: duration,
      state: state,
      path: path,
      allDay: allDay,
      professionalId: professionalId,
      onEachDate: onEachDate,
      rule: createRule(repeat, start, this.calendarEnd, start.getDate(), getWeekDay(start.getDay())),
      priority: 1,
    }];
  };

  addNotAvailableRecurring = (
    calendar: IDataEvent, unavailable: string, lunch: string, notWorking: string, sunday: IAvailability,
    saturday: IAvailability, friday: IAvailability, thursday: IAvailability, wednesday: IAvailability,
    tuesday: IAvailability, monday: IAvailability, isDark: boolean = false,
    timeZone: string = getCurrentTimeZone(),
  ) => {
    this.recurring = [...this.recurring, {
      availabilityList: [monday, tuesday, wednesday, thursday, friday, saturday, sunday],
      rule: new RRule({
        freq: RRule.WEEKLY,
        byweekday: [RRule.SU, RRule.MO, RRule.TU, RRule.WE, RRule.TH, RRule.FR, RRule.SA],
        dtstart: this.calendarStart,
        until: this.calendarEnd,
      }),
      onEachDate: (date: Date, recurring: any) => createRecurringEvent(date, recurring, calendar, notWorking,
        unavailable, lunch, isDark, timeZone),
      priority: 999,
    }];
  };

  execute(): void {
    const allEvents: { priority: number; recurring: any; date: Date }[] = [];

    this.recurring.forEach(recurring => {
      const priority = recurring.priority || 999;
      recurring.rule.all().forEach((date: Date) => {
        allEvents.push({ priority, recurring, date });
      });
    });
    allEvents.sort((a, b) => a.priority - b.priority || a.date.getTime() - b.date.getTime())
      .forEach(({ date, recurring }) => recurring.onEachDate(date, recurring));
  }
}

export const newEvent = (
  title: string,
  color: string,
  start: Date,
  isDarkMode: boolean,
  end: Date,
  id: string,
  meta: IMeta = new Meta(),
  draggable: boolean = false,
): CalendarEvent | undefined => {
  if (greaterOrEqualsThanToday(start, meta.timeZone)) {
    return {
      id,
      start,
      end,
      title,
      draggable,
      color: createEventColor(color, isDarkMode),
      meta,
    } as unknown as CalendarEvent;
  }
  return undefined;
};

export const calendarEvent = (
  title: string,
  color: string,
  start: Date,
  isDarkMode: boolean,
  end: Date,
  id: string,
  meta: IMeta = new Meta(),
  draggable: boolean = false,
): CalendarEvent => ({
  id,
  start,
  end,
  title,
  draggable,
  color: createEventColor(color, isDarkMode),
  meta,
} as unknown as CalendarEvent);

export const allDayEvent = (
  title: string,
  color: string,
  start: Date,
  isDarkMode: boolean,
  id?: string,
  meta: IMeta = new Meta(),
): CalendarEvent => ({
  id,
  start,
  title,
  color: createEventColor(color, isDarkMode),
  meta,
  allDay: true,
} as unknown as CalendarEvent);

export const monthEvent = (
  title: string,
  start: Date,
  end: Date | null,
  id: string,
  color: string,
  meta: Meta,
  isDarkMode: boolean,
  allDay: boolean = false,
  draggable: boolean = false,
): CalendarEvent | undefined => ({
  id,
  start,
  title,
  end,
  color: createEventColor(color, isDarkMode),
  meta,
  draggable,
  allDay,
} as unknown as CalendarEvent);

const createRecurringEvent = (
  date: Date,
  recurring: any,
  calendar: IDataEvent,
  notWorking: string,
  unavailable: string,
  lunch: string,
  isDark: boolean,
  timeZone: string,
) => {
  const availability = recurring.availabilityList.find((a: IAvailability) => a?.day === daysOfWeek[date.getDay()]);
  const events = createEvent(date, notWorking, unavailable, lunch, isDark, timeZone, availability);
  calendar.addEvents(events);
};

const createEvent = (
  date: Date,
  notWorking: string,
  unavailable: string,
  lunch: string,
  isDarkMode: boolean,
  timeZone: string,
  it?: IAvailability,
): CalendarEvent[] => {
  let events: CalendarEvent[] = [];
  const newDate = dateToUTC(createNewDate(date), timeZone);
  if (!it) {
    const event = calendarEvent(notWorking, findStateColor('DEFAULT', isDarkMode), newDate,
      isDarkMode, createNewDate(date, 23, 59), OUT_OF_WORK_ALL_DAY);
    events = [...events, event];
  } else {
    const now = getNowTimeZone();
    const nowTime = getTimeNumber(now)!;
    const hour = nowTime.hour;
    const minute = nowTime.minute;
    if (it.start) {
      const start = getTimeNumber(it.start);
      const endHour = start?.hour;
      const endMinute = start?.minute;
      const eventBefore = calendarEvent(notWorking, findStateColor('DEFAULT', isDarkMode),
        newDate, isDarkMode, dateToUTC(createNewDate(date, endHour, endMinute), timeZone), OUT_OF_WORK);
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
        dateToUTC(createNewDate(date, 23, 59), timeZone), OUT_OF_WORK);
      events = [...events, eventAfter];
    }
    const ev = createLunchEvent(it, date, unavailable, lunch, isDarkMode, timeZone);
    if (ev) {
      events = [...events, ev];
    }
  }

  return events;
};

const createLunchEvent = (
  it: IAvailability,
  date: Date,
  unavailable: string,
  lunch: string,
  isDarkMode: boolean,
  timeZone: string,
): CalendarEvent | undefined => {
  const now = getNowTimeZone();
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
      const start = dateToUTC(createDate(timeZone), timeZone);
      const end = dateToUTC(createDate(timeZone, hour, minute), timeZone);
      return newEvent(unavailable, findStateColor('DEFAULT', isDarkMode), start, isDarkMode, end, LUNCH);
    } else {
      const start = dateToUTC(createNewDate(date, lunchStartHour, lunchStartMinute), timeZone);
      const end = dateToUTC(createNewDate(date, lunchEndHour, lunchEndMinute), timeZone);
      return newEvent(lunch, findStateColor('DEFAULT', isDarkMode), start, isDarkMode, end, LUNCH);
    }
  }

  return undefined;
};

const lunchEvent = (
  hour: number,
  lunchStartHour: number,
  minute: number,
  lunchStartMinute: number,
  lunchEndHour: number,
  lunchEndMinute: number,
  date: Date,
  lunch: string,
  isDarkMode: boolean,
  timeZone: string,
): CalendarEvent | undefined => {
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
    return newEvent(lunch, findStateColor('DEFAULT', isDarkMode), start, isDarkMode, end, LUNCH);
  }

  return undefined;
};

const createRule = (repeat: string, dtstart: Date, until: Date, monthDay: number, weekDay: ByWeekday): RRule => {
  let freq: Frequency | undefined;
  let byweekday: ByWeekday | undefined;
  let bymonthday: number | undefined;
  let count: number | undefined;

  switch (repeat) {
    case FrequencyEnum.none:
      freq = RRule.DAILY;
      count = 1;
      break;
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
    until: count ? undefined : until,
    count,
  });
};

export const createBullet = (
  name: string,
): string => `<div class='detail'>\uD83D\uDC85\uD83C\uDFFB&nbsp;${name}</div>`;
