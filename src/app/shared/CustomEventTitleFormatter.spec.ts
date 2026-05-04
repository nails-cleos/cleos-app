import { TranslateService } from '@ngx-translate/core';
import { CustomEventTitleFormatter } from './CustomEventTitleFormatter';

describe('CustomEventTitleFormatter', () => {
  let formatter: CustomEventTitleFormatter;
  let translateService: jasmine.SpyObj<TranslateService>;

  beforeEach(() => {
    translateService = jasmine.createSpyObj('TranslateService', [
      'instant',
      'getCurrentLang',
    ]);

    translateService.getCurrentLang.and.returnValue('en-GB');
    translateService.instant.and.callFake((key: string) => key);

    formatter = new CustomEventTitleFormatter(translateService);
  });

  it('should return ALL_DAY label in month view when no end time', () => {
    const event = {
      title: 'Test event',
      start: new Date(),
      meta: { time: true },
    } as any;

    const result = formatter.month(event);

    expect(result).toContain('COMMON.ALL_DAY.CHECK');
  });

  it('should return label in month view when no end time', () => {
    const startDate = new Date('2024-01-01T13:30:00');
    const endDate = new Date('2024-01-01T15:00:00');
    const event = {
      title: 'Test event',
      start: startDate,
      meta: { time: true },
      end: endDate,
    } as any;

    const result = formatter.month(event);

    expect(result).toContain('<b>13:30 - 15:00</b> Test event');
  });

  it('should return event title in month view when no meta time', () => {
    const event = {
      title: 'Test event',
      start: new Date(),
      meta: {},
    } as any;

    const result = formatter.month(event);

    expect(result).toBe('Test event');
  });

  it('should add icon in week view when state exists', () => {
    const event = {
      title: 'Test',
      start: new Date(),
      meta: {
        state: 'CONFIRMED',
        time: true,
      },
    } as any;

    const result = formatter.week(event);

    expect(result).toContain('material-icons');
    expect(result).toContain('Test');
  });

  it('should return plain title in day view', () => {
    const event = {
      title: 'Day event',
      start: new Date(),
      meta: { time: false },
    } as any;

    const result = formatter.day(event);

    expect(result).toContain('Day event');
  });

  it('should format event with timezone info when isSameTimeZone is false', () => {
    const event = {
      title: 'My event',
      start: new Date('2026-04-29T10:00:00Z'),
      end: new Date('2026-04-29T11:00:00Z'),
      meta: {
        time: true,
        timeZone: 'Asia/Tokyo',
      },
    } as any;

    const result = formatter.day(event);

    expect(result).toContain('(19:00 - 20:00 GMT+09:00) <b>12:00 - 13:00</b>&nbsp; My event');
  });
});
