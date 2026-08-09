import { FormControl } from '@angular/forms';
import { fieldChange } from '../util/validators';

export type ColorForm = {
  name: FormControl<string>;
  description: FormControl<string | undefined>;
};

export interface IColor {
  id?: string;
  name?: string;
  description?: string;
  deleted?: boolean;
}

export interface IColorAll {
  id: string;
  name: string;
  description?: string;
  deleted?: boolean;
}

export class Color {
  static fromForm(colorForm: ColorForm, currentColor?: IColorAll): IColor {
    return {
      name: fieldChange(colorForm.name, currentColor?.name),
      description: fieldChange(
        colorForm.description,
        currentColor?.description,
      ),
    };
  }
}
