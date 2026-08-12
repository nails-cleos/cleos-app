import { CalendarEvent } from 'angular-calendar';
import { DataEvent } from './event';
import { describe, expect, it } from 'vitest';

describe('Event Utils', () => {
  describe('CalendarEvents', () => {
    const makeEvent = (id: string, start: Date, end: Date, meta: any = {}) =>
      ({ id, start, end, meta }) as CalendarEvent;

    const today = new Date();
    const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);

    it('should initialize with given properties', () => {
      const events = [makeEvent('1', today, tomorrow)];
      const dataEvent = new DataEvent(events, 1, today, 2);

      expect(dataEvent.calendarEvents).toEqual(events);
      expect(dataEvent.unavailableEventLength).toBe(2);
      expect(dataEvent.index).toBe(1);
      expect(dataEvent.viewDate).toBe(today);
    });

    it('should add a single event', () => {
      const dataEvent = new DataEvent([], 0, today, 0);
      const event = makeEvent('1', today, tomorrow, { isReservation: false });

      dataEvent.addEvent(event);

      expect(dataEvent.calendarEvents).toContain(event);
    });

    it('should update event when OUT_OF_WORK morning overlaps with LUNCH', () => {
      const start = new Date(today);
      start.setHours(0, 0);
      const end = new Date(today);
      end.setHours(11, 0);
      const outOfWork = makeEvent('OUT_OF_WORK', start, end, {
        isReservation: false,
      });
      const dataEvent = new DataEvent([outOfWork], 0, today, 0);

      const lunchStart = new Date(today);
      lunchStart.setHours(10, 0);
      const lunchEnd = new Date(today);
      lunchEnd.setHours(12, 0);
      const lunch = makeEvent('LUNCH', lunchStart, lunchEnd, {
        isReservation: false,
      });

      dataEvent.addEvent(lunch);

      expect(dataEvent.calendarEvents.length).toBe(1);
      expect(dataEvent.calendarEvents[0].id).toBe('OUT_OF_WORK');
      expect(dataEvent.calendarEvents[0].start).toBe(start);
      expect(dataEvent.calendarEvents[0].end).toBe(lunchStart);
    });

    it('should update event when OUT_OF_WORK evening overlaps with LUNCH', () => {
      const start = new Date(today);
      start.setHours(14, 0);
      const end = new Date(today);
      end.setHours(23, 59);
      const outOfWork = makeEvent('OUT_OF_WORK', start, end, {
        isReservation: false,
      });
      const dataEvent = new DataEvent([outOfWork], 0, start, 0);

      const lunchStart = new Date(today);
      lunchStart.setHours(13, 0);
      const lunchEnd = new Date(today);
      lunchEnd.setHours(15, 0);
      const lunch = makeEvent('LUNCH', lunchStart, lunchEnd, {
        isReservation: false,
      });

      dataEvent.addEvent(lunch);

      expect(dataEvent.calendarEvents.length).toBe(1);
      expect(dataEvent.calendarEvents[0].id).toBe('OUT_OF_WORK');
      expect(dataEvent.calendarEvents[0].start).toBe(lunchEnd);
      expect(dataEvent.calendarEvents[0].end).toBe(end);
    });

    it('should not update event when OUT_OF_WORK complete overlaps with LUNCH', () => {
      const start = new Date(today);
      start.setHours(0, 0);
      const end = new Date(today);
      end.setHours(13, 0);
      const outOfWork = makeEvent('OUT_OF_WORK', start, end, {
        isReservation: false,
      });
      const dataEvent = new DataEvent([outOfWork], 0, start, 0);

      const lunchStart = new Date(today);
      lunchStart.setHours(11, 0);
      const lunchEnd = new Date(today);
      lunchEnd.setHours(12, 0);
      const lunch = makeEvent('LUNCH', lunchStart, lunchEnd, {
        isReservation: false,
      });

      dataEvent.addEvent(lunch);

      expect(dataEvent.calendarEvents.length).toBe(1);
      expect(dataEvent.calendarEvents[0].id).toBe('OUT_OF_WORK');
      expect(dataEvent.calendarEvents[0].start).toBe(start);
      expect(dataEvent.calendarEvents[0].end).toBe(end);
    });

    it('should remove LUNCH when OUT_OF_WORK overlap complete', () => {
      const lunchStart = new Date(today);
      lunchStart.setHours(12, 0);
      const lunchEnd = new Date(today);
      lunchEnd.setHours(13, 0);
      const lunch = makeEvent('LUNCH', lunchStart, lunchEnd, {
        isReservation: false,
      });
      const dataEvent = new DataEvent([lunch], 0, today, 0);
      const start = new Date(today);
      start.setHours(0, 0);
      const end = new Date(today);
      end.setHours(15, 0);
      const outOfWork = makeEvent('OUT_OF_WORK', start, end, {
        isReservation: false,
      });

      dataEvent.addEvent(outOfWork);

      expect(dataEvent.calendarEvents.length).toBe(1);
      expect(dataEvent.calendarEvents).toContain(outOfWork);
    });

    it('should create the new event when it is reservation', () => {
      const start = new Date(today);
      start.setHours(12, 30);
      const end = new Date(today);
      end.setHours(13, 0);
      const outOfWork = makeEvent('reservation-id', start, end, {
        isReservation: true,
      });
      const dataEvent = new DataEvent([outOfWork], 0, today, 0);

      const lunchStart = new Date(today);
      lunchStart.setHours(12, 0);
      const lunchEnd = new Date(today);
      lunchEnd.setHours(13, 0);
      const lunch = makeEvent('LUNCH', lunchStart, lunchEnd, {
        isReservation: false,
      });

      dataEvent.addEvent(lunch);

      expect(dataEvent.calendarEvents.length).toBe(2);
      expect(dataEvent.calendarEvents).toContain(outOfWork);
      expect(dataEvent.calendarEvents).toContain(lunch);
    });

    it('should add multiple events', () => {
      const dataEvent = new DataEvent([], 0, today, 0);
      const events = [
        makeEvent('1', today, tomorrow),
        makeEvent('2', tomorrow, new Date(tomorrow.getTime() + 3600000)),
      ];

      dataEvent.addEvents(events);

      expect(dataEvent.calendarEvents.length).toBe(2);
    });

    it('should remove event by splice', () => {
      const event = makeEvent('1', today, tomorrow);
      const dataEvent = new DataEvent([event], 0, today, 0);

      dataEvent.removeEvent(event);

      expect(dataEvent.calendarEvents.length).toBe(0);
    });

    it('should filter out event', () => {
      const e1 = makeEvent('1', today, tomorrow);
      const e2 = makeEvent('2', today, tomorrow);
      const dataEvent = new DataEvent([e1, e2], 0, today, 0);

      dataEvent.filterEvent(e1);

      expect(dataEvent.calendarEvents).toEqual([e2]);
    });

    it('should detect overlapping events', () => {
      const e1 = makeEvent('1', today, tomorrow);
      const e2 = makeEvent('2', new Date(today.getTime() + 3600000), tomorrow); // overlap

      const dataEvent = new DataEvent([e1, e2], 0, today, 0);

      const overlaps = dataEvent.getOverlapEvent(today, tomorrow);

      expect(overlaps?.length).toBe(2);
    });

    it('should sort events by start time', () => {
      const e1 = makeEvent('1', new Date(2020, 1, 2), new Date(2020, 1, 2, 1));
      const e2 = makeEvent('2', new Date(2020, 1, 1), new Date(2020, 1, 1, 1));

      const dataEvent = new DataEvent([e1, e2], 0, today, 0);
      dataEvent.sortEvents();

      expect(dataEvent.calendarEvents[0]).toBe(e2);
    });

    it('should reset events', () => {
      const e = makeEvent('1', today, tomorrow);
      const dataEvent = new DataEvent([e], 0, today, 0);

      dataEvent.resetEvents();

      expect(dataEvent.calendarEvents).toEqual([]);
    });

    it('should refresh events (clone array)', () => {
      const e = makeEvent('1', today, tomorrow);
      const dataEvent = new DataEvent([e], 0, today, 0);

      const before = dataEvent.calendarEvents;
      dataEvent.refresh();
      const after = dataEvent.calendarEvents;

      expect(before).not.toBe(after); // new array
    });

    it('should create a RecurringEvent', () => {
      const e = makeEvent('1', today, tomorrow);
      const dataEvent = new DataEvent([e], 0, today, 0);
      dataEvent.calendarEnd = tomorrow;
      dataEvent.createRecurring();

      expect(dataEvent.recurringEvent).toBeDefined();
    });
  });
});
