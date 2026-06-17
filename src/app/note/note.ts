import { FormControl } from '@angular/forms';
import { IUser, IUserAll } from '../user/user';
import { FrequencyEnum } from '../util/helper';
import { backendFormatDate } from '../util/dates';
import { fieldChange, valueChange } from '../util/validators';

export type NoteNavigationParams = {
  professional?: IUserAll;
  date?: Date;
};

export type NoteForm = {
  description: FormControl<string>;
  professional: FormControl<IUserAll | undefined>;
  date: FormControl<Date | undefined>;
  repeat: FormControl<FrequencyEnum | undefined>;
};

export interface INote {
  id?: string;
  description?: string;
  professionalId?: string;
  professional?: IUser;
  repeat?: FrequencyEnum;
  date?: string;
  completed?: boolean;
  deleted?: boolean;
}

export interface INoteAll {
  id: string;
  description: string;
  professional: IUserAll;
  repeat: FrequencyEnum;
  date: string;
  completed: boolean;
  deleted: boolean;
}

export class Note {
  static fromForm(
    noteForm: NoteForm,
    currentNote?: INoteAll,
  ): INote {
    return {
      description: fieldChange(noteForm.description, currentNote?.description),
      professionalId: valueChange(noteForm.professional.value, currentNote?.professional)?.id,
      repeat: fieldChange(noteForm.repeat, currentNote?.repeat),
      date: backendFormatDate(noteForm.date.value),
    };
  }
}
