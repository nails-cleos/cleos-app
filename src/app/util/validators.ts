import { AbstractControl, FormControl } from '@angular/forms';

export function FieldChange(formControl: FormControl, value: any | undefined): any | undefined {
  return formControl && formControl.dirty && value !== formControl.value ? formControl.value : null;
}

export function ValueChange(newValue: any, oldValue: any | undefined): any | undefined {
  return oldValue !== newValue ? newValue : null;
}

export function RequireMatch(control: AbstractControl): any {
  const selection: any = control.value;
  if (selection && typeof selection === 'string') {
    return {requireMatch: true};
  }
  return null;
}
