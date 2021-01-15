import { AbstractControl, FormControl } from '@angular/forms';

export function MustMatch(controlName: string, matchingControlName: string): (controls: AbstractControl) => any {
  return (controls: AbstractControl) => {
    const from = controls.get(controlName);
    const matchingControl = controls.get(matchingControlName);

    if (matchingControl?.errors && !matchingControl.errors.mustMatch) {
      // return if another validator has already found an error on the matchingControl
      return;
    }

    // set error on matchingControl if validation fails
    if (from?.value !== matchingControl?.value) {
      return matchingControl?.setErrors({mustMatch: true});
    } else {
      return matchingControl?.setErrors(null);
    }
  };
}

export function FieldChange(formControl: FormControl, value: string | undefined): string | undefined {
  return formControl.dirty && value !== formControl.value ? formControl.value : null;
}
