import { IAvailability } from '../interfaces/room';
import { CalendarEvent } from 'angular-calendar';
import * as fromActionsReservation from '../store/reservation.actions';

export function FillNotAvailable(unavailable: string, lunch: string, notWorking: string, daysInWeek: number, plusHour: number,
                                 selectDate: Date, sunday: IAvailability, saturday: IAvailability, week: IAvailability): CalendarEvent[] {
  let events: CalendarEvent[] = [];
  const date = new Date(selectDate.getFullYear(), selectDate.getMonth(), selectDate.getDate());
  const now = new Date();
  for (let i = 0; i < daysInWeek; i++) {
    const day = date.getDay();
    if (date < new Date(now.getFullYear(), now.getMonth(), now.getDate())) {
      const event = NewEvent(notWorking, '#ffebee', new Date(new Date(date).setHours(0, 0)),
        new Date(new Date(date).setHours(23, 59)));
      events = [...events, event];
    } else if (day === 0) {
      events = events.concat(createEvent(sunday, date, notWorking, unavailable, lunch, plusHour));
    } else if (day === 6) {
      events = events.concat(createEvent(saturday, date, notWorking, unavailable, lunch, plusHour));
    } else {
      events = events.concat(createEvent(week, date, notWorking, unavailable, lunch, plusHour));
    }
    date.setDate(date.getDate() + 1);
  }

  return events;
}

function createEvent(it: IAvailability, date: Date, notWorking: string, unavailable: string, lunch: string,
                     plusHour: number): CalendarEvent[] {
  let events: CalendarEvent[] = [];
  if (!it) {
    const event = NewEvent(notWorking, '#ffebee', new Date(new Date(date).setHours(0, 0)),
      new Date(new Date(date).setHours(23, 59)));
    events = [...events, event];
  } else {
    const now = new Date();
    const nowTime = now.toLocaleTimeString('en-GB').split(':');
    const hour = Number(nowTime[0]) + plusHour;
    const minute = Number(nowTime[1]);
    if (it.start) {
      const start = it.start.split(':');
      const endHour = Number(start[0]);
      const endMinute = Number(start[1]);
      let startHour: number | null = 0;
      let startMinute: number | null = 0;
      if (date.getFullYear() === now.getFullYear() && date.getMonth() === now.getMonth() && date.getDate() === now.getDate()) {
        if (hour < endHour || (hour === endHour && minute < endMinute)) {
          startHour = hour;
          startMinute = minute;
        } else {
          startHour = null;
          startMinute = null;
        }
      }
      if ((startHour || startHour === 0) && (startMinute || startMinute === 0)) {
        const eventBefore = NewEvent(notWorking, '#ffebee', new Date(date.setHours(startHour, startMinute)),
          new Date(date.setHours(endHour, endMinute)));
        events = [...events, eventBefore];
      }
    }
    if (it.end) {
      const end = it.end.split(':');
      const endHour = Number(end[0]);
      const endMinute = Number(end[1]);
      let startHour = endHour;
      let startMinute = endMinute;
      if (date.getFullYear() === now.getFullYear() && date.getMonth() === now.getMonth() && date.getDate() === now.getDate()
        && (hour > endHour || (hour === endHour && minute > endMinute))) {
        startHour = hour;
        startMinute = minute;
      }
      const eventAfter = NewEvent(notWorking, '#ffebee', new Date(date.setHours(startHour, startMinute)),
        new Date(date.setHours(23, 59)));
      events = [...events, eventAfter];
    }
    const ev = createLunchEvent(it, date, unavailable, lunch, plusHour);
    if (ev) {
      events = [...events, ev];
    }
  }

  return events;
}

function createLunchEvent(it: IAvailability, date: Date, unavailable: string, lunch: string, plusHour: number): CalendarEvent | undefined {
  const now = new Date();
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

    if (date.getFullYear() === now.getFullYear() && date.getMonth() === now.getMonth() && date.getDate() === now.getDate()) {
      if (hour > 23) {
        hour = 23;
        minute = 59;
      } else {
        hour = hour + plusHour;
        return lunchEvent(hour, lunchStartHour, minute, lunchStartMinute, lunchEndHour, lunchEndMinute, date, lunch);
      }
      const start = new Date(new Date().setHours(0, 0));
      const end = new Date(new Date().setHours(hour, minute));
      return NewEvent(unavailable, '#ffebee', start, end);
    } else {
      const start = new Date(date.setHours(lunchStartHour, lunchStartMinute));
      const end = new Date(date.setHours(lunchEndHour, lunchEndMinute));
      return NewEvent(lunch, '#ffebee', start, end);
    }
  } else if (date.getFullYear() === now.getFullYear() && date.getMonth() === now.getMonth() && date.getDate() === now.getDate()) {
    if (hour > 23) {
      hour = 23;
      minute = 59;
    } else {
      hour = hour + plusHour;
    }
    const start = new Date(date.setHours(0, 0));
    const end = new Date(date.setHours(hour, minute));
    return NewEvent(lunch, '#ffebee', start, end);
  }

  return undefined;
}

function lunchEvent(hour: number, lunchStartHour: number, minute: number, lunchStartMinute: number, lunchEndHour: number,
                    lunchEndMinute: number, date: Date, lunch: string): CalendarEvent | undefined {
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
    const start = new Date(date.setHours(lunchHour, lunchMinute));
    const end = new Date(date.setHours(lunchEndHour, lunchEndMinute));
    return NewEvent(lunch, '#ffebee', start, end);
  }

  return undefined;
}

export function NewEvent(title: string, color: string, start: Date, end?: Date, primary?: string, id?: string): CalendarEvent {
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
