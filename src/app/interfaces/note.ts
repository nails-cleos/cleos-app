import { FormControl } from '@angular/forms';
import { IUser, IUserAll } from './user';
import { FrequencyEnum } from '../util/helper';
import { backendFormatDate } from '../util/dates';
import { fieldChange, valueChange } from '../util/validators';

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

export class Note implements INote {
  description?: string;
  professionalId?: string;
  repeat?: FrequencyEnum;
  date?: string;

  private constructor(noteForm: NoteForm) {
    this.description = noteForm.description.value;
    this.professionalId = noteForm.professional.value?.id;
    this.repeat = noteForm.repeat.value;
    this.date = backendFormatDate(noteForm.date.value);
  }

  static fromForm(noteForm: NoteForm, currentNote?: INoteAll): INote {
    const note = new Note(noteForm);
    note.description = fieldChange(noteForm.description, currentNote?.description);
    note.professionalId = valueChange(noteForm.professional.value, currentNote?.professional)?.id;
    note.repeat = fieldChange(noteForm.repeat, currentNote?.repeat);
    note.date = backendFormatDate(noteForm.date.value);

    return note;
  }
}
