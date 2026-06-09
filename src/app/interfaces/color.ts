import { FormControl } from '@angular/forms';
import { fieldChange, valueChange } from '../util/validators';

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

export class Color implements IColor {
  name?: string;
  description?: string;

  private constructor(colorForm?: ColorForm) {
    if (!colorForm) {
      return;
    }

    this.name = colorForm.name.value;
    this.description = colorForm.description.value;
  }

  static fromForm(colorForm: ColorForm, currentColor?: IColorAll): IColor {
    const color = new Color(colorForm);
    color.name = fieldChange(colorForm.name, currentColor?.name);
    color.description = valueChange(colorForm.description.value, currentColor?.description);

    return color;
  }
}
