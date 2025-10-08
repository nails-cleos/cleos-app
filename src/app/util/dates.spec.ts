import {
  addPeriod,
  backendFormatDate,
  columnHeader,
  convertDuration,
  createDateFromString,
  createEndDate,
  createFullDate,
  createNewDate,
  dateMonthYear,
  datesInSameWeek,
  dateToTimestamp,
  daysOfWeek,
  dayViewTitle,
  diffTime,
  Duration,
  endOfPeriod,
  filterDateRoom,
  findDayOfWeek,
  formatDateHourMinute,
  formatDateTime,
  formatDuration,
  formatFullDate,
  formatFullDateTime,
  formatTime,
  getAvailability,
  getCurrentTimeZone,
  getDateFormat,
  getDateQuarter,
  getDiffTime,
  getDuration,
  getDurationOrUndefined,
  getEnd,
  getEndWithDuration,
  getMinMaxDate,
  getMinutesBetweenTimesABS,
  getMonth,
  getRoomStartEndDay,
  getStartEndDay,
  getTime,
  getTimeNumber,
  getWeekDay,
  getWeeksInMonth,
  greaterOrEqualsThan,
  invoiceTitle,
  isBetween,
  isSameTimeZone,
  monthTitle,
  monthViewTitle,
  newDate,
  newDateTimestamp,
  plusMinutes,
  plusMonthDate,
  reservationDuration,
  searchDates,
  startOfPeriod,
  subPeriod,
  sumDurations,
  TimeZone,
  totalDuration,
} from './dates';
import { RRule } from 'rrule';
import { IAvailability, IRoom, IRoomAll, ServiceType } from '../interfaces/room';
import { IReservationAll } from '../interfaces/reservation';
import { ITreatmentAll } from '../interfaces/treatment';
import { IAdditionalAll } from '../interfaces/additional';

describe('dates utility', () => {
  const treatment: ITreatmentAll = {
    id: 'treatment-123',
    key: 'treatment-123',
    name: 'Massage',
    duration: 'PT60M',
    price: 100,
    primary: true,
    type: ServiceType.treatment,
    group: { id: 'group-1', name: 'Wellness' },
  };

  const additionalList: IAdditionalAll[] = [
    {
      id: 'additional-1',
      key: 'additional-1',
      name: 'Aroma Therapy',
      duration: 'PT30M',
      price: 50,
      type: ServiceType.additional,
    },
    {
      id: 'additional-2',
      key: 'additional-2',
      name: 'Hot Stones',
      duration: 'PT45M',
      price: 70,
      type: ServiceType.additional,
    },
  ];

  const monday: IAvailability = { day: 'MONDAY', start: '09:00', end: '18:00' };
  const tuesday: IAvailability = { day: 'TUESDAY' };
  const wednesday: IAvailability = { day: 'WEDNESDAY', start: '10:00', end: '19:00' };
  const thursday: IAvailability = { day: 'THURSDAY', start: '09:00', end: '18:00' };
  const friday: IAvailability = { day: 'FRIDAY' };
  const saturday: IAvailability = { day: 'SATURDAY', start: '10:00', end: '16:00' };
  const sunday: IAvailability = { day: 'SUNDAY' };

  const room: IRoomAll = {
    id: 'room-123',
    address: {
      id: 1,
      name: 'Main Location',
      location: { x: 0, y: 0 },
    },
    currency: {
      id: 'currency-id',
      code: 'EUR',
      icon: 'EUR',
      name: 'Euro',
    },
    timeZone: 'UTC',
    availabilities: [monday, tuesday, wednesday, thursday, friday, saturday, sunday],
    office: {},
    paymentTypes: [],
    primary: false,
  };

  const reservationAll: IReservationAll = {
    id: 'res-123',
    state: 'confirmed',
    start: new Date('2024-01-15T10:00:00.000Z'),
    timestamp: Date.now(),
    customer: {
      id: 'customer-123',
      displayName: 'John Doe',
      email: 'john@example.com',
      authorities: [],
      locale: 'en-US',
      timeZone: 'UTC',
    },
    professional: {
      id: 'prof-123',
      displayName: 'Jane Smith',
      email: 'jane@example.com',
      authorities: [],
      locale: 'en-US',
      timeZone: 'UTC',
    },
    room: room,
    treatment: treatment,
    note: 'Test reservation',
  };

  describe('Duration', () => {
    it('should create a Duration with default values', () => {
      const duration = new Duration();
      expect(duration.hour).toBe(0);
      expect(duration.minute).toBe(0);
    });

    it('should create a Duration with specified values', () => {
      const duration = new Duration(2, 30);
      expect(duration.hour).toBe(2);
      expect(duration.minute).toBe(30);
    });
  });

  describe('TimeZone', () => {
    it('should create a TimeZone with specified values', () => {
      const timeZone = new TimeZone('America/New_York', 'America/New_York', 'GMT-5');
      expect(timeZone.label).toBe('America/New_York');
      expect(timeZone.tzCode).toBe('America/New_York');
      expect(timeZone.gmt).toBe('GMT-5');
    });

    it('should create a TimeZone with empty gmt if not provided', () => {
      const timeZone = new TimeZone('America/New_York', 'America/New_York');
      expect(timeZone.gmt).toBe('');
    });
  });

  describe('daysOfWeek', () => {
    it('should contain all days of the week', () => {
      expect(daysOfWeek).toEqual(['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY']);
    });
  });

  describe('findDayOfWeek', () => {
    it('should find the index of a day', () => {
      expect(findDayOfWeek('SUNDAY')).toBe(0);
      expect(findDayOfWeek('MONDAY')).toBe(1);
      expect(findDayOfWeek('SATURDAY')).toBe(6);
    });

    it('should return -1 for invalid day', () => {
      expect(findDayOfWeek('INVALID')).toBe(-1);
    });
  });

  describe('getDuration', () => {
    it('should return all day duration when allDay is true', () => {
      const duration = getDuration(true);
      expect(duration.hour).toBe(23);
      expect(duration.minute).toBe(59);
    });

    it('should return all day duration when duration is not provided', () => {
      const duration = getDuration(false);
      expect(duration.hour).toBe(23);
      expect(duration.minute).toBe(59);
    });

    it('should convert duration string when provided', () => {
      const duration = getDuration(false, 'PT2H30M');
      expect(duration.hour).toBe(2);
      expect(duration.minute).toBe(30);
    });
  });

  describe('convertDuration', () => {
    it('should convert PT format duration string', () => {
      const duration = convertDuration('PT2H30M');
      expect(duration.hour).toBe(2);
      expect(duration.minute).toBe(30);
    });

    it('should convert PT format with hours only', () => {
      const duration = convertDuration('PT3H');
      expect(duration.hour).toBe(3);
      expect(duration.minute).toBe(0);
    });

    it('should convert PT format with minutes only', () => {
      const duration = convertDuration('PT45M');
      expect(duration.hour).toBe(0);
      expect(duration.minute).toBe(45);
    });

    it('should convert HH:MM format duration string', () => {
      const duration = convertDuration('02:30');
      expect(duration.hour).toBe(2);
      expect(duration.minute).toBe(30);
    });

    it('should convert number duration (seconds)', () => {
      const duration = convertDuration(7200); // 2 hours
      expect(duration.hour).toBe(2);
      expect(duration.minute).toBe(0);
    });

    it('should convert number duration with minutes', () => {
      const duration = convertDuration(9000); // 2 hours 30 minutes
      expect(duration.hour).toBe(2);
      expect(duration.minute).toBe(30);
    });
  });

  describe('sumDurations', () => {
    it('should sum multiple durations', () => {
      const durations = [
        new Duration(1, 30),
        new Duration(2, 45),
      ];
      const result = sumDurations(durations);
      expect(result.hour).toBe(4);
      expect(result.minute).toBe(15);
    });

    it('should handle minute overflow', () => {
      const durations = [
        new Duration(1, 45),
        new Duration(0, 30),
      ];
      const result = sumDurations(durations);
      expect(result.hour).toBe(2);
      expect(result.minute).toBe(15);
    });

    it('should handle empty array', () => {
      const result = sumDurations([]);
      expect(result.hour).toBe(0);
      expect(result.minute).toBe(0);
    });
  });

  describe('getEnd', () => {
    it('should calculate end date with duration', () => {
      const start = new Date(2024, 0, 1, 10, 0);
      const end = getEnd(start, 'PT2H30M');
      expect(end.getHours()).toBe(12);
      expect(end.getMinutes()).toBe(30);
    });

    it('should return end of day when no duration provided', () => {
      const start = new Date(2024, 0, 1, 10, 0);
      const end = getEnd(start);
      expect(end.getHours()).toBe(23);
      expect(end.getMinutes()).toBe(59);
    });
  });

  describe('getEndWithDuration', () => {
    it('should calculate end date with duration', () => {
      const start = new Date(2024, 0, 1, 10, 0);
      const duration = new Duration(2, 30);
      const end = getEndWithDuration(start, duration);
      expect(end.getHours()).toBe(12);
      expect(end.getMinutes()).toBe(30);
    });

    it('should return end of day when no duration provided', () => {
      const start = new Date(2024, 0, 1, 10, 0);
      const end = getEndWithDuration(start);
      expect(end.getHours()).toBe(23);
      expect(end.getMinutes()).toBe(59);
    });
  });

  describe('getTime', () => {
    it('should format time in API_LOCALE', () => {
      const date = new Date(2024, 0, 1, 14, 30);
      const time = getTime(date);
      expect(time).toBeTruthy();
      expect(time).toContain('14');
      expect(time).toContain('30');
    });
  });

  describe('formatFullDateTime', () => {
    it('should format full date and time', () => {
      const date = new Date(2024, 0, 1, 14, 30);
      const formatted = formatFullDateTime(date, 'en-US');
      expect(formatted).toBeTruthy();
    });
  });

  describe('formatFullDate', () => {
    it('should format full date with time', () => {
      const date = new Date(2024, 0, 1, 14, 30);
      const formatted = formatFullDate(date, 'en-US');
      expect(formatted).toBeTruthy();
    });
  });

  describe('formatDateTime', () => {
    it('should format date time with capitalized first letter', () => {
      const date = new Date(2024, 0, 1, 14, 30);
      const formatted = formatDateTime(date, 'en-US');
      expect(formatted).toBeTruthy();
      expect(formatted.charAt(0)).toBe(formatted.charAt(0).toUpperCase());
    });
  });

  describe('monthViewTitle', () => {
    it('should format month and year', () => {
      const date = new Date(2024, 0, 1);
      const title = monthViewTitle(date, 'en');
      expect(title).toContain('2024');
      expect(title.charAt(0)).toBe(title.charAt(0).toUpperCase());
    });
  });

  describe('monthTitle', () => {
    it('should format month in long format', () => {
      const date = new Date(2024, 0, 1);
      const title = monthTitle(date, 'en', 'long');
      expect(title).toBeTruthy();
      expect(title.charAt(0)).toBe(title.charAt(0).toUpperCase());
    });

    it('should format month in short format', () => {
      const date = new Date(2024, 0, 1);
      const title = monthTitle(date, 'en', 'short');
      expect(title).toBeTruthy();
      expect(title.charAt(0)).toBe(title.charAt(0).toUpperCase());
    });
  });

  describe('invoiceTitle', () => {
    it('should format date for invoice', () => {
      const date = new Date(2024, 0, 15);
      const title = invoiceTitle(date);
      expect(title).toContain('2024');
      expect(title).toContain('01');
      expect(title).toContain('15');
    });
  });

  describe('columnHeader', () => {
    it('should format weekday name', () => {
      const date = new Date(2024, 0, 1); // Monday
      const header = columnHeader(date, 'en');
      expect(header).toBeTruthy();
      expect(header.charAt(0)).toBe(header.charAt(0).toUpperCase());
    });
  });

  describe('dayViewTitle', () => {
    it('should format day view title', () => {
      const date = new Date(2024, 0, 1);
      const title = dayViewTitle(date, 'en');
      expect(title).toBeTruthy();
      expect(title.charAt(0)).toBe(title.charAt(0).toUpperCase());
    });
  });

  describe('formatDateHourMinute', () => {
    it('should format hour and minute', () => {
      const date = new Date(2024, 0, 1, 14, 30);
      const formatted = formatDateHourMinute(date, 'en');
      expect(formatted).toBeTruthy();
      expect(formatted.charAt(0)).toBe(formatted.charAt(0).toUpperCase());
    });
  });

  describe('backendFormatDate', () => {
    it('should format date for backend (YYYY-MM-DD)', () => {
      const date = new Date(2024, 0, 15);
      const formatted = backendFormatDate(date);
      expect(formatted).toBe('2024-01-15');
    });

    it('should handle single digit month and day', () => {
      const date = new Date(2024, 0, 5);
      const formatted = backendFormatDate(date);
      expect(formatted).toBe('2024-01-05');
    });

    it('should return undefined for undefined date', () => {
      const formatted = backendFormatDate(undefined);
      expect(formatted).toBeUndefined();
    });
  });

  describe('formatDuration', () => {
    it('should format PT duration string', () => {
      const formatted = formatDuration('PT2H30M');
      expect(formatted).toBeTruthy();
    });
  });

  describe('formatTime', () => {
    it('should format time from duration', () => {
      const duration = new Duration(14, 30);
      const formatted = formatTime(duration);
      expect(formatted).toBeTruthy();
    });
  });

  describe('createDateFromString', () => {
    it('should create date from string (YYYY-MM-DD)', () => {
      const date = createDateFromString('2024-01-15');
      expect(date.getFullYear()).toBe(2024);
      expect(date.getMonth()).toBe(0);
      expect(date.getDate()).toBe(15);
    });
  });

  describe('createEndDate', () => {
    it('should create end of day date from string', () => {
      const date = createEndDate('2024-01-15');
      expect(date.getFullYear()).toBe(2024);
      expect(date.getMonth()).toBe(0);
      expect(date.getDate()).toBe(15);
      expect(date.getHours()).toBe(23);
      expect(date.getMinutes()).toBe(59);
    });
  });

  describe('createFullDate', () => {
    it('should create full date with current time', () => {
      const selectDate = new Date(2024, 0, 15);
      const result = createFullDate(selectDate);
      expect(result.getFullYear()).toBe(2024);
      expect(result.getMonth()).toBe(0);
      expect(result.getDate()).toBe(15);
    });
  });

  describe('createNewDate', () => {
    it('should create new date with specified time', () => {
      const date = new Date(2024, 0, 15);
      const result = createNewDate(date, 14, 30, 45, 100);
      expect(result.getFullYear()).toBe(2024);
      expect(result.getMonth()).toBe(0);
      expect(result.getDate()).toBe(15);
      expect(result.getHours()).toBe(14);
      expect(result.getMinutes()).toBe(30);
      expect(result.getSeconds()).toBe(45);
      expect(result.getMilliseconds()).toBe(100);
    });

    it('should default to 00:00:00.000 if no time provided', () => {
      const date = new Date(2024, 0, 15);
      const result = createNewDate(date);
      expect(result.getHours()).toBe(0);
      expect(result.getMinutes()).toBe(0);
      expect(result.getSeconds()).toBe(0);
      expect(result.getMilliseconds()).toBe(0);
    });
  });

  describe('dateMonthYear', () => {
    it('should create date from month and year', () => {
      const date = dateMonthYear(0, 2024);
      expect(date.getFullYear()).toBe(2024);
      expect(date.getMonth()).toBe(0);
      expect(date.getDate()).toBe(1);
    });

    it('should handle string inputs', () => {
      const date = dateMonthYear('5', '2024');
      expect(date.getFullYear()).toBe(2024);
      expect(date.getMonth()).toBe(5);
    });
  });

  describe('getDateQuarter', () => {
    it('should return quarter for Q1', () => {
      const date = new Date(2024, 0, 1); // January
      expect(getDateQuarter(date)).toBe(1);
    });

    it('should return quarter for Q2', () => {
      const date = new Date(2024, 3, 1); // April
      expect(getDateQuarter(date)).toBe(2);
    });

    it('should return quarter for Q3', () => {
      const date = new Date(2024, 6, 1); // July
      expect(getDateQuarter(date)).toBe(3);
    });

    it('should return quarter for Q4', () => {
      const date = new Date(2024, 9, 1); // October
      expect(getDateQuarter(date)).toBe(4);
    });
  });

  describe('getMonth', () => {
    it('should return first month of Q1', () => {
      expect(getMonth(1, 0)).toBe(0);
    });

    it('should return second month of Q2', () => {
      expect(getMonth(2, 1)).toBe(4);
    });

    it('should return third month of Q3', () => {
      expect(getMonth(3, 2)).toBe(8);
    });
  });

  describe('getTimeNumber', () => {
    it('should convert Date to time number', () => {
      const date = new Date(2024, 0, 1, 14, 30);
      const result = getTimeNumber(date);
      expect(result?.hour).toBe(14);
      expect(result?.minute).toBe(30);
    });

    it('should convert HH:MM string to time number', () => {
      const result = getTimeNumber('14:30');
      expect(result?.hour).toBe(14);
      expect(result?.minute).toBe(30);
    });

    it('should return undefined for undefined input', () => {
      const result = getTimeNumber(undefined);
      expect(result).toBeUndefined();
    });

    it('should handle PM format', () => {
      const result = getTimeNumber('02:30 PM');
      expect(result?.hour).toBe(14);
      expect(result?.minute).toBe(30);
    });
  });

  describe('dateToTimestamp', () => {
    it('should convert date to Unix timestamp', () => {
      const date = new Date(2024, 0, 1);
      const timestamp = dateToTimestamp(date);
      expect(typeof timestamp).toBe('number');
      expect(timestamp).toBeGreaterThan(0);
    });
  });

  describe('newDate', () => {
    it('should create date from timestamp', () => {
      const timestamp = 1704067200000; // 2024-01-01
      const date = newDate(timestamp);
      expect(date instanceof Date).toBe(true);
    });

    it('should create date from string', () => {
      const date = newDate('2024-01-01');
      expect(date instanceof Date).toBe(true);
    });

    it('should create date from Date', () => {
      const inputDate = new Date(2024, 0, 1);
      const date = newDate(inputDate);
      expect(date instanceof Date).toBe(true);
    });
  });

  describe('plusMonthDate', () => {
    it('should add months to date', () => {
      const date = new Date(2024, 0, 15);
      const result = plusMonthDate(date, 2, 10);
      expect(result.getMonth()).toBe(2);
      expect(result.getDate()).toBe(10);
    });
  });

  describe('plusMinutes', () => {
    it('should add minutes to date', () => {
      const date = new Date(2024, 0, 1, 10, 0);
      const result = plusMinutes(date, 30);
      expect(result.getMinutes()).toBe(30);
    });

    it('should handle hour overflow', () => {
      const date = new Date(2024, 0, 1, 10, 50);
      const result = plusMinutes(date, 20);
      expect(result.getHours()).toBe(11);
      expect(result.getMinutes()).toBe(10);
    });
  });

  describe('greaterOrEqualsThan', () => {
    it('should return true when date1 > date2', () => {
      const date1 = new Date(2024, 0, 2);
      const date2 = new Date(2024, 0, 1);
      expect(greaterOrEqualsThan(date1, date2)).toBe(true);
    });

    it('should return true when dates are equal', () => {
      const date1 = new Date(2024, 0, 1);
      const date2 = new Date(2024, 0, 1);
      expect(greaterOrEqualsThan(date1, date2)).toBe(true);
    });

    it('should return false when date1 < date2', () => {
      const date1 = new Date(2024, 0, 1);
      const date2 = new Date(2024, 0, 2);
      expect(greaterOrEqualsThan(date1, date2)).toBe(false);
    });
  });

  describe('isBetween', () => {
    it('should return true when date is between min and max', () => {
      const min = new Date(2024, 0, 1);
      const max = new Date(2024, 0, 10);
      const date = new Date(2024, 0, 5);
      expect(isBetween(min, max, date)).toBe(true);
    });

    it('should return true when date equals min', () => {
      const min = new Date(2024, 0, 1);
      const max = new Date(2024, 0, 10);
      const date = new Date(2024, 0, 1);
      expect(isBetween(min, max, date)).toBe(true);
    });

    it('should return true when date equals max end of day', () => {
      const min = new Date(2024, 0, 1);
      const max = new Date(2024, 0, 10);
      const date = new Date(2024, 0, 10, 23, 59);
      expect(isBetween(min, max, date)).toBe(true);
    });

    it('should return false when date is before min', () => {
      const min = new Date(2024, 0, 1);
      const max = new Date(2024, 0, 10);
      const date = new Date(2023, 11, 31);
      expect(isBetween(min, max, date)).toBe(false);
    });

    it('should return false when date is after max', () => {
      const min = new Date(2024, 0, 1);
      const max = new Date(2024, 0, 10);
      const date = new Date(2024, 0, 11);
      expect(isBetween(min, max, date)).toBe(false);
    });
  });

  describe('addPeriod', () => {
    it('should add days', () => {
      const date = new Date(2024, 0, 1);
      const result = addPeriod('day', date, 5);
      expect(result.getDate()).toBe(6);
    });

    it('should add weeks', () => {
      const date = new Date(2024, 0, 1);
      const result = addPeriod('week', date, 2);
      expect(result.getDate()).toBe(15);
    });

    it('should add months', () => {
      const date = new Date(2024, 0, 1);
      const result = addPeriod('month', date, 2);
      expect(result.getMonth()).toBe(2);
    });
  });

  describe('subPeriod', () => {
    it('should subtract days', () => {
      const date = new Date(2024, 0, 10);
      const result = subPeriod('day', date, 5);
      expect(result.getDate()).toBe(5);
    });

    it('should subtract weeks', () => {
      const date = new Date(2024, 0, 15);
      const result = subPeriod('week', date, 2);
      expect(result.getDate()).toBe(1);
    });

    it('should subtract months', () => {
      const date = new Date(2024, 2, 1);
      const result = subPeriod('month', date, 2);
      expect(result.getMonth()).toBe(0);
    });
  });

  describe('startOfPeriod', () => {
    it('should get start of day', () => {
      const date = new Date(2024, 0, 1, 14, 30);
      const result = startOfPeriod('day', date);
      expect(result.getHours()).toBe(0);
      expect(result.getMinutes()).toBe(0);
    });

    it('should get start of week', () => {
      const date = new Date(2024, 0, 3); // Wednesday
      const result = startOfPeriod('week', date);
      expect(result.getDay()).toBe(0); // Sunday
    });

    it('should get start of month', () => {
      const date = new Date(2024, 0, 15);
      const result = startOfPeriod('month', date);
      expect(result.getDate()).toBe(1);
    });
  });

  describe('endOfPeriod', () => {
    it('should get end of day', () => {
      const date = new Date(2024, 0, 1, 10, 30);
      const result = endOfPeriod('day', date);
      expect(result.getHours()).toBe(23);
      expect(result.getMinutes()).toBe(59);
    });

    it('should get end of week', () => {
      const date = new Date(2024, 0, 3); // Wednesday
      const result = endOfPeriod('week', date);
      expect(result.getDay()).toBe(6); // Saturday
    });

    it('should get end of month', () => {
      const date = new Date(2024, 0, 15);
      const result = endOfPeriod('month', date);
      expect(result.getDate()).toBe(31);
    });
  });

  describe('getWeekDay', () => {
    it('should return Sunday for 0', () => {
      expect(getWeekDay(0)).toBe(RRule.SU);
    });

    it('should return Monday for 1', () => {
      expect(getWeekDay(1)).toBe(RRule.MO);
    });

    it('should return Saturday for 6', () => {
      expect(getWeekDay(6)).toBe(RRule.SA);
    });
  });

  describe('getMinutesBetweenTimesABS', () => {
    it('should calculate absolute minutes between dates', () => {
      const date1 = new Date(2024, 0, 1, 10, 0);
      const date2 = new Date(2024, 0, 1, 12, 30);
      const result = getMinutesBetweenTimesABS(date1, date2);
      expect(result).toBe(150);
    });

    it('should return positive value regardless of order', () => {
      const date1 = new Date(2024, 0, 1, 12, 30);
      const date2 = new Date(2024, 0, 1, 10, 0);
      const result = getMinutesBetweenTimesABS(date1, date2);
      expect(result).toBe(150);
    });
  });

  describe('getWeeksInMonth', () => {
    it('should return weeks for a month', () => {
      const date = new Date(2024, 0, 1); // January 2024
      const weeks = getWeeksInMonth(date);
      expect(weeks.length).toBeGreaterThan(0);
      expect(weeks[0].start).toBeDefined();
      expect(weeks[0].end).toBeDefined();
      expect(weeks[0].dates).toBeDefined();
    });

    it('should include all days of the month', () => {
      const date = new Date(2024, 0, 1); // January 2024
      const weeks = getWeeksInMonth(date);
      const allDates = weeks.flatMap(week => week.dates);
      expect(allDates.length).toBe(31); // January has 31 days
    });
  });

  describe('getDateFormat', () => {
    it('should format date as MM-YYYY', () => {
      const date = new Date(2024, 0, 15);
      const formatted = getDateFormat(date);
      expect(formatted).toBe('01-2024');
    });

    it('should return empty string for null date', () => {
      const formatted = getDateFormat(null);
      expect(formatted).toBe('');
    });

    it('should return empty string for undefined date', () => {
      const formatted = getDateFormat(undefined);
      expect(formatted).toBe('');
    });
  });

  describe('datesInSameWeek', () => {
    it('should return true for dates in same week', () => {
      const date1 = new Date(2024, 0, 1); // Monday
      const date2 = new Date(2024, 0, 3); // Wednesday
      expect(datesInSameWeek(date1, date2)).toBe(true);
    });

    it('should return false for dates in different weeks', () => {
      const date1 = new Date(2024, 0, 1);
      const date2 = new Date(2024, 0, 10);
      expect(datesInSameWeek(date1, date2)).toBe(false);
    });
  });

  describe('searchDates', () => {
    it('should return full day range for all day events', () => {
      const start = new Date(2024, 0, 1, 10, 0);
      const duration = new Duration(2, 30);
      const [startSearch, endSearch] = searchDates(true, start, duration);
      expect(startSearch.getHours()).toBe(0);
      expect(endSearch.getHours()).toBe(23);
      expect(endSearch.getMinutes()).toBe(59);
    });

    it('should return specific time range for non-all day events', () => {
      const start = new Date(2024, 0, 1, 10, 0);
      const duration = new Duration(2, 30);
      const [startSearch, endSearch] = searchDates(false, start, duration);
      expect(startSearch.getHours()).toBe(10);
      expect(startSearch.getMinutes()).toBe(0);
      expect(endSearch.getHours()).toBe(12);
      expect(endSearch.getMinutes()).toBe(30);
    });
  });

  describe('getDiffTime', () => {
    it('should calculate positive time difference', () => {
      const date1 = new Date(2024, 0, 1, 10, 0);
      const date2 = new Date(2024, 0, 1, 12, 30);
      const diff = getDiffTime(date2, date1);
      expect(diff).toBe('02:30');
    });

    it('should calculate negative time difference', () => {
      const date1 = new Date(2024, 0, 1, 12, 30);
      const date2 = new Date(2024, 0, 1, 10, 0);
      const diff = getDiffTime(date2, date1);
      expect(diff).toBe('-02:30');
    });

    it('should pad with zeros', () => {
      const date1 = new Date(2024, 0, 1, 10, 0);
      const date2 = new Date(2024, 0, 1, 10, 5);
      const diff = getDiffTime(date2, date1);
      expect(diff).toBe('00:05');
    });
  });

  describe('getRoomStartEndDay', () => {
    it('should return start and end of day for room booking', () => {
      const availability: IAvailability = {
        day: 'FRIDAY',
        start: '10:00',
        end: '20:00',
        startLunch: '12:30',
        endLunch: '13:00',
      };
      const result = getRoomStartEndDay(availability, getCurrentTimeZone());
      expect(result.min.getHours()).toBe(10);
      expect(result.min.getMinutes()).toBe(0);
      expect(result.max.getHours()).toBe(20);
      expect(result.max.getMinutes()).toBe(0);
    });

    it('should return default start and end of day if no availability', () => {
      const availability: IAvailability = {
        day: 'SUNDAY',
      };
      const result = getRoomStartEndDay(availability, getCurrentTimeZone());
      expect(result.min).toBeUndefined();
      expect(result.max).toBeUndefined();
    });
  });

  describe('getStartEndDay', () => {
    it('should calculate min and max times across all days of week', () => {
      const monday: IAvailability = { day: 'MONDAY', start: '12:00', end: '13:00' };
      const tuesday: IAvailability = { day: 'TUESDAY', start: '11:30', end: '14:00' };
      const wednesday: IAvailability = { day: 'WEDNESDAY', start: '11:00', end: '15:00' };
      const thursday: IAvailability = { day: 'THURSDAY', start: '10:30', end: '16:00' };
      const friday: IAvailability = { day: 'FRIDAY', start: '10:00', end: '17:00' };
      const saturday: IAvailability = { day: 'SATURDAY', start: '09:30', end: '18:00' };
      const sunday: IAvailability = { day: 'SUNDAY', start: '09:00', end: '19:00' };
      const timeZone = getCurrentTimeZone();

      const result = getStartEndDay(monday, tuesday, wednesday, thursday, friday, saturday, sunday, timeZone);

      expect(result.min).toBeTruthy();
      expect(result.max).toBeTruthy();
      expect(result.min.getHours()).toBe(9);
      expect(result.min.getMinutes()).toBe(0);
      expect(result.max.getHours()).toBe(19);
      expect(result.max.getMinutes()).toBe(0);
    });

    it('should handle some days without availability', () => {
      const timeZone = getCurrentTimeZone();

      const result = getStartEndDay(monday, tuesday, wednesday, thursday, friday, saturday, sunday, timeZone);

      expect(result.min).toBeTruthy();
      expect(result.max).toBeTruthy();
    });
  });

  describe('reservationDuration', () => {
    it('should get 0 if no reservation is send', () => {
      const result = reservationDuration();

      expect(result.hour).toBe(0);
      expect(result.minute).toBe(0);
    });

    it('should get duration from reservation without additional list', () => {

      const result = reservationDuration(reservationAll);

      expect(result.hour).toBe(1);
      expect(result.minute).toBe(0);
    });

    it('should get duration from reservation with additional list', () => {
      const reservationWithAdditional: IReservationAll = {
        ...reservationAll,
        additional: additionalList,
      };

      const result = reservationDuration(reservationWithAdditional);

      expect(result.hour).toBe(2);
      expect(result.minute).toBe(15);
    });
  });

  describe('totalDuration', () => {
    it('should get the duration without additional list', () => {
      const result = totalDuration(treatment);

      expect(result.additionalDuration.hour).toBe(0);
      expect(result.additionalDuration.minute).toBe(0);
      expect(result.duration.hour).toBe(1);
      expect(result.duration.minute).toBe(0);
    });

    it('should get the duration with additional list', () => {
      const result = totalDuration(treatment, additionalList);

      expect(result.additionalDuration.hour).toBe(1);
      expect(result.additionalDuration.minute).toBe(15);
      expect(result.duration.hour).toBe(2);
      expect(result.duration.minute).toBe(15);
    });
  });

  describe('getAvailability', () => {
    it('should get availability', () => {
      const result = getAvailability(room);
      expect(result.monday).toBe(monday);
      expect(result.tuesday).toBe(tuesday);
      expect(result.wednesday).toBe(wednesday);
      expect(result.thursday).toBe(thursday);
      expect(result.friday).toBe(friday);
      expect(result.saturday).toBe(saturday);
      expect(result.sunday).toBe(sunday);
    });

    it('should return undefined for days without availability', () => {
      const roomWithMissingDays: IRoom = {
        ...room,
        availabilities: [],
      };
      const result = getAvailability(roomWithMissingDays);
      expect(result.monday).toBeUndefined();
      expect(result.tuesday).toBeUndefined();
      expect(result.wednesday).toBeUndefined();
      expect(result.thursday).toBeUndefined();
      expect(result.friday).toBeUndefined();
      expect(result.saturday).toBeUndefined();
      expect(result.sunday).toBeUndefined();
    });

    it('should return undefined for undefined room', () => {
      const roomWithoutAvailabilities: IRoom = {
        id: '1',
      };

      const result = getAvailability(roomWithoutAvailabilities);
      expect(result).toBeUndefined();
    });
  });

  describe('getMinMaxDate', () => {
    it('should return min and max dates for sunday', () => {
      const result = getMinMaxDate(0, new Date(), [room]);
      expect(result.minDate.getHours()).toBe(0);
      expect(result.minDate.getMinutes()).toBe(0);
      expect(result.maxDate.getHours()).toBe(23);
      expect(result.maxDate.getMinutes()).toBe(59);
    });
    it('should return min and max dates for monday', () => {
      const result = getMinMaxDate(1, new Date(), [room]);
      expect(result.minDate.getHours()).toBe(11);
      expect(result.minDate.getMinutes()).toBe(0);
      expect(result.maxDate.getHours()).toBe(20);
      expect(result.maxDate.getMinutes()).toBe(0);
    });

    it('should return min and max dates for tuesday', () => {
      const result = getMinMaxDate(2, new Date(), [room]);
      expect(result.minDate.getHours()).toBe(0);
      expect(result.minDate.getMinutes()).toBe(0);
      expect(result.maxDate.getHours()).toBe(23);
      expect(result.maxDate.getMinutes()).toBe(59);
    });

    it('should return min and max dates for wednesday', () => {
      const result = getMinMaxDate(3, new Date(), [room]);
      expect(result.minDate.getHours()).toBe(12);
      expect(result.minDate.getMinutes()).toBe(0);
      expect(result.maxDate.getHours()).toBe(21);
      expect(result.maxDate.getMinutes()).toBe(0);
    });

    it('should return min and max dates for thursday', () => {
      const result = getMinMaxDate(4, new Date(), [room]);
      expect(result.minDate.getHours()).toBe(11);
      expect(result.minDate.getMinutes()).toBe(0);
      expect(result.maxDate.getHours()).toBe(20);
      expect(result.maxDate.getMinutes()).toBe(0);
    });

    it('should return min and max dates for friday', () => {
      const result = getMinMaxDate(5, new Date(), [room]);
      expect(result.minDate.getHours()).toBe(0);
      expect(result.minDate.getMinutes()).toBe(0);
      expect(result.maxDate.getHours()).toBe(23);
      expect(result.maxDate.getMinutes()).toBe(59);
    });

    it('should return min and max dates for saturday', () => {
      const result = getMinMaxDate(6, new Date(), [room]);
      expect(result.minDate.getHours()).toBe(12);
      expect(result.minDate.getMinutes()).toBe(0);
      expect(result.maxDate.getHours()).toBe(18);
      expect(result.maxDate.getMinutes()).toBe(0);
    });

    it('should return min and max for multiples rooms with different day', () => {
      const date = new Date();
      date.setDate(date.getDate() + ((10 - date.getDay()) % 7 || 7)); // next wednesday

      const anotherRoom: IRoomAll = {
        ...room,
        availabilities: [
          { day: 'WEDNESDAY', start: '09:30', end: '18:00' },
        ],
      };

      const result = getMinMaxDate(3, date, [room, anotherRoom]);
      expect(result.minDate.getHours()).toBe(11);
      expect(result.minDate.getMinutes()).toBe(30);
      expect(result.maxDate.getHours()).toBe(21);
      expect(result.maxDate.getMinutes()).toBe(0);
    });
  });

  describe('filterDateRoom', () => {
    it('should return true for future date with room availability on that day', () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 7); // Next week
      futureDate.setHours(0, 0, 0, 0);

      // Set to a Monday (day 1)
      const dayOfWeek = futureDate.getDay();
      const daysUntilMonday = (1 - dayOfWeek + 7) % 7;
      futureDate.setDate(futureDate.getDate() + daysUntilMonday);

      const roomWithMonday: IRoom = {
        id: 'room-1',
        timeZone: 'UTC',
        availabilities: [{ day: 'MONDAY', start: '09:00', end: '18:00' }],
      };

      const result = filterDateRoom(futureDate, roomWithMonday);
      expect(result).toBe(true);
    });

    it('should return false for future date without room availability on that day', () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 7); // Next week
      futureDate.setHours(0, 0, 0, 0);

      // Set to a Tuesday (day 2)
      const dayOfWeek = futureDate.getDay();
      const daysUntilTuesday = (2 - dayOfWeek + 7) % 7;
      futureDate.setDate(futureDate.getDate() + daysUntilTuesday);

      const roomWithoutTuesday: IRoom = {
        id: 'room-1',
        timeZone: 'UTC',
        availabilities: [
          { day: 'SUNDAY', start: '09:00', end: '18:00' },
          { day: 'WEDNESDAY', start: '09:00', end: '18:00' },
        ],
      };

      const result = filterDateRoom(futureDate, roomWithoutTuesday);
      expect(result).toBe(false);
    });

    it('should return false for past date', () => {
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 7); // Last week

      const roomWithAllDays: IRoom = {
        id: 'room-1',
        timeZone: 'UTC',
        availabilities: [
          { day: 'MONDAY', start: '09:00', end: '18:00' },
          { day: 'TUESDAY', start: '09:00', end: '18:00' },
          { day: 'WEDNESDAY', start: '09:00', end: '18:00' },
          { day: 'THURSDAY', start: '09:00', end: '18:00' },
          { day: 'FRIDAY', start: '09:00', end: '18:00' },
          { day: 'SATURDAY', start: '09:00', end: '18:00' },
          { day: 'SUNDAY', start: '09:00', end: '18:00' },
        ],
      };

      const result = filterDateRoom(pastDate, roomWithAllDays);
      expect(result).toBe(false);
    });

    it('should return true for null date when room has availability', () => {
      const result = filterDateRoom(null, room);
      expect(result).toBe(true);
    });

    it('should return true for future date without room parameter', () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 7);

      const result = filterDateRoom(futureDate);
      expect(result).toBe(true);
    });

    it('should return false for past date without room parameter', () => {
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 7);

      const result = filterDateRoom(pastDate);
      expect(result).toBe(false);
    });
  });

  describe('isSameTimeZone (no mocks)', () => {
    it('returns true when comparing to current timezone', () => {
      const result = isSameTimeZone();
      expect(result).toBeTrue();
    });

    it('returns false for a clearly different timezone', () => {
      const result = isSameTimeZone('Asia/Tokyo');
      expect(result).toBeFalse();
    });

    it('returns true for another tz with the same GMT offset at this date', () => {
      const result = isSameTimeZone('Europe/Paris');
      expect(result).toBeTrue();
    });
  });

  describe('getDurationOrUndefined', () => {
    it('should return Duration for valid time string', () => {
      const result = getDurationOrUndefined('PT1H30M');
      expect(result).toBeInstanceOf(Duration);
      expect(result?.hour).toBe(1);
      expect(result?.minute).toBe(30);
    });

    it('should return undefined for missing time string', () => {
      const result = getDurationOrUndefined();
      expect(result).toBeUndefined();
    });
  });

  describe('diffTime', () => {
    it('calculates difference until midnight (default maxHour=24)', () => {
      const time = new Date('2025-01-01T22:00');
      const result = diffTime(time, getCurrentTimeZone());
      expect(result).toEqual(new Duration(2, 0));
    });

    it('calculates difference until custom maxHour', () => {
      const time = new Date('2025-01-01T08:30');
      const result = diffTime(time, getCurrentTimeZone(), 12, 0);
      expect(result).toEqual(new Duration(3, 30));
    });

    it('returns 0 hours/minutes when time matches maxHour', () => {
      const time = new Date('2025-01-01T12:00');
      const result = diffTime(time, getCurrentTimeZone(), 12, 0);
      expect(result).toEqual(new Duration(0, 0));
    });

    it('handles minutes offset (diffMin)', () => {
      const time = new Date('2025-01-01T09:45');
      const result = diffTime(time, getCurrentTimeZone(), 10, 30);
      expect(result).toEqual(new Duration(0, 45));
    });
  });

  describe('newDateTimestamp with Europe/Amsterdam', () => {
    it('converts from string date in UTC to Amsterdam time', () => {
      const result = newDateTimestamp('2025-01-01T13:00:00+01:00', 'Europe/Amsterdam');
      expect(result).toEqual(jasmine.any(Date));
      expect(result.toISOString()).toBe('2025-01-01T12:00:00.000Z');
    });

    it('converts from Date object to Amsterdam time', () => {
      const input = new Date('2025-01-01T13:00:00+01:00');
      const result = newDateTimestamp(input, 'Europe/Amsterdam');
      expect(result.toISOString()).toBe('2025-01-01T12:00:00.000Z');
    });

    it('converts from UNIX timestamp (seconds) to Amsterdam time', () => {
      const unixSeconds = Math.floor(new Date('2025-01-01T13:00:00+01:00').getTime() / 1000);
      const result = newDateTimestamp(unixSeconds, 'Europe/Amsterdam');
      expect(result.toISOString()).toBe('2025-01-01T12:00:00.000Z');
    });

    it('defaults to now in Amsterdam when no date is given', () => {
      const result = newDateTimestamp();
      expect(result).toEqual(jasmine.any(Date));
    });
  });

});
