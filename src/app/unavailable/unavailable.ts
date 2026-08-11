import { FormControl } from '@angular/forms';
import { IUser, IUserAll } from '../user/user';
import { FrequencyEnum } from '../util/helper';
import { createNewDate, DEFAULT_LOCALE, getTimeNumber } from '../util/dates';
import { fieldChange, valueChange } from '../util/validators';
import { IRoomAll } from '../room/room';

export type UnavailableNavigationParams = {
  date?: Date;
  room?: IRoomAll;
  startTime?: string;
  showDuration: boolean;
};

export type UnavailableForm = {
  professional: FormControl<IUserAll | undefined>;
  description: FormControl<string | undefined>;
  startDate: FormControl<Date | undefined>;
  startTime: FormControl<string | undefined>;
  duration: FormControl<string | undefined>;
  repeat: FormControl<FrequencyEnum | undefined>;
  allDay: FormControl<boolean>;
  endDate: FormControl<Date | undefined>;
};

export type BlockAgendaForm = {
  professional: FormControl<IUserAll | undefined>;
  startDate: FormControl<Date | undefined>;
  startTime: FormControl<string | undefined>;
  duration: FormControl<string | undefined>;
};

export interface IUnavailable {
  id?: string;
  description?: string;
  professionalId?: string;
  professional?: IUser;
  repeat?: FrequencyEnum;
  start?: string;
  end?: string;
  endString?: string;
  duration?: string;
  time?: string;
  startDate?: Date;
  endDate?: Date;
  startTime?: string | Date;
  allDay?: boolean;
  timeZone?: string;
  timestamp?: number;
  type?: string;
}

export interface IUnavailableAll {
  id: string;
  description?: string;
  start: string;
  timestamp: number;
  end: string;
  endString?: string;
  duration: string;
  professional: IUserAll;
  repeat: FrequencyEnum;
  allDay: boolean;
  type?: string;
  startDate?: Date;
  timeZone?: string;
}

export class Unavailable {
  static fromForm(
    unavailableForm: UnavailableForm,
    timeZone: string,
    currentUnavailable?: IUnavailableAll,
  ): IUnavailable {
    const start = this.createStartDate(
      unavailableForm.startDate.value!,
      unavailableForm.startTime.value,
      unavailableForm.allDay.value,
    );

    return {
      professionalId: valueChange(
        unavailableForm.professional.value,
        currentUnavailable?.professional,
      )?.id,
      description: valueChange(
        unavailableForm.description.value,
        currentUnavailable?.description,
      ),
      time: fieldChange(unavailableForm.duration, currentUnavailable?.duration),
      repeat: fieldChange(unavailableForm.repeat, currentUnavailable?.repeat),
      start: start.toLocaleString(DEFAULT_LOCALE),
      timeZone,
      allDay: unavailableForm.allDay.value,
      ...(unavailableForm.endDate.value && {
        endString: createNewDate(unavailableForm.endDate.value).toLocaleString(
          DEFAULT_LOCALE,
        ),
      }),
    };
  }

  static fromBlockAgendaForm(
    blockAgendaForm: BlockAgendaForm,
    timeZone: string,
    currentUnavailable?: IUnavailableAll,
  ): IUnavailable {
    const start = this.createStartDate(
      blockAgendaForm.startDate.value!,
      blockAgendaForm.startTime.value,
    );

    return {
      professionalId: valueChange(
        blockAgendaForm.professional.value,
        currentUnavailable?.professional,
      )?.id,
      start: start.toLocaleString(DEFAULT_LOCALE),
      timeZone,
      time: fieldChange(blockAgendaForm.duration, currentUnavailable?.duration),
    };
  }

  private static createStartDate(
    startDate: Date,
    startTime?: string,
    allDay: boolean = false,
  ): Date {
    if (allDay) {
      return createNewDate(startDate);
    }

    const time = getTimeNumber(startTime);

    return createNewDate(startDate, time?.hour, time?.minute);
  }
}
