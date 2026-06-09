import { FormControl } from '@angular/forms';
import { IUser, IUserAll } from './user';
import { FrequencyEnum } from '../util/helper';
import { API_LOCALE, createNewDate, getTimeNumber } from '../util/dates';
import { fieldChange, valueChange } from '../util/validators';

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

export class Unavailable implements IUnavailable {
  professionalId?: string;
  description?: string;
  repeat?: FrequencyEnum;
  start?: string;
  endString?: string;
  time?: string;
  allDay?: boolean;
  timeZone?: string;

  private constructor() {
  }

  static fromForm(
    unavailableForm: UnavailableForm,
    currentUnavailable: IUnavailableAll | undefined,
    timeZone: string,
  ): IUnavailable {
    const unavailable = new Unavailable();
    const time = getTimeNumber(unavailableForm.startTime.value);
    const date = unavailableForm.allDay.value
      ? createNewDate(unavailableForm.startDate.value!)
      : createNewDate(unavailableForm.startDate.value!, time?.hour, time?.minute);

    unavailable.professionalId = valueChange(unavailableForm.professional.value, currentUnavailable?.professional)?.id;
    unavailable.description = valueChange(unavailableForm.description.value, currentUnavailable?.description);
    unavailable.time = fieldChange(unavailableForm.duration, currentUnavailable?.duration);
    unavailable.repeat = fieldChange(unavailableForm.repeat, currentUnavailable?.repeat);
    unavailable.start = date.toLocaleString(API_LOCALE);
    unavailable.timeZone = timeZone;
    unavailable.allDay = unavailableForm.allDay.value;
    if (unavailableForm.endDate.value) {
      unavailable.endString = createNewDate(unavailableForm.endDate.value).toLocaleString(API_LOCALE);
    }

    return unavailable;
  }

  static fromBlockAgendaForm(
    blockAgendaForm: BlockAgendaForm,
    currentUnavailable: IUnavailableAll | undefined,
    timeZone: string,
  ): IUnavailable {
    const unavailable = new Unavailable();
    const time = getTimeNumber(blockAgendaForm.startTime.value);
    const date = createNewDate(blockAgendaForm.startDate.value!, time?.hour, time?.minute);

    unavailable.professionalId = valueChange(blockAgendaForm.professional.value, currentUnavailable?.professional)?.id;
    unavailable.start = date.toLocaleString(API_LOCALE);
    unavailable.timeZone = timeZone;
    unavailable.time = fieldChange(blockAgendaForm.duration, currentUnavailable?.duration);

    return unavailable;
  }
}
