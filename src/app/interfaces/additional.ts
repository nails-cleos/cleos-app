import { FormControl } from '@angular/forms';
import { IService } from './room';
import { ITreatmentGroupAll } from './treatment';
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

export class Additional implements IAdditional {
  name?: string;
  description?: string;
  duration?: string;
  groupIds?: string[];

  private constructor(additionalForm?: AdditionalForm) {
    if (!additionalForm) {
      return;
    }

    this.name = additionalForm.name.value;
    this.description = additionalForm.description.value;
    this.duration = additionalForm.duration.value;
  }

  static fromForm(
    additionalForm: AdditionalForm,
    currentAdditional?: IAdditionalAll,
    newGroupIds: string[] = [],
    currentGroupIds: string[] = [],
  ): IAdditional {
    const additional = new Additional(additionalForm);
    additional.name = fieldChange(additionalForm.name, currentAdditional?.name);
    additional.description = valueChange(additionalForm.description.value, currentAdditional?.description);
    additional.duration = fieldChange(additionalForm.duration, currentAdditional?.duration);

    if (!areEquals(newGroupIds, currentGroupIds)) {
      additional.groupIds = newGroupIds;
    }

    return additional;
  }
}
