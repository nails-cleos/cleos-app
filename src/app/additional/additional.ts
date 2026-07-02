import { FormControl } from '@angular/forms';
import { IService } from '../room/room';
import { ITreatmentGroupAll } from '../treatment/treatment';
import { areEquals } from '../util/helper';
import { fieldChange, valueChange } from '../util/validators';

export type AdditionalForm = {
  name: FormControl<string>;
  description: FormControl<string | undefined>;
  duration: FormControl<string>;
  group: FormControl<ITreatmentGroupAll | undefined>;
};

export interface IAdditional {
  id?: string;
  name?: string;
  description?: string;
  deleted?: boolean;
  price?: number;
  duration?: string;
  durationDate?: Date;
  groupIds?: string[];
}

export interface IAdditionalAll extends IService {
  groups?: ITreatmentGroupAll[];
}

export class Additional {
  static fromForm(
    additionalForm: AdditionalForm,
    currentAdditional?: IAdditionalAll,
    newGroupIds: string[] = [],
    currentGroupIds: string[] = [],
  ): IAdditional {
    return {
      name: fieldChange(additionalForm.name, currentAdditional?.name),
      description: valueChange(additionalForm.description.value, currentAdditional?.description),
      duration: fieldChange(additionalForm.duration, currentAdditional?.duration),
      ...(!areEquals(newGroupIds, currentGroupIds) && {
        groupIds: newGroupIds,
      }),
    };
  }
}
