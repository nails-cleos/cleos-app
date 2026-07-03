import { FormControl, FormGroup } from '@angular/forms';
import { Role } from '../interfaces/token';
import { GoogleMapForm } from '../shared/google-map/google-map.component';

export type UserForm = {
  role: FormControl<Role | undefined>;
  displayName: FormControl<string>;
  email: FormControl<string>;
  lang: FormControl<string | undefined>;
  phone: FormControl<string | undefined>;
  dob: FormControl<Date | undefined>;
  darkColor: FormControl<string>;
  lightColor: FormControl<string>;
  addressForm: FormGroup<GoogleMapForm>;
};

export type ProfileForm = {
  lang: FormControl<string | undefined>;
  displayName: FormControl<string>;
  phone: FormControl<string>;
  dob: FormControl<Date | undefined>;
  darkColor: FormControl<string>;
  lightColor: FormControl<string>;
  addressForm: FormGroup<GoogleMapForm>;
};
