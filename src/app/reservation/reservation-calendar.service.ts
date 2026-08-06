import { inject, Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { CalendarEvent } from 'angular-calendar';
import { IAdditionalAll } from '../additional/additional';
import { IUnavailableAll } from '../unavailable/unavailable';
import { IUserAll } from '../user/user';
import { IRoomAll, IService } from '../room/room';
import { Day, IReservationAll } from './reservation';
import {
  createNewDate,
  dateToTimestamp,
  getAvailability,
  getDurationOrUndefined,
  getStartEndDay,
  getTime,
  newDateTimestamp,
  reservationDuration,
} from '../util/dates';
import { createBullet, IDataEvent, Meta, newEvent } from '../util/event';
import { findStateColor } from '../util/theme';

type RoomSchedule = {
  day: Day;
  weekendDays: number[];
  minTime?: string;
  maxTime?: string;
  availability: ReturnType<typeof getAvailability>;
};

type SelectionEventParams = {
  treatment: IService;
  customer: IUserAll;
  additional: IAdditionalAll[];
  professional?: IUserAll;
  start: Date;
  end: Date;
  state: string;
  timeZone?: string;
  id: string;
  isDarkMode: boolean;
};

@Injectable({
  providedIn: 'root',
})
export class ReservationCalendarService {
  private readonly translateService = inject(TranslateService);

  getRoomSchedule(room: IRoomAll): RoomSchedule {
    const availability = getAvailability(room);
    const exclude = availability?.exclude ?? [];
    const hasAvailability = !!(
      availability?.monday ||
      availability?.tuesday ||
      availability?.wednesday ||
      availability?.thursday ||
      availability?.friday ||
      availability?.saturday ||
      availability?.sunday
    );
    const { min, max } = hasAvailability
      ? getStartEndDay(
        availability.monday,
        availability.tuesday,
        availability.wednesday,
        availability.thursday,
        availability.friday,
        availability.saturday,
        availability.sunday,
        room.timeZone,
      )
      : { min: undefined, max: undefined };

    return {
      availability,
      weekendDays: exclude,
      day: new Day(min, max, undefined, exclude, 1),
      minTime: min ? getTime(min) : undefined,
      maxTime: max ? getTime(max) : undefined,
    };
  }

  addRoomAvailabilityEvents(dataEvent: IDataEvent, room: IRoomAll, isDarkMode: boolean): RoomSchedule {
    const schedule = this.getRoomSchedule(room);
    const { monday, tuesday, wednesday, thursday, friday, saturday, sunday } = schedule.availability;
    const unavailable = this.translateService.instant('RESERVATION.EVENT.MESSAGE.UNAVAILABLE');
    const lunch = this.translateService.instant('RESERVATION.EVENT.MESSAGE.LUNCH');
    const notWorking = this.translateService.instant('RESERVATION.EVENT.MESSAGE.OUT_OF_WORK');

    dataEvent.recurringEvent?.addNotAvailableRecurring(
      dataEvent,
      unavailable,
      lunch,
      notWorking,
      sunday,
      saturday,
      friday,
      thursday,
      wednesday,
      tuesday,
      monday,
      isDarkMode,
      room.timeZone,
    );

    return schedule;
  }

  buildReservationEvents(
    reservations: IReservationAll[],
    reservationId: string | undefined,
    isDarkMode: boolean,
  ): CalendarEvent[] {
    return reservations.map(it => {
      if (it.id === reservationId || !it.treatment.duration || it.timestamp < dateToTimestamp()) {
        return undefined;
      }

      const start = newDateTimestamp(it.timestamp);
      const duration = reservationDuration(it);
      const end = createNewDate(start, start.getHours() + duration.hour, start.getMinutes() + duration.minute);
      let treatments = createBullet(it.treatment.name);
      treatments += it.additional?.map(additional => createBullet(additional.name));

      const detail = this.translateService.instant('RESERVATION.EVENT.DETAIL', {
        customerName: it.customer.displayName,
        professionalName: it.professional.displayName,
        treatments,
      });

      const color = findStateColor(it.state, isDarkMode);
      const meta = new Meta(true, it.room.timeZone, undefined, undefined, it.professional.id);
      meta.isReservation = true;
      meta.treatmentName = it.treatment.name;
      meta.additionalNames = it.additional?.map(additional => additional.name) || [];

      return newEvent(detail, color, start, isDarkMode, end, it.id, meta);
    }).filter((item): item is CalendarEvent => item !== undefined);
  }

  addUnavailableEvents(
    dataEvent: IDataEvent,
    unavailableList: IUnavailableAll[],
    timeZone: string | undefined,
    isDarkMode: boolean,
    validateUnavailable: (start: Date, recurring: any, dataEvent: IDataEvent) => void,
  ): void {
    unavailableList.forEach(it => {
      if (!it.duration && !it.allDay) {
        return;
      }

      const startDate = newDateTimestamp(it.timestamp, timeZone);
      const start = it.allDay ? createNewDate(startDate) : startDate;
      const title = this.translateService.instant('RESERVATION.EVENT.UNAVAILABLE', {
        description: it.description ? it.description : '',
        professionalName: it.professional.displayName,
      });

      let path = 'unavailable/';
      if (it.type === 'BLOCK_AGENDA') {
        path += 'block-agenda/';
      }

      dataEvent.recurringEvent?.addFrequency(
        it.repeat,
        start,
        it.id,
        title,
        'UNAVAILABLE',
        path,
        (date, recurring) => validateUnavailable(date, recurring, dataEvent),
        getDurationOrUndefined(it.duration),
        it.professional.id,
        it.allDay,
      );
    });
  }

  createUnavailableEvent(
    recurring: any,
    start: Date,
    end: Date,
    timeZone: string | undefined,
    isDarkMode: boolean,
  ): CalendarEvent {
    const color = findStateColor('DEFAULT', isDarkMode);
    const meta = new Meta(!recurring.allDay, timeZone, undefined, undefined, recurring.professionalId);
    return newEvent(recurring.title, color, start, isDarkMode, end, recurring.path, meta)!;
  }

  createSelectionEvent(params: SelectionEventParams): CalendarEvent {
    const treatments = [
      createBullet(params.treatment.name),
      ...params.additional.map(additional => createBullet(additional.name)),
    ].join('');

    const detail = this.translateService.instant('RESERVATION.EVENT.DETAIL', {
      customerName: params.customer.displayName,
      professionalName: params.professional?.displayName,
      treatments,
    });

    const meta = new Meta(true, params.timeZone, undefined, undefined, params.professional?.id);
    meta.isReservation = true;
    meta.treatmentName = params.treatment.name;
    meta.additionalNames = params.additional.map(additional => additional.name);

    return newEvent(
      detail,
      findStateColor(params.state, params.isDarkMode),
      params.start,
      params.isDarkMode,
      params.end,
      params.id,
      meta,
      true,
    )!;
  }
}
