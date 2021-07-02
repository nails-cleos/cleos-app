import { AbstractControl, FormControl } from '@angular/forms';

export const fieldChange = (formControl: FormControl, value: any | undefined): any | undefined =>
  formControl && formControl.dirty && value !== formControl.value ? formControl.value : null;

export const valueChange = (newValue: any, oldValue: any | undefined): any | undefined => oldValue !== newValue ? newValue : null;

export const requireMatch = (control: AbstractControl): any => {
  const selection: any = control.value;
  if (selection && typeof selection === 'string') {
    return {requireMatch: true};
  }
  return null;
};

export const isEmpty = (obj: any): boolean => !Object.values(obj).some(element => element !== null);
