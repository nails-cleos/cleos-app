import { AbstractControl, FormArray, UntypedFormControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { Observable, of } from 'rxjs';

export const fieldChange = (formControl: UntypedFormControl, value: any | undefined): any | undefined =>
  formControl && formControl.dirty && value !== formControl.value ? formControl.value : null;

export const valueChange = (newValue: any, oldValue: any | undefined): any | undefined => oldValue !== newValue ? newValue : null;

export const requireMatch = (control: AbstractControl): any => {
  const selection: any = control.value;
  if (selection && typeof selection === 'string') {
    return { requireMatch: true };
  }
  return null;
};

export const requireMatchAsync = (control: AbstractControl): Observable<ValidationErrors | null> => of(requireMatch(control));

export function noDuplicateDatesValidator(key: string = 'date'): ValidatorFn {
  return (formArray: AbstractControl): { [key: string]: any } | null => {
    if (!(formArray instanceof FormArray)) {
      throw new Error('Validator must be applied to a FormArray');
    }

    const dateSet = new Set<string>();
    let duplicateIndex: number | null = null;

    for (let i = 0; i < formArray.controls.length; i++) {
      const control = formArray.controls[i];
      const keyValue = control.get(key)?.value;

      if (keyValue) {
        const date = new Date(keyValue);
        let keyString;
        if (isNaN(date.getTime())) {
          keyString = keyValue;
        } else {
          keyString = date.toISOString().split('T')[0];
        }

        if (dateSet.has(keyString)) {
          duplicateIndex = i;
          break;
        }
        dateSet.add(keyString);
      }
    }

    formArray.controls.forEach(control => control.get(key)?.setErrors(null));

    if (duplicateIndex !== null) {
      const errorKey = `duplicate${ key.charAt(0).toUpperCase() + key.slice(1) }`;
      const duplicateControl = formArray.controls[duplicateIndex];
      duplicateControl.get(key)?.setErrors({ [errorKey]: true });
      return { [errorKey]: duplicateIndex };
    }

    return null; // No errors
  };
}
