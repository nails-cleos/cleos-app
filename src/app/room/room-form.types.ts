import { FormControl, FormGroup } from '@angular/forms';
import { IUserAll } from '../user/user';
import { ICurrencyAll } from '../currency/currency';
import { IOfficeAll } from '../office/office';
import { GoogleMapForm } from '../shared/google-map/google-map.component';
import { TimeZone } from 'timezones-list';

export type RoomForm = {
  professional: FormControl<IUserAll | undefined>;
  currency: FormControl<ICurrencyAll | undefined>;
  office: FormControl<IOfficeAll | undefined>;
  timeZone: FormControl<TimeZone | undefined>;
  closeDate: FormControl<Date | undefined>;
  addressForm: FormGroup<GoogleMapForm>;
};

export type AvailabilityForm = {
  start: FormControl<string>;
  end: FormControl<string>;
  startLunch: FormControl<string | undefined>;
  endLunch: FormControl<string | undefined>;
};
