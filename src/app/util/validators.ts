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

export function noDuplicateDatesValidator(): ValidatorFn {
  return (formArray: AbstractControl): { [key: string]: any } | null => {
    if (!(formArray instanceof FormArray)) {
      throw new Error('Validator must be applied to a FormArray');
    }

    const dateSet = new Set<string>();
    let duplicateIndex: number | null = null;

    for (let i = 0; i < formArray.controls.length; i++) {
      const control = formArray.controls[i];
      const dateValue = control.get('date')?.value;

      if (dateValue) {
        const dateStr = new Date(dateValue).toISOString().split('T')[0];

        if (dateSet.has(dateStr)) {
          duplicateIndex = i;
          break;
        }
        dateSet.add(dateStr);
      }
    }

    // Clear previous errors
    formArray.controls.forEach(control => control.get('date')?.setErrors(null));

    if (duplicateIndex !== null) {
      // Set the 'duplicateDate' error on the specific control
      const duplicateControl = formArray.controls[duplicateIndex];
      duplicateControl.get('date')?.setErrors({ 'duplicateDate': true });
      return { 'duplicateDates': duplicateIndex }; // Optionally return this to show error at FormArray level
    }

    return null; // No errors
  };
}
